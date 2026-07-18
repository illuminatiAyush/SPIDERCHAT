import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    const { id: friendId } = await params;
    const userId = decoded.id;

    // Find the conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: friendId } } }
        ]
      }
    });

    if (!conversation) {
      return NextResponse.json({ messages: [] });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const query = searchParams.get("search");

    const whereClause: any = { conversationId: conversation.id };
    if (query) {
      whereClause.content = { contains: query, mode: "insensitive" };
    }

    const messages = await prisma.directMessage.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    });

    // Format for frontend
    const formatted = messages.map(m => ({
      _id: m.id,
      conversationId: friendId,
      senderId: {
        _id: m.sender.id,
        username: m.sender.username,
        displayName: m.sender.displayName,
        avatar: m.sender.avatar
      },
      content: m.content,
      type: m.type,
      status: m.status,
      replyTo: m.replyTo,
      reactions: m.reactions || [],
      createdAt: m.createdAt,
      editedAt: m.editedAt
    }));

    return NextResponse.json({ messages: formatted.reverse() });
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

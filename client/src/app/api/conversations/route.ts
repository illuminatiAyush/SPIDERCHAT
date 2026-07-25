import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = decoded.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { id: userId }
        }
      },
      include: {
        participants: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      },
      orderBy: {
        lastMessageAt: 'desc'
      }
    });

    const mappedConversations = conversations.map((convo) => {
      // The frontend expects _id as conversation ID
      return {
        _id: convo.id,
        participants: convo.participants.map(p => ({
          _id: p.id,
          username: p.username,
          displayName: p.displayName,
          avatar: p.avatar,
          isOnline: false // will be overwritten by frontend socket logic
        })),
        lastMessage: convo.lastMessage || null,
        lastMessageAt: convo.lastMessageAt || null,
        unreadCounts: convo.unreadCounts || {} 
      };
    });

    return NextResponse.json({ conversations: mappedConversations });
  } catch (error) {
    console.error("Fetch conversations error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = decoded.id;

    const { partnerId } = await req.json();
    if (!partnerId) return NextResponse.json({ error: "partnerId required" }, { status: 400 });

    // Check if conversation already exists between these exactly 2 participants
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: partnerId } } }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: userId }, { id: partnerId }]
          },
          unreadCounts: { [userId]: 0, [partnerId]: 0 }
        }
      });
    }

    return NextResponse.json({ conversationId: conversation.id });
  } catch (error) {
    console.error("Create conversation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

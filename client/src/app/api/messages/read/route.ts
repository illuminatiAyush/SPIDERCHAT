import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const userId = decoded.id;
    const body = await req.json();
    const { conversationId } = body; 

    if (!conversationId) return NextResponse.json({ error: "conversationId is required" }, { status: 400 });

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (conversation) {
      let unreadCounts = (conversation.unreadCounts as Record<string, number>) || {};
      if (unreadCounts[userId] !== 0) {
        unreadCounts[userId] = 0;
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { unreadCounts }
        });
      }
    }

    const { count } = await prisma.directMessage.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        status: { not: 'seen' }
      },
      data: {
        status: 'seen'
      }
    });

    return NextResponse.json({ success: true, count });
  } catch (error) {
    console.error("Mark read error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

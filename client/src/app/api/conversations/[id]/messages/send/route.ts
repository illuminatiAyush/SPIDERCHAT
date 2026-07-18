import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/jwt";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    
    // Note: The original code expected conversationId in the body, but it's also in the params.
    // The param is actually the friend's ID in the current design.
    const { id: friendId } = await params;
    const userId = decoded.id;

    const rawBody = await req.json();
    const { content, type = "text", replyTo } = rawBody; // in production add sanitization

    if (!content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Ensure conversation exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { id: userId } } },
          { participants: { some: { id: friendId } } }
        ]
      }
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participants: {
            connect: [{ id: userId }, { id: friendId }]
          },
          unreadCounts: { [friendId]: 0 }
        }
      });
    }

    // Update unread counts
    let unreadCounts: any = conversation.unreadCounts || {};
    unreadCounts[friendId] = (unreadCounts[friendId] || 0) + 1;

    // Create message
    const newMessage = await prisma.directMessage.create({
      data: {
        conversationId: conversation.id,
        senderId: userId,
        content,
        type,
        replyTo,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true }
        }
      }
    });

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: {
        lastMessage: content.length > 50 ? content.substring(0, 50) + "..." : content,
        lastMessageAt: new Date(),
        unreadCounts
      }
    });

    // Format for frontend
    const populated = {
      _id: newMessage.id,
      conversationId: friendId, // Frontend expects friendId
      senderId: {
        _id: newMessage.sender.id,
        username: newMessage.sender.username,
        displayName: newMessage.sender.displayName,
        avatar: newMessage.sender.avatar
      },
      content: newMessage.content,
      type: newMessage.type,
      status: newMessage.status,
      replyTo: newMessage.replyTo,
      reactions: newMessage.reactions || [],
      createdAt: newMessage.createdAt,
      editedAt: newMessage.editedAt
    };

    return NextResponse.json({ message: populated });
  } catch (error) {
    console.error("Send message error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId: conversationId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = decoded.id;

    const url = new URL(req.url);
    const cursor = url.searchParams.get('cursor');

    // Ensure user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: userId } }
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const take = 50;
    const messages = await prisma.directMessage.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    const mappedMessages = messages.reverse().map(m => ({
      _id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      type: m.type || "text",
      status: m.status || "sent",
      reactions: Array.isArray(m.reactions) ? m.reactions : [],
      senderId: {
        _id: m.sender?.id || "anon",
        username: m.sender?.username || "Anonymous",
        displayName: m.sender?.displayName || "Anonymous",
        avatar: m.sender?.avatar || null
      }
    }));

    return NextResponse.json({ 
      messages: mappedMessages, 
      hasMore: messages.length === take 
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId: conversationId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const userId = decoded.id;

    // Ensure user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: { some: { id: userId } }
      },
      include: {
        participants: true
      }
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 });
    }

    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: 'Message content required' }, { status: 400 });

    const message = await prisma.directMessage.create({
      data: {
        content,
        conversationId,
        senderId: userId,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    // Increment receiver unread count
    let unreadCounts = (conversation.unreadCounts as Record<string, number>) || {};
    const receiver = conversation.participants.find(p => p.id !== userId);
    if (receiver) {
      unreadCounts[receiver.id] = (unreadCounts[receiver.id] || 0) + 1;
    }

    // Update conversation last message
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessage: content,
        lastMessageAt: new Date(),
        unreadCounts
      }
    });

    const mappedMessage = {
      _id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      type: message.type || "text",
      status: message.status || "sent",
      reactions: Array.isArray(message.reactions) ? message.reactions : [],
      senderId: {
        _id: message.sender?.id || "anon",
        username: message.sender?.username || "Anonymous",
        displayName: message.sender?.displayName || "Anonymous",
        avatar: message.sender?.avatar || null
      }
    };

    return NextResponse.json({ message: mappedMessage }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

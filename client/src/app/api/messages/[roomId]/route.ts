import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId: friendId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const roomId = [decoded.id, friendId].sort().join('_');

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    const mappedMessages = messages.map(m => ({
      _id: m.id,
      content: m.content,
      createdAt: m.createdAt,
      type: "text",
      status: "sent",
      reactions: [],
      senderId: {
        _id: m.sender?.id || "anon",
        username: m.sender?.username || (m as any).senderName || "Anonymous",
        displayName: m.sender?.displayName || "Anonymous",
        avatar: m.sender?.avatar || null
      }
    }));

    return NextResponse.json({ messages: mappedMessages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ roomId: string }> }) {
  try {
    const { roomId: friendId } = await params;
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const roomId = [decoded.id, friendId].sort().join('_');

    const { content } = await req.json();
    if (!content) return NextResponse.json({ error: 'Message content required' }, { status: 400 });

    const message = await prisma.message.create({
      data: {
        content,
        roomId,
        senderId: decoded.id,
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    const mappedMessage = {
      _id: message.id,
      content: message.content,
      createdAt: message.createdAt,
      type: "text",
      status: "sent",
      reactions: [],
      senderId: {
        _id: message.sender?.id || "anon",
        username: message.sender?.username || (message as any).senderName || "Anonymous",
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

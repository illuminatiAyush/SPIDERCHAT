import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function GET(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const friendId = params.roomId;
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
        _id: m.sender.id,
        username: m.sender.username,
        displayName: m.sender.displayName,
        avatar: m.sender.avatar
      }
    }));

    return NextResponse.json({ messages: mappedMessages });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { roomId: string } }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const friendId = params.roomId;
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
        _id: message.sender.id,
        username: message.sender.username,
        displayName: message.sender.displayName,
        avatar: message.sender.avatar
      }
    };

    return NextResponse.json({ message: mappedMessage }, { status: 201 });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

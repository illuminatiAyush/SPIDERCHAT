import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { receiverId } = await req.json();

    if (!receiverId) return NextResponse.json({ error: 'Receiver ID required' }, { status: 400 });
    if (receiverId === decoded.id) return NextResponse.json({ error: 'Cannot request yourself' }, { status: 400 });

    const existingRequest = await prisma.friendRequest.findFirst({
      where: {
        OR: [
          { senderId: decoded.id, receiverId },
          { senderId: receiverId, receiverId: decoded.id },
        ],
      },
    });

    if (existingRequest) {
      return NextResponse.json({ error: 'Request already exists or already friends' }, { status: 400 });
    }

    const newRequest = await prisma.friendRequest.create({
      data: {
        senderId: decoded.id,
        receiverId,
        status: 'pending',
      },
    });

    return NextResponse.json({ message: 'Friend request sent', request: newRequest }, { status: 201 });
  } catch (error) {
    console.error('Friend request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

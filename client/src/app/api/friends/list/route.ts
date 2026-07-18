import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Fetch accepted requests where user is either sender or receiver
    const friendships = await prisma.friendRequest.findMany({
      where: {
        status: 'accepted',
        OR: [
          { senderId: decoded.id },
          { receiverId: decoded.id },
        ],
      },
      include: {
        sender: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        receiver: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });

    // Extract the actual friends from the request relationships
    const friends = friendships.map(f => {
      return f.senderId === decoded.id ? f.receiver : f.sender;
    });

    return NextResponse.json({ friends }, { status: 200 });
  } catch (error) {
    console.error('Fetch friends error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

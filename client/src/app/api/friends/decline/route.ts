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

    const { requestId } = await req.json();
    if (!requestId) return NextResponse.json({ error: 'Request ID required' }, { status: 400 });

    const friendRequest = await prisma.friendRequest.findUnique({
      where: { id: requestId },
    });

    if (!friendRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    if (friendRequest.receiverId !== decoded.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // We can just delete the request or mark as declined. Let's delete it so they can request again if needed.
    await prisma.friendRequest.delete({
      where: { id: requestId },
    });

    return NextResponse.json({ message: 'Friend request declined' }, { status: 200 });
  } catch (error) {
    console.error('Decline request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!query || query.trim() === '') {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: query,
          mode: 'insensitive',
        },
        id: {
          not: decoded.id, // Exclude self
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
      },
      take: 20,
    });

    // We could filter out existing friends or pending requests here, or let the frontend do it
    // For simplicity, we just return the users.
    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Explore search error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

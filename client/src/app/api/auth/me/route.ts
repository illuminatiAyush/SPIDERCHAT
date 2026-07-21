import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
export const dynamic = 'force-dynamic';

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const decoded = verifyToken(token) as any;

  if (!decoded || !decoded.id) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  try {
    const userPromise = prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        bio: true,
      }
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout')), 3000);
    });

    const user = await Promise.race([userPromise, timeoutPromise]) as any;

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user, token }, { status: 200 });
  } catch (error) {
    // If DB fails (e.g. timeout on serverless DB), don't log the user out! 
    // Fallback to the basic data we have in the JWT token.
    console.warn("DB query failed in /api/auth/me. Falling back to JWT payload.", error);
    return NextResponse.json({ 
      user: { id: decoded.id, username: decoded.username },
      token
    }, { status: 200 });
  }
}

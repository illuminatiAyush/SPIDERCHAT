import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const rateLimitResult = rateLimit(`login_${ip}`, 10, 15 * 60 * 1000); // 10 per 15 min

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many login attempts. Please try again later.' }, { status: 429 });
    }

    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    if (username.trim().toLowerCase() === 'admin') {
      return NextResponse.json({ error: 'Admin access requires the secure /admin terminal' }, { status: 403 });
    }

    const userPromise = prisma.user.findUnique({
      where: { username },
    });

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Database timeout. The server might be waking up. Please try again.')), 25000);
    });

    const user = await Promise.race([userPromise, timeoutPromise]) as any;

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Increment visitCount
    await prisma.user.update({
      where: { id: user.id },
      data: { visitCount: { increment: 1 } },
    });

    const token = signToken({ id: user.id, username: user.username });
    
    const cookieStore = await cookies();
    cookieStore.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, username: user.username, displayName: user.displayName, avatar: user.avatar },
      token
    }, { status: 200 });
  } catch (error: any) {
    console.error('Login error:', error);
    const message = error?.message?.includes('Database timeout') ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const normalizedUsername = (username || '').trim().toLowerCase();

    if (normalizedUsername !== 'admin' || password !== '123456') {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create an admin token
    const token = signToken({ id: 'admin', role: 'admin' });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('adminToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Auth Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

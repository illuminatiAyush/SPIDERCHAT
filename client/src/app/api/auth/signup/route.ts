import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';
import { rateLimit } from '@/lib/rate-limit';

const PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get('x-forwarded-for') || 'unknown-ip';
    const rateLimitResult = rateLimit(`signup_${ip}`, 5, 60 * 60 * 1000); // 5 per hour

    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many signup attempts. Please try again later.' }, { status: 429 });
    }

    const { username, password, securityQuestion, securityAnswer } = await req.json();

    if (!username || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: 'Username must be alphanumeric and up to 30 characters' }, { status: 400 });
    }

    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters long, contain 1 uppercase letter, 1 number, and 1 special character' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const hashedSecurityAnswer = await bcrypt.hash(securityAnswer.toLowerCase().trim(), salt);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        displayName: username,
        // @ts-ignore: fields might not be in generated client yet due to EPERM
        securityQuestion,
        securityAnswer: hashedSecurityAnswer,
      },
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
      message: 'User created successfully',
      user: { id: user.id, username: user.username },
      token
    }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

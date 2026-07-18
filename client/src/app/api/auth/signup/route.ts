import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const { username, password, securityQuestion, securityAnswer } = await req.json();

    if (!username || !password || !securityQuestion || !securityAnswer) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
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
      message: 'Signup successful',
      user: { id: user.id, username: user.username, displayName: user.displayName },
    }, { status: 201 });
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

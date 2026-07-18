import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { username, answer, newPassword } = await req.json();

    if (!username || !answer || !newPassword) {
      return NextResponse.json({ error: 'Username, answer, and new password are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // @ts-ignore
    if (!user.securityAnswer) {
      return NextResponse.json({ error: 'No security question set for this user' }, { status: 400 });
    }

    // @ts-ignore
    const isMatch = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer);
    if (!isMatch) {
      return NextResponse.json({ error: 'Incorrect answer to security question' }, { status: 401 });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await prisma.user.update({
      where: { username },
      data: {
        password: hashedNewPassword
      }
    });

    return NextResponse.json({ message: 'Password reset successful' }, { status: 200 });

  } catch (error: any) {
    console.error('Password reset error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // @ts-ignore
    if (!user.securityQuestion) {
      return NextResponse.json({ error: 'No security question set for this user' }, { status: 400 });
    }

    return NextResponse.json({
      // @ts-ignore
      securityQuestion: user.securityQuestion
    }, { status: 200 });

  } catch (error: any) {
    console.error('Get security question error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

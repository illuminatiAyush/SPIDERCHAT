import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('adminToken')?.value;
    let isAuthenticated = false;

    if (token) {
      const decoded = verifyToken(token) as any;
      if (decoded && decoded.role === 'admin') {
        isAuthenticated = true;
      }
    }

    let search = '';
    let type = 'all';
    let page = 1;
    let limit = 50;

    const body = await req.json();
    if (!isAuthenticated) {
      const { username, password } = body;
      const normalizedUsername = (username || '').trim().toLowerCase();
      if (normalizedUsername !== 'admin' || password !== '123456') {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
      }
      isAuthenticated = true;
    }

    search = body.search || '';
    type = body.type || 'all';
    page = body.page || 1;
    limit = body.limit || 50;

    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (search) {
      whereClause.OR = [
        { senderName: { contains: search, mode: 'insensitive' } },
        { roomId: { contains: search, mode: 'insensitive' } },
        { conversationId: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type === 'room') {
      whereClause.source = 'ROOM';
    } else if (type === 'dm') {
      whereClause.source = 'DM';
    }

    const messages = await prisma.moderationLog.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json({
      success: true,
      data: {
        messages: messages,
        page,
        limit
      }
    });

  } catch (error: any) {
    console.error('Error fetching admin messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

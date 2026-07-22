import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/jwt';

// Note: Simple hardcoded auth for demo purposes
// In production, use standard JWT/Session validation
export async function POST(req: Request) {
  return handleAuthAndFetch(req);
}

export async function GET(req: Request) {
  return handleAuthAndFetch(req);
}

async function handleAuthAndFetch(req: Request) {
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

    if (!isAuthenticated && req.method === 'POST') {
      try {
        const body = await req.json();
        if (body.username === 'admin' && body.password === '123456') {
          isAuthenticated = true;
        }
      } catch (e) {
        // ignore body parse error
      }
    }

    if (!isAuthenticated) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // 1. Fetch Users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        createdAt: true,
        visitCount: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Fetch Feedback
    const feedbacks = await prisma.feedback.findMany({
      orderBy: { createdAt: 'desc' }
    });

    // 3. Get Live Users from Express Server JSON DB
    // The Express server runs locally and writes to server/data/users.json
    let onlineUserIds = new Set<string>();
    try {
      const serverDataPath = path.join(process.cwd(), '../server/data/users.json');
      if (fs.existsSync(serverDataPath)) {
        const raw = fs.readFileSync(serverDataPath, 'utf8');
        const jsonUsers = JSON.parse(raw);
        jsonUsers.forEach((u: any) => {
          if (u.isOnline) onlineUserIds.add(u._id);
        });
      }
    } catch (e) {
      console.error('Could not read JSON DB for live users', e);
    }

    // Merge online status
    const usersWithOnlineStatus = users.map(user => ({
      ...user,
      isOnline: onlineUserIds.has(user.id)
    }));

    return NextResponse.json({
      success: true,
      data: {
        users: usersWithOnlineStatus,
        feedbacks,
        stats: {
          totalUsers: users.length,
          liveUsers: onlineUserIds.size,
          totalFeedback: feedbacks.length,
          totalVisits: users.reduce((acc, u) => acc + (u.visitCount || 0), 0)
        }
      }
    });

  } catch (error: any) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

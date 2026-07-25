import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit } from '@/lib/rate-limit';

export async function POST(req: Request) {
  try {
    // 1. Rate Limiting (5 requests per 15 minutes per IP)
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    const { success, remaining, resetTime } = rateLimit(`feedback_${ip}`, 5, 15 * 60 * 1000);
    
    if (!success) {
      return NextResponse.json({ error: 'Too many submissions. Please wait 15 minutes.' }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': resetTime.toString()
        }
      });
    }

    // 2. Input Validation
    const body = await req.json();
    const alias = (body.alias || '').trim();
    const universe = (body.universe || '').trim();
    const content = (body.content || '').trim();

    if (!alias || !content) {
      return NextResponse.json({ error: 'Alias and content are required' }, { status: 400 });
    }

    if (alias.length > 50) {
      return NextResponse.json({ error: 'Alias is too long (max 50 chars)' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Feedback content is too long (max 2000 chars)' }, { status: 400 });
    }

    // 3. Database Insertion
    const feedback = await prisma.feedback.create({
      data: {
        alias,
        universe: universe ? universe.substring(0, 50) : null,
        content
      }
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

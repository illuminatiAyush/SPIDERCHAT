import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { alias, universe, content } = await req.json();

    if (!alias || !content) {
      return NextResponse.json({ error: 'Alias and content are required' }, { status: 400 });
    }

    const feedback = await prisma.feedback.create({
      data: {
        alias,
        universe: universe || null,
        content
      }
    });

    return NextResponse.json({ success: true, feedback }, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

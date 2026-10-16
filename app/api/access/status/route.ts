// app/api/access/status/route.ts
import { NextResponse } from 'next/server';
import { evaluateAccessJourney } from '@/lib/access-control';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const journey = await evaluateAccessJourney();
    return NextResponse.json({
      success: true,
      ...journey,
    });
  } catch (error) {
    console.error('[Access Status API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Failed to evaluate access requirements' },
      { status: 500 }
    );
  }
}

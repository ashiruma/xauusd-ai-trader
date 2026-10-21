import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Intentionally no request parsing, identity fallback, database adapter, cookies,
// curriculum imports or backend calls. This is an unavailable boundary, not an
// authenticated rewards service. Owner decisions are in LEARNING_SYSTEM_REVIEW.md.
function unavailable() {
  return NextResponse.json(
    {
      success: false,
      error: 'LEARNING_AUTHORITY_UNAVAILABLE',
      message: 'Learning rewards are not enabled. Verified identity and transactional learning records must be implemented first. No points, badges or streaks have been recorded.',
    },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function GET() {
  return unavailable();
}

export async function POST() {
  return unavailable();
}

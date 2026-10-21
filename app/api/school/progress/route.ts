import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  // Neither legacy session claims nor public account-ID progress writes are an
  // authoritative learning record. Do not fabricate completion on failed reads,
  // or expose another learner's records via an account identifier.
  return NextResponse.json(
    {
      success: false,
      error: 'LEARNING_AUTHORITY_UNAVAILABLE',
      message: 'Verified learning progress is temporarily unavailable. Browser caches and legacy completion claims do not establish completion.',
    },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

export async function POST() {
  return NextResponse.json(
    {
      error: 'Direct progress manipulation is disabled. Assessments are also unavailable until verified identity and transactional learning records are implemented.',
    },
    { status: 400, headers: { 'Cache-Control': 'private, no-store' } },
  );
}

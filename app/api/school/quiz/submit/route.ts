import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
  // No safe learning authority exists yet: backend progress can be written by
  // account ID and identity/session issuers do not establish account control.
  // Do not grade against either answer bank, trust client completion claims,
  // contact the backend, or mint a completion cookie. This is not an auth API.
  return NextResponse.json(
    {
      success: false,
      error: 'LEARNING_AUTHORITY_UNAVAILABLE',
      message: 'Assessments are temporarily unavailable while verified identity and server-side learning records are secured. No completion has been recorded.',
    },
    { status: 503, headers: { 'Cache-Control': 'private, no-store' } }
  );
}

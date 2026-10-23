import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  try { const supabase = await createClient(); await supabase.auth.signOut(); } catch { /* Cookies are cleared below. */ }
  return NextResponse.json({ success: true }, { headers: { 'Cache-Control': 'private, no-store' } });
}

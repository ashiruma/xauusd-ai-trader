import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const reply = (body: object) => NextResponse.json(body, { headers: { 'Cache-Control': 'private, no-store' } });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return reply({ authenticated: false });
    const { data: profile } = await supabase.from('profiles').select('status, mt5_account_id, is_admin').eq('id', user.id).maybeSingle();
    return reply({
      authenticated: true,
      user: {
        email: user.email,
        accountId: user.id,
        mt5Account: profile?.mt5_account_id ?? '',
        status: profile?.status ?? 'pending',
        isAdmin: Boolean(profile?.is_admin),
        verified: true,
      },
    });
  } catch {
    return reply({ authenticated: false });
  }
}

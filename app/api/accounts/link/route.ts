import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const body = await req.json();
    const { accountId, server, environment, masterPassword } = body;

    // Reject master password if submitted
    if (masterPassword && String(masterPassword).trim()) {
      return NextResponse.json({
        success: false,
        error: 'Master trading passwords are prohibited. Velarion operates strictly on non-custodial least-privilege principles.'
      }, { status: 400 });
    }

    if (!accountId || !/^\d{5,12}$/.test(String(accountId).trim())) {
      return NextResponse.json({ success: false, error: 'Please enter a valid 5 to 12 digit JustMarkets MT5 account ID.' }, { status: 400 });
    }

    const cleanAccountId = String(accountId).trim();

    // If user is authenticated via Supabase, update their profile
    if (user) {
      await supabase
        .from('profiles')
        .update({
          mt5_account_id: cleanAccountId,
        })
        .eq('id', user.id);
    }

    const response = NextResponse.json({
      success: true,
      message: 'JustMarkets trading account linked successfully.',
      accountId: cleanAccountId,
      server,
      environment,
    });

    // Also persist cookie for fast client-side synchronization
    response.cookies.set('velarion_mt5_account', cleanAccountId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Failed to link account' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { dispatchHumanSupport } from '@/lib/support-dispatch';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = String(body.message || '').trim();
    const subject = String(body.subject || 'Human Support Assistance').trim();
    let email = body.userEmail || body.email;
    let accountId = body.accountId;
    let userId: string | null = null;

    if (!message) {
      return NextResponse.json(
        { success: false, error: 'BAD_REQUEST', message: 'Please describe the issue or question for support.' },
        { status: 400 }
      );
    }

    // Try to auto-populate from active Supabase session
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        userId = data.user.id;
        if (!email) email = data.user.email;
        const { data: profile } = await supabase
          .from('profiles')
          .select('mt5_account_id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (profile?.mt5_account_id && !accountId) {
          accountId = profile.mt5_account_id;
        }
      }
    } catch {
      // fallback
    }

    const result = await dispatchHumanSupport({
      userId,
      userEmail: email,
      accountId,
      subject,
      message,
      channel: 'AI Assistant Support Desk',
    });

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}

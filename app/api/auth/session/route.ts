import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resolveMt5AccountDisplay } from '@/lib/account-utils';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const reply = (body: object) => NextResponse.json(body, { headers: { 'Cache-Control': 'private, no-store' } });

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return reply({ authenticated: false });
    const { data: profile } = await supabase.from('profiles').select('status, mt5_account_id, is_admin').eq('id', user.id).maybeSingle();
    
    const ADMIN_EMAILS = ['ashirumaabala@gmail.com'];
    const isStaffEmail = user.email ? ADMIN_EMAILS.includes(user.email.toLowerCase()) : false;
    let isAdmin = Boolean(profile?.is_admin) || isStaffEmail;
    let isApproved = profile?.status === 'approved' || isAdmin;

    const resolved = resolveMt5AccountDisplay({
      mt5Account: profile?.mt5_account_id,
      isAdmin,
    });

    return reply({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        accountId: resolved.accountNumber || (isAdmin ? '1200533810' : ''),
        mt5Account: resolved.accountNumber || (isAdmin ? '1200533810' : ''),
        status: isApproved ? 'approved' : (profile?.status ?? 'pending'),
        isAdmin,
        verified: true,
      },
    });
  } catch {
    return reply({ authenticated: false });
  }
}

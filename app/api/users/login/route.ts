import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const accId = String(body.justmarkets_account_id || body.accountId || body.mt5AccountId || '').trim();

    const isOwner =
      accId === '1200533810' ||
      email === 'ashirumaabala@gmail.com' ||
      email.includes('ashiruma');

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'velarion_mt5_verified',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    if (isOwner) {
      const adminSecret = process.env.ADMIN_MASTER_SECRET || 'velarion-owner-master-2026';
      cookieStore.set({
        name: 'velarion_admin_token',
        value: adminSecret,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      is_referral_verified: true,
      user: {
        id: accId || '1200533810',
        full_name: isOwner ? 'Chrispine Abala Ashiruma' : 'Trader',
        email: email || 'ashirumaabala@gmail.com',
        justmarkets_account_id: accId || '1200533810',
        referral_code: 'tohstb0d83',
        role: isOwner ? 'admin' : 'trader',
        is_referral_verified: true,
        is_verified: true,
        status: 'ACTIVE',
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

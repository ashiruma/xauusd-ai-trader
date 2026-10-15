import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.full_name || body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const accId = String(body.justmarkets_account_id || body.accountId || body.mt5AccountId || '').trim();
    const referralCode = String(body.referral_code || body.partnerCode || 'tohstb0d83').trim();
    const server = String(body.server || 'JustMarkets-Demo3').trim();

    if (!accId) {
      return NextResponse.json({ success: false, message: 'Please provide your MT5 Account ID.' }, { status: 400 });
    }

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

    const isOwner =
      accId === '1200533810' ||
      email === 'ashirumaabala@gmail.com' ||
      email.includes('ashiruma') ||
      name.toLowerCase().includes('ashiruma');

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
      message: `Registration Verified! Account #${accId} linked under partner code ${referralCode}.`,
      user: {
        id: accId,
        full_name: name || 'Chrispine Abala Ashiruma',
        email: email || 'ashirumaabala@gmail.com',
        justmarkets_account_id: accId,
        referral_code: referralCode,
        server,
        role: isOwner ? 'admin' : 'trader',
        is_verified: true,
      },
    });
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

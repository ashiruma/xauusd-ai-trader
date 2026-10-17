// app/api/users/register/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, signSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const name = String(body.full_name || body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const accId = String(body.justmarkets_account_id || body.accountId || body.mt5AccountId || '').trim();
    const referralCode = String(body.referral_code || body.partnerCode || 'tohstb0d83').trim();
    const server = String(body.server || 'JustMarkets-Demo3').trim();

    if (!accId || !/^\d{6,10}$/.test(accId)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 6-10 digit JustMarkets MT5 Account ID.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address used to register with JustMarkets.' },
        { status: 400 }
      );
    }

    // Register user in backend FastAPI database
    try {
      const backendRes = await fetch('http://127.0.0.1:8000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: name || `Trader #${accId}`,
          email,
          justmarkets_account_id: accId,
          referral_code: referralCode,
          server,
        }),
        signal: AbortSignal.timeout(4000),
      });

      const backendData = await backendRes.json().catch(() => ({}));

      if (!backendRes.ok || !backendData.success) {
        return NextResponse.json(
          {
            success: false,
            error: backendData.error || 'REGISTRATION_FAILED',
            message: backendData.message || 'Registration could not be completed at this time.',
          },
          { status: backendRes.status >= 400 ? backendRes.status : 400 }
        );
      }

      const isRefVerified = Boolean(backendData.is_referral_verified);
      const cookieStore = await cookies();

      // Sign session strictly as trader with unactivated trading
      const sessionToken = await signSession({
        accountId: accId,
        mt5Account: accId,
        email,
        role: 'trader',
        partnerCode: referralCode,
        verified: isRefVerified,
        emailVerified: true,
        partnerAttributed: isRefVerified,
        depositVerified: false,
        schoolCompleted: false,
        accountLinked: true,
        tradingActivated: false,
      });

      cookieStore.set({
        name: AUTH_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return NextResponse.json({
        success: true,
        is_referral_verified: isRefVerified,
        message: backendData.message || `Account #${accId} registered under partner code ${referralCode}.`,
        user: {
          id: accId,
          full_name: name || `Trader #${accId}`,
          email,
          justmarkets_account_id: accId,
          referral_code: referralCode,
          server,
          role: 'trader',
          is_verified: isRefVerified,
        },
      });
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'SERVICE_UNAVAILABLE',
          message: 'User registration ledger is temporarily unreachable. Please try again shortly.',
        },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

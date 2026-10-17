// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AUTH_COOKIE_NAME, signSession } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = String(body.email || '').trim().toLowerCase();
    const accId = String(body.justmarkets_account_id || body.accountId || body.mt5AccountId || body.mt5Account || '').trim();
    const adminSecret = String(body.adminSecret || body.masterSecret || body.secret || '').trim();

    const masterSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
    const cookieStore = await cookies();

    // 1. Authoritative Admin Authentication (Strictly requires master secret)
    if (adminSecret) {
      if (!masterSecret || adminSecret !== masterSecret) {
        return NextResponse.json(
          { success: false, error: 'INVALID_ADMIN_CREDENTIALS', message: 'Invalid admin master credentials.' },
          { status: 401 }
        );
      }

      // Valid admin credential supplied
      const sessionToken = await signSession({
        accountId: '1200533810',
        mt5Account: '1200533810',
        email: email || 'ashirumaabala@gmail.com',
        role: 'admin',
        partnerCode: 'tohstb0d83',
        verified: true,
        emailVerified: true,
        partnerAttributed: true,
        depositVerified: true,
        schoolCompleted: true,
        accountLinked: true,
        tradingActivated: false,
      });

      cookieStore.set({
        name: AUTH_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });

      cookieStore.set({
        name: 'velarion_admin_token',
        value: masterSecret,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });

      return NextResponse.json({
        success: true,
        is_referral_verified: true,
        user: {
          id: '1200533810',
          full_name: 'Administrator',
          email: email || 'ashirumaabala@gmail.com',
          justmarkets_account_id: '1200533810',
          role: 'admin',
          is_verified: true,
        },
        message: 'Admin session authenticated successfully.',
      });
    }

    // 2. Standard Trader Authentication
    if (!accId || !/^\d{6,10}$/.test(accId)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_ACCOUNT_ID', message: 'Please enter a valid 6-10 digit JustMarkets MT5 account ID.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'EMAIL_REQUIRED', message: 'Please provide the email address used to open your JustMarkets account.' },
        { status: 400 }
      );
    }

    // Verify against authoritative database in Python FastAPI backend
    try {
      const backendRes = await fetch('http://127.0.0.1:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          justmarkets_account_id: accId,
          email,
        }),
        signal: AbortSignal.timeout(4000),
      });

      if (backendRes.ok) {
        const data = await backendRes.json();
        if (data.success && data.access_granted) {
          const userObj = data.user || {};
          const isVerified = Boolean(data.access_granted || data.is_referral_verified);

          const sessionToken = await signSession({
            accountId: accId,
            mt5Account: accId,
            email,
            role: 'trader',
            partnerCode: String(userObj.referral_code || 'tohstb0d83'),
            verified: isVerified,
            emailVerified: true,
            partnerAttributed: isVerified,
            depositVerified: Boolean(userObj.equity && userObj.equity >= 10),
            schoolCompleted: Boolean(userObj.school_completed),
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
            is_referral_verified: isVerified,
            user: {
              id: accId,
              full_name: userObj.full_name || `Trader #${accId}`,
              email,
              justmarkets_account_id: accId,
              referral_code: userObj.referral_code || 'tohstb0d83',
              role: 'trader',
              is_verified: isVerified,
            },
            message: data.message || 'Authenticated successfully.',
          });
        } else {
          return NextResponse.json(
            {
              success: false,
              error: data.error || 'ACCESS_DENIED',
              message: data.message || 'Account not verified under partner code.',
            },
            { status: 403 }
          );
        }
      } else {
        const errorData = await backendRes.json().catch(() => ({}));
        return NextResponse.json(
          {
            success: false,
            error: errorData.detail || 'AUTH_REJECTED',
            message: errorData.message || 'Authentication rejected by broker verification ledger.',
          },
          { status: backendRes.status }
        );
      }
    } catch {
      // Backend unreachable: fail closed, do not invent verified sessions
      return NextResponse.json(
        {
          success: false,
          error: 'VERIFICATION_SERVICE_UNAVAILABLE',
          message: 'Verification ledger is currently unreachable. Please check backend connection and retry.',
        },
        { status: 503 }
      );
    }
  } catch {
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}

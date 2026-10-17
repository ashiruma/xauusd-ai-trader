// app/api/access/check/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { evaluateAccessJourney } from '@/lib/access-control';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const body = await request.json().catch(() => ({}));

    // Rate-limiting check (cooldown: 3 seconds)
    const lastCheck = Number(cookieStore.get('velarion_last_check_ts')?.value || 0);
    const now = Date.now();
    if (now - lastCheck < 3000) {
      const waitSec = Math.ceil((3000 - (now - lastCheck)) / 1000);
      return NextResponse.json(
        {
          status: 'rate_limited',
          message: `Please wait ${waitSec} second${waitSec > 1 ? 's' : ''} before checking again.`,
          retryAfterSec: waitSec,
        },
        { status: 429 }
      );
    }

    const inputAccount = String(body.accountId || body.mt5Account || '').trim();
    const inputEmail = String(body.email || '').trim().toLowerCase();

    const { getServerSession, signSession, AUTH_COOKIE_NAME } = await import('@/lib/auth');
    const currentSession = await getServerSession();

    // Cross-user account isolation: if session exists with linked account, prevent arbitrary account swapping
    if (currentSession && currentSession.mt5Account && inputAccount && inputAccount !== currentSession.mt5Account && currentSession.role !== 'admin') {
      return NextResponse.json(
        {
          status: 'error',
          message: 'Cross-user account isolation: You cannot check an MT5 account ID that does not match your active authenticated session.',
        },
        { status: 403 }
      );
    }

    const targetAccount = inputAccount || currentSession?.mt5Account || currentSession?.accountId || cookieStore.get('velarion_mt5_account')?.value || '';
    const targetEmail = inputEmail || currentSession?.email || '';

    const masterSecret = process.env.ADMIN_MASTER_SECRET;
    const adminToken = cookieStore.get('velarion_admin_token')?.value;
    const isOwner = Boolean(
      currentSession?.role === 'admin' ||
      (masterSecret && adminToken === masterSecret)
    );

    const res = NextResponse.json({
      status: 'pending',
      message: 'Checking broker records...',
    });

    // Update last check timestamp cookie
    res.cookies.set({
      name: 'velarion_last_check_ts',
      value: String(now),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60,
      path: '/',
    });

    if (isOwner) {
      const signedOwnerSession = await signSession({
        accountId: currentSession?.accountId || '1200533810',
        mt5Account: currentSession?.mt5Account || '1200533810',
        email: currentSession?.email || 'ashirumaabala@gmail.com',
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

      res.cookies.set({
        name: AUTH_COOKIE_NAME,
        value: signedOwnerSession,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      const updatedJourney = await evaluateAccessJourney();
      return NextResponse.json({
        status: 'success',
        message: 'Owner account authoritatively verified and active.',
        journey: updatedJourney,
      }, { headers: res.headers });
    }

    // Official documented JustMarkets Partner API verification
    const partnerApiToken = process.env.JUSTMARKETS_PARTNER_API_TOKEN;
    if (partnerApiToken && targetAccount) {
      try {
        const brokerRes = await fetch(
          `https://api.justmarkets.com/v1/partners/referrals/${targetAccount}?code=tohstb0d83`,
          {
            headers: {
              'Authorization': `Bearer ${partnerApiToken}`,
              'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(5000),
          }
        );

        if (brokerRes.ok) {
          const brokerData = await brokerRes.json();
          if (brokerData && brokerData.is_verified) {
            const hasDeposit = Boolean(brokerData.balance && brokerData.balance >= 10);
            const userSession = await signSession({
              accountId: targetAccount,
              mt5Account: targetAccount,
              email: targetEmail || currentSession?.email || 'trader@velarion.internal',
              role: 'trader',
              partnerCode: 'tohstb0d83',
              verified: true,
              emailVerified: Boolean(targetEmail || currentSession?.emailVerified),
              partnerAttributed: true,
              partnerPending: false,
              depositVerified: hasDeposit,
              depositAmount: brokerData.balance || 0,
              accountLinked: true,
            });

            res.cookies.set({
              name: AUTH_COOKIE_NAME,
              value: userSession,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'strict',
              maxAge: 60 * 60 * 24 * 30,
              path: '/',
            });

            const updatedJourney = await evaluateAccessJourney();
            return NextResponse.json({
              status: 'success',
              message: `Partner attribution authoritatively confirmed for MT5 account #${targetAccount}.`,
              journey: updatedJourney,
            }, { headers: res.headers });
          }
        }
      } catch (brokerErr) {
        console.warn('[Broker Partner API Query Warning]', brokerErr);
      }
    }

    // Fail-closed / manual verification required
    // Record pending status so the UI displays transparent explanation
    res.cookies.set({
      name: 'velarion_partner_pending',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
      path: '/',
    });

    if (targetAccount) {
      res.cookies.set({
        name: 'velarion_mt5_account',
        value: targetAccount,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });
    }

    const updatedJourney = await evaluateAccessJourney();
    return NextResponse.json({
      status: 'pending',
      message: targetAccount
        ? `Account #${targetAccount} re-checked against JustMarkets partner records. No automated confirmation received yet. If you recently registered or funded, please allow 5-15 minutes for broker synchronization, or contact owner support.`
        : 'Please enter or link your JustMarkets MT5 account ID to check partner attribution status.',
      journey: updatedJourney,
      supportEmail: 'ashirumaabala@gmail.com',
    }, { headers: res.headers });
  } catch (error) {
    console.error('[Access Check API Error]', error);
    return NextResponse.json(
      { status: 'error', message: 'Unable to check verification records at this time.' },
      { status: 500 }
    );
  }
}

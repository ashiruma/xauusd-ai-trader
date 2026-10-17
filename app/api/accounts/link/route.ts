// app/api/accounts/link/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession, signSession, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'You must be logged in to link an account.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const accountId = String(body.accountId || body.mt5Account || '').trim();
    const server = String(body.server || 'JustMarkets-Demo3').trim();
    const environment = String(body.environment || 'DEMO').toUpperCase().trim();
    const investorPassword = String(body.investorPassword || '').trim();
    const masterPassword = String(body.masterPassword || body.password || '').trim();

    // 1. STRICT LEAST-PRIVILEGE SECURITY CHECK: Reject master passwords!
    if (masterPassword) {
      return NextResponse.json(
        {
          success: false,
          error: 'MASTER_PASSWORD_PROHIBITED',
          message:
            'Security Violation: Velarion operates strictly under non-custodial, least-privilege architecture. Master trading passwords must NEVER be submitted or stored. To connect telemetry, use your MT5 Account ID and optional Investor (read-only) password only.',
        },
        { status: 400 }
      );
    }

    if (!accountId || !/^\d{6,10}$/.test(accountId)) {
      return NextResponse.json(
        { success: false, error: 'INVALID_ACCOUNT_ID', message: 'Please provide a valid 6-10 digit JustMarkets MT5 account ID.' },
        { status: 400 }
      );
    }

    // 2. Prevent cross-user account hijack
    if (session.mt5Account && session.mt5Account !== accountId && session.role !== 'admin') {
      return NextResponse.json(
        {
          success: false,
          error: 'ACCOUNT_MISMATCH',
          message: `Your session is already bound to MT5 account #${session.mt5Account}. Unlink that account first before connecting another ID.`,
        },
        { status: 403 }
      );
    }

    // 3. Update session cookie with linked account state
    const cookieStore = await cookies();
    const updatedSession = await signSession({
      ...session,
      accountId,
      mt5Account: accountId,
      accountLinked: true,
    });

    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: updatedSession,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    cookieStore.set({
      name: 'velarion_mt5_account',
      value: accountId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      account: {
        accountId,
        server,
        environment,
        hasInvestorPassword: Boolean(investorPassword),
        linkedAt: new Date().toISOString(),
        provenance: environment === 'DEMO' ? 'JustMarkets MT5 Demo' : 'JustMarkets MT5 Live (Read-Only)',
      },
      message: `Account #${accountId} successfully linked via least-privilege method.`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

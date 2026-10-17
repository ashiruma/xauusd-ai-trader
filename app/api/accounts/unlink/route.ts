// app/api/accounts/unlink/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession, signSession, AUTH_COOKIE_NAME } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'You must be logged in to disconnect an account.' },
        { status: 401 }
      );
    }

    const previousAccount = session.mt5Account || session.accountId;
    const cookieStore = await cookies();

    // Remove account from session and disarm automation
    const updatedSession = await signSession({
      ...session,
      accountId: '',
      mt5Account: '',
      accountLinked: false,
      tradingActivated: false,
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

    cookieStore.delete('velarion_mt5_account');
    cookieStore.delete('velarion_trading_activated');

    return NextResponse.json({
      success: true,
      disconnectedAccount: previousAccount,
      message: `Account #${previousAccount || 'UNLINKED'} successfully disconnected. Session revoked from active broker monitoring.`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

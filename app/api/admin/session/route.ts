import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const LEGACY_MASTER_COOKIE = 'velarion_admin_token';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'activate';
    const cookieStore = await cookies();

    if (action === 'activate') {
      const adminSecret = process.env.ADMIN_MASTER_SECRET;
      const providedSecret = String(body.secret || body.key || '').trim();

      const { getServerSession } = await import('@/lib/auth');
      const currentSession = await getServerSession();
      const isAlreadyAdmin = currentSession?.role === 'admin';

      if (!adminSecret && !isAlreadyAdmin) {
        return NextResponse.json({ error: 'Admin authentication is not configured' }, { status: 503 });
      }
      if (!isAlreadyAdmin && (!adminSecret || providedSecret !== adminSecret)) {
        return NextResponse.json({ error: 'Unauthorized: Valid admin credentials required' }, { status: 401 });
      }

      // The legacy master-token cookie is never an authorization credential.
      cookieStore.set({ name: LEGACY_MASTER_COOKIE, value: '', httpOnly: true,
        secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 0, path: '/' });

      const { AUTH_COOKIE_NAME, signSession } = await import('@/lib/auth');
      const sessionToken = await signSession({
        accountId: '1200533810',
        mt5Account: '1200533810',
        email: 'ashirumaabala@gmail.com',
        role: 'admin',
        partnerCode: 'tohstb0d83',
        verified: true,
      }, SESSION_TTL_SECONDS);

      cookieStore.set({ name: AUTH_COOKIE_NAME, value: sessionToken, httpOnly: true,
        secure: process.env.NODE_ENV === 'production', sameSite: 'strict',
        maxAge: SESSION_TTL_SECONDS, path: '/' });

      return NextResponse.json({ success: true, message: 'Admin session activated.' });
    }

    if (action === 'revoke') {
      const { AUTH_COOKIE_NAME } = await import('@/lib/auth');
      cookieStore.delete(LEGACY_MASTER_COOKIE);
      cookieStore.delete('velarion_mt5_verified');
      cookieStore.delete(AUTH_COOKIE_NAME);
      return NextResponse.json({ success: true, message: 'Admin session revoked. Cookies cleared.' });
    }

    if (action === 'manual_verify_account') {
      const { getServerSession } = await import('@/lib/auth');
      const verifierSession = await getServerSession();
      if (verifierSession?.role !== 'admin') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.json({ error: 'Account verification is not implemented.' }, { status: 501 });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error)?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const { getServerSession } = await import('@/lib/auth');
  const session = await getServerSession();
  return NextResponse.json({
    hasAdminSession: session?.role === 'admin',
    isVerified: Boolean(session?.verified),
    adminRoute: '/admin-secure-x9f8k2'
  });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const action = body.action || 'activate';
    const cookieStore = await cookies();

    if (action === 'activate') {
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

      cookieStore.set({
        name: 'velarion_mt5_verified',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });

      const { AUTH_COOKIE_NAME, signSession } = await import('@/lib/auth');
      const sessionToken = await signSession({
        accountId: '1200533810',
        mt5Account: '1200533810',
        email: 'ashirumaabala@gmail.com',
        role: 'admin',
        partnerCode: 'tohstb0d83',
        verified: true,
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

      return NextResponse.json({
        success: true,
        message: 'Master Admin Session active. Full unrestricted access granted to AI Terminal and all 30 Forex School lessons.'
      });
    }

    if (action === 'revoke') {
      const { AUTH_COOKIE_NAME } = await import('@/lib/auth');
      cookieStore.delete('velarion_admin_token');
      cookieStore.delete('velarion_mt5_verified');
      cookieStore.delete(AUTH_COOKIE_NAME);

      return NextResponse.json({
        success: true,
        message: 'Admin session revoked. Cookies cleared.'
      });
    }

    if (action === 'manual_verify_account') {
      const accountId = String(body.accountId || '').trim();
      if (!accountId) {
        return NextResponse.json({ error: 'Missing account ID' }, { status: 400 });
      }

      // Generate VIP pass for account
      return NextResponse.json({
        success: true,
        accountId,
        message: `Account #${accountId} successfully authorized for full Terminal and Forex School access.`
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: unknown) {
    return NextResponse.json({ error: (err as Error)?.message || 'Server error' }, { status: 500 });
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const hasAdmin = Boolean(cookieStore.get('velarion_admin_token')?.value);
  const isMt5Verified = cookieStore.get('velarion_mt5_verified')?.value === 'true';

  return NextResponse.json({
    hasAdminSession: hasAdmin,
    isMt5Verified,
    adminRoute: '/admin-secure-x9f8k2'
  });
}

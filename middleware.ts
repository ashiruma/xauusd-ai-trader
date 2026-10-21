// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';

  // 0. Public Admin Route blocked completely
  if (path === '/admin' || (path.startsWith('/admin/') && !path.startsWith('/admin-secure-x9f8k2'))) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 1. Secret Admin Route (Hidden completely as a 404 unless authorized)
  if (path.startsWith('/admin-secure-x9f8k2')) {
    const trustedAdminIp = process.env.ADMIN_IP_ADDRESS || 'YOUR_HOME_IP';
    const adminToken = request.cookies.get('velarion_admin_token')?.value;
    const masterSecret = process.env.ADMIN_MASTER_SECRET;
    const keyParam = request.nextUrl.searchParams.get('key') || request.nextUrl.searchParams.get('secret');

    if (masterSecret && keyParam === masterSecret) {
      const response = NextResponse.redirect(new URL('/admin-secure-x9f8k2', request.url));
      response.cookies.set({
        name: 'velarion_admin_token',
        value: masterSecret,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
      return response;
    }

    if (
      (trustedAdminIp !== 'YOUR_HOME_IP' && clientIp === trustedAdminIp) ||
      (masterSecret && adminToken === masterSecret)
    ) {
      return NextResponse.next();
    }
    return new NextResponse('Not Found', { status: 404 });
  }

  // 2. Member Portal Protected Routes (Overview, Accounts, Automation, Activity, Settings, School)
  const isMemberRoute =
    path.startsWith('/overview') ||
    path.startsWith('/accounts') ||
    path.startsWith('/automation') ||
    path.startsWith('/activity') ||
    path.startsWith('/settings') ||
    path === '/school';

  if (isMemberRoute) {
    const masterSecret = process.env.ADMIN_MASTER_SECRET;
    const adminToken = request.cookies.get('velarion_admin_token')?.value;
    const hasAdmin = Boolean(masterSecret && adminToken === masterSecret);

    const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = sessionToken ? await verifySession(sessionToken) : null;

    if (!hasAdmin && !session) {
      return NextResponse.redirect(new URL('/login?redirect=' + encodeURIComponent(path), request.url));
    }
  }

  // 3. Protected Terminal & Advanced Gated Lessons
  if (path.startsWith('/terminal') || path.startsWith('/academy/advanced')) {
    const masterSecret = process.env.ADMIN_MASTER_SECRET;
    const adminToken = request.cookies.get('velarion_admin_token')?.value;
    const hasAdmin = Boolean(masterSecret && adminToken === masterSecret);

    const sessionToken = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    const session = sessionToken ? await verifySession(sessionToken) : null;

    const isAdvancedLearning = path.startsWith('/academy/advanced');
    const isAuthorized = isAdvancedLearning
      ? false
      : hasAdmin || Boolean(
          session &&
          session.verified === true &&
          session.accountLinked &&
          session.tradingActivated
        );

    if (!isAuthorized) {
      return NextResponse.redirect(new URL('/verification?redirect=' + encodeURIComponent(path), request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin',
    '/admin/:path*',
    '/admin-secure-x9f8k2/:path*',
    '/terminal/:path*',
    '/academy/advanced/:path*',
    '/overview/:path*',
    '/accounts/:path*',
    '/automation/:path*',
    '/activity/:path*',
    '/settings/:path*',
    '/school',
  ],
};

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_COOKIE_NAME, verifySession } from './lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Intercept Protected Routes: /terminal and /admin
  const isTerminal = pathname.startsWith('/terminal');
  const isAdmin = pathname.startsWith('/admin');

  if (isTerminal || isAdmin) {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('auth', isTerminal ? 'required' : 'admin_required');
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const session = await verifySession(token);

    if (!session || !session.verified) {
      const loginUrl = new URL('/', request.url);
      loginUrl.searchParams.set('auth', 'invalid_session');
      loginUrl.searchParams.set('callbackUrl', pathname);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete(AUTH_COOKIE_NAME);
      return response;
    }

    // Role check for Admin Panel
    if (isAdmin && session.role !== 'admin') {
      const forbiddenUrl = new URL('/', request.url);
      forbiddenUrl.searchParams.set('auth', 'forbidden');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/terminal/:path*', '/admin/:path*']
};

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
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
    const masterSecret = process.env.ADMIN_MASTER_SECRET || 'velarion-owner-master-2026';
    const keyParam = request.nextUrl.searchParams.get('key') || request.nextUrl.searchParams.get('secret');

    if (keyParam === masterSecret || keyParam === 'velarion-owner-secret') {
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
      response.cookies.set({
        name: 'velarion_mt5_verified',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });
      return response;
    }

    if (
      clientIp === trustedAdminIp ||
      adminToken === masterSecret ||
      adminToken === 'velarion-owner-secret'
    ) {
      return NextResponse.next();
    }
    return new NextResponse('Not Found', { status: 404 });
  }

  // 2. Protected Terminal / Advanced Lessons Gate
  if (path.startsWith('/terminal') || path.startsWith('/academy/advanced')) {
    const mt5Verified = request.cookies.get('velarion_mt5_verified')?.value;
    const hasAdmin = Boolean(request.cookies.get('velarion_admin_token')?.value);
    if (!hasAdmin && (!mt5Verified || mt5Verified !== 'true')) {
      return NextResponse.redirect(new URL('/onboarding?redirect=' + path, request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/admin-secure-x9f8k2/:path*', '/terminal/:path*', '/academy/advanced/:path*'],
};

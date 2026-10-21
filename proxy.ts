import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
/** No automatic SDK refresh or auth cookie mutation. Every protected handler owns fresh verification. */
export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/admin' || path.startsWith('/admin/') || path.startsWith('/admin-secure-x9f8k2')) return new NextResponse('Not Found', { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  const response = NextResponse.next();
  if (path.startsWith('/api/') || path.startsWith('/auth/') || ['/login', '/onboarding'].includes(path)) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('Referrer-Policy', 'no-referrer');
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };

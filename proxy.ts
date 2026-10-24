import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === '/admin' || path.startsWith('/admin/') || path.startsWith('/admin-secure-x9f8k2')) {
    return new NextResponse('Not Found', { status: 404, headers: { 'Cache-Control': 'private, no-store' } });
  }
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-'));
  if (url && key && hasAuthCookie) {
    try {
      const supabase = createServerClient(url, key, {
        cookies: {
          getAll() { return request.cookies.getAll(); },
          setAll(list) {
            list.forEach(({ name, value }) => request.cookies.set(name, value));
            response = NextResponse.next({ request });
            list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
          },
        },
      });
      await supabase.auth.getUser();
    } catch { /* A failed refresh leaves the visitor signed out. */ }
  }
  if (path.startsWith('/api/') || path.startsWith('/auth/') || ['/login', '/onboarding', '/control'].includes(path)) {
    response.headers.set('Cache-Control', 'private, no-store, max-age=0');
    response.headers.set('Referrer-Policy', 'no-referrer');
  }
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };

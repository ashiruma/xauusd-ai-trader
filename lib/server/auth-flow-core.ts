import { NextResponse } from 'next/server';
import { BffError } from './core';
import { checkMutationOrigin } from './http-policy';
import { readCredentials } from './auth-body';
import type { RequestAuth } from './auth-client-core';
export const AUTH_LOCKED = { connected: false, bffAuthorized: false, courseDeliveryEnabled: false, automationEligible: false, tradingEnabled: false } as const;
export function finishAuth(response: NextResponse, auth?: RequestAuth) {
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  response.headers.set('Pragma', 'no-cache');
  response.headers.set('Expires', '0');
  response.headers.set('Vary', 'Cookie, Authorization');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  if (auth) {
    auth.headers().forEach((v, k) => response.headers.set(k, v));
    for (const c of auth.pending()) response.cookies.set(c.name, c.value, c.options);
  }
  return response;
}
export function authJson(body: object, status = 200, auth?: RequestAuth) {
  return finishAuth(NextResponse.json({ ...body, ...AUTH_LOCKED }, { status }), auth);
}
export type AuthFlowDeps = {
  create(): Promise<RequestAuth>;
  verifyProvider(token: string): Promise<void>;
  origin(): string | undefined;
};
export function createAuthFlows(deps: AuthFlowDeps) {
  async function credentials(request: Request, signup: boolean) {
    const denied = checkMutationOrigin(request, deps.origin());
    if (denied) return authJson({ success: false, error: 'ORIGIN_OR_CONFIGURATION_REJECTED' }, denied);
    let auth: RequestAuth | undefined;
    try {
      const input = await readCredentials(request, signup);
      auth = await deps.create();
      if (signup) {
        const { error } = await auth.client.auth.signUp({ ...input, options: { emailRedirectTo: `${auth.config.origin}/auth/callback` } });
        if (error) { auth.clear(); return authJson({ success: false, error: 'SIGN_UP_FAILED' }, 400, auth); }
        // Even if email confirmation is disabled remotely, signup never grants a browser session here.
        // Retain only the PKCE verifier for the separately approved email-confirmation flow.
        for (const c of auth.pending()) {
          if (!c.name.includes('-code-verifier')) {
            auth.clear();
            return authJson({ success: false, error: 'EMAIL_CONFIRMATION_REQUIRED' }, 403, auth);
          }
        }
        return authJson({ success: true, providerAuthenticated: false, message: 'If signup is available, check your email to continue in this browser.' }, 200, auth);
      }
      const { data, error } = await auth.client.auth.signInWithPassword(input);
      if (error || !data.session?.access_token) { auth.clear(); return authJson({ success: false, error: 'SIGN_IN_FAILED' }, 401, auth); }
      await deps.verifyProvider(data.session.access_token);
      return authJson({ success: true, providerAuthenticated: true }, 200, auth);
    } catch (error) {
      auth?.clear();
      return authJson({ success: false, error: error instanceof BffError ? error.code : 'AUTH_UNAVAILABLE' }, error instanceof BffError ? error.status : 503, auth);
    }
  }
  return {
    login: (request: Request) => credentials(request, false),
    signup: (request: Request) => credentials(request, true),
    async callback(request: Request) {
      // Never use Host/X-Forwarded-Host or a caller-supplied next URL for redirect authority.
      const origin = deps.origin();
      try {
        if (!origin || new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw new Error();
      } catch { return authJson({ success: false, error: 'AUTH_CONFIG_UNAVAILABLE' }, 503); }
      let auth: RequestAuth | undefined;
      try {
        const url = new URL(request.url);
        const codes = url.searchParams.getAll('code');
        if (codes.length !== 1 || !codes[0] || codes[0].length > 2048 || [...url.searchParams.keys()].some(k => k !== 'code')) throw new BffError('CALLBACK_INVALID', 400);
        auth = await deps.create();
        const { data, error } = await auth.client.auth.exchangeCodeForSession(codes[0]);
        if (error || !data.session?.access_token) throw new BffError('CALLBACK_REJECTED', 401);
        await deps.verifyProvider(data.session.access_token);
        return finishAuth(NextResponse.redirect(new URL('/auth/complete', origin), 303), auth);
      } catch {
        auth?.clear();
        return finishAuth(NextResponse.redirect(new URL('/login?error=auth', origin), 303), auth);
      }
    },
  };
}

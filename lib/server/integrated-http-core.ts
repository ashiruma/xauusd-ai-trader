import { NextResponse } from 'next/server';
import { BffError } from './core';
import { createIntegratedAuth, SESSION_COOKIE, validCapability, LOCKED } from './integrated-auth-core';
import { readCredentials } from './auth-body';
import { requireEmptyMutationBody } from './mutation-body';
import { checkMutationOrigin } from './http-policy';
import { ownsAuthCookie } from './auth-client-core';
export function readSessionCapability(request: Request): string | undefined {
  const entries = (request.headers.get('cookie') ?? '').split(';').map(p => p.trim().split('='));
  const matches = entries.filter(([name]) => name === SESSION_COOKIE);
  if (matches.length !== 1 || matches[0].length !== 2 || !validCapability(matches[0][1])) return undefined;
  return matches[0][1];
}
export function privateResponse(body: object, status = 200) {
  return NextResponse.json(body, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache', Expires: '0',
    Vary: 'Cookie, Authorization', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' } });
}
export function clearLegacy(response: NextResponse, request: Request) {
  for (const pair of (request.headers.get('cookie') ?? '').split(';')) {
    const name = pair.trim().split('=')[0];
    if (ownsAuthCookie(name) || ['__Host-velarion_access','jm_auth_session','velarion_admin_token'].includes(name)) response.cookies.set(name, '', { secure: true, httpOnly: true, sameSite: 'lax', path: '/', maxAge: 0 });
  }
}
const setCap = (r: NextResponse, value: string, maxAge: number) => r.cookies.set(SESSION_COOKIE, value, { secure: true, httpOnly: true, sameSite: 'lax', path: '/', maxAge });
export type IntegratedHttpDeps = {
  runtime(): ReturnType<typeof createIntegratedAuth>;
  origin(): string | undefined;
  rateLimit(scope: string): Promise<void>;
};
export function createIntegratedHttp(deps: IntegratedHttpDeps) {
  const failure = (e: unknown) => privateResponse({ success: false, authenticated: false, bffAuthorized: false, pendingAccess: true, ...LOCKED,
    error: e instanceof BffError ? e.code : 'STAGING_AUTH_UNAVAILABLE' }, e instanceof BffError ? e.status : 503);
  function denied(request: Request) {
    const status = checkMutationOrigin(request, deps.origin() ?? '');
    return status ? privateResponse({ success: false, ...LOCKED, error: 'ORIGIN_OR_CONFIGURATION_REJECTED' }, status) : null;
  }
  function readCapability(request: Request) {
    if (new URL(request.url).search) throw new BffError('UNEXPECTED_READ_INPUT', 400);
    const cap = readSessionCapability(request);
    if (!cap) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
    return cap;
  }
  async function mutate(request: Request, action: (core: ReturnType<typeof createIntegratedAuth>, cap: string) => Promise<object>) {
    const rejection = denied(request); if (rejection) return rejection;
    try {
      await requireEmptyMutationBody(request);
      const cap = readSessionCapability(request);
      if (!cap) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
      await deps.rateLimit(`session:${cap}`);
      return privateResponse(await action(deps.runtime(), cap));
    } catch (e) { return failure(e); }
  }
  return {
    async begin(request: Request) {
      const rejection = denied(request); if (rejection) return rejection;
      let phase: 'RATE_LIMIT_STORAGE' | 'SESSION_VAULT' | undefined;
      try {
        await requireEmptyMutationBody(request);
        phase = 'RATE_LIMIT_STORAGE';
        await deps.rateLimit('begin');
        phase = 'SESSION_VAULT';
        const cap = await deps.runtime().begin();
        const response = privateResponse({ success: true, ...LOCKED });
        clearLegacy(response, request); setCap(response, cap, 8 * 3600);
        return response;
      } catch (e) {
        if (phase && (!(e instanceof BffError) || e.status >= 500)) {
          // Never log the exception, its message/code, or any request/config data.
          const configFailure = e instanceof BffError && [
            'BFF_CONFIG_UNAVAILABLE', 'BFF_CONFIG_INVALID', 'STAGING_RELEASE_NOT_CONFIGURED',
            'AUTH_CONFIG_UNAVAILABLE', 'AUTH_CONFIG_INVALID', 'ADMISSION_VAULT_CONFIG_INVALID',
            'DATABASE_CONFIG_CHANGED',
          ].includes(e.code);
          const category = configFailure ? 'CONFIG_VALIDATION' : phase;
          console.error(`[velarion.auth.begin] ${category}`);
        }
        return failure(e);
      }
    },
    async credentials(request: Request, signup: boolean) {
      const rejection = denied(request); if (rejection) return rejection;
      try {
        if (new URL(request.url).search) throw new BffError('UNEXPECTED_MUTATION_INPUT', 400);
        const input = await readCredentials(request, signup);
        const cap = readSessionCapability(request);
        if (!cap) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
        await deps.rateLimit(`credentials:${input.email.trim().toLowerCase()}`);
        const core = deps.runtime();
        return privateResponse(await (signup ? core.signup(cap, input) : core.login(cap, input)));
      } catch (e) { return failure(e); }
    },
    async callback(request: Request) {
      const origin = deps.origin();
      try { if (!origin || new URL(origin).protocol !== 'https:' || new URL(origin).origin !== origin) throw 0; }
      catch { return failure(new BffError('STAGING_AUTH_UNAVAILABLE', 503)); }
      try {
        const url = new URL(request.url), codes = url.searchParams.getAll('code');
        if (codes.length !== 1 || !codes[0] || codes[0].length > 2048 || [...url.searchParams.keys()].some(k => k !== 'code')) throw new BffError('CALLBACK_INVALID', 400);
        const cap = readSessionCapability(request);
        if (!cap) throw new BffError('PKCE_BROWSER_REQUIRED', 401);
        await deps.rateLimit(`callback:${cap}`);
        await deps.runtime().callback(cap, codes[0]);
        const response = NextResponse.redirect(new URL('/onboarding', origin), 303);
        response.headers.set('Cache-Control', 'private, no-store, max-age=0'); response.headers.set('Referrer-Policy', 'no-referrer');
        return response; // Stable cookie: no delayed callback can overwrite a later handle/token cookie.
      } catch {
        const r = NextResponse.redirect(new URL('/login?error=auth', origin), 303);
        r.headers.set('Cache-Control', 'private, no-store, max-age=0'); r.headers.set('Referrer-Policy', 'no-referrer');
        return r;
      }
    },
    recover: (r: Request) => mutate(r, (c, cap) => c.recover(cap)),
    refresh: (r: Request) => mutate(r, (c, cap) => c.refresh(cap)),
    async session(request: Request) { try { const cap = readCapability(request); return privateResponse(await deps.runtime().session(cap)); } catch (e) { return failure(e); } },
    async progress(request: Request) { try { const cap = readCapability(request); return privateResponse({ success: true, ...await deps.runtime().progress(cap), ...LOCKED }); } catch (e) { return failure(e); } },
    async onboarding(request: Request) { try { const cap = readCapability(request); return privateResponse({ success: true, onboarding: await deps.runtime().onboarding(cap), ...LOCKED }); } catch (e) { return failure(e); } },
    async logout(request: Request, accountWide = false) {
      const rejection = denied(request); if (rejection) return rejection;
      try { await requireEmptyMutationBody(request); } catch (e) { return failure(e); }
      let result: object;
      try { result = await deps.runtime().logout(readSessionCapability(request), accountWide); }
      catch { result = { success: false, dbRevoked: false, providerSignOut: false, browserCleared: true, ...LOCKED }; }
      const response = privateResponse(result, (result as any).success ? 200 : 503);
      clearLegacy(response, request); setCap(response, '', 0);
      return response;
    },
  };
}

import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { BffError } from './core';
import { releaseProfile, STAGING_SUPABASE_URL } from './release-config';
export const STAGING_URL = STAGING_SUPABASE_URL;
export const AUTH_COOKIE = '__Host-velarion-auth';
export type CookieValue = { name: string; value: string; options?: CookieOptions };
export type CookiePort = { getAll(): { name: string; value: string }[]; setAll(values: CookieValue[]): void };
export function validateAuthConfig(env: NodeJS.ProcessEnv = process.env) {
  const profile = releaseProfile(env);
  const url = env.VELARION_SUPABASE_URL;
  const key = env.VELARION_SUPABASE_PUBLISHABLE_KEY;
  const origin = env.VELARION_APP_ORIGIN;
  if (url !== profile.supabaseUrl || !key || !origin) throw new BffError('AUTH_CONFIG_UNAVAILABLE', 503);
  let app: URL;
  try { app = new URL(origin); } catch { throw new BffError('AUTH_CONFIG_INVALID', 503); }
  // Only the selected project's publishable key format; no service-role/secret key.
  if (app.protocol !== 'https:' || app.origin !== origin || app.username || app.password ||
      !/^sb_publishable_[A-Za-z0-9_-]+$/.test(key) || key.length > 4096) throw new BffError('AUTH_CONFIG_INVALID', 503);
  return { url, key, origin };
}
export function safeAuthCookie(options: CookieOptions = {}): CookieOptions {
  const { domain: _domain, ...rest } = options;
  return { ...rest, httpOnly: true, secure: true, sameSite: 'lax', path: '/' };
}
export function ownsAuthCookie(name: string): boolean {
  return name === AUTH_COOKIE || name === `${AUTH_COOKIE}-code-verifier` ||
    new RegExp(`^${AUTH_COOKIE}(?:-code-verifier)?\.\d+$`).test(name);
}
/** Actual SDK adapter; dependencies are injected only through this local function, never an HTTP/test-mode switch. */
export function createRequestAuth(port: CookiePort, env: NodeJS.ProcessEnv = process.env, fetcher: typeof fetch = fetch) {
  const config = validateAuthConfig(env);
  const pending = new Map<string, CookieValue>();
  const cacheHeaders = new Headers({ 'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache', Expires: '0', Vary: 'Cookie, Authorization' });
  const client = createServerClient(config.url, config.key, {
    cookieOptions: { name: AUTH_COOKIE, ...safeAuthCookie() },
    global: { fetch: (input, init) => fetcher(input, { ...init, cache: 'no-store', signal: AbortSignal.timeout(5000) }) },
    cookies: {
      getAll: () => port.getAll().filter(c => ownsAuthCookie(c.name)),
      setAll(values, headers) {
        const safe = values.map(v => ({ ...v, options: safeAuthCookie(v.options) }));
        for (const v of safe) pending.set(v.name, v);
        port.setAll(safe);
        for (const [name, value] of Object.entries(headers ?? {})) cacheHeaders.set(name, value);
      },
    },
  });
  return {
    client, config,
    pending: () => [...pending.values()],
    headers: () => cacheHeaders,
    clear() {
      const names = new Set([AUTH_COOKIE, `${AUTH_COOKIE}-code-verifier`, ...port.getAll().filter(v => ownsAuthCookie(v.name)).map(v => v.name), ...pending.keys()]);
      const values = [...names].map(name => ({ name, value: '', options: safeAuthCookie({ maxAge: 0 }) }));
      for (const v of values) pending.set(v.name, v);
      port.setAll(values);
    },
  };
}
export type RequestAuth = ReturnType<typeof createRequestAuth>;

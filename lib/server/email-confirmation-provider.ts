import { decodeJwt } from 'jose';
import { BffError } from './core';
import { validateAuthConfig } from './auth-client-core';
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const safeToken = (v: unknown): v is string => typeof v === 'string' && v.length > 0 && v.length <= 8192 && /^[A-Za-z0-9._~-]+$/.test(v);
/**
 * Provider tokens exist only inside this server call. No SDK storage, cookie,
 * app admission, refresh, logging or automatic retry is involved.
 * A verify timeout may hide an upstream commit and leave an unreachable session;
 * no token is then available for cleanup. Never claim success in that case.
 */
export async function confirmSignupEmail(input: { email: string; code: string }, env: NodeJS.ProcessEnv = process.env, fetcher: typeof fetch = fetch): Promise<void> {
  const config = validateAuthConfig(env);
  const rejected = () => new BffError('EMAIL_CONFIRMATION_REJECTED', 400);
  const unavailable = () => new BffError('EMAIL_CONFIRMATION_UNAVAILABLE', 503);
  const email = typeof input?.email === 'string' ? input.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || typeof input?.code !== 'string' || !/^[0-9]{6}$/.test(input.code)) throw rejected();
  const request = (path: string, init: RequestInit) => fetcher(`${config.url}/auth/v1/${path}`, {
    ...init, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(5000),
    headers: { apikey: config.key, ...init.headers },
  });
  let response: Response;
  try {
    // Deliberately signup-only. Generic 'email' also accepts recovery/magic-link tokens.
    // The legacy signup type remains supported by current Auth source; never fall back.
    response = await request('verify', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token: input.code, type: 'signup' }) });
  } catch { throw unavailable(); }
  let payload: any;
  try { payload = await response.json(); } catch { throw unavailable(); }
  // Raw Auth HTTP API returns flat AccessTokenResponse; this is NOT the SDK wrapper.
  const access = safeToken(payload?.access_token) ? payload.access_token : undefined;
  let sessionBound = false;
  if (access) {
    try {
      // Token came only from the fixed TLS-authenticated provider, never from the browser.
      // This is a structural guard, not app identity verification or an admission context.
      const claims = decodeJwt(access);
      sessionBound = typeof claims.session_id === 'string' && uuid.test(claims.session_id);
    } catch { /* Never invoke logout with a missing session_id: provider may fall back to global scope. */ }
  }
  let outcome: 'ok' | 'rejected' | 'unavailable' = 'rejected';
  if (response.status !== 200) {
    outcome = response.status >= 500 || response.status === 429 ? 'unavailable' : 'rejected';
  } else if (!access || !sessionBound || !safeToken(payload.refresh_token) || !uuid.test(payload?.user?.id ?? '')) {
    outcome = 'unavailable';
  } else {
    try {
      const online = await request('user', { method: 'GET', headers: { Authorization: `Bearer ${access}` } });
      if (online.status !== 200) outcome = online.status >= 500 ? 'unavailable' : 'rejected';
      else {
        const user = await online.json();
        const confirmed = typeof user?.email_confirmed_at === 'string' ? Date.parse(user.email_confirmed_at) : NaN;
        const ban = user?.banned_until;
        const banClear = ban == null || (typeof ban === 'string' && Number.isFinite(Date.parse(ban)) && Date.parse(ban) <= Date.now());
        outcome = user?.id === payload.user.id && typeof user.email === 'string' && user.email.trim().toLowerCase() === email &&
          Number.isFinite(confirmed) && confirmed <= Date.now() && banClear && user.deleted_at == null && user.is_anonymous === false ? 'ok' : 'rejected';
      }
    } catch { outcome = 'unavailable'; }
  }
  if (access && sessionBound) {
    // Also clean up malformed verify/user results. Only explicit local 204 is success.
    try {
      const cleanup = await request('logout?scope=local', { method: 'POST', headers: { Authorization: `Bearer ${access}` } });
      if (cleanup.status !== 204) throw unavailable();
    } catch { throw unavailable(); }
  } else if (access) {
    // Cannot safely revoke an anomalous session without risking other sessions. Fail closed.
    throw unavailable();
  }
  if (outcome === 'unavailable') throw unavailable();
  if (outcome !== 'ok') throw rejected();
  // The revoked session is deliberately discarded. Only password login may admit.
}

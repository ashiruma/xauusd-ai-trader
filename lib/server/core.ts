import { jwtVerify, type JWTPayload, type JWTVerifyGetKey } from 'jose';
import { createClient } from '@supabase/supabase-js';

export class BffError extends Error {
  constructor(public readonly code: string, public readonly status: number, message = code) {
    super(message);
    this.name = 'BffError';
  }
}

export type BffConfig = {
  supabaseUrl: string;
  publishableKey: string;
  databaseUrl: string;
  appOrigin: string;
};
export type VerifiedContext = {
  issuer: string;
  subject: string;
  sessionId: string;
  issuedAt: number;
  expiresAt: number;
  accessToken: string;
};
export type ProgressDto = {
  coreCompleted: number;
  coreTotal: 30;
  coreGraduated: boolean;
  automationEligible: false;
  earlyMilestone: boolean;
};
export type LiveSessionGuard = (context: VerifiedContext) => Promise<void>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const nowSeconds = () => Math.floor(Date.now() / 1000);
const STAGING_SUPABASE_URL = 'https://akhftbbszejafxpoxiem.supabase.co';
const signedContexts = new WeakSet<object>();
const onlineContexts = new WeakSet<object>();
export function requireSignedContext(context: VerifiedContext): void {
  if (!context || typeof context !== 'object' || !signedContexts.has(context) || context.expiresAt <= nowSeconds()) throw new BffError('UNVERIFIED_AUTH_CONTEXT', 401);
}
export function requireVerifiedContext(context: VerifiedContext): void {
  if (!context || typeof context !== 'object' || !onlineContexts.has(context) || context.expiresAt <= nowSeconds()) {
    throw new BffError('UNVERIFIED_AUTH_CONTEXT', 401);
  }
}


export function validateConfig(env: NodeJS.ProcessEnv = process.env): BffConfig {
  const supabaseUrl = env.VELARION_SUPABASE_URL;
  const publishableKey = env.VELARION_SUPABASE_PUBLISHABLE_KEY;
  const databaseUrl = env.VELARION_BFF_DATABASE_URL;
  const appOrigin = env.VELARION_APP_ORIGIN;
  if (!supabaseUrl || !publishableKey || !databaseUrl || !appOrigin) throw new BffError('BFF_CONFIG_UNAVAILABLE', 503);
  let supabase: URL, app: URL, db: URL;
  try { supabase = new URL(supabaseUrl); app = new URL(appOrigin); db = new URL(databaseUrl); } catch { throw new BffError('BFF_CONFIG_INVALID', 503); }
  if (supabase.origin !== 'https://akhftbbszejafxpoxiem.supabase.co') throw new BffError('BFF_CONFIG_INVALID', 503);
  const runtimeUser = decodeURIComponent(db.username);
  const direct = db.hostname === 'db.akhftbbszejafxpoxiem.supabase.co' && runtimeUser === 'velarion_bff_runtime';
  const pooled = /^[a-z0-9.-]+\.pooler\.supabase\.com$/.test(db.hostname) && runtimeUser === 'velarion_bff_runtime.akhftbbszejafxpoxiem';
  if ((!direct && !pooled) || !/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey)) throw new BffError('BFF_CONFIG_INVALID', 503);
  if (supabase.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/i.test(supabase.hostname) || supabase.username || supabase.password || supabase.port || supabase.pathname !== '/' || supabase.search || supabase.hash || app.protocol !== 'https:' || app.origin !== appOrigin || !['postgres:', 'postgresql:'].includes(db.protocol) || !db.hostname || !db.username || !db.password || db.search || db.hash || ['postgres', 'service_role', 'supabase_admin'].includes(decodeURIComponent(db.username).toLowerCase())) throw new BffError('BFF_CONFIG_INVALID', 503);
  return { supabaseUrl: supabase.origin, publishableKey, databaseUrl, appOrigin };
}

export async function verifyAccessToken(token: string, issuer: string, keyResolver?: JWTVerifyGetKey, now = nowSeconds()): Promise<VerifiedContext> {
  if (typeof token !== 'string' || !token || !issuer) throw new BffError('TOKEN_INVALID', 401);
  let project: URL;
  try { project = new URL(issuer); } catch { throw new BffError('TOKEN_INVALID', 401); }
  if (project.origin !== STAGING_SUPABASE_URL || project.protocol !== 'https:' || project.pathname !== '/' || project.search || project.hash) throw new BffError('TOKEN_INVALID', 401);
  const expectedIssuer = `${project.origin}/auth/v1`;
  let payload: JWTPayload;
  try {
    const resolver = keyResolver ?? (await import('jose')).createRemoteJWKSet(new URL(`${issuer.replace(/\/$/, '')}/auth/v1/.well-known/jwks.json`));
    const result = await jwtVerify(token, resolver, { issuer: expectedIssuer, audience: 'authenticated', algorithms: ['ES256', 'RS256'], clockTolerance: 30, currentDate: new Date(now * 1000) });
    payload = result.payload;
  } catch { throw new BffError('TOKEN_INVALID', 401); }
  if (typeof payload.exp !== 'number' || !Number.isFinite(payload.exp) || !Number.isInteger(payload.exp) || payload.exp < 0 || typeof payload.iat !== 'number' || !Number.isFinite(payload.iat) || !Number.isInteger(payload.iat) || payload.iat < 0 || payload.exp <= now || payload.iat > now + 30 || payload.iat >= payload.exp || payload.exp - payload.iat > 86400 || typeof payload.sub !== 'string' || !UUID.test(payload.sub) || typeof payload.session_id !== 'string' || !UUID.test(payload.session_id) || payload.role !== 'authenticated' || payload.is_anonymous !== false) throw new BffError('TOKEN_INVALID', 401);
  const context = Object.freeze({ issuer: expectedIssuer, subject: payload.sub, sessionId: payload.session_id, issuedAt: payload.iat, expiresAt: payload.exp, accessToken: token });
  signedContexts.add(context);
  return context;
}

export async function checkCurrentUser(context: VerifiedContext, config: Pick<BffConfig, 'supabaseUrl' | 'publishableKey'>, fetcher: typeof fetch = fetch): Promise<void> {
  if (!context || typeof context !== 'object' || !signedContexts.has(context) || config.supabaseUrl !== STAGING_SUPABASE_URL) throw new BffError('UNVERIFIED_AUTH_CONTEXT', 401);
  const boundedFetch: typeof fetch = (input, init = {}) => fetcher(input, { ...init, cache: 'no-store', signal: AbortSignal.timeout(5000) });
  const client = createClient(config.supabaseUrl, config.publishableKey, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false, storage: undefined }, global: { fetch: boundedFetch } });
  let result: any;
  try { result = await client.auth.getUser(context.accessToken); } catch { throw new BffError('AUTH_USER_UNAVAILABLE', 503); }
  if (result?.error) { const status = Number(result.error.status ?? result.error.statusCode); throw new BffError(status >= 500 || status === 0 ? 'AUTH_USER_UNAVAILABLE' : 'AUTH_USER_REJECTED', status >= 500 || status === 0 ? 503 : 401); }
  if (!result?.data?.user) throw new BffError('AUTH_USER_REJECTED', 401);
  const user = result.data.user;
  const confirmedAt = typeof user.email_confirmed_at === 'string' ? Date.parse(user.email_confirmed_at) : NaN;
  const confirmed = Number.isFinite(confirmedAt) && confirmedAt <= Date.now();
  const emailValid = typeof user.email === 'string' && user.email.trim().length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email.trim());
  const banValid = user.banned_until == null || (typeof user.banned_until === 'string' && Number.isFinite(Date.parse(user.banned_until)) && Date.parse(user.banned_until) <= Date.now());
  if (user.id !== context.subject || !UUID.test(String(user.id)) || !confirmed || !emailValid || !banValid || user.deleted_at != null || user.is_anonymous !== false) throw new BffError('AUTH_USER_REJECTED', 401);
  onlineContexts.add(context);
}

export async function establishContext(token: string, config: BffConfig, guard: LiveSessionGuard, fetcher: typeof fetch = fetch, keyResolver?: JWTVerifyGetKey): Promise<VerifiedContext> {
  const context = await verifyAccessToken(token, config.supabaseUrl, keyResolver);
  await checkCurrentUser(context, config, fetcher);
  await guard(context);
  return context;
}

export function validateProgress(row: unknown): ProgressDto {
  const value: any = row;
  if (!value || typeof value !== 'object' || Array.isArray(value) || !Number.isInteger(value.coreCompleted) || value.coreCompleted < 0 || value.coreCompleted > 30 || value.coreTotal !== 30 || value.coreGraduated !== (value.coreCompleted === 30) || value.automationEligible !== false || typeof value.earlyMilestone !== 'boolean') throw new BffError('PROGRESS_INVALID', 502);
  return { coreCompleted: value.coreCompleted, coreTotal: 30, coreGraduated: value.coreGraduated, automationEligible: false, earlyMilestone: value.earlyMilestone };
}

import { randomBytes, randomUUID } from 'node:crypto';
import { BffError, requireVerifiedContext, validateProgress, type VerifiedContext } from './core';
import type { FreshProvider, ProviderTokens } from './integrated-provider';
import type { AdmissionDatabase } from './admission-db';
import { validateOnboarding } from './onboarding-contract';
export const SESSION_COOKIE = '__Host-velarion-session';
export const LOCKED = { connected: false, courseDeliveryEnabled: false, automationEligible: false, tradingEnabled: false } as const;
export const newCapability = () => randomBytes(32).toString('hex');
export const validCapability = (s: unknown): s is string => typeof s === 'string' && /^[a-f0-9]{64}$/.test(s);
export type VaultInput = { revision?: number; state: string; expiresAt: number; [key: string]: unknown };
export type VaultRecord = VaultInput & { revision: number };
export type VaultPort = {
  create(capability: string, record: VaultInput): Promise<VaultRecord>;
  read(capability: string): Promise<VaultRecord | null>;
  cas(capability: string, revision: number, record: VaultInput): Promise<VaultRecord>;
  remove(capability: string): Promise<unknown>;
};
type Identity = Pick<VerifiedContext, 'issuer' | 'subject' | 'sessionId' | 'issuedAt' | 'expiresAt'>;
const identity = (c: VerifiedContext): Identity => ({ issuer: c.issuer, subject: c.subject, sessionId: c.sessionId, issuedAt: c.issuedAt, expiresAt: c.expiresAt });
const sameIdentity = (a: any, b: VerifiedContext) => a?.issuer === b.issuer && a.subject === b.subject && a.sessionId === b.sessionId;
const decimal = (x: unknown) => typeof x === 'string' && /^(0|[1-9][0-9]*)$/.test(x);
export type IntegratedDeps = { provider: FreshProvider; vault: VaultPort; db: AdmissionDatabase; clock?: () => number };
/** Concrete runtime uses only server-owned adapters. HTTP input never supplies a token, handle, UUID or proof. */
export function createIntegratedAuth({ provider, vault, db, clock = Date.now }: IntegratedDeps) {
  async function load(cap: string | undefined) {
    if (!validCapability(cap)) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
    const r = await vault.read(cap);
    if (!r || r.expiresAt <= clock()) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
    return r;
  }
  const save = (cap: string, r: VaultRecord, patch: Record<string, unknown>) => vault.cas(cap, r.revision, { ...r, ...patch });
  async function verify(token: unknown) {
    if (typeof token !== 'string' || !token) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
    const c = await provider.verify(token);
    requireVerifiedContext(c);
    if (c.accessToken !== token) throw new BffError('TOKEN_CONTEXT_MISMATCH', 401);
    return c;
  }
  function metadata(result: any, attemptId: unknown) {
    if (!result || result.attemptId !== attemptId || !decimal(result.generation) ||
        typeof result.expiresAt !== 'string' || !Number.isFinite(Date.parse(result.expiresAt)) || Date.parse(result.expiresAt) <= clock()) throw new BffError('ADMISSION_RESPONSE_INVALID', 502);
    return result as { attemptId: string; generation: string; expiresAt: string };
  }
  async function exchange(cap: string, expected: string, exchangeFresh: (r: VaultRecord) => Promise<ProviderTokens>) {
    let r = await load(cap);
    if (r.state !== expected) throw new BffError('FRESH_LOGIN_REQUIRED', 409);
    r = await save(cap, r, { state: 'fencing', attemptId: randomUUID(), attemptSecret: newCapability() });
    // A database fence must commit before a password or unknown-subject PKCE exchange.
    const fence: any = await db.begin(r.attemptId as string, r.attemptSecret as string);
    if (fence?.attemptId !== r.attemptId || !decimal(fence.fence) || !Number.isFinite(Date.parse(fence.expiresAt)) || Date.parse(fence.expiresAt) <= clock()) throw new BffError('ADMISSION_FENCE_UNAVAILABLE', 503);
    r = await save(cap, r, { state: 'exchanging', attemptExpiresAt: Date.parse(fence.expiresAt) });
    const tokens = await exchangeFresh(r); // Never retried, refreshed or reconstructed from browser claims.
    const c = await verify(tokens.accessToken);
    r = await save(cap, r, { ...tokens, identity: identity(c), storage: null, state: 'admitting',
      handle: newCapability(), recoverySecret: newCapability(), recoveryUntil: clock() + 120000, expiresAt: clock() + 8 * 3600000 });
    try {
      const m = metadata(await db.admit(r.attemptId as string, r.attemptSecret as string, c, r.handle as string, r.recoverySecret as string), r.attemptId);
      await save(cap, r, { state: 'complete', appExpiresAt: Date.parse(m.expiresAt), generation: m.generation, expiresAt: Date.parse(m.expiresAt) });
      return { success: true, providerAuthenticated: true, pendingAccess: false, bffAuthorized: true, ...LOCKED };
    } catch {
      // Includes denied enrollment AND ambiguous commit. Do not repeat admission or grant access.
      // Exact recover_admission is available only from the original encrypted receipt/browser.
      return { success: true, providerAuthenticated: true, pendingAccess: true, bffAuthorized: false, admissionUnconfirmed: true, ...LOCKED };
    }
  }
  return {
    async begin() {
      const cap = newCapability();
      await vault.create(cap, { state: 'new', expiresAt: clock() + 15 * 60000 });
      return cap;
    },
    async signup(cap: string, input: { email: string; password: string }) {
      let r = await load(cap);
      if (r.state !== 'new') throw new BffError('FRESH_LOGIN_REQUIRED', 409);
      r = await save(cap, r, { state: 'signing-up' });
      await provider.signup(input);
      // No original-browser proof or provider session is retained for confirmation.
      await save(cap, r, { state: 'awaiting-email', storage: null });
      return { success: true, providerAuthenticated: false, pendingAccess: true, message: 'If signup is available, enter the code from your email on the confirmation page in any browser. Then sign in with your Velarion password.', ...LOCKED };
    },
    login: (cap: string, input: { email: string; password: string }) => exchange(cap, 'new', () => provider.login(input)),
    async callback(_cap: string, _code: string): Promise<never> { throw new BffError('PASSWORD_SIGN_IN_REQUIRED', 401); },
    async recover(cap: string) {
      const r = await load(cap);
      if (!['admitting', 'complete'].includes(r.state) || typeof r.recoveryUntil !== 'number' || r.recoveryUntil <= clock()) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
      const c = await verify(r.accessToken);
      if (!sameIdentity(r.identity, c)) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
      // Recovery cannot INSERT or rebind. Even completed receipts are revalidated against SQL.
      const m = metadata(await db.recover(r.attemptId as string, r.attemptSecret as string, c, r.handle as string, r.recoverySecret as string), r.attemptId);
      await save(cap, r, { state: 'complete', appExpiresAt: Date.parse(m.expiresAt), generation: m.generation, expiresAt: Date.parse(m.expiresAt) });
      return { success: true, authenticated: true, pendingAccess: false, bffAuthorized: true, ...LOCKED };
    },
    async session(cap: string | undefined) {
      const r = await load(cap);
      const c = await verify(r.accessToken);
      if (!sameIdentity(r.identity, c)) throw new BffError('FRESH_LOGIN_REQUIRED', 401);
      if (r.state !== 'complete') return { success: true, authenticated: true, providerAuthenticated: true, bffAuthorized: false, pendingAccess: true, accessState: 'pending-access', ...LOCKED };
      if (await db.check(r.handle as string, c) !== true) throw new BffError('SESSION_REJECTED', 401);
      return { success: true, authenticated: true, providerAuthenticated: true, bffAuthorized: true, pendingAccess: true, accessState: 'onboarding', ...LOCKED };
    },
    async context(cap: string | undefined) {
      const r = await load(cap);
      if (r.state !== 'complete') throw new BffError('ACCESS_PENDING', 403);
      const c = await verify(r.accessToken);
      if (!sameIdentity(r.identity, c) || await db.check(r.handle as string, c) !== true) throw new BffError('SESSION_REJECTED', 401);
      return { context: c, handle: r.handle as string };
    },
    async progress(cap: string | undefined) {
      const r = await load(cap);
      if (r.state !== 'complete') throw new BffError('ACCESS_PENDING', 403);
      const c = await verify(r.accessToken);
      if (!sameIdentity(r.identity, c)) throw new BffError('SESSION_REJECTED', 401);
      // The progress RPC checks handle+generation atomically in its own transaction.
      return validateProgress(await db.progress(r.handle as string, c));
    },
    async onboarding(cap: string | undefined) {
      const r = await load(cap);
      const c = await verify(r.accessToken);
      if (!sameIdentity(r.identity, c)) throw new BffError('SESSION_REJECTED', 401);
      if (r.state !== 'complete') return { accessState: 'pending-access', identityApprovalRequired: true, ...LOCKED };
      return validateOnboarding(await db.onboarding(r.handle as string, c));
    },
    async refresh(cap: string) {
      let r = await load(cap);
      if (r.state !== 'complete') throw new BffError('FRESH_LOGIN_REQUIRED', 401);
      const old = await verify(r.accessToken);
      if (!sameIdentity(r.identity, old) || await db.check(r.handle as string, old) !== true) throw new BffError('SESSION_REJECTED', 401);
      r = await save(cap, r, { state: 'refreshing' });
      // Stable browser capability and handle: refresh sends NO Set-Cookie, so delayed responses cannot roll cookies back.
      // Ambiguous refresh requires fresh login; it can never create/repair an app binding.
      const t = await provider.refresh(r.refreshToken as string);
      const c = await verify(t.accessToken);
      if (!sameIdentity(r.identity, c) || await db.check(r.handle as string, c) !== true) throw new BffError('SESSION_REJECTED', 401);
      await save(cap, r, { ...t, identity: identity(c), state: 'complete' });
      return { success: true, ...LOCKED };
    },
    async logout(cap: string | undefined, accountWide = false) {
      let dbRevoked = false, providerSignOut = false;
      try {
        let r = await load(cap);
        const c = await verify(r.accessToken);
        if (!sameIdentity(r.identity, c)) throw new BffError('SESSION_REJECTED', 401);
        if (r.state === 'complete') {
          r = await save(cap!, r, { state: 'revoking', operationId: randomUUID(), operationSecret: newCapability() });
          const result: any = await (accountWide ? db.revokeAccount : db.revokeCurrent)(r.handle as string, c, r.operationId as string, r.operationSecret as string);
          dbRevoked = result?.requestId === r.operationId && result.scope === (accountWide ? 'account' : 'local') && result.revoked === true && decimal(result.generation);
        }
        // Pending provider-only state has no confirmed app revocation; do not claim otherwise.
        if (dbRevoked) providerSignOut = await provider.signOut(c.accessToken, accountWide ? 'global' : 'local');
      } catch { /* Independent durable/provider outcomes, never a false success. */ }
      // Deleting the vault denies this browser even if a remote revocation failed. Does not assert remote success.
      if (validCapability(cap)) await vault.remove(cap).catch(() => {});
      return { success: dbRevoked && providerSignOut, dbRevoked, providerSignOut, browserCleared: true,
        providerScope: accountWide ? 'global' : 'local', ...LOCKED };
    },
  };
}

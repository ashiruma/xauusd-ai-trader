import { BffError, requireSignedContext, requireVerifiedContext, type VerifiedContext } from './core';
import type { SqlTag } from './db-core';

export type IdentityDto = { created: boolean; learnerState: 'suspended' | 'active' };
export type RevocationDto = { scope: 'current' | 'account'; revoked: true; revokedAt: string };
type Query = (operation: 'checkSession' | 'provisionLearner' | 'revokeCurrentSession' | 'revokeAccountSessions', context: VerifiedContext) => Promise<unknown>;
export type IdentityAdapters = {
  verifyToken(token: string): Promise<VerifiedContext>;
  checkUser(context: VerifiedContext): Promise<void>;
  query: Query;
};

/** Compile-time fixed query statements; callers cannot supply SQL or function identifiers. */
export function queryIdentity(sql: SqlTag, operation: Parameters<Query>[0], context: VerifiedContext): Promise<unknown> {
  requireVerifiedContext(context);
  const issuer = context.issuer;
  const subject = context.subject;
  const sessionId = context.sessionId;
  const issuedAt = new Date(context.issuedAt * 1000);
  switch (operation) {
    case 'checkSession': return sql`SELECT velarion_api.check_auth_session(${issuer}, ${subject}::uuid, ${sessionId}::uuid, ${issuedAt}::timestamptz, ${new Date(context.expiresAt * 1000)}::timestamptz) AS result`;
    case 'provisionLearner': throw new BffError('PROVISIONING_NOT_APPROVED', 403);
    case 'revokeCurrentSession': return sql`SELECT velarion_api.revoke_current_session(${issuer}, ${subject}::uuid, ${sessionId}::uuid, ${issuedAt}::timestamptz, ${new Date(context.expiresAt * 1000)}::timestamptz) AS result`;
    case 'revokeAccountSessions': return sql`SELECT velarion_api.revoke_account_sessions(${issuer}, ${subject}::uuid, ${sessionId}::uuid, ${issuedAt}::timestamptz, ${new Date(context.expiresAt * 1000)}::timestamptz) AS result`;
  }
}

function scalarResult(value: unknown): unknown {
  if (!Array.isArray(value) || value.length !== 1 || !value[0] || typeof value[0] !== 'object') throw new BffError('IDENTITY_RESPONSE_INVALID', 502);
  const row = value[0] as Record<string, unknown>;
  if (Object.keys(row).length !== 1 || !('result' in row)) throw new BffError('IDENTITY_RESPONSE_INVALID', 502);
  return row.result;
}
function identityDto(raw: unknown): IdentityDto {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new BffError('IDENTITY_RESPONSE_INVALID', 502);
  const v = raw as Record<string, unknown>;
  if (Object.keys(v).length !== 2 || (v.created === true && v.learnerState !== 'suspended') || typeof v.created !== 'boolean' || !['suspended', 'active'].includes(String(v.learnerState))) throw new BffError('IDENTITY_RESPONSE_INVALID', 502);
  return { created: v.created, learnerState: v.learnerState as IdentityDto['learnerState'] };
}
function revocationDto(raw: unknown, scope: RevocationDto['scope']): RevocationDto {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new BffError('IDENTITY_RESPONSE_INVALID', 502);
  const v = raw as Record<string, unknown>;
  if (Object.keys(v).length !== 3 || v.scope !== scope || v.revoked !== true || typeof v.revokedAt !== 'string' || !Number.isFinite(Date.parse(v.revokedAt))) throw new BffError('IDENTITY_RESPONSE_INVALID', 502);
  return { scope, revoked: true, revokedAt: v.revokedAt };
}

/** Pure orchestration; injected adapters make token and SQL boundaries independently testable. */
export function createIdentityServices(adapters: IdentityAdapters) {
  async function verifiedBase(token: string): Promise<VerifiedContext> {
    if (typeof token !== 'string' || token.length === 0) throw new BffError('TOKEN_INVALID', 401);
    const context = await adapters.verifyToken(token);
    requireSignedContext(context);
    await adapters.checkUser(context);
    requireVerifiedContext(context);
    return context;
  }
  return {
    async checkSession(token: string): Promise<void> {
      const c = await verifiedBase(token);
      const result = scalarResult(await adapters.query('checkSession', c));
      if (result !== true) throw new BffError('SESSION_REJECTED', 401);
    },
    async provisionLearner(_token: string): Promise<IdentityDto> {
      throw new BffError('PROVISIONING_NOT_APPROVED', 403);
    },
    async revokeCurrentSession(token: string): Promise<RevocationDto> {
      return revocationDto(scalarResult(await adapters.query('revokeCurrentSession', await verifiedBase(token))), 'current');
    },
    async revokeAccountSessions(token: string): Promise<RevocationDto> {
      return revocationDto(scalarResult(await adapters.query('revokeAccountSessions', await verifiedBase(token))), 'account');
    },
    /** For a context established only through verify-token, online-user, then check-session. */
    async assertLiveSession(context: VerifiedContext): Promise<void> {
      requireVerifiedContext(context);
      const result = scalarResult(await adapters.query('checkSession', context));
      if (result !== true) throw new BffError('SESSION_REJECTED', 401);
    },
  };
}

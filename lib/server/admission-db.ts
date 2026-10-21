import type postgres from 'postgres';
import { BffError, requireVerifiedContext, type VerifiedContext } from './core';
import type { SqlTag } from './db-core';
import { withServerlessDatabase } from './serverless-database';

export type AdmissionDatabase = {
  begin(attemptId: string, attemptSecret: string): Promise<unknown>;
  admit(attemptId: string, attemptSecret: string, context: VerifiedContext, handle: string, recoverySecret: string): Promise<unknown>;
  recover(attemptId: string, attemptSecret: string, context: VerifiedContext, handle: string, recoverySecret: string): Promise<unknown>;
  check(handle: string, context: VerifiedContext): Promise<unknown>;
  rotate(handle: string, context: VerifiedContext, requestId: string, newHandle: string, recoverySecret: string): Promise<unknown>;
  revokeCurrent(handle: string, context: VerifiedContext, requestId: string, recoverySecret: string): Promise<unknown>;
  revokeAccount(handle: string, context: VerifiedContext, requestId: string, recoverySecret: string): Promise<unknown>;
  progress(handle: string, context: VerifiedContext): Promise<unknown>;
  onboarding(handle: string, context: VerifiedContext): Promise<unknown>;
};
export type AdmissionDatabaseOptions = { env?: NodeJS.ProcessEnv; connect?: typeof postgres };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SECRET = /^[0-9a-f]{64}$/;
function validId(value: string): string { if (typeof value !== 'string' || !UUID.test(value)) throw new BffError('ADMISSION_INPUT_INVALID', 400); return value; }
function validSecret(value: string): string { if (typeof value !== 'string' || !SECRET.test(value)) throw new BffError('ADMISSION_INPUT_INVALID', 400); return value; }
function validHandle(value: string): string { return validSecret(value); }
function firstColumn(rows: unknown): unknown {
  if (!Array.isArray(rows) || rows.length !== 1 || !rows[0] || typeof rows[0] !== 'object' || Array.isArray(rows[0])) throw new BffError('ADMISSION_RESPONSE_INVALID', 502);
  const keys = Object.keys(rows[0] as object);
  if (keys.length !== 1) throw new BffError('ADMISSION_RESPONSE_INVALID', 502);
  return (rows[0] as Record<string, unknown>)[keys[0]];
}
function contextArgs(context: VerifiedContext) {
  requireVerifiedContext(context);
  return { issuer: context.issuer, subject: context.subject, session: context.sessionId, iat: new Date(context.issuedAt * 1000), exp: new Date(context.expiresAt * 1000) };
}

/** Fixed statements only: all untrusted values are postgres-tag interpolations. */
export function createAdmissionQueries(sql: SqlTag): AdmissionDatabase {
  const ctx = (c: VerifiedContext) => contextArgs(c);
  return {
    async begin(attemptId, attemptSecret) { validId(attemptId); validSecret(attemptSecret); return firstColumn(await sql`SELECT velarion_api.begin_session_admission(${attemptId}::uuid, ${attemptSecret}) AS result`); },
    async admit(attemptId, attemptSecret, context, handle, recoverySecret) { validId(attemptId); validSecret(attemptSecret); validHandle(handle); validSecret(recoverySecret); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.admit_session(${attemptId}::uuid, ${attemptSecret}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz, ${handle}, ${recoverySecret}) AS result`); },
    async recover(attemptId, attemptSecret, context, handle, recoverySecret) { validId(attemptId); validSecret(attemptSecret); validHandle(handle); validSecret(recoverySecret); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.recover_admission(${attemptId}::uuid, ${attemptSecret}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz, ${handle}, ${recoverySecret}) AS result`); },
    async check(handle, context) { validHandle(handle); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.check_auth_session(${handle}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz) AS result`); },
    async rotate(handle, context, requestId, newHandle, recoverySecret) { validHandle(handle); validId(requestId); validHandle(newHandle); validSecret(recoverySecret); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.rotate_session(${handle}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz, ${requestId}::uuid, ${newHandle}, ${recoverySecret}) AS result`); },
    async revokeCurrent(handle, context, requestId, recoverySecret) { validHandle(handle); validId(requestId); validSecret(recoverySecret); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.revoke_current_session(${handle}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz, ${requestId}::uuid, ${recoverySecret}) AS result`); },
    async revokeAccount(handle, context, requestId, recoverySecret) { validHandle(handle); validId(requestId); validSecret(recoverySecret); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.revoke_account_sessions(${handle}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz, ${requestId}::uuid, ${recoverySecret}) AS result`); },
    async progress(handle, context) { validHandle(handle); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.read_core_progress(${handle}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz, ${'velarion-forex'}, ${'core-1.extensions-0'}) AS progress`); },
    async onboarding(handle, context) { validHandle(handle); const c=ctx(context); return firstColumn(await sql`SELECT velarion_api.read_onboarding_status(${handle}, ${c.issuer}, ${c.subject}::uuid, ${c.session}::uuid, ${c.iat}::timestamptz, ${c.exp}::timestamptz) AS onboarding`); },
  };
}

/** Independent committed calls on a bounded warm pool; no automatic operation retry. */
export async function withAdmissionDatabase<T>(work: (db: AdmissionDatabase) => Promise<T>, options: AdmissionDatabaseOptions = {}): Promise<T> {
  return withServerlessDatabase(sql => work(createAdmissionQueries(sql)), options);
}

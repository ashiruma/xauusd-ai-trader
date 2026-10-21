import { requireVerifiedContext, type VerifiedContext } from './core';

export type SqlTag = (strings: TemplateStringsArray, ...values: unknown[]) => Promise<unknown[]>;

/** Execute the fixed, parameterized progress RPC and preserve the single returned column. */
export function queryCoreProgress(sql: SqlTag, context: VerifiedContext) {
  requireVerifiedContext(context);
  return sql`SELECT velarion_api.read_core_progress(${context.issuer}, ${context.subject}::uuid, ${context.sessionId}::uuid, ${new Date(context.issuedAt * 1000)}::timestamptz, ${new Date(context.expiresAt * 1000)}::timestamptz, ${'velarion-forex'}, ${'core-1.extensions-0'}) AS progress`;
}

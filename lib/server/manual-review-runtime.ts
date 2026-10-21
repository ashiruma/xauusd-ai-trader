import 'server-only';
import { notFound } from 'next/navigation';
import { BffError, requireVerifiedContext } from './core';
import { integratedRuntime, stagingRuntimeConfig, currentCapability } from './integrated-runtime';
import { readSessionCapability } from './integrated-http-core';
import { withServerlessDatabase } from './serverless-database';
import { createReviewHttp, reviewConfigured, projectReviewResponse, type ReviewOperation, type Submission, type Decision } from './manual-review-core';
export function manualReviewEnabled() {
  return reviewConfigured(process.env);
}
async function execute(operation: ReviewOperation, payload: Submission | Decision | Record<string, never>, capability: string | undefined) {
  if (!manualReviewEnabled()) throw new BffError('MANUAL_REVIEW_NOT_CONFIGURED', 503);
  stagingRuntimeConfig();
  const { context: c, handle } = await integratedRuntime().context(capability);
  requireVerifiedContext(c);
  return withServerlessDatabase(async sql => {
    const rows = await sql`SELECT velarion_review.workflow(${handle}, ${c.issuer}, ${c.subject}::uuid, ${c.sessionId}::uuid, ${new Date(c.issuedAt * 1000)}::timestamptz, ${new Date(c.expiresAt * 1000)}::timestamptz, ${operation}, ${JSON.stringify(payload)}::jsonb) AS result`;
    if (!Array.isArray(rows) || rows.length !== 1 || !rows[0] || typeof rows[0] !== 'object' || !('result' in rows[0])) throw new BffError('MANUAL_REVIEW_RESPONSE_INVALID', 502);
    return (rows[0] as { result: unknown }).result;
  });
}
export const manualReviewHttp = createReviewHttp({ enabled: manualReviewEnabled, origin: () => process.env.VELARION_APP_ORIGIN,
  execute: (operation, payload, request) => execute(operation, payload, readSessionCapability(request)) });
/** The old URL is retained for structure compatibility, not used as authorization. */
export async function requireReviewAdminPage(): Promise<void> {
  try { projectReviewResponse(await execute('admin_queue', {}, await currentCapability()), 'admin_queue'); } catch { notFound(); }
}

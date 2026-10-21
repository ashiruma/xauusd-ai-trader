import { BffError } from './core';
import { checkMutationOrigin } from './http-policy';
export const REVIEW_LOCKED = { connected: false, courseDeliveryEnabled: false, automationEligible: false, tradingEnabled: false } as const;
export function reviewConfigured(env: Record<string, string | undefined>): boolean { return env.VELARION_MANUAL_REVIEW_ENABLED === 'true' && env.VELARION_MANUAL_REVIEW_SCHEMA === 'manual-broker-review-v1'; }
export type ReviewOperation = 'self_read' | 'self_submit' | 'admin_queue' | 'admin_decide';
export type Submission = { stage: 'demo' | 'live'; brokerEmail: string; mt5Id: string; server: string; evidenceReference: string };
export type Decision = { reviewId: string; expectedRevision: number; decision: 'verified' | 'needs_evidence' | 'rejected' | 'revoked'; note: string; evidenceReference: string; ownershipConfirmed: boolean; attributionConfirmed: boolean; depositUsdCents: number | null };
const fail = (): never => { throw new BffError('REVIEW_INPUT_INVALID', 400); };
function record(v: unknown): Record<string, unknown> { if (!v || typeof v !== 'object' || Array.isArray(v)) return fail(); return v as Record<string, unknown>; }
function exact(v: Record<string, unknown>, keys: string[]) { if (Object.keys(v).length !== keys.length || keys.some(k => !Object.hasOwn(v, k))) fail(); }
function text(v: unknown, min: number, max: number): string { if (typeof v !== 'string') return fail(); const s = v.trim(); if (s.length < min || s.length > max || /[\x00-\x1f\x7f]/.test(s)) return fail(); return s; }
export function normalizeMt5Id(v: unknown): string { const s = text(v, 1, 20); if (!/^[0-9]+$/.test(s)) return fail(); return s; }
function reference(v: unknown): string { const s = text(v, 1, 120); if (!/^[A-Za-z0-9][A-Za-z0-9._:/-]*$/.test(s) || s.includes('://')) return fail(); return s; }
export function parseSubmission(value: unknown): Submission {
  const v = record(value); exact(v, ['stage', 'brokerEmail', 'mt5Id', 'server', 'evidenceReference']);
  if (v.stage !== 'demo' && v.stage !== 'live') return fail();
  const brokerEmail = text(v.brokerEmail, 3, 254).toLowerCase(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brokerEmail)) return fail();
  return { stage: v.stage, brokerEmail, mt5Id: normalizeMt5Id(v.mt5Id), server: text(v.server, 1, 100), evidenceReference: reference(v.evidenceReference) };
}
export function parseDecision(value: unknown): Decision {
  const v = record(value); exact(v, ['reviewId','expectedRevision','decision','note','evidenceReference','ownershipConfirmed','attributionConfirmed','depositUsdCents']);
  const reviewId = text(v.reviewId, 36, 36); if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(reviewId)) return fail();
  if (!Number.isSafeInteger(v.expectedRevision) || Number(v.expectedRevision) < 0 || !['verified','needs_evidence','rejected','revoked'].includes(String(v.decision)) || typeof v.ownershipConfirmed !== 'boolean' || typeof v.attributionConfirmed !== 'boolean') return fail();
  if (v.depositUsdCents !== null && (!Number.isSafeInteger(v.depositUsdCents) || Number(v.depositUsdCents) < 0 || Number(v.depositUsdCents) > 100000000000)) return fail();
  if (v.decision === 'verified' && (!v.ownershipConfirmed || !v.attributionConfirmed)) return fail();
  return { reviewId, expectedRevision: Number(v.expectedRevision), decision: v.decision as Decision['decision'], note: text(v.note, 8, 1000), evidenceReference: reference(v.evidenceReference), ownershipConfirmed: v.ownershipConfirmed, attributionConfirmed: v.attributionConfirmed, depositUsdCents: v.depositUsdCents as number | null };
}
export type ReviewDeps = {
  enabled(): boolean;
  origin(): string | undefined;
  execute(operation: ReviewOperation, payload: Submission | Decision | Record<string, never>, request: Request): Promise<unknown>;
};
/** Strip unexpected SQL columns and keep internal reviewer information out of self-service DTOs. */
export function projectReviewResponse(value: unknown, operation: ReviewOperation): object {
  const bad = (): never => { throw new BffError('MANUAL_REVIEW_RESPONSE_INVALID', 502); };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return bad();
  const v = value as Record<string, unknown>;
  if (operation === 'admin_decide') { if (v.success !== true) return bad(); return { success: true }; }
  const admin = operation === 'admin_queue', key = admin ? 'items' : 'submissions';
  const source = v[key]; if (!Array.isArray(source) || source.length > 100) return bad();
  const items = source.map(raw => {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return bad();
    const r = raw as Record<string, unknown>; const result: Record<string, unknown> = {};
    for (const field of ['id','stage','brokerEmail','mt5Id','server','referralCode','submittedAt','evidenceReference','status']) { if (typeof r[field] !== 'string' || (r[field] as string).length > 254) return bad(); result[field] = r[field]; }
    if (!['demo','live'].includes(String(r.stage)) || !['submitted','verified','needs_evidence','rejected','revoked'].includes(String(r.status)) || !Number.isInteger(r.revision) || Number(r.revision) < 1) return bad();
    result.revision = r.revision;
    if (admin) {
      for (const field of ['ownerSubject','ownerIssuer']) if (typeof r[field] === 'string') result[field] = r[field];
      if (r.latestNote !== null && r.latestNote !== undefined && typeof r.latestNote !== 'string') return bad();
      result.latestNote = r.latestNote ?? null;
      if (!Array.isArray(r.history) || r.history.length > 100) return bad();
      result.history = r.history.map(entry => {
        if (!entry || typeof entry !== 'object' || Array.isArray(entry)) return bad();
        const h: Record<string, unknown> = {};
        for (const field of ['decision','note','reviewerSubject','decidedAt','evidenceReference']) { const value = (entry as Record<string, unknown>)[field]; if (typeof value !== 'string' || value.length > 1000) return bad(); h[field] = value; }
        return h;
      });
    }
    return result;
  });
  if (admin) return { items, hasMore: v.hasMore === true };
  if (!v.eligibility || typeof v.eligibility !== 'object' || Array.isArray(v.eligibility)) return bad();
  const e = v.eligibility as Record<string, unknown>; const eligibility: Record<string, boolean> = {};
  for (const key of ['demoVerified','liveVerified','checkpointSatisfied']) { if (typeof e[key] !== 'boolean') return bad(); eligibility[key] = e[key]; }
  if (eligibility.checkpointSatisfied !== (eligibility.demoVerified && eligibility.liveVerified)) return bad();
  return { submissions: items, eligibility };
}
function response(body: object, status = 200) { return Response.json(body, { status, headers: { 'Cache-Control': 'private, no-store, max-age=0', Pragma: 'no-cache', Vary: 'Cookie, Authorization', 'Referrer-Policy': 'no-referrer', 'X-Content-Type-Options': 'nosniff' } }); }
async function readBody(request: Request) {
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') throw new BffError('REVIEW_JSON_REQUIRED', 415);
  // Bound the stream, not merely the caller-controlled Content-Length header.
  const reader = request.body?.getReader(); if (!reader) return fail(); let size = 0; const chunks: Uint8Array[] = [];
  try { for (;;) { const { done, value } = await reader.read(); if (done) break; size += value.length; if (size > 4096) { await reader.cancel(); throw new BffError('REVIEW_BODY_TOO_LARGE', 413); } chunks.push(value); } }
  finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes)); } catch { return fail(); }
}
export function createReviewHttp(deps: ReviewDeps) {
  return async (request: Request, operation: ReviewOperation) => {
    try {
      if (!deps.enabled()) throw new BffError('MANUAL_REVIEW_NOT_CONFIGURED', 503);
      if (new URL(request.url).search) return fail();
      const mutation = operation === 'self_submit' || operation === 'admin_decide';
      if (request.method !== (mutation ? 'POST' : 'GET')) throw new BffError('REVIEW_METHOD_REJECTED', 405);
      let payload: Submission | Decision | Record<string, never> = {};
      if (mutation) {
        const denied = checkMutationOrigin(request, deps.origin()); if (denied) throw new BffError('REVIEW_ORIGIN_REJECTED', denied);
        const body = await readBody(request); payload = operation === 'self_submit' ? parseSubmission(body) : parseDecision(body);
      }
      const raw = projectReviewResponse(await deps.execute(operation, payload, request), operation);
      // Release/activation flags are never supplied by clients or inferred from verification.
      return response({ ...raw, ...REVIEW_LOCKED });
    } catch (e) {
      return response({ success: false, ...REVIEW_LOCKED, error: e instanceof BffError ? e.code : 'MANUAL_REVIEW_UNAVAILABLE' }, e instanceof BffError ? e.status : 503);
    }
  };
}

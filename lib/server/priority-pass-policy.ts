import { requireVerifiedContext, type VerifiedContext } from './core';

export const STAGING_ISSUER = 'https://akhftbbszejafxpoxiem.supabase.co/auth/v1' as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export type PriorityException = Readonly<{ issuer: typeof STAGING_ISSUER; subject: string; expiresAt: number }>;
// Unknown Auth UUIDs must not be replaced with email-based authority or dummy UUIDs.
export const STAGING_PRIORITY_REGISTRY: readonly PriorityException[] = Object.freeze([]);

export type AuthoritativeSnapshot = Readonly<{
  status: 'active' | 'suspended' | 'revoked';
  lessonIds: readonly number[];
  justMarketsReferral: boolean;
  justMarketsDeposit: boolean;
  accountLinkedAndOwnershipVerified: boolean;
  automationConsent: boolean;
  tradingActivated: boolean;
  // Adapter must validate exact account/worker/consent binding, not compare a magic phrase.
  exactWorkerAcknowledgementVerified: boolean;
}>;
export type PolicyResult = Readonly<{
  exceptionMatched: boolean;
  referralPrerequisiteMet: boolean;
  depositPrerequisiteMet: boolean;
  studyPrerequisitesMet: boolean;
  coursePrerequisiteMet: boolean;
  accountLinkingPrerequisiteMet: boolean;
  consentPrerequisiteMet: boolean;
  activationPrerequisiteMet: boolean;
  activationPrerequisitesMet: boolean;
  coreCompleted: number;
  coreTotal: 30;
  coreGraduated: boolean;
  courseDeliveryEnabled: false;
  automationEligible: false;
  tradingEnabled: false;
}>;
export type PolicyDependencies = Readonly<{
  // Server-only trusted adapters; neither may consume request-supplied eligibility claims.
  // Future operation adapters must perform session + policy + action atomically in SQL.
  checkAppSession: (context: VerifiedContext) => Promise<void>;
  readAuthoritativeSnapshot: (context: VerifiedContext) => Promise<unknown>;
}>;

function validSnapshot(value: unknown): AuthoritativeSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('PRIORITY_SNAPSHOT_INVALID');
  const s = value as Record<string, unknown>;
  const keys = ['status','lessonIds','justMarketsReferral','justMarketsDeposit','accountLinkedAndOwnershipVerified','automationConsent','tradingActivated','exactWorkerAcknowledgementVerified'];
  if (Object.keys(s).length !== keys.length || keys.some(k => !Object.hasOwn(s, k)) ||
      !['active','suspended','revoked'].some(v => s.status === v) || !Array.isArray(s.lessonIds) ||
      keys.slice(2).some(k => typeof s[k] !== 'boolean')) throw new Error('PRIORITY_SNAPSHOT_INVALID');
  if (s.lessonIds.length > 30 || s.lessonIds.some(id => !Number.isInteger(id) || id < 1 || id > 30) || new Set(s.lessonIds).size !== s.lessonIds.length ||
      Array.from({length:s.lessonIds.length},(_,i) => i).some(i => !Object.hasOwn(s.lessonIds as number[],i))) throw new Error('PRIORITY_SNAPSHOT_INVALID');
  // Copy trusted adapter results to avoid mutable references crossing async boundaries.
  return Object.freeze({ ...s, lessonIds: Object.freeze([...s.lessonIds]) }) as AuthoritativeSnapshot;
}

function evaluate(context: VerifiedContext, deps: PolicyDependencies, registry: readonly PriorityException[]): Promise<PolicyResult> {
  requireVerifiedContext(context);
  if (context.issuer !== STAGING_ISSUER || !UUID.test(context.subject)) throw new Error('PRIORITY_IDENTITY_INVALID');
  if (!deps || typeof deps.checkAppSession !== 'function' || typeof deps.readAuthoritativeSnapshot !== 'function') throw new Error('PRIORITY_ADAPTER_UNAVAILABLE');
  return (async () => {
    await deps.checkAppSession(context);
    requireVerifiedContext(context);
    const snapshot = validSnapshot(await deps.readAuthoritativeSnapshot(context));
    requireVerifiedContext(context);
    if (snapshot.status !== 'active') throw new Error(snapshot.status === 'revoked' ? 'PRIORITY_REVOKED' : 'PRIORITY_SUSPENDED');
    const now = Date.now() / 1000;
    const match = registry.some(entry => entry.issuer === STAGING_ISSUER && context.issuer === entry.issuer &&
      entry.subject === context.subject && UUID.test(entry.subject) && Number.isFinite(entry.expiresAt) && entry.expiresAt > now);
    const referral = snapshot.justMarketsReferral || match;
    const deposit = snapshot.justMarketsDeposit || match;
    const graduated = snapshot.lessonIds.length === 30;
    const course = graduated || match;
    const activation = snapshot.tradingActivated && snapshot.exactWorkerAcknowledgementVerified;
    return Object.freeze({
      exceptionMatched: match,
      referralPrerequisiteMet: referral, depositPrerequisiteMet: deposit,
      studyPrerequisitesMet: referral && deposit, coursePrerequisiteMet: course,
      accountLinkingPrerequisiteMet: snapshot.accountLinkedAndOwnershipVerified,
      consentPrerequisiteMet: snapshot.automationConsent, activationPrerequisiteMet: activation,
      activationPrerequisitesMet: referral && deposit && course && snapshot.accountLinkedAndOwnershipVerified && snapshot.automationConsent && activation,
      coreCompleted: snapshot.lessonIds.length, coreTotal: 30 as const, coreGraduated: graduated,
      courseDeliveryEnabled: false as const, automationEligible: false as const, tradingEnabled: false as const,
    });
  })();
}

export function evaluatePriorityPassPolicy(context: VerifiedContext, deps: PolicyDependencies): Promise<PolicyResult> {
  return evaluate(context, deps, STAGING_PRIORITY_REGISTRY);
}

/** Synthetic testing only. Not an activation/configuration API; never route or import into runtime adapters. */
export function __testOnlyCreatePriorityPolicy(registry: readonly PriorityException[]) {
  if (process.env.NODE_ENV !== 'test') throw new Error('PRIORITY_TEST_FACTORY_UNAVAILABLE');
  const fixed = Object.freeze(registry.map(entry => Object.freeze({ ...entry })));
  return (context: VerifiedContext, deps: PolicyDependencies) => evaluate(context, deps, fixed);
}

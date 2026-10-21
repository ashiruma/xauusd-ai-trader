import { BffError } from './core';
export type GateStatus = 'pending' | 'complete' | 'waived';
export type OnboardingStatus = {
  gates: { gate: 'referral' | 'deposit' | 'core_completion'; status: GateStatus }[];
  progress: { coreCompleted: number; coreTotal: 30 };
  linking: 'pending'; consent: 'pending'; activation: 'pending';
  deliveryEnabled: false; automationEligible: false; tradingEligible: false; eligibilitySatisfied: boolean;
};
/** Project only known fields. Never expose identity IDs or let a malformed DB DTO enable an operation. */
export function validateOnboarding(value: unknown): OnboardingStatus {
  const v = value as any;
  const fail = (): never => { throw new BffError('ONBOARDING_RESPONSE_INVALID', 502); };
  if (!v || typeof v !== 'object' || Array.isArray(v) || !Array.isArray(v.gates) || v.gates.length !== 3 ||
      v.linking !== 'pending' || v.consent !== 'pending' || v.activation !== 'pending' ||
      v.deliveryEnabled !== false || v.automationEligible !== false || v.tradingEligible !== false || typeof v.eligibilitySatisfied !== 'boolean' ||
      !v.progress || !Number.isInteger(v.progress.coreCompleted) || v.progress.coreCompleted < 0 || v.progress.coreCompleted > 30 || v.progress.coreTotal !== 30) return fail();
  const expected = ['referral', 'deposit', 'core_completion'];
  const gates = v.gates.map((g: any, i: number) => {
    if (!g || g.gate !== expected[i] || !['pending', 'complete', 'waived'].includes(g.status) || Object.keys(g).length !== 2) return fail();
    return { gate: g.gate, status: g.status };
  });
  if (gates[2].status === 'complete' !== (v.progress.coreCompleted === 30) ||
      v.eligibilitySatisfied !== gates.every((g: any) => g.status !== 'pending')) return fail();
  return { gates, progress: { coreCompleted: v.progress.coreCompleted, coreTotal: 30 },
    linking: 'pending', consent: 'pending', activation: 'pending',
    deliveryEnabled: false, automationEligible: false, tradingEligible: false, eligibilitySatisfied: v.eligibilitySatisfied };
}

// Immutable preparation policy: no environment switch enables these capabilities.
export const RELEASE_POLICY = Object.freeze({
  connected: false,
  courseDeliveryEnabled: false,
  automationEligible: false,
  tradingEnabled: false,
  coreTotal: 30,
  courseId: 'velarion-forex',
  releaseVersion: 'core-1.extensions-0',
});
export const RELEASE_GATES = [
  ['justmarkets_eligibility', 'Verified current JustMarkets eligibility'],
  ['school_all_30', 'All 30 School lessons, authoritatively completed'],
  ['broker_ownership', 'Independently verified broker ownership'],
  ['automation_consent', 'Explicit automation consent'],
  ['worker_acknowledgement', 'Exact worker acknowledgement'],
] as const;
export const BFF_ACCESS_COOKIE = '__Host-velarion_access';

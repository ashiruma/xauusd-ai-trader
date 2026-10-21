// Deliberately fixed to the currently owned deployment; do not infer a domain from env.
export const SITE_ORIGIN = 'https://velarion-one.vercel.app';

// Public information pages only. Lesson bodies and member workflows are not sitemap targets.
export const PUBLIC_ROUTES = [
  '/', '/how-it-works', '/school-preview', '/risk-and-performance',
  '/why-gold', '/strategies', '/academy', '/tools/growth-calculator', '/onboarding',
  '/legal/terms', '/legal/risk-disclosure', '/legal/ib-disclosure',
  '/legal/privacy', '/legal/complaints',
] as const;

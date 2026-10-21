import Link from 'next/link';
import { currentSession, currentOnboarding } from '@/lib/server/integrated-runtime';
import StagingSessionActions from '@/components/StagingSessionActions';
import type { OnboardingStatus } from '@/lib/server/onboarding-contract';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export default async function Onboarding() {
  let authenticated = false, admitted = false, status: OnboardingStatus | null = null;
  try {
    const session = await currentSession();
    authenticated = session.authenticated === true; admitted = session.bffAuthorized === true;
    const snapshot = await currentOnboarding();
    if ('gates' in snapshot) status = snapshot;
  } catch { /* No cached/provider-only fallback, and no internal diagnostics in page output. */ }
  return <main style={{ maxWidth: 760, margin: '4rem auto', padding: 24 }}>
    <span className="status-badge">STAGING · ACCESS PENDING</span>
    <h1>{authenticated ? 'Signed in — access pending' : 'Sign in is not yet available'}</h1>
    <p>{authenticated ? admitted ? 'Your current identity and application session were verified. Onboarding is still gated.' : 'Your confirmed provider identity was checked online. Application access is not yet approved or its admission could not be confirmed.' : 'No authenticated application access could be established. Staging configuration or a fresh sign-in is required.'}</p>
    <ol>
      <li>Independently approved issuer, subject UUID and learner identity — {admitted ? 'application session admitted' : 'pending'}</li>
      <li>Authoritative JustMarkets referral and deposit verification — required for clients</li>
      <li>All 30 lessons completed through server-verified assessments — required for clients</li>
      <li>Broker account linked with independently verified ownership — required for everyone</li>
      <li>Separate explicit automation consent — required for everyone</li>
      <li>Separate trading activation and exact worker acknowledgement — required for everyone</li>
    </ol>
    <p>The two approved admin priority passes require separately approved, verified Auth UUIDs; no pass is authorized by email. A pass waives referral, deposit and all-30 completion requirements only. It never creates course completions or grants a general administrator role.</p>
    {status && <section><h2>Authoritative onboarding status</h2><ul>{status.gates.map(g => <li key={g.gate}>{g.gate.replaceAll('_', ' ')} — {g.status}</li>)}</ul><p>Authoritative lesson completion: {status.progress.coreCompleted} / 30.</p></section>}
    <p>Protected lessons and assessments remain server-disabled. Broker linking, automation consent, activation and all live trading operations are unavailable in this review release.</p>
    <Link href="/login" prefetch={false}>Sign-in options</Link>{' · '}<Link href="/academy">Curriculum summaries only</Link>
    {authenticated && <StagingSessionActions />}
  </main>;
}

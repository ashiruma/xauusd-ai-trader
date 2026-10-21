import Link from 'next/link';
import { currentSession, currentOnboarding } from '@/lib/server/integrated-runtime';
import StagingSessionActions from '@/components/StagingSessionActions';
import ManualBrokerReview from '@/components/ManualBrokerReview';
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
      <li>Authoritative JustMarkets referral and deposit verification — required for clients. Planned checkpoint: after lesson 5, a live MT5 trading account ID and trustworthy evidence of at least USD 50 deposited; no broker passwords. This is distinct from completing all 30 lessons.</li>
      <li>All 30 lessons completed through server-verified assessments — required for clients</li>
      <li>Broker account linked with independently verified ownership — required for everyone</li>
      <li>Separate explicit automation consent — required for everyone</li>
      <li>Separate trading activation and exact worker acknowledgement — required for everyone</li>
    </ol>
    <p>The intended journey starts with registration through this website’s <a href="https://one.justmarkets.link/a/tohstb0d83" target="_blank" rel="noopener noreferrer sponsored">JustMarkets referral link</a> (alphanumeric referral code <code>tohstb0d83</code>) and a demo MT5 account. The demo trading account ID is mandatory for planned verification; use the broker-associated email and a separate Velarion password. Referral code and numeric MT5 ID are distinct. An ID or email alone is not ownership or referral evidence. The five-lesson checkpoint is not graduation; all 30 lessons remain required. Current server gates remain unchanged.</p>
    <p>Velarion access is 100% free conditional on partner-link registration and verified attribution. Broker fees, deposits and market losses remain your responsibility. <Link href="/legal/ib-disclosure">IB compensation creates a conflict</Link>; no earnings are guaranteed, and Kenya regulatory review remains required before launch.</p>
    <p>The two approved admin priority passes require separately approved, verified Auth UUIDs; no pass is authorized by email. A pass waives referral, deposit and all-30 completion requirements only. It never creates course completions or grants a general administrator role.</p>
    {status && <section><h2>Authoritative onboarding status</h2><ul>{status.gates.map(g => <li key={g.gate}>{g.gate.replaceAll('_', ' ')} — {g.status}</li>)}</ul><p>Authoritative lesson completion: {status.progress.coreCompleted} / 30.</p></section>}
    <p>Protected lessons and assessments remain server-disabled. Broker linking, automation consent, activation and all live trading operations are unavailable in this review release. A manual review form appears only if its authenticated review service confirms it is configured; otherwise submission remains unavailable. Review does not activate lessons or trading.</p>
    <ManualBrokerReview />
    <Link href="/login" prefetch={false}>Sign-in options</Link>{' · '}<Link href="/academy">Curriculum summaries only</Link>
    {authenticated && <StagingSessionActions />}
  </main>;
}

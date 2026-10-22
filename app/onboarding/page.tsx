import Link from 'next/link';
import { currentSession, currentOnboarding } from '@/lib/server/integrated-runtime';
import StagingSessionActions from '@/components/StagingSessionActions';
import ManualBrokerReview from '@/components/ManualBrokerReview';
import type { OnboardingStatus } from '@/lib/server/onboarding-contract';
import styles from './onboarding.module.css';
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
  return <main className={styles.page}>
    <header className={styles.hero}>
      <div className={styles.eyebrow}>VELARION MARKETS <span aria-hidden="true">/</span> ONBOARDING</div>
      <span className={styles.badge}><span aria-hidden="true" className={styles.statusDot} />STAGING · ACCESS PENDING</span>
      <h1>{authenticated ? 'Signed in — access pending' : 'Sign in is not yet available'}</h1>
      <p className={styles.intro}>{authenticated ? admitted ? 'Your current identity and application session were verified. Onboarding is still gated.' : 'Your confirmed provider identity was checked online. Application access is not yet approved or its admission could not be confirmed.' : 'No authenticated application access could be established. Staging configuration or a fresh sign-in is required.'}</p>
    </header>

    <div className={styles.layout}>
      <div className={styles.primaryColumn}>
        <section className={styles.nextStep} aria-labelledby="next-step-title">
          <div className={styles.eyebrow}>NEXT STEP</div>
          <h2 id="next-step-title">{admitted ? 'Review your onboarding requirements' : 'Confirm application access'}</h2>
          <p>{admitted ? 'Application admission does not complete the remaining onboarding gates. Check the requirements and secure review availability below.' : 'Application admission is the first required gate. Use the sign-in options or, when signed in, the session controls below; no permission is assumed.'}</p>
          <div className={styles.actions}>
            {admitted ? <a className={styles.primaryAction} href="#onboarding-requirements">View requirements <span aria-hidden="true">↗</span></a> : <Link className={styles.primaryAction} href="/login" prefetch={false}>Sign-in options <span aria-hidden="true">↗</span></Link>}
            <Link className={styles.secondaryAction} href="/academy">Curriculum summaries only <span aria-hidden="true">↗</span></Link>
          </div>
        </section>

        <section className={styles.releaseNotice} aria-labelledby="release-title">
          <h2 id="release-title">Not enabled in this review release</h2>
          <p>Protected lessons and assessments remain server-disabled. Broker linking, automation consent, activation and all live trading operations are unavailable in this review release. A manual review form appears only if its authenticated review service confirms it is configured; otherwise submission remains unavailable. Review does not activate lessons or trading.</p>
        </section>

        {status && <section className={styles.card} aria-labelledby="authoritative-title"><div className={styles.eyebrow}>SERVER-REPORTED</div><h2 id="authoritative-title">Authoritative onboarding status</h2><ul className={styles.statusList}>{status.gates.map(g => <li key={g.gate}><span>{g.gate.replaceAll('_', ' ')}</span><strong>{g.status}</strong></li>)}</ul><p>Authoritative lesson completion: {status.progress.coreCompleted} / 30.</p></section>}

        <div className={styles.review}><ManualBrokerReview /></div>
      </div>

      <aside className={styles.requirements} aria-labelledby="onboarding-requirements">
        <div className={styles.eyebrow}>ACCESS REQUIREMENTS</div>
        <h2 id="onboarding-requirements">Every gate matters.</h2>
        <p className={styles.requirementsIntro}>Signing in is not approval. Each requirement remains separate.</p>
        <ol className={styles.gates}>
          <li><span className={styles.gateNumber} aria-hidden="true">01</span><div><h3>Application identity</h3><p>Independently approved issuer, subject UUID and learner identity — {admitted ? 'application session admitted' : 'pending'}</p></div></li>
          <li><span className={styles.gateNumber} aria-hidden="true">02</span><div><h3>Referral &amp; deposit</h3><p>Authoritative JustMarkets referral and deposit verification — required for clients. Planned checkpoint: after lesson 5, a live MT5 trading account ID and trustworthy evidence of at least USD 50 deposited; no broker passwords. This is distinct from completing all 30 lessons.</p></div></li>
          <li><span className={styles.gateNumber} aria-hidden="true">03</span><div><h3>Course completion</h3><p>All 30 lessons completed through server-verified assessments — required for clients</p></div></li>
          <li><span className={styles.gateNumber} aria-hidden="true">04</span><div><h3>Account ownership</h3><p>Broker account linked with independently verified ownership — required for everyone</p></div></li>
          <li><span className={styles.gateNumber} aria-hidden="true">05</span><div><h3>Automation consent</h3><p>Separate explicit automation consent — required for everyone</p></div></li>
          <li><span className={styles.gateNumber} aria-hidden="true">06</span><div><h3>Trading activation</h3><p>Separate trading activation and exact worker acknowledgement — required for everyone</p></div></li>
        </ol>
      </aside>
    </div>

    <section className={styles.journey} aria-labelledby="journey-title">
      <div><div className={styles.eyebrow}>BEFORE YOU CONTINUE</div><h2 id="journey-title">Registration &amp; verification</h2></div>
      <p>The intended journey starts with registration through this website’s <a href="https://one.justmarkets.link/a/tohstb0d83" target="_blank" rel="noopener noreferrer sponsored">JustMarkets referral link</a> (alphanumeric referral code <code>tohstb0d83</code>) and a demo MT5 account. The demo trading account ID is mandatory for planned verification; use the broker-associated email and a separate Velarion password. Referral code and numeric MT5 ID are distinct. An ID or email alone is not ownership or referral evidence. The five-lesson checkpoint is not graduation; all 30 lessons remain required. Current server gates remain unchanged.</p>
    </section>

    <section className={styles.disclosures} aria-label="Access terms and disclosures">
      <div className={styles.card}><h2>Access terms &amp; risk</h2><p>Velarion access is 100% free conditional on partner-link registration and verified attribution. Broker fees, deposits and market losses remain your responsibility. <Link href="/legal/ib-disclosure">IB compensation creates a conflict</Link>; no earnings are guaranteed, and Kenya regulatory review remains required before launch.</p></div>
      <div className={styles.card}><h2>Admin priority passes</h2><p>The two approved admin priority passes require separately approved, verified Auth UUIDs; no pass is authorized by email. A pass waives referral, deposit and all-30 completion requirements only. It never creates course completions or grants a general administrator role.</p></div>
    </section>
    {authenticated && <div className={styles.session}><div className={styles.sessionHeading}><div className={styles.eyebrow}>ACCOUNT SUPPORT</div><h2>Session controls</h2></div><StagingSessionActions /></div>}
    {admitted && <div className={styles.bottomLink}><Link href="/login" prefetch={false}>Sign-in options</Link></div>}
  </main>;
}

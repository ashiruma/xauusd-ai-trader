import React from 'react';
import Link from 'next/link';
import { RELEASE_GATES } from '@/lib/release-policy';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
export default function ConnectionPending({ title = 'Staging connection pending' }: { title?: string }) {
  return <main style={{ maxWidth: 820, margin: '48px auto', padding: '0 24px' }}>
    <span className="status-badge">NOT CONNECTED</span>
    <h1>{title}</h1>
    <p>Velarion’s staging sign-in can establish identity only when separately configured.
      Broker linking, lesson delivery, assessments and trading remain unavailable in this release.</p>
    <p>This is restricted pending access, not confirmation of a broker signup or a temporary rate-limit error. In the planned journey, <a href={DEFAULT_PARTNER_CONFIG.primaryLink} target="_blank" rel="noopener noreferrer sponsored">register through the JustMarkets link</a>, create a demo MT5 account there, then return with its mandatory trading account ID, the same email and a separate Velarion password. Never provide broker passwords. ID submission and broker verification remain unavailable here.</p>
    <p>Planned course progression: five lessons, then verified live-account ownership, referral attribution and at least USD 50 deposited before lessons 6–30; all 30 lessons remain required to graduate. This is not active enforcement. An ID, email, old session, browser progress or administrator access cannot complete these gates.</p>
    <p>Velarion access is 100% free conditional on registration through this website’s JustMarkets link and verified referral attribution. Broker fees, deposits and losses remain yours. IB compensation creates a conflict; <Link href="/legal/ib-disclosure">read the disclosure</Link>. No earnings are guaranteed. Kenya regulatory review remains required before launch.</p>
    <ol>{RELEASE_GATES.map(([id, label]) => <li key={id}>{label} — locked</li>)}</ol>
    <p>Completing School does not authorize trading. Broker ownership, consent and worker acknowledgement are separate requirements.</p>
    <Link href="/academy">View curriculum summaries</Link> · <Link href="/">Return home</Link>
  </main>;
}

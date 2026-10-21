import React from 'react';
import Link from 'next/link';
import { RELEASE_GATES } from '@/lib/release-policy';
export default function ConnectionPending({ title = 'Staging connection pending' }: { title?: string }) {
  return <main style={{ maxWidth: 820, margin: '48px auto', padding: '0 24px' }}>
    <span className="status-badge">NOT CONNECTED</span>
    <h1>{title}</h1>
    <p>Velarion’s staging sign-in can establish identity only when separately configured.
      Broker linking, lesson delivery, assessments and trading remain unavailable in this release.</p>
    <p>A broker account number, an old session, browser progress or administrator access cannot complete these gates.</p>
    <ol>{RELEASE_GATES.map(([id, label]) => <li key={id}>{label} — locked</li>)}</ol>
    <p>Completing School does not authorize trading. Broker ownership, consent and worker acknowledgement are separate requirements.</p>
    <Link href="/academy">View curriculum summaries</Link> · <Link href="/">Return home</Link>
  </main>;
}

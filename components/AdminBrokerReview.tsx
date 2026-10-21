'use client';

import { useCallback, useEffect, useState } from 'react';

type HistoryEntry = { decision?: string; note?: string; reviewerSubject?: string; decidedAt?: string; evidenceReference?: string };
type ReviewItem = { id: string; ownerSubject?: string; ownerIssuer?: string; stage: 'demo' | 'live'; brokerEmail: string; mt5Id: string; server: string; referralCode: string; status: 'submitted' | 'verified' | 'needs_evidence' | 'rejected' | 'revoked'; revision: number; submittedAt: string; evidenceReference: string; latestNote?: string; history?: HistoryEntry[] };
type Payload = { items: ReviewItem[]; locked?: boolean; hasMore?: boolean };
const panel: React.CSSProperties = { border: '1px solid rgba(211,174,96,.3)', borderRadius: 12, padding: 20, margin: '18px 0', background: 'rgba(14,19,27,.72)' };
const decisions = ['verified', 'needs_evidence', 'rejected', 'revoked'] as const;

export default function AdminBrokerReview() {
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, { decision: typeof decisions[number]; note: string; evidenceReference: string; ownershipConfirmed: boolean; attributionConfirmed: boolean; depositUsd: string }>>({});
  const load = useCallback(async () => {
    try { const r = await fetch('/api/admin/reviews', { credentials: 'same-origin', cache: 'no-store' }); if (!r.ok) throw new Error('Authorized review queue unavailable.'); const d = await r.json() as Payload; if (!Array.isArray(d.items) || d.locked) throw new Error('Review workflow is locked or not configured.'); setItems(d.items); setHasMore(d.hasMore === true); setError(''); }
    catch { setItems(null); setError('The secure review queue is unavailable or unauthorized. No records are displayed from a local/mock source.'); }
  }, []);
  useEffect(() => { void load(); }, [load]);
  const draftFor = (item: ReviewItem) => drafts[item.id] ?? { decision: 'needs_evidence' as const, note: '', evidenceReference: '', ownershipConfirmed: false, attributionConfirmed: false, depositUsd: '' };
  const save = async (item: ReviewItem) => {
    const d = draftFor(item); setBusy(item.id); setError('');
    const dollars = d.depositUsd.trim();
    const parts = dollars.split('.');
    const depositUsdCents = !dollars ? null : /^\d+(\.\d{1,2})?$/.test(dollars) ? Number(parts[0]) * 100 + Number((parts[1] ?? '').padEnd(2, '0')) : NaN;
    if (d.note.trim().length < 8 || d.evidenceReference.trim().length < 1 || (depositUsdCents !== null && !Number.isSafeInteger(depositUsdCents)) || (d.decision === 'verified' && (!d.ownershipConfirmed || !d.attributionConfirmed)) || (item.stage === 'live' && d.decision === 'verified' && (depositUsdCents === null || depositUsdCents < 5000))) { setError('Add a meaningful reviewer note and opaque source reference. Verification requires independent ownership and attribution confirmation; live verification also requires at least $50.00 deposited cash, in exact cents (not balance, bonus, credit, or profit).'); setBusy(null); return; }
    try { const r = await fetch('/api/admin/reviews/decision', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ reviewId: item.id, expectedRevision: item.revision, decision: d.decision, note: d.note, evidenceReference: d.evidenceReference, ownershipConfirmed: d.ownershipConfirmed, attributionConfirmed: d.attributionConfirmed, depositUsdCents }) }); const body = await r.json().catch(() => ({})); if (!r.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Decision was not saved.'); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Decision was not saved.'); }
    finally { setBusy(null); }
  };
  return <section aria-labelledby="admin-review-title">
    <h1 id="admin-review-title">Manual broker review</h1>
    <p>Review only. Decisions record evidence; they do not create users, activate lessons, permit trading, link an execution account, or grant automation consent. Verify ownership and referral attribution from independent, trustworthy broker evidence—an ID, email, or applicant-supplied screenshot alone is insufficient.</p>
    <p>For live-stage verification, confirm separately that at least USD 50 cash was deposited; balance, bonus, credit and profit do not qualify. This five-lesson checkpoint is distinct from completion of all 30 lessons. Never request broker passwords, PINs, or one-time codes.</p>
    {hasMore && <p role="status">Only the newest 100 records are shown. Older reviews need the separately approved pagination or review-export workflow; this is not a complete queue.</p>}
    {items === null ? <p role="status">{error || 'Loading authorized queue…'}</p> : items.length === 0 ? <p>No review items in the authorized queue.</p> : items.map(item => {
      const d = draftFor(item); const update = (patch: Partial<typeof d>) => setDrafts(prev => ({ ...prev, [item.id]: { ...d, ...patch } }));
      return <article key={item.id} style={panel}>
        <h2>{item.stage === 'demo' ? 'Demo' : 'Live'} review · {item.status}</h2>
        {item.ownerSubject && <p>Immutable applicant: <code>{item.ownerSubject}</code> · {item.ownerIssuer}</p>}
        <dl><dt>Broker-associated email</dt><dd>{item.brokerEmail}</dd><dt>MT5 ID (string)</dt><dd>{item.mt5Id}</dd><dt>Server</dt><dd>{item.server}</dd><dt>Referral code</dt><dd>{item.referralCode}</dd><dt>Applicant evidence reference</dt><dd>{item.evidenceReference}</dd><dt>Submitted</dt><dd>{item.submittedAt}</dd><dt>Revision</dt><dd>{item.revision}</dd></dl>
        <label>Decision<select value={d.decision} onChange={e => update({ decision: e.target.value as typeof d.decision })}>{decisions.map(x => <option key={x} value={x}>{x.replace('_', ' ')}</option>)}</select></label>
        <label style={{ display: 'block' }}>Reviewer note (required)<textarea value={d.note} onChange={e => update({ note: e.target.value })} rows={3} /></label>
        <label style={{ display: 'block' }}>Independent evidence ticket/reference (opaque; no URL or document)<input value={d.evidenceReference} onChange={e => update({ evidenceReference: e.target.value })} /></label>
        <label style={{ display: 'block' }}><input type="checkbox" checked={d.ownershipConfirmed} onChange={e => update({ ownershipConfirmed: e.target.checked })} /> Ownership independently confirmed from source evidence</label>
        <label style={{ display: 'block' }}><input type="checkbox" checked={d.attributionConfirmed} onChange={e => update({ attributionConfirmed: e.target.checked })} /> Current partner attribution independently confirmed</label>
        {item.stage === 'live' && <label style={{ display: 'block' }}>Qualifying cash deposited (USD; not balance/bonus/credit/profit)<input type="number" min="0" step="0.01" value={d.depositUsd} onChange={e => update({ depositUsd: e.target.value })} /></label>}
        <button type="button" disabled={busy === item.id} onClick={() => void save(item)}>{busy === item.id ? 'Saving…' : 'Record review decision'}</button>
        {item.latestNote && <p>Latest reviewer note: {item.latestNote}</p>}
        {item.history?.length ? <details><summary>Review history</summary><ol>{item.history.map((entry, i) => <li key={`${entry.decidedAt ?? ''}-${i}`}>{entry.decidedAt ?? 'Time unavailable'} · {entry.reviewerSubject ?? 'Reviewer'} · {entry.decision}: {entry.note ?? 'No note'}{entry.evidenceReference ? ` · evidence ref ${entry.evidenceReference}` : ''}</li>)}</ol></details> : null}
      </article>;
    })}
    {error && <p role="alert">{error}</p>}<button type="button" onClick={() => void load()}>Refresh queue</button>
  </section>;
}

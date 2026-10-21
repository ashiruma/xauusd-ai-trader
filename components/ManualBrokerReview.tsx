'use client';

import { useEffect, useState } from 'react';

type ReviewItem = { id: string; stage: 'demo' | 'live'; brokerEmail: string; mt5Id: string; server: string; referralCode: string; status: string; revision: number; submittedAt: string; evidenceReference: string; latestNote?: string };
type SelfResponse = { submissions: ReviewItem[]; eligibility: { demoVerified: boolean; liveVerified: boolean; checkpointSatisfied: boolean }; locked?: boolean };

const box: React.CSSProperties = { border: '1px solid rgba(211,174,96,.35)', borderRadius: 12, padding: 20, marginTop: 24, background: 'rgba(14,19,27,.72)' };

export default function ManualBrokerReview() {
  const [data, setData] = useState<SelfResponse | null>(null);
  const [available, setAvailable] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ stage: 'demo' as 'demo' | 'live', brokerEmail: '', mt5Id: '', server: '', evidenceReference: '' });
  const load = async () => {
    try {
      const response = await fetch('/api/onboarding/review', { credentials: 'same-origin', cache: 'no-store' });
      if (!response.ok) throw new Error('Review service is unavailable or access is not authorized.');
      const body = await response.json() as SelfResponse;
      if (!Array.isArray(body.submissions) || !body.eligibility || body.locked) throw new Error('Review workflow is not enabled.');
      setData(body); setAvailable(true); setError('');
    } catch { setAvailable(false); setData(null); setError('Secure broker review is currently unavailable. The status of any earlier submission cannot be confirmed here; do not assume it failed or resubmit automatically.'); }
  };
  useEffect(() => { void load(); }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const response = await fetch('/api/onboarding/review', { method: 'POST', credentials: 'same-origin', headers: { 'content-type': 'application/json' }, body: JSON.stringify(form) });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(typeof body.error === 'string' ? body.error : 'Submission could not be completed.');
      setForm({ ...form, mt5Id: '', evidenceReference: '' }); await load();
    } catch (e) { setError(e instanceof Error ? e.message : 'Submission could not be completed.'); }
    finally { setBusy(false); }
  };
  return <section style={box} aria-labelledby="broker-review-heading">
    <h2 id="broker-review-heading">Manual broker review</h2>
    <p>Review submissions are separate from your Velarion password. Enter the MT5 trading account ID as a numeric string and the broker server exactly as shown by the broker. Never enter a broker password, PIN, one-time code, or upload a statement or screenshot.</p>
    <p>Evidence reference means an opaque internal case/ticket reference only—not a URL or document. Do not include account credentials or full documents.</p>
    {!available ? <p role="status">{error || 'Checking whether secure review is enabled…'} The form stays unavailable unless the authenticated review service confirms it is configured.</p> : <>
      <p>Eligibility: demo review {data?.eligibility.demoVerified ? 'verified' : 'not verified'}; live review {data?.eligibility.liveVerified ? 'verified' : 'not verified'}; five-lesson funding checkpoint {data?.eligibility.checkpointSatisfied ? 'satisfied' : 'not satisfied'}. This is not graduation or permission to trade.</p>
      <form onSubmit={submit} style={{ display: 'grid', gap: 12, maxWidth: 560 }}>
        <label>Review stage<select required value={form.stage} onChange={e => setForm({ ...form, stage: e.target.value as 'demo' | 'live' })}><option value="demo">Demo account</option><option value="live">Live account</option></select></label>
        <label>Broker-associated email<input required type="email" autoComplete="email" value={form.brokerEmail} onChange={e => setForm({ ...form, brokerEmail: e.target.value })} /></label>
        <label>MT5 trading account ID<input required inputMode="numeric" autoComplete="off" value={form.mt5Id} onChange={e => setForm({ ...form, mt5Id: e.target.value })} /></label>
        <label>Broker server<input required autoComplete="off" value={form.server} onChange={e => setForm({ ...form, server: e.target.value })} /></label>
        <label>Opaque evidence ticket/reference (not a link)<input required autoComplete="off" value={form.evidenceReference} onChange={e => setForm({ ...form, evidenceReference: e.target.value })} /></label>
        <button disabled={busy} type="submit">{busy ? 'Submitting…' : 'Submit for manual review'}</button>
      </form>
      {error && <p role="alert">{error}</p>}
      <h3>Your review submissions</h3>{data?.submissions.length ? <ul>{data.submissions.map(item => <li key={item.id}>{item.stage} · MT5 ID {item.mt5Id} · {item.status} · revision {item.revision}{item.latestNote ? ` — ${item.latestNote}` : ''}</li>)}</ul> : <p>No submissions.</p>}
    </>}
    <p>Registration must start at the existing <a href="https://one.justmarkets.link/a/tohstb0d83" target="_blank" rel="noopener noreferrer sponsored">JustMarkets partner link</a> (referral code <code>tohstb0d83</code>). This alphanumeric referral ID is distinct from your numeric MT5 account ID. ID/email alone do not prove ownership or attribution.</p>
  </section>;
}

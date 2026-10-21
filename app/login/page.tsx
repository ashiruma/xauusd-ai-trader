'use client';
import { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
export default function Page() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true); setMessage('');
    const form = new FormData(event.currentTarget);
    try {
      const preparation = await fetch('/api/auth/begin', { method: 'POST', cache: 'no-store' });
      if (!preparation.ok) throw new Error('Preparation unavailable');
      const response = await fetch(`/api/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }), cache: 'no-store' });
      const data = await response.json();
      if (response.ok && data.success && mode === 'login') { window.location.assign('/onboarding'); return; }
      setMessage(response.ok && data.success ? 'Check your email and continue in this same browser within 15 minutes.' : 'Authentication is unavailable or the details could not be verified.');
    } catch { setMessage('Authentication is unavailable.'); }
    finally { setBusy(false); }
  }
  return <main style={{ maxWidth: 420, margin: '4rem auto', padding: 24 }}>
    <h1>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
    <p>Staging sign-in. Use the email associated with JustMarkets and a separate Velarion password. Your identity is checked online; access remains pending until independently approved. A matching email does not prove broker registration or ownership.</p>
    <form onSubmit={submit}>
      <label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label>Velarion password<input name="password" type="password" required minLength={mode === 'signup' ? 12 : 1} maxLength={1024} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
      <button type="submit" disabled={busy}>{busy ? 'Please wait' : mode === 'login' ? 'Sign in' : 'Sign up'}</button>
    </form>
    <button type="button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Create account' : 'Return to sign in'}</button>
    <p role="status">{message}</p>
    <p>The demo MT5 trading account ID is mandatory for the planned broker-verification step. This sign-in form authenticates Velarion only; ID submission and broker verification are not enabled here. Never enter a JustMarkets or MT5 password into Velarion.</p>
    <p>Not registered with the broker? <a href={DEFAULT_PARTNER_CONFIG.primaryLink} target="_blank" rel="noopener noreferrer sponsored">Register through the JustMarkets partner link</a>, create a demo MT5 account there, then return. Velarion access is 100% free conditional on that registration and verified referral attribution; broker fees, deposits and losses remain yours.</p>
    <p>Course delivery, automation, and trading remain disabled. <Link href="/how-it-works">Planned five-lesson / USD 50 checkpoint</Link> · <Link href="/legal/ib-disclosure">IB conflicts</Link> · <Link href="/legal/risk-disclosure">Risks</Link>. Kenya regulatory review remains a pre-launch requirement.</p>
  </main>;
}

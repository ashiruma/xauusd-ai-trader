'use client';
import { useState } from 'react';
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
    <p>Staging sign-in. Your identity is checked online; access remains pending until independently approved.</p>
    <form onSubmit={submit}>
      <label>Email<input name="email" type="email" required maxLength={254} autoComplete="email" /></label>
      <label>Password<input name="password" type="password" required minLength={mode === 'signup' ? 12 : 1} maxLength={1024} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} /></label>
      <button type="submit" disabled={busy}>{busy ? 'Please wait' : mode === 'login' ? 'Sign in' : 'Sign up'}</button>
    </form>
    <button type="button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Create account' : 'Return to sign in'}</button>
    <p role="status">{message}</p>
    <p>Course delivery, automation, and trading remain disabled. No broker credentials are requested.</p>
  </main>;
}

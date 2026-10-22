'use client';
import { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import styles from './login.module.css';
export default function Page() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
      if (response.ok && data.success && mode === 'signup') { window.location.assign('/auth/confirm'); return; }
      setMessage('Authentication is unavailable or the details could not be verified.');
    } catch { setMessage('Authentication is unavailable.'); }
    finally { setBusy(false); }
  }
  return <main className={styles.page} aria-labelledby="login-title">
    <div className={styles.card}>
      <span className={styles.eyebrow}>Velarion · Staging Preview</span>
      <h1 id="login-title" className={styles.title}>{mode === 'login' ? 'Sign in' : 'Create account'}</h1>
      <p className={styles.intro}>Your JustMarkets email. Your own Velarion password.</p>
      <form onSubmit={submit} className={styles.form} aria-busy={busy} aria-describedby="credential-help">
        <label className={styles.field} htmlFor="velarion-email">Email
          <input name="email" id="velarion-email" className={styles.input} type="email" required maxLength={254} autoComplete="email" aria-describedby="email-help" />
        </label>
        <p id="email-help" className={styles.hint}>Use the email associated with JustMarkets.</p>
        <div className={styles.field}>
          <label htmlFor="velarion-password">Velarion password</label>
          <div className={styles.passwordField}>
            <input name="password" id="velarion-password" className={`${styles.input} ${styles.passwordInput}`} type={showPassword ? 'text' : 'password'} required minLength={mode === 'signup' ? 12 : 1} maxLength={1024} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} aria-describedby="credential-help" />
            <button className={styles.passwordToggle} type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} aria-controls="velarion-password" onPointerDown={event => event.preventDefault()} onClick={() => setShowPassword(visible => !visible)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                <circle cx="12" cy="12" r="3" />
                {showPassword && <path d="m3 3 18 18" />}
              </svg>
            </button>
          </div>
        </div>
        <p id="credential-help" className={styles.hint}>{mode === 'signup' && 'Use at least 12 characters. '}Never enter a JustMarkets or MT5 password.</p>
        <button className={`btn btn-primary ${styles.action}`} type="submit" disabled={busy}>{busy ? 'Please wait' : mode === 'login' ? 'Sign in' : 'Create account'}</button>
      </form>
      <button className={`btn btn-secondary ${styles.action} ${styles.switchMode}`} type="button" disabled={busy} onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>{mode === 'login' ? 'Create account' : 'Return to sign in'}</button>
      <Link className={styles.detailLink} href="/auth/confirm">Already have an email confirmation code?</Link>
      <p role="status" aria-live="polite" aria-atomic="true" className={styles.message}>{message}</p>
      <div className={styles.referral}>
        <a className={styles.partnerLink} href={DEFAULT_PARTNER_CONFIG.primaryLink} target="_blank" rel="noopener noreferrer sponsored">New here? Join JustMarkets <span aria-hidden="true">↗</span><span className={styles.srOnly}> (opens in a new tab)</span></a>
        <p>Create a demo MT5 account, then return. Free Velarion access requires verified partner registration; broker costs, deposits and losses are separate.</p>
        <Link className={styles.detailLink} href="/how-it-works">A demo MT5 trading account ID is mandatory — see steps</Link>
      </div>
      <div className={styles.preview}>
        <p>Account review and the lesson 5 checkpoint await setup. ID submission and broker verification are not enabled. Lessons, automation and trading remain disabled.</p>
      </div>
      <nav className={styles.details} aria-label="Registration details and disclosures">
        <Link href="/how-it-works">How it works</Link>
        <Link href="/legal/ib-disclosure">Partner disclosure</Link>
        <Link href="/legal/risk-disclosure">Trading risks</Link>
      </nav>
    </div>
  </main>;
}

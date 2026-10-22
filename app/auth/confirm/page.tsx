'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from '../../login/login.module.css';
export default function ConfirmEmailPage() {
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [message, setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || confirmed) return;
    const form = event.currentTarget;
    const values = new FormData(form);
    setBusy(true); setMessage('');
    try {
      const response = await fetch('/api/auth/confirm', { method: 'POST', cache: 'no-store', credentials: 'omit',
        headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: values.get('email'), code: values.get('code') }) });
      const data = await response.json();
      if (response.ok && data.success && data.emailConfirmed === true && data.authenticated === false) {
        form.reset(); setConfirmed(true);
        setMessage('Email confirmed. This did not sign you in. Choose Sign in and enter your email and Velarion password.');
      } else {
        setMessage(response.status === 429 ? 'Too many attempts. Please wait before trying again.' : 'The code could not be verified. Check the email and code, or try normal password sign-in if you already confirmed.');
      }
    } catch { setMessage('Confirmation is unavailable. No sign-in or account access has been granted.'); }
    finally { setBusy(false); }
  }
  return <main className={styles.page} aria-labelledby="confirmation-title"><div className={styles.card}>
    <span className={styles.eyebrow}>Velarion · Staging Preview</span>
    <h1 id="confirmation-title" className={styles.title}>Confirm your email</h1>
    <p className={styles.intro}>If signup is available, your email contains a six-digit confirmation code. Open it in Gmail, Outlook or another app, then enter it here in any browser or on another device.</p>
    {!confirmed && <form onSubmit={submit} className={styles.form} aria-busy={busy} aria-describedby="confirmation-help">
      <label className={styles.field} htmlFor="confirmation-email">Email
        <input className={styles.input} id="confirmation-email" name="email" type="email" required maxLength={254} autoComplete="email" />
      </label>
      <label className={styles.field} htmlFor="confirmation-code">Confirmation code
        <input className={styles.input} id="confirmation-code" name="code" type="text" required inputMode="numeric" pattern="[0-9]{6}" minLength={6} maxLength={6} autoComplete="one-time-code" />
      </label>
      <button className={`btn btn-primary ${styles.action}`} type="submit" disabled={busy}>{busy ? 'Please wait' : 'Confirm email only'}</button>
    </form>}
    <p id="confirmation-help" className={styles.hint}>This confirms your email only. It does not sign you in on this browser or device. Afterwards, use normal email and password sign-in. Never enter a JustMarkets or MT5 password.</p>
    <p role="status" aria-live="polite" aria-atomic="true" className={styles.message}>{message}</p>
    <Link href="/login" className={`btn btn-secondary ${styles.action}`}>Sign in with Velarion password</Link>
    <p className={styles.hint}>An expired, already-used or older email may not work. No automatic resend is performed here.</p>
    <div className={styles.preview}><p>Manual partner and identity checks remain required. Email confirmation is not approval to trade. Lessons, automation and trading remain disabled.</p></div>
  </div></main>;
}

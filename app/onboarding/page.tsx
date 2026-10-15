'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/terminal';

  const [mt5Id, setMt5Id] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/verify-mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mt5AccountId: mt5Id.trim(), email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setStatus('success');
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 1200);
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setErrorMessage(msg);
    }
  };

  return (
    <main style={{ maxWidth: '680px', margin: '48px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>Account Verification</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="section-eyebrow">
          <span>Subsidized Access Activation</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Unlock Velarion Markets for Free
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Our AI trading terminal, quantitative models, and 30-lesson Forex School are 100% free, subsidized directly through our partnership with regulated broker <strong style={{ color: 'var(--accent-gold)' }}>JustMarkets</strong>.
        </p>
      </div>

      <div style={{
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '28px'
      }}>
        {/* Step 1 */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'var(--accent-gold-subtle)',
            border: '1px solid var(--border-accent)',
            color: 'var(--accent-gold)',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            1
          </div>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Create &amp; Fund Your JustMarkets MT5 Account
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              Open an MT5 account through our official partner gateway. Non-custodial capital protection ensures your funds remain 100% in your own broker custody.
            </p>
            <a
              href="https://one.justmarkets.link/a/tohstb0d83"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '8px 16px' }}
            >
              Open JustMarkets MT5 Account &rarr;
            </a>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-subtle)' }} />

        {/* Step 2 */}
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'var(--accent-gold-subtle)',
            border: '1px solid var(--border-accent)',
            color: 'var(--accent-gold)',
            fontWeight: 800,
            fontSize: '13px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            2
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
              Verify Your MT5 Account ID
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              Enter your live or demo MT5 account number below for instant cryptographic verification.
            </p>

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  JustMarkets MT5 Account ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. 21094821"
                  value={mt5Id}
                  onChange={(e) => setMt5Id(e.target.value)}
                  className="calc-input mono-nums"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Registered Email Address (Optional)
                </label>
                <input
                  type="email"
                  placeholder="e.g. yourname@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="calc-input"
                />
              </div>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '13.5px', marginTop: '6px' }}
              >
                {status === 'loading' ? 'Verifying Gateway...' : 'Verify & Unlock Instant Access'}
              </button>

              {status === 'success' && (
                <div style={{
                  padding: '12px',
                  background: 'var(--accent-green-subtle)',
                  border: '1px solid var(--accent-green-border)',
                  color: 'var(--accent-green)',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center'
                }}>
                  Verified successfully. Redirecting to platform...
                </div>
              )}

              {status === 'error' && (
                <div style={{
                  padding: '12px',
                  background: 'var(--accent-red-subtle)',
                  border: '1px solid var(--accent-red-border)',
                  color: 'var(--accent-red)',
                  fontSize: '13px',
                  borderRadius: 'var(--radius-sm)',
                  textAlign: 'center'
                }}>
                  {errorMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      {/* Non-Custodial Security Guarantee */}
      <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
        Non-custodial cryptographic verification. No passwords required. Your trading funds remain 100% inside regulated JustMarkets MT5 custody.
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>Loading verification gateway...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

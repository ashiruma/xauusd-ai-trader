'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function OnboardingPage() {
  const [mt5Id, setMt5Id] = useState('');
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
        body: JSON.stringify({ mt5AccountId: mt5Id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setStatus('success');
      setTimeout(() => {
        window.location.href = '/terminal';
      }, 1500);
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
        <span style={{ color: 'var(--accent-gold)' }}>Broker Onboarding</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="section-eyebrow">
          <span>Subsidized Access Activation</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Unlock Velarion Markets for Free
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Our AI trading terminal, quantitative models, and 30-lesson Forex Academy are 100% free, subsidized directly by our official partner <strong style={{ color: 'var(--accent-gold)' }}>JustMarkets</strong>.
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
              Create &amp; Fund Your JustMarkets Account
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '12px' }}>
              Register using our official partner link with partner code <code className="mono-nums" style={{ color: 'var(--accent-gold)', background: 'var(--bg-surface-2)', padding: '2px 6px', borderRadius: '4px' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code> and open an MT5 account.
            </p>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-gold"
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              Open JustMarkets Partner Link &rarr;
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
              Enter your live or demo MT5 account number below for instant server verification.
            </p>

            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input
                type="text"
                placeholder="e.g. 1200533810"
                value={mt5Id}
                onChange={(e) => setMt5Id(e.target.value)}
                className="calc-input mono-nums"
                required
              />

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary"
                style={{ width: '100%', padding: '12px', fontSize: '13.5px' }}
              >
                {status === 'loading' ? 'Verifying with Broker Gateway...' : 'Verify & Unlock Instant Access'}
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
                  Verified successfully. Redirecting to trading terminal...
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

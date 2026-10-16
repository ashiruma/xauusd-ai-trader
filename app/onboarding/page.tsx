'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

function OnboardingNovaContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectTarget = searchParams.get('redirect') || '/terminal';
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const refParam = searchParams.get('ref') || '';

  // Form State
  const [email, setEmail] = useState('');
  const [mt5AccountId, setMt5AccountId] = useState('');
  const [accountTier, setAccountTier] = useState<'standard' | 'pro'>('standard');
  const [depositConfirmed, setDepositConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState(true);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Check if user is already verified
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user?.mt5Account) {
          setMt5AccountId(data.user.mt5Account);
          if (data.user.email) setEmail(data.user.email);
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!mt5AccountId.trim()) {
      setErrorMessage('Please enter your JustMarkets MT5 account ID.');
      return;
    }

    if (!depositConfirmed) {
      setErrorMessage('Please confirm that your JustMarkets account meets the minimum deposit.');
      return;
    }

    if (!agreedToTerms) {
      setErrorMessage('You must review and accept the Terms of Service and IB Disclosure.');
      return;
    }

    setSubmitting(true);

    try {
      const depositAmount = accountTier === 'standard' ? 10 : 200;

      const res = await fetch('/api/verify-mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5AccountId: mt5AccountId.trim(),
          email: email.trim(),
          depositAmount,
          utmSource,
          utmMedium,
          utmCampaign,
          ref: refParam,
          newsletterOptIn,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Account linking verification failed.');
      }

      setSuccessMessage('Account verified and linked successfully! Redirecting to access gate...');
      setTimeout(() => {
        router.push(`/verification?redirect=${encodeURIComponent(redirectTarget)}`);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to link MT5 account.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="nova-page">
      {/* Cinematic Background Imagery with Dusk Clouds & Cliff-edge Cabin */}
      <div className="nova-bg-image" aria-hidden="true" />


      {/* Bottom Left Contemplative Storytelling */}
      <div className="nova-story">
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            letterSpacing: '1.2px',
            textTransform: 'uppercase',
            color: '#eab167',
          }}
        >
          Quantitative XAUUSD Platform
        </span>
        <h2>
          Trade the market from a position of <span>clarity</span>.
        </h2>
        <p style={{ fontSize: '14.5px', color: '#CBD5E1', lineHeight: 1.65, maxWidth: '520px' }}>
          Autonomous spot gold quantitative intelligence, 4 rule-based execution models, and 30-lesson structured education. Access is fully subsidized through our official Introducing Broker partnership.
        </p>

        <div className="nova-story-badges">
          <div className="nova-story-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Non-Custodial: Funds Stay With Broker</span>
          </div>
          <div className="nova-story-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab167" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>$10 Micro-Balance Eligible</span>
          </div>
          <div className="nova-story-pill">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Zero Software Fees</span>
          </div>
        </div>
      </div>

      {/* Right Split Panel - Dark Glass Form Panel */}
      <div className="nova-panel-wrap">
        <main className="nova-panel">
          <div style={{ marginBottom: '18px' }}>
            <Link
              href="/"
              style={{
                fontSize: '12px',
                color: '#94A3B8',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                textDecoration: 'none',
              }}
            >
              &larr; Return to Homepage
            </Link>
          </div>

          <h1>Create your account</h1>
          <p className="nova-subtitle">
            Start your journey — link your JustMarkets MT5 account to unlock live market telemetry and quantitative models.
          </p>

          {/* Partner Registration Action */}
          <div className="nova-social-row">
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="nova-social-btn"
              title="Open account on JustMarkets with partner code tohstb0d83"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eab167" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>Register on JustMarkets</span>
            </a>
            <Link
              href="/verification"
              className="nova-social-btn"
              title="Check existing access status"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <span>Check Status</span>
            </Link>
          </div>

          <div className="nova-divider">
            <span>or link your MT5 account</span>
          </div>

          {/* Form */}
          <form className="nova-form" onSubmit={handleLinkAccount}>
            {errorMessage && (
              <div
                role="alert"
                style={{
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#FCA5A5',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                }}
              >
                {errorMessage}
              </div>
            )}

            {successMessage && (
              <div
                role="status"
                style={{
                  background: 'rgba(16, 185, 129, 0.12)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#6EE7B7',
                  fontSize: '12.5px',
                  lineHeight: 1.5,
                }}
              >
                {successMessage}
              </div>
            )}

            <div className="nova-field">
              <label htmlFor="nova-email">Email Address</label>
              <input
                id="nova-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                autoComplete="email"
              />
            </div>

            <div className="nova-field">
              <label htmlFor="nova-mt5">JustMarkets MT5 Account ID</label>
              <input
                id="nova-mt5"
                type="text"
                value={mt5AccountId}
                onChange={(e) => setMt5AccountId(e.target.value)}
                placeholder="e.g. 1200533810"
                autoComplete="off"
                required
              />
            </div>

            <div className="nova-field">
              <label>Select Broker Account Tier</label>
              <div className="nova-tier-grid">
                <button
                  type="button"
                  className={`nova-tier-btn ${accountTier === 'standard' ? 'selected' : ''}`}
                  onClick={() => setAccountTier('standard')}
                >
                  <div style={{ fontWeight: 700 }}>Standard / Cent</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>$10 Min Deposit</div>
                </button>
                <button
                  type="button"
                  className={`nova-tier-btn ${accountTier === 'pro' ? 'selected' : ''}`}
                  onClick={() => setAccountTier('pro')}
                >
                  <div style={{ fontWeight: 700 }}>Pro / Raw Spread</div>
                  <div style={{ fontSize: '10.5px', color: '#94A3B8', marginTop: '2px' }}>$200 Min Deposit</div>
                </button>
              </div>
            </div>

            <label className="nova-terms">
              <input
                type="checkbox"
                checked={depositConfirmed}
                onChange={(e) => setDepositConfirmed(e.target.checked)}
              />
              <span>
                I confirm that my JustMarkets account is funded with at least {accountTier === 'standard' ? '$10' : '$200'} and was registered with partner code <strong style={{ color: '#eab167' }}>tohstb0d83</strong>.
              </span>
            </label>

            <label className="nova-terms">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span>
                I agree to the <Link href="/legal/terms" target="_blank">Terms</Link>, <Link href="/legal/ib-disclosure" target="_blank">IB Disclosure</Link>, and <Link href="/legal/privacy" target="_blank">Privacy Policy</Link>.
              </span>
            </label>

            <button
              className="nova-submit-btn"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-spin" aria-hidden="true">
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
                    <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                    <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
                    <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
                  </svg>
                  <span>Verifying Partner Status...</span>
                </>
              ) : (
                <span>Link MT5 Account &amp; Proceed &rarr;</span>
              )}
            </button>
          </form>

          <p className="nova-login-hint">
            Already verified? <Link href="/verification">Check Access Status &rarr;</Link>
          </p>

          <div className="nova-disclosure-footer">
            <strong>Introducing Broker Disclosure:</strong> Velarion Markets operates as an official Introducing Broker for JustMarkets. Software access is subsidized through broker volume rebates. Velarion never receives or holds user deposits; trading funds remain 100% in your broker account.
          </div>
        </main>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#0B0F19' }} />}>
      <OnboardingNovaContent />
    </Suspense>
  );
}

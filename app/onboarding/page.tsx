'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

function OnboardingContent() {
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/terminal';
  const utmSource = searchParams.get('utm_source') || '';
  const utmMedium = searchParams.get('utm_medium') || '';
  const utmCampaign = searchParams.get('utm_campaign') || '';
  const refParam = searchParams.get('ref') || '';

  // 5-Step Journey State
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [mt5Id, setMt5Id] = useState('');
  const [email, setEmail] = useState('');
  const [depositAmount, setDepositAmount] = useState<number>(50);
  const [depositConfirmed, setDepositConfirmed] = useState<boolean>(false);
  const [newsletterOptIn, setNewsletterOptIn] = useState<boolean>(true);
  const [completedLessonsCount, setCompletedLessonsCount] = useState<number>(0);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Risk governors for step 4
  const [maxLots, setMaxLots] = useState<number>(0.02);
  const [maxRiskPercent, setMaxRiskPercent] = useState<number>(1.5);
  const [maxDailyLossUsd, setMaxDailyLossUsd] = useState<number>(50);
  const [maxDrawdownPercent, setMaxDrawdownPercent] = useState<number>(6.0);
  const [explicitAuthorization, setExplicitAuthorization] = useState<boolean>(false);

  // Load session and completed lessons
  useEffect(() => {
    // Check completed lessons
    try {
      const stored = localStorage.getItem('velarion_completed_lessons');
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        const foundationCount = [1, 2, 3, 4, 5].filter(num =>
          parsed.includes(`lesson-${num}`) || parsed.includes(String(num))
        ).length;
        setCompletedLessonsCount(foundationCount);
      }
    } catch {
      // ignore
    }

    // Check existing auth status
    fetch('/api/auth/session')
      .then(res => res.json())
      .then(data => {
        if (data.authenticated && data.user) {
          if (data.user.mt5Account) {
            setMt5Id(data.user.mt5Account);
            setDepositConfirmed(true);
            // If already verified, allow navigating to step 3 or 4
            setCurrentStep(prev => Math.max(prev, 3));
          }
        }
      })
      .catch(() => {
        // ignore
      });
  }, []);

  // Step 2: Handle MT5 verification and deposit confirmation
  const handleVerifyDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositConfirmed) {
      setErrorMessage('Please confirm that you have funded your JustMarkets MT5 account.');
      return;
    }
    if (!mt5Id.trim()) {
      setErrorMessage('Please enter your JustMarkets MT5 Account ID.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/verify-mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5AccountId: mt5Id.trim(),
          email: email.trim(),
          depositAmount,
          utmSource,
          utmMedium,
          utmCampaign,
          ref: refParam,
          newsletterOptIn
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      setStatus('success');
      setTimeout(() => {
        setStatus('idle');
        setCurrentStep(3); // Advance to required education
      }, 800);
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Verification failed';
      setErrorMessage(msg);
    }
  };

  // Step 5: Save Settings and Activate Explicit Automated Trading
  const handleFinalActivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explicitAuthorization) {
      setErrorMessage('Explicit authorization is mandatory before activating automated trading.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/trading/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          maxLots,
          maxRiskPercent,
          maxDailyLossUsd,
          maxDrawdownPercent,
          isAutomatedTradingAuthorized: true,
          isEmergencyPaused: false
        })
      });

      if (!res.ok) throw new Error('Failed to save trading safety settings');

      setStatus('success');
      setTimeout(() => {
        window.location.href = redirectTarget;
      }, 1200);
    } catch (err: unknown) {
      setStatus('error');
      const msg = err instanceof Error ? err.message : 'Activation failed';
      setErrorMessage(msg);
    }
  };

  return (
    <main style={{ maxWidth: '760px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>5-Step Onboarding &amp; Activation</span>
      </nav>

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div className="section-eyebrow">
          <span>Structured Activation Protocol</span>
        </div>
        <h1 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '10px', letterSpacing: '-0.5px' }}>
          Onboarding &amp; Automated Trading Activation
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '620px', margin: '0 auto' }}>
          A disciplined 5-stage onboarding process ensuring full regulatory transparency, funded account custody, mandatory risk education, and user-controlled execution limits.
        </p>
      </div>

      {/* 5-Step Visual Stepper Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '6px',
        marginBottom: '32px',
        background: 'var(--bg-surface-1)',
        padding: '10px',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-default)'
      }}>
        {[
          { num: 1, label: '1. Referral' },
          { num: 2, label: '2. Deposit' },
          { num: 3, label: '3. Education' },
          { num: 4, label: '4. Risk Limits' },
          { num: 5, label: '5. Activation' },
        ].map((s) => {
          const isActive = currentStep === s.num;
          const isComplete = currentStep > s.num;

          return (
            <button
              key={s.num}
              type="button"
              onClick={() => {
                // Allow navigating back or forward if prerequisites met
                if (s.num <= currentStep || (s.num === 3 && depositConfirmed) || (s.num === 4 && completedLessonsCount >= 5)) {
                  setCurrentStep(s.num);
                }
              }}
              style={{
                background: isActive ? 'var(--accent-gold)' : isComplete ? 'var(--accent-green-subtle)' : 'transparent',
                color: isActive ? '#FFFFFF' : isComplete ? 'var(--accent-green)' : 'var(--text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-xs)',
                padding: '8px 4px',
                fontSize: '11px',
                fontWeight: 700,
                cursor: 'pointer',
                textAlign: 'center',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease'
              }}
            >
              {s.label} {isComplete && ' [Done]'}
            </button>
          );
        })}
      </div>

      {/* STEP CONTAINER */}
      <div style={{
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px 28px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
      }}>
        {/* ============================================================== */}
        {/* STEP 1: REFERRAL REGISTRATION & IB CONFLICT TRANSPARENCY       */}
        {/* ============================================================== */}
        {currentStep === 1 && (
          <div>
            <span className="status-badge status-warning" style={{ marginBottom: '12px' }}>
              STAGE 1 OF 5 &bull; MANDATORY BROKER REFERRAL
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Register on JustMarkets with Partner Code
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              To qualify for sponsored software access (no platform subscription fee), you must register your MT5 account through our designated broker referral gateway.
            </p>

            {/* Mandatory IB Relationship & Conflict of Interest Notice */}
            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-accent)',
              borderRadius: 'var(--radius-md)',
              padding: '18px 20px',
              marginBottom: '24px',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              <strong style={{ color: 'var(--accent-gold)', display: 'block', fontSize: '13px', marginBottom: '6px' }}>
                Introducing Broker (IB) Relationship &amp; Conflict Disclosure:
              </strong>
              Velarion Markets operates as an Introducing Broker for JustMarkets. We charge <strong>no platform subscription fee</strong>. In return, Velarion receives referral bonuses, volume-based commissions, or spread-rebate compensation triggered when you register via code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</code>, fund your account, and trade.
              <span style={{ display: 'block', marginTop: '6px', color: 'var(--text-muted)' }}>
                <strong>Commercial Conflict:</strong> Because volume-based compensation accrues based on lots traded, an introducing broker could be incentivized to encourage frequent trading. To protect capital, Velarion enforces user-controlled risk caps (lot ceilings and daily loss stops). Users bear all broker trading costs (spreads, swaps, commissions) and can lose their deposited capital.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <a
                href={DEFAULT_PARTNER_CONFIG.primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '14px', textAlign: 'center' }}
              >
                Open JustMarkets Account (Partner Code: {DEFAULT_PARTNER_CONFIG.primaryCode}) &rarr;
              </a>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-secondary"
                style={{ padding: '10px 20px', fontSize: '13px' }}
              >
                Already Registered? Proceed to Deposit Verification &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 2: VERIFIED FUNDED DEPOSIT REQUIREMENT                    */}
        {/* ============================================================== */}
        {currentStep === 2 && (
          <form onSubmit={handleVerifyDeposit}>
            <span className="status-badge status-warning" style={{ marginBottom: '12px' }}>
              STAGE 2 OF 5 &bull; VERIFIED FUNDED DEPOSIT
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Verify Funded MT5 Account
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Referral and deposit are mandatory requirements for account linking and automated-trading features. Capital remains 100% in your own broker custody.
            </p>

            {errorMessage && (
              <div style={{ padding: '10px 14px', background: 'var(--accent-red-subtle)', border: '1px solid var(--accent-red-border)', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', color: 'var(--accent-red)', marginBottom: '18px' }}>
                {errorMessage}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '22px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  JustMarkets MT5 Account ID
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 1200533810"
                  value={mt5Id}
                  onChange={(e) => setMt5Id(e.target.value)}
                  className="calc-input mono-nums"
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Found inside your JustMarkets Client Cabinet or MT5 mobile app.
                </span>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Account Email Address
                </label>
                <input
                  type="email"
                  placeholder="trader@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="calc-input"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Initial Deposit Amount ($ USD)
                </label>
                <input
                  type="number"
                  min={10}
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(Number(e.target.value))}
                  className="calc-input mono-nums"
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Minimum deposit on JustMarkets Standard/Pro account is $10.
                </span>
              </div>

              <div style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 14px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={depositConfirmed}
                    onChange={(e) => setDepositConfirmed(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    I confirm that I have funded my JustMarkets MT5 account with capital I can afford to risk. I acknowledge that Velarion Markets never holds my capital and that all withdrawals are handled independently by me through JustMarkets.
                  </div>
                </label>
              </div>

              <div style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '12px 14px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newsletterOptIn}
                    onChange={(e) => setNewsletterOptIn(e.target.checked)}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    <strong style={{ color: 'var(--text-primary)' }}>Daily Pre-Market Institutional Briefing (Optional):</strong> Receive daily Spot Gold key levels, London killzone ranges, and high-impact macro calendar alerts at 06:30 UTC. You can unsubscribe at any time.
                  </div>
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="btn btn-secondary"
                style={{ fontSize: '12.5px' }}
              >
                &larr; Back to Step 1
              </button>

              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '10px 22px' }}
              >
                {status === 'loading' ? 'Verifying Account...' : 'Verify Deposit & Proceed &rarr;'}
              </button>
            </div>
          </form>
        )}

        {/* ============================================================== */}
        {/* STEP 3: REQUIRED LEARNING MODULES & RISK EDUCATION             */}
        {/* ============================================================== */}
        {currentStep === 3 && (
          <div>
            <span className="status-badge status-completed" style={{ marginBottom: '12px' }}>
              STAGE 3 OF 5 &bull; REQUIRED RISK EDUCATION
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Required Learning &amp; Risk Comprehension
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Before automated trading can be authorized, you must complete the core curriculum modules on leverage, margin, drawdown, spreads/swaps, slippage, and stop-loss mechanics.
            </p>

            {/* Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {[
                { num: 1, title: 'Lesson 01: Spot Gold (XAUUSD) Market Structure & OTC Sessions' },
                { num: 2, title: 'Lesson 02: Liquidity Sweeps, Interbank Banks & Slippage Risk' },
                { num: 3, title: 'Lesson 03: Leverage, Margin Depletion & Lot Sizing Formulas' },
                { num: 4, title: 'Lesson 04: Spreads, Overnight Swaps & Asymmetric Drawdown Math' },
                { num: 5, title: 'Lesson 05: Mathematical Stop-Loss Discipline & Risk Limits' },
              ].map((l) => {
                const isPassed = completedLessonsCount >= l.num;

                return (
                  <div
                    key={l.num}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 16px',
                      background: 'var(--bg-surface-2)',
                      border: isPassed ? '1px solid var(--accent-green-border)' : '1px solid var(--border-default)',
                      borderRadius: '8px',
                      fontSize: '13px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span className="mono-nums" style={{ color: isPassed ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 700 }}>
                        {isPassed ? 'PASSED' : `0${l.num}`}
                      </span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: isPassed ? 600 : 400 }}>{l.title}</span>
                    </div>

                    <Link
                      href={`/academy/lesson-${l.num}`}
                      className="btn btn-outline-gold"
                      style={{ fontSize: '11px', padding: '5px 12px' }}
                    >
                      {isPassed ? 'Review' : 'Study & Test'} &rarr;
                    </Link>
                  </div>
                );
              })}
            </div>

            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '14px 18px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
              marginBottom: '24px'
            }}>
              <strong>Education Disclaimer:</strong> Completing lessons and passing comprehension checks demonstrates theoretical understanding only. It does not eliminate market risk, guarantee profitable trades, or ensure safety against market shocks.
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="btn btn-secondary"
                style={{ fontSize: '12.5px' }}
              >
                &larr; Back to Step 2
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '10px 22px' }}
              >
                {completedLessonsCount >= 5 ? 'Proceed to Trading Settings &rarr;' : 'Configure Safety Settings &rarr;'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 4: REVIEW DISCLOSURES & TRADING SETTINGS                  */}
        {/* ============================================================== */}
        {currentStep === 4 && (
          <div>
            <span className="status-badge status-completed" style={{ marginBottom: '12px' }}>
              STAGE 4 OF 5 &bull; USER RISK GOVERNORS
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Configure Trading Safety Limits
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Define strict personal exposure limits. Our quantitative models will operate strictly within these parameters.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Maximum Lot Cap (Position Limit)
                </label>
                <input
                  type="number"
                  value={maxLots}
                  onChange={(e) => setMaxLots(Math.max(0.01, Math.min(0.20, Number(e.target.value))))}
                  className="calc-input mono-nums"
                  min={0.01}
                  max={0.20}
                  step={0.01}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Recommended: 0.01 to 0.05 micro-lots for accounts under $500.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Max Risk Per Trade (%)
                  </label>
                  <input
                    type="number"
                    value={maxRiskPercent}
                    onChange={(e) => setMaxRiskPercent(Math.max(0.5, Math.min(3.0, Number(e.target.value))))}
                    className="calc-input mono-nums"
                    min={0.5}
                    max={3.0}
                    step={0.5}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Max Daily Loss ($ USD)
                  </label>
                  <input
                    type="number"
                    value={maxDailyLossUsd}
                    onChange={(e) => setMaxDailyLossUsd(Math.max(10, Number(e.target.value)))}
                    className="calc-input mono-nums"
                    min={10}
                    max={500}
                    step={10}
                  />
                </div>
              </div>

              <div style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '14px 18px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.55
              }}>
                <strong>Independent Withdrawal Control:</strong> You retain complete custody and independent withdrawal control over your funds at all times directly via JustMarkets. Velarion Markets never asks for or stores broker passwords or withdrawal pins.
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="btn btn-secondary"
                style={{ fontSize: '12.5px' }}
              >
                &larr; Back to Step 3
              </button>

              <button
                type="button"
                onClick={() => setCurrentStep(5)}
                className="btn btn-primary"
                style={{ fontSize: '13px', padding: '10px 22px' }}
              >
                Confirm Limits &amp; Proceed to Activation &rarr;
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* STEP 5: EXPLICIT AUTOMATED TRADING AUTHORIZATION               */}
        {/* ============================================================== */}
        {currentStep === 5 && (
          <form onSubmit={handleFinalActivation}>
            <span className="status-badge status-completed" style={{ marginBottom: '12px' }}>
              STAGE 5 OF 5 &bull; EXPLICIT TRADING AUTHORIZATION
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Link Account &amp; Explicitly Authorize Automated Trading
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Review the final terms before granting execution authority. Account linking alone will not trigger orders; automated execution begins only with your explicit opt-in below.
            </p>

            {errorMessage && (
              <div style={{ padding: '10px 14px', background: 'var(--accent-red-subtle)', border: '1px solid var(--accent-red-border)', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', color: 'var(--accent-red)', marginBottom: '18px' }}>
                {errorMessage}
              </div>
            )}

            {/* Configured Settings Summary */}
            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              fontSize: '12.5px'
            }}>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>MT5 Account</span>
                <strong className="mono-nums" style={{ color: 'var(--text-primary)' }}>#{mt5Id || 'ACTIVE'}</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Position Cap</span>
                <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{maxLots} Lots Max</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Risk Per Trade</span>
                <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{maxRiskPercent}%</strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '11px' }}>Daily Loss Cutoff</span>
                <strong className="mono-nums" style={{ color: 'var(--accent-red)' }}>${maxDailyLossUsd}</strong>
              </div>
            </div>

            {/* Mandatory Explicit Authorization Checkbox */}
            <div style={{
              background: 'var(--accent-gold-subtle)',
              border: '1.5px solid var(--border-accent)',
              borderRadius: '8px',
              padding: '16px 18px',
              marginBottom: '24px'
            }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  required
                  checked={explicitAuthorization}
                  onChange={(e) => setExplicitAuthorization(e.target.checked)}
                  style={{ marginTop: '4px', transform: 'scale(1.2)' }}
                />
                <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  <strong>I explicitly authorize automated trading:</strong> I grant authorization for Velarion AI models to submit automated market orders on my JustMarkets MT5 account according to the risk limits configured above. I understand that automated execution will begin immediately upon activation, that I can lose money, and that I can pause or revoke this authorization at any time using the one-click Emergency Kill Switch.
                </div>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="btn btn-secondary"
                style={{ fontSize: '12.5px' }}
              >
                &larr; Back to Step 4
              </button>

              <button
                type="submit"
                disabled={status === 'loading' || !explicitAuthorization}
                className="btn btn-primary"
                style={{
                  fontSize: '13.5px',
                  padding: '12px 24px',
                  opacity: explicitAuthorization ? 1 : 0.6,
                  cursor: explicitAuthorization ? 'pointer' : 'not-allowed'
                }}
              >
                {status === 'loading' ? 'Activating Terminal...' : 'Activate Automated Trading & Enter Terminal &rarr;'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 24px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading Onboarding Protocol...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}

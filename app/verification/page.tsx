'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { GateRequirement, AccessStatusResponse, StepStatus } from '@/lib/access-control';

function VerificationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const redirectTarget = searchParams.get('redirect') || '/terminal';

  const [data, setData] = useState<AccessStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [checkLoading, setCheckLoading] = useState<boolean>(false);
  const [checkMessage, setCheckMessage] = useState<{ type: 'success' | 'pending' | 'error' | 'rate_limited'; text: string } | null>(null);
  const [cooldownSec, setCooldownSec] = useState<number>(0);

  // Manual MT5 input if user needs to submit account ID for checking
  const [inputAccount, setInputAccount] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState<boolean>(false);

  // Step 6 Risk Modal State
  const [showRiskModal, setShowRiskModal] = useState<boolean>(false);
  const [riskConsents, setRiskConsents] = useState({
    acceptMarketRisk: false,
    acceptExecutionRisk: false,
    acceptIbCompensation: false,
    acceptSimulationDisclaimer: false,
  });
  const [activating, setActivating] = useState<boolean>(false);
  const [activationError, setActivationError] = useState<string>('');

  // Fetch initial access status
  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/access/status', { cache: 'no-store' });
      if (res.ok) {
        const json: AccessStatusResponse = await res.json();
        setData(json);
        if (json.user?.accountId) {
          setInputAccount(json.user.accountId);
        }
      }
    } catch (err) {
      console.error('Failed to load access journey status', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  // Handle countdown timer for rate limiting
  useEffect(() => {
    if (cooldownSec <= 0) return;
    const timer = setInterval(() => {
      setCooldownSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSec]);

  // "Check again" handler
  const handleCheckAgain = async () => {
    if (cooldownSec > 0 || checkLoading) return;
    try {
      setCheckLoading(true);
      setCheckMessage(null);

      const res = await fetch('/api/access/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: inputAccount.trim() || undefined,
        }),
      });

      const result = await res.json();

      if (res.status === 429) {
        setCooldownSec(result.retryAfterSec || 3);
        setCheckMessage({ type: 'rate_limited', text: result.message || 'Please wait before checking again.' });
      } else if (result.status === 'success') {
        setCheckMessage({ type: 'success', text: result.message });
        if (result.journey) {
          setData(result.journey);
        } else {
          loadStatus();
        }
      } else {
        setCheckMessage({ type: 'pending', text: result.message });
        if (result.journey) {
          setData(result.journey);
        }
      }
    } catch {
      setCheckMessage({ type: 'error', text: 'Network connection issue while verifying. Please try again.' });
    } finally {
      setCheckLoading(false);
    }
  };

  // Step 6: Activate trading handler
  const handleActivateTrading = async () => {
    setActivationError('');
    setActivating(true);
    try {
      const res = await fetch('/api/access/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(riskConsents),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to activate live trading');
      }

      setShowRiskModal(false);
      setData(result.journey);
      setCheckMessage({ type: 'success', text: 'Live automated execution authorized. Gated access fully unlocked!' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Activation error';
      setActivationError(msg);
    } finally {
      setActivating(false);
    }
  };

  const completedCount = data?.requirements.filter((r) => r.status === 'complete').length || 0;
  const totalCount = data?.requirements.length || 6;
  const isFullyUnlocked = data?.canAccessTerminal;

  return (
    <div style={{ minHeight: '100vh', background: '#080C14', color: '#F8FAFC', padding: '32px 16px 80px' }}>
      <main style={{ maxWidth: '960px', margin: '0 auto' }}>
        {/* Top Breadcrumb & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/"
              aria-label="Velarion Markets Homepage"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                textDecoration: 'none',
              }}
            >
              <img
                src="/velarion_brand_dark.png"
                alt="VELARION MARKETS"
                width={145}
                height={38}
                style={{ height: '34px', width: 'auto', display: 'block' }}
              />
            </Link>
            <div style={{ borderLeft: '1px solid #1E293B', paddingLeft: '14px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.8px', color: '#C5A059', fontWeight: 700 }}>
                Institutional Gate
              </span>
              <h1 style={{ fontSize: '18px', fontWeight: 700, margin: '2px 0 0', color: '#FFFFFF' }}>
                Account Verification &amp; Gated Access
              </h1>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Link
              href="/"
              style={{
                fontSize: '12.5px',
                color: '#94A3B8',
                textDecoration: 'none',
                padding: '6px 14px',
                borderRadius: '6px',
                border: '1px solid #1E293B',
                background: '#0D1322',
              }}
            >
              Return Home
            </Link>
            {isFullyUnlocked && (
              <button
                onClick={() => router.push(redirectTarget)}
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#080C14',
                  background: '#C5A059',
                  border: 'none',
                  padding: '7px 16px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Launch Terminal &rarr;
              </button>
            )}
          </div>
        </div>

        {/* Live Broker Gateway & Telemetry Ribbon (MobileSasa inspired) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid #1E293B',
            borderRadius: '8px',
            padding: '8px 16px',
            marginBottom: '18px',
            fontSize: '11.5px',
            color: '#94A3B8',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ padding: '2px 6px', fontSize: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34D399', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '2px', fontWeight: 700, letterSpacing: '0.05em' }}>LIVE</span>
            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>JustMarkets Gateway:</span>
            <span>API Active</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Partner Attribution:</span>
            <span style={{ color: '#C5A059', fontFamily: 'monospace', fontWeight: 700 }}>tohstb0d83</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#E2E8F0', fontWeight: 600 }}>Custody Architecture:</span>
            <span style={{ color: '#10B981' }}>100% Non-Custodial Broker Account</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: '#64748B' }}>Audit Telemetry:</span>
            <span style={{ color: '#CBD5E1' }}>Real-Time Server Sync</span>
          </div>
        </div>

        {/* Overview Banner Card */}
        <section
          style={{
            background: '#0D1322',
            border: `1px solid ${isFullyUnlocked ? 'rgba(16, 185, 129, 0.4)' : '#1E293B'}`,
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '28px',
            position: 'relative',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '0.5px', color: isFullyUnlocked ? '#10B981' : '#F59E0B', textTransform: 'uppercase' }}>
                  {isFullyUnlocked ? 'Gated Access Granted' : 'Verification In Progress'}
                </span>
                <span style={{ fontSize: '11px', color: '#64748B', background: '#111827', padding: '1px 8px', borderRadius: '4px', border: '1px solid #1E293B' }}>
                  {completedCount} of {totalCount} Requirements Verified
                </span>
              </div>
              <h2 style={{ fontSize: '22px', fontWeight: 800, margin: '0 0 8px', color: '#FFFFFF' }}>
                {isFullyUnlocked
                  ? 'All Institutional Requirements Satisfied'
                  : 'Complete All Prerequisites to Unlock Live Execution'}
              </h2>
              <p style={{ fontSize: '13.5px', color: '#94A3B8', margin: 0, maxWidth: '640px', lineHeight: 1.5 }}>
                To safeguard capital, access to the live trading terminal, broker quote telemetry, and automated execution requires sequential education, verified JustMarkets partner registration, and explicit risk authorization.
              </p>
            </div>

            {/* Check Again Button */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCheckAgain}
                disabled={checkLoading || cooldownSec > 0}
                style={{
                  background: cooldownSec > 0 ? '#1E293B' : '#1E293B',
                  border: '1px solid #334155',
                  color: cooldownSec > 0 ? '#64748B' : '#F8FAFC',
                  fontWeight: 600,
                  fontSize: '13px',
                  padding: '9px 18px',
                  borderRadius: '6px',
                  cursor: cooldownSec > 0 || checkLoading ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.15s ease',
                }}
              >
                {checkLoading ? (
                  <>
                    <span className="spinner-inline" style={{ width: '13px', height: '13px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#C5A059', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                    Checking broker records...
                  </>
                ) : cooldownSec > 0 ? (
                  `Check again in ${cooldownSec}s`
                ) : (
                  <>Check again</>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowManualInput(!showManualInput)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#C5A059',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0,
                }}
              >
                {showManualInput ? 'Hide Account Input' : 'Enter different MT5 ID'}
              </button>
            </div>
          </div>

          {/* Optional manual account entry */}
          {showManualInput && (
            <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #1E293B', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Enter JustMarkets MT5 Account ID"
                value={inputAccount}
                onChange={(e) => setInputAccount(e.target.value)}
                style={{
                  background: '#080C14',
                  border: '1px solid #334155',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#F8FAFC',
                  fontSize: '13px',
                  minWidth: '240px',
                }}
              />
              <button
                type="button"
                onClick={handleCheckAgain}
                disabled={checkLoading}
                style={{
                  background: '#C5A059',
                  color: '#080C14',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '8px 14px',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Verify Account
              </button>
            </div>
          )}

          {/* Feedback Message Banner */}
          {checkMessage && (
            <div
              style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                lineHeight: 1.45,
                background:
                  checkMessage.type === 'success'
                    ? 'rgba(16, 185, 129, 0.12)'
                    : checkMessage.type === 'rate_limited'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(245, 158, 11, 0.12)',
                border: `1px solid ${
                  checkMessage.type === 'success'
                    ? 'rgba(16, 185, 129, 0.3)'
                    : checkMessage.type === 'rate_limited'
                    ? 'rgba(239, 68, 68, 0.3)'
                    : 'rgba(245, 158, 11, 0.3)'
                }`,
                color:
                  checkMessage.type === 'success'
                    ? '#10B981'
                    : checkMessage.type === 'rate_limited'
                    ? '#EF4444'
                    : '#F59E0B',
              }}
            >
              {checkMessage.text}
            </div>
          )}
        </section>

        {/* 6 Requirements Grid */}
        <section aria-label="Gated Access Journey Requirements" style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '36px' }}>
          {loading && !data ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748B' }}>
              Evaluating institutional verification requirements...
            </div>
          ) : (
            data?.requirements.map((req: GateRequirement) => {
              const isDone = req.status === 'complete';
              const isPending = req.status === 'pending';
              const isAction = req.status === 'action_needed';

              const badgeColors = isDone
                ? { bg: 'rgba(16, 185, 129, 0.12)', text: '#10B981', border: 'rgba(16, 185, 129, 0.3)' }
                : isPending
                ? { bg: 'rgba(245, 158, 11, 0.12)', text: '#F59E0B', border: 'rgba(245, 158, 11, 0.3)' }
                : isAction
                ? { bg: 'rgba(56, 189, 248, 0.12)', text: '#38BDF8', border: 'rgba(56, 189, 248, 0.3)' }
                : { bg: 'rgba(148, 163, 184, 0.1)', text: '#94A3B8', border: 'rgba(148, 163, 184, 0.2)' };

              return (
                <div
                  key={req.id}
                  style={{
                    background: '#0D1322',
                    border: `1px solid ${isDone ? 'rgba(16, 185, 129, 0.25)' : isPending ? 'rgba(245, 158, 11, 0.25)' : '#1E293B'}`,
                    borderRadius: '10px',
                    padding: '18px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ flex: '1 1 540px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: '#C5A059',
                          background: 'rgba(197, 160, 89, 0.1)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          border: '1px solid rgba(197, 160, 89, 0.25)',
                        }}
                      >
                        Step {req.stepNumber} of 6
                      </span>
                      <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: '#FFFFFF' }}>
                        {req.title}
                      </h3>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '3px 9px',
                          borderRadius: '4px',
                          background: badgeColors.bg,
                          color: badgeColors.text,
                          border: `1px solid ${badgeColors.border}`,
                          marginLeft: 'auto',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        {isDone ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6 7 17l-5-5" />
                            <path d="m22 10-7.5 7.5L13 16" />
                          </svg>
                        ) : isPending ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 6v6l4 2" />
                          </svg>
                        ) : isAction ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                        ) : (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="8" y1="12" x2="16" y2="12" />
                          </svg>
                        )}
                        {req.statusBadge}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 6px', fontSize: '13px', color: '#CBD5E1', lineHeight: 1.45 }}>
                      {req.reason}
                    </p>

                    {req.details && (
                      <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                        {req.details}
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <div style={{ flexShrink: 0 }}>
                    {isDone ? (
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 700,
                          color: '#10B981',
                          background: 'rgba(16, 185, 129, 0.1)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          border: '1px solid rgba(16, 185, 129, 0.25)',
                          display: 'inline-block',
                        }}
                      >
                        Verified
                      </span>
                    ) : req.id === 'trading_activation' ? (
                      <button
                        type="button"
                        onClick={() => setShowRiskModal(true)}
                        disabled={!data?.canActivateTrading}
                        style={{
                          background: data?.canActivateTrading ? '#C5A059' : '#1E293B',
                          color: data?.canActivateTrading ? '#080C14' : '#64748B',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          cursor: data?.canActivateTrading ? 'pointer' : 'not-allowed',
                        }}
                      >
                        {req.actionLabel}
                      </button>
                    ) : req.actionUrl ? (
                      <a
                        href={req.actionUrl}
                        target={req.actionUrl.startsWith('http') ? '_blank' : '_self'}
                        rel={req.actionUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                        style={{
                          background: isAction ? '#38BDF8' : '#1E293B',
                          color: isAction ? '#080C14' : '#F8FAFC',
                          textDecoration: 'none',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontWeight: 700,
                          fontSize: '12.5px',
                          display: 'inline-block',
                          border: isAction ? 'none' : '1px solid #334155',
                        }}
                      >
                        {req.actionLabel} &rarr;
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={handleCheckAgain}
                        style={{
                          background: '#1E293B',
                          border: '1px solid #334155',
                          color: '#F8FAFC',
                          padding: '8px 16px',
                          borderRadius: '6px',
                          fontSize: '12.5px',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {req.actionLabel}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

        {/* Verification Lifecycle & Roadmap (MobileSasa inspired) */}
        <section
          style={{
            background: '#0D1322',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '36px',
          }}
        >
          <header style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#C5A059' }}>
                Onboarding &amp; Execution Roadmap
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: '#FFFFFF' }}>
              Deterministic Verification Lifecycle
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', margin: 0, lineHeight: 1.5 }}>
              How your trading account transitions safely from initial partner attribution to authorized live market telemetry.
            </p>
          </header>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            <div style={{ background: '#080C14', borderRadius: '6px', padding: '16px', border: '1px solid #1E293B', borderTop: '2px solid #C5A059' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#C5A059', marginBottom: '6px' }}>01</div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>Partner Attributed</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                Account created under partner code <code style={{ color: '#E2E8F0', background: '#1E293B', padding: '1px 4px', borderRadius: '3px' }}>tohstb0d83</code>. Verified server-side against JustMarkets broker records.
              </p>
            </div>

            <div style={{ background: '#080C14', borderRadius: '6px', padding: '16px', border: '1px solid #1E293B', borderTop: '2px solid #C5A059' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#C5A059', marginBottom: '6px' }}>02</div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>Non-Custodial Deposit</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                Deposit ($10 Cent/Standard or $200 Pro) confirmed directly in your own JustMarkets account with zero platform custody.
              </p>
            </div>

            <div style={{ background: '#080C14', borderRadius: '6px', padding: '16px', border: '1px solid #1E293B', borderTop: '2px solid #C5A059' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#C5A059', marginBottom: '6px' }}>03</div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>Foundation Certified</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                All required core lessons must be completed in sequence. The early milestone is not graduation; full lessons and verified progress remain temporarily unavailable, and learning never authorizes live exposure.
              </p>
            </div>

            <div style={{ background: '#080C14', borderRadius: '6px', padding: '16px', border: '1px solid #1E293B', borderTop: '2px solid #10B981' }}>
              <div style={{ fontFamily: 'monospace', fontSize: '12px', fontWeight: 700, color: '#10B981', marginBottom: '6px' }}>04</div>
              <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px' }}>Explicit Authorization</h3>
              <p style={{ fontSize: '12px', color: '#94A3B8', margin: 0, lineHeight: 1.45 }}>
                Account linking operates in isolated volatile memory. Live trading activates only upon affirmative, signed risk acknowledgment.
              </p>
            </div>
          </div>
        </section>

        {/* Deposit Minimums & Instrument Risk Clarification Section */}
        <section
          style={{
            background: '#0D1322',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '36px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#C5A059' }}>
              Broker Transparency Disclosure
            </span>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 800, margin: '0 0 10px', color: '#FFFFFF' }}>
            JustMarkets Account Types &amp; Micro-Balance Risk Separation
          </h2>
          <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 20px' }}>
            A broker minimum deposit allows you to open an account, but it does not guarantee that micro balances can trade standard gold contracts safely. Standard 100 oz XAUUSD contracts require sufficient balance to absorb normal stop distances. Review the structure below:
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginBottom: '18px' }}>
            <div style={{ background: '#080C14', border: '1px solid #C5A059', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#C5A059' }}>Standard Cent</span>
                <span style={{ fontSize: '10px', color: '#10B981', background: 'rgba(16,185,129,0.1)', padding: '1px 6px', borderRadius: '4px' }}>Recommended for &lt;$100</span>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>$10 Min Deposit</div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '8px' }}>Contract: 1 oz (0.01 lot = 0.01 oz)</div>
              <p style={{ fontSize: '11.5px', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                A $2.00 gold stop risks ~$0.03-$0.08 on a $10 balance (under 1.0% risk). Mathematically safe for micro-tier accounts.
              </p>
            </div>

            <div style={{ background: '#080C14', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>Standard</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>$10 Min Deposit</div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '8px' }}>Contract: 100 oz (0.01 lot = 1.00 oz)</div>
              <p style={{ fontSize: '11.5px', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                Deposit minimum is $10, but a $2.00 stop risks ~$2.80 (28% of a $10 balance). Standard accounts require $100+ for responsible sizing.
              </p>
            </div>

            <div style={{ background: '#080C14', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>Pro Account</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>$200 Min Deposit</div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '8px' }}>Contract: 100 oz / Low Spreads</div>
              <p style={{ fontSize: '11.5px', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                Designed for institutional momentum strategies with tight spreads and fast market execution.
              </p>
            </div>

            <div style={{ background: '#080C14', border: '1px solid #1E293B', borderRadius: '8px', padding: '16px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#FFFFFF', marginBottom: '6px' }}>Raw Spread</div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#FFFFFF', marginBottom: '4px' }}>$200 Min Deposit</div>
              <div style={{ fontSize: '11.5px', color: '#94A3B8', marginBottom: '8px' }}>Contract: 100 oz / 0.0 Pips Spreads</div>
              <p style={{ fontSize: '11.5px', color: '#CBD5E1', margin: 0, lineHeight: 1.4 }}>
                Ultra-low spread environment with fixed commission per lot ($6 round turn), ideal for high precision order flow.
              </p>
            </div>
          </div>

          <div
            style={{
              background: 'rgba(197, 160, 89, 0.08)',
              border: '1px solid rgba(197, 160, 89, 0.25)',
              borderRadius: '6px',
              padding: '12px 16px',
              fontSize: '12px',
              color: '#CBD5E1',
              lineHeight: 1.5,
            }}
          >
            <strong>Regulatory &amp; Non-Custodial Guarantee:</strong> Velarion never holds or manages client funds. All deposits and withdrawals occur directly between you and JustMarkets. We do not charge subscriptions; our development and infrastructure are supported via Introducing Broker (IB) commissions.
          </div>
        </section>

        {/* Owner Manual Verification Support */}
        <section
          style={{
            background: '#0D1322',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '20px 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <h3 style={{ fontSize: '14.5px', fontWeight: 700, margin: '0 0 4px', color: '#FFFFFF' }}>
              Delayed Broker Synchronization or Manual Partner Review?
            </h3>
            <p style={{ fontSize: '12.5px', color: '#94A3B8', margin: 0, maxWidth: '600px' }}>
              If your JustMarkets account was registered with code <strong>tohstb0d83</strong> and you are awaiting broker ledger synchronization, contact the platform owner directly for accelerated verification.
            </p>
          </div>
          <a
            href="mailto:coordinator@velarion.internal?subject=Velarion%20Partner%20Verification%20Request"
            style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              padding: '9px 18px',
              borderRadius: 'var(--radius-xs)',
              fontSize: '12.5px',
              fontWeight: 600,
            }}
          >
            Contact Desk Coordinator &rarr;
          </a>
        </section>
      </main>

      {/* Step 6: Risk Disclosure & Affirmative Activation Modal */}
      {showRiskModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="risk-modal-title"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: '#0D1322',
              border: '1px solid #334155',
              borderRadius: '12px',
              maxWidth: '620px',
              width: '100%',
              padding: '28px',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '11px', color: '#C5A059', fontWeight: 700, textTransform: 'uppercase' }}>
                  Mandatory Final Protocol
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowRiskModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
              >
                &times;
              </button>
            </div>

            <h2 id="risk-modal-title" style={{ fontSize: '20px', fontWeight: 800, margin: '0 0 8px', color: '#FFFFFF' }}>
              Affirmative Risk Disclosures &amp; Execution Consent
            </h2>
            <p style={{ fontSize: '13px', color: '#94A3B8', lineHeight: 1.5, margin: '0 0 20px' }}>
              Automated algorithmic trading involves significant financial risk. Account linking alone will never place trades. To authorize live execution, you must affirmatively read and acknowledge all four statements:
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleActivateTrading();
              }}
              style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
            >
              <label
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: '#080C14',
                  border: `1px solid ${riskConsents.acceptMarketRisk ? '#C5A059' : '#1E293B'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={riskConsents.acceptMarketRisk}
                  onChange={(e) => setRiskConsents({ ...riskConsents, acceptMarketRisk: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#C5A059' }}
                />
                <div style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.45 }}>
                  <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '2px' }}>
                    1. Market Risk &amp; Capital Loss Potential
                  </strong>
                  I understand that trading XAUUSD involves high volatility and substantial risk of losing all invested capital. No trading strategy can guarantee profits.
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: '#080C14',
                  border: `1px solid ${riskConsents.acceptExecutionRisk ? '#C5A059' : '#1E293B'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={riskConsents.acceptExecutionRisk}
                  onChange={(e) => setRiskConsents({ ...riskConsents, acceptExecutionRisk: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#C5A059' }}
                />
                <div style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.45 }}>
                  <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '2px' }}>
                    2. Broker Execution Realities (Slippage &amp; Spreads)
                  </strong>
                  I acknowledge that real-world broker execution is subject to variable spreads, news volatility, execution latency, and slippage. Actual fill prices may differ from signal quotes.
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: '#080C14',
                  border: `1px solid ${riskConsents.acceptIbCompensation ? '#C5A059' : '#1E293B'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={riskConsents.acceptIbCompensation}
                  onChange={(e) => setRiskConsents({ ...riskConsents, acceptIbCompensation: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#C5A059' }}
                />
                <div style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.45 }}>
                  <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '2px' }}>
                    3. Introducing Broker (IB) Compensation Disclosure
                  </strong>
                  I understand that Velarion provides free access by receiving Introducing Broker commissions from JustMarkets based on trading volume, without charging subscription fees.
                </div>
              </label>

              <label
                style={{
                  display: 'flex',
                  gap: '12px',
                  background: '#080C14',
                  border: `1px solid ${riskConsents.acceptSimulationDisclaimer ? '#C5A059' : '#1E293B'}`,
                  borderRadius: '8px',
                  padding: '12px 14px',
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={riskConsents.acceptSimulationDisclaimer}
                  onChange={(e) => setRiskConsents({ ...riskConsents, acceptSimulationDisclaimer: e.target.checked })}
                  style={{ marginTop: '2px', accentColor: '#C5A059' }}
                />
                <div style={{ fontSize: '12.5px', color: '#CBD5E1', lineHeight: 1.45 }}>
                  <strong style={{ color: '#FFFFFF', display: 'block', marginBottom: '2px' }}>
                    4. Historical Simulation &amp; Performance Disclaimer
                  </strong>
                  I acknowledge that backtest metrics, hypothetical models, and historical win rates do not represent nor guarantee future trading performance.
                </div>
              </label>

              {activationError && (
                <div style={{ color: '#EF4444', fontSize: '12px', background: 'rgba(239, 68, 68, 0.12)', padding: '10px 12px', borderRadius: '6px', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                  {activationError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setShowRiskModal(false)}
                  style={{
                    background: '#1E293B',
                    border: '1px solid #334155',
                    color: '#94A3B8',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    fontSize: '13px',
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={
                    activating ||
                    !riskConsents.acceptMarketRisk ||
                    !riskConsents.acceptExecutionRisk ||
                    !riskConsents.acceptIbCompensation ||
                    !riskConsents.acceptSimulationDisclaimer
                  }
                  style={{
                    background:
                      riskConsents.acceptMarketRisk &&
                      riskConsents.acceptExecutionRisk &&
                      riskConsents.acceptIbCompensation &&
                      riskConsents.acceptSimulationDisclaimer
                        ? '#C5A059'
                        : '#334155',
                    color:
                      riskConsents.acceptMarketRisk &&
                      riskConsents.acceptExecutionRisk &&
                      riskConsents.acceptIbCompensation &&
                      riskConsents.acceptSimulationDisclaimer
                        ? '#080C14'
                        : '#64748B',
                    border: 'none',
                    padding: '9px 20px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor:
                      riskConsents.acceptMarketRisk &&
                      riskConsents.acceptExecutionRisk &&
                      riskConsents.acceptIbCompensation &&
                      riskConsents.acceptSimulationDisclaimer
                        ? 'pointer'
                        : 'not-allowed',
                  }}
                >
                  {activating ? 'Authorizing...' : 'Authorize Live Execution'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#080C14', color: '#94A3B8', padding: '40px', textAlign: 'center' }}>Loading verification status...</div>}>
      <VerificationContent />
    </Suspense>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LiveSpotFeed, { QuoteResponse } from '@/components/LiveSpotFeed';

interface HomeHeroProps {
  initialSignedIn: boolean;
  initialQuote?: QuoteResponse | null;
}

export default function HomeHero({ initialSignedIn, initialQuote }: HomeHeroProps) {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(initialSignedIn);
  const [accountId, setAccountId] = useState<string>('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsSignedIn(true);
          const user = data.user || data.session;
          if (user?.mt5Account || user?.accountId) {
            setAccountId(user.mt5Account || user.accountId);
          }
        } else {
          setIsSignedIn(false);
        }
      })
      .catch(() => {
        // Fallback to initial prop
      });
  }, []);

  return (
    <section className="hero-wrap">
      <div className="container-main">
        <div className="hero-grid">
          {/* Left Column: Dynamic Hero Content based on Auth State */}
          <div>
            {isSignedIn ? (
              /* ============================================================== */
              /* SIGNED-IN INSTITUTIONAL TRADER HERO (ZERO MARKETING ICONS)     */
              /* ============================================================== */
              <div>
                <div className="section-eyebrow">
                  <span>Velarion Markets &bull; Verified Institutional Trader</span>
                </div>

                <h1 className="hero-heading" style={{ fontSize: '38px', lineHeight: 1.2 }}>
                  Institutional Spot Gold (XAUUSD) AI Terminal &amp; Professional Academy
                </h1>

                <p className="hero-description">
                  Welcome back{accountId ? `, Trader #${accountId}` : ''}. Your quantitative trading terminal, live trade execution telemetry, and 30-lesson structured curriculum are fully active and unlocked under our official JustMarkets partnership.
                </p>

                {/* Direct Command Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
                  <Link
                    href="/terminal"
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Launch AI Terminal &rarr;
                  </Link>
                  <Link
                    href="/academy"
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Continue Forex School &rarr;
                  </Link>
                  <Link
                    href="/tools/growth-calculator"
                    className="btn btn-outline-gold"
                    style={{ padding: '12px 20px', fontSize: '13px' }}
                  >
                    200-Pip Calculator
                  </Link>
                </div>

                {/* Authenticated Trader Status Bar (No checkmarks, clean typography) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '20px'
                }}>
                  <div style={{ padding: '10px 14px', background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>MT5 Access</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>Verified &bull; Active</div>
                  </div>

                  <div style={{ padding: '10px 14px', background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Auto-Trader</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '2px' }}>Active on XAUUSD</div>
                  </div>

                  <div style={{ padding: '10px 14px', background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Curriculum Gate</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>BabyPips Standards</div>
                  </div>
                </div>
              </div>
            ) : (
              /* ============================================================== */
              /* GUEST HERO: 3-STEP VALUE PROPOSITION & ACCESS PROMO            */
              /* ============================================================== */
              <div>
                <div className="section-eyebrow">
                  <span>Velarion Markets &bull; Spot Gold (XAUUSD)</span>
                </div>

                <h1 className="hero-heading" style={{ fontSize: '38px', lineHeight: 1.2 }}>
                  Institutional Spot Gold (XAUUSD) AI Analysis &amp; Complete 30-Lesson Forex Academy &mdash; 100% Free.
                </h1>

                <p className="hero-description">
                  Zero subscriptions. Zero hidden fees. Unlock full access to our 4 quantitative XAUUSD models and 30-lesson curriculum simply by opening and funding your trading account with our official partner, JustMarkets.
                </p>

                {/* CTAs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
                  <a
                    href="#how-to-get-access"
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Unlock Instant Access (Free) &rarr;
                  </a>
                  <Link
                    href="/tools/growth-calculator"
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Try the 200-Pip Growth Calculator
                  </Link>
                </div>

                {/* 3 Trust Signals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--accent-green-subtle)',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      &#10003;
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Broker-Backed &amp; 100% Free:</strong> Subsidized by official broker partner JustMarkets with non-custodial protection.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--accent-green-subtle)',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      &#10003;
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Non-Custodial Architecture:</strong> Zero deposits to Velarion. All trading capital remains securely inside your regulated MT5 account.
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px' }}>
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      background: 'var(--accent-green-subtle)',
                      color: 'var(--accent-green)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '11px',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '2px'
                    }}>
                      &#10003;
                    </div>
                    <div>
                      <strong style={{ color: 'var(--text-primary)' }}>Systematic Methodology:</strong> Rules-based execution models calibrated strictly for XAUUSD liquidity structures and volatility profiles.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Clean Institutional Market Information Panel */}
          <div>
            <LiveSpotFeed initialQuote={initialQuote} />
          </div>
        </div>
      </div>
    </section>
  );
}

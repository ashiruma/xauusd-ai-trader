'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import LiveSpotFeed, { QuoteResponse } from '@/components/LiveSpotFeed';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

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
                  <span>Velarion Markets / Verified Institutional Trader</span>
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
                    <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>Verified / Active</div>
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
                  <span>Velarion Markets / Spot Gold (XAUUSD)</span>
                </div>

                <h1 className="hero-heading" style={{ fontSize: '38px', lineHeight: 1.2 }}>
                  Institutional Spot Gold (XAUUSD) AI Analysis &amp; 30-Lesson Forex Academy
                </h1>

                <p className="hero-description">
                  No platform subscription fee. Access to our 4 quantitative XAUUSD models, live terminal telemetry, and 30-lesson curriculum is subsidized by our Introducing Broker partnership with JustMarkets when you register with partner code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code> and maintain a verified funded account. Broker spreads and trading capital risk apply.
                </p>

                {/* CTAs & IB Relationship Transparency */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  <Link
                    href="/onboarding"
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Begin Onboarding Protocol &rarr;
                  </Link>
                  <Link
                    href="/tools/growth-calculator"
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    200-Pip Growth Calculator
                  </Link>
                </div>

                {/* IB Relationship & Conflict Disclosure Note */}
                <div style={{
                  padding: '10px 14px',
                  background: 'rgba(245, 158, 11, 0.05)',
                  border: '1px solid rgba(245, 158, 11, 0.2)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '11.5px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.5,
                  marginBottom: '28px'
                }}>
                  <strong style={{ color: 'var(--accent-gold)' }}>Commercial Disclosure:</strong> Velarion Markets operates as an Introducing Broker (IB). When you open an account via partner code <span className="mono-nums">{DEFAULT_PARTNER_CONFIG.primaryCode}</span> and trade, Velarion receives volume-based commission/spread rebates from JustMarkets. This creates an economic incentive to promote trading activity. Your capital is at risk. <Link href="/legal/ib-disclosure" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Read full IB Disclosure</Link>.
                </div>

                {/* 3 Trust Signals */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>
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
                      <strong style={{ color: 'var(--text-primary)' }}>No Platform Subscription Fee:</strong> Subsidized via JustMarkets IB volume compensation; broker spreads and deposit capital risk apply.
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

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

interface HomeAccessSectionProps {
  initialSignedIn: boolean;
}

export default function HomeAccessSection({ initialSignedIn }: HomeAccessSectionProps) {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(initialSignedIn);

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        setIsSignedIn(Boolean(data.authenticated));
      })
      .catch(() => {
        // Fallback to initial
      });
  }, []);

  if (isSignedIn) {
    /* ============================================================== */
    /* AUTHENTICATED TRADER COMMAND CENTER (ZERO MARKETING ICONS)     */
    /* ============================================================== */
    return (
      <section style={{ padding: '56px 0', background: 'var(--bg-surface-1)', borderBottom: '1px solid var(--border-default)' }}>
        <div className="container-main">
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <span className="section-eyebrow">Trader Command Center</span>
            <h2 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: '10px' }}>
              Your Institutional Trading &amp; Learning Hub
            </h2>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
              Direct access to real-time algorithmic execution, curriculum progression, and capital compounding models.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            {/* Command Hub Card 1: Terminal */}
            <div className="feature-card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className="status-badge status-completed">LIVE TELEMETRY</span>
                  <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>AUTONOMOUS</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  AI Trading Terminal
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Live Spot Gold feeds, autonomous trade execution engine, open positions, floating PnL, and consensus strategy signals mapped to Academy lessons.
                </p>
              </div>
              <div style={{ marginTop: '20px' }}>
                <Link
                  href="/terminal"
                  className="btn btn-primary"
                  style={{ width: '100%', fontSize: '13px', padding: '10px 16px' }}
                >
                  Enter AI Terminal &rarr;
                </Link>
              </div>
            </div>

            {/* Command Hub Card 2: Forex Academy */}
            <div className="feature-card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className="status-badge status-warning">SEQUENTIAL CURRICULUM</span>
                  <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>30 LESSONS</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  Forex School &bull; Spot Gold
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Sequential gated curriculum backed by BabyPips factual standards. Pass mandatory comprehension checks to unlock advanced institutional strategies.
                </p>
              </div>
              <div style={{ marginTop: '20px' }}>
                <Link
                  href="/academy"
                  className="btn btn-secondary"
                  style={{ width: '100%', fontSize: '13px', padding: '10px 16px' }}
                >
                  Resume Forex School &rarr;
                </Link>
              </div>
            </div>

            {/* Command Hub Card 3: Growth Calculator */}
            <div className="feature-card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                  <span className="status-badge status-neutral">RISK ENGINE</span>
                  <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-green)' }}>2.0% LIMIT</span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  200-Pip Growth Calculator
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Simulate mathematical account compounding with disciplined micro-lot sizing. Calculate risk parameters for $10 to $1,000+ balances.
                </p>
              </div>
              <div style={{ marginTop: '20px' }}>
                <Link
                  href="/tools/growth-calculator"
                  className="btn btn-outline-gold"
                  style={{ width: '100%', fontSize: '13px', padding: '10px 16px' }}
                >
                  Launch Calculator &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ============================================================== */
  /* GUEST CONVERSION FUNNEL: 3-STEP SPONSORED ACCESS               */
  /* ============================================================== */
  return (
    <section id="how-to-get-access" style={{ padding: '64px 0', background: 'var(--bg-surface-1)', borderBottom: '1px solid var(--border-default)' }}>
      <div className="container-main">
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <span className="section-eyebrow">Zero Cost Institutional Access</span>
          <h2 style={{ fontSize: '30px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.4px', marginBottom: '12px' }}>
            How to Get 100% Free Access in 3 Steps
          </h2>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto', lineHeight: 1.6 }}>
            Velarion Markets is completely subsidized through our regulated broker partnership with JustMarkets. You keep 100% custody of your trading deposit.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Step 1 */}
          <div className="feature-card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-gold)' }}>01</span>
                <span className="status-badge status-completed">PARTNER GATEWAY</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                Register on JustMarkets
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Open your MT5 trading account through our official partner link. Partner code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code> is automatically applied to sponsor your full access.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <a
                href={DEFAULT_PARTNER_CONFIG.primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ width: '100%', fontSize: '13px', padding: '11px 16px' }}
              >
                Register on JustMarkets &rarr;
              </a>
            </div>
          </div>

          {/* Step 2 */}
          <div className="feature-card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-gold)' }}>02</span>
                <span className="status-badge status-completed">100% CUSTODY</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                Fund Your MT5 Account
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Make your initial trading deposit directly into your own JustMarkets account. Velarion Markets never touches your money—your trading capital remains securely inside your own regulated broker account.
              </p>
            </div>
            <div style={{ marginTop: '24px', padding: '12px 14px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Zero management fees. 100% non-custodial capital security.
            </div>
          </div>

          {/* Step 3 */}
          <div className="feature-card-clean" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '28px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <span className="mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-gold)' }}>03</span>
                <span className="status-badge status-completed">INSTANT UNLOCK</span>
              </div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-primary)' }}>
                Instant MT5 Verification
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Enter your JustMarkets MT5 Account ID on our verification page. Once verified under partner code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code>, you immediately unlock all 30 Forex lessons and the AI terminal.
              </p>
            </div>
            <div style={{ marginTop: '24px' }}>
              <Link
                href="/onboarding"
                className="btn btn-outline-gold"
                style={{ width: '100%', fontSize: '13px', padding: '11px 16px' }}
              >
                Verify Account &amp; Unlock &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Risk & Performance | Truthful Analysis of Trading Expectancy',
  description: 'Unvarnished audit and mathematical analysis of the 160 historical trades sample, loss asymmetry resolution, Candidate Strategy v2, and demo-first release boundary.',
};

export default function RiskAndPerformancePage() {
  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Header Banner */}
      <section style={{ borderBottom: '1px solid var(--border-default)', padding: '56px 24px 48px', backgroundColor: 'var(--bg-surface-1)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--accent-red)',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Institutional Risk Disclosure &amp; Truthful Audit
          </span>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '6px',
              letterSpacing: '-0.5px',
            }}
          >
            Risk &amp; Performance Audit
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '760px', marginTop: '8px', lineHeight: 1.6 }}>
            At Velarion, we treat historical trading samples as risk warnings, not marketing assets. We do not present win rates in isolation or fabricate live track records. Here is the unvarnished analysis of historical testing data, why high win rates can produce net losses, and how our risk architecture corrects this.
          </p>
        </div>
      </section>

      {/* Main Content Sections */}
      <section style={{ padding: '64px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>

          {/* 1. Historical 160-Trade Sample Audit */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '16px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-red)', fontWeight: 700, textTransform: 'uppercase' }}>
                CASE STUDY / HISTORICAL VIDEO SAMPLE
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'rgba(185, 28, 28, 0.1)',
                  color: 'var(--accent-red)',
                  border: '1px solid var(--accent-red-border)',
                }}
              >
                NEGATIVE NET EXPECTANCY
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              The Fallacy of Win Rate Alone: 160 VIDEO-Tagged Trades
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              In historical trading records, a sample of 160 VIDEO-tagged trades appeared superficially successful with a <strong>73.75% win rate</strong> (118 wins, 42 losses). However, the net result was a loss of <strong>-$163.57</strong>, compounded by a 10-position sell basket closed near <strong>-$202.17</strong>.
            </p>

            {/* Metrics Breakdown Table */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '24px',
              }}
            >
              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sample Size</div>
                <div className="mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>160 Trades</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Historical telemetry</div>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Nominal Win Rate</div>
                <div className="mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>73.75%</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>118 wins / 42 losses</div>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Win</div>
                <div className="mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>+$0.38</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Premature profit taking</div>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px', textAlign: 'center' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Average Loss</div>
                <div className="mono-nums" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-red)', marginTop: '4px' }}>-$5.09</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>Asymmetric loss tail</div>
              </div>
            </div>

            {/* Mathematical Expectancy Breakdown */}
            <div
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                padding: '18px',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'var(--text-secondary)',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Mathematical Expectancy Calculation:</strong>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12.5px', color: 'var(--accent-red)', margin: '8px 0' }}>
                Expectancy = (0.7375 x $0.38) - (0.2625 x $5.09) = $0.28 - $1.34 = -$1.06 per trade
              </div>
              Despite winning nearly 3 out of every 4 trades, the system lost an average of $1.06 on every single trade executed. A single loss wiped out more than 13 consecutive winning trades.
            </div>
          </div>

          {/* 2. Root Cause Analysis */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px' }}>
              Why Did This Happen? Two Flaws in Legacy Execution
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>FLAW 01</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0 8px' }}>
                  Premature Trailing Stops
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  The legacy logic locked trailing stops too aggressively (+25 to +80 points), cutting off the right tail of winning distributions before trends could materialize. Wins were capped at micro-fractions ($0.25-$0.80).
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase' }}>FLAW 02</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0 8px' }}>
                  Multi-Position Basket Stacking
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  Losing trades were allowed to average down into multi-position baskets. When gold trended strongly against the position, a 10-position sell basket accumulated a catastrophic -$202.17 loss, severely damaging account equity.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Candidate Strategy v2 Resolution */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase' }}>
              CORRECTIVE ARCHITECTURE
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 14px' }}>
              How Candidate Strategy v2 Enforces Positive Expectancy
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Candidate Strategy v2 (`TrendContinuationV2Strategy`) eliminates both flaws with three non-negotiable mathematical rules:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                  RULE 1
                </span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Strictly Single-Ticket Execution:</strong> Averaging down, martingale lot multipliers, and grid basket stacking are completely prohibited. Maximum open positions is strictly bounded to 1.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                  RULE 2
                </span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>1.8:1 Minimum Risk-to-Reward Ratio:</strong> Every order must target at least 1.8x the risk distance (typically 2.0:1 to 2.5:1). A $2.80 stop loss targets at least $5.04 to $7.00.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                  RULE 3
                </span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>ATR Dynamic Protective Stops:</strong> Pre-trade stop losses are calculated dynamically using 1.3 ATR + structural swing anchors. If worst-case loss exceeds the account risk ceiling (2.0%), the trade is rejected pre-flight.
                </div>
              </div>
            </div>

            <div
              style={{
                background: 'var(--accent-green-subtle)',
                border: '1px solid var(--accent-green-border)',
                borderRadius: '8px',
                padding: '16px',
                fontSize: '13px',
                color: 'var(--text-primary)',
              }}
            >
              <strong>Expectancy With 2.0:1 R:R at 48% Win Rate:</strong>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-green)', marginTop: '4px' }}>
                Expectancy = (0.48 x $5.32) - (0.52 x $2.80) = $2.55 - $1.46 = +$1.09 per trade
              </div>
              With disciplined risk-to-reward asymmetry, the system generates positive mathematical expectancy even when losing more trades than it wins.
            </div>
          </div>

          {/* 4. Release Boundary: Demo-First Validation */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#0369A1', fontWeight: 700, textTransform: 'uppercase' }}>
              RELEASE GOVERNANCE
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 12px' }}>
              Release Boundary: Demo-First Stage
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Because live algorithmic execution involves real capital risk, Velarion enforces a strict demo-first validation stage:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 20px' }}>
              <li><strong>Automation is OFF by default:</strong> No automated orders can be submitted without explicit user confirmation.</li>
              <li><strong>Demo-Only Execution in Initial Release:</strong> Live order execution is gated and locked behind operational readiness gates.</li>
              <li><strong>Fail-Closed Gate Checks:</strong> If demo eligibility or school prerequisites cannot be confirmed, the system fails closed.</li>
              <li><strong>Truth in Advertising:</strong> We never fabricate track records, guarantee profits, or claim millionaire outcomes.</li>
            </ul>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/how-it-works"
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-surface-1)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                }}
              >
                Review How It Works &rarr;
              </Link>
              <Link
                href="/login"
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-gold)',
                  color: '#000000',
                  borderRadius: '6px',
                }}
              >
                Enter Member Portal &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer */}
      <section style={{ backgroundColor: 'var(--bg-surface-2)', borderTop: '1px solid var(--border-default)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Important Risk Notice: </strong>
          Past performance, backtest models, and simulated scenarios do not guarantee future results. Leveraged trading in spot gold can result in substantial financial loss. Only trade with risk capital.
        </div>
      </section>
    </div>
  );
}

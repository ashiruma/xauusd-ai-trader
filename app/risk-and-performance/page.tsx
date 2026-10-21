import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/risk-and-performance' },
  openGraph: { url: 'https://velarion-one.vercel.app/risk-and-performance' },
  title: 'Risk & Performance | Truthful Analysis of Trading Expectancy',
  description: 'Reported historical trading figures are unverified and pending reconciliation; candidate risk controls and hypothetical expectancy are not demonstrated performance.'
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
            At Velarion, we treat historical trading samples as risk warnings, not marketing assets. We do not present win rates in isolation or fabricate live track records. Here is the unvarnished analysis of historical testing data, why high win rates can produce net losses, and how candidate controls are intended to address these risks; this is not verified performance.
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
                REPORTED LOSS — RECONCILIATION PENDING
              </span>
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px' }}>
              The Fallacy of Win Rate Alone: 160 VIDEO-Tagged Trades
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              An unverified historical account describes 160 VIDEO-tagged trades, a reported <strong>73.75% win rate</strong> (118 wins, 42 losses), a reported net result of <strong>-$163.57</strong>, and a 10-position sell basket reported near <strong>-$202.17</strong>. These figures have not been independently verified.
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
              <strong style={{ color: 'var(--text-primary)' }}>Reported figures do not reconcile; expectancy calculation pending:</strong>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '12.5px', color: 'var(--accent-red)', margin: '8px 0' }}>
                118 x $0.38 - 42 x $5.09 = -$168.94, not the reported -$163.57. TODO: Owner to reconcile source ledger, costs, date range, and demo/live status before presenting as verified.
              </div>
              Reported averages imply a negative result but do not reconcile to the reported total. Root cause and per-trade interpretation remain unverified pending source-ledger and cost reconciliation.
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
              Unverified Root-Cause Hypotheses — Reconciliation Pending
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>FLAW 01</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0 8px' }}>
                  Premature Trailing Stops
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  Pending verification against the source records: the proposed explanation is that trailing stops may have limited winners. Do not treat this as an established cause.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-red)', textTransform: 'uppercase' }}>FLAW 02</span>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '6px 0 8px' }}>
                  Multi-Position Basket Stacking
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  Pending verification against the source records: the reported basket loss and averaging-down explanation remain unverified until the ledger, costs, and trade dates are reconciled.
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
              Candidate Strategy v2: Intended Controls, Not Demonstrated Results
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
              Candidate Strategy v2 (`TrendContinuationV2Strategy`) is described as intending to address these risks with the following controls; implementation and outcomes require validation:
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                  RULE 1
                </span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Intended single-ticket control:</strong> The candidate design specifies one open position and no averaging down, martingale multipliers, or grid stacking; verify enforcement before relying on it.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                  RULE 2
                </span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Intended risk/reward constraint:</strong> The design describes a target of at least 1.8x the risk distance; actual order behavior and realized ratios are not validated here.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-green)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                  RULE 3
                </span>
                <div>
                  <strong style={{ color: 'var(--text-primary)' }}>Intended stop and risk checks:</strong> ATR-based stops and pre-trade risk checks are candidate controls subject to validation. Stops may not fill at the requested price, and losses can exceed estimates.
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
              <strong>Illustrative hypothetical only — assumes 48% wins, 2:1 reward/risk, before costs; no observed win rate or demonstrated edge:</strong>
              <div style={{ fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-green)', marginTop: '4px' }}>
                Expectancy = (0.48 x $5.60) - (0.52 x $2.80) = $2.688 - $1.456 = $1.232 (~$1.23) per trade
              </div>
              This arithmetic is an assumption-based illustration before costs only; it does not establish strategy performance, an edge, or future results.
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
              Because live algorithmic execution involves risk, the intended release approach is demo-first validation; actual gates and enforcement require verification:
            </p>
            <ul style={{ paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: '0 0 20px' }}>
              <li><strong>Automation is intended to remain OFF until separately and explicitly activated by the user.</strong> Verify actual enforcement.</li>
              <li><strong>Demo-first validation is intended.</strong> Live execution availability and readiness gates remain unverified.</li>
              <li><strong>Eligibility and prerequisite checks are intended controls.</strong> Verify their operation before relying on them.</li>
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

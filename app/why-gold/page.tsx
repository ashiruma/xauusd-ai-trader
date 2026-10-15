import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  title: 'Why Spot Gold (XAUUSD) Only | Institutional Macro Advantage',
  description: 'Discover why Velarion Markets trades Spot Gold exclusively: $130B+ daily liquidity, central bank sovereign accumulation, clean session expansions, and clear macro drivers.',
  openGraph: {
    title: 'Why Spot Gold (XAUUSD) Only | Velarion Markets',
    description: 'Detailed breakdown of the macroeconomic and mathematical advantages of trading Spot Gold over retail currency pairs.',
    url: 'https://xauusd-ai-trader.vercel.app/why-gold'
  }
};

export default function WhyGoldPage() {
  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>Why Spot Gold</span>
      </nav>

      <div className="section-eyebrow">
        <span>Institutional Macro Thesis</span>
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '16px', letterSpacing: '-0.5px' }}>
        Why Spot Gold (XAUUSD) Only: The Institutional Quantitative Advantage
      </h1>

      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '36px' }}>
        In retail Forex, traders often spread their attention across 20+ currency pairs, falling victim to conflicting correlation risks, central bank intervention surprises, and unpredictable bilateral geopolitics. Velarion Markets concentrates 100% of our algorithmic intelligence on a single sovereign asset: Spot Gold.
      </p>

      {/* 4 Pillars Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
        <div className="feature-card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="status-badge status-completed">PILLAR 01</span>
            <span className="mono-nums" style={{ color: 'var(--accent-gold)', fontSize: '11px' }}>LIQUIDITY</span>
          </div>
          <h3>$130B+ Daily Turnover</h3>
          <p>
            Spot Gold is one of the deepest financial markets on earth. The massive volume ensures immediate order fills with zero dealer re-quotes and minimal slippage during high-impact data releases.
          </p>
        </div>

        <div className="feature-card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="status-badge status-completed">PILLAR 02</span>
            <span className="mono-nums" style={{ color: 'var(--accent-gold)', fontSize: '11px' }}>SOVEREIGN</span>
          </div>
          <h3>Central Bank Accumulation</h3>
          <p>
            Global central banks are diversifying sovereign reserves away from fiat treasuries into physical bullion, providing persistent long-term structural institutional demand.
          </p>
        </div>

        <div className="feature-card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="status-badge status-completed">PILLAR 03</span>
            <span className="mono-nums" style={{ color: 'var(--accent-gold)', fontSize: '11px' }}>MACRO MATH</span>
          </div>
          <h3>Real Yield Sensitivity</h3>
          <p>
            Gold acts as a zero-coupon perpetual sovereign asset. Its price movements correlate inversely with US 10-Year TIPS real yields and the broad Dollar index (DXY).
          </p>
        </div>

        <div className="feature-card-clean">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span className="status-badge status-completed">PILLAR 04</span>
            <span className="mono-nums" style={{ color: 'var(--accent-gold)', fontSize: '11px' }}>SESSION REGIMES</span>
          </div>
          <h3>Predictable Session Liquidity</h3>
          <p>
            The Asian session sets clean overnight liquidity boundaries, which are systematically swept during the London open (07:00 UTC) and expanded through the New York overlap.
          </p>
        </div>
      </div>

      {/* Deep-Dive Article Section */}
      <div className="panel-card" style={{ padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Eliminating Multi-Pair Noise and Correlation Friction
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
          When trading multiple currency crosses (e.g. EURUSD, GBPUSD, AUDUSD, USDJPY), retail accounts routinely take on hidden correlated beta. A single US interest rate decision can trigger simultaneous stop-outs across five different pairs, causing severe drawdown ruin.
        </p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '24px' }}>
          By focusing exclusively on Spot Gold, our quantitative execution architecture isolates one balance sheet, eliminates cross-pair noise, and captures the cleanest 200-pip trend expansions in modern finance.
        </p>

        <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Algorithmic Execution on JustMarkets MT5
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
          Our models execute on JustMarkets MT5 with raw ECN spreads averaging 2.6 pips, non-custodial capital protection, and direct server execution. Traders retain 100% custody over deposits and withdrawals, while Velarion handles signal computation.
        </p>
      </div>

      {/* CTA Box */}
      <div style={{
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Calculate Your XAUUSD Compounding Trajectory
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Use our 200-Pip Growth Engine Calculator to model disciplined 2.0% risk sizing on Gold.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/tools/growth-calculator" className="btn btn-primary">
            Launch Calculator &rarr;
          </Link>
          <a
            href={DEFAULT_PARTNER_CONFIG.primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Open MT5 Account
          </a>
        </div>
      </div>
    </div>
  );
}

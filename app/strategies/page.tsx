import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/strategies' },
  title: 'Quantitative XAUUSD Trading Models | Velarion Markets',
  description: 'Detailed specifications for the 4 quantitative algorithmic models executed by Velarion Markets on Spot Gold (XAUUSD): SMC Liquidity Sweep, Dynamic Trend, Session Breakout, and Mean Reversion.',
  openGraph: {
    title: 'Quantitative XAUUSD Trading Models | Velarion Markets',
    description: 'Systematic algorithmic trading strategies calibrated exclusively for Spot Gold on MT5.',
    url: 'https://velarion-one.vercel.app/strategies'
  }
};

export default function StrategiesPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>Quantitative Strategies</span>
      </nav>

      <div className="section-eyebrow">
        <span>Systematic Algorithmic Execution</span>
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '16px' }}>
        Quantitative XAUUSD Trading Strategies
      </h1>

      <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '40px' }}>
        Every trade recommendation produced by Velarion is derived from mathematical rules rather than emotional discretion. Discover the 4 quantitative models and our multi-agent consensus architecture.
      </p>

      {/* 4 Models Breakdown */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '48px' }}>
        {/* Model 01 */}
        <div className="panel-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge" style={{ background: 'rgba(230, 187, 89, 0.12)', color: 'var(--accent-gold)' }}>
                MODEL 01 &bull; LIQUIDITY POOLS
              </span>
              <span className="status-badge status-completed">ACTIVE</span>
            </div>
            <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700 }}>
              TARGET: 80 - 150 PIPS
            </span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Smart Money Concepts (SMC) Liquidity Sweep
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            Institutional market makers deliberately push price beyond obvious retail stops placed above previous Asian session highs and lows. This model detects fake-out sweeps, waiting for exhaustion wicks and rapid 5-minute candle closes back inside the range.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '6px', fontSize: '12.5px' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Entry Trigger</strong>
              <span style={{ color: 'var(--text-primary)' }}>Asian Range High/Low Sweep + Pinbar Rejection</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stop Loss</strong>
              <span style={{ color: 'var(--accent-red)' }}>5 pips above/below sweep wick extreme</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Take Profit</strong>
              <span style={{ color: 'var(--accent-green)' }}>Opposite Asian range equilibrium (R:R 2.5+)</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Optimal Window</strong>
              <span style={{ color: 'var(--accent-gold)' }}>London Open (07:00 &ndash; 09:30 UTC)</span>
            </div>
          </div>
        </div>

        {/* Model 02 */}
        <div className="panel-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge" style={{ background: 'rgba(25, 184, 120, 0.12)', color: 'var(--accent-green)' }}>
                MODEL 02 &bull; MOMENTUM
              </span>
              <span className="status-badge status-completed">ACTIVE</span>
            </div>
            <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--accent-green)', fontWeight: 700 }}>
              TARGET: 150 - 250 PIPS
            </span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Dynamic Trend Pullback Architecture
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            Designed to ride extended macroeconomic trends. The model confirms directional alignment using the 50-period and 200-period Exponential Moving Averages on 1-hour and 4-hour timeframes, entering on controlled pullbacks into the dynamic value zone.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '6px', fontSize: '12.5px' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Entry Trigger</strong>
              <span style={{ color: 'var(--text-primary)' }}>Pullback to 50 EMA with RSI reset &gt; 40 / &lt; 60</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stop Loss</strong>
              <span style={{ color: 'var(--accent-red)' }}>Trailing 1.5x ATR below swing structural low</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Take Profit</strong>
              <span style={{ color: 'var(--accent-green)' }}>Dynamic Volatility Ratchet (200-pip target)</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Optimal Window</strong>
              <span style={{ color: 'var(--accent-gold)' }}>London / NY Overlap (12:30 &ndash; 16:30 UTC)</span>
            </div>
          </div>
        </div>

        {/* Model 03 */}
        <div className="panel-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-blue)' }}>
                MODEL 03 &bull; VOLATILITY EXPANSION
              </span>
              <span className="status-badge status-completed">ACTIVE</span>
            </div>
            <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--accent-blue)', fontWeight: 700 }}>
              TARGET: 100 - 180 PIPS
            </span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Session Range Breakout Engine
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            Measures compression in the 30 minutes leading up to the London (07:00 UTC) and New York (12:30 UTC) opens. Executes breakout stop orders once ATR expands beyond the 90th percentile of morning volatility.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '6px', fontSize: '12.5px' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Entry Trigger</strong>
              <span style={{ color: 'var(--text-primary)' }}>Pre-session 15-min range high/low expansion</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stop Loss</strong>
              <span style={{ color: 'var(--accent-red)' }}>Midpoint of pre-session breakout range</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Take Profit</strong>
              <span style={{ color: 'var(--accent-green)' }}>2.0x pre-session range projection</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Optimal Window</strong>
              <span style={{ color: 'var(--accent-gold)' }}>06:55 &ndash; 07:15 UTC &amp; 12:25 &ndash; 12:45 UTC</span>
            </div>
          </div>
        </div>

        {/* Model 04 */}
        <div className="panel-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)' }}>
                MODEL 04 &bull; STATISTICAL
              </span>
              <span className="status-badge status-completed">ACTIVE</span>
            </div>
            <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
              TARGET: 40 - 70 PIPS
            </span>
          </div>

          <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Statistical Mean Reversion
          </h2>

          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
            Monitors quiet, range-bound market regimes during the late New York and early Asian sessions. Triggers counter-trend entries when price reaches 2.5 standard deviations from the volume-weighted average price (VWAP).
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '6px', fontSize: '12.5px' }}>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Entry Trigger</strong>
              <span style={{ color: 'var(--text-primary)' }}>&plusmn;2.5 Bollinger Band touch + RSI 14 extreme</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Stop Loss</strong>
              <span style={{ color: 'var(--accent-red)' }}>Tight 20-pip structural buffer</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Take Profit</strong>
              <span style={{ color: 'var(--accent-green)' }}>20-period central VWAP baseline</span>
            </div>
            <div>
              <strong style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Optimal Window</strong>
              <span style={{ color: 'var(--accent-gold)' }}>Asian Session (21:00 &ndash; 04:00 UTC)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Agent Consensus Architecture */}
      <div className="panel-card" style={{ padding: '32px', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px' }}>
          Multi-Agent Consensus Engine &amp; Dynamic Risk Governor
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
          No individual model has unilateral authority to execute trades. The AI Consensus Engine requires multi-agent cross-verification. If the Trend Pullback model produces a BUY signal while the Liquidity Sweep model detects an overhead liquidity trap, the trade is rejected to prevent whipsaws.
        </p>

        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--accent-gold)', margin: '20px 0 10px' }}>
          Balance-Tiered Risk Allocation
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '16px' }}>
          Position sizing automatically scales based on account equity:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', fontSize: '12.5px' }}>
          <div style={{ background: 'var(--bg-surface-2)', padding: '14px', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--accent-gold)', display: 'block', marginBottom: '4px' }}>Micro Tier ($10 - $50)</strong>
            <span>Preserves capital with minimum 0.01 lot size, 1.2&ndash;1.5 R:R, and strict 2% max risk per trade.</span>
          </div>
          <div style={{ background: 'var(--bg-surface-2)', padding: '14px', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--accent-green)', display: 'block', marginBottom: '4px' }}>Growth Tier ($100 - $500)</strong>
            <span>Balanced compounding targeting 2.0 R:R with trailing stop ratchets on 100-pip trends.</span>
          </div>
          <div style={{ background: 'var(--bg-surface-2)', padding: '14px', borderRadius: '6px' }}>
            <strong style={{ color: 'var(--accent-blue)', display: 'block', marginBottom: '4px' }}>Institutional Tier ($1,000+)</strong>
            <span>Extended 3.0+ R:R scaling across multi-day 200-pip momentum expansions.</span>
          </div>
        </div>
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
            Ready to Inspect Live Execution Telemetry?
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Access our live terminal with non-custodial JustMarkets MT5 verification.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link href="/terminal" className="btn btn-primary">
            Launch Trading Terminal &rarr;
          </Link>
          <a
            href={DEFAULT_PARTNER_CONFIG.primaryLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary"
          >
            Open Partner MT5
          </a>
        </div>
      </div>
    </div>
  );
}

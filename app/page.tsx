import React from 'react';
import Link from 'next/link';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata = {
  title: 'Velarion Markets | Institutional XAUUSD Quantitative Trading & Forex Academy',
  description: 'Institutional-grade XAUUSD spot gold market structure analysis, four systematic quantitative models, 200-pip growth calculator, and 30-lesson interactive Forex school subsidized by JustMarkets.'
};

export default function HomePage() {
  return (
    <div>
      {/* ============================================================== */}
      {/* HERO SECTION: BALANCED 2-COLUMN INSTITUTIONAL LAYOUT          */}
      {/* ============================================================== */}
      <section className="hero-wrap">
        <div className="container-main">
          <div className="hero-grid">
            {/* Left Column: Mission, Value Proposition, and Trust Signals */}
            <div>
              <div className="section-eyebrow">
                <span className="dot-indicator" />
                <span>Velarion Markets &bull; Spot Gold (XAUUSD)</span>
              </div>

              <h1 className="hero-heading">
                Trade with Clarity.<br />
                Learn with Discipline.
              </h1>

              <p className="hero-description">
                Velarion Markets is an institutional-grade platform combining advanced XAUUSD market analysis, four quantitative execution models, and a structured 30-lesson Forex academy. Built for disciplined traders.
              </p>

              {/* CTAs */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '36px' }}>
                <Link
                  href="/terminal"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Explore Trading Terminal &rarr;
                </Link>
                <Link
                  href="/academy"
                  className="btn btn-secondary"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Explore Forex Education
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
                    <strong style={{ color: 'var(--text-primary)' }}>Broker-Backed &amp; 100% Free:</strong> Subsidized by official broker partner JustMarkets (Partner Code: <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code>).
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

            {/* Right Column: Bloomberg/Reuters-style Market Information Panel */}
            <div>
              <LiveSpotFeed />
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 1: CORE OFFERINGS & PLATFORM OVERVIEW                  */}
      {/* ============================================================== */}
      <section style={{ padding: '72px 0 36px' }}>
        <div className="container-main">
          <div style={{ marginBottom: '32px' }}>
            <span className="section-eyebrow">Platform Capabilities</span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Four Core Pillars of Velarion Markets
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '6px' }}>
              From algorithmic execution parameters to structured trader education, every module is designed for measurable consistency and disciplined risk control.
            </p>
          </div>

          <div className="feature-grid-4">
            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="status-badge status-neutral" style={{ fontSize: '10px' }}>SPECIALIZATION</span>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>XAUUSD</span>
              </div>
              <h3>Spot Gold Focus</h3>
              <p>
                Concentrated algorithmic execution on Spot Gold, capturing institutional liquidity sweeps, session opens, and macro yield differentials with zero instrument dilution.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="status-badge status-neutral" style={{ fontSize: '10px' }}>QUANT MODELS</span>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>4 SYSTEMS</span>
              </div>
              <h3>Systematic Strategies</h3>
              <p>
                Four rule-based quantitative strategies: SMC Liquidity Sweep, Dynamic Trend Pullback, Session Breakout, and Statistical Mean Reversion.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="status-badge status-neutral" style={{ fontSize: '10px' }}>CALCULATOR</span>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-green)' }}>COMPOUNDING</span>
              </div>
              <h3>200-Pip Growth Engine</h3>
              <p>
                Interactive risk management tool projecting mathematical capital compounding with strict 2% account risk limits and micro-lot sizing.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="status-badge status-neutral" style={{ fontSize: '10px' }}>CURRICULUM</span>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>30 LESSONS</span>
              </div>
              <h3>Forex Academy</h3>
              <p>
                A rigorous 30-lesson progressive curriculum with mandatory comprehension quizzes gating access across foundations, analysis, and risk management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: WHY SPOT GOLD (XAUUSD) DEEP DIVE                    */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 0' }}>
        <div className="container-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <span className="section-eyebrow">Asset Class Advantage</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Why We Trade Spot Gold Exclusively
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '6px' }}>
                Gold represents over $130 billion in daily turnover, consistent session market dynamics, and clear sensitivity to global sovereign debt, real yields, and central bank demand.
              </p>
            </div>
            <Link href="/why-gold" className="btn btn-outline-gold">
              Read Institutional Gold Guide &rarr;
            </Link>
          </div>

          <div className="feature-grid-3">
            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="status-badge status-completed">LIQUIDITY</span>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>$130B+ / DAY</span>
              </div>
              <h3>Deep Global Liquidity</h3>
              <p>
                Spot Gold trades continuously across Asian, London, and New York sessions. Unmatched liquidity allows micro-lot and institutional order execution with minimal slippage on JustMarkets ECN raw spreads.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="status-badge status-completed">MACRO DRIVERS</span>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>REAL YIELDS</span>
              </div>
              <h3>Macroeconomic Sensitivity</h3>
              <p>
                Unlike fiat currency pairs burdened with bilateral domestic politics, XAUUSD trades with high mathematical correlation to US 10-year real yields (TIPS), DXY liquidity, and global reserve bank accumulation.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="status-badge status-completed">VOLATILITY</span>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>300-500 PIPS ATR</span>
              </div>
              <h3>Predictable Session Expansions</h3>
              <p>
                XAUUSD exhibits an average daily range of $30 to $50 (300 to 500 pips), offering ample volatility for intraday breakout expansion and high-expectancy trend continuation setups.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: FOUR QUANTITATIVE EXECUTION MODELS                  */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 0' }}>
        <div className="container-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <span className="section-eyebrow">Execution Architecture</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Four Systematic Quantitative Models
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '6px' }}>
                Every automated signal and analysis filter is governed by objective mathematical criteria with predetermined stop placement and target scaling.
              </p>
            </div>
            <Link href="/strategies" className="btn btn-outline-gold">
              View Strategy Specifications &rarr;
            </Link>
          </div>

          <div className="feature-grid-4">
            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)' }}>MODEL 01</span>
                <span className="status-badge status-warning">LIQUIDITY</span>
              </div>
              <h3>SMC Liquidity Sweep</h3>
              <p>
                Detects institutional stop runs beyond prior session extremes, entering on confirmed order block rejections when retail liquidity pools are swept.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)' }}>MODEL 02</span>
                <span className="status-badge status-completed">TREND</span>
              </div>
              <h3>Dynamic Trend Pullback</h3>
              <p>
                Aligns with Higher Timeframe market structure via exponential moving averages, entering at key value zones with trailing volatility ratchets.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-primary)' }}>MODEL 03</span>
                <span className="status-badge status-neutral">VOLATILITY</span>
              </div>
              <h3>Session Range Breakout</h3>
              <p>
                Captures high-momentum directional expansion during London (07:00 UTC) and New York (12:30 UTC) cash open volume injections.
              </p>
            </div>

            <div className="feature-card-clean">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)' }}>MODEL 04</span>
                <span className="status-badge status-warning">STATISTICAL</span>
              </div>
              <h3>Statistical Mean Reversion</h3>
              <p>
                Identifies extreme price dislocations beyond 2.5 standard deviations from the volume-weighted average price (VWAP) in consolidation regimes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: 200-PIP GROWTH ENGINE CALCULATOR TEASER             */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 0' }}>
        <div className="container-main">
          <div style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: '1fr 340px',
            gap: '36px',
            alignItems: 'center'
          }}>
            <div>
              <span className="section-eyebrow">Interactive Compounding Tool</span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                200-Pip Growth Engine Calculator
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '22px' }}>
                Simulate mathematical account compounding with disciplined micro-lot sizing and predetermined risk ratios. Calculate your exact lot sizes ($10 to $1,000+ balance) while maintaining rigorous drawdown safety.
              </p>
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                <Link href="/tools/growth-calculator" className="btn btn-primary">
                  Launch Growth Calculator &rarr;
                </Link>
                <Link href="/academy" className="btn btn-secondary">
                  Review Risk Math
                </Link>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '24px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                10-Trade Compounding Projection
              </div>
              <div className="mono-nums" style={{ fontSize: '36px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '4px' }}>
                +233.3%
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                $100 Starting Balance &rarr; $333.32
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                2.0% Risk per Trade &bull; 30-Pip SL &bull; 200-Pip Target
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: STRUCTURED FOREX SCHOOL (30 LESSONS)                */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 0' }}>
        <div className="container-main">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
            <div>
              <span className="section-eyebrow">Structured Curriculum</span>
              <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
                Velarion Forex Academy (30 Lessons)
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '6px' }}>
                A progressive education roadmap from currency market foundations to institutional risk modeling. Each lesson concludes with a mandatory quiz to verify mastery before advancing.
              </p>
            </div>
            <Link href="/academy" className="btn btn-outline-gold">
              Explore All 30 Lessons &rarr;
            </Link>
          </div>

          <div className="feature-grid-3">
            <div className="feature-card-clean">
              <span className="status-badge status-completed" style={{ marginBottom: '12px' }}>
                TIER 1 &bull; LESSONS 1-12
              </span>
              <h3>Forex Foundations</h3>
              <p>
                Currency pair mechanics, bid/ask spread calculations, pip valuations, contract sizing, margin requirements, leverage dynamics, and MT5 order execution types.
              </p>
            </div>

            <div className="feature-card-clean">
              <span className="status-badge status-warning" style={{ marginBottom: '12px' }}>
                TIER 2 &bull; LESSONS 13-22
              </span>
              <h3>Technical Analysis &amp; Structure</h3>
              <p>
                Candlestick formation anatomy, dynamic support/resistance, market swing structure, multi-timeframe confirmation, and session liquidity windows.
              </p>
            </div>

            <div className="feature-card-clean">
              <span className="status-badge status-danger" style={{ marginBottom: '12px' }}>
                TIER 3 &bull; LESSONS 23-30
              </span>
              <h3>Risk &amp; Institutional Strategy</h3>
              <p>
                Mathematical position sizing, asymmetric drawdown mechanics, execution psychology, quantitative backtesting verification, and XAUUSD spot execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 6: TRUST, TRANSPARENCY & REGULATED BROKER INTEGRATION  */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 0 80px' }}>
        <div className="container-main">
          <div style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '36px',
            display: 'grid',
            gridTemplateColumns: '1fr 360px',
            gap: '36px',
            alignItems: 'center'
          }}>
            <div>
              <span className="status-badge status-completed" style={{ marginBottom: '12px' }}>
                OFFICIAL BROKER PARTNERSHIP
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                100% Subsidized Access via JustMarkets
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                All quantitative trading models, live telemetry feeds, and 30-lesson academy modules are completely free for traders registered under our verified partner code. Capital remains 100% inside your regulated JustMarkets MT5 account with non-custodial protection.
              </p>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={DEFAULT_PARTNER_CONFIG.primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '13.5px' }}
                >
                  Open JustMarkets Account &rarr;
                </a>
                <span className="mono-nums" style={{ fontSize: '13px', color: 'var(--accent-gold)' }}>
                  Partner Code: <strong>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>
                </span>
              </div>
            </div>

            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '22px'
            }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Onboarding Protocol
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                <div>1. Register at JustMarkets with partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong></div>
                <div>2. Open an MT5 Standard or Pro account</div>
                <div>3. Verify your MT5 Account ID in Velarion</div>
                <div>4. Instant Subsidized Access to Terminal and Academy</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

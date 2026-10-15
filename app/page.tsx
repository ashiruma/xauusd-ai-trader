import React from 'react';
import Link from 'next/link';
import StarfieldBackground from '@/components/StarfieldBackground';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata = {
  title: 'Velarion Markets | Institutional XAUUSD Quantitative Trading & Forex Academy',
  description: 'AI-assisted XAUUSD spot gold market structure analysis, 4 quantitative execution models, 200-pip compounding calculator, and 30-lesson interactive Forex school subsidized by JustMarkets.'
};

export default function HomePage() {
  return (
    <div>
      {/* ============================================================== */}
      {/* HERO SECTION WITH DUAL-TIER STARFIELD BACKGROUND               */}
      {/* ============================================================== */}
      <section className="hero-wrap">
        <StarfieldBackground />

        <div className="hero-content">
          {/* Left Column: Mission & Value Proposition */}
          <div>
            <div className="landing-eyebrow">
              <span className="dot-indicator" />
              <span>VELARION MARKETS &bull; SPOT GOLD &bull; XAUUSD</span>
            </div>

            <h1 className="hero-title">
              Trade Smarter.<br />
              Understand the Market.
            </h1>

            <p className="hero-subtitle">
              Explore AI-assisted market analysis, quantitative trading strategies, and structured Forex education in one integrated platform.
            </p>

            {/* CTAs */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', marginBottom: '32px' }}>
              <Link href="/terminal" className="holo-btn btn">
                <span>Explore Trading Terminal</span>
                <span>&rarr;</span>
              </Link>
              <Link
                href="/academy"
                className="btn btn-secondary"
                style={{ fontSize: '14px', padding: '12px 24px', borderRadius: '9999px', fontWeight: 600 }}
              >
                Start Learning
              </Link>
            </div>

            {/* 3 Concise Trust & Product Facts */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(25, 184, 120, 0.15)',
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
                  <strong style={{ color: 'var(--text-primary)' }}>Spot Gold Specialization:</strong> Dedicated algorithmic execution calibrated exclusively for XAUUSD liquidity and macro drivers.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(25, 184, 120, 0.15)',
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
                  <strong style={{ color: 'var(--text-primary)' }}>4 Quantitative Models:</strong> Systematic rules for SMC liquidity sweeps, trend pullbacks, breakout expansions, and statistical mean reversion.
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', fontSize: '13px' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(25, 184, 120, 0.15)',
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
                  <strong style={{ color: 'var(--text-primary)' }}>30-Lesson Forex School:</strong> Structured curriculum with mandatory interactive quiz gating from foundations to institutional risk management.
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live MT5 HUD */}
          <div>
            <LiveSpotFeed />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 1: SYSTEM OVERVIEW & WHY GOLD                          */}
      {/* ============================================================== */}
      <section style={{ maxWidth: '1200px', margin: '60px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <span className="landing-eyebrow" style={{ marginBottom: '8px' }}>
              MARKET SELECTION ADVANTAGE
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Why We Trade Spot Gold (XAUUSD) Exclusively
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '650px', marginTop: '6px' }}>
              Gold represents over $130 billion in daily liquidity, predictable session market dynamics, and clear sensitivity to global sovereign debt and real yields.
            </p>
          </div>
          <Link href="/why-gold" className="btn btn-outline-gold">
            Read Institutional Gold Guide &rarr;
          </Link>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card-header">
              <span className="status-badge status-completed">LIQUIDITY</span>
              <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>$130B+ / DAY</span>
            </div>
            <h3 className="feature-card-title">Deep Institutional Liquidity</h3>
            <p className="feature-card-desc">
              Spot Gold trades continuously across Asian, London, and New York sessions. Zero slippage on standard lots with tight 2.6 pip spreads via JustMarkets direct ECN feeds.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-header">
              <span className="status-badge status-completed">MACRO DRIVERS</span>
              <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>REAL YIELDS</span>
            </div>
            <h3 className="feature-card-title">Clear Sovereign Catalysts</h3>
            <p className="feature-card-desc">
              Unlike currency crosses fraught with unpredictable bilateral politics, Gold responds mathematically to real interest rates (TIPS), US Dollar liquidity, and central bank buying.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-header">
              <span className="status-badge status-completed">VOLATILITY</span>
              <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>200-PIP EXPANSIONS</span>
            </div>
            <h3 className="feature-card-title">Clean Daily Range Expansion</h3>
            <p className="feature-card-desc">
              XAUUSD exhibits an average true range (ATR) of $30 to $50 daily (300 to 500 pips), offering ample volatility for trend continuation and session breakout capture.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: 4 QUANTITATIVE STRATEGIES TEASER                    */}
      {/* ============================================================== */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <span className="landing-eyebrow" style={{ marginBottom: '8px' }}>
              EXECUTION ARCHITECTURE
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Four Systematic Quantitative Models
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '650px', marginTop: '6px' }}>
              Every signal generated by the platform passes through rigorous multi-agent consensus before hitting the execution gateway.
            </p>
          </div>
          <Link href="/strategies" className="btn btn-outline-gold">
            View Strategy Specifications &rarr;
          </Link>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-card-header">
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)' }}>MODEL 01</span>
              <span className="status-badge" style={{ background: 'rgba(230, 187, 89, 0.12)', color: 'var(--accent-gold)' }}>LIQUIDITY</span>
            </div>
            <h3 className="feature-card-title">SMC Liquidity Sweep</h3>
            <p className="feature-card-desc">
              Monitors institutional stop runs beyond Asian session highs and lows, capturing sharp mean-reverting pinbars when smart money traps retail breakout traders.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-header">
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-green)' }}>MODEL 02</span>
              <span className="status-badge status-completed">TREND</span>
            </div>
            <h3 className="feature-card-title">Dynamic Trend Pullback</h3>
            <p className="feature-card-desc">
              Filters overall trend direction via EMA 50/200 and enters at value zones during minor retracements, trailing profits with dynamic volatility ratchets.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-header">
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-blue)' }}>MODEL 03</span>
              <span className="status-badge" style={{ background: 'rgba(59, 130, 246, 0.12)', color: 'var(--accent-blue)' }}>VOLATILITY</span>
            </div>
            <h3 className="feature-card-title">Session Range Breakout</h3>
            <p className="feature-card-desc">
              Capitalizes on sudden volume inflows at the London open (07:00 UTC) and New York cash open (12:30 UTC) with disciplined stop placement.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-card-header">
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-cyan)' }}>MODEL 04</span>
              <span className="status-badge" style={{ background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)' }}>STATISTICAL</span>
            </div>
            <h3 className="feature-card-title">Statistical Mean Reversion</h3>
            <p className="feature-card-desc">
              Operates during low-volume sessions, entering counter-trend positions when spot price stretches beyond 2.5 standard deviations from the 20-period VWAP.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: 200-PIP GROWTH ENGINE CALCULATOR TEASER              */}
      {/* ============================================================== */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{
          background: 'radial-gradient(circle at 85% 15%, rgba(230, 187, 89, 0.1) 0%, var(--bg-surface-1) 75%)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px 32px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div>
            <span className="landing-eyebrow" style={{ marginBottom: '10px' }}>
              INTERACTIVE COMPOUNDING TOOL
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              200-Pip Growth Engine Calculator
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              Visualize the mathematical compounding trajectory of trading Gold with strict percentage risk management and 200-pip targets. Calculate exact micro-lot sizes ($10 to $1,000+ balance) without overleveraging.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link href="/tools/growth-calculator" className="btn btn-gold">
                Launch Growth Calculator &rarr;
              </Link>
              <Link href="/academy" className="btn btn-secondary">
                Learn Position Sizing Math
              </Link>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
              10-Trade Compounding Projection
            </div>
            <div className="mono-nums" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '4px' }}>
              +233.3%
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
              $100 Starting Balance &rarr; $333.32
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-default)', paddingTop: '10px' }}>
              2.0% Risk per Trade &bull; 30 Pip SL &bull; 200 Pip Target
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: 30-LESSON FOREX SCHOOL TEASER                        */}
      {/* ============================================================== */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <span className="landing-eyebrow" style={{ marginBottom: '8px' }}>
              STRUCTURED EDUCATION
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)' }}>
              Velarion Forex Academy (30 Lessons)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '650px', marginTop: '6px' }}>
              A strict, progressive curriculum from pip mechanics to institutional risk management. Each lesson requires passing its knowledge quiz before unlocking the next.
            </p>
          </div>
          <Link href="/academy" className="btn btn-outline-gold">
            Browse All 30 Lessons &rarr;
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
          <div className="feature-card">
            <span className="status-badge" style={{ background: 'rgba(25, 184, 120, 0.12)', color: 'var(--accent-green)', marginBottom: '10px' }}>
              TIER 1 &bull; LESSONS 1-12
            </span>
            <h3 className="feature-card-title">Forex Foundations</h3>
            <p className="feature-card-desc">
              What is Forex, currency pairs, bid/ask spreads, pip values, lot sizing, margin, leverage, and MT5 order types.
            </p>
          </div>

          <div className="feature-card">
            <span className="status-badge" style={{ background: 'rgba(230, 187, 89, 0.12)', color: 'var(--accent-gold)', marginBottom: '10px' }}>
              TIER 2 &bull; LESSONS 13-22
            </span>
            <h3 className="feature-card-title">Analysis &amp; Market Dynamics</h3>
            <p className="feature-card-desc">
              Candlestick anatomy, support and resistance, market structure, multi-timeframe alignment, and session liquidity windows.
            </p>
          </div>

          <div className="feature-card">
            <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--accent-red)', marginBottom: '10px' }}>
              TIER 3 &bull; LESSONS 23-30
            </span>
            <h3 className="feature-card-title">Risk &amp; Execution</h3>
            <p className="feature-card-desc">
              Position sizing math, asymmetric drawdown physics, trading psychology, backtesting rigor, and XAUUSD spot execution.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 5: JUSTMARKETS PARTNERSHIP & BROKER ONBOARDING          */}
      {/* ============================================================== */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 80px', padding: '0 24px' }}>
        <div style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xl)',
          padding: '36px',
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: '32px',
          alignItems: 'center'
        }}>
          <div>
            <span className="status-badge status-completed" style={{ marginBottom: '10px' }}>
              OFFICIAL BROKER PARTNERSHIP
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px' }}>
              100% Subsidized Access via JustMarkets
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '18px' }}>
              All algorithmic models, live telemetry feeds, and academy lessons are completely free for traders registered under our verified partner code. Capital remains 100% inside your regulated JustMarkets MT5 account with non-custodial safety.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={DEFAULT_PARTNER_CONFIG.primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
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
            padding: '20px'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
              Onboarding Checklist
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <div>1. Register at JustMarkets with code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</strong></div>
              <div>2. Create an MT5 Standard or Pro Account</div>
              <div>3. Verify MT5 Account Number in Velarion</div>
              <div>4. Instant Subsidized Access to Terminal &amp; School</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

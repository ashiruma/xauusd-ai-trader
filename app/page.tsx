import React from 'react';
import Link from 'next/link';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import GatedAccessCard from '@/components/GatedAccessCard';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import { getServerLiveQuote } from '@/lib/marketFeed';

export const metadata = {
  title: 'Velarion Markets | Trade XAUUSD from a Position of Clarity',
  description: 'Autonomous spot gold quantitative intelligence, 4 rule-based execution models, 200-pip growth calculator, and 30-lesson structured Forex School subsidized through our official JustMarkets partnership.',
};

export default function HomePage() {
  const initialQuote = getServerLiveQuote();

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>

      {/* ============================================================== */}
      {/* 1. HERO: ROLLS-ROYCE EXECUTIVE & JUSTMARKETS GATED ACCESS CARD */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 24px 64px', maxWidth: '1280px', margin: '0 auto' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '40px',
            alignItems: 'center',
          }}
        >
          {/* Left: Rolls-Royce Executive Image & Editorial Lifestyle Visual */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                position: 'relative',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border-default)',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
                aspectRatio: '16/9',
                backgroundColor: '#0F172A',
              }}
            >
              <img
                src="/rolls_royce_black_exec.jpg"
                alt="Velarion Quantitative Gold Trading Lifestyle"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.25) 60%, transparent 100%)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  padding: '24px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#F5C451',
                    fontWeight: 700,
                    letterSpacing: '1px',
                    textTransform: 'uppercase',
                    marginBottom: '4px',
                  }}
                >
                  Quantitative Spot Gold
                </span>
                <h1
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    margin: 0,
                    lineHeight: 1.25,
                  }}
                >
                  Trade the market from a position of clarity.
                </h1>
              </div>
            </div>

            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Autonomous spot gold quantitative execution, 4 disciplined strategy systems, and 30-lesson structured Forex School. Subsidized 100% through our official JustMarkets Introducing Broker partnership.
            </p>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--accent-green)',
                  background: 'var(--accent-green-subtle)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--accent-green-border)',
                }}
              >
                Non-Custodial Broker Protection
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--accent-gold)',
                  background: 'var(--accent-gold-subtle)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-accent)',
                }}
              >
                $10 Micro-Deposit Eligible
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  background: 'var(--bg-surface-2)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-default)',
                }}
              >
                Zero Platform Fees
              </span>
            </div>

            {/* Quick Public Navigation Links */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
              <Link
                href="/how-it-works"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface-1)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  textDecoration: 'none',
                }}
              >
                How It Works &rarr;
              </Link>
              <Link
                href="/school-preview"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                  backgroundColor: 'var(--bg-surface-1)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  textDecoration: 'none',
                }}
              >
                School Preview &rarr;
              </Link>
              <Link
                href="/risk-and-performance"
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: 'var(--accent-red)',
                  backgroundColor: 'var(--accent-red-subtle)',
                  border: '1px solid var(--accent-red-border)',
                  borderRadius: '6px',
                  padding: '6px 12px',
                  textDecoration: 'none',
                }}
              >
                Risk &amp; Performance Audit &rarr;
              </Link>
            </div>
          </div>

          {/* Right: Focused JustMarkets Gated Access Card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GatedAccessCard />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. FOUR CORE PILLARS OF VELARION MARKETS                       */}
      {/* ============================================================== */}
      <section style={{ backgroundColor: 'var(--bg-surface-1)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: '56px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '36px', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Platform Capabilities
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.3px' }}>
              Four Core Pillars of Velarion Markets
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '6px auto 0' }}>
              From systematic algorithmic execution to structured trader education, every module is designed for measurable consistency and disciplined risk control.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '20px',
            }}
          >
            {/* Pillar 1 */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  SPECIALIZATION
                </span>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  XAUUSD
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Spot Gold Focus
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Concentrated algorithmic execution on Spot Gold, capturing institutional liquidity sweeps, session opens, and macro yield differentials with zero instrument dilution.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  QUANT MODELS
                </span>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  4 SYSTEMS
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Systematic Strategies
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Four rule-based quantitative strategies: SMC Liquidity Sweep, Dynamic Trend Pullback, Session Breakout, and Statistical Mean Reversion.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  CALCULATOR
                </span>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)' }}>
                  COMPOUNDING
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                200-Pip Growth Engine
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Interactive risk management tool projecting mathematical capital compounding with strict 2% account risk limits and micro-lot sizing.
              </p>
            </div>

            {/* Pillar 4 */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '10.5px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  CURRICULUM
                </span>
                <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)' }}>
                  30 LESSONS
                </span>
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                Forex Academy
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                A rigorous 30-lesson progressive curriculum with mandatory comprehension quizzes gating access across foundations, analysis, and risk management.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. FOUR SYSTEMATIC QUANTITATIVE MODELS                         */}
      {/* ============================================================== */}
      <section style={{ padding: '64px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '36px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Quantitative Execution
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.3px' }}>
              Four Quantitative Execution Systems
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '6px' }}>
              Each system addresses a distinct market regime in Spot Gold, eliminating guesswork with deterministic entry, stop loss, and take profit logic.
            </p>
          </div>
          <Link
            href="/strategies"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--accent-gold)',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-accent)',
              backgroundColor: 'var(--accent-gold-subtle)',
            }}
          >
            Review Strategy Rules &rarr;
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Model 01 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="mono-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                MODEL 01
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-green)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                HIGH WIN-RATE
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              SMC Liquidity Sweep
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
              Monitors Asian and London session highs/lows for false breakout liquidity grabs. Enters on rapid rejection with Fair Value Gap confirmation and 1:2.2 minimum Risk-to-Reward.
            </p>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              Trigger: H1 Sweep | M5 FVG Mitigation
            </div>
          </div>

          {/* Model 02 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="mono-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                MODEL 02
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-gold)', background: 'var(--accent-gold-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                TREND EXPANSION
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Dynamic Trend Pullback
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
              Identifies sustained institutional trends using multi-timeframe EMA alignment (20/50/200). Enters pullbacks to value zones with dynamic ATR trailing protection.
            </p>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              Trigger: H4 EMA Confluence | M15 Structure
            </div>
          </div>

          {/* Model 03 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="mono-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                MODEL 03
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--text-secondary)', background: 'var(--bg-surface-2)', padding: '2px 8px', borderRadius: '4px' }}>
                VOLATILITY SURGE
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Session Range Breakout
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
              Captures explosive momentum during London and New York market openings. Uses pre-session consolidation ranges and volume surge filters to avoid low-liquidity whipsaws.
            </p>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              Trigger: NY Open (13:30 UTC) | Volume Filter
            </div>
          </div>

          {/* Model 04 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="mono-nums" style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                MODEL 04
              </span>
              <span style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-green)', background: 'var(--accent-green-subtle)', padding: '2px 8px', borderRadius: '4px' }}>
                MEAN REVERSION
              </span>
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Statistical Mean Reversion
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: '0 0 16px' }}>
              Monitors statistical price deviations from the 20-period VWAP and Bollinger envelope. Enters counter-trend reversions only when extreme RSI divergence aligns with institutional order flow.
            </p>
            <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              Trigger: 2.5 Sigma Bands | RSI Exhaustion
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 4. 200-PIP GROWTH ENGINE CALCULATOR TEASER CARD                */}
      {/* ============================================================== */}
      <section style={{ backgroundColor: 'var(--bg-surface-1)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: '56px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '36px',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  color: 'var(--accent-gold)',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                }}
              >
                Interactive Compounding Tool
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 12px', letterSpacing: '-0.3px' }}>
                200-Pip Growth Engine Calculator
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '22px' }}>
                Simulate mathematical account compounding with disciplined micro-lot sizing and predetermined risk ratios. Calculate your exact lot sizes ($10 to $1,000+ balance) while maintaining rigorous drawdown safety.
              </p>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  href="/tools/growth-calculator"
                  style={{
                    padding: '11px 22px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-gold)',
                    color: '#000000',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Launch Growth Calculator &rarr;
                </Link>
                <Link
                  href="/academy"
                  style={{
                    padding: '11px 20px',
                    fontSize: '13.5px',
                    fontWeight: 600,
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'var(--bg-card)',
                    color: 'var(--text-primary)',
                    borderRadius: '6px',
                  }}
                >
                  Review Risk Math
                </Link>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '28px',
                textAlign: 'center',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                10-Trade Compounding Projection
              </div>
              <div className="mono-nums" style={{ fontSize: '40px', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '4px' }}>
                +233.3%
              </div>
              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                $100 Starting Balance &rarr; $333.32
              </div>
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                2.0% Risk per Trade | 30-Pip SL | 200-Pip Target
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. STRUCTURED FOREX SCHOOL (30 LESSONS) 3-TIER ROADMAP         */}
      {/* ============================================================== */}
      <section style={{ padding: '64px 24px', maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Structured Curriculum
            </span>
            <h2 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.3px' }}>
              Velarion Forex Academy (30 Lessons)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '640px', marginTop: '6px' }}>
              A progressive education roadmap from currency market foundations to institutional risk modeling. Each lesson concludes with a mandatory comprehension quiz to verify mastery before advancing.
            </p>
          </div>
          <Link
            href="/academy"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--accent-gold)',
              padding: '8px 16px',
              borderRadius: '6px',
              border: '1px solid var(--border-accent)',
              backgroundColor: 'var(--accent-gold-subtle)',
            }}
          >
            Explore All 30 Lessons &rarr;
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {/* Tier 1 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                color: 'var(--accent-green)',
                background: 'var(--accent-green-subtle)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '14px',
              }}
            >
              TIER 1 | LESSONS 1-12
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Forex Foundations
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Currency pair mechanics, bid/ask spread calculations, pip valuations, contract sizing, margin requirements, leverage dynamics, and MT5 order execution types.
            </p>
          </div>

          {/* Tier 2 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                color: 'var(--accent-gold)',
                background: 'var(--accent-gold-subtle)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '14px',
              }}
            >
              TIER 2 | LESSONS 13-22
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Technical Analysis &amp; Structure
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Candlestick formation anatomy, dynamic support/resistance, market swing structure, ABCD harmonic patterns, multi-timeframe confirmation, and session liquidity windows.
            </p>
          </div>

          {/* Tier 3 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '10px',
              padding: '24px',
            }}
          >
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                color: 'var(--accent-red)',
                background: 'var(--accent-red-subtle)',
                padding: '3px 8px',
                borderRadius: '4px',
                display: 'inline-block',
                marginBottom: '14px',
              }}
            >
              TIER 3 | LESSONS 23-30
            </span>
            <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
              Risk &amp; Institutional Strategy
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Mathematical position sizing, asymmetric drawdown mechanics, execution psychology, quantitative backtesting verification, and disciplined XAUUSD execution.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 6. REGULATED BROKER PARTNERSHIP & GATED TRANSPARENCY           */}
      {/* ============================================================== */}
      <section style={{ backgroundColor: 'var(--bg-surface-1)', borderTop: '1px solid var(--border-default)', borderBottom: '1px solid var(--border-default)', padding: '56px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '36px',
              alignItems: 'center',
            }}
          >
            <div>
              <span
                style={{
                  fontSize: '10px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  color: 'var(--accent-green)',
                  background: 'var(--accent-green-subtle)',
                  padding: '3px 8px',
                  borderRadius: '4px',
                  display: 'inline-block',
                  marginBottom: '12px',
                }}
              >
                OFFICIAL BROKER PARTNERSHIP
              </span>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 12px', letterSpacing: '-0.3px' }}>
                100% Subsidized Access via JustMarkets
              </h2>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
                All quantitative trading models, live telemetry feeds, and 30-lesson academy modules are completely free for traders registered under our verified partner code. Capital remains 100% inside your regulated JustMarkets MT5 account with non-custodial protection.
              </p>
              <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
                <a
                  href={DEFAULT_PARTNER_CONFIG.primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '11px 22px',
                    fontSize: '13.5px',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-gold)',
                    color: '#000000',
                    borderRadius: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  Open JustMarkets Account &rarr;
                </a>
                <span className="mono-nums" style={{ fontSize: '13px', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono, monospace)' }}>
                  Partner Code: <strong>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>
                </span>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '14px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Onboarding Protocol
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                <div>1. Register at JustMarkets with partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong></div>
                <div>2. Open an MT5 Standard Cent, Standard, or Pro account</div>
                <div>3. Enter your JustMarkets MT5 Account ID in the verification gate</div>
                <div>4. Instant Subsidized Access to the Terminal and 30-Lesson School</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 7. LIVE MARKET TELEMETRY FEED                                  */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 24px', maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Live Market Telemetry
          </span>
        </div>
        <LiveSpotFeed initialQuote={initialQuote} />
      </section>

      {/* ============================================================== */}
      {/* 8. RISK DISCLOSURE BAR                                         */}
      {/* ============================================================== */}
      <section style={{ backgroundColor: 'var(--bg-surface-2)', borderTop: '1px solid var(--border-default)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          <div style={{ maxWidth: '900px' }}>
            <strong style={{ color: 'var(--text-primary)' }}>Trading Risk Notice: </strong>
            Spot gold (XAUUSD) and leveraged derivative products carry a high level of risk and can result in the loss of some or all of your invested capital. Past performance is not indicative of future results. Only trade with money you can afford to lose.
          </div>
          <Link href="/why-gold" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            Read XAUUSD Dossier &rarr;
          </Link>
        </div>
      </section>

    </div>
  );
}

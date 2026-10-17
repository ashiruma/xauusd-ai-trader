import React from 'react';
import Link from 'next/link';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import GatedAccessCard from '@/components/GatedAccessCard';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import { getServerLiveQuote } from '@/lib/marketFeed';

export const metadata = {
  title: 'Velarion Markets | Trade XAUUSD from a Position of Clarity',
  description: 'Autonomous spot gold quantitative intelligence, 4 rule-based execution models, and 30-lesson structured Forex School subsidized through our official JustMarkets partnership.',
};

export default function HomePage() {
  const initialQuote = getServerLiveQuote();

  return (
    <div style={{ backgroundColor: '#F8FAFC', minHeight: '100vh', color: '#0F172A' }}>

      {/* ============================================================== */}
      {/* 1. HERO: ROLLS-ROYCE EXECUTIVE & TRADZY-STYLE GATED ACCESS     */}
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
                border: '1px solid #CBD5E1',
                boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.05)',
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
                  background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.15) 60%, transparent 100%)',
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
                    fontSize: '24px',
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

            <p style={{ fontSize: '15px', color: '#475569', lineHeight: 1.6, margin: 0 }}>
              Autonomous spot gold quantitative execution and 30-lesson structured academy. Access is 100% subsidized through our official JustMarkets Introducing Broker partnership.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#047857',
                  background: 'rgba(4, 120, 87, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(4, 120, 87, 0.2)',
                }}
              >
                Non-Custodial Broker Protection
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#B45309',
                  background: 'rgba(180, 83, 9, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(180, 83, 9, 0.2)',
                }}
              >
                $10 Micro-Deposit Eligible
              </span>
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#0369A1',
                  background: 'rgba(3, 105, 161, 0.08)',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(3, 105, 161, 0.2)',
                }}
              >
                Zero Platform Fees
              </span>
            </div>
          </div>

          {/* Right: Focused Tradzy-Style Gated Entry Card */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <GatedAccessCard />
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. THREE CLEAN DIRECT PILLARS — "MONEY DOES NOT LOVE NOISE"   */}
      {/* ============================================================== */}
      <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', borderBottom: '1px solid #E2E8F0', padding: '54px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: '#B45309',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              Straightforward Architecture
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#0F172A', marginTop: '4px' }}>
              Built for precision, not noise.
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Pillar 1 */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#B45309', fontWeight: 700, marginBottom: '8px' }}>
                01 / SECURITY
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                Non-Custodial Safety
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Your capital remains 100% inside your own JustMarkets MT5 account. Velarion never accepts deposits or manages client money.
              </p>
            </div>

            {/* Pillar 2 */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#047857', fontWeight: 700, marginBottom: '8px' }}>
                02 / ACCESS
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                Subsidized Membership
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Zero platform subscription fees. Access to the terminal and educational courses is fully covered through our official broker partner rebate.
              </p>
            </div>

            {/* Pillar 3 */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '10px',
                padding: '24px',
              }}
            >
              <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#0369A1', fontWeight: 700, marginBottom: '8px' }}>
                03 / MASTERY
              </div>
              <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#0F172A', margin: '0 0 8px' }}>
                30-Lesson Forex School
              </h3>
              <p style={{ fontSize: '13.5px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>
                Master market mechanics, liquidity sweeps, and disciplined risk limits before entering live execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 3. LIVE MARKET TELEMETRY STRIP                                 */}
      {/* ============================================================== */}
      <section style={{ padding: '48px 24px', maxWidth: '840px', margin: '0 auto' }}>
        <div style={{ marginBottom: '16px', textAlign: 'center' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              color: '#64748B',
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Live Market Telemetry
          </span>
        </div>
        <LiveSpotFeed initialQuote={initialQuote} />
      </section>

    </div>
  );
}

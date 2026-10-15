import React from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-surface-1)',
      borderTop: '1px solid var(--border-default)',
      padding: '48px 24px 36px',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '36px'
        }}>
          {/* Brand Col */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div style={{
                width: '26px',
                height: '26px',
                background: 'linear-gradient(135deg, #E6BB59, #B88E30)',
                color: '#080D18',
                fontWeight: 800,
                fontSize: '14px',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                V
              </div>
              <strong style={{ fontSize: '15px', color: 'var(--text-primary)', letterSpacing: '0.5px' }}>
                VELARION MARKETS
              </strong>
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Institutional algorithmic spot gold execution architecture and 30-lesson interactive Forex curriculum, subsidized through our regulated JustMarkets partnership.
            </p>
            <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--text-muted)' }}>
              Partner Code: <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Platform Architecture
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link href="/" style={{ color: 'var(--text-secondary)' }}>System Overview</Link>
              </li>
              <li>
                <Link href="/why-gold" style={{ color: 'var(--text-secondary)' }}>Why Spot Gold (XAUUSD)</Link>
              </li>
              <li>
                <Link href="/strategies" style={{ color: 'var(--text-secondary)' }}>Quantitative Models</Link>
              </li>
              <li>
                <Link href="/tools/growth-calculator" style={{ color: 'var(--text-secondary)' }}>200-Pip Growth Engine</Link>
              </li>
              <li>
                <Link href="/terminal" style={{ color: 'var(--text-secondary)' }}>Trading Terminal (Protected)</Link>
              </li>
            </ul>
          </div>

          {/* Forex Academy */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Forex Academy (30 Lessons)
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li>
                <Link href="/academy" style={{ color: 'var(--text-secondary)' }}>Curriculum Catalog</Link>
              </li>
              <li>
                <Link href="/academy/lesson-1" style={{ color: 'var(--text-secondary)' }}>Lesson 01: What is Forex</Link>
              </li>
              <li>
                <Link href="/academy/lesson-13" style={{ color: 'var(--text-secondary)' }}>Lesson 13: Candlestick Anatomy</Link>
              </li>
              <li>
                <Link href="/academy/lesson-23" style={{ color: 'var(--text-secondary)' }}>Lesson 23: Risk Management Math</Link>
              </li>
              <li>
                <Link href="/academy/lesson-30" style={{ color: 'var(--text-secondary)' }}>Lesson 30: Trading Plan Execution</Link>
              </li>
            </ul>
          </div>

          {/* Brokerage & Subsidized Access */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Official Broker Partner
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
              All software tooling, signal telemetry, and curriculum modules are 100% subsidized with an active JustMarkets MT5 account.
            </p>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-gold"
              style={{ fontSize: '12px', padding: '7px 14px' }}
            >
              Open JustMarkets Account &rarr;
            </a>
          </div>
        </div>

        {/* Regulatory Risk Disclaimer */}
        <div style={{
          borderTop: '1px solid var(--border-default)',
          paddingTop: '24px',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.6
        }}>
          <p style={{ marginBottom: '8px' }}>
            <strong>Risk Warning:</strong> Trading Contracts for Difference (CFDs) and leveraged financial instruments on Spot Gold (XAUUSD) carries a high level of risk and may not be suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange or commodities, carefully consider your investment objectives, level of experience, and risk appetite. There is a possibility that you may sustain a loss of some or all of your initial deposit.
          </p>
          <p>
            Velarion Markets operates as a quantitative research and algorithmic technology provider. Velarion Markets does not hold client funds or provide financial custodial services. Client accounts and financial custody remain exclusively under regulated broker partner JustMarkets Ltd.
          </p>
        </div>
      </div>
    </footer>
  );
}

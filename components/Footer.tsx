import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const partnerLink = 'https://one.justmarkets.link/a/tohstb0d83';

  return (
    <footer style={{
      background: 'var(--bg-surface-1)',
      borderTop: '1px solid var(--border-default)',
      padding: '54px 24px 40px',
      marginTop: 'auto'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '40px',
          marginBottom: '40px'
        }}>
          {/* Brand Column */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '14px', textDecoration: 'none' }}>
              <picture>
                <source srcSet="/velarion_brand_dark.webp" type="image/webp" />
                <img
                  src="/velarion_brand_dark.png"
                  alt="VELARION MARKETS"
                  width={130}
                  height={36}
                  style={{ height: '32px', width: 'auto', display: 'block' }}
                />
              </picture>
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: '340px' }}>
              Institutional algorithmic spot gold execution architecture and 30-lesson interactive Forex curriculum, 100% subsidized through our regulated broker partnership with JustMarkets.
            </p>
            <div style={{ marginTop: '16px' }}>
              <span className="status-badge status-completed" style={{ fontSize: '10.5px' }}>
                100% NON-CUSTODIAL &bull; REGULATED PARTNER
              </span>
            </div>
          </div>

          {/* Core Navigation */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Platform Navigation
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/why-gold" style={{ color: 'var(--text-secondary)' }}>Why Spot Gold (XAUUSD)</Link>
              </li>
              <li>
                <Link href="/academy" style={{ color: 'var(--text-secondary)' }}>30-Lesson Forex School</Link>
              </li>
              <li>
                <Link href="/tools/growth-calculator" style={{ color: 'var(--text-secondary)' }}>200-Pip Growth Calculator</Link>
              </li>
              <li>
                <Link href="/onboarding" style={{ color: 'var(--text-secondary)' }}>Unlock Free Access</Link>
              </li>
              <li>
                <Link href="/terminal" style={{ color: 'var(--text-secondary)' }}>Trading Terminal (Protected)</Link>
              </li>
            </ul>
          </div>

          {/* Forex Academy Highlights */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Forex School (30 Lessons)
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <li>
                <Link href="/academy" style={{ color: 'var(--text-secondary)' }}>Curriculum Catalog</Link>
              </li>
              <li>
                <Link href="/academy/lesson-1" style={{ color: 'var(--text-secondary)' }}>Lesson 01: What is Forex (Public)</Link>
              </li>
              <li>
                <Link href="/academy/lesson-5" style={{ color: 'var(--text-secondary)' }}>Lesson 05: Risk &amp; Leverage (Public)</Link>
              </li>
              <li>
                <Link href="/academy/lesson-13" style={{ color: 'var(--text-secondary)' }}>Lesson 13: Candlestick Mechanics</Link>
              </li>
              <li>
                <Link href="/academy/lesson-30" style={{ color: 'var(--text-secondary)' }}>Lesson 30: Trading Plan Execution</Link>
              </li>
            </ul>
          </div>

          {/* Brokerage & Subsidized Access */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>
              Official Broker Partner
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
              All software tooling, AI analytics, and curriculum modules are 100% free when trading with our regulated broker partner, JustMarkets.
            </p>
            <a
              href={partnerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '9px 16px', display: 'inline-block' }}
            >
              Open JustMarkets MT5 &rarr;
            </a>
          </div>
        </div>

        {/* Regulatory Risk Disclaimer */}
        <div style={{
          borderTop: '1px solid var(--border-default)',
          paddingTop: '28px',
          fontSize: '11.5px',
          color: 'var(--text-muted)',
          lineHeight: 1.7
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>Institutional Risk Disclaimer:</strong> Trading Spot Gold (XAUUSD) and leveraged financial instruments involves substantial risk of loss and is not suitable for all investors. The high degree of leverage can work against you as well as for you. Before deciding to trade foreign exchange or commodities, you must carefully evaluate your investment objectives, financial situation, experience level, and risk tolerance. There is a possibility that you could sustain a loss of some or all of your deposited capital. Do not speculate with capital you cannot afford to lose.
          </p>
          <p>
            Velarion Markets operates solely as a quantitative algorithmic research and financial educational technology provider. Velarion Markets is not a broker-dealer or investment advisor and does not accept or hold customer deposits. All brokerage, execution, and custody services are provided exclusively by regulated broker partner JustMarkets Ltd.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span>&copy; {new Date().getFullYear()} Velarion Markets. All rights reserved.</span>
            <span className="mono-nums">EN &bull; INSTITUTIONAL FEED</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

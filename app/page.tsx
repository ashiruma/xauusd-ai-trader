import React from 'react';
import Link from 'next/link';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import { getServerLiveQuote } from '@/lib/marketFeed';

export const metadata = {
  title: 'Velarion Markets | Trade XAUUSD from a Position of Clarity',
  description: 'Autonomous spot gold quantitative intelligence, 4 rule-based execution models, and 30-lesson structured Forex School subsidized through our official JustMarkets partnership.',
};

export default function HomePage() {
  const initialQuote = getServerLiveQuote();

  return (
    <div className="home-page">
      {/* ============================================================== */}
      {/* ROLLS-ROYCE EXECUTIVE SPLIT-SCREEN LANDING HERO                */}
      {/* ============================================================== */}
      <section className="nova-page" style={{ minHeight: 'calc(100vh - 68px)' }}>
        {/* Full-Bleed Rolls-Royce Starlight Interior & Executive Photo */}
        <div className="nova-bg-image" aria-hidden="true" />

        {/* Bottom-Left Contemplative Editorial Storytelling */}
        <div className="nova-story">
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              letterSpacing: '1.2px',
              textTransform: 'uppercase',
              color: '#eab167',
            }}
          >
            Quantitative XAUUSD Platform
          </span>
          <h2>
            Trade the market from a position of <span>clarity</span>.
          </h2>
          <p style={{ fontSize: '14.5px', color: '#CBD5E1', lineHeight: 1.65, maxWidth: '540px' }}>
            Autonomous spot gold quantitative intelligence, 4 rule-based execution models, and 30-lesson structured education. Access is fully subsidized through our official Introducing Broker partnership.
          </p>

          <div className="nova-story-badges">
            <div className="nova-story-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Non-Custodial: Funds Stay With Broker</span>
            </div>
            <div className="nova-story-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#eab167" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>$10 Micro-Balance Eligible</span>
            </div>
            <div className="nova-story-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Zero Software Fees</span>
            </div>
          </div>
        </div>

        {/* Right Split Panel - Dark Translucent Glass Command & Telemetry Panel */}
        <div className="nova-panel-wrap" style={{ minHeight: 'calc(100vh - 68px)' }}>
          <div className="nova-panel" style={{ gap: '20px' }}>
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: '10.5px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: '#eab167',
                  marginBottom: '8px',
                }}
              >
                INSTITUTIONAL ACCESS PORTAL
              </span>
              <h1>Learn the market. Trade with a plan.</h1>
              <p className="nova-subtitle" style={{ marginBottom: '16px' }}>
                Build your gold-trading foundation in our 30-lesson Forex School, then link your JustMarkets MT5 account to unlock live market telemetry and quantitative models.
              </p>

              {/* Quick Partner & Status Row */}
              <div className="nova-social-row" style={{ marginBottom: '16px' }}>
                <a
                  href={DEFAULT_PARTNER_CONFIG.primaryLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="nova-social-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eab167" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15 3 21 3 21 9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                  <span>Register on JustMarkets</span>
                </a>
                <Link href="/verification" className="nova-social-btn">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <span>Check Access Status</span>
                </Link>
              </div>

              {/* Primary & Secondary Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                <Link href="/onboarding?redirect=/terminal" className="nova-submit-btn" style={{ textDecoration: 'none' }}>
                  <span>Connect MT5 Account &amp; Proceed</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
                <Link
                  href="/academy"
                  className="nova-social-btn"
                  style={{ padding: '12px 16px', justifyContent: 'center', borderColor: 'rgba(234, 177, 103, 0.28)' }}
                >
                  <span>Start 30-Lesson Forex School (Lessons 1-5 Free)</span>
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </div>
            </div>

            <div className="nova-divider" style={{ margin: '4px 0 8px' }}>
              LIVE XAUUSD TELEMETRY
            </div>

            {/* Embedded Live Spot Gold Feed */}
            <div>
              <LiveSpotFeed initialQuote={initialQuote} />
              <div className="nova-disclosure-footer" style={{ marginTop: '14px', paddingTop: '12px' }}>
                <strong style={{ color: '#94A3B8' }}>Non-Custodial Execution:</strong> Your trading capital remains inside your own JustMarkets MT5 account. Market data and setup rationales are informational; leveraged gold trading involves significant risk of loss.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 2: 4-STEP INSTITUTIONAL PATH                           */}
      {/* ============================================================== */}
      <section className="home-journey section-block" aria-labelledby="journey-title">
        <div className="container-main">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">Your Path</span>
              <h2 id="journey-title" style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>
                Learn first. Connect when you are ready.
              </h2>
              <p>Partner-sponsored access follows a transparent, sequential verification path.</p>
            </div>
          </div>
          <div className="journey-grid">
            <article className="journey-card">
              <span className="journey-number">01</span>
              <h3 style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>Register through our partner</h3>
              <p>Create your MT5 account through the official JustMarkets partner link (`tohstb0d83`).</p>
              <a className="text-link" href={DEFAULT_PARTNER_CONFIG.primaryLink} target="_blank" rel="noopener noreferrer">
                Open partner account <span aria-hidden="true">&#8599;</span>
              </a>
            </article>
            <article className="journey-card">
              <span className="journey-number">02</span>
              <h3 style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>Fund your broker account</h3>
              <p>Deposit directly with JustMarkets ($10 minimum on Standard Cent/Standard; $200 on Pro). Velarion never holds your capital.</p>
              <span className="journey-note">Funds remain with your broker</span>
            </article>
            <article className="journey-card">
              <span className="journey-number">03</span>
              <h3 style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>Build your trading knowledge</h3>
              <p>Complete our 30-lesson curriculum sequentially. Each module ends with a comprehension check.</p>
              <Link className="text-link" href="/academy">
                Explore the 30 lessons <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>
            <article className="journey-card">
              <span className="journey-number">04</span>
              <h3 style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>Verify &amp; review live context</h3>
              <p>Link your MT5 account and pass the 6-step access gate to inspect real-time XAUUSD setups and risk metrics.</p>
              <Link className="text-link" href="/verification">
                Open Verification Gate <span aria-hidden="true">&rarr;</span>
              </Link>
            </article>
          </div>
          <p className="home-partner-footnote">
            Partner access is subject to server-side broker attribution, account tier margin eligibility, and sequential School completion.
          </p>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 3: PLATFORM CAPABILITIES                               */}
      {/* ============================================================== */}
      <section className="home-tools section-block" aria-labelledby="tools-title">
        <div className="container-main">
          <div className="section-heading-row">
            <div>
              <span className="section-eyebrow">Explore the Platform</span>
              <h2 id="tools-title" style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>
                Built for disciplined XAUUSD execution.
              </h2>
            </div>
          </div>
          <div className="home-tools-grid">
            <Link className="home-tool-card" href="/academy">
              <span className="home-tool-icon" aria-hidden="true">01</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>Forex School</h3>
                <p>30 structured lessons covering XAUUSD market mechanics, liquidity sweeps, and risk governance.</p>
              </div>
              <span className="home-tool-arrow" aria-hidden="true">&#8599;</span>
            </Link>
            <Link className="home-tool-card" href="/strategies">
              <span className="home-tool-icon" aria-hidden="true">02</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>Quantitative Models</h3>
                <p>Inspect the Trend Continuation v2 rule set, 1.8:1 minimum R:R filter, and ATR protective stop logic.</p>
              </div>
              <span className="home-tool-arrow" aria-hidden="true">&#8599;</span>
            </Link>
            <Link className="home-tool-card" href="/tools/growth-calculator">
              <span className="home-tool-icon" aria-hidden="true">03</span>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display, "Fraunces", Georgia, serif)', fontWeight: 500 }}>Risk &amp; Margin Calculator</h3>
                <p>Simulate lot sizing, Standard Cent vs. Standard contract exposure, and drawdown ceilings before trading.</p>
              </div>
              <span className="home-tool-arrow" aria-hidden="true">&#8599;</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* SECTION 4: RISK DISCLOSURE BAR                                 */}
      {/* ============================================================== */}
      <section className="home-disclosure">
        <div className="container-main home-disclosure-inner">
          <strong>Trading Risk Notice</strong>
          <p>
            Spot gold (XAUUSD) and leveraged derivative products carry a high level of risk and can result in the loss of some or all of your invested capital. Past performance is not indicative of future results.
          </p>
          <Link href="/why-gold">
            Read the XAUUSD Dossier <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </section>
    </div>
  );
}

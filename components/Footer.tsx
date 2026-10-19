import React from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function Footer() {
  const partnerLink = DEFAULT_PARTNER_CONFIG.primaryLink;

  return (
    <footer
      className="footer"
      style={{
        background: 'var(--bg-surface-1)',
        borderTop: '1px solid var(--border-default)',
        padding: '54px 24px 40px',
        marginTop: 'auto',
      }}
    >
      <div className="footer-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '36px',
          marginBottom: '40px'
        }}>
          {/* Brand Column */}
          <div>
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: '14px', textDecoration: 'none' }}>
              <picture>
                <source srcSet="/velarion_emblem_dark.webp" type="image/webp" />
                <img
                  src="/velarion_emblem_dark.png"
                  alt="Velarion Emblem"
                  width={34}
                  height={34}
                  style={{ width: '34px', height: '34px', objectFit: 'contain', marginRight: '10px' }}
                />
              </picture>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.8px' }}>
                  VELARION MARKETS
                </span>
                <span style={{ fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
                  QUANTITATIVE TRADING / XAUUSD
                </span>
              </div>
            </Link>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '340px' }}>
              Quantitative Spot Gold (XAUUSD) execution technology and 30-lesson structured academy. No platform subscription fee; subsidized through an official Introducing Broker partnership with JustMarkets.
            </p>
            <div style={{ marginTop: '16px' }}>
              <span className="status-badge status-neutral" style={{ fontSize: '10.5px' }}>
                FUNDS HELD WITH YOUR BROKER / TRADING RISK APPLIES
              </span>
            </div>
          </div>

          {/* Core Navigation */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Platform Navigation
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <li>
                <Link href="/why-gold" style={{ color: 'var(--text-secondary)' }}>Why Spot Gold (XAUUSD)</Link>
              </li>
              <li>
                <Link href="/strategies" style={{ color: 'var(--text-secondary)' }}>Quantitative Models</Link>
              </li>
              <li>
                <Link href="/academy" style={{ color: 'var(--text-secondary)' }}>30-Lesson Forex School</Link>
              </li>
              <li>
                <Link href="/tools/growth-calculator" style={{ color: 'var(--text-secondary)' }}>200-Pip Growth Calculator</Link>
              </li>
              <li>
                <Link href="/onboarding" style={{ color: 'var(--text-secondary)' }}>Onboarding &amp; Verification</Link>
              </li>
              <li>
                <Link href="/terminal" style={{ color: 'var(--text-secondary)' }}>Trading Terminal</Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance Disclosures */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Legal &amp; Compliance
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              <li>
                <Link href="/legal/terms" style={{ color: 'var(--text-secondary)' }}>Terms of Service</Link>
              </li>
              <li>
                <Link href="/legal/risk-disclosure" style={{ color: 'var(--text-secondary)' }}>Risk Disclosure</Link>
              </li>
              <li>
                <Link href="/legal/ib-disclosure" style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>IB &amp; Conflict Disclosure</Link>
              </li>
              <li>
                <Link href="/legal/privacy" style={{ color: 'var(--text-secondary)' }}>Privacy &amp; Security Policy</Link>
              </li>
              <li>
                <Link href="/legal/complaints" style={{ color: 'var(--text-secondary)' }}>Support &amp; Complaints Route</Link>
              </li>
            </ul>
          </div>

          {/* Official Broker Partner Column */}
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
              Broker Sponsorship
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '14px' }}>
              Partner-sponsored access via JustMarkets with code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code>. No platform subscription fee; broker costs and eligibility requirements apply. Funds staying with your broker does not protect against trading losses.
            </p>
            <a
              href={partnerLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '8px 14px', display: 'inline-block' }}
            >
              Create an account &rarr;
            </a>
          </div>
        </div>

        {/* Detailed Regulatory & IB Conflict Disclaimer */}
        <div style={{
          borderTop: '1px solid var(--border-default)',
          paddingTop: '24px',
          fontSize: '11.5px',
          color: 'var(--text-muted)',
          lineHeight: 1.7
        }}>
          <p style={{ marginBottom: '10px' }}>
            <strong>High-Risk Investment Warning:</strong> Trading foreign exchange and Spot Gold (XAUUSD) Contracts for Difference (CFDs) with leverage carries a high degree of risk and can result in the loss of your entire deposited capital. Spreads, overnight financing swaps, and market execution slippage apply to all broker orders. Past performance, hypothetical backtests, and growth compounding simulations are not indicative of future results.
          </p>
          <p style={{ marginBottom: '10px' }}>
            <strong>Introducing Broker (IB) Relationship &amp; Conflict Notice:</strong> Velarion Markets acts as an independent technology affiliate and Introducing Broker for JustMarkets. Velarion Markets receives volume-based commission rebates and referral compensation when clients register with partner code <strong>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong> and execute trades. This commercial structure represents an inherent conflict of interest. Risk controls, including lot caps, daily loss limits, and emergency stops, do not guarantee protection from loss; availability and execution readiness require verification.
          </p>
          <p>
            <strong>Regulatory Jurisdiction Notice:</strong> Velarion Markets has not yet obtained an algorithmic trading license or retail investment advisor approval from the Capital Markets Authority (CMA) of Kenya. A formal legal and regulatory compliance review is designated as an essential pre-launch requirement prior to commercial deployment of the referral-plus-automated-execution model in Kenya.
          </p>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <span>&copy; {new Date().getFullYear()} Velarion Markets. All rights reserved. Non-Custodial Algorithmic Technology.</span>
            <span className="mono-nums">PARTNER: JUSTMARKETS (CODE: {DEFAULT_PARTNER_CONFIG.primaryCode})</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

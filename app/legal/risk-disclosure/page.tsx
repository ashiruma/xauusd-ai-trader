import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/legal/risk-disclosure' },
  openGraph: { url: 'https://velarion-one.vercel.app/legal/risk-disclosure', type: 'website' },
  title: 'Risk Disclosure | Velarion Markets',
  description: 'Detailed risk disclosure covering leveraged Spot Gold (XAUUSD) trading, algorithmic execution risks, market volatility, and slippage.',
};

export default function RiskDisclosurePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '48px auto 80px', padding: '0 24px' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Risk Disclosure</span>
      </nav>

      <span className="section-eyebrow">Important Safety Notice</span>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
        High-Risk Investment Disclosure
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Mandatory Disclosure Statement &bull; Spot Gold (XAUUSD) &amp; Leveraged Foreign Exchange
      </p>

      {/* Prominent Warning Callout */}
      <div style={{
        background: 'var(--accent-red-subtle)',
        border: '1.5px solid var(--accent-red-border)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: '36px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-red)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Capital at Risk Warning
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
          Trading foreign exchange (Forex) and Contracts for Difference (CFDs) on Spot Gold (XAUUSD) with leverage is highly speculative, carries a substantial level of risk, and may not be suitable for all investors. You may sustain a loss of some or all of your invested capital. You should not deposit or speculate with capital that you cannot afford to lose.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Leverage and Margin Depletion
          </h2>
          <p>
            Leverage magnifies both gains and losses in equal proportion. A small price fluctuation against your open position can result in rapid margin depletion. If account equity falls below the broker stop-out threshold, JustMarkets automated risk systems will liquidate positions at the prevailing market price, which may lock in substantial losses.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Slippage, Gap Risk, and Market Execution
          </h2>
          <p>
            During macroeconomic news events (e.g. US Non-Farm Payrolls, CPI, FOMC rate decisions) or weekend market opens, price discovery may gap beyond predetermined stop-loss levels. In extreme volatility, market orders may be executed at prices significantly different from the requested price (slippage). Velarion Markets cannot eliminate or guarantee against execution slippage.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Spreads, Swaps, and Broker Financing Costs
          </h2>
          <p>
            While Velarion charges <strong>no platform subscription fee</strong>, trading involves continuous broker costs:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>Bid/Ask Spread:</strong> The difference between buy and sell price charged by the liquidity provider on every order fill.</li>
            <li><strong>Overnight Swaps:</strong> Financing interest charged or earned on positions held open across daily 00:00 server rollover.</li>
            <li><strong>Broker Commissions:</strong> Account-specific execution fees applicable on ECN or Raw spread accounts.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            4. Algorithmic and Technological Dependencies
          </h2>
          <p>
            Automated trading systems rely on algorithmic calculation engines, socket feeds, and internet connectivity. Hardware failure, communication latency, hosting downtime, software bugs, or broker API disconnects can disrupt signal execution. Users must monitor their accounts and make use of mandatory risk settings (exposure caps, daily loss limits, and emergency kill switches).
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            5. Education Does Not Guarantee Profitability
          </h2>
          <p>
            Completing the required Velarion Forex School core curriculum and passing comprehension checks demonstrates theoretical understanding of market mechanics and risk frameworks. Educational completion does not eliminate market risk, ensure trade profitability, or protect against psychological execution error.
          </p>
        </section>
      </div>
    </div>
  );
}

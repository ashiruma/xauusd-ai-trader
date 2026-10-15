import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import GrowthCalculator from '@/components/GrowthCalculator';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  title: '200-Pip Growth Engine Calculator | Spot Gold Compounding Tool',
  description: 'Interactive XAUUSD spot gold 200-pip compounding calculator. Model 10-trade growth trajectories from $10 to $1,000+ with disciplined risk percentage and lot size calculations.',
  openGraph: {
    title: '200-Pip Growth Engine Calculator | Velarion Markets',
    description: 'Calculate exact lot sizes and multi-trade compounding projections on Spot Gold without overleveraging.',
    url: 'https://xauusd-ai-trader.vercel.app/tools/growth-calculator'
  }
};

export default function GrowthCalculatorPage() {
  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link href="/" style={{ color: 'var(--accent-gold)' }}>Home</Link> &gt; Interactive Tools &gt; 200-Pip Growth Engine Calculator
      </div>

      <div className="landing-eyebrow">
        <span>INTERACTIVE RISK &amp; COMPOUNDING TOOL</span>
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '14px' }}>
        200-Pip Growth Engine Calculator
      </h1>

      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '820px', marginBottom: '32px' }}>
        Understand the mathematical reality of trading Spot Gold. This interactive tool models a disciplined 10-trade compounding sequence based on fixed percentage risk per trade, Stop Loss distance in pips, and realistic 200-pip target expansions.
      </p>

      {/* Main Interactive Calculator Component */}
      <GrowthCalculator />

      {/* Educational Walkthrough & Pip Math */}
      <div style={{ marginTop: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        <div className="panel-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            Understanding XAUUSD Pip Value Math
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
            On standard MT5 brokers like JustMarkets, 1.00 Standard Lot of XAUUSD represents 100 troy ounces of gold:
          </p>
          <ul style={{ fontSize: '12.5px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li><strong>0.01 Micro Lot:</strong> $0.10 gain or loss per 1 pip ($0.01 price move) &bull; $1.00 per $1.00 gold move.</li>
            <li><strong>0.10 Mini Lot:</strong> $1.00 gain or loss per 1 pip &bull; $10.00 per $1.00 gold move.</li>
            <li><strong>1.00 Standard Lot:</strong> $10.00 gain or loss per 1 pip &bull; $100.00 per $1.00 gold move.</li>
          </ul>
        </div>

        <div className="panel-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            The Physics of Asymmetric Risk-Reward
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '12px' }}>
            By maintaining a strict 30-pip Stop Loss and targeting 200-pip trends, your Risk-to-Reward ratio exceeds 1:6.6:
          </p>
          <ul style={{ fontSize: '12.5px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>You only need a <strong>20% win rate</strong> to achieve overall platform profitability.</li>
            <li>Risking 2% per trade ensures you can withstand 10 consecutive losses with less than a 19% drawdown.</li>
            <li>Each winning trade recovers more than six normal losses.</li>
          </ul>
        </div>
      </div>

      {/* Subsidized MT5 Execution CTA */}
      <div style={{
        marginTop: '32px',
        background: 'var(--bg-surface-2)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Apply This Math on Regulated JustMarkets MT5
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Partner Code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong> provides raw ECN spreads and subsidized terminal access.
          </div>
        </div>
        <a
          href={DEFAULT_PARTNER_CONFIG.primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-gold"
          style={{ padding: '10px 20px', fontSize: '13px' }}
        >
          Open MT5 Account &rarr;
        </a>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function GrowthCalculatorPage() {
  const [startBalance, setStartBalance] = useState<number>(100);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(2);
  const [pipsPerWin, setPipsPerWin] = useState<number>(20);

  const calculateGrowth = () => {
    let balance = startBalance;
    const steps = [];
    for (let i = 1; i <= 10; i++) {
      const profit = balance * (riskPerTrade / 100) * (pipsPerWin / 20);
      balance += profit;
      steps.push({ trade: i, balance: balance.toFixed(2) });
    }
    return steps;
  };

  const projection = calculateGrowth();
  const finalBalance = parseFloat(projection[projection.length - 1].balance);
  const multiplier = startBalance > 0 ? (finalBalance / startBalance).toFixed(2) : '0';

  return (
    <main style={{ maxWidth: '960px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>200-Pip Growth Calculator</span>
      </nav>

      {/* Broker Sponsorship Banner */}
      <div style={{
        marginBottom: '32px',
        padding: '16px 20px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--accent-gold)' }}>100% Subsidized Platform:</strong> Subsidized by our official broker partner <strong>JustMarkets</strong>. Non-custodial capital security.
        </div>
        <a
          href="https://one.justmarkets.link/a/tohstb0d83"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-gold"
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Open MT5 Account &rarr;
        </a>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div className="section-eyebrow">
          <span>Quantitative Position Sizing Tool</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          200-Pip Growth Engine Calculator
        </h1>
        <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto' }}>
          Simulate how disciplined risk management compounds capital from ${startBalance} to ${finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })} over 10 consecutive wins.
        </p>
      </div>

      {/* Interactive Tool Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '24px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '32px'
      }}>
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Starting Account Balance ($ USD)
            </label>
            <input
              type="number"
              value={startBalance}
              onChange={(e) => setStartBalance(Math.max(1, Number(e.target.value)))}
              className="calc-input mono-nums"
              min={10}
              max={100000}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Risk Per Trade ({riskPerTrade}% of Account)
            </label>
            <input
              type="number"
              value={riskPerTrade}
              onChange={(e) => setRiskPerTrade(Math.max(0.25, Math.min(10, Number(e.target.value))))}
              className="calc-input mono-nums"
              min={0.5}
              max={10}
              step={0.5}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Recommended institutional risk: 1.0% to 2.0% per trade.
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Target Pips Per Trade
            </label>
            <input
              type="number"
              value={pipsPerWin}
              onChange={(e) => setPipsPerWin(Math.max(5, Number(e.target.value)))}
              className="calc-input mono-nums"
              min={10}
              max={500}
              step={5}
            />
          </div>

          <div style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '20px'
          }}>
            <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Projected Growth Multiplier
            </div>
            <div className="mono-nums" style={{ fontSize: '32px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
              {multiplier}x Return
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Net Capital Gain: +${(finalBalance - startBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Projection Results Column */}
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                10-Trade Compounding Projection
              </h3>
              <span className="status-badge status-completed">
                GEOMETRIC
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto', paddingRight: '6px' }}>
              {projection.map((step) => (
                <div
                  key={step.trade}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-1)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '13px'
                  }}
                >
                  <span style={{ color: 'var(--text-secondary)' }}>Execution #{step.trade}</span>
                  <span className="mono-nums" style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>
                    ${Number(step.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-default)', paddingTop: '16px' }}>
            <Link
              href="/onboarding"
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px', fontSize: '13px', textAlign: 'center' }}
            >
              Unlock Free Access via JustMarkets &rarr;
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

type SimulationScenario = 'mixed' | 'drawdown' | 'ideal';

export default function GrowthCalculatorPage() {
  const [startBalance, setStartBalance] = useState<number>(100);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(2.0);
  const [stopLossPips, setStopLossPips] = useState<number>(30);
  const [targetPips, setTargetPips] = useState<number>(60);
  const [spreadPips, setSpreadPips] = useState<number>(1.8);
  const [scenario, setScenario] = useState<SimulationScenario>('mixed');

  // Pip value on XAUUSD: 1 Standard Lot (100 oz) = $10.00 / pip ($1.00 price move = 10 pips)
  // Micro-lot 0.01 = $0.10 / pip
  const pipValuePerStandardLot = 10.0;

  // Calculate Trade Sequence based on scenario
  const calculateSequence = () => {
    let balance = startBalance;
    const steps = [];

    // Define sequences for 10 trades
    // mixed: W, L, W, W, L, W, L, W, W, L (6 wins, 4 losses - 60% win rate)
    // drawdown: L, L, L, L, L, W, W, L, W, W (5 consecutive losses stress test)
    // ideal: 10 consecutive wins (statistical upper bound)
    const patterns: Record<SimulationScenario, ('W' | 'L')[]> = {
      mixed: ['W', 'L', 'W', 'W', 'L', 'W', 'L', 'W', 'W', 'L'],
      drawdown: ['L', 'L', 'L', 'L', 'L', 'W', 'W', 'L', 'W', 'W'],
      ideal: ['W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W', 'W'],
    };

    const pattern = patterns[scenario];
    let peakBalance = balance;
    let maxDrawdownUsd = 0;
    let maxDrawdownPct = 0;

    for (let i = 0; i < pattern.length; i++) {
      const outcome = pattern[i];

      // Position Sizing: Risk Amount = Balance * (Risk% / 100)
      const riskAmountUsd = balance * (riskPerTrade / 100);

      // Raw Lot size required to risk exactly riskAmountUsd across stopLossPips
      // Lot = RiskAmount / (SL Pips * $10)
      const rawLots = riskAmountUsd / (stopLossPips * pipValuePerStandardLot);
      // Broker minimum lot is 0.01, rounded to 2 decimal places
      const lots = Math.max(0.01, Math.round(rawLots * 100) / 100);

      // Broker Spread Cost = Lots * Spread Pips * $10
      const spreadCost = Number((lots * spreadPips * pipValuePerStandardLot).toFixed(2));

      let tradePnL = 0;
      if (outcome === 'W') {
        // Gross Profit = Lots * TP Pips * $10
        const grossProfit = lots * targetPips * pipValuePerStandardLot;
        tradePnL = Number((grossProfit - spreadCost).toFixed(2));
      } else {
        // Gross Loss = Lots * SL Pips * $10
        const grossLoss = lots * stopLossPips * pipValuePerStandardLot;
        tradePnL = Number((-grossLoss - spreadCost).toFixed(2));
      }

      balance = Math.max(0, Number((balance + tradePnL).toFixed(2)));

      if (balance > peakBalance) {
        peakBalance = balance;
      }
      const ddUsd = peakBalance - balance;
      const ddPct = peakBalance > 0 ? (ddUsd / peakBalance) * 100 : 0;
      if (ddUsd > maxDrawdownUsd) maxDrawdownUsd = ddUsd;
      if (ddPct > maxDrawdownPct) maxDrawdownPct = ddPct;

      steps.push({
        trade: i + 1,
        outcome,
        lots,
        spreadCost,
        tradePnL,
        balance,
        drawdownPct: ddPct.toFixed(1)
      });
    }

    return { steps, finalBalance: balance, maxDrawdownPct, maxDrawdownUsd };
  };

  const { steps, finalBalance, maxDrawdownPct } = calculateSequence();
  const netGain = finalBalance - startBalance;
  const returnPct = startBalance > 0 ? ((netGain / startBalance) * 100).toFixed(1) : '0';

  return (
    <main style={{ maxWidth: '1000px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>Risk &amp; Compounding Calculator</span>
      </nav>

      {/* Mandatory Regulatory Header Callout */}
      <div style={{
        marginBottom: '28px',
        padding: '16px 20px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Hypothetical Simulation:</strong> Model projections incorporate broker spreads and strict lot-sizing math. Results do not guarantee future returns.
        </div>
        <Link
          href="/legal/risk-disclosure"
          style={{ fontSize: '12px', color: 'var(--accent-gold)', textDecoration: 'underline' }}
        >
          View Risk Disclosure &rarr;
        </Link>
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '36px' }}>
        <div className="section-eyebrow">
          <span>Mathematical Position Sizing &amp; Drawdown Engine</span>
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          Quantitative Compounding &amp; Risk Simulator
        </h1>
        <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '680px', margin: '0 auto', lineHeight: 1.6 }}>
          Model the mathematical reality of position sizing on Spot Gold (XAUUSD), including broker spreads, realistic win/loss sequences, and drawdown stress tests.
        </p>
      </div>

      {/* Scenario Selector Tabs */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => setScenario('mixed')}
          className="btn"
          style={{
            fontSize: '12.5px',
            padding: '8px 18px',
            background: scenario === 'mixed' ? 'var(--accent-gold)' : 'var(--bg-surface-1)',
            color: scenario === 'mixed' ? '#FFFFFF' : 'var(--text-primary)',
            border: scenario === 'mixed' ? '1px solid var(--accent-gold)' : '1px solid var(--border-default)'
          }}
        >
          Realistic Outcome (6W - 4L, 1:2 R:R)
        </button>

        <button
          type="button"
          onClick={() => setScenario('drawdown')}
          className="btn"
          style={{
            fontSize: '12.5px',
            padding: '8px 18px',
            background: scenario === 'drawdown' ? 'var(--accent-red)' : 'var(--bg-surface-1)',
            color: scenario === 'drawdown' ? '#FFFFFF' : 'var(--text-primary)',
            border: scenario === 'drawdown' ? '1px solid var(--accent-red)' : '1px solid var(--border-default)'
          }}
        >
          Drawdown Stress Test (5 Losses)
        </button>

        <button
          type="button"
          onClick={() => setScenario('ideal')}
          className="btn"
          style={{
            fontSize: '12.5px',
            padding: '8px 18px',
            background: scenario === 'ideal' ? 'var(--accent-green)' : 'var(--bg-surface-1)',
            color: scenario === 'ideal' ? '#FFFFFF' : 'var(--text-primary)',
            border: scenario === 'ideal' ? '1px solid var(--accent-green)' : '1px solid var(--border-default)'
          }}
        >
          Hypothetical Upper Bound (10W)
        </button>
      </div>

      {/* Interactive Tool Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '24px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '28px',
        marginBottom: '36px'
      }}>
        {/* Controls Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Starting Account Balance ($ USD)
            </label>
            <input
              type="number"
              value={startBalance}
              onChange={(e) => setStartBalance(Math.max(10, Number(e.target.value)))}
              className="calc-input mono-nums"
              min={10}
              max={100000}
            />
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Minimum broker deposit: $10 on JustMarkets Standard/Pro account.
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Risk Per Trade (%)
              </label>
              <input
                type="number"
                value={riskPerTrade}
                onChange={(e) => setRiskPerTrade(Math.max(0.5, Math.min(5.0, Number(e.target.value))))}
                className="calc-input mono-nums"
                min={0.5}
                max={5.0}
                step={0.5}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Broker Spread (Pips)
              </label>
              <input
                type="number"
                value={spreadPips}
                onChange={(e) => setSpreadPips(Math.max(0.5, Number(e.target.value)))}
                className="calc-input mono-nums"
                min={0.5}
                max={10}
                step={0.1}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Stop-Loss (Pips)
              </label>
              <input
                type="number"
                value={stopLossPips}
                onChange={(e) => setStopLossPips(Math.max(10, Number(e.target.value)))}
                className="calc-input mono-nums"
                min={10}
                max={200}
                step={5}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Target Take-Profit (Pips)
              </label>
              <input
                type="number"
                value={targetPips}
                onChange={(e) => setTargetPips(Math.max(10, Number(e.target.value)))}
                className="calc-input mono-nums"
                min={10}
                max={300}
                step={10}
              />
            </div>
          </div>

          {/* Metric Summary Card */}
          <div style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>End Balance</div>
              <div className="mono-nums" style={{ fontSize: '22px', fontWeight: 800, color: netGain >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '2px' }}>
                ${finalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Net Return: {returnPct}%
              </div>
            </div>

            <div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Drawdown</div>
              <div className="mono-nums" style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-red)', marginTop: '2px' }}>
                -{maxDrawdownPct.toFixed(1)}%
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Risk Ratio: 1:{(targetPips / stopLossPips).toFixed(1)} R:R
              </div>
            </div>
          </div>
        </div>

        {/* Trade-by-Trade Execution Ledger */}
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                10-Trade Sequence Ledger
              </span>
              <span className={`status-badge ${scenario === 'mixed' ? 'status-warning' : scenario === 'drawdown' ? 'status-danger' : 'status-completed'}`}>
                {scenario === 'mixed' ? '6W - 4L MIXED' : scenario === 'drawdown' ? 'STRESS TEST' : 'STATISTICAL UPPER BOUND'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '310px', overflowY: 'auto', paddingRight: '4px' }}>
              {steps.map((s) => (
                <div
                  key={s.trade}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-xs)',
                    background: 'var(--bg-surface-1)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="mono-nums" style={{
                      fontWeight: 700,
                      color: s.outcome === 'W' ? 'var(--accent-green)' : 'var(--accent-red)',
                      width: '16px'
                    }}>
                      {s.outcome}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      #{s.trade} &bull; {s.lots} lots (Spread -${s.spreadCost})
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span className="mono-nums" style={{
                      fontWeight: 700,
                      color: s.tradePnL >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
                    }}>
                      {s.tradePnL >= 0 ? `+$${s.tradePnL}` : `-$${Math.abs(s.tradePnL)}`}
                    </span>
                    <span className="mono-nums" style={{ color: 'var(--text-muted)', marginLeft: '8px' }}>
                      ${s.balance.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-default)', paddingTop: '14px' }}>
            <Link
              href="/onboarding"
              className="btn btn-primary"
              style={{ width: '100%', padding: '10px', fontSize: '13px', textAlign: 'center' }}
            >
              Start Prerequisite Onboarding &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Mathematical Methodology & Transparent Assumptions Card */}
      <div style={{
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        fontSize: '13px',
        color: 'var(--text-secondary)',
        lineHeight: 1.65
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
          Mathematical Methodology &amp; Execution Assumptions
        </h3>
        <p style={{ marginBottom: '12px' }}>
          <strong>Position Sizing Formula:</strong> Calculated dynamically per execution using:
          <code className="mono-nums" style={{ display: 'block', background: 'var(--bg-surface-2)', padding: '8px 12px', borderRadius: '4px', margin: '8px 0', color: 'var(--accent-gold)' }}>
            Lot Size = (Current Account Balance &times; Risk %) / (Stop-Loss Pips &times; $10.00)
          </code>
          Where $10.00 represents the value of 1 pip on 1 standard lot of XAUUSD (100 Troy Ounces). Micro-lot floor is 0.01 ($0.10/pip).
        </p>

        <p style={{ marginBottom: '12px' }}>
          <strong>Broker Costs Incorporated:</strong> An institutional spread of {spreadPips} pips is deducted on every order fill. Overnight financing swaps and potential execution slippage during news breakouts may increase trading costs.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>Historical Backtest Model</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Sample: 2024&ndash;2025 tick data &bull; 1.8 pip spread assumption &bull; Strict 30-pip SL rules.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green)', textTransform: 'uppercase' }}>Paper Simulation Forward Test</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Streaming tick feeds via TradingView &amp; JustMarkets MT5 demo preview.
            </p>
          </div>

          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>Live Broker Execution</div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
              Requires mandatory referral registration, funded deposit, and explicit trading authorization.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

interface TradeProjection {
  tradeNum: number;
  startBalance: number;
  riskDollars: number;
  lotSize: number;
  gainDollars: number;
  endBalance: number;
  roiPct: number;
}

export default function GrowthCalculator() {
  const [startingBalance, setStartingBalance] = useState<number>(100);
  const [riskPct, setRiskPct] = useState<number>(2.0);
  const [stopLossPips, setStopLossPips] = useState<number>(30);
  const [targetPips, setTargetPips] = useState<number>(200);

  const presetBalances = [10, 50, 100, 250, 500, 1000];
  const presetRisks = [1.0, 2.0, 3.0, 5.0];
  const presetTargets = [50, 100, 150, 200];

  const projections: TradeProjection[] = useMemo(() => {
    const list: TradeProjection[] = [];
    let currentBal = startingBalance;

    for (let i = 1; i <= 10; i++) {
      const riskAmount = Number((currentBal * (riskPct / 100)).toFixed(2));
      // On XAUUSD (100 oz contract), 0.01 lot = $0.10 per pip ($1.00 per $1.00 price expansion)
      // Pip dollar value per 0.01 lot = $0.10
      // Ideal lot size based on SL risk:
      const calculatedLots = riskAmount / (stopLossPips * 0.10 * 100);
      const lotSize = Math.max(0.01, Number((Math.floor(calculatedLots * 100) / 100).toFixed(2)));
      
      // Profit calculation on reaching target pips
      const gain = Number((targetPips * 0.10 * (lotSize / 0.01)).toFixed(2));
      const endBal = Number((currentBal + gain).toFixed(2));
      const roi = Number((((endBal - startingBalance) / startingBalance) * 100).toFixed(1));

      list.push({
        tradeNum: i,
        startBalance: currentBal,
        riskDollars: riskAmount,
        lotSize,
        gainDollars: gain,
        endBalance: endBal,
        roiPct: roi
      });

      currentBal = endBal;
    }

    return list;
  }, [startingBalance, riskPct, stopLossPips, targetPips]);

  const finalProjection = projections[projections.length - 1];
  const totalGain = Number((finalProjection.endBalance - startingBalance).toFixed(2));
  const totalRoi = finalProjection.roiPct;

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      {/* Configuration Controls */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '16px',
        background: 'var(--bg-surface-2)',
        padding: '24px',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        marginBottom: '28px'
      }}>
        {/* Starting Capital */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', fontWeight: 700 }}>
            Starting Balance ($ USD)
          </label>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '8px' }}>
            {presetBalances.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setStartingBalance(b)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11.5px',
                  borderRadius: '4px',
                  border: startingBalance === b ? '1px solid var(--border-gold)' : '1px solid var(--border-default)',
                  background: startingBalance === b ? 'rgba(214,173,82,0.18)' : 'var(--bg-surface-1)',
                  color: startingBalance === b ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                ${b}
              </button>
            ))}
          </div>
          <input
            type="number"
            min="10"
            max="100000"
            step="10"
            value={startingBalance}
            onChange={(e) => setStartingBalance(Math.max(10, Number(e.target.value) || 10))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface-1)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '15px',
              fontWeight: 700
            }}
          />
        </div>

        {/* Risk Percentage */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', fontWeight: 700 }}>
            Risk Per Trade (%)
          </label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {presetRisks.map(r => (
              <button
                key={r}
                type="button"
                onClick={() => setRiskPct(r)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  borderRadius: '4px',
                  border: riskPct === r ? '1px solid var(--border-green)' : '1px solid var(--border-default)',
                  background: riskPct === r ? 'rgba(34,197,94,0.18)' : 'var(--bg-surface-1)',
                  color: riskPct === r ? 'var(--accent-green)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {r}%
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="range"
              min="0.5"
              max="5.0"
              step="0.5"
              value={riskPct}
              onChange={(e) => setRiskPct(Number(e.target.value))}
              style={{ flex: 1 }}
            />
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-green)', minWidth: '45px' }}>
              {riskPct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Stop Loss Pips */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', fontWeight: 700 }}>
            Stop Loss Guardrail (Pips)
          </label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {[20, 25, 30, 40].map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStopLossPips(s)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: stopLossPips === s ? '1px solid var(--accent-red)' : '1px solid var(--border-default)',
                  background: stopLossPips === s ? 'rgba(239,68,68,0.18)' : 'var(--bg-surface-1)',
                  color: stopLossPips === s ? 'var(--accent-red)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {s} pips
              </button>
            ))}
          </div>
          <input
            type="number"
            min="10"
            max="150"
            value={stopLossPips}
            onChange={(e) => setStopLossPips(Math.max(10, Number(e.target.value) || 10))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface-1)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px'
            }}
          />
        </div>

        {/* Target Pips */}
        <div>
          <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '8px', fontWeight: 700 }}>
            Pip Target Per Trade
          </label>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
            {presetTargets.map(t => (
              <button
                key={t}
                type="button"
                onClick={() => setTargetPips(t)}
                style={{
                  flex: 1,
                  padding: '4px 6px',
                  fontSize: '11px',
                  borderRadius: '4px',
                  border: targetPips === t ? '1px solid var(--border-gold)' : '1px solid var(--border-default)',
                  background: targetPips === t ? 'rgba(214,173,82,0.18)' : 'var(--bg-surface-1)',
                  color: targetPips === t ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {t} pips
              </button>
            ))}
          </div>
          <input
            type="number"
            min="20"
            max="500"
            value={targetPips}
            onChange={(e) => setTargetPips(Math.max(20, Number(e.target.value) || 20))}
            style={{
              width: '100%',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-default)',
              background: 'var(--bg-surface-1)',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        marginBottom: '28px'
      }}>
        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Initial Capital</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            ${startingBalance.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Starting equity baseline</div>
        </div>

        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-green)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', textTransform: 'uppercase', fontWeight: 700 }}>Projected Ending Balance</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            ${finalProjection.endBalance.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '2px' }}>After 10 compounded trades</div>
        </div>

        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-gold)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-gold)', textTransform: 'uppercase', fontWeight: 700 }}>Total Net Growth</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            +${totalGain.toFixed(2)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--accent-gold)', marginTop: '2px' }}>+{totalRoi}% compounding ROI</div>
        </div>

        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Risk : Reward Profile</div>
          <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
            {(targetPips / stopLossPips).toFixed(1)} : 1
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{targetPips} pips gain / {stopLossPips} pips SL</div>
        </div>
      </div>

      {/* Compounding Table */}
      <div style={{
        background: 'var(--bg-surface-2)',
        borderRadius: '12px',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        marginBottom: '28px'
      }}>
        <div style={{ padding: '18px 24px', borderBottom: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>10-Trade Compounding Projection Table</h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0 0' }}>Simulated progression enforcing dynamic position sizing on Spot Gold (XAUUSD)</p>
          </div>
          <span style={{
            fontSize: '10.5px',
            padding: '4px 10px',
            borderRadius: '4px',
            background: 'rgba(214,173,82,0.12)',
            color: 'var(--accent-gold)',
            border: '1px solid rgba(214,173,82,0.25)',
            fontWeight: 700
          }}>
            INSTITUTIONAL COMPOUNDING
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ background: 'var(--bg-surface-1)', borderBottom: '1px solid var(--border-default)', color: 'var(--text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '12px 18px' }}>Trade #</th>
                <th style={{ padding: '12px 18px' }}>Starting Equity</th>
                <th style={{ padding: '12px 18px' }}>Risk Amount</th>
                <th style={{ padding: '12px 18px' }}>Calculated Lots</th>
                <th style={{ padding: '12px 18px' }}>Target Profit ({targetPips}p)</th>
                <th style={{ padding: '12px 18px' }}>Ending Equity</th>
                <th style={{ padding: '12px 18px' }}>Total ROI</th>
              </tr>
            </thead>
            <tbody>
              {projections.map((p) => (
                <tr key={p.tradeNum} style={{ borderBottom: '1px solid var(--border-default)' }}>
                  <td style={{ padding: '12px 18px', fontWeight: 700, color: 'var(--text-primary)' }}>
                    Trade {p.tradeNum}
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)' }}>
                    ${p.startBalance.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', color: 'var(--accent-red)' }}>
                    ${p.riskDollars.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    {p.lotSize.toFixed(2)} lots
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)', fontWeight: 700 }}>
                    +${p.gainDollars.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    ${p.endBalance.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px 18px', fontFamily: 'var(--font-mono)', color: 'var(--accent-green)' }}>
                    +{p.roiPct}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Institutional Execution Callout & JustMarkets Onboarding */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(214,173,82,0.12) 0%, rgba(15,23,42,0.95) 100%)',
        border: '1px solid var(--border-gold)',
        borderRadius: '12px',
        padding: '28px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
          <div style={{ maxWidth: '650px' }}>
            <span style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              OFFICIAL BROKER EXECUTION PIPELINE
            </span>
            <h3 style={{ fontSize: '20px', fontWeight: 800, margin: '6px 0 8px 0', color: 'var(--text-primary)' }}>
              Deploy This Model Live with JustMarkets MT5 Raw Spreads
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              To execute 200-pip compounding without slippage drag, accounts require raw interbank spreads (from 0.0 pips) and zero execution delays. Register through our verified institutional partner link to unlock direct AI terminal signals and automated 2.0% risk guardrails.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', minWidth: '220px' }}>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '12px 20px',
                background: 'var(--accent-gold)',
                color: '#080E1A',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '13px',
                textDecoration: 'none',
                letterSpacing: '0.03em'
              }}
            >
              Open JustMarkets MT5 Account &rarr;
            </a>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
              Partner Code: <strong style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>
            </div>
          </div>
        </div>

        {/* Micro-account Guardrail Notice */}
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '6px',
          borderLeft: '3px solid var(--accent-gold)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          lineHeight: 1.5
        }}>
          <strong>Micro-Lot Guardrail Note:</strong> For starting accounts between $10.00 and $50.00, minimum trade sizes are 0.01 micro-lots. With 3000:1 leverage on JustMarkets MT5, a $10-$50 deposit comfortably meets margin requirements for 0.01 XAUUSD positions ($4.14 margin at $4,144 Gold spot).
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface LivePosition {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pips: number;
  openTime: string;
  strategy: string;
  lessonReference: string;
  status: 'OPEN';
}

interface ExecutedTrade {
  id: string;
  ticket: number;
  symbol: string;
  type: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pips: number;
  openTime: string;
  closeTime: string;
  strategy: string;
  lessonReference: string;
  exitReason: 'TP_HIT' | 'TRAILING_SL' | 'PARTIAL_CLOSE';
}

interface TradeEngineData {
  status: string;
  autoTradingEnabled: boolean;
  broker: string;
  accountNumber: string;
  currentSpotPrice: number;
  account: {
    initialDeposit: number;
    balance: number;
    openPnl: number;
    equity: number;
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    totalPipsBanked: number;
    dailyTargetPct: number;
  };
  activePosition: LivePosition | null;
  recentTrades: ExecutedTrade[];
  executionModelConsensus: {
    smcLiquiditySweep: { signal: string; confidence: number; reason: string };
    trendPullback: { signal: string; confidence: number; reason: string };
    sessionBreakout: { signal: string; confidence: number; reason: string };
    meanReversion: { signal: string; confidence: number; reason: string };
  };
}

export default function LiveTradingEngine() {
  const [data, setData] = useState<TradeEngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchTradeData = async () => {
    try {
      const res = await fetch('/api/trades/live', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeData();
    const interval = setInterval(fetchTradeData, 1500); // 1.5s real-time tick update
    return () => clearInterval(interval);
  }, []);

  const handleToggleAutoTrading = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/trades/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleAutoTrading' })
      });
      if (res.ok) {
        const json = await res.json();
        setActionMessage(json.message);
        setTimeout(() => setActionMessage(null), 4000);
        await fetchTradeData();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteNextSetup = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/trades/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'executeNextSetup', lots: 0.50 })
      });
      if (res.ok) {
        const json = await res.json();
        setActionMessage(json.message);
        setTimeout(() => setActionMessage(null), 4000);
        await fetchTradeData();
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="panel-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Autonomous Trading Telemetry...
      </div>
    );
  }

  const pos = data?.activePosition;
  const acc = data?.account;
  const isPosProfit = (pos?.pnl || 0) >= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Engine Status & Account Performance Header */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                className="dot-indicator"
                style={{
                  background: data?.autoTradingEnabled ? 'var(--accent-green)' : 'var(--text-muted)',
                  boxShadow: data?.autoTradingEnabled ? '0 0 8px rgba(4, 120, 87, 0.7)' : 'none'
                }}
              />
              <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: data?.autoTradingEnabled ? 'var(--accent-green)' : 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                {data?.autoTradingEnabled ? 'AUTONOMOUS EXECUTION: ACTIVE & MAKING TRADES' : 'AUTONOMOUS EXECUTION: PAUSED'}
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Live MT5 Trading Engine &bull; JustMarkets Custody
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handleToggleAutoTrading}
              disabled={actionLoading}
              type="button"
              className={`btn ${data?.autoTradingEnabled ? 'btn-secondary' : 'btn-primary'}`}
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              {data?.autoTradingEnabled ? 'Pause Auto-Trading' : 'Activate Auto-Trading'}
            </button>

            <button
              onClick={handleExecuteNextSetup}
              disabled={actionLoading}
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              Dispatch Next Consensus Setup &rarr;
            </button>
          </div>
        </div>

        {actionMessage && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', color: 'var(--text-gold)', marginBottom: '16px' }}>
            {actionMessage}
          </div>
        )}

        {/* 4 Compounding Performance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Account Balance
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              ${acc?.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Initial: ${acc?.initialDeposit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Profit Generated
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-green)', marginTop: '4px' }}>
              +${acc?.totalProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {acc?.totalPipsBanked} Total Pips Won
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Live Floating PnL
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: isPosProfit ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '4px' }}>
              {isPosProfit ? '+' : ''}${acc?.openPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Equity: ${acc?.equity.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Algorithmic Win Rate
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
              {acc?.winRate}%
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Across {acc?.totalTrades} Verified Orders
            </div>
          </div>
        </div>
      </div>

      {/* Active Live Position Card */}
      {pos ? (
        <div className="panel-card" style={{ padding: '24px', border: '1.5px solid var(--border-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status-badge ${pos.type === 'BUY' ? 'status-completed' : 'status-danger'}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                ACTIVE LIVE TRADE: {pos.type} {pos.lots} LOTS
              </span>
              <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Ticket #{pos.ticket} &bull; {pos.symbol}
              </span>
            </div>

            <span className="mono-nums" style={{ fontSize: '16px', fontWeight: 800, color: isPosProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
              {isPosProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isPosProfit ? '+' : ''}{pos.pips} Pips)
            </span>
          </div>

          {/* Trade Execution Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px', fontSize: '13px' }}>
            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entry Price</div>
              <div className="mono-nums" style={{ fontWeight: 700, marginTop: '2px' }}>${pos.entryPrice.toFixed(2)}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Spot</div>
              <div className="mono-nums val-gold" style={{ fontWeight: 700, marginTop: '2px' }}>${pos.currentPrice.toFixed(2)}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stop Loss (SL)</div>
              <div className="mono-nums val-bear" style={{ fontWeight: 700, marginTop: '2px' }}>${pos.stopLoss.toFixed(2)}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Take Profit (TP)</div>
              <div className="mono-nums val-bull" style={{ fontWeight: 700, marginTop: '2px' }}>${pos.takeProfit.toFixed(2)}</div>
            </div>
          </div>

          {/* Educational Alignment Callout: Make Money While You Educate */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--accent-gold)' }}>Educate &amp; Earn Model Alignment:</strong> This trade was triggered by <strong>{pos.strategy}</strong> ({pos.lessonReference}).
            </div>
            <Link href="/academy" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700, textDecoration: 'none' }}>
              Review Lesson Strategy &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            Scanning market structure for high-confluence SMC entry...
          </div>
          <button
            onClick={handleExecuteNextSetup}
            disabled={actionLoading}
            type="button"
            className="btn btn-primary"
            style={{ fontSize: '12px' }}
          >
            Dispatch Next Consensus Setup Now
          </button>
        </div>
      )}

      {/* Educate & Earn Trade History Log */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Recent Autonomous Executions &bull; Profit Log
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Real trades executed by the 4 quantitative models. Each trade directly demonstrates concepts from our 30-lesson curriculum.
            </p>
          </div>
          <span className="status-badge status-completed">
            100% NON-CUSTODIAL MT5
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '8px 10px' }}>Ticket</th>
                <th style={{ padding: '8px 10px' }}>Model &amp; Lesson Reference</th>
                <th style={{ padding: '8px 10px' }}>Side / Lots</th>
                <th style={{ padding: '8px 10px' }}>Entry &rarr; Exit</th>
                <th style={{ padding: '8px 10px' }}>Pips</th>
                <th style={{ padding: '8px 10px', textAlign: 'right' }}>Profit (USD)</th>
              </tr>
            </thead>
            <tbody>
              {data?.recentTrades.map((t) => (
                <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td className="mono-nums" style={{ padding: '10px', color: 'var(--text-muted)' }}>
                    #{t.ticket}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.strategy}</div>
                    <div style={{ fontSize: '11px', color: 'var(--accent-gold)' }}>{t.lessonReference}</div>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span className={`status-badge ${t.type === 'BUY' ? 'status-completed' : 'status-danger'}`} style={{ fontSize: '10.5px' }}>
                      {t.type} {t.lots}
                    </span>
                  </td>
                  <td className="mono-nums" style={{ padding: '10px' }}>
                    ${t.entryPrice.toFixed(2)} &rarr; ${t.exitPrice.toFixed(2)}
                  </td>
                  <td className="mono-nums val-bull" style={{ padding: '10px', fontWeight: 600 }}>
                    +{t.pips.toFixed(1)}
                  </td>
                  <td className="mono-nums val-bull" style={{ padding: '10px', textAlign: 'right', fontWeight: 800 }}>
                    +${t.pnl.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

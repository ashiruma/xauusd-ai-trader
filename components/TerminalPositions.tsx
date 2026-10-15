'use client';

import React, { useEffect, useState } from 'react';

type Position = {
  ticket: number;
  symbol?: string;
  side: string;
  lots: number;
  entry_price: number;
  current_price: number;
  stop_loss: number;
  take_profit: number;
  floating_pnl: number;
  open_time?: string;
  signal_id?: string | null;
  strategy_id?: string | null;
  entry_rationale?: string | null;
};

type LoadState = 'loading' | 'connected' | 'offline';

function strategyLabel(strategyId?: string | null) {
  if (!strategyId) return 'Manual / Direct Broker Execution';
  const labels: Record<string, string> = {
    smc_liquidity_sweep: 'SMC Liquidity Sweep',
    liquidity_sweep: 'SMC Liquidity Sweep',
    dynamic_trend_pullback: 'Dynamic Trend Pullback',
    trend_pullback: 'Dynamic Trend Pullback',
    session_breakout: 'Session Range Breakout',
    statistical_mean_reversion: 'Statistical Mean Reversion',
    mean_reversion: 'Statistical Mean Reversion',
  };
  const normalized = strategyId.toLowerCase().replace(/[\s-]+/g, '_');
  return labels[normalized] || strategyId.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function positionRationale(position: Position): string {
  // Only display what was recorded with this exact position at entry!
  // Do not infer reasons from candidate setups or attach the latest unrelated signal.
  if (position.entry_rationale && position.entry_rationale.trim() !== '' && position.entry_rationale !== 'Entry rationale unavailable') {
    return position.entry_rationale;
  }
  return 'Entry rationale unavailable';
}

function money(value: number) {
  if (!Number.isFinite(value)) return '—';
  return `${value < 0 ? '−' : ''}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function price(value: number) {
  if (!Number.isFinite(value) || value === 0) return '—';
  return value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function TerminalPositions() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/positions', { cache: 'no-store' });
        if (!res.ok) throw new Error(`Positions API returned ${res.status}`);
        const data = await res.json();

        if (active) {
          if (data.is_connected === false || data.status === 'MT5_DISCONNECTED') {
            setState('offline');
            setPositions([]);
          } else {
            const nextPositions = Array.isArray(data.positions) ? (data.positions as Position[]) : [];
            setPositions(nextPositions);
            setState('connected');
          }
          setUpdatedAt(new Date());
        }
      } catch {
        if (active) {
          setState('offline');
          setPositions([]);
        }
      }
    };

    void load();
    const interval = window.setInterval(load, 5000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="terminal-stack">
      <section className="terminal-panel position-panel" aria-labelledby="positions-title">
        <div className="terminal-panel-heading">
          <div>
            <span className="terminal-overline">Execution monitor</span>
            <h2 id="positions-title">Open positions</h2>
            <p>Verified positions returned directly by the connected JustMarkets MT5 account.</p>
          </div>
          <span className={`terminal-live-status ${state}`}>
            <span className="terminal-status-dot" />
            {state === 'loading' ? 'Connecting' : state === 'connected' ? 'MT5 connected' : 'MT5 disconnected'}
          </span>
        </div>

        {state === 'loading' && <div className="terminal-empty-state">Querying connected MT5 account for open positions...</div>}

        {state === 'offline' && (
          <div className="terminal-empty-state terminal-empty-warning">
            <strong>MT5 disconnected &bull; Data unavailable</strong>
            <span>Cannot reach the broker gateway session. Connect your JustMarkets MT5 terminal to monitor open positions.</span>
          </div>
        )}

        {state === 'connected' && positions.length === 0 && (
          <div className="terminal-empty-state">
            <span className="terminal-empty-icon" aria-hidden="true">—</span>
            <strong>No open positions</strong>
            <span>The connected JustMarkets MT5 account currently reports zero active positions. Orders placed by the execution engine will appear here.</span>
          </div>
        )}

        {state === 'connected' && positions.length > 0 && (
          <div className="position-list">
            {positions.map((position) => {
              const isBuy = (position.side || '').toUpperCase().includes('BUY');
              const rationale = positionRationale(position);
              return (
                <article className="position-card" key={position.ticket}>
                  <div className="position-card-top">
                    <div className="position-instrument">
                      <span className={`position-side ${isBuy ? 'buy' : 'sell'}`}>{isBuy ? 'BUY' : 'SELL'}</span>
                      <div>
                        <strong>{position.symbol || 'XAUUSD.m'}</strong>
                        <span>Ticket #{position.ticket} &bull; {Number(position.lots).toFixed(2)} lots</span>
                      </div>
                    </div>
                    <div className={`position-pnl ${position.floating_pnl >= 0 ? 'positive' : 'negative'}`}>
                      <span>Floating P&amp;L</span>
                      <strong>{money(position.floating_pnl)}</strong>
                    </div>
                  </div>
                  <div className="position-metrics">
                    <div><span>Entry</span><strong>{price(position.entry_price)}</strong></div>
                    <div><span>Current</span><strong>{price(position.current_price)}</strong></div>
                    <div><span>Stop loss</span><strong className="negative-text">{price(position.stop_loss)}</strong></div>
                    <div><span>Take profit</span><strong className="positive-text">{price(position.take_profit)}</strong></div>
                  </div>
                  <details className="position-rationale">
                    <summary>
                      <span>Why this trade?</span>
                      <span className="rationale-strategy">{strategyLabel(position.strategy_id)}</span>
                    </summary>
                    <p style={{ marginTop: '8px', lineHeight: 1.5, color: rationale === 'Entry rationale unavailable' ? 'var(--text-muted)' : 'var(--text-primary)' }}>
                      {rationale}
                    </p>
                    {position.open_time && (
                      <time dateTime={position.open_time} style={{ display: 'block', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                        Opened {new Date(position.open_time).toLocaleString()}
                      </time>
                    )}
                  </details>
                </article>
              );
            })}
          </div>
        )}

        <div className="terminal-panel-footer">
          <span>Direct read-only stream from broker session. Telemetry refreshed automatically.</span>
          <span>{updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : 'Waiting for broker sync'}</span>
        </div>
      </section>
    </div>
  );
}

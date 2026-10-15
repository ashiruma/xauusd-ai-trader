'use client';

import React, { useEffect, useMemo, useState } from 'react';

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
};

type Setup = {
  strategy_id?: string;
  reason?: string;
  signal_id?: string;
};

type Signal = {
  signal_id?: string;
  strategy_id?: string;
  reasons?: string[];
  reason?: string;
  is_valid?: boolean;
  side?: string;
  confidence?: number;
  entry?: number;
  stop_loss?: number;
  take_profit?: number;
};

type SignalSnapshot = {
  candidate_setups?: Setup[];
  fused_signal?: Signal | null;
  recent_signals?: Array<Record<string, unknown>>;
};

type LoadState = 'loading' | 'connected' | 'offline';

const API_BASE = (process.env.NEXT_PUBLIC_TRADING_API_URL || 'http://localhost:8000').replace(/\/$/, '');

function strategyLabel(strategyId?: string | null) {
  if (!strategyId) return 'Strategy not reported';
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

function signalRationale(signal?: Record<string, unknown>) {
  if (!signal) return '';
  const reasons = signal.reasons;
  if (Array.isArray(reasons)) return reasons.map(String).filter(Boolean).join(' ');
  return typeof signal.reason === 'string' ? signal.reason : '';
}

function positionRationale(position: Position, snapshot: SignalSnapshot | null) {
  const matchingHistory = snapshot?.recent_signals?.find((item) => {
    const signalId = typeof item.signal_id === 'string' ? item.signal_id : '';
    return Boolean(position.signal_id && signalId === position.signal_id);
  });
  const historyRationale = signalRationale(matchingHistory);
  if (historyRationale) return historyRationale;

  const matchingSetup = snapshot?.candidate_setups?.find((setup) =>
    Boolean(position.strategy_id && setup.strategy_id === position.strategy_id)
  );
  if (matchingSetup?.reason) return matchingSetup.reason;

  const fused = snapshot?.fused_signal;
  if (fused && fused.strategy_id === position.strategy_id && fused.reasons?.length) {
    return fused.reasons.join(' ');
  }

  return 'The position is tagged to this strategy, but the API has not returned a position-linked entry rationale.';
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
  const [snapshot, setSnapshot] = useState<SignalSnapshot | null>(null);
  const [state, setState] = useState<LoadState>('loading');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const positionsResponse = await fetch(`${API_BASE}/api/positions`, { cache: 'no-store' });
        if (!positionsResponse.ok) throw new Error(`Positions API returned ${positionsResponse.status}`);
        const positionsPayload = await positionsResponse.json();
        const nextPositions = Array.isArray(positionsPayload.positions) ? positionsPayload.positions as Position[] : [];

        let nextSnapshot: SignalSnapshot | null = null;
        try {
          const signalResponse = await fetch(`${API_BASE}/api/signals/latest`, { cache: 'no-store' });
          if (signalResponse.ok) nextSnapshot = await signalResponse.json();
        } catch {
          // Open positions remain useful even when signal context is temporarily unavailable.
        }

        if (active) {
          setPositions(nextPositions);
          setSnapshot(nextSnapshot);
          setState('connected');
          setUpdatedAt(new Date());
        }
      } catch {
        if (active) setState('offline');
      }
    };

    void load();
    const interval = window.setInterval(load, 12000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  const latestSignal = useMemo(() => snapshot?.fused_signal || null, [snapshot]);

  return (
    <div className="terminal-stack">
      <section className="terminal-panel position-panel" aria-labelledby="positions-title">
        <div className="terminal-panel-heading">
          <div>
            <span className="terminal-overline">Execution monitor</span>
            <h2 id="positions-title">Open positions</h2>
            <p>Read-only view of positions reported by the trading engine.</p>
          </div>
          <span className={`terminal-live-status ${state}`}>
            <span className="terminal-status-dot" />
            {state === 'loading' ? 'Connecting' : state === 'connected' ? 'API connected' : 'API offline'}
          </span>
        </div>

        {state === 'loading' && <div className="terminal-empty-state">Loading positions…</div>}
        {state === 'offline' && (
          <div className="terminal-empty-state terminal-empty-warning">
            <strong>Position feed unavailable.</strong>
            <span>Confirm the trading API is running on port 8000, or set <code>NEXT_PUBLIC_TRADING_API_URL</code> to its base URL.</span>
          </div>
        )}
        {state === 'connected' && positions.length === 0 && (
          <div className="terminal-empty-state">
            <span className="terminal-empty-icon" aria-hidden="true">—</span>
            <strong>No open positions</strong>
            <span>The API currently reports no active trades. New positions will appear here when returned by the trading engine.</span>
          </div>
        )}

        {state === 'connected' && positions.length > 0 && (
          <div className="position-list">
            {positions.map((position) => {
              const isBuy = position.side.toUpperCase().includes('BUY');
              const rationale = positionRationale(position, snapshot);
              return (
                <article className="position-card" key={position.ticket}>
                  <div className="position-card-top">
                    <div className="position-instrument">
                      <span className={`position-side ${isBuy ? 'buy' : 'sell'}`}>{isBuy ? 'BUY' : 'SELL'}</span>
                      <div>
                        <strong>{position.symbol || 'XAUUSD'}</strong>
                        <span>Ticket #{position.ticket} · {Number(position.lots).toFixed(2)} lots</span>
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
                      <span>Why this position opened</span>
                      <span className="rationale-strategy">{strategyLabel(position.strategy_id)}</span>
                    </summary>
                    <p>{rationale}</p>
                    {position.open_time && <time dateTime={position.open_time}>Opened {new Date(position.open_time).toLocaleString()}</time>}
                  </details>
                </article>
              );
            })}
          </div>
        )}
        <div className="terminal-panel-footer">
          <span>Refreshes automatically every 12 seconds. No trade controls are exposed here.</span>
          <span>{updatedAt ? `Updated ${updatedAt.toLocaleTimeString()}` : 'Waiting for first update'}</span>
        </div>
      </section>

      <section className="terminal-panel signal-panel" aria-labelledby="signal-title">
        <div className="terminal-panel-heading compact">
          <div>
            <span className="terminal-overline">Market intelligence</span>
            <h2 id="signal-title">Latest model insight</h2>
          </div>
          {latestSignal && <span className={`signal-side ${latestSignal.side?.toUpperCase().includes('BUY') ? 'buy' : 'sell'}`}>{latestSignal.side || 'Signal'}</span>}
        </div>
        {!latestSignal ? (
          <p className="signal-empty">No fused signal is currently available from the API.</p>
        ) : (
          <>
            <div className="signal-summary-grid">
              <div><span>Strategy</span><strong>{strategyLabel(latestSignal.strategy_id)}</strong></div>
              <div><span>Confidence</span><strong>{typeof latestSignal.confidence === 'number' ? `${Math.round(latestSignal.confidence * 100)}%` : '—'}</strong></div>
              <div><span>Entry</span><strong>{price(latestSignal.entry ?? 0)}</strong></div>
              <div><span>Stop / target</span><strong>{price(latestSignal.stop_loss ?? 0)} / {price(latestSignal.take_profit ?? 0)}</strong></div>
            </div>
            {latestSignal.reasons?.length ? (
              <ul className="signal-reasons">
                {latestSignal.reasons.map((reason, index) => <li key={`${index}-${reason}`}>{reason}</li>)}
              </ul>
            ) : <p className="signal-empty">No rationale was returned with this signal.</p>}
            <p className="signal-disclaimer">Signals are model outputs, not guarantees or personalized financial advice.</p>
          </>
        )}
      </section>
    </div>
  );
}

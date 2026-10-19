'use client';

import React, { useState, useEffect } from 'react';

export interface ExecutedTradeItem {
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
  lessonReference?: string;
  exitReason: string;
}

export default function TradeHistoryPanel() {
  const [trades, setTrades] = useState<ExecutedTradeItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<'ALL' | 'WINS' | 'LOSSES'>('ALL');
  const [isOpen, setIsOpen] = useState<boolean>(true);

  const fetchTradeHistory = async () => {
    try {
      const res = await fetch('/api/trades/live', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data.recentTrades) ? data.recentTrades : [];
        setTrades(list);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTradeHistory();
    const interval = setInterval(fetchTradeHistory, 6000);
    return () => clearInterval(interval);
  }, []);

  const filteredTrades = trades.filter((t) => {
    if (filter === 'WINS') return t.pnl > 0;
    if (filter === 'LOSSES') return t.pnl < 0;
    return true;
  });

  const totalClosed = trades.length;
  const winCount = trades.filter((t) => t.pnl > 0).length;
  const winRate = totalClosed > 0 ? ((winCount / totalClosed) * 100).toFixed(1) : '0.0';
  const netPnl = trades.reduce((sum, t) => sum + (Number(t.pnl) || 0), 0);
  const netPips = trades.reduce((sum, t) => sum + (Number(t.pips) || 0), 0);
  const pnlColor = netPnl > 0 ? 'var(--accent-green)' : netPnl < 0 ? 'var(--accent-red)' : 'var(--text-primary)';

  return (
    <section
      aria-label="Trade History and Closed Executions"
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xs)',
        border: '1px solid var(--border-default)',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Panel Collapsible Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          background: 'var(--bg-surface-2)',
          borderBottom: isOpen ? '1px solid var(--border-default)' : 'none',
          cursor: 'pointer',
          userSelect: 'none',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {isOpen ? '▼' : '▶'}
          </span>
          <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            Trade History &amp; Closed Executions
          </h2>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(197, 160, 89, 0.1)',
              color: 'var(--accent-gold, #C5A059)',
              border: '1px solid rgba(197, 160, 89, 0.25)',
            }}
          >
            JustMarkets MT5 Deals
          </span>
        </div>

        {/* Real Deal Metrics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#64748B' }}>Executions: </span>
            <strong className="mono-nums" style={{ color: '#F8FAFC' }}>
              {totalClosed}
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Win Rate: </span>
            <strong className="mono-nums" style={{ color: Number(winRate) >= 50 ? '#10B981' : '#F8FAFC' }}>
              {winRate}%
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Realized P&amp;L: </span>
            <strong className="mono-nums" style={{ color: pnlColor }}>
              {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Banked Pips: </span>
            <strong className="mono-nums" style={{ color: netPips >= 0 ? '#10B981' : '#EF4444' }}>
              {netPips >= 0 ? '+' : ''}{netPips.toFixed(1)}p
            </strong>
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      {isOpen && (
        <div>
          {/* Controls Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 20px',
              background: '#090D16',
              borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', gap: '6px' }}>
              {(['ALL', 'WINS', 'LOSSES'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setFilter(mode)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    fontWeight: 700,
                    background: filter === mode ? 'var(--accent-gold, #C5A059)' : '#111827',
                    color: filter === mode ? '#090D16' : '#94A3B8',
                    border: '1px solid #1E293B',
                    cursor: 'pointer',
                  }}
                >
                  {mode === 'ALL' ? `All (${trades.length})` : mode === 'WINS' ? `Profitable (${winCount})` : `Drawdowns (${trades.length - winCount})`}
                </button>
              ))}
            </div>

            <div style={{ fontSize: '11px', color: '#64748B' }}>
              Direct verified closed deal history from JustMarkets MT5
            </div>
          </div>

          {loading && trades.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#94A3B8', fontSize: '12.5px' }}>
              Loading closed MT5 deals...
            </div>
          ) : filteredTrades.length === 0 ? (
            <div style={{ padding: '30px 20px', textAlign: 'center', color: '#64748B', fontSize: '12.5px' }}>
              No closed executions match the selected filter.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1E293B', color: '#64748B', fontSize: '10.5px', textTransform: 'uppercase' }}>
                    <th style={{ padding: '8px 16px' }}>Ticket / Symbol</th>
                    <th style={{ padding: '8px 12px' }}>Side</th>
                    <th style={{ padding: '8px 12px' }}>Volume</th>
                    <th style={{ padding: '8px 12px' }}>Entry</th>
                    <th style={{ padding: '8px 12px' }}>Exit</th>
                    <th style={{ padding: '8px 12px' }}>Close Time</th>
                    <th style={{ padding: '8px 12px' }}>Exit Reason</th>
                    <th style={{ padding: '8px 16px', textAlign: 'right' }}>Realized P&amp;L</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTrades.map((t) => {
                    const isProfit = t.pnl > 0;
                    return (
                      <tr
                        key={t.id}
                        style={{
                          borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                        }}
                      >
                        <td style={{ padding: '10px 16px' }}>
                          <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{t.symbol}</span>{' '}
                          <span style={{ color: '#64748B', fontFamily: 'monospace', fontSize: '11px' }}>
                            #{t.ticket}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              padding: '2px 6px',
                              borderRadius: '3px',
                              background: t.type === 'BUY' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                              color: t.type === 'BUY' ? '#10B981' : '#EF4444',
                            }}
                          >
                            {t.type}
                          </span>
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                          {Number(t.lots).toFixed(2)}L
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                          ${Number(t.entryPrice).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                          ${Number(t.exitPrice).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#64748B', fontSize: '11px' }}>
                          {new Date(t.closeTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td style={{ padding: '10px 12px', color: '#94A3B8', fontSize: '11px' }}>
                          {t.exitReason}
                        </td>
                        <td style={{ padding: '10px 16px', textAlign: 'right' }}>
                          <span
                            className="mono-nums"
                            style={{
                              fontWeight: 700,
                              color: isProfit ? '#10B981' : t.pnl < 0 ? '#EF4444' : '#F8FAFC',
                            }}
                          >
                            {t.pnl >= 0 ? '+' : ''}${Number(t.pnl).toFixed(2)}
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748B', marginLeft: '6px' }}>
                            ({t.pips >= 0 ? '+' : ''}{Number(t.pips).toFixed(1)}p)
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

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
  const [displayCount, setDisplayCount] = useState<number>(15);

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
    const interval = setInterval(fetchTradeHistory, 4000);
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
  const pnlColor = netPnl > 0 ? '#10B981' : netPnl < 0 ? '#F43F5E' : 'var(--text-primary)';

  return (
    <div
      style={{
        background: '#090D16',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-default, #1E293B)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'rgba(15, 23, 42, 0.7)',
          borderBottom: '1px solid var(--border-default, #1E293B)',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#F59E0B',
                boxShadow: '0 0 8px rgba(245, 158, 11, 0.7)',
                display: 'inline-block'
              }}
            />
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
              TRADE HISTORY &amp; CLOSED EXECUTIONS
            </h2>
          </div>
          <span
            className="status-badge"
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: 'rgba(245, 158, 11, 0.12)',
              color: 'var(--accent-gold, #F59E0B)',
              border: '1px solid rgba(245, 158, 11, 0.3)'
            }}
          >
            JUSTMARKETS MT5 DEALS
          </span>
        </div>

        {/* Aggregated Performance Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Executions: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{totalClosed}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Win Rate: </span>
            <strong className="mono-nums" style={{ color: Number(winRate) >= 60 ? '#10B981' : 'var(--text-primary)' }}>
              {winRate}%
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Banked Pips: </span>
            <strong className="mono-nums" style={{ color: netPips >= 0 ? '#10B981' : '#F43F5E' }}>
              {netPips >= 0 ? '+' : ''}{netPips.toFixed(1)}p
            </strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Realized P&amp;L: </span>
            <strong className="mono-nums" style={{ color: pnlColor, fontSize: '13px' }}>
              {netPnl >= 0 ? '+' : ''}${netPnl.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 20px',
          background: 'rgba(15, 23, 42, 0.4)',
          borderBottom: '1px solid var(--border-default, #1E293B)',
          fontSize: '12px'
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['ALL', 'WINS', 'LOSSES'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 600,
                borderRadius: '4px',
                border: filter === mode ? '1px solid var(--accent-gold, #F59E0B)' : '1px solid var(--border-subtle, #334155)',
                background: filter === mode ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: filter === mode ? 'var(--accent-gold, #F59E0B)' : 'var(--text-muted, #64748B)',
                cursor: 'pointer'
              }}
            >
              {mode === 'ALL' ? `All (${totalClosed})` : mode === 'WINS' ? `Profitable (${winCount})` : `Drawdowns (${totalClosed - winCount})`}
            </button>
          ))}
        </div>

        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Direct verified deal history from MT5 server
        </div>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Loading historical broker executions from JustMarkets MT5...
        </div>
      ) : filteredTrades.length === 0 ? (
        <div style={{ padding: '36px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            No Closed Trades Recorded
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
            {filter === 'ALL'
              ? 'No closed positions found in the current session. Active trades will appear here upon completion.'
              : `No trades matched the "${filter}" filter criteria.`}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid var(--border-default, #1E293B)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>TICKET / SYMBOL</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>SIDE</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>VOLUME</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>ENTRY PRICE</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>EXIT PRICE</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>CLOSE TIME</th>
                <th style={{ padding: '10px 16px', fontWeight: 600 }}>EXIT REASON</th>
                <th style={{ padding: '10px 16px', fontWeight: 600, textAlign: 'right' }}>NET P&amp;L</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.slice(0, displayCount).map((trade) => {
                const isBuy = (trade.type || '').toUpperCase() === 'BUY';
                const isProfit = Number(trade.pnl) >= 0;
                const rowPnlColor = isProfit ? '#10B981' : '#F43F5E';
                const formattedTime = trade.closeTime
                  ? new Date(trade.closeTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                  : '--:--:--';

                return (
                  <tr
                    key={trade.id || trade.ticket}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #1E293B)',
                      background: 'transparent'
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{trade.symbol || 'XAUUSD.m'}</div>
                      <div className="mono-nums" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{trade.ticket}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 7px',
                        borderRadius: '4px',
                        fontSize: '10.5px',
                        fontWeight: 700,
                        background: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: isBuy ? '#10B981' : '#F43F5E'
                      }}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="mono-nums" style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {Number(trade.lots).toFixed(2)}L
                    </td>
                    <td className="mono-nums" style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      ${Number(trade.entryPrice).toFixed(2)}
                    </td>
                    <td className="mono-nums" style={{ padding: '12px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      ${Number(trade.exitPrice).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontSize: '11px' }}>
                      {formattedTime}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        fontSize: '11px',
                        color: 'var(--text-secondary)',
                        fontFamily: 'monospace',
                        background: 'rgba(30, 41, 59, 0.5)',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {trade.exitReason}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <div className="mono-nums" style={{ fontWeight: 800, color: rowPnlColor, fontSize: '13px' }}>
                        {isProfit ? '+' : ''}${Number(trade.pnl).toFixed(2)}
                      </div>
                      <div className="mono-nums" style={{ fontSize: '10px', color: rowPnlColor }}>
                        {Number(trade.pips) >= 0 ? '+' : ''}{Number(trade.pips).toFixed(1)} pips
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer / Load More */}
      {filteredTrades.length > displayCount && (
        <div style={{ padding: '10px 18px', textAlign: 'center', background: 'rgba(15, 23, 42, 0.5)', borderTop: '1px solid var(--border-default, #1E293B)' }}>
          <button
            type="button"
            onClick={() => setDisplayCount((prev) => prev + 15)}
            style={{
              padding: '6px 14px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '4px',
              border: '1px solid var(--border-default, #334155)',
              background: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
          >
            Load More Trades ({filteredTrades.length - displayCount} remaining)
          </button>
        </div>
      )}
    </div>
  );
}

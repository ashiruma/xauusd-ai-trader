'use client';

import React, { useState } from 'react';
import { Position } from './TerminalChart';

interface ActiveTradesPanelProps {
  trades: Position[];
  selectedTicket: number | null;
  onSelectTicket: (ticket: number | null) => void;
  isConnected: boolean;
  onRefresh?: () => void;
}

export default function ActiveTradesPanel({
  trades = [],
  selectedTicket = null,
  onSelectTicket,
  isConnected,
  onRefresh,
}: ActiveTradesPanelProps) {
  const [closingTicket, setClosingTicket] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const handleClosePosition = async (ticket: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Confirm immediate market close of position #${ticket}?`)) {
      return;
    }

    setClosingTicket(ticket);
    setActionMessage(null);

    try {
      const res = await fetch(`/api/positions/close/${ticket}`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setActionMessage(`Trade #${ticket} closed successfully at market.`);
        if (onRefresh) onRefresh();
      } else {
        setActionMessage(`Close failed: ${data.error || data.detail || 'Broker rejected order'}`);
      }
    } catch (err: unknown) {
      setActionMessage(`Network error: ${(err as Error)?.message || 'Failed'}`);
    } finally {
      setClosingTicket(null);
      setTimeout(() => setActionMessage(null), 5000);
    }
  };

  const totalLots = trades.reduce((sum, t) => sum + (Number(t.lots) || 0), 0);
  const totalFloatingPnl = trades.reduce((sum, t) => sum + (Number(t.floating_pnl) || 0), 0);
  const pnlColor = totalFloatingPnl > 0 ? '#10B981' : totalFloatingPnl < 0 ? '#EF4444' : '#F8FAFC';

  return (
    <section
      aria-label="Active Positions Companion Table"
      style={{
        background: '#090D16',
        borderRadius: '12px',
        border: '1px solid #1E293B',
        overflow: 'hidden',
        width: '100%',
      }}
    >
      {/* Panel Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          background: '#0D1322',
          borderBottom: '1px solid #1E293B',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC', margin: 0, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
            Open Positions Companion
          </h2>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'monospace',
              padding: '2px 8px',
              borderRadius: '4px',
              background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isConnected ? '#10B981' : '#EF4444',
              border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.25)' : 'rgba(239, 68, 68, 0.25)'}`,
            }}
          >
            {isConnected ? `${trades.length} OPEN` : 'GATEWAY OFFLINE'}
          </span>
          <span style={{ fontSize: '11px', color: '#64748B' }}>
            Click row to highlight position lines on chart
          </span>
        </div>

        {/* Live Aggregates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px', fontSize: '12px' }}>
          <div>
            <span style={{ color: '#64748B' }}>Net Volume: </span>
            <strong className="mono-nums" style={{ color: '#F8FAFC' }}>
              {totalLots.toFixed(2)} Lots
            </strong>
          </div>
          <div>
            <span style={{ color: '#64748B' }}>Floating P&amp;L: </span>
            <strong className="mono-nums" style={{ color: pnlColor, fontSize: '13px' }}>
              {totalFloatingPnl >= 0 ? '+' : ''}${totalFloatingPnl.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {actionMessage && (
        <div
          style={{
            padding: '10px 20px',
            background: 'rgba(197, 160, 89, 0.12)',
            borderBottom: '1px solid rgba(197, 160, 89, 0.25)',
            fontSize: '12px',
            color: 'var(--accent-gold, #C5A059)',
          }}
        >
          {actionMessage}
        </div>
      )}

      {/* Disconnected State */}
      {!isConnected ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#EF4444' }}>
            MT5 Gateway Bridge Disconnected
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>
            Live position telemetry is currently unavailable. No dummy or third-party positions are shown.
          </div>
        </div>
      ) : trades.length === 0 ? (
        /* Empty State */
        <div style={{ padding: '36px 20px', textAlign: 'center', color: '#94A3B8' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC' }}>
            No Active Positions
          </div>
          <div style={{ fontSize: '12px', color: '#64748B', marginTop: '4px' }}>
            All trading capital remains 100% idle and protected in your JustMarkets MT5 account balance.
          </div>
        </div>
      ) : (
        /* Table of Real MT5 Positions */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1E293B', color: '#64748B', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 16px' }}>Ticket / Symbol</th>
                <th style={{ padding: '10px 12px' }}>Side</th>
                <th style={{ padding: '10px 12px' }}>Volume</th>
                <th style={{ padding: '10px 12px' }}>Entry Price</th>
                <th style={{ padding: '10px 12px' }}>Current Price</th>
                <th style={{ padding: '10px 12px' }}>Stop Loss</th>
                <th style={{ padding: '10px 12px' }}>Take Profit</th>
                <th style={{ padding: '10px 12px' }}>Floating P&amp;L</th>
                <th style={{ padding: '10px 16px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((pos) => {
                const isSelected = selectedTicket === pos.ticket;
                const isBuy = (pos.side || '').toUpperCase().includes('BUY');
                const pnl = Number(pos.floating_pnl || 0);
                const isProfit = pnl >= 0;
                const entryPrice = Number(pos.entry_price || 0);
                const curPrice = Number(pos.current_price || entryPrice);
                const diffPoints = isBuy ? curPrice - entryPrice : entryPrice - curPrice;
                const pips = (diffPoints * 10).toFixed(1);

                return (
                  <tr
                    key={pos.ticket}
                    onClick={() => onSelectTicket(isSelected ? null : pos.ticket)}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                      background: isSelected ? 'rgba(197, 160, 89, 0.08)' : 'transparent',
                      cursor: 'pointer',
                      borderLeft: isSelected ? '3px solid var(--accent-gold, #C5A059)' : '3px solid transparent',
                      transition: 'background 0.15s ease',
                    }}
                  >
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ color: '#F8FAFC' }}>{pos.symbol || 'XAUUSD.m'}</strong>
                        <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'monospace' }}>
                          #{pos.ticket}
                        </span>
                        {isSelected && (
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              color: 'var(--accent-gold, #C5A059)',
                              border: '1px solid rgba(197, 160, 89, 0.4)',
                              borderRadius: '3px',
                              padding: '1px 5px',
                            }}
                          >
                            CHART FOCUSED
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: isBuy ? '#10B981' : '#EF4444',
                        }}
                      >
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                      {Number(pos.lots).toFixed(2)}L
                    </td>
                    <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                      ${entryPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC', fontWeight: 600 }}>
                      ${curPrice.toFixed(2)}
                    </td>
                    <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#EF4444' }}>
                      {pos.stop_loss > 0 ? `$${Number(pos.stop_loss).toFixed(2)}` : 'None'}
                    </td>
                    <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#10B981' }}>
                      {pos.take_profit > 0 ? `$${Number(pos.take_profit).toFixed(2)}` : 'None'}
                    </td>
                    <td style={{ padding: '12px 12px' }}>
                      <div className="mono-nums" style={{ color: isProfit ? '#10B981' : '#EF4444', fontWeight: 700 }}>
                        {isProfit ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748B' }}>
                        {Number(pips) >= 0 ? '+' : ''}{pips} pips
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={(e) => handleClosePosition(pos.ticket, e)}
                        disabled={closingTicket === pos.ticket}
                        style={{
                          padding: '5px 12px',
                          borderRadius: '4px',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#EF4444',
                          border: '1px solid rgba(239, 68, 68, 0.3)',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: closingTicket === pos.ticket ? 'wait' : 'pointer',
                        }}
                      >
                        {closingTicket === pos.ticket ? 'Closing...' : 'Close Trade'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

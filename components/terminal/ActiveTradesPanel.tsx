'use client';

import React, { useState, useEffect } from 'react';

export interface ActiveTrade {
  ticket: number;
  symbol: string;
  side: string;
  lots: number;
  entry_price: number;
  current_price: number;
  stop_loss: number;
  take_profit: number;
  floating_pnl: number;
  open_time?: string;
  strategy_id?: string | null;
  entry_rationale?: string | null;
}

export default function ActiveTradesPanel() {
  const [trades, setTrades] = useState<ActiveTrade[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [closingTicket, setClosingTicket] = useState<number | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const fetchActiveTrades = async () => {
    try {
      const res = await fetch('/api/positions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.is_connected === false || data.status === 'MT5_DISCONNECTED') {
          setIsConnected(false);
          setTrades([]);
        } else {
          setIsConnected(true);
          const list = Array.isArray(data.positions) ? data.positions : [];
          setTrades(list);
        }
      } else {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setLoading(false);
      setLastSyncTime(new Date().toLocaleTimeString());
    }
  };

  useEffect(() => {
    fetchActiveTrades();
    const interval = setInterval(fetchActiveTrades, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleClosePosition = async (ticket: number) => {
    if (!confirm(`Are you sure you want to close position #${ticket} immediately at current market price?`)) {
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
        await fetchActiveTrades();
      } else {
        setActionMessage(`Error closing trade: ${data.error || 'Failed'}`);
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
  const pnlColor = totalFloatingPnl > 0 ? '#10B981' : totalFloatingPnl < 0 ? '#F43F5E' : 'var(--text-primary)';

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
                background: isConnected ? '#10B981' : '#F43F5E',
                boxShadow: isConnected ? '0 0 8px rgba(16, 185, 129, 0.7)' : '0 0 8px rgba(244, 63, 94, 0.7)',
                display: 'inline-block'
              }}
            />
            <h2 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: 0, letterSpacing: '-0.2px' }}>
              ACTIVE TRADES &amp; OPEN POSITIONS
            </h2>
          </div>
          <span
            className="status-badge"
            style={{
              fontSize: '10px',
              fontFamily: 'monospace',
              fontWeight: 700,
              background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
              color: isConnected ? '#10B981' : '#F43F5E',
              border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
            }}
          >
            {isConnected ? 'JUSTMARKETS MT5 SYNC' : 'MT5 GATEWAY DISCONNECTED'}
          </span>
        </div>

        {/* Live Aggregates */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Open Count: </span>
            <strong style={{ color: 'var(--text-primary)' }}>{trades.length}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Net Volume: </span>
            <strong className="mono-nums" style={{ color: 'var(--text-primary)' }}>{totalLots.toFixed(2)} Lots</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Floating P&amp;L: </span>
            <strong className="mono-nums" style={{ color: pnlColor, fontSize: '13px' }}>
              {totalFloatingPnl >= 0 ? '+' : ''}${totalFloatingPnl.toFixed(2)}
            </strong>
          </div>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div style={{
          padding: '10px 18px',
          background: 'rgba(245, 158, 11, 0.12)',
          borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
          fontSize: '12px',
          color: 'var(--accent-gold, #F59E0B)'
        }}>
          {actionMessage}
        </div>
      )}

      {/* Main Content Area */}
      {loading ? (
        <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
          Syncing open positions from JustMarkets MT5 account...
        </div>
      ) : !isConnected ? (
        <div style={{ padding: '36px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', fontWeight: 700, color: '#F43F5E', marginBottom: '6px' }}>
            Broker Gateway Disconnected
          </div>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '520px', margin: '0 auto', lineHeight: 1.5 }}>
            Cannot reach the active MT5 terminal session. Ensure your JustMarkets MT5 terminal is running and connected to stream live active positions.
          </p>
        </div>
      ) : trades.length === 0 ? (
        <div style={{ padding: '36px 24px', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.25)',
            color: 'var(--accent-gold, #F59E0B)',
            fontSize: '18px',
            marginBottom: '12px'
          }}>
            &mdash;
          </div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Zero Active Trades in Market
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '580px', margin: '0 auto 14px', lineHeight: 1.6 }}>
            The autonomous execution engine is active on <strong>XAUUSD.m</strong>. Pre-trade risk filters (1.5% max risk, 2.6-pip spread tolerance, and news lockout) are actively scanning for high-probability setups.
          </p>
          <div style={{ display: 'inline-flex', gap: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
            <span>Max Open Positions: 1</span>
            <span>&bull;</span>
            <span>Spread Limit: 35 pts</span>
            <span>&bull;</span>
            <span>Last Sync: {lastSyncTime || 'Just now'}</span>
          </div>
        </div>
      ) : (
        /* Active Trades Table */
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ background: 'rgba(15, 23, 42, 0.5)', borderBottom: '1px solid var(--border-default, #1E293B)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TICKET / SYMBOL</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>SIDE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>VOLUME</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ENTRY PRICE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>CURRENT PRICE</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STOP LOSS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TAKE PROFIT</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>FLOATING P&amp;L</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => {
                const isBuy = (trade.side || '').toUpperCase().includes('BUY');
                const pnl = Number(trade.floating_pnl) || 0;
                const pnlRowColor = pnl >= 0 ? '#10B981' : '#F43F5E';
                const pipGain = trade.current_price && trade.entry_price
                  ? (isBuy ? (trade.current_price - trade.entry_price) : (trade.entry_price - trade.current_price)) * 10
                  : 0;

                return (
                  <tr
                    key={trade.ticket}
                    style={{
                      borderBottom: '1px solid var(--border-subtle, #1E293B)',
                      background: 'transparent',
                      transition: 'background 0.15s ease'
                    }}
                  >
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{trade.symbol || 'XAUUSD.m'}</div>
                      <div className="mono-nums" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>#{trade.ticket}</div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        display: 'inline-block',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: isBuy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: isBuy ? '#10B981' : '#F43F5E'
                      }}>
                        {isBuy ? 'BUY' : 'SELL'}
                      </span>
                    </td>
                    <td className="mono-nums" style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {Number(trade.lots).toFixed(2)}L
                    </td>
                    <td className="mono-nums" style={{ padding: '14px 16px', color: 'var(--text-secondary)' }}>
                      ${Number(trade.entry_price).toFixed(2)}
                    </td>
                    <td className="mono-nums" style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      ${Number(trade.current_price).toFixed(2)}
                    </td>
                    <td className="mono-nums" style={{ padding: '14px 16px', color: '#F43F5E' }}>
                      {Number(trade.stop_loss) > 0 ? `$${Number(trade.stop_loss).toFixed(2)}` : 'None'}
                    </td>
                    <td className="mono-nums" style={{ padding: '14px 16px', color: '#10B981' }}>
                      {Number(trade.take_profit) > 0 ? `$${Number(trade.take_profit).toFixed(2)}` : 'None'}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="mono-nums" style={{ fontWeight: 800, color: pnlRowColor, fontSize: '14px' }}>
                        {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}
                      </div>
                      <div className="mono-nums" style={{ fontSize: '10.5px', color: pnlRowColor }}>
                        {pipGain >= 0 ? '+' : ''}{pipGain.toFixed(1)} pips
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => handleClosePosition(trade.ticket)}
                        disabled={closingTicket === trade.ticket}
                        style={{
                          padding: '6px 12px',
                          fontSize: '11px',
                          fontWeight: 700,
                          borderRadius: '4px',
                          border: '1px solid rgba(244, 63, 94, 0.4)',
                          background: 'rgba(244, 63, 94, 0.15)',
                          color: '#F43F5E',
                          cursor: closingTicket === trade.ticket ? 'wait' : 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {closingTicket === trade.ticket ? 'Closing...' : 'Close Trade'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Footer Status Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 18px',
          background: 'rgba(15, 23, 42, 0.5)',
          borderTop: '1px solid var(--border-default, #1E293B)',
          fontSize: '11px',
          color: 'var(--text-muted)'
        }}
      >
        <span>Non-custodial MT5 order execution. Positions monitored with dynamic trailing stop and break-even locks.</span>
        <span>Auto-sync: 2.5s</span>
      </div>
    </div>
  );
}

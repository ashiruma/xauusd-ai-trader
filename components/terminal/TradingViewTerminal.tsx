'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

interface PositionItem {
  ticket: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  lots: number;
  openPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  profit: number;
  pips: number;
  openTime?: string;
}

interface ClosedTradeItem {
  id: string;
  ticket: number;
  symbol: string;
  side: 'BUY' | 'SELL';
  lots: number;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  pips: number;
  closeTime: string;
  exitReason: string;
}

export default function TradingViewTerminal({ accountId = '1200533810' }: { accountId?: string }) {
  const [activeTab, setActiveTab] = useState<'positions' | 'history'>('positions');
  const [activeSymbol, setActiveSymbol] = useState<string>('OANDA:XAUUSD');
  const [lotSize, setLotSize] = useState<number>(0.01);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [closingTickets, setClosingTickets] = useState<Set<number>>(new Set());
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Live Telemetry
  const [isBridgeConnected, setIsBridgeConnected] = useState<boolean>(false);
  const [balance, setBalance] = useState<number>(0);
  const [equity, setEquity] = useState<number>(0);
  const [floatingPnl, setFloatingPnl] = useState<number>(0);
  const [realizedPnl, setRealizedPnl] = useState<number>(0);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [closedTrades, setClosedTrades] = useState<ClosedTradeItem[]>([]);
  const [lastSyncTime, setLastSyncTime] = useState<string>('');

  const chartContainerRef = useRef<HTMLDivElement>(null);

  // Synchronize Live Broker State
  const syncLiveState = useCallback(async () => {
    try {
      const res = await fetch('/api/trades/live', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const connected = Boolean(data.isLiveBrokerConnection && data.status === 'ONLINE');
        setIsBridgeConnected(connected);

        if (data.account) {
          setBalance(Number(data.account.balance || 0));
          setEquity(Number(data.account.equity || data.account.balance || 0));
          setFloatingPnl(Number(data.account.openPnl || 0));
          setRealizedPnl(Number(data.account.totalProfit || 0));
        }

        if (Array.isArray(data.positions)) {
          const mapped: PositionItem[] = data.positions.map((p: any) => ({
            ticket: p.ticket,
            symbol: p.symbol || 'XAUUSD.m',
            side: p.type === 'BUY' ? 'BUY' : 'SELL',
            lots: Number(p.lots || 0.01),
            openPrice: Number(p.entryPrice || 0),
            currentPrice: Number(p.currentPrice || 0),
            stopLoss: Number(p.stopLoss || 0),
            takeProfit: Number(p.takeProfit || 0),
            profit: Number(p.pnl || 0),
            pips: Number(p.pips || 0),
            openTime: p.openTime || '',
          }));
          setPositions(mapped);
        }

        if (Array.isArray(data.recentTrades)) {
          const mappedTrades: ClosedTradeItem[] = data.recentTrades.map((t: any) => ({
            id: t.id || `TRD-${t.ticket}`,
            ticket: t.ticket || 0,
            symbol: t.symbol || 'XAUUSD.m',
            side: (t.type || 'BUY').toUpperCase() === 'BUY' ? 'BUY' : 'SELL',
            lots: Number(t.lots || 0.01),
            entryPrice: Number(t.entryPrice || 0),
            exitPrice: Number(t.exitPrice || 0),
            pnl: Number(t.pnl || 0),
            pips: Number(t.pips || 0),
            closeTime: t.closeTime || t.openTime || '',
            exitReason: t.exitReason || 'TAKE_PROFIT',
          }));
          setClosedTrades(mappedTrades);
        }

        setLastSyncTime(new Date().toTimeString().slice(0, 8));
      }
    } catch {
      // Bridge disconnected
    }
  }, []);

  useEffect(() => {
    syncLiveState();
    const interval = setInterval(syncLiveState, 2500);
    return () => clearInterval(interval);
  }, [syncLiveState]);

  // Embed TradingView Advanced Real-Time Chart
  useEffect(() => {
    const container = chartContainerRef.current;
    if (!container) return;

    container.innerHTML = '';

    const widgetWrapper = document.createElement('div');
    widgetWrapper.className = 'tradingview-widget-container__widget';
    widgetWrapper.style.height = '680px';
    widgetWrapper.style.width = '100%';
    container.appendChild(widgetWrapper);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: activeSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      backgroundColor: '#070B14',
      gridColor: 'rgba(30, 41, 59, 0.45)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      studies: [
        'STD;EMA',
        'STD;RSI'
      ],
      toolbar_bg: '#0B0F19',
      withdateranges: true,
      hide_side_toolbar: false,
      details: true,
      hotlist: false
    });

    container.appendChild(script);

    return () => {
      if (container) container.innerHTML = '';
    };
  }, [activeSymbol]);

  // Handle Immediate Position Close
  const handleClosePosition = async (ticket: number) => {
    setClosingTickets((prev) => new Set(prev).add(ticket));
    setActionNotice(null);

    // Optimistically remove from open positions immediately so no pending lag
    const closingPos = positions.find((p) => p.ticket === ticket);
    setPositions((prev) => prev.filter((p) => p.ticket !== ticket));

    try {
      const res = await fetch(`/api/positions/close/${ticket}`, { method: 'POST' });
      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setActionNotice(`Position #${ticket} closed successfully at market.`);
        // If data returns closed trade record, add to closed trades immediately
        if (data.trade) {
          const newClosed: ClosedTradeItem = {
            id: `TRD-${ticket}`,
            ticket,
            symbol: data.trade.symbol || 'XAUUSD.m',
            side: data.trade.side === 'BUY' ? 'BUY' : 'SELL',
            lots: data.trade.lots || (closingPos?.lots ?? 0.01),
            entryPrice: data.trade.entry_price || (closingPos?.openPrice ?? 0),
            exitPrice: data.trade.exit_price || (closingPos?.currentPrice ?? 0),
            pnl: data.trade.pnl || (closingPos?.profit ?? 0),
            pips: data.trade.pips || (closingPos?.pips ?? 0),
            closeTime: new Date().toISOString(),
            exitReason: 'MANUAL_UI',
          };
          setClosedTrades((prev) => [newClosed, ...prev]);
        }
      } else {
        // Revert optimistic removal if server rejected
        if (closingPos) {
          setPositions((prev) => [...prev, closingPos]);
        }
        setActionNotice(`Close failed: ${data.error || 'Broker rejected order'}`);
      }
    } catch {
      if (closingPos) {
        setPositions((prev) => [...prev, closingPos]);
      }
      setActionNotice('Network error closing position.');
    } finally {
      setClosingTickets((prev) => {
        const next = new Set(prev);
        next.delete(ticket);
        return next;
      });
      syncLiveState();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', color: '#F8FAFC' }}>

      {/* 1. TOP BROKER TELEMETRY STRIP (JUSTMARKETS ECN) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#0B0F19',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '12px 18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8', textTransform: 'uppercase' }}>
              Broker Gateway
            </span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#F8FAFC' }}>
              JustMarkets Ltd (Raw ECN)
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: '#1E293B' }} />

          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8', textTransform: 'uppercase' }}>
              Account Number
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F5C451', fontFamily: 'var(--font-mono, monospace)' }}>
              #{accountId}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: '#1E293B' }} />

          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8', textTransform: 'uppercase' }}>
              Balance / Equity
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', fontFamily: 'var(--font-mono, monospace)' }}>
              ${balance.toFixed(2)} <span style={{ color: '#64748B' }}>/</span> ${equity.toFixed(2)}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: '#1E293B' }} />

          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8', textTransform: 'uppercase' }}>
              Floating P&L
            </span>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: floatingPnl >= 0 ? '#10B981' : '#EF4444',
                fontFamily: 'var(--font-mono, monospace)',
              }}
            >
              {floatingPnl >= 0 ? '+' : ''}${floatingPnl.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              padding: '3px 10px',
              borderRadius: '4px',
              backgroundColor: isBridgeConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: isBridgeConnected ? '#10B981' : '#EF4444',
              border: `1px solid ${isBridgeConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {isBridgeConnected ? 'MT5 GATEWAY ONLINE' : 'MT5 DISCONNECTED'}
          </span>

          {lastSyncTime && (
            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono, monospace)' }}>
              {lastSyncTime} UTC
            </span>
          )}
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            backgroundColor: '#0F172A',
            border: '1px solid #F5C451',
            borderRadius: '6px',
            padding: '10px 16px',
            fontSize: '12.5px',
            color: '#F5C451',
          }}
        >
          {actionNotice}
        </div>
      )}

      {/* 2. EXPANSIVE FULL-SIZE TRADINGVIEW ADVANCED CHART (680px TALL) */}
      <div
        style={{
          background: '#070B14',
          borderRadius: '10px',
          border: '1px solid #1E293B',
          overflow: 'hidden',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Symbol Switcher & Tools Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            backgroundColor: '#0B0F19',
            borderBottom: '1px solid #1E293B',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: '#F5C451', letterSpacing: '0.5px' }}>
              TRADINGVIEW ADVANCED CHART
            </span>
            <span style={{ fontSize: '12px', color: '#94A3B8' }}>Spot Gold ({activeSymbol})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {[
              { label: 'OANDA XAUUSD', val: 'OANDA:XAUUSD' },
              { label: 'FX GOLD', val: 'FX:XAUUSD' },
              { label: 'CAPITALCOM', val: 'CAPITALCOM:GOLD' },
            ].map((s) => (
              <button
                key={s.val}
                type="button"
                onClick={() => setActiveSymbol(s.val)}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  borderRadius: '4px',
                  border: activeSymbol === s.val ? '1px solid #F5C451' : '1px solid #334155',
                  backgroundColor: activeSymbol === s.val ? 'rgba(245, 196, 81, 0.15)' : 'transparent',
                  color: activeSymbol === s.val ? '#F5C451' : '#94A3B8',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Embedded TradingView Advanced Container */}
        <div ref={chartContainerRef} style={{ height: '680px', width: '100%', background: '#070B14' }} />
      </div>

      {/* 3. STRUCTURED TRADE BLOTTER (POSITIONS & CLOSED DEALS HISTORY) */}
      <div
        style={{
          background: '#0B0F19',
          borderRadius: '10px',
          border: '1px solid #1E293B',
          overflow: 'hidden',
        }}
      >
        {/* Tab Headers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#090D16',
            borderBottom: '1px solid #1E293B',
            padding: '0 12px',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('positions')}
            style={{
              padding: '12px 18px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'positions' ? 700 : 500,
              color: activeTab === 'positions' ? '#F5C451' : '#94A3B8',
              borderBottom: activeTab === 'positions' ? '2px solid #F5C451' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Active Positions</span>
            <span
              style={{
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: positions.length > 0 ? '#10B981' : '#334155',
                color: '#FFFFFF',
              }}
            >
              {positions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            style={{
              padding: '12px 18px',
              fontSize: '12.5px',
              fontWeight: activeTab === 'history' ? 700 : 500,
              color: activeTab === 'history' ? '#F5C451' : '#94A3B8',
              borderBottom: activeTab === 'history' ? '2px solid #F5C451' : '2px solid transparent',
              background: 'transparent',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>Closed Trades History</span>
            <span
              style={{
                fontSize: '10.5px',
                padding: '1px 6px',
                borderRadius: '10px',
                backgroundColor: '#334155',
                color: '#FFFFFF',
              }}
            >
              {closedTrades.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Active Positions Table */}
        {activeTab === 'positions' && (
          <div>
            {positions.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                {isBridgeConnected
                  ? 'No active positions on JustMarkets MT5.'
                  : 'Positions unavailable: MT5 bridge is disconnected.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1E293B', color: '#64748B' }}>
                      <th style={{ padding: '10px 14px' }}>Ticket</th>
                      <th style={{ padding: '10px 14px' }}>Side</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Lots</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Open Price</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Current Price</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>SL</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>TP</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>P&L ($)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {positions.map((p) => {
                      const isClosing = closingTickets.has(p.ticket);
                      return (
                        <tr key={p.ticket} style={{ borderBottom: '1px solid #141D2E' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#CBD5E1' }}>
                            #{p.ticket}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: p.side === 'BUY' ? '#10B981' : '#EF4444',
                              }}
                            >
                              {p.side}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                            {p.lots.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                            {p.openPrice.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                            {p.currentPrice.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                            {p.stopLoss && p.stopLoss > 0 ? p.stopLoss.toFixed(2) : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
                            {p.takeProfit && p.takeProfit > 0 ? p.takeProfit.toFixed(2) : '—'}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontWeight: 700,
                              color: p.profit >= 0 ? '#10B981' : '#EF4444',
                            }}
                          >
                            {p.profit >= 0 ? '+' : ''}${p.profit.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                            <button
                              type="button"
                              onClick={() => handleClosePosition(p.ticket)}
                              disabled={isClosing}
                              style={{
                                padding: '4px 10px',
                                fontSize: '11px',
                                fontWeight: 600,
                                backgroundColor: isClosing ? '#334155' : 'rgba(239, 68, 68, 0.15)',
                                color: isClosing ? '#94A3B8' : '#EF4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                borderRadius: '4px',
                                cursor: isClosing ? 'not-allowed' : 'pointer',
                              }}
                            >
                              {isClosing ? 'Closing...' : 'Close Market'}
                            </button>
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

        {/* Tab 2: Closed History Table */}
        {activeTab === 'history' && (
          <div>
            {closedTrades.length === 0 ? (
              <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
                No closed trades recorded yet for this session.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #1E293B', color: '#64748B' }}>
                      <th style={{ padding: '10px 14px' }}>Ticket</th>
                      <th style={{ padding: '10px 14px' }}>Time</th>
                      <th style={{ padding: '10px 14px' }}>Side</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Lots</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Entry</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Exit</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Net P&L ($)</th>
                      <th style={{ padding: '10px 14px', textAlign: 'right' }}>Pips</th>
                      <th style={{ padding: '10px 14px' }}>Exit Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {closedTrades.map((t) => (
                      <tr key={t.id} style={{ borderBottom: '1px solid #141D2E' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', color: '#CBD5E1' }}>
                          #{t.ticket}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#94A3B8', fontFamily: 'var(--font-mono, monospace)' }}>
                          {(t.closeTime || '').slice(11, 19) || '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: t.side === 'BUY' ? '#10B981' : '#EF4444',
                            }}
                          >
                            {t.side}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                          {t.lots.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)' }}>
                          {t.entryPrice.toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: '#F8FAFC' }}>
                          {t.exitPrice.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 700,
                            color: t.pnl >= 0 ? '#10B981' : '#EF4444',
                          }}
                        >
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: t.pips >= 0 ? '#10B981' : '#EF4444',
                          }}
                        >
                          {t.pips >= 0 ? '+' : ''}{t.pips.toFixed(1)}
                        </td>
                        <td style={{ padding: '10px 14px', color: '#94A3B8', fontSize: '11px' }}>
                          {t.exitReason}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}

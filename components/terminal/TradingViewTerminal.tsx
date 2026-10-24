'use client';

import React, { useState, useEffect, useCallback } from 'react';

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
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Track global theme for chart and blotter styling
  useEffect(() => {
    const updateTheme = () => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(isDark ? 'dark' : 'light');
    };
    updateTheme();
    const observer = new MutationObserver(updateTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%', color: 'var(--text-primary)' }}>

      {/* 1. TOP BROKER TELEMETRY STRIP (JUSTMARKETS ECN) */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '12px 18px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Broker Gateway
            </span>
            <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
              JustMarkets Ltd (Raw ECN)
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Account Number
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono, monospace)' }}>
              #{accountId}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Balance / Equity
            </span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)' }}>
              ${balance.toFixed(2)} <span style={{ color: 'var(--text-muted)' }}>/</span> ${equity.toFixed(2)}
            </div>
          </div>

          <div style={{ height: '24px', width: '1px', backgroundColor: 'var(--border-subtle)' }} />

          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Floating P&L
            </span>
            <div
              style={{
                fontSize: '14px',
                fontWeight: 800,
                color: floatingPnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
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
              backgroundColor: isBridgeConnected ? 'var(--accent-green-subtle)' : 'var(--accent-red-subtle)',
              color: isBridgeConnected ? 'var(--accent-green)' : 'var(--accent-red)',
              border: `1px solid ${isBridgeConnected ? 'var(--accent-green-border)' : 'var(--accent-red-border)'}`,
            }}
          >
            {isBridgeConnected ? 'MT5 GATEWAY ONLINE' : 'MT5 DISCONNECTED'}
          </span>

          {lastSyncTime && (
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
              {lastSyncTime} UTC
            </span>
          )}
        </div>
      </div>

      {actionNotice && (
        <div
          style={{
            backgroundColor: 'var(--bg-surface-2)',
            border: '1px solid var(--border-accent)',
            borderRadius: '6px',
            padding: '10px 16px',
            fontSize: '12.5px',
            color: 'var(--text-gold)',
          }}
        >
          {actionNotice}
        </div>
      )}

      {/* 2. EXPANSIVE FULL-SIZE TRADINGVIEW ADVANCED CHART (680px TALL) */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '10px',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Symbol Switcher & Tools Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 16px',
            backgroundColor: 'var(--bg-surface-1)',
            borderBottom: '1px solid var(--border-default)',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)', letterSpacing: '0.5px' }}>
              TRADINGVIEW ADVANCED CHART
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Spot Gold ({activeSymbol})</span>
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--accent-green)',
                background: 'var(--accent-green-subtle)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--accent-green-border)',
              }}
            >
              Left Toolbar: Harmonic Patterns (ABCD, XABCD) &amp; Fibs Active
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { label: 'OANDA XAUUSD', val: 'OANDA:XAUUSD' },
              { label: 'FX GOLD', val: 'FX:XAUUSD' },
              { label: 'CAPITALCOM', val: 'CAPITALCOM:GOLD' },
              { label: 'TVC GOLD', val: 'TVC:GOLD' },
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
                  border: activeSymbol === s.val ? '1px solid var(--accent-gold)' : '1px solid var(--border-default)',
                  backgroundColor: activeSymbol === s.val ? 'var(--accent-gold-subtle)' : 'transparent',
                  color: activeSymbol === s.val ? 'var(--accent-gold)' : 'var(--text-muted)',
                  cursor: 'pointer',
                }}
              >
                {s.label}
              </button>
            ))}

            <a
              href={`https://www.tradingview.com/chart/?symbol=${encodeURIComponent(activeSymbol)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '4px 10px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '4px',
                border: '1px solid var(--border-accent)',
                backgroundColor: 'var(--accent-gold-subtle)',
                color: 'var(--accent-gold)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
              title="Open full interactive TradingView charting workbench in an external tab"
            >
              <span>Full Screen Workbench</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </div>
        </div>

        {/* Embedded TradingView Advanced Container */}
        <div
          style={{
            height: '740px',
            width: '100%',
            background: 'var(--bg-base)',
            position: 'relative',
          }}
        >
          <iframe
            key={`${activeSymbol}-${theme}`}
            src={`https://www.tradingview.com/widgetembed/?symbol=${encodeURIComponent(activeSymbol)}&interval=15&theme=${theme}&style=1&locale=en&hide_side_toolbar=0&allow_symbol_change=1&saveimage=1&details=1&calendar=0&hotlist=0`}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
              display: 'block',
            }}
            title={`TradingView Advanced Chart - ${activeSymbol}`}
            allow="fullscreen"
          />
        </div>
      </div>

      {/* 3. STRUCTURED TRADE BLOTTER (POSITIONS & CLOSED DEALS HISTORY) */}
      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: '10px',
          border: '1px solid var(--border-default)',
          overflow: 'hidden',
        }}
      >
        {/* Tab Headers */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'var(--bg-surface-1)',
            borderBottom: '1px solid var(--border-default)',
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
              color: activeTab === 'positions' ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderBottom: activeTab === 'positions' ? '2px solid var(--accent-gold)' : '2px solid transparent',
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
                backgroundColor: positions.length > 0 ? 'var(--accent-green)' : 'var(--border-default)',
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
              color: activeTab === 'history' ? 'var(--accent-gold)' : 'var(--text-muted)',
              borderBottom: activeTab === 'history' ? '2px solid var(--accent-gold)' : '2px solid transparent',
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
                backgroundColor: 'var(--border-default)',
                color: 'var(--text-muted)',
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
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                {isBridgeConnected
                  ? 'No active positions on JustMarkets MT5.'
                  : 'Positions unavailable: MT5 bridge is disconnected.'}
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
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
                        <tr key={p.ticket} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                          <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-secondary)' }}>
                            #{p.ticket}
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span
                              style={{
                                fontSize: '10.5px',
                                fontWeight: 700,
                                color: p.side === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)',
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
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-primary)' }}>
                            {p.currentPrice.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                            {p.stopLoss && p.stopLoss > 0 ? p.stopLoss.toFixed(2) : '—'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                            {p.takeProfit && p.takeProfit > 0 ? p.takeProfit.toFixed(2) : '—'}
                          </td>
                          <td
                            style={{
                              padding: '10px 14px',
                              textAlign: 'right',
                              fontFamily: 'var(--font-mono, monospace)',
                              fontWeight: 700,
                              color: p.profit >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
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
                                backgroundColor: isClosing ? 'var(--bg-surface-2)' : 'var(--accent-red-subtle)',
                                color: isClosing ? 'var(--text-muted)' : 'var(--accent-red)',
                                border: '1px solid var(--accent-red-border)',
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
              <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                No closed trades recorded yet for this session.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
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
                      <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                        <td style={{ padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-secondary)' }}>
                          #{t.ticket}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                          {(t.closeTime || '').slice(11, 19) || '—'}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span
                            style={{
                              fontSize: '10.5px',
                              fontWeight: 700,
                              color: t.side === 'BUY' ? 'var(--accent-green)' : 'var(--accent-red)',
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
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-primary)' }}>
                          {t.exitPrice.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono, monospace)',
                            fontWeight: 700,
                            color: t.pnl >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                          }}
                        >
                          {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                        </td>
                        <td
                          style={{
                            padding: '10px 14px',
                            textAlign: 'right',
                            fontFamily: 'var(--font-mono, monospace)',
                            color: t.pips >= 0 ? 'var(--accent-green)' : 'var(--accent-red)',
                          }}
                        >
                          {t.pips >= 0 ? '+' : ''}{t.pips.toFixed(1)}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontSize: '11px' }}>
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

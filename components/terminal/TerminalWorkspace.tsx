'use client';

import React, { useState, useEffect, useCallback } from 'react';
import TerminalChart, { Position } from './TerminalChart';
import ActiveTradesPanel from './ActiveTradesPanel';
import TradeHistoryPanel from './TradeHistoryPanel';
import LiveTradingEngine from './LiveTradingEngine';

export default function TerminalWorkspace() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [showContext, setShowContext] = useState<boolean>(false);

  // Synchronized broker positions fetch
  const fetchPositions = useCallback(async () => {
    try {
      const res = await fetch('/api/positions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.is_connected === false || data.status === 'MT5_DISCONNECTED') {
          setIsConnected(false);
          setPositions([]);
          setSelectedTicket(null);
        } else {
          setIsConnected(true);
          const list = Array.isArray(data.positions) ? data.positions : [];
          setPositions(list);
          // If previously selected ticket is no longer open, deselect
          if (selectedTicket !== null && !list.some((p: Position) => p.ticket === selectedTicket)) {
            setSelectedTicket(list.length > 0 ? list[0].ticket : null);
          } else if (selectedTicket === null && list.length > 0) {
            setSelectedTicket(list[0].ticket);
          }
        }
      } else {
        setIsConnected(false);
      }
    } catch {
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  }, [selectedTicket]);

  // Periodic polling for positions
  useEffect(() => {
    fetchPositions();
    const interval = setInterval(fetchPositions, 3000);
    return () => clearInterval(interval);
  }, [fetchPositions]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* 1. Primary Workspace: Large Live Broker Chart */}
      <TerminalChart
        symbol="XAUUSD.m"
        height={580}
        activePositions={positions}
        selectedTicket={selectedTicket}
        onSelectPosition={setSelectedTicket}
        isConnected={isConnected}
        onRetryConnection={fetchPositions}
      />

      {/* 2. Compact Companion Table: Open Positions */}
      <ActiveTradesPanel
        trades={positions}
        selectedTicket={selectedTicket}
        onSelectTicket={setSelectedTicket}
        isConnected={isConnected}
        onRefresh={fetchPositions}
      />

      {/* 3. Collapsible Trade History & Realized Executions */}
      <TradeHistoryPanel />

      {/* 4. Collapsible Supporting Market Context & Execution Risk Governor */}
      <section
        aria-label="Execution Risk Governor and Non-Custodial Architecture"
        style={{
          background: '#090D16',
          borderRadius: '12px',
          border: '1px solid #1E293B',
          overflow: 'hidden',
          width: '100%',
        }}
      >
        <div
          onClick={() => setShowContext(!showContext)}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            background: 'var(--bg-surface-2)',
            borderBottom: showContext ? '1px solid var(--border-default)' : 'none',
            cursor: 'pointer',
            userSelect: 'none',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {showContext ? '▼' : '▶'}
            </span>
            <h2 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', margin: 0, letterSpacing: '0.3px', textTransform: 'uppercase' }}>
              Execution Risk Governor &amp; Model Safety
            </h2>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '2px',
                background: 'var(--accent-green-subtle)',
                color: 'var(--accent-green)',
                border: '1px solid var(--accent-green-border)',
              }}
            >
              Non-Custodial Architecture
            </span>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Click to {showContext ? 'collapse' : 'expand'} risk parameters and safety protocols
          </div>
        </div>

        {showContext && (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Account Safety Guarantee Card */}
            <div
              style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-xs)',
                padding: '16px 20px',
              }}
            >
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Non-Custodial Architecture Guarantee
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 8px' }}>
                Capital Remains 100% in JustMarkets Ltd Account
              </h3>
              <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.6, margin: 0 }}>
                Velarion operates purely as an algorithmic strategy engine. No client funds are ever held, received, or transferred by Velarion. All deposits, withdrawals, and margin balances are maintained directly with JustMarkets Ltd under your authenticated MT5 credentials. Orders route exclusively through authenticated MT5 bridge protocols.
              </p>
            </div>

            {/* Live Trading Engine & Risk Controls */}
            <LiveTradingEngine />
          </div>
        )}
      </section>
    </div>
  );
}

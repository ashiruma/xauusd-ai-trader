'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LiveSpotFeedProps {
  className?: string;
  style?: React.CSSProperties;
  initialQuote?: QuoteResponse | null;
}

export interface QuoteResponse {
  symbol: string;
  price: number | null;
  bid: number | null;
  ask: number | null;
  spread: string;
  spreadPips: number;
  delta: string;
  timestamp: number;
  lastUpdated?: number | string | null;
  source: string;
  status?: string;
  isConnected?: boolean;
  message?: string;
}

export default function LiveSpotFeed({ className = '', style, initialQuote }: LiveSpotFeedProps) {
  const [quote, setQuote] = useState<QuoteResponse | null>(initialQuote || null);
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);
  const lastPriceRef = useRef<number | null>(initialQuote?.price ?? null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/market/quote', {
          cache: 'no-store',
          signal: controller.signal
        });

        if (res.ok && isMounted) {
          const data: QuoteResponse = await res.json();
          if (data) {
            if (typeof data.price === 'number' && lastPriceRef.current !== null && data.price !== lastPriceRef.current) {
              setFlashType(data.price >= lastPriceRef.current ? 'up' : 'down');
              setTimeout(() => {
                if (isMounted) setFlashType(null);
              }, 300);
            }
            if (typeof data.price === 'number') {
              lastPriceRef.current = data.price;
            }
            setQuote(data);
          }
        } else if (res.status === 401 && isMounted) {
          setQuote(prev => ({
            symbol: prev?.symbol || 'XAUUSD.m',
            price: null,
            bid: null,
            ask: null,
            spread: 'Unavailable',
            spreadPips: 0,
            delta: '—',
            timestamp: Date.now(),
            source: 'JUSTMARKETS_MT5_DIRECT',
            status: 'DISCONNECTED',
            isConnected: false,
            message: 'Session unauthorized'
          }));
        }
      } catch (err: unknown) {
        if (isMounted && (err as { name?: string })?.name !== 'AbortError') {
          setQuote(prev => ({
            symbol: prev?.symbol || 'XAUUSD.m',
            price: null,
            bid: null,
            ask: null,
            spread: 'Unavailable',
            spreadPips: 0,
            delta: '—',
            timestamp: Date.now(),
            lastUpdated: prev?.lastUpdated || null,
            source: 'JUSTMARKETS_MT5_DIRECT',
            status: 'DISCONNECTED',
            isConnected: false,
            message: 'MT5 disconnected'
          }));
        }
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 1500);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const isConnected = Boolean(quote?.isConnected && typeof quote?.price === 'number' && quote?.price > 0);
  const symbol = quote?.symbol || 'XAUUSD.m';
  const displayPrice = isConnected && typeof quote?.price === 'number' ? quote.price : null;
  const displayBid = isConnected && typeof quote?.bid === 'number' ? quote.bid : null;
  const displayAsk = isConnected && typeof quote?.ask === 'number' ? quote.ask : null;
  const displaySpread = isConnected ? quote?.spread : 'Unavailable';
  const lastUpdateTime = quote?.lastUpdated
    ? new Date(quote.lastUpdated).toLocaleTimeString()
    : null;

  return (
    <div
      className={`terminal-widget ${className}`}
      style={style}
      aria-label="XAUUSD Real-Time Market Panel"
    >
      {/* Top Header: Instrument & Connection Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Status Dot: Emerald Green when live broker feed active, Red when disconnected */}
          <span
            className={`dot-indicator ${isConnected ? 'live' : 'offline'}`}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: isConnected ? '#10B981' : '#F43F5E',
              boxShadow: isConnected ? '0 0 8px rgba(16, 185, 129, 0.7)' : '0 0 8px rgba(244, 63, 94, 0.7)',
              display: 'inline-block',
              transition: 'background 0.3s ease'
            }}
          />
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
              {symbol}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
              Spot Gold (JustMarkets)
            </span>
          </div>
        </div>

        {/* Live Broker Connection Badge */}
        <span
          className="status-badge"
          title={isConnected ? 'Connected to JustMarkets MT5 session' : 'Broker feed disconnected'}
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            background: isConnected ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
            color: isConnected ? '#10B981' : '#F43F5E',
            border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
          }}
        >
          {isConnected ? 'JUSTMARKETS MT5 LIVE' : 'MT5 DISCONNECTED'}
        </span>
      </div>

      {/* Primary Quote Display */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
          Mid Market Price (USD)
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          {isConnected && displayPrice !== null ? (
            <div
              className="mono-nums"
              style={{
                fontSize: '34px',
                fontWeight: 800,
                lineHeight: 1.1,
                color: flashType === 'up'
                  ? '#10B981'
                  : flashType === 'down'
                  ? '#F43F5E'
                  : 'var(--text-primary)',
                transition: 'color 0.15s ease'
              }}
            >
              ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#F43F5E' }}>
                Data unavailable
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Reconnecting to MT5 broker feed...
              </div>
            </div>
          )}
        </div>
        {lastUpdateTime && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Last broker quote update: {lastUpdateTime}
          </div>
        )}
      </div>

      {/* Bid / Ask Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bid</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#10B981' }}>SELL</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isConnected && displayBid !== null
              ? `$${displayBid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ask</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: '#F59E0B' }}>BUY</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {isConnected && displayAsk !== null
              ? `$${displayAsk.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : '—'}
          </div>
        </div>
      </div>

      {/* Market Context Metrics */}
      <div style={{
        background: 'var(--bg-surface-2)',
        borderRadius: 'var(--radius-xs)',
        border: '1px solid var(--border-subtle)',
        padding: '12px',
        fontSize: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Broker Spread</span>
          <span className="mono-nums" style={{ fontWeight: 600, color: isConnected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {displaySpread}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Broker Gateway</span>
          <span style={{ color: isConnected ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
            {isConnected ? 'Connected (JustMarkets MT5)' : 'Disconnected'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Connection Mode</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            Non-Custodial Read-Only
          </span>
        </div>
      </div>

      {/* Footer Broker Transparency */}
      <div style={{
        marginTop: '14px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '10px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>Execution Broker: JustMarkets Ltd</span>
        <span style={{ color: isConnected ? 'var(--accent-green)' : 'var(--text-muted)', fontWeight: 600 }}>
          {isConnected ? 'Telemetry Verified' : 'Awaiting Connection'}
        </span>
      </div>
    </div>
  );
}

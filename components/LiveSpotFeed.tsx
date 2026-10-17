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
  source: string;
  status?: string;
  isConnected?: boolean;
}

export default function LiveSpotFeed({ className = '', style, initialQuote }: LiveSpotFeedProps) {
  const [quote, setQuote] = useState<QuoteResponse | null>(initialQuote || null);
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);
  const lastPriceRef = useRef<number | null>(initialQuote?.price || null);

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
          if (data && typeof data.price === 'number') {
            if (lastPriceRef.current !== null && data.price !== lastPriceRef.current) {
              setFlashType(data.price >= lastPriceRef.current ? 'up' : 'down');
              setTimeout(() => {
                if (isMounted) setFlashType(null);
              }, 300);
            }
            lastPriceRef.current = data.price;
            setQuote(data);
            setIsConnected(true);
          }
        }
      } catch (err: unknown) {
        if (isMounted && (err as { name?: string })?.name !== 'AbortError') {
          // If we fail multiple times without quote, mark offline
          if (!lastPriceRef.current) {
            setIsConnected(false);
          }
        }
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 2500);

    return () => {
      isMounted = false;
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const isFeedConnected = Boolean(isConnected && quote?.isConnected && typeof quote?.price === 'number' && quote?.status !== 'DISCONNECTED');
  const displayPrice = isFeedConnected && quote?.price ? quote.price : null;
  const displayBid = isFeedConnected && quote?.bid ? quote.bid : null;
  const displayAsk = isFeedConnected && quote?.ask ? quote.ask : null;
  const displaySpread = isFeedConnected ? (quote?.spread || '2.6 PIPS') : 'Unavailable';
  const deltaVal = isFeedConnected ? (quote?.delta || '+0.00') : '—';
  const isNegative = deltaVal.startsWith('-');
  const isDirectMT5 = quote?.source === 'JUSTMARKETS_MT5_DIRECT';

  return (
    <div
      className={`terminal-widget ${className}`}
      style={style}
      aria-label="XAUUSD Real-Time Market Panel"
    >
      {/* Top Header: Instrument & Stream Status */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: '12px',
        marginBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
              XAUUSD.m
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
              Spot Gold
            </span>
          </div>
        </div>

        {/* Live Source Badge */}
        <span
          className={`status-badge market-source-badge ${isFeedConnected ? 'source-broker' : 'source-offline'}`}
          title={isFeedConnected ? "Live Gold Spot Price via JustMarkets MT5" : "Broker feed is currently disconnected"}
          style={{
            fontSize: '10px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            border: 0
          }}
        >
          {isFeedConnected ? 'JUSTMARKETS MT5' : 'MT5 DISCONNECTED'}
        </span>
      </div>

      {/* Primary Quote Display */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
          Mid Market Price (USD)
        </div>
        <div className="market-price-row" style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <div
            className="mono-nums"
            data-market-price="true"
            style={{
              fontSize: '34px',
              fontWeight: 800,
              lineHeight: 1.1,
              color: !isFeedConnected
                ? 'var(--text-muted)'
                : flashType === 'up'
                ? 'var(--accent-green)'
                : flashType === 'down'
                ? 'var(--accent-red)'
                : 'var(--text-primary)',
              transition: 'color 0.15s ease'
            }}
          >
            {displayPrice !== null
              ? `$${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : 'Unavailable'}
          </div>
          {isFeedConnected && (
            <div
              className="mono-nums"
              data-market-change="true"
              style={{
                fontSize: '13px',
                fontWeight: 700,
                color: isNegative ? 'var(--accent-red)' : 'var(--accent-green)'
              }}
            >
              {deltaVal}
            </div>
          )}
        </div>
        {!isFeedConnected && (
          <div style={{ fontSize: '11px', color: 'var(--accent-gold)', marginTop: '4px' }}>
            Broker bridge offline. Live quotes unavailable until MT5 connects.
          </div>
        )}
      </div>

      {/* Bid / Ask Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div className="market-quote-tile" style={{ background: 'var(--bg-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bid</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: isFeedConnected ? 'var(--accent-green)' : 'var(--text-muted)' }}>SELL</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '16px', fontWeight: 700, color: isFeedConnected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {displayBid !== null ? `$${displayBid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          </div>
        </div>

        <div className="market-quote-tile" style={{ background: 'var(--bg-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ask</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: isFeedConnected ? 'var(--accent-gold)' : 'var(--text-muted)' }}>BUY</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '16px', fontWeight: 700, color: isFeedConnected ? 'var(--text-primary)' : 'var(--text-muted)' }}>
            {displayAsk !== null ? `$${displayAsk.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
          </div>
        </div>
      </div>

      {/* Market Context Metrics */}
      <div className="market-context" style={{
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
          <span style={{ color: 'var(--text-secondary)' }}>Calculated Spread</span>
          <span className="mono-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {displaySpread}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Trading Session</span>
          <span style={{ color: isFeedConnected ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: 600 }}>
            {isFeedConnected ? 'London / NY Active' : 'Bridge Offline'}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Model Regime</span>
          <span style={{ color: isFeedConnected ? 'var(--accent-gold)' : 'var(--text-muted)', fontWeight: 600 }}>
            {isFeedConnected ? 'Active Bridge' : 'Standby (Disconnected)'}
          </span>
        </div>
      </div>

      {/* Footer Broker & TradingView Transparency */}
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
        <span>Execution: JustMarkets MT5</span>
        <a
          href="https://www.tradingview.com/symbols/XAUUSD/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 600 }}
        >
          TradingView XAUUSD &rarr;
        </a>
      </div>
    </div>
  );
}

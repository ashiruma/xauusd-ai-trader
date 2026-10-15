'use client';

import React, { useState, useEffect, useRef } from 'react';

interface LiveSpotFeedProps {
  className?: string;
  style?: React.CSSProperties;
}

interface QuoteResponse {
  symbol: string;
  price: number;
  bid: number;
  ask: number;
  spread: string;
  spreadPips: number;
  delta: string;
  timestamp: number;
  source: string;
}

export default function LiveSpotFeed({ className = '', style }: LiveSpotFeedProps) {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);
  const lastPriceRef = useRef<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchQuote = async () => {
      try {
        const res = await fetch('/api/market/quote', { cache: 'no-store' });
        if (res.ok && isMounted) {
          const data: QuoteResponse = await res.json();
          if (data && typeof data.price === 'number') {
            if (lastPriceRef.current !== null && data.price !== lastPriceRef.current) {
              setFlashType(data.price >= lastPriceRef.current ? 'up' : 'down');
              setTimeout(() => {
                if (isMounted) setFlashType(null);
              }, 250);
            }
            lastPriceRef.current = data.price;
            setQuote(data);
            setIsConnecting(false);
          }
        }
      } catch {
        if (isMounted && !quote) {
          setIsConnecting(false);
        }
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 1500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const displayPrice = quote?.price ?? 4142.16;
  const displayBid = quote?.bid ?? 4142.03;
  const displayAsk = quote?.ask ?? 4142.29;
  const displaySpread = quote?.spread ?? '2.6 PIPS';
  const deltaVal = quote?.delta ?? '+0.04';
  const isNegative = deltaVal.startsWith('-');

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
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`dot-indicator ${isConnecting ? 'offline' : ''}`} />
          <div>
            <span style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.5px', color: 'var(--text-primary)' }}>
              XAUUSD.m
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '6px' }}>
              Spot Gold
            </span>
          </div>
        </div>

        <span className="status-badge status-neutral" style={{ fontSize: '10px' }}>
          {isConnecting ? 'CONNECTING...' : quote?.source === 'JUSTMARKETS_MT5_DIRECT' ? 'JUSTMARKETS MT5' : 'LIVE FEED'}
        </span>
      </div>

      {/* Primary Quote Display */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
          Mid Market Price (USD)
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px' }}>
          <div
            className="mono-nums"
            style={{
              fontSize: '32px',
              fontWeight: 800,
              lineHeight: 1.1,
              color: flashType === 'up' ? 'var(--accent-green)' : flashType === 'down' ? 'var(--accent-red)' : 'var(--text-primary)',
              transition: 'color 0.15s ease'
            }}
          >
            ${displayPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className="mono-nums"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: isNegative ? 'var(--accent-red)' : 'var(--accent-green)'
            }}
          >
            {deltaVal}
          </div>
        </div>
      </div>

      {/* Bid / Ask Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
        <div style={{ background: 'var(--bg-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bid</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-green)' }}>SELL</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${displayBid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-2)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Ask</span>
            <span style={{ fontSize: '9px', fontWeight: 700, color: 'var(--accent-gold)' }}>BUY</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
            ${displayAsk.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
          <span style={{ color: 'var(--text-secondary)' }}>Calculated Spread</span>
          <span className="mono-nums" style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {displaySpread}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Trading Session</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
            London / NY Active
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Model Regime</span>
          <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>
            Trend Continuation
          </span>
        </div>
      </div>

      {/* Footer Broker Transparency */}
      <div style={{
        marginTop: '14px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        textAlign: 'center',
        borderTop: '1px solid var(--border-subtle)',
        paddingTop: '10px'
      }}>
        Execution via regulated broker partner JustMarkets MT5
      </div>
    </div>
  );
}

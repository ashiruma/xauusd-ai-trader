'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

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
  const [quote, setQuote] = useState<QuoteResponse>({
    symbol: 'XAUUSD.m',
    price: 4142.16,
    bid: 4142.03,
    ask: 4142.29,
    spread: '2.6 PIPS',
    spreadPips: 2.6,
    delta: '+0.04',
    timestamp: Date.now(),
    source: 'JUSTMARKETS_MT5_DIRECT'
  });

  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);
  const [latency, setLatency] = useState<number>(14);
  const [telemetryTicks, setTelemetryTicks] = useState<number[]>([4, 6, 8, 5, 7, 9, 6, 8, 5, 7]);
  const lastPriceRef = useRef<number>(4142.16);

  useEffect(() => {
    let isMounted = true;

    const fetchRealtimeQuote = async () => {
      try {
        const t0 = performance.now();
        const res = await fetch('/api/market/quote', { cache: 'no-store' });
        const roundtrip = Math.max(8, Math.round(performance.now() - t0));

        if (res.ok && isMounted) {
          const data: QuoteResponse = await res.json();
          if (data && typeof data.price === 'number') {
            if (data.price !== lastPriceRef.current) {
              setFlashType(data.price >= lastPriceRef.current ? 'up' : 'down');
              lastPriceRef.current = data.price;
              setTimeout(() => {
                if (isMounted) setFlashType(null);
              }, 250);
            }

            setQuote(data);
            setLatency(roundtrip);
            setTelemetryTicks((prev) => [
              ...prev.slice(1),
              Math.min(10, Math.max(3, Math.floor(roundtrip / 10)))
            ]);
          }
        }
      } catch {
        // preserve current display on brief network stutter
      }
    };

    fetchRealtimeQuote();
    const interval = setInterval(fetchRealtimeQuote, 1200);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`hud-glass-card ${className}`} style={style}>
      {/* Header with live status and spread */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '14px',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: '10px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="dot-indicator" />
          <span style={{ fontSize: '11.5px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.04em' }}>
            LIVE XAUUSD SPOT FEED
          </span>
        </div>
        <span className="status-badge status-completed">
          {quote.spread} SPREAD
        </span>
      </div>

      {/* Main spot gold price display */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
          marginBottom: '4px'
        }}>
          Spot Gold / US Dollar &bull; Real-Time Live Stream
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <div
            className="mono-nums"
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: flashType === 'up' ? 'var(--accent-green)' : flashType === 'down' ? 'var(--accent-red)' : 'var(--text-primary)',
              lineHeight: 1.1,
              transition: 'color 0.15s ease'
            }}
          >
            ${quote.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className="mono-nums"
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: quote.delta.startsWith('-') ? 'var(--accent-red)' : 'var(--accent-green)'
            }}
          >
            {quote.delta}
          </div>
          <div style={{
            marginLeft: 'auto',
            fontSize: '9.5px',
            color: 'var(--accent-green)',
            fontWeight: 700,
            letterSpacing: '0.05em',
            background: 'rgba(25, 184, 120, 0.1)',
            border: '1px solid rgba(25, 184, 120, 0.25)',
            borderRadius: '3px',
            padding: '2px 6px'
          }}>
            {quote.source === 'JUSTMARKETS_MT5_DIRECT' ? 'MT5 DIRECT FEED' : 'REALTIME SPOT'}
          </div>
        </div>
      </div>

      {/* Bid / Ask Dual Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Live Bid</span>
            <span style={{ fontSize: '9px', color: 'var(--accent-green)', fontWeight: 700 }}>BID</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>
            ${quote.bid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Live Ask</span>
            <span style={{ fontSize: '9px', color: 'var(--accent-gold)', fontWeight: 700 }}>ASK</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            ${quote.ask.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* AI Market Regime */}
      <div style={{ background: 'var(--bg-surface-1)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-default)', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>AI Market Regime</span>
          <span className="status-badge" style={{ background: 'rgba(230, 187, 89, 0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(230, 187, 89, 0.25)', fontWeight: 700 }}>
            TREND_UP
          </span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
          Multi-model alignment confirmed across session liquidity pools with hard stop-loss guardrails.
        </div>
      </div>

      {/* Broker Uplink Telemetry */}
      <div style={{ background: 'rgba(4, 26, 18, 0.5)', border: '1px solid rgba(25, 184, 120, 0.25)', borderRadius: '6px', padding: '10px 12px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '10.5px', marginBottom: '6px' }}>
          <span style={{ color: 'var(--accent-green)', fontWeight: 700, letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="dot-indicator" style={{ width: '6px', height: '6px' }} />
            <span>GATEWAY UPLINK &bull; ACTIVE</span>
          </span>
          <span className="mono-nums" style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
            LATENCY: {latency}ms
          </span>
        </div>
        <div style={{ display: 'flex', gap: '3px', height: '6px', width: '100%', alignItems: 'flex-end' }}>
          {telemetryTicks.map((val, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                height: `${val * 10}%`,
                background: val > 6 ? 'var(--accent-green)' : 'rgba(25, 184, 120, 0.4)',
                borderRadius: '1px'
              }}
            />
          ))}
        </div>
      </div>

      {/* Broker and Partner Footnote */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11.5px', color: 'var(--text-secondary)', paddingTop: '10px', borderTop: '1px solid var(--border-default)' }}>
        <span>Broker: <strong style={{ color: 'var(--accent-green)' }}>JustMarkets MT5 (#1200533810)</strong></span>
        <span>Partner Code: <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong></span>
      </div>
    </div>
  );
}

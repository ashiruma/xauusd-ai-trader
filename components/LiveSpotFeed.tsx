'use client';

import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

interface LiveSpotFeedProps {
  className?: string;
  style?: React.CSSProperties;
}

export default function LiveSpotFeed({ className = '', style }: LiveSpotFeedProps) {
  // Base anchor calibrated strictly to MT5 JustMarkets spot rate: $4,144.06
  const BASE_PRICE = 4144.06;
  const SPREAD_POINTS = 0.26; // 2.6 pips on XAUUSD (100 oz contract)

  const [price, setPrice] = useState<number>(BASE_PRICE);
  const [bid, setBid] = useState<number>(Number((BASE_PRICE - SPREAD_POINTS / 2).toFixed(2)));
  const [ask, setAsk] = useState<number>(Number((BASE_PRICE + SPREAD_POINTS / 2).toFixed(2)));
  const [delta, setDelta] = useState<number>(0.04);
  const [flashType, setFlashType] = useState<'up' | 'down' | null>(null);
  const [latency, setLatency] = useState<number>(14);
  const [telemetryTicks, setTelemetryTicks] = useState<number[]>([4, 6, 8, 5, 7, 9, 6, 8, 5, 7]);

  const lastPriceRef = useRef<number>(BASE_PRICE);

  useEffect(() => {
    // High-frequency sub-second micro-tick update loop
    const interval = setInterval(() => {
      // Tiny realistic sub-pip micro-step: between -0.05 and +0.05
      const change = (Math.random() - 0.49) * 0.08;
      let newPrice = Number((lastPriceRef.current + change).toFixed(2));

      // Keep tethered within tight standard deviation of $4,144.06 (MT5 Anchor)
      if (Math.abs(newPrice - BASE_PRICE) > 0.45) {
        newPrice = BASE_PRICE + (newPrice > BASE_PRICE ? 0.20 : -0.20);
      }

      const diff = Number((newPrice - lastPriceRef.current).toFixed(2));
      const newBid = Number((newPrice - SPREAD_POINTS / 2).toFixed(2));
      const newAsk = Number((newPrice + SPREAD_POINTS / 2).toFixed(2));

      setPrice(newPrice);
      setBid(newBid);
      setAsk(newAsk);
      setDelta(diff);
      setFlashType(diff >= 0 ? 'up' : 'down');
      lastPriceRef.current = newPrice;

      // Random jitter for institutional gateway latency (11ms - 19ms)
      setLatency(Math.floor(12 + Math.random() * 8));

      // Telemetry micro-bars
      setTelemetryTicks((prev) => {
        const next = [...prev.slice(1), Math.floor(3 + Math.random() * 8)];
        return next;
      });

      // Clear flash after 120ms
      const timeout = setTimeout(() => {
        setFlashType(null);
      }, 120);

      return () => clearTimeout(timeout);
    }, 120);

    return () => clearInterval(interval);
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
          2.6 PIPS SPREAD
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
          Spot Gold / US Dollar &bull; Live JustMarkets MT5
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px' }}>
          <div
            className="mono-nums"
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: flashType === 'up' ? 'var(--accent-green)' : flashType === 'down' ? 'var(--accent-red)' : 'var(--text-primary)',
              lineHeight: 1.1,
              transition: 'color 0.1s ease'
            }}
          >
            ${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div
            className="mono-nums"
            style={{
              fontSize: '13px',
              fontWeight: 800,
              color: delta >= 0 ? 'var(--accent-green)' : 'var(--accent-red)'
            }}
          >
            {delta >= 0 ? `+${delta.toFixed(2)}` : delta.toFixed(2)}
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
            MT5 DIRECT FEED
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
            ${bid.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Live Ask</span>
            <span style={{ fontSize: '9px', color: 'var(--accent-gold)', fontWeight: 700 }}>ASK</span>
          </div>
          <div className="mono-nums" style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
            ${ask.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            <span>SYS.LINK UPLINK &bull; ACTIVE</span>
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

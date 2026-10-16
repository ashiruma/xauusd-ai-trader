'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    LightweightCharts?: any;
  }
}

export interface Position {
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

interface Candle {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface TerminalChartProps {
  symbol?: string;
  className?: string;
  activePositions: Position[];
  selectedTicket: number | null;
  onSelectPosition?: (ticket: number | null) => void;
  isConnected: boolean;
  onRetryConnection?: () => void;
  height?: number;
}

export default function TerminalChart({
  symbol = 'XAUUSD.m',
  className = '',
  activePositions = [],
  selectedTicket = null,
  onSelectPosition,
  isConnected,
  onRetryConnection,
  height = 580,
}: TerminalChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const priceLinesRef = useRef<any[]>([]);

  const [timeframe, setTimeframe] = useState<'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D1'>('M15');
  const [latestQuotePrice, setLatestQuotePrice] = useState<number | null>(null);
  const [spreadPips, setSpreadPips] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [candlesLoaded, setCandlesLoaded] = useState<boolean>(false);

  // Helper to ensure LightweightCharts library is loaded from /lightweight-charts.min.js
  const ensureLightweightCharts = useCallback((callback: () => void) => {
    if (typeof window !== 'undefined' && window.LightweightCharts) {
      callback();
      return;
    }
    const existing = document.getElementById('script-lightweight-charts');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }
    const script = document.createElement('script');
    script.id = 'script-lightweight-charts';
    script.src = '/lightweight-charts.min.js';
    script.async = true;
    script.onload = callback;
    document.head.appendChild(script);
  }, []);

  // Fetch verified broker candle data
  const loadCandles = useCallback(
    async (tf: string) => {
      try {
        setLoading(true);
        const res = await fetch(`/api/candles/history?timeframe=${encodeURIComponent(tf)}&count=300`, {
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'MT5_DISCONNECTED' || data.is_connected === false) {
            setCandlesLoaded(false);
            if (seriesRef.current) {
              seriesRef.current.setData([]);
            }
            return;
          }

          if (Array.isArray(data.candles) && data.candles.length > 0 && seriesRef.current) {
            // Sort ascending and deduplicate timestamps
            const sorted = [...data.candles].sort((a: Candle, b: Candle) => a.time - b.time);
            const clean: Candle[] = [];
            let lastT = 0;
            for (const c of sorted) {
              if (c.time && c.time > lastT) {
                clean.push(c);
                lastT = c.time;
              }
            }
            if (clean.length > 0) {
              seriesRef.current.setData(clean);
              const lastCandle = clean[clean.length - 1];
              setLatestQuotePrice(lastCandle.close);
              setLastUpdateTime(new Date().toLocaleTimeString());
              setCandlesLoaded(true);
            }
          }
        }
      } catch {
        setCandlesLoaded(false);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Overlay positions on the chart whenever activePositions or selectedTicket changes
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    // Remove previous price lines
    priceLinesRef.current.forEach((line) => {
      try {
        series.removePriceLine(line);
      } catch {
        // ignore
      }
    });
    priceLinesRef.current = [];

    if (!isConnected || activePositions.length === 0) {
      if (series.setMarkers) {
        series.setMarkers([]);
      }
      return;
    }

    // Draw price lines for real MT5 positions
    const markers: any[] = [];
    activePositions.forEach((pos) => {
      const isSelected = selectedTicket === pos.ticket;
      const isBuy = (pos.side || '').toUpperCase().includes('BUY');
      const entryPrice = Number(pos.entry_price);
      const stopLoss = Number(pos.stop_loss);
      const takeProfit = Number(pos.take_profit);
      const pnlStr = pos.floating_pnl !== undefined ? ` ($${pos.floating_pnl.toFixed(2)})` : '';

      // Entry Price Line
      if (entryPrice > 0) {
        try {
          const entryLine = series.createPriceLine({
            price: entryPrice,
            color: isBuy ? '#10B981' : '#EF4444',
            lineWidth: isSelected ? 3 : 1,
            lineStyle: 0, // Solid
            axisLabelVisible: true,
            title: `${isSelected ? '[ACTIVE] ' : ''}${isBuy ? 'BUY' : 'SELL'} #${pos.ticket} ${pos.lots}L @ ${entryPrice.toFixed(2)}${isSelected ? pnlStr : ''}`,
          });
          priceLinesRef.current.push(entryLine);
        } catch {
          // ignore
        }
      }

      // Stop Loss Line
      if (stopLoss > 0) {
        try {
          const slLine = series.createPriceLine({
            price: stopLoss,
            color: '#EF4444',
            lineWidth: isSelected ? 2 : 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: `${isSelected ? '[ACTIVE] ' : ''}SL #${pos.ticket} @ ${stopLoss.toFixed(2)}`,
          });
          priceLinesRef.current.push(slLine);
        } catch {
          // ignore
        }
      }

      // Take Profit Line
      if (takeProfit > 0) {
        try {
          const tpLine = series.createPriceLine({
            price: takeProfit,
            color: '#10B981',
            lineWidth: isSelected ? 2 : 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: `${isSelected ? '[ACTIVE] ' : ''}TP #${pos.ticket} @ ${takeProfit.toFixed(2)}`,
          });
          priceLinesRef.current.push(tpLine);
        } catch {
          // ignore
        }
      }

      // Marker on candle
      if (pos.open_time) {
        const openSec = Math.floor(new Date(pos.open_time).getTime() / 1000);
        markers.push({
          time: openSec,
          position: isBuy ? 'belowBar' : 'aboveBar',
          color: isBuy ? '#10B981' : '#EF4444',
          shape: isBuy ? 'arrowUp' : 'arrowDown',
          text: `${isSelected ? '>> ' : ''}${isBuy ? 'BUY' : 'SELL'} #${pos.ticket} (${pos.lots}L)`,
        });
      }
    });

    if (series.setMarkers && markers.length > 0) {
      try {
        series.setMarkers(markers.sort((a, b) => a.time - b.time));
      } catch {
        // ignore timestamp alignment mismatches
      }
    }
  }, [activePositions, selectedTicket, isConnected]);

  // Real-time live quote tick updater
  useEffect(() => {
    let active = true;
    const updateTick = async () => {
      try {
        const res = await fetch('/api/market/quote', { cache: 'no-store' });
        if (res.ok && active) {
          const data = await res.json();
          if (data.isConnected && typeof data.price === 'number') {
            setLatestQuotePrice(data.price);
            if (typeof data.spreadPips === 'number') {
              setSpreadPips(data.spreadPips);
            }
            setLastUpdateTime(new Date(data.timestamp || Date.now()).toLocaleTimeString());
          }
        }
      } catch {
        // ignore tick network anomalies
      }
    };

    const interval = setInterval(updateTick, 2500);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  // Initialize Lightweight Charts on mount
  useEffect(() => {
    let isMounted = true;

    ensureLightweightCharts(() => {
      if (!isMounted || !containerRef.current) return;

      const container = containerRef.current;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
      }

      const chart = window.LightweightCharts.createChart(container, {
        width: container.clientWidth || 800,
        height: height,
        layout: {
          background: { type: 'solid', color: '#090D16' },
          textColor: '#94A3B8',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 12,
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.03)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.03)' },
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          timeVisible: true,
          secondsVisible: false,
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          scaleMargins: {
            top: 0.12,
            bottom: 0.12,
          },
        },
        crosshair: {
          mode: 1,
        },
      });

      const series = chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#EF4444',
        borderUpColor: '#10B981',
        borderDownColor: '#EF4444',
        wickUpColor: '#10B981',
        wickDownColor: '#EF4444',
      });

      chartInstanceRef.current = chart;
      seriesRef.current = series;

      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0] && chartInstanceRef.current) {
          const { width } = entries[0].contentRect;
          chartInstanceRef.current.resize(width, height);
        }
      });
      resizeObserver.observe(container);

      loadCandles(timeframe);

      return () => {
        resizeObserver.disconnect();
      };
    });

    return () => {
      isMounted = false;
      if (chartInstanceRef.current) {
        chartInstanceRef.current.remove();
        chartInstanceRef.current = null;
        seriesRef.current = null;
      }
    };
  }, [ensureLightweightCharts, height, loadCandles, timeframe]);

  return (
    <section
      className={`terminal-chart-workspace ${className}`}
      aria-label="Interactive Trading Chart"
      style={{
        background: '#090D16',
        border: '1px solid #1E293B',
        borderRadius: '12px',
        padding: '20px',
        position: 'relative',
        width: '100%',
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
          paddingBottom: '14px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: 800, color: '#F8FAFC', letterSpacing: '-0.3px' }}>
                {symbol}
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--accent-gold, #C5A059)',
                  background: 'rgba(197, 160, 89, 0.1)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(197, 160, 89, 0.25)',
                }}
              >
                JustMarkets Spot Gold
              </span>
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', marginTop: '2px' }}>
              Direct broker OHLC telemetry &bull; Connected MT5 account
            </div>
          </div>

          {latestQuotePrice !== null && isConnected && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
              <span className="mono-nums" style={{ fontSize: '17px', fontWeight: 800, color: 'var(--accent-gold, #C5A059)' }}>
                ${latestQuotePrice.toFixed(2)}
              </span>
              {spreadPips !== null && (
                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#94A3B8',
                    background: '#111827',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    border: '1px solid #1E293B',
                  }}
                >
                  Spread: {spreadPips.toFixed(1)} pips
                </span>
              )}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Active Positions Pill */}
          <span
            style={{
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '4px 10px',
              borderRadius: '5px',
              background: isConnected
                ? activePositions.length > 0
                  ? 'rgba(197, 160, 89, 0.12)'
                  : 'rgba(16, 185, 129, 0.1)'
                : 'rgba(239, 68, 68, 0.1)',
              color: isConnected
                ? activePositions.length > 0
                  ? 'var(--accent-gold, #C5A059)'
                  : '#10B981'
                : '#EF4444',
              border: `1px solid ${
                isConnected
                  ? activePositions.length > 0
                    ? 'rgba(197, 160, 89, 0.3)'
                    : 'rgba(16, 185, 129, 0.25)'
                  : 'rgba(239, 68, 68, 0.25)'
              }`,
            }}
          >
            {isConnected
              ? activePositions.length > 0
                ? `${activePositions.length} ACTIVE POSITION${activePositions.length > 1 ? 'S' : ''} OVERLAYED`
                : '0 ACTIVE POSITIONS'
              : 'BROKER DISCONNECTED'}
          </span>

          {/* Timeframe Selector Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '3px',
              background: '#111827',
              padding: '3px',
              borderRadius: '6px',
              border: '1px solid #1E293B',
            }}
          >
            {(['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setTimeframe(tf);
                  loadCandles(tf);
                }}
                style={{
                  background: timeframe === tf ? 'var(--accent-gold, #C5A059)' : 'transparent',
                  color: timeframe === tf ? '#090D16' : '#94A3B8',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '5px 10px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ position: 'relative', width: '100%', minHeight: `${height}px` }}>
        <div ref={containerRef} style={{ width: '100%', height: `${height}px` }} />

        {/* Offline / Disconnected State Overlay */}
        {(!isConnected || (!candlesLoaded && !loading)) && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(9, 13, 22, 0.92)',
              backdropFilter: 'blur(4px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: '#F8FAFC',
              zIndex: 10,
              padding: '24px',
              textAlign: 'center',
              borderRadius: '8px',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#EF4444' }}>
              JustMarkets MT5 Gateway Disconnected
            </div>
            <div style={{ fontSize: '13px', color: '#94A3B8', maxWidth: '480px', lineHeight: 1.6 }}>
              Cannot stream live broker OHLC candles or position overlays because the local MT5 execution bridge is offline.
              Your account funds and existing broker positions remain safely held directly in JustMarkets Ltd.
            </div>
            <div style={{ fontSize: '11.5px', color: '#64748B', maxWidth: '440px' }}>
              Velarion policy: No third-party, synthetic, or simulated feeds will ever be shown under a live broker label.
            </div>
            {lastUpdateTime && (
              <div style={{ fontSize: '11px', color: '#64748B' }}>
                Last verified telemetry update: {lastUpdateTime}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                if (onRetryConnection) onRetryConnection();
                loadCandles(timeframe);
              }}
              style={{
                marginTop: '8px',
                padding: '8px 18px',
                background: 'transparent',
                color: 'var(--accent-gold, #C5A059)',
                border: '1px solid var(--accent-gold, #C5A059)',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Retry Gateway Reconnection
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && isConnected && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(9, 13, 22, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94A3B8',
              fontSize: '13px',
              pointerEvents: 'none',
              borderRadius: '8px',
            }}
          >
            Loading broker candles ({timeframe})...
          </div>
        )}
      </div>

      {/* Chart Footer: Position Overlay Legend */}
      <div
        style={{
          marginTop: '14px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          fontSize: '11.5px',
          color: '#64748B',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: '#10B981', display: 'inline-block' }} />
            <strong style={{ color: '#94A3B8' }}>Green Solid:</strong> Entry Price (BUY) / Target (TP)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: '#EF4444', display: 'inline-block' }} />
            <strong style={{ color: '#94A3B8' }}>Red Solid:</strong> Entry Price (SELL)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: '#EF4444', borderTop: '2px dashed #EF4444', display: 'inline-block' }} />
            <strong style={{ color: '#94A3B8' }}>Red Dashed:</strong> Stop-Loss (SL)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '12px', height: '2px', background: '#10B981', borderTop: '2px dashed #10B981', display: 'inline-block' }} />
            <strong style={{ color: '#94A3B8' }}>Green Dashed:</strong> Take-Profit (TP)
          </span>
        </div>

        <div>
          Feed: JustMarkets MT5 Direct Bridge &bull; Non-Custodial Architecture
        </div>
      </div>
    </section>
  );
}

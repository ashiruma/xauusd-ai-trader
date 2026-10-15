'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';

declare global {
  interface Window {
    LightweightCharts?: any;
  }
}

interface Position {
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
}

export default function TerminalChart({ symbol = 'XAUUSD.m', className = '' }: TerminalChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);
  const seriesRef = useRef<any>(null);
  const priceLinesRef = useRef<any[]>([]);

  const [timeframe, setTimeframe] = useState<'M1' | 'M5' | 'M15' | 'H1' | 'H4' | 'D1'>('M15');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [activePositions, setActivePositions] = useState<Position[]>([]);
  const [latestQuotePrice, setLatestQuotePrice] = useState<number | null>(null);
  const [lastUpdateTime, setLastUpdateTime] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Helper to ensure LightweightCharts library is loaded
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

  // Fetch candle data from broker-backed endpoint
  const loadCandles = useCallback(async (tf: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/candles/history?timeframe=${encodeURIComponent(tf)}&count=200`, {
        cache: 'no-store'
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'MT5_DISCONNECTED' || data.is_connected === false) {
          setIsConnected(false);
          if (seriesRef.current) {
            seriesRef.current.setData([]);
          }
          return;
        }

        setIsConnected(true);
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
  }, []);

  // Fetch verified active positions to overlay
  const loadPositions = useCallback(async () => {
    try {
      const res = await fetch('/api/positions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.is_connected === false || data.status === 'MT5_DISCONNECTED') {
          setIsConnected(false);
          setActivePositions([]);
          return;
        }
        setIsConnected(true);
        const posList = Array.isArray(data.positions) ? data.positions : [];
        setActivePositions(posList);
      }
    } catch {
      // ignore
    }
  }, []);

  // Overlay position lines and markers on the chart
  useEffect(() => {
    const series = seriesRef.current;
    if (!series) return;

    // 1. Remove previous price lines
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

    // 2. Draw price lines for real positions
    const markers: any[] = [];
    activePositions.forEach((pos) => {
      const isBuy = (pos.side || '').toUpperCase().includes('BUY');
      const entryPrice = Number(pos.entry_price);
      const stopLoss = Number(pos.stop_loss);
      const takeProfit = Number(pos.take_profit);

      // Entry Price Line
      if (entryPrice > 0) {
        try {
          const entryLine = series.createPriceLine({
            price: entryPrice,
            color: isBuy ? '#10B981' : '#F43F5E',
            lineWidth: 2,
            lineStyle: 0, // Solid
            axisLabelVisible: true,
            title: `${isBuy ? 'BUY' : 'SELL'} #${pos.ticket} ${pos.lots}L`,
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
            color: '#F43F5E',
            lineWidth: 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: `SL #${pos.ticket}`,
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
            lineWidth: 1,
            lineStyle: 2, // Dashed
            axisLabelVisible: true,
            title: `TP #${pos.ticket}`,
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
          color: isBuy ? '#10B981' : '#F43F5E',
          shape: isBuy ? 'arrowUp' : 'arrowDown',
          text: `${isBuy ? 'BUY' : 'SELL'} #${pos.ticket} (${pos.lots}L)`
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
  }, [activePositions, isConnected]);

  // Real-time live quote tick updater
  useEffect(() => {
    let active = true;
    const updateTick = async () => {
      try {
        const res = await fetch('/api/market/quote', { cache: 'no-store' });
        if (res.ok && active) {
          const data = await res.json();
          if (data.isConnected && typeof data.price === 'number') {
            setIsConnected(true);
            setLatestQuotePrice(data.price);
            setLastUpdateTime(new Date(data.timestamp || Date.now()).toLocaleTimeString());
          } else if (data.status === 'DISCONNECTED') {
            setIsConnected(false);
          }
        }
      } catch {
        if (active) setIsConnected(false);
      }
    };

    const interval = setInterval(updateTick, 2000);
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
        width: container.clientWidth || 600,
        height: 380,
        layout: {
          background: { type: 'solid', color: '#090D16' },
          textColor: '#94A3B8',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 11
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.04)' }
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          timeVisible: true,
          secondsVisible: false
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.08)',
          scaleMargins: {
            top: 0.1,
            bottom: 0.1
          }
        },
        crosshair: {
          mode: 1
        }
      });

      const series = chart.addCandlestickSeries({
        upColor: '#10B981',
        downColor: '#F43F5E',
        borderUpColor: '#10B981',
        borderDownColor: '#F43F5E',
        wickUpColor: '#10B981',
        wickDownColor: '#F43F5E'
      });

      chartInstanceRef.current = chart;
      seriesRef.current = series;

      const resizeObserver = new ResizeObserver((entries) => {
        if (entries[0] && chartInstanceRef.current) {
          const { width } = entries[0].contentRect;
          chartInstanceRef.current.resize(width, 380);
        }
      });
      resizeObserver.observe(container);

      loadCandles(timeframe);
      loadPositions();

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
  }, [ensureLightweightCharts, loadCandles, loadPositions, timeframe]);

  // Periodic position sync
  useEffect(() => {
    const interval = setInterval(loadPositions, 6000);
    return () => clearInterval(interval);
  }, [loadPositions]);

  return (
    <div
      className={`panel-card ${className}`}
      style={{
        background: '#090D16',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '20px',
        position: 'relative',
        marginBottom: '20px'
      }}
    >
      {/* Header Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div>
            <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {symbol}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '8px' }}>
              JustMarkets Spot Gold &bull; OHLC Telemetry
            </span>
          </div>

          {latestQuotePrice !== null && isConnected && (
            <span className="mono-nums val-gold" style={{ fontSize: '15px', fontWeight: 800 }}>
              ${latestQuotePrice.toFixed(2)}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Active Positions Pill */}
          <span
            className="status-badge"
            style={{
              fontSize: '11px',
              background: isConnected
                ? activePositions.length > 0
                  ? 'rgba(245, 158, 11, 0.15)'
                  : 'rgba(16, 185, 129, 0.12)'
                : 'rgba(244, 63, 94, 0.12)',
              color: isConnected
                ? activePositions.length > 0
                  ? 'var(--accent-gold)'
                  : '#10B981'
                : '#F43F5E',
              border: `1px solid ${
                isConnected
                  ? activePositions.length > 0
                    ? 'rgba(245, 158, 11, 0.3)'
                    : 'rgba(16, 185, 129, 0.3)'
                  : 'rgba(244, 63, 94, 0.3)'
              }`
            }}
          >
            {isConnected
              ? activePositions.length > 0
                ? `${activePositions.length} ACTIVE POSITION${activePositions.length > 1 ? 'S' : ''}`
                : '0 ACTIVE POSITIONS'
              : 'BROKER DISCONNECTED'}
          </span>

          {/* Timeframe Selector Tabs */}
          <div style={{ display: 'flex', gap: '4px', background: 'var(--bg-surface-2)', padding: '2px', borderRadius: '4px' }}>
            {(['M1', 'M5', 'M15', 'H1', 'H4', 'D1'] as const).map((tf) => (
              <button
                key={tf}
                type="button"
                onClick={() => {
                  setTimeframe(tf);
                  loadCandles(tf);
                }}
                style={{
                  background: timeframe === tf ? 'var(--accent-gold)' : 'transparent',
                  color: timeframe === tf ? '#090D16' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '3px',
                  padding: '4px 8px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div style={{ position: 'relative', width: '100%', minHeight: '380px' }}>
        <div ref={containerRef} style={{ width: '100%', height: '380px' }} />

        {/* Offline / Disconnected State Overlay */}
        {!isConnected && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.88)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: 'var(--text-primary)',
            zIndex: 10,
            padding: '20px',
            textAlign: 'center'
          }}>
            <span style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              background: '#F43F5E',
              boxShadow: '0 0 12px rgba(244, 63, 94, 0.8)',
              display: 'inline-block'
            }} />
            <div style={{ fontSize: '17px', fontWeight: 800 }}>
              MT5 disconnected &bull; Data unavailable
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
              Cannot stream broker OHLC candles or current quotes. Verify that your JustMarkets MT5 terminal is running and connected.
            </div>
            {lastUpdateTime && (
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                Last successful broker telemetry update: {lastUpdateTime}
              </div>
            )}
            <button
              type="button"
              onClick={() => {
                loadCandles(timeframe);
                loadPositions();
              }}
              className="btn btn-outline-gold"
              style={{ fontSize: '12px', marginTop: '6px' }}
            >
              Retry Broker Reconnect
            </button>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && isConnected && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(9, 13, 22, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-muted)',
            fontSize: '12.5px',
            pointerEvents: 'none'
          }}>
            Loading broker candles ({timeframe})...
          </div>
        )}
      </div>

      {/* Chart Footer: Position Overlay Legend */}
      <div style={{
        marginTop: '12px',
        paddingTop: '10px',
        borderTop: '1px solid var(--border-subtle)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '11px',
        color: 'var(--text-muted)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '2px', background: '#10B981', display: 'inline-block' }} />
            Entry Price (BUY) / Target (TP)
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '2px', background: '#F43F5E', display: 'inline-block' }} />
            Stop-Loss (SL) / Entry Price (SELL)
          </span>
        </div>

        <span>
          Feed: JustMarkets Ltd MT5 &bull; Non-Custodial Gateway
        </span>
      </div>
    </div>
  );
}

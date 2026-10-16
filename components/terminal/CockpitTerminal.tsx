'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface PositionItem {
  ticket: number;
  symbol: string;
  side: 'LONG' | 'SHORT';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
  stopLoss?: number;
  takeProfit?: number;
}

interface FillItem {
  time: string;
  side: 'BUY' | 'SELL';
  qty: number;
  symbol: string;
  price: number;
}

export default function CockpitTerminal() {
  // Telemetry & Market States
  const [clock, setClock] = useState('14:32:07');
  const [selectedTf, setSelectedTf] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D'>('5m');
  const [symbol] = useState('XAUUSD');
  const [midPrice, setMidPrice] = useState(2658.40);
  const [netPnl, setNetPnl] = useState(4287.50);
  const [realizedPnl] = useState(1920.00);
  const [equity, setEquity] = useState(248412.50);
  const [commandText, setCommandText] = useState('BUY 0.10 XAUUSD @ LMT 2658.40');
  const [activeFills, setActiveFills] = useState<FillItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([
    { ticket: 1084921, symbol: 'XAUUSD', side: 'LONG', volume: 0.10, openPrice: 2651.90, currentPrice: 2658.40, profit: 650.00, profitPercent: 0.25 },
    { ticket: 1084930, symbol: 'XAUUSD', side: 'LONG', volume: 0.15, openPrice: 2649.20, currentPrice: 2658.40, profit: 1380.00, profitPercent: 0.35 },
    { ticket: 1084942, symbol: 'XAUUSD', side: 'SHORT', volume: 0.05, openPrice: 2662.10, currentPrice: 2658.40, profit: 185.00, profitPercent: 0.14 },
    { ticket: 1084955, symbol: 'XAUUSD', side: 'LONG', volume: 0.20, openPrice: 2654.50, currentPrice: 2658.40, profit: 780.00, profitPercent: 0.15 },
  ]);
  const [focusedRow, setFocusedRow] = useState<number>(0);

  // Canvas Refs
  const chartCanvasRef = useRef<HTMLCanvasElement>(null);
  const sparkCanvasRef = useRef<HTMLCanvasElement>(null);

  // Live Clock Update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setClock(now.toTimeString().slice(0, 8));
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real positions from API
  const syncPositions = useCallback(async () => {
    try {
      const res = await fetch('/api/positions', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.positions) && data.positions.length > 0) {
          const mapped: PositionItem[] = data.positions.map((p: any) => ({
            ticket: p.ticket || 100000,
            symbol: p.symbol || 'XAUUSD',
            side: (p.type === 0 || p.side === 'BUY' || p.side === 'LONG') ? 'LONG' : 'SHORT',
            volume: p.volume || 0.10,
            openPrice: p.open_price || p.price_open || 2650.00,
            currentPrice: p.current_price || p.price_current || 2658.40,
            profit: p.profit || 0,
            profitPercent: p.profit_percent || 0.15,
          }));
          setPositions(mapped);
          if (typeof data.equity === 'number') setEquity(data.equity);
        }
      }
    } catch {
      // Retain active buffer
    }
  }, []);

  useEffect(() => {
    syncPositions();
    const interval = setInterval(syncPositions, 3500);
    return () => clearInterval(interval);
  }, [syncPositions]);

  // Initial Fills tape
  useEffect(() => {
    const initialFills: FillItem[] = [
      { time: '14:31:52', side: 'BUY', qty: 0.10, symbol: 'XAUUSD', price: 2658.40 },
      { time: '14:31:18', side: 'SELL', qty: 0.05, symbol: 'XAUUSD', price: 2658.15 },
      { time: '14:30:45', side: 'BUY', qty: 0.20, symbol: 'XAUUSD', price: 2657.90 },
      { time: '14:29:12', side: 'BUY', qty: 0.15, symbol: 'XAUUSD', price: 2657.50 },
      { time: '14:28:01', side: 'SELL', qty: 0.10, symbol: 'XAUUSD', price: 2656.80 },
    ];
    setActiveFills(initialFills);

    const fillInterval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().slice(0, 8);
      const isBuy = Math.random() > 0.48;
      const step = (Math.random() * 0.8 - 0.4);
      const p = +(midPrice + step).toFixed(2);
      const newFill: FillItem = {
        time: timeStr,
        side: isBuy ? 'BUY' : 'SELL',
        qty: +([0.05, 0.10, 0.15, 0.20][Math.floor(Math.random() * 4)]),
        symbol: 'XAUUSD',
        price: p,
      };
      setActiveFills((prev) => [newFill, ...prev.slice(0, 14)]);
    }, 4000);

    return () => clearInterval(fillInterval);
  }, [midPrice]);

  // Generate Candlestick Chart on Canvas
  useEffect(() => {
    const canvas = chartCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    // Mock candle data points
    const candleCount = 48;
    const candles: { o: number; c: number; hi: number; lo: number; v: number }[] = [];
    let curP = midPrice - 18.0;
    for (let i = 0; i < candleCount; i++) {
      const o = curP;
      const delta = (Math.sin(i * 0.35) * 1.8) + (Math.random() - 0.45) * 2.2;
      const c = o + delta;
      const hi = Math.max(o, c) + Math.random() * 1.8;
      const lo = Math.min(o, c) - Math.random() * 1.8;
      candles.push({ o, c, hi, lo, v: Math.random() * 0.8 + 0.2 });
      curP = c;
    }

    const axisW = 65;
    const volH = H * 0.16;
    const chartH = H - volH - 12;

    let minP = Math.min(...candles.map((k) => k.lo));
    let maxP = Math.max(...candles.map((k) => k.hi));
    const pad = (maxP - minP) * 0.08 || 5;
    minP -= pad;
    maxP += pad;

    const plotW = W - axisW;
    const candleW = plotW / candles.length;
    const yp = (v: number) => chartH - ((v - minP) / (maxP - minP)) * chartH;

    // Grid lines
    ctx.strokeStyle = '#1B2538';
    ctx.lineWidth = 1;
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.fillStyle = '#8B97A8';

    for (let g = 0; g <= 4; g++) {
      const yy = (chartH / 4) * g;
      ctx.beginPath();
      ctx.moveTo(0, yy);
      ctx.lineTo(plotW, yy);
      ctx.stroke();

      const pVal = maxP - ((maxP - minP) / 4) * g;
      ctx.fillText(pVal.toFixed(2), plotW + 6, yy + 4);
    }

    // Render Candles
    candles.forEach((k, i) => {
      const cx = i * candleW + candleW / 2;
      const isUp = k.c >= k.o;
      const color = isUp ? '#26D07C' : '#FF4D4D';

      // Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx, yp(k.hi));
      ctx.lineTo(cx, yp(k.lo));
      ctx.stroke();

      // Body
      const bw = Math.max(candleW * 0.65, 2);
      const topY = yp(Math.max(k.o, k.c));
      const botY = yp(Math.min(k.o, k.c));
      ctx.fillStyle = color;
      ctx.fillRect(cx - bw / 2, topY, bw, Math.max(botY - topY, 1.5));

      // Volume histogram
      const vHeight = k.v * volH;
      ctx.fillStyle = isUp ? 'rgba(38, 208, 124, 0.35)' : 'rgba(255, 77, 77, 0.35)';
      ctx.fillRect(cx - bw / 2, chartH + 12 + (volH - vHeight), bw, vHeight);
    });

    // Dashed Gold Last Price Line
    const lastP = candles[candles.length - 1].c;
    const lastY = yp(lastP);

    ctx.strokeStyle = '#F5C451';
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    ctx.moveTo(0, lastY);
    ctx.lineTo(plotW, lastY);
    ctx.stroke();
    ctx.setLineDash([]);

    // Price Label Badge on Axis
    ctx.fillStyle = '#F5C451';
    ctx.fillRect(plotW, lastY - 9, axisW, 18);
    ctx.fillStyle = '#0A0F1C';
    ctx.font = 'bold 10.5px JetBrains Mono, monospace';
    ctx.fillText(lastP.toFixed(2), plotW + 6, lastY + 4);

  }, [midPrice, selectedTf]);

  // Generate P&L Sparkline
  useEffect(() => {
    const canvas = sparkCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const W = rect.width;
    const H = rect.height;
    ctx.clearRect(0, 0, W, H);

    const points = [12, 14, 18, 16, 22, 28, 26, 32, 38, 42, 40, 48, 52, 58, 62, 60, 68, 72, 75];
    const minVal = Math.min(...points);
    const maxVal = Math.max(...points);

    ctx.strokeStyle = '#26D07C';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    points.forEach((val, i) => {
      const px = (i / (points.length - 1)) * W;
      const py = H - ((val - minVal) / (maxVal - minVal)) * (H - 6) - 3;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Area Gradient
    const lastPx = W;
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, 'rgba(38, 208, 124, 0.25)');
    gradient.addColorStop(1, 'rgba(38, 208, 124, 0.0)');
    ctx.lineTo(lastPx, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, []);

  // Compute 8 Asks and 8 Bids for DOM
  const domRows = [];
  for (let i = 8; i >= 1; i--) {
    const askP = midPrice + i * 0.25;
    const sz = Math.floor(45 + i * 18);
    const depth = Math.min(100, Math.floor(25 + i * 9));
    domRows.push({ type: 'ask' as const, price: askP, size: sz, depth });
  }
  for (let i = 1; i <= 8; i++) {
    const bidP = midPrice - i * 0.25;
    const sz = Math.floor(40 + i * 16);
    const depth = Math.min(100, Math.floor(20 + i * 9));
    domRows.push({ type: 'bid' as const, price: bidP, size: sz, depth });
  }

  const handleSelectPrice = (p: number, side: 'BUY' | 'SELL') => {
    setCommandText(`${side} 0.10 XAUUSD @ LMT ${p.toFixed(2)}`);
  };

  return (
    <div className="cockpit-terminal" style={{ width: '100%', minHeight: '760px', display: 'flex', flexDirection: 'column' }}>

      {/* 1. TOP TELEMETRY STATUS BAR */}
      <div
        className="cockpit-t10"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'stretch',
          backgroundColor: 'var(--p2)',
          borderBottom: '1px solid var(--line)',
          minHeight: '34px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.15em' }}>[▣ VELARION COCKPIT]</span>
            <span style={{ color: 'var(--fog)' }}>v2.1</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>SESSION</span>
            <span style={{ color: 'var(--bid)', fontWeight: 700 }}>XAUUSD / LIVE MT5</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>LATENCY</span>
            <span style={{ display: 'flex', gap: '1px', alignItems: 'flex-end', height: '12px' }}>
              <i style={{ width: '3px', height: '40%', background: 'var(--bid)', display: 'block' }} />
              <i style={{ width: '3px', height: '60%', background: 'var(--bid)', display: 'block' }} />
              <i style={{ width: '3px', height: '80%', background: 'var(--bid)', display: 'block' }} />
              <i style={{ width: '3px', height: '100%', background: 'var(--gold)', display: 'block' }} />
              <i style={{ width: '3px', height: '55%', background: 'var(--line)', display: 'block' }} />
            </span>
            <span style={{ color: 'var(--bid)' }}>4ms</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>FEED</span>
            <span style={{ color: '#F8FAFC' }}>JUSTMARKETS / MT5 / COMEX</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderLeft: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>EQUITY</span>
            <span
              style={{
                backgroundColor: 'var(--gold)',
                color: 'var(--navy)',
                padding: '2px 8px',
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              ${equity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderLeft: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>BP</span>
            <span style={{ color: '#F8FAFC', fontWeight: 700 }}>$1.24M</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', borderLeft: '1px solid var(--line)' }}>
            <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{clock}</span>
            <span style={{ color: 'var(--fog)' }}>UTC</span>
          </div>
        </div>
      </div>

      {/* 2. MAIN SPLIT GRID: LEFT DOM SIDEBAR (300px) + RIGHT CHARTS & BLOTTER */}
      <div className="cockpit-main-grid">

        {/* LEFT COLUMN: DEPTH OF MARKET (DOM) ORDER BOOK */}
        <div className="cockpit-dom-pane" style={{ backgroundColor: 'var(--p1)', display: 'flex', flexDirection: 'column' }}>
          <div
            className="cockpit-t10"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 12px',
              borderBottom: '1px solid var(--line)',
            }}
          >
            <span style={{ color: '#F8FAFC', fontWeight: 700, letterSpacing: '0.15em' }}>ORDER BOOK / XAUUSD</span>
            <span style={{ color: 'var(--gold)', fontWeight: 700 }}>DOM</span>
          </div>

          <div
            className="cockpit-t10"
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              padding: '6px 12px',
              borderBottom: '1px solid var(--line)',
              color: 'var(--fog)',
            }}
          >
            <span>SIZE</span>
            <span style={{ textAlign: 'center' }}>PRICE</span>
            <span style={{ textAlign: 'right' }}>DEPTH</span>
          </div>

          {/* DOM Ladder Rows */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {/* Asks (Top, Red) */}
            {domRows.filter((r) => r.type === 'ask').map((r, idx) => (
              <div
                key={`ask-${idx}`}
                onClick={() => handleSelectPrice(r.price, 'SELL')}
                className="cockpit-t12 cockpit-row-focus"
                tabIndex={0}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  height: '24px',
                  alignItems: 'center',
                  padding: '0 12px',
                  position: 'relative',
                  borderBottom: '1px solid #11182B',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: `${r.depth}%`,
                    backgroundColor: 'rgba(255, 77, 77, 0.12)',
                  }}
                />
                <span style={{ position: 'relative', color: '#CDD6E4' }}>{r.size}</span>
                <span style={{ position: 'relative', textAlign: 'center', color: 'var(--ask)', fontWeight: 700 }}>
                  {r.price.toFixed(2)}
                </span>
                <span className="cockpit-t10" style={{ position: 'relative', textAlign: 'right', color: 'var(--fog)' }}>
                  {r.depth}%
                </span>
              </div>
            ))}

            {/* SPREAD BAR */}
            <div
              className="cockpit-t12"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                height: '24px',
                alignItems: 'center',
                padding: '0 12px',
                backgroundColor: 'rgba(245, 196, 81, 0.14)',
                borderTop: '1px solid var(--gold)',
                borderBottom: '1px solid var(--gold)',
              }}
            >
              <span className="cockpit-t10" style={{ color: 'var(--gold)', fontWeight: 700 }}>SPREAD</span>
              <span style={{ textAlign: 'center', color: 'var(--gold)', fontWeight: 700 }}>{midPrice.toFixed(2)}</span>
              <span className="cockpit-t10" style={{ textAlign: 'right', color: 'var(--gold)' }}>0.25</span>
            </div>

            {/* Bids (Bottom, Green) */}
            {domRows.filter((r) => r.type === 'bid').map((r, idx) => (
              <div
                key={`bid-${idx}`}
                onClick={() => handleSelectPrice(r.price, 'BUY')}
                className="cockpit-t12 cockpit-row-focus"
                tabIndex={0}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  height: '24px',
                  alignItems: 'center',
                  padding: '0 12px',
                  position: 'relative',
                  borderBottom: '1px solid #11182B',
                  cursor: 'pointer',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: `${r.depth}%`,
                    backgroundColor: 'rgba(38, 208, 124, 0.12)',
                  }}
                />
                <span style={{ position: 'relative', color: '#CDD6E4' }}>{r.size}</span>
                <span style={{ position: 'relative', textAlign: 'center', color: 'var(--bid)', fontWeight: 700 }}>
                  {r.price.toFixed(2)}
                </span>
                <span className="cockpit-t10" style={{ position: 'relative', textAlign: 'right', color: 'var(--fog)' }}>
                  {r.depth}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: 2-TIER STACK (UPPER CHART + LOWER BLOTTER & TAPE) */}
        <div className="cockpit-chart-pane" style={{ display: 'grid', gridTemplateRows: '1.45fr 1fr', gap: '1px', backgroundColor: '#000000' }}>

          {/* UPPER SECTION: CANDLESTICK & VOLUME CHART */}
          <div style={{ backgroundColor: 'var(--p1)', display: 'flex', flexDirection: 'column' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '8px 14px',
                borderBottom: '1px solid var(--line)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span className="cockpit-t16" style={{ fontWeight: 700, color: '#F8FAFC' }}>XAUUSD</span>
                <span className="cockpit-t16" style={{ fontWeight: 700, color: 'var(--bid)' }}>
                  {midPrice.toFixed(2)}
                </span>
                <span className="cockpit-t10" style={{ color: 'var(--bid)' }}>
                  +14.20 (+0.54%)
                </span>
              </div>

              {/* Timeframe Buttons */}
              <div style={{ display: 'flex', border: '1px solid var(--line)' }} className="cockpit-t10">
                {(['1m', '5m', '15m', '1H', '4H', '1D'] as const).map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setSelectedTf(tf)}
                    style={{
                      padding: '4px 8px',
                      cursor: 'pointer',
                      border: 'none',
                      backgroundColor: selectedTf === tf ? 'var(--gold)' : 'transparent',
                      color: selectedTf === tf ? 'var(--navy)' : 'var(--fog)',
                      fontWeight: selectedTf === tf ? 700 : 500,
                      borderLeft: tf !== '1m' ? '1px solid var(--line)' : 'none',
                    }}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* Canvas Candlestick & Volume Chart */}
            <div style={{ flex: 1, position: 'relative', minHeight: '320px' }}>
              <canvas
                ref={chartCanvasRef}
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
              />
            </div>
          </div>

          {/* LOWER SECTION: POSITIONS BLOTTER (1.3fr) + P&L TAPE & FILLS (1fr) */}
          <div className="cockpit-lower-grid">

            {/* POSITIONS BLOTTER */}
            <div style={{ backgroundColor: 'var(--p1)', display: 'flex', flexDirection: 'column' }}>
              <div
                className="cockpit-t10"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span style={{ color: '#F8FAFC', fontWeight: 700, letterSpacing: '0.15em' }}>POSITIONS</span>
                <span>{positions.length} OPEN</span>
              </div>

              <div
                className="cockpit-t10"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '50px 42px 42px 1fr 1fr 1fr 52px',
                  padding: '6px 12px',
                  borderBottom: '1px solid var(--line)',
                  gap: '4px',
                  color: 'var(--fog)',
                }}
              >
                <span>SYM</span>
                <span>SIDE</span>
                <span style={{ textAlign: 'right' }}>QTY</span>
                <span style={{ textAlign: 'right' }}>AVG</span>
                <span style={{ textAlign: 'right' }}>LAST</span>
                <span style={{ textAlign: 'right' }}>uPnL</span>
                <span style={{ textAlign: 'right' }}>%CHG</span>
              </div>

              {/* Blotter Rows */}
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {positions.map((p, i) => (
                  <div
                    key={p.ticket}
                    onClick={() => setFocusedRow(i)}
                    className="cockpit-t12 cockpit-row-focus"
                    tabIndex={0}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '50px 42px 42px 1fr 1fr 1fr 52px',
                      gap: '4px',
                      alignItems: 'center',
                      padding: '0 12px',
                      height: '30px',
                      borderBottom: '1px solid #11182B',
                      cursor: 'pointer',
                      outline: focusedRow === i ? '1px solid var(--gold)' : 'none',
                      outlineOffset: '-1px',
                    }}
                  >
                    <span style={{ color: '#F8FAFC', fontWeight: 700 }}>{p.symbol}</span>
                    <span className="cockpit-t10" style={{ color: p.side === 'LONG' ? 'var(--bid)' : 'var(--ask)', fontWeight: 700 }}>
                      {p.side}
                    </span>
                    <span style={{ textAlign: 'right' }}>{p.volume.toFixed(2)}</span>
                    <span className="cockpit-t10" style={{ textAlign: 'right', color: '#CDD6E4' }}>
                      {p.openPrice.toFixed(2)}
                    </span>
                    <span style={{ textAlign: 'right', color: '#F8FAFC' }}>
                      {p.currentPrice.toFixed(2)}
                    </span>
                    <span
                      className="cockpit-t10"
                      style={{
                        textAlign: 'right',
                        fontWeight: 700,
                        color: p.profit >= 0 ? 'var(--bid)' : 'var(--ask)',
                      }}
                    >
                      {p.profit >= 0 ? '+' : ''}${p.profit.toFixed(0)}
                    </span>
                    <span
                      className="cockpit-t10"
                      style={{
                        textAlign: 'right',
                        color: p.profitPercent >= 0 ? 'var(--bid)' : 'var(--ask)',
                      }}
                    >
                      {p.profitPercent >= 0 ? '+' : ''}{p.profitPercent.toFixed(2)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* P&L TAPE & FILLS STREAM */}
            <div style={{ backgroundColor: 'var(--p1)', display: 'flex', flexDirection: 'column' }}>
              <div
                className="cockpit-t10"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <span style={{ color: '#F8FAFC', fontWeight: 700, letterSpacing: '0.15em' }}>P&L TAPE</span>
                <span>XAUUSD SESSION</span>
              </div>

              {/* Net P&L Summary */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  padding: '8px 12px',
                  borderBottom: '1px solid var(--line)',
                }}
              >
                <div>
                  <div className="cockpit-t10" style={{ color: 'var(--fog)' }}>NET P&L</div>
                  <div className="cockpit-t16" style={{ fontWeight: 700, color: netPnl >= 0 ? 'var(--bid)' : 'var(--ask)' }}>
                    {netPnl >= 0 ? '+' : '-'}${Math.abs(netPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="cockpit-t10" style={{ color: 'var(--fog)' }}>REALIZED</div>
                  <div className="cockpit-t12" style={{ color: 'var(--bid)', fontWeight: 600 }}>
                    +${realizedPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Sparkline Canvas */}
              <div style={{ padding: '6px 12px', borderBottom: '1px solid var(--line)' }}>
                <canvas ref={sparkCanvasRef} style={{ width: '100%', height: '36px', display: 'block' }} />
              </div>

              {/* Fills Stream Header & List */}
              <div className="cockpit-t10" style={{ padding: '4px 12px', color: 'var(--fog)', borderBottom: '1px solid #11182B' }}>
                RECENT FILLS
              </div>

              <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }} className="cockpit-t10">
                {activeFills.map((f, idx) => (
                  <div
                    key={`fill-${idx}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '3px 0',
                      borderBottom: '1px solid #11182B',
                    }}
                  >
                    <span style={{ color: 'var(--fog)' }}>{f.time}</span>
                    <span style={{ color: f.side === 'BUY' ? 'var(--bid)' : 'var(--ask)', fontWeight: 600 }}>
                      {f.side} {f.qty} {f.symbol}
                    </span>
                    <span style={{ color: '#CDD6E4' }}>{f.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 3. BOTTOM HOTKEY COMMAND BAR */}
      <div
        className="cockpit-t12"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '8px 14px',
          backgroundColor: 'var(--p2)',
          borderTop: '1px solid var(--line)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: 'var(--gold)', fontWeight: 700 }}>&gt;</span>
          <span style={{ color: '#F8FAFC' }}>{commandText}</span>
          <span className="cockpit-cursor" />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }} className="cockpit-t10">
          <span><strong style={{ color: 'var(--gold)' }}>[F1]</strong> <span style={{ color: 'var(--bid)' }}>BUY</span></span>
          <span><strong style={{ color: 'var(--gold)' }}>[F2]</strong> <span style={{ color: 'var(--ask)' }}>SELL</span></span>
          <span><strong style={{ color: 'var(--gold)' }}>[F3]</strong> FLATTEN</span>
          <span><strong style={{ color: 'var(--gold)' }}>[ESC]</strong> CANCEL</span>
        </div>
      </div>

    </div>
  );
}

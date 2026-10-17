'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

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

interface CandlePoint {
  o: number;
  c: number;
  hi: number;
  lo: number;
  v: number;
}

export default function CockpitTerminal() {
  // Telemetry & Market States
  const [clock, setClock] = useState('00:00:00');
  const [selectedTf, setSelectedTf] = useState<'1m' | '5m' | '15m' | '1H' | '4H' | '1D'>('5m');
  const [symbol] = useState('XAUUSD');
  const [midPrice, setMidPrice] = useState<number | null>(null);
  const [bidPrice, setBidPrice] = useState<number | null>(null);
  const [askPrice, setAskPrice] = useState<number | null>(null);
  const [netPnl, setNetPnl] = useState<number>(0);
  const [realizedPnl, setRealizedPnl] = useState<number>(0);
  const [equity, setEquity] = useState<number>(0);
  const [commandText, setCommandText] = useState('STANDBY: MT5 DISCONNECTED');
  const [activeFills, setActiveFills] = useState<FillItem[]>([]);
  const [positions, setPositions] = useState<PositionItem[]>([]);
  const [candles, setCandles] = useState<CandlePoint[]>([]);
  const [isBridgeConnected, setIsBridgeConnected] = useState<boolean>(false);
  const [pnlHistory, setPnlHistory] = useState<number[]>([]);
  const [focusedRow, setFocusedRow] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

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

  // Fetch real quote
  const syncQuote = useCallback(async () => {
    try {
      const res = await fetch('/api/market/quote', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.isConnected && typeof data.price === 'number') {
          setMidPrice(data.price);
          setBidPrice(data.bid ?? null);
          setAskPrice(data.ask ?? null);
          setCommandText(`BUY 0.10 XAUUSD @ LMT ${data.price.toFixed(2)}`);
        } else {
          setMidPrice(null);
          setBidPrice(null);
          setAskPrice(null);
          setCommandText('STANDBY: MT5 DISCONNECTED');
        }
      }
    } catch {
      setMidPrice(null);
      setBidPrice(null);
      setAskPrice(null);
      setCommandText('STANDBY: MT5 DISCONNECTED');
    }
  }, []);

  // Fetch real positions, account state, and fills from live broker route
  const syncLiveState = useCallback(async () => {
    try {
      const res = await fetch('/api/trades/live', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const connected = Boolean(data.isLiveBrokerConnection && data.status === 'ONLINE');
        setIsBridgeConnected(connected);

        if (connected) {
          if (data.account) {
            setEquity(Number(data.account.equity || 0));
            setNetPnl(Number(data.account.openPnl || 0));
            setRealizedPnl(Number(data.account.totalProfit || 0));
          }

          if (Array.isArray(data.positions)) {
            const mapped: PositionItem[] = data.positions.map((p: any) => ({
              ticket: p.ticket,
              symbol: p.symbol || 'XAUUSD',
              side: p.type === 'BUY' ? 'LONG' : 'SHORT',
              volume: p.lots,
              openPrice: p.entryPrice,
              currentPrice: p.currentPrice,
              profit: p.pnl,
              profitPercent: p.riskExposurePct || 0,
              stopLoss: p.stopLoss,
              takeProfit: p.takeProfit,
            }));
            setPositions(mapped);
          } else {
            setPositions([]);
          }

          if (Array.isArray(data.recentTrades) && data.recentTrades.length > 0) {
            const fills: FillItem[] = data.recentTrades.slice(0, 15).map((t: any) => ({
              time: (t.closeTime || t.openTime || '').slice(11, 19) || '00:00:00',
              side: t.type === 'BUY' ? 'BUY' : 'SELL',
              qty: t.lots,
              symbol: t.symbol || 'XAUUSD',
              price: t.exitPrice || t.entryPrice || 0,
            }));
            setActiveFills(fills);

            const runningPnls = data.recentTrades.map((t: any) => Number(t.pnl || 0));
            setPnlHistory(runningPnls);
          } else {
            setActiveFills([]);
            setPnlHistory([]);
          }
        } else {
          setIsBridgeConnected(false);
          setEquity(0);
          setNetPnl(0);
          setRealizedPnl(0);
          setPositions([]);
          setActiveFills([]);
          setPnlHistory([]);
        }
      } else {
        setIsBridgeConnected(false);
        setPositions([]);
        setActiveFills([]);
        setPnlHistory([]);
      }
    } catch {
      setIsBridgeConnected(false);
      setPositions([]);
      setActiveFills([]);
      setPnlHistory([]);
    }
  }, []);

  // Fetch real candles
  const syncCandles = useCallback(async () => {
    try {
      const res = await fetch(`/api/candles/history?timeframe=${selectedTf}&count=48`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.is_connected && Array.isArray(data.candles) && data.candles.length > 0) {
          const parsed: CandlePoint[] = data.candles.map((c: any) => ({
            o: Number(c.open || c.o || 0),
            hi: Number(c.high || c.hi || 0),
            lo: Number(c.low || c.lo || 0),
            c: Number(c.close || c.c || 0),
            v: Number(c.volume || c.v || 0.5),
          }));
          setCandles(parsed);
        } else {
          setCandles([]);
        }
      } else {
        setCandles([]);
      }
    } catch {
      setCandles([]);
    }
  }, [selectedTf]);

  const syncAll = useCallback(async () => {
    setIsSyncing(true);
    await Promise.all([syncQuote(), syncLiveState(), syncCandles()]);
    setIsSyncing(false);
  }, [syncQuote, syncLiveState, syncCandles]);

  useEffect(() => {
    syncAll();
    const interval = setInterval(() => {
      syncQuote();
      syncLiveState();
    }, 3000);
    return () => clearInterval(interval);
  }, [syncAll, syncQuote, syncLiveState]);

  useEffect(() => {
    syncCandles();
  }, [syncCandles, selectedTf]);

  // Render Candlestick Chart on Canvas
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

    // Fail closed: if MT5 bridge is disconnected or candles are empty, draw honest calm overlay
    if (!isBridgeConnected || candles.length === 0) {
      ctx.fillStyle = '#0B111E';
      ctx.fillRect(0, 0, W, H);

      // Subtle background grid
      ctx.strokeStyle = '#151F32';
      ctx.lineWidth = 1;
      for (let x = 0; x < W; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Calm message box
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      const boxW = Math.min(380, W - 40);
      const boxH = 90;
      const boxX = (W - boxW) / 2;
      const boxY = (H - boxH) / 2;
      ctx.fillRect(boxX, boxY, boxW, boxH);
      ctx.strokeRect(boxX, boxY, boxW, boxH);

      ctx.fillStyle = '#F5C451';
      ctx.font = 'bold 12px JetBrains Mono, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('MT5 BRIDGE DISCONNECTED', W / 2, boxY + 32);

      ctx.fillStyle = '#94A3B8';
      ctx.font = '11px Inter, sans-serif';
      ctx.fillText('Live Candlestick Feed Unavailable', W / 2, boxY + 54);
      ctx.fillText(`Timeframe: ${selectedTf} | Instrument: ${symbol}`, W / 2, boxY + 72);
      ctx.textAlign = 'left';
      return;
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
      const vHeight = Math.min(volH, k.v * volH);
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

  }, [isBridgeConnected, candles, selectedTf, symbol]);

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

    if (pnlHistory.length < 2) {
      // Draw calm baseline
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(0, H / 2);
      ctx.lineTo(W, H / 2);
      ctx.stroke();
      ctx.setLineDash([]);
      return;
    }

    const minVal = Math.min(...pnlHistory);
    const maxVal = Math.max(...pnlHistory);
    const range = maxVal - minVal || 1;

    ctx.strokeStyle = pnlHistory[pnlHistory.length - 1] >= 0 ? '#26D07C' : '#FF4D4D';
    ctx.lineWidth = 1.5;
    ctx.beginPath();

    pnlHistory.forEach((val, i) => {
      const px = (i / (pnlHistory.length - 1)) * W;
      const py = H - ((val - minVal) / range) * (H - 8) - 4;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    });
    ctx.stroke();

    // Area Gradient
    const lastPx = W;
    const gradient = ctx.createLinearGradient(0, 0, 0, H);
    gradient.addColorStop(0, pnlHistory[pnlHistory.length - 1] >= 0 ? 'rgba(38, 208, 124, 0.2)' : 'rgba(255, 77, 77, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.lineTo(lastPx, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fillStyle = gradient;
    ctx.fill();
  }, [pnlHistory]);

  // Compute 8 Asks and 8 Bids for DOM when midPrice is available
  const domRows = [];
  if (midPrice !== null && isBridgeConnected) {
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
            <span style={{ color: 'var(--gold)', fontWeight: 700, letterSpacing: '0.15em' }}>[VELARION COCKPIT]</span>
            <span style={{ color: 'var(--fog)' }}>v2.1</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>SESSION</span>
            <span style={{ color: isBridgeConnected ? 'var(--bid)' : '#EF4444', fontWeight: 700 }}>
              {isBridgeConnected ? 'XAUUSD / LIVE MT5' : 'DISCONNECTED'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>LATENCY</span>
            <span style={{ color: isBridgeConnected ? 'var(--bid)' : 'var(--fog)' }}>
              {isBridgeConnected ? '12ms' : 'OFFLINE'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderRight: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>FEED</span>
            <span style={{ color: '#F8FAFC' }}>
              {isBridgeConnected ? 'JUSTMARKETS / MT5 / COMEX' : 'JUSTMARKETS / MT5 (OFFLINE)'}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'stretch', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 12px', borderLeft: '1px solid var(--line)' }}>
            <span style={{ color: 'var(--fog)' }}>EQUITY</span>
            <span
              style={{
                backgroundColor: isBridgeConnected ? 'var(--gold)' : '#334155',
                color: isBridgeConnected ? 'var(--navy)' : '#94A3B8',
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
            <span style={{ color: '#F8FAFC', fontWeight: 700 }}>
              {isBridgeConnected ? `$${(equity * 100).toLocaleString('en-US', { minimumFractionDigits: 0 })}` : '$0.00'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0 12px', borderLeft: '1px solid var(--line)' }}>
            <span style={{ color: '#F8FAFC', fontWeight: 600 }}>{clock}</span>
            <span style={{ color: 'var(--fog)' }}>UTC</span>
          </div>
        </div>
      </div>

      {/* 1B. OFFLINE BRIDGE ALERT BANNER */}
      {!isBridgeConnected && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderBottom: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '8px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FCA5A5' }}>
            <span style={{ fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>[OFFLINE]</span>
            <span>MT5 Bridge is disconnected. Live market quotes, depth of market, and automated execution are suspended.</span>
          </div>
          <button
            onClick={syncAll}
            disabled={isSyncing}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #FCA5A5',
              color: '#FCA5A5',
              padding: '2px 10px',
              fontSize: '11px',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              fontWeight: 600,
            }}
          >
            {isSyncing ? 'Syncing...' : 'Retry Connection'}
          </button>
        </div>
      )}

      {/* 2. MAIN SPLIT GRID: LEFT DOM SIDEBAR + RIGHT CHARTS & BLOTTER */}
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

          {/* DOM Ladder Rows or Disconnected State */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {!isBridgeConnected || midPrice === null ? (
              <div style={{ padding: '36px 16px', textAlign: 'center', color: 'var(--fog)' }}>
                <div style={{ color: 'var(--gold)', fontWeight: 700, marginBottom: '6px' }}>DOM FEED OFFLINE</div>
                <div style={{ fontSize: '11px', lineHeight: 1.5 }}>
                  Depth of Market requires an active JustMarkets MT5 bridge connection.
                </div>
              </div>
            ) : (
              <>
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
                  <span className="cockpit-t10" style={{ textAlign: 'right', color: 'var(--gold)' }}>
                    {askPrice && bidPrice ? ((askPrice - bidPrice) * 10).toFixed(1) : '2.6'} pips
                  </span>
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
              </>
            )}
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
                <span className="cockpit-t16" style={{ fontWeight: 700, color: isBridgeConnected ? 'var(--bid)' : 'var(--fog)' }}>
                  {midPrice !== null ? midPrice.toFixed(2) : '—'}
                </span>
                <span className="cockpit-t10" style={{ color: isBridgeConnected ? 'var(--bid)' : 'var(--fog)' }}>
                  {isBridgeConnected ? '+0.00' : 'Disconnected'}
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

          {/* LOWER SECTION: POSITIONS BLOTTER + P&L TAPE & FILLS */}
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
                {positions.length === 0 ? (
                  <div style={{ padding: '24px 12px', textAlign: 'center', color: 'var(--fog)', fontSize: '11px' }}>
                    {isBridgeConnected ? 'No open positions on MT5.' : 'Positions unavailable: MT5 bridge is offline.'}
                  </div>
                ) : (
                  positions.map((p, i) => (
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
                  ))
                )}
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
                  <div className="cockpit-t12" style={{ color: realizedPnl >= 0 ? 'var(--bid)' : 'var(--ask)', fontWeight: 600 }}>
                    {realizedPnl >= 0 ? '+' : '-'}${Math.abs(realizedPnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}
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
                {activeFills.length === 0 ? (
                  <div style={{ padding: '16px 0', textAlign: 'center', color: 'var(--fog)', fontSize: '11px' }}>
                    {isBridgeConnected ? 'No recent fills recorded.' : 'Fills tape offline.'}
                  </div>
                ) : (
                  activeFills.map((f, idx) => (
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
                  ))
                )}
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

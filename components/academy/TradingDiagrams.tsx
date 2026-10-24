'use client';

import React from 'react';

// ============================================================================
// 1. SMC LIQUIDITY SWEEP & STOP HUNT DIAGRAM
// ============================================================================
export function SmcLiquiditySweepDiagram() {
  return (
    <div style={{ width: '100%', background: '#090D16', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px 16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
            SMC BLUEPRINT
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
            Liquidity Sweep &bull; Stop Hunt &bull; Market Structure Shift (MSS)
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
          XAUUSD 15M EXECUTION
        </span>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox="0 0 860 380"
          style={{ width: '100%', minWidth: '640px', height: 'auto', display: 'block', background: '#090D16' }}
          role="img"
          aria-label="SMC Liquidity Sweep and Market Structure Shift Diagram"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid-pattern-1" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2,2" />
            </pattern>
            {/* Sweep Zone Gradient */}
            <linearGradient id="sweep-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.02" />
            </linearGradient>
            {/* MSS Sell Zone Gradient */}
            <linearGradient id="mss-sell-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#F43F5E" stopOpacity="0.02" />
            </linearGradient>
            {/* Arrow Marker */}
            <marker id="arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#F59E0B" />
            </marker>
            <marker id="arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 8 5 L 0 9 z" fill="#F43F5E" />
            </marker>
          </defs>

          {/* Background Grid */}
          <rect width="860" height="380" fill="url(#grid-pattern-1)" />

          {/* Equal Highs Line (Resistance) */}
          <line x1="80" y1="120" x2="520" y2="120" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="6,4" />
          <text x="90" y="112" fill="#F59E0B" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
            EQUAL HIGHS (EQH) RESISTANCE &bull; 2,648.50
          </text>

          {/* Retail Liquidity Pool Callout Box */}
          <rect x="220" y="70" width="230" height="32" rx="4" fill="url(#sweep-gradient)" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3,3" />
          <text x="230" y="90" fill="#FDE68A" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="600">
            RETAIL BUY-STOP LIQUIDITY POOL
          </text>

          {/* CANDLESTICKS SEQUENCE */}
          {/* Candle 1 (Bullish into EQH) */}
          <line x1="140" y1="110" x2="140" y2="210" stroke="#10B981" strokeWidth="1.5" />
          <rect x="133" y="130" width="14" height="60" fill="#10B981" rx="1" />

          {/* Candle 2 (Bearish pullback) */}
          <line x1="180" y1="140" x2="180" y2="230" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="173" y="150" width="14" height="65" fill="#F43F5E" rx="1" />

          {/* Candle 3 (Second touch of EQH) */}
          <line x1="220" y1="115" x2="220" y2="200" stroke="#10B981" strokeWidth="1.5" />
          <rect x="213" y="125" width="14" height="55" fill="#10B981" rx="1" />

          {/* Candle 4 (Bearish consolidation) */}
          <line x1="260" y1="150" x2="260" y2="220" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="253" y="160" width="14" height="40" fill="#F43F5E" rx="1" />

          {/* Candle 5: THE INSTITUTIONAL SWEEP WICK */}
          {/* Long wick penetrating up to y=45 (2,654.20) */}
          <line x1="320" y1="45" x2="320" y2="180" stroke="#F59E0B" strokeWidth="2.5" />
          <rect x="312" y="125" width="16" height="30" fill="#F43F5E" rx="1" stroke="#F59E0B" strokeWidth="1" />

          {/* Annotation for Sweep Wick */}
          <circle cx="320" cy="45" r="4" fill="#F59E0B" />
          <line x1="330" y1="45" x2="440" y2="45" stroke="#F59E0B" strokeWidth="1" markerEnd="url(#arrow-gold)" />
          <rect x="450" y="32" width="220" height="26" rx="4" fill="#1E293B" stroke="#F59E0B" strokeWidth="1" />
          <text x="460" y="49" fill="#FDE68A" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
            SWEEP WICK &bull; STOPS TRIGGERED
          </text>

          {/* Candle 6: Aggressive Displacement Downward (Displacement 1) */}
          <line x1="360" y1="140" x2="360" y2="250" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="352" y="150" width="16" height="90" fill="#F43F5E" rx="1" />

          {/* Candle 7: Displacement 2 (Breaks Higher Low) */}
          <line x1="400" y1="230" x2="400" y2="310" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="392" y="240" width="16" height="60" fill="#F43F5E" rx="1" />

          {/* Previous Higher Low Support Line (MSS Level) */}
          <line x1="160" y1="215" x2="480" y2="215" stroke="#94A3B8" strokeWidth="1" strokeDasharray="4,4" />
          <text x="170" y="235" fill="#94A3B8" fontSize="10" fontFamily="var(--font-mono, monospace)">
            RECENT HIGHER LOW &bull; 2,639.80
          </text>

          {/* MSS Break Marker */}
          <rect x="420" y="202" width="165" height="24" rx="4" fill="rgba(244, 63, 94, 0.15)" stroke="#F43F5E" strokeWidth="1" />
          <text x="430" y="218" fill="#F87171" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
            MSS CONFIRMED &darr;
          </text>

          {/* Pullback into FVG for Entry */}
          {/* Candle 8 (small retracement) */}
          <line x1="460" y1="190" x2="460" y2="280" stroke="#10B981" strokeWidth="1.5" />
          <rect x="453" y="200" width="14" height="60" fill="#10B981" rx="1" />

          {/* Candle 9 (Touch of FVG / Entry zone) */}
          <line x1="500" y1="170" x2="500" y2="240" stroke="#10B981" strokeWidth="1.5" />
          <rect x="493" y="180" width="14" height="40" fill="#10B981" rx="1" />

          {/* Optimal Trade Entry Zone (FVG Retest) */}
          <rect x="440" y="165" width="120" height="35" rx="3" fill="url(#mss-sell-gradient)" stroke="#F43F5E" strokeWidth="1" strokeDasharray="3,3" />
          <circle cx="500" cy="175" r="5" fill="#F43F5E" />
          <text x="570" y="180" fill="#F43F5E" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="800">
            &larr; LIMIT SHORT ENTRY @ 2,644.00
          </text>
          <text x="570" y="196" fill="#94A3B8" fontSize="10" fontFamily="var(--font-mono, monospace)">
            Stop-Loss: 2,649.50 (+55 pips above sweep)
          </text>

          {/* Candle 10 & 11 (Downward Trend Expansion) */}
          <line x1="540" y1="190" x2="540" y2="330" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="532" y="210" width="16" height="100" fill="#F43F5E" rx="1" />

          <line x1="580" y1="300" x2="580" y2="360" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="572" y="310" width="16" height="45" fill="#F43F5E" rx="1" />

          {/* Take Profit Target */}
          <line x1="490" y1="350" x2="720" y2="350" stroke="#10B981" strokeWidth="1.5" strokeDasharray="5,4" />
          <text x="600" y="342" fill="#10B981" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
            TAKE PROFIT (TP) &bull; 2,624.00 (+200 PIPS)
          </text>
        </svg>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: '#94A3B8', borderTop: '1px solid #1E293B', paddingTop: '10px' }}>
        <div><strong style={{ color: '#FDE68A' }}>Step 1:</strong> Equal Highs induce retail breakout buyers and store sell stops.</div>
        <div><strong style={{ color: '#FDE68A' }}>Step 2:</strong> Sweep wick fills institutional sell liquidity.</div>
        <div><strong style={{ color: '#FDE68A' }}>Step 3:</strong> MSS displacement validates institutional order flow.</div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. FAIR VALUE GAP (FVG) & ORDER BLOCK RETEST DIAGRAM
// ============================================================================
export function FvgOrderBlockDiagram() {
  return (
    <div style={{ width: '100%', background: '#090D16', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px 16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
            IMBALANCE ANATOMY
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
            3-Candle Fair Value Gap (FVG) &bull; Bullish Order Block (OB)
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
          XAUUSD 5M / 15M
        </span>
      </div>

      <div style={{ width: '100%', overflowX: 'auto' }}>
        <svg
          viewBox="0 0 860 380"
          style={{ width: '100%', minWidth: '640px', height: 'auto', display: 'block', background: '#090D16' }}
          role="img"
          aria-label="Fair Value Gap and Order Block Retest Diagram"
        >
          <defs>
            <pattern id="grid-pattern-2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1E293B" strokeWidth="0.8" strokeDasharray="2,2" />
            </pattern>
            <linearGradient id="fvg-zone-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.08" />
            </linearGradient>
            <linearGradient id="ob-zone-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
            </linearGradient>
          </defs>

          <rect width="860" height="380" fill="url(#grid-pattern-2)" />

          {/* Bullish Order Block (Preceding Bearish Candle before impulsive expansion) */}
          {/* Order Block Body at x=100 */}
          <line x1="110" y1="210" x2="110" y2="300" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="100" y="230" width="20" height="50" fill="#F43F5E" rx="1" />
          <text x="75" y="325" fill="#F43F5E" fontSize="10" fontFamily="var(--font-mono, monospace)">
            Candle 0 (OB)
          </text>

          {/* Shaded Bullish Order Block Zone Extrusion */}
          <rect x="100" y="230" width="380" height="50" fill="url(#ob-zone-gradient)" stroke="#10B981" strokeWidth="1" strokeDasharray="4,3" />
          <text x="130" y="260" fill="#A7F3D0" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
            BULLISH ORDER BLOCK (OB) &bull; 2,632.00 - 2,635.00
          </text>

          {/* CANDLE 1 (First leg of impulse) */}
          <line x1="180" y1="180" x2="180" y2="270" stroke="#10B981" strokeWidth="1.5" />
          <rect x="170" y="195" width="20" height="60" fill="#10B981" rx="1" />
          <text x="160" y="295" fill="#10B981" fontSize="10" fontFamily="var(--font-mono, monospace)">
            Candle 1
          </text>

          {/* Candle 1 High Line (Lower bound of FVG) */}
          <line x1="180" y1="180" x2="480" y2="180" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4,4" />
          <circle cx="180" cy="180" r="3" fill="#F59E0B" />
          <text x="210" y="194" fill="#FDE68A" fontSize="10" fontFamily="var(--font-mono, monospace)">
            CANDLE 1 HIGH: 2,641.20
          </text>

          {/* CANDLE 2: Massive Displacement Body (The Imbalance Engine) */}
          <line x1="250" y1="90" x2="250" y2="220" stroke="#10B981" strokeWidth="1.8" />
          <rect x="238" y="105" width="24" height="100" fill="#10B981" rx="1" />
          <text x="230" y="80" fill="#10B981" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
            Candle 2 (Impulse)
          </text>

          {/* CANDLE 3: Follow-through expansion */}
          <line x1="320" y1="60" x2="320" y2="150" stroke="#10B981" strokeWidth="1.5" />
          <rect x="310" y="70" width="20" height="60" fill="#10B981" rx="1" />
          <text x="300" y="50" fill="#10B981" fontSize="10" fontFamily="var(--font-mono, monospace)">
            Candle 3
          </text>

          {/* Candle 3 Low Line (Upper bound of FVG) */}
          <line x1="320" y1="150" x2="480" y2="150" stroke="#F59E0B" strokeWidth="1.2" strokeDasharray="4,4" />
          <circle cx="320" cy="150" r="3" fill="#F59E0B" />
          <text x="340" y="142" fill="#FDE68A" fontSize="10" fontFamily="var(--font-mono, monospace)">
            CANDLE 3 LOW: 2,646.80
          </text>

          {/* FAIR VALUE GAP (FVG) SHADED AREA */}
          <rect x="180" y="150" width="280" height="30" fill="url(#fvg-zone-gradient)" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,2" />
          <text x="370" y="170" fill="#F59E0B" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="800">
            FAIR VALUE GAP (56 PIPS)
          </text>

          {/* RETEST PHASE: Price returns to mitigate FVG / OB */}
          {/* Candle 4 (Pullback) */}
          <line x1="380" y1="75" x2="380" y2="160" stroke="#F43F5E" strokeWidth="1.5" />
          <rect x="372" y="85" width="16" height="65" fill="#F43F5E" rx="1" />

          {/* Candle 5: Wicks precisely into FVG (The Institutional Entry Point) */}
          <line x1="430" y1="110" x2="430" y2="175" stroke="#10B981" strokeWidth="1.8" />
          <rect x="422" y="115" width="16" height="40" fill="#10B981" rx="1" />
          <circle cx="430" cy="175" r="5" fill="#10B981" stroke="#F8FAFC" strokeWidth="1.5" />

          {/* Entry Callout */}
          <line x1="430" y1="175" x2="520" y2="210" stroke="#10B981" strokeWidth="1" />
          <rect x="525" y="195" width="240" height="48" rx="4" fill="#0F172A" stroke="#10B981" strokeWidth="1" />
          <text x="535" y="215" fill="#10B981" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="800">
            LIMIT BUY EXECUTED @ 2,642.50
          </text>
          <text x="535" y="233" fill="#94A3B8" fontSize="10" fontFamily="var(--font-mono, monospace)">
            SL: 2,631.50 (Below OB) &bull; R:R 1:3.2
          </text>

          {/* Candle 6 & 7 (Expansive Bullish Continuation) */}
          <line x1="480" y1="80" x2="480" y2="150" stroke="#10B981" strokeWidth="1.5" />
          <rect x="472" y="90" width="16" height="50" fill="#10B981" rx="1" />

          <line x1="530" y1="40" x2="530" y2="120" stroke="#10B981" strokeWidth="2" />
          <rect x="522" y="45" width="16" height="65" fill="#10B981" rx="1" />

          {/* Target Take Profit Line */}
          <line x1="480" y1="40" x2="780" y2="40" stroke="#10B981" strokeWidth="1.5" strokeDasharray="6,4" />
          <text x="560" y="32" fill="#10B981" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
            TAKE PROFIT TARGET &bull; 2,670.00 (+275 PIPS)
          </text>
        </svg>
      </div>

      <div style={{ marginTop: '12px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '11px', color: '#94A3B8', borderTop: '1px solid #1E293B', paddingTop: '10px' }}>
        <div><strong style={{ color: '#10B981' }}>Core Rule:</strong> An FVG represents inefficient one-sided price delivery that algorithms systematically rebalance.</div>
        <div><strong style={{ color: '#10B981' }}>Entry Timing:</strong> Wait for Candle 5 to wick into the gap rather than chasing Candle 2 breakout.</div>
      </div>
    </div>
  );
}

// ============================================================================
// 3. XAUUSD SESSION KILLZONES 24-HOUR TIMELINE DIAGRAM (HUMAN-FRIENDLY EDITION)
// ============================================================================
export function SessionKillzonesDiagram() {
  return (
    <div
      style={{
        width: '100%',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: '8px',
        padding: '28px 24px',
        color: 'var(--text-primary)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--text-gold, #775e26)',
                background: 'var(--accent-gold-subtle, rgba(20, 84, 55, 0.08))',
                border: '1px solid var(--border-accent, rgba(20, 84, 55, 0.25))',
                padding: '2px 8px',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono, monospace)',
                textTransform: 'uppercase',
                letterSpacing: '0.6px',
              }}
            >
              24-Hour Market Rhythm
            </span>
            <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>
              How Institutional Desks Trade Gold Across the Day
            </span>
          </div>
          <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            Gold moves in an orderly 3-act sequence: <strong>1. Accumulate calm range</strong> &rarr; <strong>2. Trigger the fakeout trap</strong> &rarr; <strong>3. Expand in the true trend</strong>.
          </p>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', background: 'var(--bg-surface-2)', padding: '5px 10px', borderRadius: '4px', border: '1px solid var(--border-default)' }}>
          UTC Time Zone
        </div>
      </div>

      {/* 3 Human-Friendly Phase Cards in Native Luxury Theme */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        {/* Phase 1: Asian Session */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderTop: '3px solid #60a5fa',
            borderRadius: '6px',
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}>
              Act 1: The Calm
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600, background: 'var(--bg-surface-2)', padding: '2px 8px', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
              00:00 - 06:00 UTC
            </span>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            Asian Session (Tokyo)
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.55, flexGrow: 1 }}>
            Price drifts sideways in a quiet, narrow channel ($8 to $14). Large banks accumulate liquidity above and below the highs without showing their hand.
          </p>

          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: '3px' }}>Your Strategy:</div>
            <div style={{ color: 'var(--text-secondary)' }}>Observe only. Mark the highest and lowest price levels. Do not trade breakouts here.</div>
          </div>
        </div>

        {/* Phase 2: London Open */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderTop: '3px solid #b45309',
            borderRadius: '6px',
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#b45309', letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}>
              Act 2: The Trap
            </span>
            <span style={{ fontSize: '11px', color: '#b45309', fontWeight: 600, background: 'rgba(180, 83, 9, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(180, 83, 9, 0.2)' }}>
              07:00 - 10:00 UTC
            </span>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            London Open (Europe)
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.55, flexGrow: 1 }}>
            European desks open with high volume. Institutional desks frequently spike price outside the Asian range to trip retail stop-losses before reversing.
          </p>

          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: '#b45309', marginBottom: '3px' }}>Your Strategy:</div>
            <div style={{ color: 'var(--text-secondary)' }}>Watch for the false break. When price rejects the high/low and snaps back, enter with the reversal. 74% of daily turns occur here.</div>
          </div>
        </div>

        {/* Phase 3: New York Overlap */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderTop: '3px solid #145437',
            borderRadius: '6px',
            padding: '20px 18px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#145437', letterSpacing: '0.6px', textTransform: 'uppercase', fontFamily: 'var(--font-mono, monospace)' }}>
              Act 3: The Real Move
            </span>
            <span style={{ fontSize: '11px', color: '#145437', fontWeight: 600, background: 'rgba(20, 84, 55, 0.1)', padding: '2px 8px', borderRadius: '4px', border: '1px solid rgba(20, 84, 55, 0.2)' }}>
              12:00 - 16:00 UTC
            </span>
          </div>

          <h4 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 6px' }}>
            New York Overlap (Wall St.)
          </h4>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 14px', lineHeight: 1.55, flexGrow: 1 }}>
            Both London and Wall Street are trading together. US economic news (CPI, NFP) releases. Maximum volume drives the cleanest 200–350 pip trend expansions.
          </p>

          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '10px 12px', fontSize: '12px' }}>
            <div style={{ fontWeight: 700, color: '#145437', marginBottom: '3px' }}>Your Strategy:</div>
            <div style={{ color: 'var(--text-secondary)' }}>Ride the established trend. This window delivers high-conviction momentum runs with peak market liquidity.</div>
          </div>
        </div>
      </div>

      {/* 24-Hour Timeline Track in Soft Luxury Neutral Colors */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '16px 20px', marginBottom: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)', marginBottom: '8px' }}>
          <span>00:00 (Midnight)</span>
          <span>06:00 (Dawn)</span>
          <span>12:00 (Noon)</span>
          <span>18:00 (Evening)</span>
          <span>24:00 (Close)</span>
        </div>

        {/* 24-Hour Progress Track */}
        <div style={{ width: '100%', height: '12px', background: 'var(--bg-surface-2)', borderRadius: '6px', display: 'flex', overflow: 'hidden', border: '1px solid var(--border-subtle)' }}>
          <div title="Asian Range (00:00 - 06:00)" style={{ width: '25%', height: '100%', background: '#60a5fa' }} />
          <div style={{ width: '4.16%', height: '100%', background: 'transparent' }} />
          <div title="London Open (07:00 - 10:00)" style={{ width: '12.5%', height: '100%', background: '#d97706' }} />
          <div style={{ width: '8.33%', height: '100%', background: 'transparent' }} />
          <div title="New York Overlap (12:00 - 16:00)" style={{ width: '16.66%', height: '100%', background: '#145437' }} />
          <div style={{ width: '33.35%', height: '100%', background: 'transparent' }} />
        </div>

        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginTop: '12px', fontSize: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#60a5fa', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>Asian Accumulation (Quiet)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#d97706', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>London Sweep &amp; Trap (Volatility)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#145437', display: 'inline-block' }} />
            <span style={{ color: 'var(--text-secondary)' }}>New York Overlap (Peak Trend Expansion)</span>
          </div>
        </div>
      </div>

      {/* Human-Friendly Golden Rule Callout */}
      <div
        style={{
          background: 'var(--bg-surface-2)',
          borderLeft: '4px solid var(--accent-gold, #145437)',
          borderTop: '1px solid var(--border-default)',
          borderRight: '1px solid var(--border-default)',
          borderBottom: '1px solid var(--border-default)',
          borderRadius: '0 6px 6px 0',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '13.5px',
          color: 'var(--text-primary)',
          lineHeight: 1.55,
        }}
      >
        <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-gold, #775e26)', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase', flexShrink: 0 }}>
          Golden Rule
        </span>
        <span>
          Never gamble on gold breakouts during the quiet Asian hours. Wait for London banks to trigger the liquidity trap, then ride the expansion with New York institutions.
        </span>
      </div>
    </div>
  );
}

// ============================================================================
// 4. DYNAMIC RISK-TO-REWARD (1:3 R:R) & LOT SIZING MATRIX DIAGRAM
// ============================================================================
export function RiskRewardMatrixDiagram() {
  return (
    <div style={{ width: '100%', background: '#090D16', border: '1px solid #1E293B', borderRadius: '10px', padding: '20px 16px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#10B981', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
            POSITION SIZING MATH
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
            1:3 Asymmetric Risk-to-Reward &bull; Account Balance Matrix
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
          2.0% STRICT GOVERNOR
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '20px', alignItems: 'center' }}>
        {/* Left Side: Visual 1:3 Box Diagram */}
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <svg
            viewBox="0 0 380 280"
            style={{ width: '100%', height: 'auto', display: 'block', background: '#090D16' }}
            role="img"
            aria-label="1 to 3 Risk to Reward Visual Box Diagram"
          >
            <rect width="380" height="280" fill="#090D16" rx="6" />

            {/* Target Box: Take Profit (+60 Pips / 3R) */}
            <rect x="40" y="30" width="160" height="110" fill="rgba(16, 185, 129, 0.16)" stroke="#10B981" strokeWidth="1.5" rx="4" />
            <text x="50" y="55" fill="#10B981" fontSize="12" fontFamily="var(--font-mono, monospace)" fontWeight="800">
              TAKE PROFIT (TP)
            </text>
            <text x="50" y="75" fill="#A7F3D0" fontSize="11" fontFamily="var(--font-mono, monospace)">
              +60 Pips (+3.0R Target)
            </text>
            <text x="50" y="95" fill="#F8FAFC" fontSize="13" fontWeight="800" fontFamily="var(--font-mono, monospace)">
              $2,656.00 (+6.0%)
            </text>
            <text x="50" y="125" fill="#6EE7B7" fontSize="10" fontFamily="var(--font-mono, monospace)">
              Reward: $60.00 / 0.10 Lot
            </text>

            {/* Entry Price Line */}
            <line x1="30" y1="140" x2="350" y2="140" stroke="#F59E0B" strokeWidth="2" />
            <circle cx="40" cy="140" r="4" fill="#F59E0B" />
            <text x="210" y="135" fill="#FDE68A" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="700">
              ENTRY LEVEL: $2,650.00
            </text>

            {/* Risk Box: Stop Loss (-20 Pips / 1R) */}
            <rect x="40" y="140" width="160" height="50" fill="rgba(244, 63, 94, 0.16)" stroke="#F43F5E" strokeWidth="1.5" rx="4" />
            <text x="50" y="160" fill="#F43F5E" fontSize="11" fontFamily="var(--font-mono, monospace)" fontWeight="800">
              STOP LOSS (SL)
            </text>
            <text x="50" y="178" fill="#FDA4AF" fontSize="10" fontFamily="var(--font-mono, monospace)">
              -20 Pips (-1.0R / 2.0% Risk)
            </text>

            {/* R:R Ratio Metric */}
            <rect x="220" y="45" width="130" height="80" rx="4" fill="#0F172A" stroke="#334155" />
            <text x="235" y="70" fill="#94A3B8" fontSize="10" fontFamily="var(--font-mono, monospace)">
              ASYMMETRIC RATIO
            </text>
            <text x="235" y="100" fill="#10B981" fontSize="24" fontFamily="var(--font-mono, monospace)" fontWeight="800">
              1:3.0 R:R
            </text>
            <text x="235" y="116" fill="#CBD5E1" fontSize="10" fontFamily="var(--font-mono, monospace)">
              Win Rate Req: &gt;25%
            </text>
          </svg>
        </div>

        {/* Right Side: Account Sizing Matrix Table */}
        <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: '6px', padding: '14px' }}>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#94A3B8', marginBottom: '10px', textTransform: 'uppercase' }}>
            Account Balance &bull; Sizing Matrix
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', fontFamily: 'var(--font-mono, monospace)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #334155', color: '#94A3B8', textAlign: 'left' }}>
                <th style={{ padding: '6px 4px' }}>Balance</th>
                <th style={{ padding: '6px 4px' }}>Lot Size</th>
                <th style={{ padding: '6px 4px' }}>20p Risk (2%)</th>
                <th style={{ padding: '6px 4px', color: '#10B981' }}>60p Gain (6%)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #1E293B' }}>
                <td style={{ padding: '8px 4px', color: '#F8FAFC', fontWeight: 600 }}>$100</td>
                <td style={{ padding: '8px 4px', color: '#F59E0B' }}>0.01</td>
                <td style={{ padding: '8px 4px', color: '#F43F5E' }}>-$2.00</td>
                <td style={{ padding: '8px 4px', color: '#10B981', fontWeight: 700 }}>+$6.00</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #1E293B' }}>
                <td style={{ padding: '8px 4px', color: '#F8FAFC', fontWeight: 600 }}>$500</td>
                <td style={{ padding: '8px 4px', color: '#F59E0B' }}>0.05</td>
                <td style={{ padding: '8px 4px', color: '#F43F5E' }}>-$10.00</td>
                <td style={{ padding: '8px 4px', color: '#10B981', fontWeight: 700 }}>+$30.00</td>
              </tr>
              <tr>
                <td style={{ padding: '8px 4px', color: '#F8FAFC', fontWeight: 600 }}>$1,000</td>
                <td style={{ padding: '8px 4px', color: '#F59E0B' }}>0.10</td>
                <td style={{ padding: '8px 4px', color: '#F43F5E' }}>-$20.00</td>
                <td style={{ padding: '8px 4px', color: '#10B981', fontWeight: 700 }}>+$60.00</td>
              </tr>
            </tbody>
          </table>
          <div style={{ marginTop: '10px', fontSize: '10.5px', color: '#94A3B8', lineHeight: 1.4 }}>
            At 1:3 R:R, even with a 40% win rate across 10 trades, your account realizes a net +10.0% capital gain.
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 5. BLURRED DIAGRAM TEASER PREVIEW (FOR LOCKED LESSONS 6-30)
// ============================================================================
export function DiagramTeaserPreview({ lessonNum }: { lessonNum: number }) {
  return (
    <div style={{
      width: '100%',
      background: '#090D16',
      border: '1px solid #1E293B',
      borderRadius: '10px',
      padding: '24px 20px',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
            PROPRIETARY EXECUTION SCHEMATIC
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#F8FAFC' }}>
            Lesson {lessonNum} Institutional Blueprint
          </span>
        </div>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#F59E0B' }}>
          LOCKED &bull; MT5 PARTNER VERIFIED
        </span>
      </div>

      {/* Blurred SVG Illustration Simulation */}
      <div style={{ filter: 'blur(7px)', opacity: 0.45, pointerEvents: 'none', userSelect: 'none' }}>
        <svg viewBox="0 0 800 220" style={{ width: '100%', height: 'auto', background: '#090D16' }}>
          <rect width="800" height="220" fill="#090D16" />
          <line x1="50" y1="180" x2="750" y2="180" stroke="#334155" strokeWidth="1" />
          <line x1="50" y1="110" x2="750" y2="110" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="4,4" />
          {/* Simulated Candlesticks */}
          {[90, 140, 190, 240, 290, 340, 390, 440, 490, 540, 590, 640].map((x, i) => (
            <g key={i}>
              <line x1={x} y1={50 + (i % 3) * 20} x2={x} y2={170 - (i % 2) * 15} stroke={i % 2 === 0 ? '#10B981' : '#F43F5E'} strokeWidth="2" />
              <rect x={x - 8} y={70 + (i % 4) * 10} width="16" height={50 - (i % 3) * 8} fill={i % 2 === 0 ? '#10B981' : '#F43F5E'} rx="2" />
            </g>
          ))}
          <rect x="320" y="80" width="180" height="60" fill="rgba(245, 158, 11, 0.25)" stroke="#F59E0B" strokeWidth="1" />
        </svg>
      </div>

      {/* Lock Overlay Badge */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        padding: '16px 24px',
        background: 'rgba(9, 13, 22, 0.92)',
        border: '1px solid rgba(245, 158, 11, 0.4)',
        borderRadius: '8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)'
      }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '4px' }}>
          INSTITUTIONAL DIAGRAM PROTECTED
        </div>
        <div style={{ fontSize: '13px', color: '#F8FAFC', fontWeight: 600 }}>
          Connect JustMarkets MT5 to Unlock High-Resolution Vector Chart
        </div>
      </div>
    </div>
  );
}

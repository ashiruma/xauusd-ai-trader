'use client';

import React, { useEffect, useRef, useState, memo } from 'react';

interface TradingViewChartProps {
  defaultSymbol?: string;
  height?: number;
}

function TradingViewChartComponent({
  defaultSymbol = 'OANDA:XAUUSD',
  height = 560
}: TradingViewChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeSymbol, setActiveSymbol] = useState<string>(defaultSymbol);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous widget on symbol / mount change
    container.innerHTML = '';

    const widgetWrapper = document.createElement('div');
    widgetWrapper.className = 'tradingview-widget-container__widget';
    widgetWrapper.style.height = `${height}px`;
    widgetWrapper.style.width = '100%';
    container.appendChild(widgetWrapper);

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: activeSymbol,
      interval: '15',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      enable_publishing: false,
      allow_symbol_change: true,
      calendar: false,
      support_host: 'https://www.tradingview.com',
      backgroundColor: '#090D16',
      gridColor: 'rgba(30, 41, 59, 0.4)',
      hide_top_toolbar: false,
      hide_legend: false,
      save_image: false,
      studies: [
        'STD;EMA',
        'STD;RSI'
      ],
      toolbar_bg: '#090D16',
      withdateranges: true,
      hide_side_toolbar: false,
      details: true,
      hotlist: false
    });

    container.appendChild(script);

    return () => {
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [activeSymbol, height]);

  return (
    <div
      style={{
        background: '#090D16',
        borderRadius: 'var(--radius-lg, 12px)',
        border: '1px solid var(--border-default, #1E293B)',
        overflow: 'hidden',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {/* TradingView Terminal Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 18px',
          background: 'rgba(15, 23, 42, 0.7)',
          borderBottom: '1px solid var(--border-default, #1E293B)',
          flexWrap: 'wrap',
          gap: '10px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold, #F59E0B)', letterSpacing: '0.5px' }}>
              TRADINGVIEW TERMINAL
            </span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary, #94A3B8)' }}>
            Real-Time Spot Gold / {activeSymbol}
          </span>
        </div>

        {/* Quick Symbol Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { label: 'OANDA XAUUSD', val: 'OANDA:XAUUSD' },
            { label: 'FX GOLD', val: 'FX:XAUUSD' },
            { label: 'CAPITALCOM', val: 'CAPITALCOM:GOLD' },
          ].map((item) => (
            <button
              key={item.val}
              type="button"
              onClick={() => setActiveSymbol(item.val)}
              style={{
                padding: '4px 8px',
                fontSize: '10.5px',
                fontWeight: 600,
                borderRadius: '4px',
                border: activeSymbol === item.val ? '1px solid var(--accent-gold, #F59E0B)' : '1px solid var(--border-subtle, #334155)',
                background: activeSymbol === item.val ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
                color: activeSymbol === item.val ? 'var(--accent-gold, #F59E0B)' : 'var(--text-muted, #64748B)',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* TradingView Advanced Real-Time Chart Container */}
      <div
        ref={containerRef}
        className="tradingview-widget-container"
        style={{ height: `${height}px`, width: '100%', background: '#090D16' }}
      />
    </div>
  );
}

export const TradingViewChart = memo(TradingViewChartComponent);
export default TradingViewChart;

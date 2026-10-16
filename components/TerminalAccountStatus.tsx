'use client';

import { useEffect, useState } from 'react';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';
type LiveStatusResponse = {
  mt5_connected?: boolean;
  is_connected?: boolean;
  symbol?: string;
  trading_mode?: string;
};

export default function TerminalAccountStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('reconnecting');
  const [brokerSymbol, setBrokerSymbol] = useState<string>('XAUUSD.m');

  useEffect(() => {
    let active = true;
    let timeout: number | undefined;

    const checkConnection = async () => {
      try {
        const response = await fetch('/api/live/status', { cache: 'no-store' });
        if (!response.ok) throw new Error(`Gateway returned ${response.status}`);
        const data = (await response.json()) as LiveStatusResponse;
        if (active) {
          const isConnected = data.mt5_connected === true || data.is_connected === true;
          setStatus(isConnected ? 'connected' : 'disconnected');
          if (data.symbol) setBrokerSymbol(data.symbol);
        }
      } catch {
        if (active) setStatus('reconnecting');
      } finally {
        if (active) timeout = window.setTimeout(checkConnection, 8000);
      }
    };

    void checkConnection();
    return () => {
      active = false;
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, []);

  const config = {
    connected: {
      dotColor: '#10B981',
      textColor: '#10B981',
      label: 'Gateway Connected',
      detail: `JustMarkets MT5 (${brokerSymbol})`,
      bg: 'rgba(16, 185, 129, 0.08)',
      border: 'rgba(16, 185, 129, 0.25)',
    },
    reconnecting: {
      dotColor: '#F59E0B',
      textColor: '#F59E0B',
      label: 'Reconnecting...',
      detail: 'Establishing secure MT5 bridge',
      bg: 'rgba(245, 158, 11, 0.08)',
      border: 'rgba(245, 158, 11, 0.25)',
    },
    disconnected: {
      dotColor: '#EF4444',
      textColor: '#EF4444',
      label: 'Gateway Disconnected',
      detail: 'Local MT5 bridge is offline',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.25)',
    },
  }[status];

  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '5px 12px',
        borderRadius: '6px',
        background: config.bg,
        border: `1px solid ${config.border}`,
        fontSize: '12px',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.25 }}>
        <span style={{ fontWeight: 700, color: config.textColor, letterSpacing: '0.2px' }}>
          {config.label}
        </span>
        <span style={{ fontSize: '10.5px', color: 'var(--text-muted, #94A3B8)' }}>
          {config.detail}
        </span>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';
type LiveStatusResponse = { mt5_connected?: unknown; is_connected?: unknown };

const API_BASE = (process.env.NEXT_PUBLIC_TRADING_API_URL || 'http://localhost:8000').replace(/\/$/, '');

export default function TerminalAccountStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('reconnecting');

  useEffect(() => {
    let active = true;
    let timeout: number | undefined;

    const checkConnection = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/live/status`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Gateway status returned ${response.status}`);
        const data = await response.json() as LiveStatusResponse;
        if (active) {
          const isConnected = data.mt5_connected === true || data.is_connected === true;
          setStatus(isConnected ? 'connected' : 'disconnected');
        }
      } catch {
        if (active) setStatus('reconnecting');
      } finally {
        if (active) timeout = window.setTimeout(checkConnection, 12000);
      }
    };

    void checkConnection();
    return () => {
      active = false;
      if (timeout !== undefined) window.clearTimeout(timeout);
    };
  }, []);

  const label = status === 'connected' ? 'Connected' : status === 'disconnected' ? 'Disconnected' : 'Reconnecting';
  return <span className={`terminal-account-status ${status}`} role="status" aria-live="polite">{label}</span>;
}

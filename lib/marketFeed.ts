import fs from 'fs';
import path from 'path';

export interface ServerQuote {
  symbol: string;
  price: number | null;
  bid: number | null;
  ask: number | null;
  spread: string;
  spreadPips: number;
  delta: string;
  timestamp: number;
  lastUpdated: number | string | null;
  source: string;
  status: 'ONLINE' | 'DISCONNECTED';
  isConnected: boolean;
  message?: string;
}

export function getServerLiveQuote(): ServerQuote {
  try {
    const quoteFilePath = path.join(process.cwd(), 'data', 'live_quote.json');
    if (fs.existsSync(quoteFilePath)) {
      const raw = fs.readFileSync(quoteFilePath, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.isConnected && typeof data.price === 'number') {
        return {
          symbol: data.symbol || 'XAUUSD.m',
          price: data.price,
          bid: data.bid ?? null,
          ask: data.ask ?? null,
          spread: typeof data.spread === 'string' ? data.spread : `${data.spread || 0} PIPS`,
          spreadPips: typeof data.spreadPips === 'number' ? data.spreadPips : 0,
          delta: data.delta || '+0.00',
          timestamp: data.timestamp || Date.now(),
          lastUpdated: data.lastUpdated || null,
          source: data.source || 'JUSTMARKETS_MT5_DIRECT',
          status: 'ONLINE',
          isConnected: true
        };
      }
    }
  } catch {
    // ignore
  }

  // Disconnected broker state: do not return hardcoded numbers or fake live state
  return {
    symbol: 'XAUUSD.m',
    price: null,
    bid: null,
    ask: null,
    spread: 'Unavailable',
    spreadPips: 0,
    delta: '—',
    timestamp: Date.now(),
    lastUpdated: null,
    source: 'JUSTMARKETS_MT5_DIRECT',
    status: 'DISCONNECTED',
    isConnected: false,
    message: 'MT5 disconnected'
  };
}

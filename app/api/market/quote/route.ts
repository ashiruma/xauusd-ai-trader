import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export interface LiveQuote {
  symbol: string;
  price: number | null;
  bid: number | null;
  ask: number | null;
  spread: string;
  spreadPips: number;
  delta: string;
  changePercent: number;
  timestamp: number;
  lastUpdated: number | string | null;
  source: string;
  status: 'ONLINE' | 'DISCONNECTED';
  isConnected: boolean;
  message?: string;
}

// In-memory cache for high-frequency requests
let cachedQuote: LiveQuote | null = null;
let lastFetchTime = 0;

export async function GET() {
  const now = Date.now();

  // Return cached quote if less than 800ms old
  if (cachedQuote && (now - lastFetchTime < 800)) {
    return NextResponse.json(cachedQuote);
  }

  const { getTradingApiBase, getTradingApiHeaders } = await import('@/lib/tradingApi');
  const apiBase = getTradingApiBase();

  try {
    const res = await fetch(`${apiBase}/api/market/quote`, {
      cache: 'no-store',
      headers: getTradingApiHeaders()
    });

    if (res.ok) {
      const data = await res.json();
      if (data.is_connected && typeof data.current_price === 'number' && data.current_price > 0) {
        const spreadPips = data.spread_pips ?? (data.bid && data.ask ? Number(((data.ask - data.bid) * 10).toFixed(1)) : 0);
        const quote: LiveQuote = {
          symbol: data.symbol || 'XAUUSD.m',
          price: data.current_price,
          bid: data.bid,
          ask: data.ask,
          spread: `${spreadPips > 0 ? spreadPips : 2.6} PIPS`,
          spreadPips,
          delta: '+0.00',
          changePercent: 0,
          timestamp: now,
          lastUpdated: data.timestamp || now,
          source: 'JUSTMARKETS_MT5_DIRECT',
          status: 'ONLINE',
          isConnected: true
        };

        cachedQuote = quote;
        lastFetchTime = now;

        try {
          const quoteFilePath = path.join(process.cwd(), 'data', 'live_quote.json');
          fs.writeFileSync(quoteFilePath, JSON.stringify(quote));
        } catch {
          // ignore disk write errors
        }

        return NextResponse.json(quote);
      }
    }
  } catch {
    // Backend bridge unreachable
  }

  // Broker feed is unavailable or MT5 is disconnected:
  // Return explicit disconnected state. Do not substitute TradingView, Binance/PAXG, or simulated quotes!
  const disconnectedQuote: LiveQuote = {
    symbol: 'XAUUSD.m',
    price: null,
    bid: null,
    ask: null,
    spread: 'Unavailable',
    spreadPips: 0,
    delta: '—',
    changePercent: 0,
    timestamp: now,
    lastUpdated: cachedQuote?.lastUpdated || null,
    source: 'JUSTMARKETS_MT5_DIRECT',
    status: 'DISCONNECTED',
    isConnected: false,
    message: 'MT5 disconnected'
  };

  cachedQuote = disconnectedQuote;
  lastFetchTime = now;

  try {
    const quoteFilePath = path.join(process.cwd(), 'data', 'live_quote.json');
    fs.writeFileSync(quoteFilePath, JSON.stringify(disconnectedQuote));
  } catch {
    // ignore
  }

  return NextResponse.json(disconnectedQuote);
}

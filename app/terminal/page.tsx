import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import TerminalPositions from '@/components/TerminalPositions';
import TerminalAccountStatus from '@/components/TerminalAccountStatus';
import { getServerLiveQuote } from '@/lib/marketFeed';
import TradingViewChart from '@/components/terminal/TradingViewChart';
import ActiveTradesPanel from '@/components/terminal/ActiveTradesPanel';
import TradeHistoryPanel from '@/components/terminal/TradeHistoryPanel';
import LiveTradingEngine from '@/components/terminal/LiveTradingEngine';

export const metadata: Metadata = {
  title: 'XAUUSD Trading Terminal | Velarion Markets',
  description: 'Institutional XAUUSD quantitative trading terminal with multi-agent consensus signals, real-time TradingView charting, and non-custodial JustMarkets MT5 execution.',
  robots: { index: false, follow: false },
};

export default async function TerminalPage() {
  const cookieStore = await cookies();
  const mt5Verified = cookieStore.get('velarion_mt5_verified')?.value;
  const hasAdminToken = Boolean(cookieStore.get('velarion_admin_token')?.value);
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  if (mt5Verified !== 'true' && !hasAdminToken && !session) {
    redirect('/onboarding?redirect=/terminal');
  }

  const accountId = session?.mt5Account || session?.accountId || (hasAdminToken ? '1200533810 (ADMIN)' : 'VERIFIED-TRADER');
  const initialQuote = getServerLiveQuote();

  return (
    <div className="terminal-page" style={{ maxWidth: '1440px', margin: '20px auto 80px', padding: '0 20px' }}>
      <div className="terminal-container">
        {/* Account Strip with Live Gateway Status */}
        <div className="terminal-account-strip" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(230,187,89,0.1) 0%, rgba(14,22,37,0.95) 100%)',
          border: '1px solid var(--border-gold, #F59E0B)',
          borderRadius: 'var(--radius-lg, 12px)',
          padding: '16px 22px',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div className="terminal-account-copy" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              className="terminal-account-mark"
              aria-hidden="true"
              style={{
                width: '38px',
                height: '38px',
                background: 'rgba(230,187,89,0.18)',
                border: '1px solid var(--border-gold, #F59E0B)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold, #F59E0B)',
                fontWeight: 800,
                fontSize: '18px'
              }}
            >
              V
            </span>
            <div>
              <span className="terminal-overline" style={{ fontSize: '11px', color: 'var(--accent-gold, #F59E0B)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
                Verified Institutional Workspace
              </span>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                JustMarkets MT5 Account: <span className="mono-nums" style={{ color: 'var(--accent-gold, #F59E0B)' }}>#{accountId}</span>
              </div>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-secondary)' }}>
                Non-custodial execution guarantee. Capital remains 100% deposited in your broker balance.
              </p>
            </div>
          </div>
          <TerminalAccountStatus />
        </div>

        {/* 2-Column Responsive Layout: Left Sidebar Context | Right Main Tradingview & Trades */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 380px) 1fr', gap: '24px', alignItems: 'start' }}>
          {/* Left Sidebar */}
          <aside className="terminal-sidebar" aria-label="Market context" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <LiveSpotFeed initialQuote={initialQuote} />

            <div className="panel-card" style={{ padding: '20px' }}>
              <span className="terminal-overline" style={{ fontSize: '11px', color: 'var(--accent-gold, #F59E0B)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.6px' }}>
                Account Safety
              </span>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 8px' }}>
                Non-Custodial Architecture
              </h2>
              <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                Deposits, withdrawals, and margin requirements are processed exclusively through JustMarkets Ltd. All orders route directly via encrypted FIX / MT5 WebSockets.
              </p>
            </div>

            {/* Model Insight Snapshot */}
            <TerminalPositions />
          </aside>

          {/* Right Main Content */}
          <main className="terminal-main-content" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Real TradingView Advanced Real-Time Chart */}
            <TradingViewChart defaultSymbol="OANDA:XAUUSD" height={580} />

            {/* Active Trades & Open Positions Panel with 1-Click Close */}
            <ActiveTradesPanel />

            {/* Trade History & Closed Executions Panel */}
            <TradeHistoryPanel />

            {/* Autonomous Trading Engine, Session Metrics & Risk Safety Controls */}
            <LiveTradingEngine />
          </main>
        </div>
      </div>
    </div>
  );
}

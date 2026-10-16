import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import LiveSpotFeed from '@/components/LiveSpotFeed';
import { getServerLiveQuote } from '@/lib/marketFeed';
import TradingViewChart from '@/components/terminal/TradingViewChart';
import ActiveTradesPanel from '@/components/terminal/ActiveTradesPanel';
import TradeHistoryPanel from '@/components/terminal/TradeHistoryPanel';
import LiveTradingEngine from '@/components/terminal/LiveTradingEngine';

export const metadata: Metadata = {
  title: 'Autonomous AI Trading Terminal | Velarion Markets',
  description: 'Institutional XAUUSD quantitative trading terminal with multi-agent consensus signals and non-custodial JustMarkets MT5 execution.',
  robots: {
    index: false,
    follow: false
  }
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
  const isLiveConnected = Boolean(initialQuote?.isConnected);

  return (
    <div style={{ maxWidth: '1280px', margin: '30px auto 80px', padding: '0 24px' }}>
      {/* Subsidized Access Verified Header */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(230,187,89,0.12) 0%, rgba(14,22,37,0.95) 100%)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'rgba(230,187,89,0.18)',
            border: '1px solid var(--border-gold)',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)',
            fontWeight: 800,
            fontSize: '18px'
          }}>
            V
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                Subsidized Lifetime Terminal Access
              </span>
              <span className="status-badge status-warning">
                TIER 1 PARTNER
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              Broker: JustMarkets Ltd &bull; Verified MT5 Account: <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>#{accountId}</strong> &bull; Non-Custodial Capital Guarantee
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className={`status-badge ${isLiveConnected ? 'status-completed' : 'status-danger'}`}>
            {isLiveConnected ? 'LIVE MT5 GATEWAY ACTIVE' : 'MT5 GATEWAY DISCONNECTED'}
          </span>
        </div>
      </div>

      {/* 2-Column Grid: Left Feed & Telemetry | Right Signals & Governor */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Live Spot Feed & Metrics */}
        <div>
          <LiveSpotFeed initialQuote={initialQuote} style={{ marginBottom: '20px' }} />

          {/* Market Status Card */}
          <div className="panel-card" style={{ padding: '20px' }}>
            <div className="panel-title" style={{ marginBottom: '14px' }}>
              Institutional Market Regimes
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Trading Session:</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>London / NY Overlap</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Execution Symbol:</span>
                <span className="mono-nums val-gold" style={{ fontWeight: 600 }}>{initialQuote?.symbol || 'XAUUSD.m'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Gateway Telemetry:</span>
                <span style={{ color: isLiveConnected ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>
                  {isLiveConnected ? 'Verified Broker Stream' : 'Disconnected / Reconnecting'}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order Routing:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Direct JustMarkets ECN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: TradingView Advanced Terminal, Active Trades Panel, & Live Engine */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Institutional TradingView Real-Time Advanced Chart Terminal */}
          <TradingViewChart defaultSymbol="OANDA:XAUUSD" height={560} />

          {/* Active Trades & Live MT5 Position Telemetry */}
          <ActiveTradesPanel />

          {/* Trade History & Verified Closed Broker Executions */}
          <TradeHistoryPanel />

          {/* Live Autonomous Trading Engine */}
          <LiveTradingEngine />

          {/* Active Model Consensus */}
          <div className="panel-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                AI Multi-Agent Consensus Engine
              </h2>
              <span className={`status-badge ${isLiveConnected ? 'status-completed' : 'status-warning'}`}>
                {isLiveConnected ? 'CONSENSUS ACTIVE' : 'CONSENSUS STANDBY (OFFLINE)'}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
              <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>01 SMC Liquidity</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>BUY BIAS</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Asian Low Swept &amp; MSS</div>
              </div>

              <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>02 Trend Pullback</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>BUY BIAS</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>50 EMA Tested</div>
              </div>

              <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>03 Session Breakout</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>BUY BIAS</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>London Expansion</div>
              </div>

              <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>04 Mean Reversion</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-muted)', marginTop: '2px' }}>NEUTRAL</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Within 1.2 Sigma</div>
              </div>
            </div>
          </div>

          {/* Non-Custodial Safety & MT5 Bridge */}
          <div className="panel-card" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Non-Custodial Broker Execution Protocol
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Velarion executes zero capital custody. Trades are dispatched via encrypted MT5 Server WebSockets straight into your JustMarkets brokerage balance. All deposits, margin requirements, and withdrawals are handled exclusively through JustMarkets Ltd with regulatory protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

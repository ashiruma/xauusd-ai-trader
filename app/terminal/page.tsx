import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import LiveSpotFeed from '@/components/LiveSpotFeed';

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

  if (!mt5Verified || mt5Verified !== 'true') {
    redirect('/onboarding?redirect=/terminal');
  }

  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const accountId = session?.mt5Account || session?.accountId || '1200533810';

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
          <span className="status-badge status-completed">
            LIVE MT5 GATEWAY ACTIVE
          </span>
        </div>
      </div>

      {/* 2-Column Grid: Left Feed & Telemetry | Right Signals & Governor */}
      <div style={{ display: 'grid', gridTemplateColumns: '420px 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left Column: Live Spot Feed & Metrics */}
        <div>
          <LiveSpotFeed style={{ marginBottom: '20px' }} />

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
                <span style={{ color: 'var(--text-secondary)' }}>Daily ATR (14):</span>
                <span className="mono-nums val-gold" style={{ fontWeight: 600 }}>$38.40 (384 Pips)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>10Y Real Yield (TIPS):</span>
                <span className="mono-nums" style={{ color: 'var(--text-primary)' }}>1.84% (-0.02%)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order Routing:</span>
                <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Direct JustMarkets ECN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Signals & Multi-Agent Consensus */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Active Model Consensus */}
          <div className="panel-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                AI Multi-Agent Consensus Engine
              </h2>
              <span className="status-badge status-completed">
                CONSENSUS CONFIRMED (3/4)
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'var(--bg-surface-2)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-default)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>01 SMC Liquidity</div>
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>BUY BIAS</div>
                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Asian Low Swept</div>
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

            {/* Current Active Signal Details */}
            <div style={{
              background: 'rgba(25, 184, 120, 0.08)',
              border: '1px solid var(--accent-green-border)',
              borderRadius: '8px',
              padding: '16px 20px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <strong style={{ fontSize: '14px', color: 'var(--accent-green)' }}>
                  ACTIVE SIGNAL: XAUUSD BUY (LONG)
                </strong>
                <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--accent-gold)' }}>
                  CONFIDENCE: 92%
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', fontSize: '12.5px' }}>
                <div>Entry: <strong className="mono-nums">$4,144.06</strong></div>
                <div>Stop Loss: <strong className="mono-nums val-bear">$4,141.06</strong> (30 Pips)</div>
                <div>Take Profit 1: <strong className="mono-nums val-bull">$4,154.06</strong> (100 Pips)</div>
                <div>Take Profit 2: <strong className="mono-nums val-bull">$4,164.06</strong> (200 Pips)</div>
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

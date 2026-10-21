'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import type { WhyThisTrade, LivePosition, ExecutedTrade } from '@/lib/trade-types';

interface TradingSettingsState {
  maxLots: number;
  maxRiskPercent: number;
  maxDailyLossUsd: number;
  maxDrawdownPercent: number;
  isAutomatedTradingAuthorized: boolean;
  isEmergencyPaused: boolean;
  authorizationTimestamp: string | null;
  tradeNotificationAlerts: boolean;
}

interface TradeEngineData {
  status: string;
  environment: string;
  isLiveBrokerConnection: boolean;
  broker: string;
  accountNumber: string;
  currentSpotPrice: number | null;
  dataFreshness: string;
  timeZone: string;
  autoTradingEnabled: boolean;
  account: {
    initialDeposit: number;
    balance: number;
    openPnl: number;
    equity: number;
    totalProfit: number;
    winRate: number;
    totalTrades: number;
    totalPipsBanked: number;
    dailyTargetPct: number;
  };
  activePosition: LivePosition | null;
  positions: LivePosition[];
  recentTrades: ExecutedTrade[];
  executionModelConsensus: {
    smcLiquiditySweep: { signal: string; confidence: number; reason: string };
    trendPullback: { signal: string; confidence: number; reason: string };
    sessionBreakout: { signal: string; confidence: number; reason: string };
    meanReversion: { signal: string; confidence: number; reason: string };
  };
}

export default function LiveTradingEngine() {
  const [data, setData] = useState<TradeEngineData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [showWhyModal, setShowWhyModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBridgeModal, setShowBridgeModal] = useState(false);

  // User safety settings state
  const [settings, setSettings] = useState<TradingSettingsState>({
    maxLots: 0.02,
    maxRiskPercent: 1.5,
    maxDailyLossUsd: 50,
    maxDrawdownPercent: 6.0,
    isAutomatedTradingAuthorized: false,
    isEmergencyPaused: false,
    authorizationTimestamp: null,
    tradeNotificationAlerts: true
  });

  const fetchTradeData = async () => {
    try {
      const res = await fetch('/api/trades/live', { cache: 'no-store' });
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/trading/settings');
      if (res.ok) {
        const json = await res.json();
        if (json.settings) {
          setSettings(json.settings);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchTradeData();
    fetchSettings();
    const interval = setInterval(fetchTradeData, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSaveSettings = async (updated: Partial<TradingSettingsState>) => {
    setActionLoading(true);
    try {
      const payload = { ...settings, ...updated };
      const res = await fetch('/api/trading/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const json = await res.json();
        setSettings(json.settings);
        setActionMessage(json.message);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch {
      // ignore
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleEmergencyKillSwitch = async () => {
    const nextPaused = !settings.isEmergencyPaused;
    setActionLoading(true);
    try {
      await fetch('/api/trades/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggleEmergencyPause', paused: nextPaused })
      });
      await handleSaveSettings({ isEmergencyPaused: nextPaused });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAuthorization = async () => {
    if (confirm('Are you sure you want to revoke automated trading authorization? No automated orders will be submitted.')) {
      await handleSaveSettings({ isAutomatedTradingAuthorized: false });
    }
  };

  if (loading && !data) {
    return (
      <div className="panel-card" style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading Autonomous Trading Telemetry...
      </div>
    );
  }

  const isConnected = Boolean(data?.isLiveBrokerConnection && data?.status === 'ONLINE');
  const pos = data?.activePosition;
  const acc = data?.account;
  const isPosProfit = (pos?.pnl || 0) >= 0;
  const why = pos?.whyThisTrade;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Environment & Connection Banner */}
      <div style={{
        background: isConnected ? 'var(--bg-surface-1)' : 'rgba(244, 63, 94, 0.08)',
        border: `1px solid ${isConnected ? 'var(--border-default)' : 'rgba(244, 63, 94, 0.3)'}`,
        borderRadius: 'var(--radius-md)',
        padding: '14px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className={`status-badge ${isConnected ? 'status-completed' : 'status-danger'}`} style={{ fontSize: '10.5px' }}>
            {isConnected ? 'JUSTMARKETS MT5 LIVE' : 'MT5 DISCONNECTED'}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Broker: <strong>{data?.broker}</strong> / Account: <strong className="mono-nums">#{data?.accountNumber}</strong> / Connection: <span style={{ color: isConnected ? 'var(--accent-green)' : 'var(--accent-red)', fontWeight: 600 }}>{isConnected ? 'Active' : 'Offline / Reconnecting'}</span>
          </span>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setShowBridgeModal(true)}
            className="btn btn-secondary"
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            Bridge Architecture &rarr;
          </button>
          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="btn btn-outline-gold"
            style={{ fontSize: '11.5px', padding: '6px 12px' }}
          >
            Trading Safety Settings &rarr;
          </button>
        </div>
      </div>

      {/* Main Terminal Header & Performance */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '11.5px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 800,
                color: settings.isEmergencyPaused
                  ? 'var(--accent-red)'
                  : settings.isAutomatedTradingAuthorized
                  ? 'var(--accent-green)'
                  : 'var(--accent-gold)',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {settings.isEmergencyPaused
                  ? 'EMERGENCY KILL SWITCH: ALL TRADING PAUSED'
                  : settings.isAutomatedTradingAuthorized
                  ? 'AUTOMATED TRADING: AUTHORIZED & ARMED'
                  : 'AUTOMATED TRADING: UNAUTHORIZED (MONITORING ONLY)'}
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              XAUUSD Algorithmic Terminal / JustMarkets MT5
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* One-Click Emergency Pause / Kill Switch */}
            <button
              onClick={handleToggleEmergencyKillSwitch}
              disabled={actionLoading}
              type="button"
              className={`btn ${settings.isEmergencyPaused ? 'btn-primary' : 'btn-secondary'}`}
              style={{
                fontSize: '12px',
                padding: '8px 14px',
                borderColor: settings.isEmergencyPaused ? 'var(--accent-green)' : 'var(--accent-red)',
                color: settings.isEmergencyPaused ? '#FFFFFF' : 'var(--accent-red)'
              }}
            >
              {settings.isEmergencyPaused ? 'Resume Trading' : 'Emergency Kill Switch'}
            </button>

            <button
              onClick={() => setShowSettingsModal(true)}
              disabled={actionLoading}
              type="button"
              className="btn btn-primary"
              style={{ fontSize: '12px', padding: '8px 14px' }}
            >
              Configure Execution Safety &rarr;
            </button>
          </div>
        </div>

        {actionMessage && (
          <div style={{ padding: '10px 14px', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-sm)', fontSize: '12.5px', color: 'var(--text-gold)', marginBottom: '16px' }}>
            {actionMessage}
          </div>
        )}

        {/* 4 Compounding Performance Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Account Balance
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px' }}>
              {isConnected && acc?.balance ? `$${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isConnected ? 'Verified JustMarkets Balance' : 'Awaiting Broker Feed'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Realized Session Gain
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: (acc?.totalProfit || 0) >= 0 ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '4px' }}>
              {isConnected ? `${(acc?.totalProfit || 0) >= 0 ? '+' : ''}${(acc?.totalProfit || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isConnected ? `${(acc?.totalPipsBanked || 0) >= 0 ? '+' : ''}${acc?.totalPipsBanked || 0} Net Pips Banked` : 'Awaiting Broker Feed'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Floating Unrealized PnL
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: isPosProfit ? 'var(--accent-green)' : 'var(--accent-red)', marginTop: '4px' }}>
              {isConnected ? `${isPosProfit ? '+' : ''}${(acc?.openPnl || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isConnected ? `Equity: $${(acc?.equity || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : 'Awaiting Broker Feed'}
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-1)', padding: '14px 16px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Session Win Rate
            </div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)', marginTop: '4px' }}>
              {isConnected && (acc?.totalTrades || 0) > 0 ? `${acc?.winRate}%` : '—'}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {isConnected ? `${acc?.totalTrades || 0} Closed Executions` : 'Awaiting Broker Feed'}
            </div>
          </div>
        </div>
      </div>

      {/* Active Position Card with "Why This Trade?" Integration */}
      {pos ? (
        <div className="panel-card" style={{ padding: '24px', border: '1.5px solid var(--border-accent)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className={`status-badge ${pos.type === 'BUY' ? 'status-completed' : 'status-danger'}`} style={{ fontSize: '12px', padding: '4px 10px' }}>
                RUNNING ORDER: {pos.type} {pos.lots} LOTS
              </span>
              <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Ticket #{pos.ticket} / {pos.symbol} / Opened {new Date(pos.openTime).toLocaleTimeString()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span className="mono-nums" style={{ fontSize: '16px', fontWeight: 800, color: isPosProfit ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                {isPosProfit ? '+' : ''}${pos.pnl.toFixed(2)} ({isPosProfit ? '+' : ''}{pos.pips} Pips)
              </span>

              <button
                type="button"
                onClick={() => setShowWhyModal(true)}
                className="btn btn-outline-gold"
                style={{ fontSize: '11.5px', padding: '5px 12px' }}
              >
                Why this trade? &rarr;
              </button>
            </div>
          </div>

          {/* Trade Execution Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px', fontSize: '13px' }}>
            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Entry Price</div>
              <div className="mono-nums" style={{ fontWeight: 700, marginTop: '2px' }}>${pos.entryPrice.toFixed(2)}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Price</div>
              <div className="mono-nums val-gold" style={{ fontWeight: 700, marginTop: '2px' }}>${pos.currentPrice.toFixed(2)}</div>
            </div>

            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Stop Loss (SL)</div>
              <div className="mono-nums val-bear" style={{ fontWeight: 700, marginTop: '2px' }}>
                {pos.stopLoss > 0 ? `$${pos.stopLoss.toFixed(2)}` : 'None'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Take Profit (TP)</div>
              <div className="mono-nums val-bull" style={{ fontWeight: 700, marginTop: '2px' }}>
                {pos.takeProfit > 0 ? `$${pos.takeProfit.toFixed(2)}` : 'None'}
              </div>
            </div>

            <div style={{ background: 'var(--bg-surface-1)', padding: '10px 12px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Capital Risk Exposure</div>
              <div className="mono-nums" style={{ fontWeight: 700, marginTop: '2px', color: 'var(--text-primary)' }}>
                ${pos.riskExposureUsd.toFixed(2)}
              </div>
            </div>
          </div>

          {/* Educational Alignment Callout */}
          <div style={{ padding: '12px 16px', background: 'var(--bg-surface-2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong style={{ color: 'var(--accent-gold)' }}>Strategy:</strong> {pos.strategy} / Ticket #{pos.ticket}
            </div>
            <Link href="/academy" style={{ fontSize: '12px', color: 'var(--accent-gold)', fontWeight: 700, textDecoration: 'none' }}>
              Review Curriculum &rarr;
            </Link>
          </div>
        </div>
      ) : (
        <div className="panel-card" style={{ padding: '24px', textAlign: 'center' }}>
          <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>
            No Active Open Positions
          </div>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 12px' }}>
            The connected JustMarkets MT5 account currently reports zero active positions. Orders placed by the trading engine will appear here in real-time.
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            MT5 Gateway: {isConnected ? 'Streaming Direct Quotes' : 'Awaiting Connection'} / Non-Custodial
          </div>
        </div>
      )}

      {/* Execution History Table */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Recent Order Execution History
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '4px 0 0' }}>
              Closed executions verified from the connected JustMarkets MT5 account session.
            </p>
          </div>
          <span className="status-badge status-neutral">
            JUSTMARKETS MT5 NON-CUSTODIAL
          </span>
        </div>

        {data?.recentTrades && data.recentTrades.length > 0 ? (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 10px' }}>Ticket</th>
                  <th style={{ padding: '8px 10px' }}>Strategy</th>
                  <th style={{ padding: '8px 10px' }}>Side / Lots</th>
                  <th style={{ padding: '8px 10px' }}>Entry &rarr; Exit</th>
                  <th style={{ padding: '8px 10px' }}>Pips</th>
                  <th style={{ padding: '8px 10px', textAlign: 'right' }}>Net PnL (USD)</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTrades.map((t) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td className="mono-nums" style={{ padding: '10px', color: 'var(--text-muted)' }}>
                      #{t.ticket}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{t.strategy}</div>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span className={`status-badge ${t.type === 'BUY' ? 'status-completed' : 'status-danger'}`} style={{ fontSize: '10.5px' }}>
                        {t.type} {t.lots}
                      </span>
                    </td>
                    <td className="mono-nums" style={{ padding: '10px' }}>
                      ${t.entryPrice.toFixed(2)} &rarr; ${t.exitPrice.toFixed(2)}
                    </td>
                    <td className={`mono-nums ${t.pips >= 0 ? 'val-bull' : 'val-bear'}`} style={{ padding: '10px', fontWeight: 600 }}>
                      {t.pips >= 0 ? '+' : ''}{t.pips.toFixed(1)}
                    </td>
                    <td className={`mono-nums ${t.pnl >= 0 ? 'val-bull' : 'val-bear'}`} style={{ padding: '10px', textAlign: 'right', fontWeight: 800 }}>
                      {t.pnl >= 0 ? '+' : ''}${t.pnl.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 10px', color: 'var(--text-muted)', fontSize: '13px' }}>
            No closed executions in the current session on the connected JustMarkets MT5 account.
          </div>
        )}
      </div>

      {/* "WHY THIS TRADE?" MODAL */}
      {showWhyModal && why && (
        <div
          className="modal-overlay"
          onClick={() => setShowWhyModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '640px',
              width: '100%',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: '0 20px 48px rgba(15, 23, 42, 0.25)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowWhyModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '22px',
                cursor: 'pointer'
              }}
              aria-label="Close dialog"
            >
              &times;
            </button>

            <span className="section-eyebrow" style={{ fontSize: '11px', marginBottom: '8px' }}>
              Execution Telemetry Rationale
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Why this trade? (Ticket #{pos?.ticket})
            </h2>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Strategy: <strong>{why.strategyVersion}</strong> / Signal Time: {new Date(why.signalTimestamp).toLocaleString()}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left', fontSize: '13px' }}>
              {/* Recorded Entry Rationale */}
              <div style={{ background: 'var(--bg-surface-1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Recorded Entry Rationale (At Order Creation)
                </div>
                <p style={{ margin: 0, color: 'var(--text-primary)', lineHeight: 1.55 }}>
                  {why.isRecorded ? why.entryRationale : 'Entry rationale unavailable'}
                </p>
                {!why.isRecorded && (
                  <p style={{ margin: '6px 0 0', fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Notice: This order was submitted without a tagged quantitative rationale, or the rationale was not recorded in the audit database at fill. Velarion does not infer reasons post-entry.
                  </p>
                )}
              </div>

              {/* Exit Conditions */}
              <div style={{ background: 'var(--bg-surface-1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Exit Rules &amp; Levels
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                  <div>- <strong>Stop-Loss:</strong> {why.exitConditions.stopLossRule}</div>
                  <div>- <strong>Take-Profit:</strong> {why.exitConditions.takeProfitRule}</div>
                </div>
              </div>

              {/* Uncertainty and Delay Notice */}
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.5, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Uncertainty Level: <strong>{why.uncertaintyLevel}</strong> / Latency: {why.dataDelay}. Model rationales reflect real-time quantitative criteria evaluated at order submission.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PERSISTENT BACKEND / TERMINAL BRIDGE ARCHITECTURE MODAL */}
      {showBridgeModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowBridgeModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '620px',
              width: '100%',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: '0 20px 48px rgba(15, 23, 42, 0.25)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowBridgeModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '22px',
                cursor: 'pointer'
              }}
              aria-label="Close dialog"
            >
              &times;
            </button>

            <span className="section-eyebrow" style={{ fontSize: '11px', marginBottom: '8px' }}>
              System Architecture / Non-Custodial Protocol
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Persistent MT5 Terminal Bridge Architecture
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.55 }}>
              Understanding why a persistent bridge daemon is required for JustMarkets MT5 execution beyond standard serverless web hosting.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left', fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              <div style={{ background: 'var(--bg-surface-1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>1. Decoupled Read-Only Data Stream:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  The frontend terminal market data connection is strictly read-only. It polls broker OHLC candles, bid/ask spreads, and open positions without possessing the cryptographic ability to submit trading orders.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>2. Why Serverless (Vercel) Cannot Execute Trades:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  MetaTrader 5 requires a running desktop terminal instance and the native C-extension <code>MetaTrader5</code> on Windows. Vercel serverless functions run ephemeral Linux micro-containers without desktop displays, persistent TCP sockets, or local MT5 terminal installations.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>3. The Persistent Python Bridge Daemon:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Execution is handled by a persistent Python daemon (<code>api/app.py</code>) running alongside the MetaTrader 5 terminal on your local Windows PC or institutional VPS. It binds to port 8000, maintains a live heartbeat with JustMarkets, and validates risk rules before dispatching any order.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <strong style={{ color: 'var(--text-primary)' }}>4. Explicit Separate Execution Authorization:</strong>
                <p style={{ margin: '4px 0 0' }}>
                  Account linking alone will never place an order. Automated execution requires explicit separate authorization in Trading Safety Settings, governed by your lot caps and daily loss limits.
                </p>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginTop: '18px' }}>
              <button
                type="button"
                onClick={() => setShowBridgeModal(false)}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '8px 18px' }}
              >
                Close Architecture Guide
              </button>
            </div>
          </div>
        </div>
      )}

      {/* USER TRADING SETTINGS MODAL */}
      {showSettingsModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowSettingsModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              boxShadow: '0 20px 48px rgba(15, 23, 42, 0.25)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowSettingsModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '22px',
                cursor: 'pointer'
              }}
              aria-label="Close dialog"
            >
              &times;
            </button>

            <span className="section-eyebrow" style={{ fontSize: '11px', marginBottom: '8px' }}>
              User Risk Governors
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Trading Settings &amp; Execution Authorization
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.55 }}>
              Configure your mandatory safety bounds. Automated trade orders will only be submitted if within these limits.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Maximum Lot Cap (Position Limit)
                </label>
                <input
                  type="number"
                  value={settings.maxLots}
                  onChange={(e) => setSettings({ ...settings, maxLots: Number(e.target.value) })}
                  className="calc-input mono-nums"
                  min={0.01}
                  max={0.50}
                  step={0.01}
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Micro-lot ceiling (0.01 to 0.50 lots).</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Max Risk Per Trade (%)
                  </label>
                  <input
                    type="number"
                    value={settings.maxRiskPercent}
                    onChange={(e) => setSettings({ ...settings, maxRiskPercent: Number(e.target.value) })}
                    className="calc-input mono-nums"
                    min={0.5}
                    max={3.0}
                    step={0.5}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    Max Daily Loss ($ USD)
                  </label>
                  <input
                    type="number"
                    value={settings.maxDailyLossUsd}
                    onChange={(e) => setSettings({ ...settings, maxDailyLossUsd: Number(e.target.value) })}
                    className="calc-input mono-nums"
                    min={10}
                    max={1000}
                    step={10}
                  />
                </div>
              </div>

              {/* Explicit Trading Authorization Checkbox */}
              <div style={{
                background: 'var(--bg-surface-1)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '14px',
                marginTop: '6px'
              }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.isAutomatedTradingAuthorized}
                    onChange={(e) => setSettings({ ...settings, isAutomatedTradingAuthorized: e.target.checked })}
                    style={{ marginTop: '3px' }}
                  />
                  <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    <strong>Explicit Automated Trading Authorization:</strong> I authorize Velarion AI models to submit automated market orders on my linked JustMarkets MT5 account subject to the risk governors configured above.
                  </div>
                </label>
              </div>

              {/* Independent Withdrawal Notice */}
              <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                Notice: Account linking alone does not trigger orders. Users retain independent custody of withdrawals via JustMarkets. Velarion never stores broker passwords or withdrawal pins.
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                {settings.isAutomatedTradingAuthorized && (
                  <button
                    type="button"
                    onClick={handleRevokeAuthorization}
                    className="btn btn-secondary"
                    style={{ fontSize: '12px', color: 'var(--accent-red)' }}
                  >
                    Revoke Authorization
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    handleSaveSettings(settings);
                    setShowSettingsModal(false);
                  }}
                  className="btn btn-primary"
                  style={{ fontSize: '13px', padding: '9px 18px', marginLeft: 'auto' }}
                >
                  Save Settings &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

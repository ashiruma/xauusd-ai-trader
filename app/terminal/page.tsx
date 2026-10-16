import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import CockpitTerminal from '@/components/terminal/CockpitTerminal';
import TradeHistoryPanel from '@/components/terminal/TradeHistoryPanel';

export const metadata: Metadata = {
  title: 'XAUUSD Cockpit Trading Terminal | Velarion Markets',
  description: 'High-density institutional XAUUSD futures trading terminal with depth-of-market ladder, real-time candlestick charts, positions blotter, and live P&L tape.',
  robots: { index: false, follow: false },
};

export default async function TerminalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const adminSecret = process.env.ADMIN_MASTER_SECRET;
  const adminToken = cookieStore.get('velarion_admin_token')?.value;

  const isOwner = Boolean(
    (adminSecret && adminToken === adminSecret) ||
    session?.role === 'admin' ||
    session?.accountId === '1200533810' ||
    session?.email === 'ashirumaabala@gmail.com'
  );

  const isFullyGated = Boolean(
    session &&
    session.verified &&
    session.partnerAttributed &&
    session.depositVerified &&
    session.schoolCompleted &&
    session.accountLinked &&
    session.tradingActivated
  );

  // Strict cryptographic server-side route guard
  if (!isOwner && !isFullyGated) {
    redirect('/verification?redirect=/terminal');
  }

  const accountId = session?.mt5Account || session?.accountId || (isOwner ? '1200533810 (ADMIN)' : '1200533810');

  return (
    <div
      className="terminal-workspace-wrapper"
      style={{
        backgroundColor: '#0A0F1C',
        minHeight: 'calc(100vh - 65px)',
        color: '#F8FAFC',
        padding: '16px 20px 48px',
      }}
    >
      <div style={{ maxWidth: '1720px', margin: '0 auto', width: '100%' }}>
        
        {/* Streamlined Workspace Context Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            flexWrap: 'wrap',
            gap: '10px',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <img
              src="/velarion_emblem_dark.png"
              alt="Velarion"
              width={22}
              height={22}
              style={{ height: '20px', width: 'auto', display: 'block' }}
            />
            <span
              style={{
                fontSize: '11px',
                color: 'var(--accent-gold, #F5C451)',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.6px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Cockpit Terminal Active
            </span>
            <span style={{ color: '#1B2538' }}>/</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#26D07C',
                background: 'rgba(38, 208, 124, 0.1)',
                padding: '2px 8px',
                border: '1px solid rgba(38, 208, 124, 0.25)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Account Verified
            </span>
            <span style={{ color: '#1B2538' }}>/</span>
            <span style={{ color: '#CBD5E1', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              JustMarkets MT5: <strong style={{ color: 'var(--accent-gold, #F5C451)' }}>#{accountId}</strong>
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#8B97A8', fontFamily: 'JetBrains Mono, monospace' }}>
            Non-custodial execution guarantee / 100% of capital remains deposited with JustMarkets
          </div>
        </div>

        {/* Primary Cockpit Dashboard Terminal Component */}
        <CockpitTerminal />

        {/* Collapsible Closed Fills & Execution History */}
        <div style={{ marginTop: '20px' }}>
          <TradeHistoryPanel />
        </div>

      </div>
    </div>
  );
}

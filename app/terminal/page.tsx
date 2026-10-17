import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import TradingViewTerminal from '@/components/terminal/TradingViewTerminal';

export const metadata: Metadata = {
  title: 'XAUUSD Trading Terminal | Velarion Markets & JustMarkets',
  description: 'Full-scale TradingView real-time charting and JustMarkets ECN execution blotter.',
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
    session?.role === 'admin'
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

  const accountId = session?.mt5Account || session?.accountId || (isOwner ? '1200533810 (ADMIN)' : 'UNLINKED');

  return (
    <div
      className="terminal-workspace-wrapper"
      style={{
        backgroundColor: '#070B14',
        minHeight: 'calc(100vh - 65px)',
        color: '#F8FAFC',
        padding: '16px 20px 48px',
      }}
    >
      <div style={{ maxWidth: '1720px', margin: '0 auto', width: '100%' }}>
        
        {/* Workspace Context Bar */}
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
            <span
              style={{
                fontSize: '11px',
                color: '#F5C451',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.6px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              [VELARION TERMINAL]
            </span>
            <span style={{ color: '#334155' }}>/</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#10B981',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Verified Partner Session
            </span>
            <span style={{ color: '#334155' }}>/</span>
            <span style={{ color: '#CBD5E1', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              JustMarkets MT5: <strong style={{ color: '#F5C451' }}>#{accountId}</strong>
            </span>
          </div>

          <div style={{ fontSize: '11px', color: '#64748B', fontFamily: 'JetBrains Mono, monospace' }}>
            Non-custodial execution guarantee: Capital deposited exclusively with JustMarkets
          </div>
        </div>

        {/* Primary Full-Scale TradingView Terminal Component */}
        <TradingViewTerminal accountId={accountId} />

      </div>
    </div>
  );
}

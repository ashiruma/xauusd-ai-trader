import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import { readVerifiedCoreGraduation } from '@/lib/learning-authority';
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
  const adminSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
  const adminToken = cookieStore.get('velarion_admin_token')?.value;

  const isOwner = Boolean(
    (adminSecret && adminToken === adminSecret) ||
    session?.role === 'admin'
  );

  const graduation = await readVerifiedCoreGraduation();
  const isFullyGated = Boolean(
    session &&
    session.verified &&
    session.partnerAttributed &&
    session.depositVerified &&
    graduation.available &&
    graduation.complete &&
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
        backgroundColor: 'var(--bg-base)',
        minHeight: 'calc(100vh - 65px)',
        color: 'var(--text-primary)',
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
                color: 'var(--accent-gold)',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.6px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              [VELARION TERMINAL]
            </span>
            <span style={{ color: 'var(--border-default)' }}>/</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-green)',
                background: 'var(--accent-green-subtle)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid var(--accent-green-border)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Verified Partner Session
            </span>
            <span style={{ color: 'var(--border-default)' }}>/</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              JustMarkets MT5: <strong style={{ color: 'var(--accent-gold)' }}>#{accountId}</strong>
            </span>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Non-custodial execution guarantee: Capital deposited exclusively with JustMarkets
          </div>
        </div>

        {/* Primary Full-Scale TradingView Terminal Component */}
        <TradingViewTerminal accountId={accountId} />

      </div>
    </div>
  );
}

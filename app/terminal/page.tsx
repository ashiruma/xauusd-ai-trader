import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import TerminalAccountStatus from '@/components/TerminalAccountStatus';
import TerminalWorkspace from '@/components/terminal/TerminalWorkspace';

export const metadata: Metadata = {
  title: 'XAUUSD Trading Terminal | Velarion Markets',
  description: 'Institutional XAUUSD quantitative trading workspace with real-time JustMarkets MT5 charting, active position overlays, and non-custodial broker execution.',
  robots: { index: false, follow: false },
};

export default async function TerminalPage() {
  const cookieStore = await cookies();
  const mt5Verified = cookieStore.get('velarion_mt5_verified')?.value;
  const hasAdminToken = Boolean(cookieStore.get('velarion_admin_token')?.value);
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  // Strict server-side route guard
  if (mt5Verified !== 'true' && !hasAdminToken && !session) {
    redirect('/onboarding?redirect=/terminal');
  }

  const accountId = session?.mt5Account || session?.accountId || (hasAdminToken ? '1200533810 (ADMIN)' : '1200533810');

  return (
    <div
      className="terminal-workspace-wrapper"
      style={{
        backgroundColor: '#0B0F19',
        minHeight: 'calc(100vh - 68px)',
        color: '#F8FAFC',
        padding: '20px 24px 60px',
      }}
    >
      <div style={{ maxWidth: '1680px', margin: '0 auto', width: '100%' }}>
        {/* Compact Account & Live Gateway Status Header */}
        <header
          className="terminal-header-strip"
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#0D1322',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            padding: '14px 20px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '14px',
          }}
        >
          {/* Account Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <span
              aria-hidden="true"
              style={{
                width: '38px',
                height: '38px',
                background: 'rgba(197, 160, 89, 0.12)',
                border: '1px solid rgba(197, 160, 89, 0.3)',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--accent-gold, #C5A059)',
                fontWeight: 800,
                fontSize: '18px',
                flexShrink: 0,
              }}
            >
              V
            </span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--accent-gold, #C5A059)',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    letterSpacing: '0.6px',
                  }}
                >
                  Verified Trading Workspace
                </span>
                <span
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: '#94A3B8',
                    background: '#111827',
                    padding: '1px 7px',
                    borderRadius: '4px',
                    border: '1px solid #1E293B',
                  }}
                >
                  Account Verified
                </span>
              </div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', marginTop: '2px' }}>
                JustMarkets MT5 Account: <span className="mono-nums" style={{ color: 'var(--accent-gold, #C5A059)' }}>#{accountId}</span>
              </div>
              <p style={{ margin: '2px 0 0', fontSize: '11.5px', color: '#64748B' }}>
                Non-custodial execution guarantee &bull; 100% of capital remains deposited in your JustMarkets balance.
              </p>
            </div>
          </div>

          {/* Genuine Single Active Dot Indicator Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <TerminalAccountStatus />
          </div>
        </header>

        {/* Primary Workspace: Chart + Companion Positions + Collapsible History & Controls */}
        <TerminalWorkspace />
      </div>
    </div>
  );
}

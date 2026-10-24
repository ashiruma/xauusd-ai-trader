import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import TradingViewTerminal from '@/components/terminal/TradingViewTerminal';

export const metadata: Metadata = {
  title: 'XAUUSD Trading Terminal | Velarion Markets & JustMarkets',
  description: 'Full-scale TradingView real-time charting and JustMarkets ECN execution blotter.',
  robots: { index: false, follow: false },
};

export default async function TerminalPage() {
  const cookieStore = await cookies();

  // 1. Check Supabase Auth
  let supabaseUser: { id: string; email?: string } | null = null;
  let isApproved = false;
  let mt5AccountFromProfile: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      supabaseUser = data.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, is_admin, mt5_account_id')
        .eq('id', data.user.id)
        .maybeSingle();

      isApproved = profile?.status === 'approved' || Boolean(profile?.is_admin);
      mt5AccountFromProfile = profile?.mt5_account_id || null;
    }
  } catch {
    // Supabase client fallback
  }

  // 2. Check Admin Master Token or Legacy Session
  const adminSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const legacyToken = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const legacySession = legacyToken ? await verifySession(legacyToken) : null;

  const isOwner = Boolean(
    (adminSecret && adminToken === adminSecret) ||
    legacySession?.role === 'admin'
  );

  const isAuthenticated = Boolean(isOwner || supabaseUser || legacySession);

  if (!isAuthenticated) {
    redirect('/login?redirect=/terminal');
  }

  // Determine active MT5 account identifier
  const accountId =
    mt5AccountFromProfile ||
    legacySession?.mt5Account ||
    legacySession?.accountId ||
    cookieStore.get('velarion_mt5_account')?.value ||
    (isOwner ? '1200533810 (ADMIN)' : '1200533810');

  return (
    <div
      className="terminal-workspace-wrapper"
      style={{
        backgroundColor: 'var(--bg-base, #030712)',
        minHeight: 'calc(100vh - 65px)',
        color: 'var(--text-primary, #F8FAFC)',
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
                color: 'var(--accent-gold, #D4AF37)',
                textTransform: 'uppercase',
                fontWeight: 700,
                letterSpacing: '0.6px',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              [VELARION TERMINAL]
            </span>
            <span style={{ color: 'var(--border-default, #1E293B)' }}>/</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: 'var(--accent-green, #10B981)',
                background: 'rgba(16, 185, 129, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              {isApproved ? 'Approved Member' : isOwner ? 'Administrator' : 'Connected Terminal'}
            </span>
            <span style={{ color: 'var(--border-default, #1E293B)' }}>/</span>
            <span style={{ color: 'var(--text-secondary, #94A3B8)', fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}>
              JustMarkets MT5: <strong style={{ color: 'var(--accent-gold, #D4AF37)' }}>#{accountId}</strong>
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <a
              href="/control"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 10px',
                background: 'rgba(212, 175, 55, 0.15)',
                color: 'var(--accent-gold, #D4AF37)',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                borderRadius: '4px',
                fontSize: '11px',
                fontWeight: 600,
                textDecoration: 'none',
                fontFamily: 'JetBrains Mono, monospace',
              }}
            >
              Admin Dashboard &rarr;
            </a>
            <div style={{ fontSize: '11px', color: 'var(--text-muted, #64748B)', fontFamily: 'JetBrains Mono, monospace' }}>
              Non-custodial execution guarantee: Capital deposited exclusively with JustMarkets
            </div>
          </div>
        </div>

        {/* Primary Full-Scale TradingView Terminal Component */}
        <TradingViewTerminal accountId={accountId} />

      </div>
    </div>
  );
}

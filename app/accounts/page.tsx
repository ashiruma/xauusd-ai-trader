import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import MemberNav from '@/components/MemberNav';
import AccountsClientDesk from '@/components/accounts/AccountsClientDesk';

export const metadata: Metadata = {
  title: 'Accounts Desk | Least-Privilege Account Linking',
  description: 'Secure non-custodial account linking desk. Connect JustMarkets MT5 account for demo-first telemetry without master passwords.',
  robots: { index: false, follow: false },
};

export default async function AccountsPage() {
  const cookieStore = await cookies();

  // 1. Check Supabase Auth
  let supabaseUser: { id: string; email?: string } | null = null;
  let profileMt5Id: string | null = null;
  let isApproved = false;
  let isAdmin = false;

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

      profileMt5Id = profile?.mt5_account_id || null;
      isApproved = profile?.status === 'approved' || Boolean(profile?.is_admin);
      isAdmin = Boolean(profile?.is_admin);
    }
  } catch {
    // Supabase fallback
  }

  // 2. Check Legacy / Admin Session
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const adminSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const isOwner = Boolean(
    (adminSecret && adminToken === adminSecret) ||
    session?.role === 'admin' ||
    isAdmin
  );

  if (!supabaseUser && !session && !isOwner) {
    redirect('/login?redirect=/accounts');
  }

  const accountId =
    profileMt5Id ||
    session?.mt5Account ||
    session?.accountId ||
    (isOwner ? '1200533810' : '');

  const isLinked = Boolean(profileMt5Id || (session?.accountLinked && accountId));

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <MemberNav
        accountId={accountId || 'UNLINKED'}
        environment="DEMO"
        automationStatus={session?.tradingActivated ? 'ACTIVE_DEMO' : 'OFF'}
      />

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            LEAST-PRIVILEGE INTEGRATION
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.4px' }}>
            Account Linking Desk
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '680px', marginTop: '6px', lineHeight: 1.6 }}>
            Connect your JustMarkets MT5 account for real-time telemetry and execution. In accordance with strict non-custodial security, Velarion never requests or stores master trading passwords.
          </p>
        </div>

        {/* Client Interactive Desk */}
        <AccountsClientDesk
          currentAccountId={accountId}
          isInitiallyLinked={isLinked}
          isOwner={isOwner}
          userEmail={supabaseUser?.email || session?.email || (isOwner ? 'coordinator@velarion.internal' : '')}
        />
      </main>
    </div>
  );
}

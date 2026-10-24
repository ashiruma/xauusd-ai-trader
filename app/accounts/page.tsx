import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
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
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  const adminSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const isOwner = Boolean(
    (adminSecret && adminToken === adminSecret) ||
    session?.role === 'admin'
  );

  if (!session && !isOwner) {
    redirect('/login?redirect=/accounts');
  }

  const accountId = session?.mt5Account || session?.accountId || (isOwner ? '1200533810 (ADMIN)' : '');
  const isLinked = Boolean(session?.accountLinked && accountId);

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
            Connect your JustMarkets MT5 account for real-time telemetry and demo execution. In accordance with strict non-custodial security, Velarion never requests or stores master trading passwords.
          </p>
        </div>

        {/* Client Interactive Desk */}
        <AccountsClientDesk
          currentAccountId={accountId}
          isInitiallyLinked={isLinked}
          isOwner={isOwner}
          userEmail={session?.email || (isOwner ? 'coordinator@velarion.internal' : '')}
        />
      </main>
    </div>
  );
}

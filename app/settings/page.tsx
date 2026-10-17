import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import MemberNav from '@/components/MemberNav';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import SettingsClientPanel from '@/components/settings/SettingsClientPanel';

export const metadata: Metadata = {
  title: 'Settings & Support | Velarion Member Portal',
  description: 'Member settings, display preferences, partner verification desk, and non-custodial security disclosures.',
  robots: { index: false, follow: false },
};

export default async function SettingsPage() {
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
    redirect('/login?redirect=/settings');
  }

  const accountId = session?.mt5Account || session?.accountId || (isOwner ? '1200533810 (ADMIN)' : 'UNLINKED');
  const userEmail = session?.email || (isOwner ? 'ashirumaabala@gmail.com' : 'trader@velarion.internal');
  const isVerified = isOwner || Boolean(session?.verified);

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <MemberNav
        accountId={accountId}
        environment="DEMO"
        automationStatus={session?.tradingActivated ? 'ACTIVE_DEMO' : 'OFF'}
      />

      <main style={{ maxWidth: '1080px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            MEMBER CONFIGURATION &amp; SUPPORT
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.4px' }}>
            Settings &amp; Support Desk
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '680px', marginTop: '6px', lineHeight: 1.6 }}>
            Manage platform preferences, check partner attribution status, and review non-custodial security policies.
          </p>
        </div>

        {/* Client Interactive Settings Panel */}
        <SettingsClientPanel
          accountId={accountId}
          userEmail={userEmail}
          isOwner={isOwner}
          isVerified={isVerified}
          partnerCode={DEFAULT_PARTNER_CONFIG.primaryCode}
        />
      </main>
    </div>
  );
}

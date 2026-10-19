import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import MemberNav from '@/components/MemberNav';
import AutomationClientDesk from '@/components/automation/AutomationClientDesk';

export const metadata: Metadata = {
  title: 'Automation Desk | Demo-First Strategy Management',
  description: 'Manage automated quantitative trading under demo-first release boundary. Configurable risk ceilings, pause/stop controls, and audit trail.',
  robots: { index: false, follow: false },
};

export default async function AutomationPage() {
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
    redirect('/login?redirect=/automation');
  }

  const accountId = session?.mt5Account || session?.accountId || (isOwner ? '1200533810 (ADMIN)' : 'UNLINKED');
  const isSchoolComplete = isOwner || Boolean(session?.schoolCompleted);
  const isAccountLinked = isOwner || Boolean(session?.accountLinked && session?.mt5Account);

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <MemberNav
        accountId={accountId}
        environment="DEMO"
        automationStatus={session?.tradingActivated ? 'ACTIVE_DEMO' : 'OFF'}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <div style={{ marginBottom: '28px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            RELEASE BOUNDARY: DEMO-FIRST STAGE
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.4px' }}>
            Automated Trading Control Desk
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '720px', marginTop: '6px', lineHeight: 1.6 }}>
            Automation is OFF by default. Our initial release boundary is strictly DEMO-FIRST, enabling members to validate systematic XAUUSD quantitative strategies with virtual capital before live deployment.
          </p>
        </div>

        {/* Client Interactive Automation Desk */}
        <AutomationClientDesk
          accountId={accountId}
          isSchoolComplete={isSchoolComplete}
          isAccountLinked={isAccountLinked}
          isOwner={isOwner}
          userEmail={session?.email || (isOwner ? 'coordinator@velarion.internal' : '')}
        />
      </main>
    </div>
  );
}

import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import { resolveMt5AccountDisplay } from '@/lib/account-utils';
import MemberNav from '@/components/MemberNav';
import TradingViewTerminal from '@/components/terminal/TradingViewTerminal';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Member Overview | Velarion Trading Desk',
  description: 'Chart-first member overview dashboard with real-time XAUUSD telemetry, key metrics, and sequential funnel guidance.',
  robots: { index: false, follow: false },
};

export default async function OverviewPage() {
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
      const ADMIN_EMAILS = ['ashirumaabala@gmail.com'];
      const isStaffEmail = data.user.email ? ADMIN_EMAILS.includes(data.user.email.toLowerCase()) : false;
      isAdmin = Boolean(profile?.is_admin) || isStaffEmail;
      isApproved = profile?.status === 'approved' || isAdmin;
    }
  } catch {
    // Supabase fallback
  }

  // 2. Legacy / Admin Session
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;

  const adminSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const isOwner = Boolean(
    (adminSecret && adminToken === adminSecret) ||
    session?.role === 'admin' ||
    isAdmin
  );

  const isAuthenticated = Boolean(supabaseUser || session || isOwner);
  if (!isAuthenticated) {
    redirect('/login?redirect=/overview');
  }

  const resolved = resolveMt5AccountDisplay({
    mt5Account: profileMt5Id || session?.mt5Account,
    accountId: session?.accountId,
    isAdmin: isOwner,
  });
  const accountId = resolved.accountNumber || (isOwner ? '1200533810 (ADMIN)' : 'UNLINKED');
  // Authoritative server-side progress directly from session cookie
  const completedCookie = cookieStore.get('velarion_completed_lessons')?.value;
  let completedLessons: number[] = [];

  if (completedCookie) {
    try {
      const parsed = JSON.parse(completedCookie);
      if (Array.isArray(parsed)) {
        completedLessons = parsed.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 30);
      }
    } catch {
      // ignore parsing failure
    }
  }

  let sequentialCount = 0;
  for (let i = 1; i <= 5; i++) {
    if (completedLessons.includes(i)) sequentialCount++;
    else break;
  }
  const isSchoolComplete = sequentialCount >= 5;
  const isAccountLinked = isOwner || Boolean(profileMt5Id || (session?.accountLinked && session?.mt5Account));
  const isTradingActivated = isOwner || Boolean(session?.tradingActivated);

  // Determine clear next action based on sequential funnel
  let nextAction = {
    step: '03',
    title: 'Complete Required School Checkpoints',
    description: 'Work through the foundational risk modules to qualify for algorithmic automation.',
    buttonText: 'Open School & Quizzes',
    buttonHref: '/school',
  };

  if (!isSchoolComplete) {
    nextAction = {
      step: '03',
      title: 'Complete Required School Checkpoints',
      description: 'You must pass Foundation Lessons 1 through 5 sequentially before automation can be activated.',
      buttonText: 'Resume School Lessons',
      buttonHref: '/school',
    };
  } else if (!isAccountLinked) {
    nextAction = {
      step: '04',
      title: 'Link Your JustMarkets Account (Least-Privilege)',
      description: 'Connect your MT5 account ID for non-custodial telemetry. Master trading passwords are never requested.',
      buttonText: 'Link MT5 Account',
      buttonHref: '/accounts',
    };
  } else if (!isTradingActivated) {
    nextAction = {
      step: '05',
      title: 'Review Demo Automation Consent',
      description: 'Your prerequisites are met. Review affirmative risk disclosures and activate demo-first automation.',
      buttonText: 'Configure Demo Automation',
      buttonHref: '/automation',
    };
  } else {
    nextAction = {
      step: 'ACTIVE',
      title: 'Demo Automation Armed',
      description: 'Monitoring real-time XAUUSD liquidity sweeps under Candidate Strategy v2 rules.',
      buttonText: 'Manage Automation & Stop Controls',
      buttonHref: '/automation',
    };
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Shared Member Shell Navigation */}
      <MemberNav
        accountId={accountId}
        environment="DEMO"
        automationStatus={isTradingActivated ? 'ACTIVE_DEMO' : 'OFF'}
      />

      <main style={{ maxWidth: '1720px', margin: '0 auto', padding: '20px 24px 64px' }}>
        
        {/* Next Action Guided Funnel Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '18px 22px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span
              className="mono-nums"
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--accent-gold)',
                background: 'var(--accent-gold-subtle)',
                padding: '4px 10px',
                borderRadius: '5px',
                border: '1px solid var(--border-accent)',
              }}
            >
              NEXT ACTION: STEP {nextAction.step}
            </span>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {nextAction.title}
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                {nextAction.description}
              </div>
            </div>
          </div>

          <Link
            href={nextAction.buttonHref}
            style={{
              padding: '9px 18px',
              fontSize: '13px',
              fontWeight: 700,
              backgroundColor: 'var(--accent-gold)',
              color: '#000000',
              borderRadius: '6px',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>{nextAction.buttonText}</span>
            <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>

        {/* Chart-First Dashboard Component (TradingView Advanced Chart + Real Broker Blotter) */}
        <TradingViewTerminal accountId={accountId} />

        {/* Collapsible Advanced Account & Model Telemetry */}
        <details
          style={{
            marginTop: '24px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '16px 20px',
            cursor: 'pointer',
          }}
        >
          <summary style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)' }}>
            Advanced Account &amp; Model Specifications (Click to expand)
          </summary>
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-subtle)',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '16px',
              fontSize: '12.5px',
              cursor: 'default',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Execution Stage:</span>
              <div style={{ fontWeight: 700, color: '#0369A1' }}>Demo-First Validation</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Live Automation Gate:</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-red)' }}>Locked (Gated behind operational review)</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Strategy Engine:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Candidate Strategy v2 (SMC Pullback)</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Risk Ceilings:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>2.0% Per Trade | 5.0% Daily Lockout</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Order Permission:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Strictly Single-Ticket (No Martingale)</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Broker Source:</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>JustMarkets Raw ECN / Demo Bridge</div>
            </div>
          </div>
        </details>

      </main>
    </div>
  );
}

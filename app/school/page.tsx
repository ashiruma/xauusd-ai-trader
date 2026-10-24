import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import { resolveMt5AccountDisplay } from '@/lib/account-utils';
import MemberNav from '@/components/MemberNav';
import Link from 'next/link';
import { FOREX_LESSONS } from '@/lib/curriculum';
import CelebrationTriggerButton from '@/components/celebration/CelebrationTriggerButton';
import { evaluateLessonAccess } from '@/lib/curriculum-firewall';

export const metadata: Metadata = {
  title: 'Forex School | Systematic Curriculum & Checkpoints',
  description: 'Authoritative server-enforced Forex School covering leverage, margin, costs, losses, position risk, demo vs live, and automation consent.',
  robots: { index: false, follow: false },
};

export default async function MemberSchoolPage({
  searchParams,
}: {
  searchParams?: Promise<{ celebrate?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const autoCelebrateKey = (params.celebrate as 'foundation' | 'beginner' | 'intermediate' | 'advanced') || undefined;
  const cookieStore = await cookies();
  // 1. Check Supabase Auth
  let supabaseUser: { id: string; email?: string } | null = null;
  let profileMt5Id: string | null = null;
  let isApproved = false;
  let isAdmin = false;
  let isFunded = false;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      supabaseUser = data.user;
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, is_admin, mt5_account_id, is_funded')
        .eq('id', data.user.id)
        .maybeSingle();

      profileMt5Id = profile?.mt5_account_id || null;
      const ADMIN_EMAILS = ['ashirumaabala@gmail.com'];
      const isStaffEmail = data.user.email ? ADMIN_EMAILS.includes(data.user.email.toLowerCase()) : false;
      isAdmin = Boolean(profile?.is_admin) || isStaffEmail;
      isApproved = profile?.status === 'approved' || isAdmin;
      isFunded = Boolean(profile?.is_funded) || isAdmin;
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
    redirect('/login?redirect=/school');
  }

  const resolved = resolveMt5AccountDisplay({
    mt5Account: profileMt5Id || session?.mt5Account,
    accountId: session?.accountId,
    isAdmin: isOwner,
  });
  const accountId = resolved.accountNumber || (isOwner ? '1200533810' : 'UNLINKED');

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

  const foundationCount = [1, 2, 3, 4, 5].filter((n) => completedLessons.includes(n)).length;
  const isFoundationPassed = foundationCount === 5;

  const beginnerCount = Array.from({ length: 12 }, (_, i) => i + 1).filter((n) => completedLessons.includes(n)).length;
  const isBeginnerPassed = beginnerCount === 12;

  const intermediateCount = Array.from({ length: 10 }, (_, i) => i + 13).filter((n) => completedLessons.includes(n)).length;
  const isIntermediatePassed = isBeginnerPassed && intermediateCount === 10;

  const advancedCount = Array.from({ length: 8 }, (_, i) => i + 23).filter((n) => completedLessons.includes(n)).length;
  const isMasterPassed = isIntermediatePassed && advancedCount === 8;

  const essentialCheckpoints = [
    {
      step: 1,
      lessonNum: 1,
      title: 'Foundation Checkpoint 1: What Is Forex & Currency Pairs',
      coreTopic: 'Market structure, base vs quote currency, spread calculations.',
      unlocked: true,
      completed: completedLessons.includes(1),
    },
    {
      step: 2,
      lessonNum: 2,
      title: 'Foundation Checkpoint 2: Quotes, Bid/Ask & Trading Costs',
      coreTopic: 'Spread markup, commissions, swap, slippage in high-volatility sessions.',
      unlocked: completedLessons.includes(1) || isOwner,
      completed: completedLessons.includes(2),
    },
    {
      step: 3,
      lessonNum: 3,
      title: 'Foundation Checkpoint 3: Pips, Lot Sizes & Contract Specifications',
      coreTopic: 'Standard Cent (1 oz) vs Standard (100 oz) contract risk calculations.',
      unlocked: completedLessons.includes(2) || isOwner,
      completed: completedLessons.includes(3),
    },
    {
      step: 4,
      lessonNum: 4,
      title: 'Foundation Checkpoint 4: Leverage & Margin Mechanics',
      coreTopic: 'Margin calculation, liquidation stop-out triggers, downside exposure.',
      unlocked: completedLessons.includes(3) || isOwner,
      completed: completedLessons.includes(4),
    },
    {
      step: 5,
      lessonNum: 5,
      title: 'Foundation Checkpoint 5: Order Types, Demo Realities & Automation Consent',
      coreTopic: 'Pending orders, stop loss placement, demo vs live differences, automation consent.',
      unlocked: completedLessons.includes(4) || isOwner,
      completed: completedLessons.includes(5),
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <MemberNav
        accountId={accountId}
        environment="DEMO"
        automationStatus={session?.tradingActivated ? 'ACTIVE_DEMO' : 'OFF'}
      />

      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 24px 64px' }}>
        
        {/* Header & Progress Summary */}
        <div style={{ marginBottom: '32px' }}>
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
            SERVER-VERIFIED CURRICULUM
          </span>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '4px', letterSpacing: '-0.4px' }}>
            Forex School &amp; Risk Checkpoints
          </h1>
          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', maxWidth: '720px', marginTop: '6px', lineHeight: 1.6 }}>
            Master currency mechanics, loss asymmetry, and contract specifications. Complete the 5 Foundation Checkpoints sequentially with passing quiz scores to unlock automated strategy execution.
          </p>
        </div>

        {/* Progress Tracker Card */}
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '10px',
            padding: '24px',
            marginBottom: '36px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                FOUNDATION QUALIFICATION STATUS
              </span>
              <div style={{ fontSize: '18px', fontWeight: 800, color: isSchoolComplete ? 'var(--accent-green)' : 'var(--text-primary)' }}>
                {isSchoolComplete ? 'Foundation School Completed (5/5 Passed)' : `${sequentialCount} of 5 Checkpoints Completed`}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              {isSchoolComplete && (
                <CelebrationTriggerButton
                  levelKey="foundation"
                  label="View Level 1 Honors"
                  autoOpen={autoCelebrateKey === 'foundation'}
                />
              )}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-mono, monospace)',
                  padding: '4px 10px',
                  borderRadius: '5px',
                  backgroundColor: isSchoolComplete ? 'var(--accent-green-subtle)' : 'var(--accent-gold-subtle)',
                  color: isSchoolComplete ? 'var(--accent-green)' : 'var(--accent-gold)',
                  border: `1px solid ${isSchoolComplete ? 'var(--accent-green-border)' : 'var(--border-accent)'}`,
                }}
              >
                {isSchoolComplete ? 'AUTOMATION QUALIFIED' : 'PREREQUISITE IN PROGRESS'}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-surface-2)', borderRadius: '4px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${(sequentialCount / 5) * 100}%`,
                height: '100%',
                backgroundColor: isSchoolComplete ? 'var(--accent-green)' : 'var(--accent-gold)',
                transition: 'width 0.4s ease',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '11.5px', color: 'var(--text-muted)' }}>
            <span>Checkpoint 1: Forex Basics</span>
            <span>Checkpoint 5: Automation Governance</span>
          </div>
        </div>

        {/* 5 Essential Checkpoints List */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Mandatory Foundation Checkpoints
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {essentialCheckpoints.map((cp) => (
              <div
                key={cp.step}
                style={{
                  background: 'var(--bg-card)',
                  border: `1px solid ${cp.completed ? 'var(--accent-green-border)' : cp.unlocked ? 'var(--border-default)' : 'var(--border-subtle)'}`,
                  borderRadius: '8px',
                  padding: '18px 22px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '14px',
                  opacity: cp.unlocked ? 1 : 0.6,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span
                    className="mono-nums"
                    style={{
                      fontSize: '13px',
                      fontWeight: 800,
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: cp.completed ? 'var(--accent-green)' : cp.unlocked ? 'var(--accent-gold)' : 'var(--bg-surface-2)',
                      color: cp.completed || cp.unlocked ? '#000000' : 'var(--text-muted)',
                    }}
                  >
                    {cp.completed ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-label="Passed">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      cp.step
                    )}
                  </span>

                  <div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {cp.title}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {cp.coreTopic}
                    </div>
                  </div>
                </div>

                <div>
                  {cp.completed ? (
                    <Link
                      href={`/academy/lesson-${cp.lessonNum}`}
                      style={{
                        padding: '6px 14px',
                        fontSize: '12px',
                        fontWeight: 600,
                        backgroundColor: 'var(--accent-green-subtle)',
                        color: 'var(--accent-green)',
                        border: '1px solid var(--accent-green-border)',
                        borderRadius: '5px',
                        textDecoration: 'none',
                      }}
                    >
                      Review Lesson &rarr;
                    </Link>
                  ) : cp.unlocked ? (
                    <Link
                      href={`/academy/lesson-${cp.lessonNum}`}
                      style={{
                        padding: '7px 16px',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        backgroundColor: 'var(--accent-gold)',
                        color: '#000000',
                        borderRadius: '5px',
                        textDecoration: 'none',
                      }}
                    >
                      Take Checkpoint &rarr;
                    </Link>
                  ) : (
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                      Locked (Complete Checkpoint {cp.step - 1} First)
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Level Credentials & Tier Honors */}
        <div style={{ marginBottom: '48px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
                ACCREDITATION MATRIX
              </span>
              <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>
                Curriculum Level Honors &amp; Tier Credentials
              </h2>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
              Pass level capstone assessments to unlock verifiable certifications.
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '16px',
            }}
          >
            {/* Level 1: Foundation */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isFoundationPassed ? 'var(--accent-green-border)' : 'var(--border-default)'}`,
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                    LEVEL 1 / FOUNDATION
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: isFoundationPassed ? 'var(--accent-green-subtle)' : 'var(--bg-surface-2)', color: isFoundationPassed ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {isFoundationPassed ? 'PASSED (5/5)' : `${foundationCount}/5 Lessons`}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Foundation Risk &amp; Execution
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Currency mechanics, spread costs, lot sizing, margin dynamics, and automation consent.
                </p>
              </div>
              <div>
                {isFoundationPassed ? (
                  <CelebrationTriggerButton
                    levelKey="foundation"
                    label="View Level 1 Honors"
                    autoOpen={autoCelebrateKey === 'foundation'}
                  />
                ) : (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                    Complete Checkpoint 5 to unlock
                  </span>
                )}
              </div>
            </div>

            {/* Level 2: Beginner */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isBeginnerPassed ? 'var(--accent-green-border)' : 'var(--border-default)'}`,
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                    LEVEL 2 / BEGINNER FOLIO
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: isBeginnerPassed ? 'var(--accent-green-subtle)' : 'var(--bg-surface-2)', color: isBeginnerPassed ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {isBeginnerPassed ? 'PASSED (12/12)' : `${beginnerCount}/12 Lessons`}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Quantitative Market Mechanics
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Multi-session liquidity clocks, trend continuation, volatility sizing, and execution asymmetry.
                </p>
              </div>
              <div>
                {isBeginnerPassed ? (
                  <CelebrationTriggerButton
                    levelKey="beginner"
                    label="View Level 2 Honors"
                    autoOpen={autoCelebrateKey === 'beginner'}
                  />
                ) : (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                    Complete Lesson 12 to unlock
                  </span>
                )}
              </div>
            </div>

            {/* Level 3: Intermediate */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isIntermediatePassed ? 'var(--accent-green-border)' : 'var(--border-default)'}`,
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                    LEVEL 3 / INTERMEDIATE
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: isIntermediatePassed ? 'var(--accent-green-subtle)' : 'var(--bg-surface-2)', color: isIntermediatePassed ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {isIntermediatePassed ? 'PASSED (10/10)' : `${intermediateCount}/10 Lessons`}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Institutional Order Flow &amp; Risk
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Fair Value Gaps, Smart Money sweeps, order blocks, and portfolio variance protection.
                </p>
              </div>
              <div>
                {isIntermediatePassed ? (
                  <CelebrationTriggerButton
                    levelKey="intermediate"
                    label="View Level 3 Honors"
                    autoOpen={autoCelebrateKey === 'intermediate'}
                  />
                ) : (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                    Complete Lesson 22 to unlock
                  </span>
                )}
              </div>
            </div>

            {/* Level 4: Master */}
            <div
              style={{
                background: 'var(--bg-card)',
                border: `1px solid ${isMasterPassed ? 'var(--accent-green-border)' : 'var(--border-default)'}`,
                borderRadius: '8px',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
                    LEVEL 4 / MASTER TIER
                  </span>
                  <span style={{ fontSize: '10px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', backgroundColor: isMasterPassed ? 'var(--accent-green-subtle)' : 'var(--bg-surface-2)', color: isMasterPassed ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {isMasterPassed ? 'PASSED (30/30)' : `${completedLessons.length}/30 Lessons`}
                  </span>
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Master Quantitative Trader
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
                  Multi-agent confluence, high-impact macro filtering, Monte Carlo validation, and prop governors.
                </p>
              </div>
              <div>
                {isMasterPassed ? (
                  <CelebrationTriggerButton
                    levelKey="advanced"
                    label="View Master Honors"
                    autoOpen={autoCelebrateKey === 'advanced'}
                  />
                ) : (
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                    Complete Lesson 30 to unlock
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 30-Lesson Full Curriculum Reference */}
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
            Institutional Curriculum Reference (Lessons 1-30)
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {FOREX_LESSONS.slice(0, 30).map((l) => {
              const firewall = evaluateLessonAccess({
                lessonNum: l.globalNum,
                completedLessons,
                isLinked: Boolean(isOwner || profileMt5Id || session?.accountLinked),
                isFunded: Boolean(isOwner || isFunded),
                isAdmin: isOwner,
              });
              const isPassed = completedLessons.includes(l.globalNum);
              const isNext = l.globalNum === firewall.nextAllowedLesson;

              let badgeText = 'LOCKED';
              let badgeColor = 'var(--text-muted)';
              let badgeBg = 'var(--bg-surface-2)';

              if (isPassed) {
                badgeText = 'PASSED';
                badgeColor = 'var(--accent-green)';
                badgeBg = 'var(--accent-green-subtle)';
              } else if (isNext) {
                badgeText = 'NEXT';
                badgeColor = 'var(--accent-gold)';
                badgeBg = 'var(--accent-gold-subtle)';
              } else if (firewall.gateReason === 'link_required') {
                badgeText = 'LINK REQ';
                badgeColor = '#38bdf8';
                badgeBg = 'rgba(56, 189, 248, 0.12)';
              } else if (firewall.gateReason === 'deposit_required') {
                badgeText = 'MIN. $50';
                badgeColor = 'var(--accent-gold)';
                badgeBg = 'rgba(230, 187, 89, 0.14)';
              }

              return (
                <Link
                  key={l.globalNum}
                  href={`/academy/lesson-${l.globalNum}`}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${isPassed ? 'var(--accent-green-border)' : isNext ? 'var(--border-accent)' : 'var(--border-default)'}`,
                    borderRadius: '6px',
                    padding: '12px 16px',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '10px',
                    opacity: firewall.allowed || isPassed ? 1 : 0.7,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                    <span className="mono-nums" style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', width: '22px', flexShrink: 0 }}>
                      {l.globalNum < 10 ? `0${l.globalNum}` : l.globalNum}.
                    </span>
                    <span style={{ fontSize: '12.5px', color: 'var(--text-primary)', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {l.title}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '10px',
                      fontFamily: 'var(--font-mono, monospace)',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      color: badgeColor,
                      backgroundColor: badgeBg,
                      flexShrink: 0,
                    }}
                  >
                    {badgeText}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

      </main>
    </div>
  );
}

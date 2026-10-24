import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getLessonById } from '@/lib/curriculum';
import LessonQuiz from '@/components/LessonQuiz';
import CourseProgressGate from '@/components/CourseProgressGate';
import LessonCheatSheet from '@/components/academy/LessonCheatSheet';
import {
  SmcLiquiditySweepDiagram,
  FvgOrderBlockDiagram,
  SessionKillzonesDiagram,
  RiskRewardMatrixDiagram,
  DiagramTeaserPreview
} from '@/components/academy/TradingDiagrams';
import { getQuizForLesson, getCheatSheetData } from '@/lib/quizData';
import { evaluateLessonAccess, FirewallGateReason } from '@/lib/curriculum-firewall';

interface LessonPageProps {
  params: Promise<{
    lessonSlug: string;
  }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);

  if (!lesson) {
    return {
      title: 'Lesson Not Found | Velarion Markets Forex School'
    };
  }

  return {
    title: `Lesson ${lesson.globalNum}: ${lesson.title} | Velarion Forex School`,
    description: lesson.summary,
    openGraph: {
      title: `Lesson ${lesson.globalNum}: ${lesson.title} | Velarion Forex School`,
      description: lesson.summary,
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://velarion-one.vercel.app'}/academy/lesson-${lesson.globalNum}`,
      type: 'article',
    },
    robots: { index: true, follow: true }
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);

  if (!lesson) {
    notFound();
  }

  const cookieStore = await cookies();

  // 1. Retrieve completed lessons from verified server session cookie
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

  // 2. Check Supabase Auth & Verified Profile
  const ADMIN_EMAILS = ['ashirumaabala@gmail.com'];
  let isAdmin = false;
  let isFunded = false;
  let mt5AccountId: string | null = null;

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status, is_admin, mt5_account_id, is_funded')
        .eq('id', data.user.id)
        .maybeSingle();

      const isStaffEmail = data.user.email ? ADMIN_EMAILS.includes(data.user.email.toLowerCase()) : false;
      isAdmin = Boolean(profile?.is_admin) || isStaffEmail;
      isFunded = Boolean(profile?.is_funded) || isAdmin;
      mt5AccountId = profile?.mt5_account_id || null;
    }
  } catch {
    // Supabase fallback
  }

  // 3. Check Admin Master Token
  const adminSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const isOwner = Boolean(
    (adminSecret && adminToken === adminSecret) ||
    isAdmin
  );

  const isLinked = Boolean(
    isOwner ||
    mt5AccountId ||
    cookieStore.get('velarion_mt5_account')?.value
  );

  // 4. Evaluate Server-Authoritative Content Firewall
  const firewall = evaluateLessonAccess({
    lessonNum: lesson.globalNum,
    completedLessons,
    isLinked,
    isFunded,
    isAdmin: isOwner,
  });

  const isLocked = !firewall.allowed;
  const gateReason: FirewallGateReason = firewall.gateReason;
  const nextRequiredLesson = firewall.requiredLessonNum || firewall.nextAllowedLesson;

  const prevLessonNum = lesson.globalNum > 1 ? lesson.globalNum - 1 : null;
  const nextLessonNum = lesson.globalNum < 30 ? lesson.globalNum + 1 : null;
  const wordCount = lesson.content ? lesson.content.split(/\s+/).length : 500;
  const estReadingTime = `${Math.max(3, Math.ceil(wordCount / 180))} min read`;

  // First introductory paragraph for SEO crawlers and preview
  const firstParagraph = lesson.content
    ? lesson.content.split('\n\n')[0]
    : lesson.summary;

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Lesson ${lesson.globalNum}: ${lesson.title}`,
    description: lesson.summary,
    educationalLevel: lesson.levelTitle,
    learningResourceType: 'Lesson',
    isAccessibleForFree: true,
    provider: {
      '@type': 'Organization',
      name: 'Velarion Markets',
      url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velarion-one.vercel.app'
    }
  };

  // Select appropriate technical diagram based on lesson topic
  const renderTechnicalDiagram = () => {
    if (lesson.globalNum === 1) {
      return <SessionKillzonesDiagram />;
    }
    if (lesson.globalNum === 2 || lesson.globalNum === 14 || lesson.globalNum === 17) {
      return <SmcLiquiditySweepDiagram />;
    }
    if (lesson.globalNum === 3 || lesson.globalNum === 15 || lesson.globalNum === 18) {
      return <FvgOrderBlockDiagram />;
    }
    if (lesson.globalNum === 4 || lesson.globalNum === 5 || lesson.globalNum === 23) {
      return <RiskRewardMatrixDiagram />;
    }

    if (lesson.diagram && lesson.diagram.includes('<svg')) {
      return (
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xs)',
          padding: '16px',
          overflowX: 'auto'
        }}>
          <div dangerouslySetInnerHTML={{ __html: lesson.diagram }} />
        </div>
      );
    }

    return <SmcLiquiditySweepDiagram />;
  };

  const cheatSheet = getCheatSheetData(lesson.globalNum, lesson.title);
  const quizQuestions = getQuizForLesson(lesson.globalNum, lesson.quiz);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <CourseProgressGate lessonNum={lesson.globalNum}>
      <article className="lesson-content" style={{ maxWidth: '820px', margin: '40px auto 80px', padding: '0 20px' }}>
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
          <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <Link href="/academy" style={{ color: 'var(--text-secondary)' }}>Forex School</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--accent-gold)' }}>Lesson {lesson.globalNum}</span>
        </nav>

        {/* Lesson Header */}
        <header style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px', flexWrap: 'wrap' }}>
            <span className={`status-badge ${
              lesson.level === 'beginner'
                ? 'status-completed'
                : lesson.level === 'intermediate'
                ? 'status-warning'
                : 'status-danger'
            }`}>
              {lesson.levelTitle.toUpperCase()} &bull; TIER {lesson.level === 'beginner' ? '1' : lesson.level === 'intermediate' ? '2' : '3'}
            </span>

            {lesson.globalNum <= 2 ? (
              <span className="status-badge status-completed">
                FOUNDATION TRACK &bull; FREE
              </span>
            ) : lesson.globalNum <= 5 ? (
              <span className="status-badge" style={{ background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', borderColor: 'rgba(56, 189, 248, 0.35)' }}>
                DYNAMICS TRACK &bull; MT5 LINK REQUIRED
              </span>
            ) : (
              <span className="status-badge" style={{ background: 'var(--accent-gold-subtle)', color: 'var(--accent-gold)', borderColor: 'var(--border-accent)' }}>
                INSTITUTIONAL TRACK &bull; MIN. USD 50 DEPOSIT
              </span>
            )}

            <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              Lesson {lesson.globalNum} of 30
            </span>
            <span className="mono-nums" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              &bull; {estReadingTime}
            </span>
          </div>

          <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '14px', letterSpacing: '-0.5px' }}>
            {lesson.title}
          </h1>

          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {lesson.summary}
          </p>
        </header>

        {/* Learning Objectives */}
        {lesson.objectives && lesson.objectives.length > 0 && (
          <section aria-label="Core Learning Objectives" style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-xs)',
            padding: '20px 24px',
            marginBottom: '32px'
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '10px' }}>
              Core Learning Objectives
            </div>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13.5px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '8px', lineHeight: 1.5 }}>
              {lesson.objectives.map((obj, i) => (
                <li key={i}>{obj}</li>
              ))}
            </ul>
          </section>
        )}

        {/* Gated Paywall View vs Full Content View */}
        {isLocked ? (
          <div style={{ position: 'relative', marginBottom: '40px' }}>
            {/* Introductory Teaser Paragraph for SEO Crawlers */}
            <div style={{
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs)',
              padding: '24px 28px',
              marginBottom: '24px'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                Lesson {lesson.globalNum} Overview
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {firstParagraph}
              </p>
            </div>

            {/* Blurred SVG Diagram Preview */}
            <DiagramTeaserPreview lessonNum={lesson.globalNum} />

                        {/* Checkpoint 00: Sequential Progression Firewall */}
            {gateReason === 'sequence_locked' && (
              <div className="lesson-unlock-card" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-accent, #e1c47c)',
                borderRadius: 'var(--radius-xs)',
                padding: '36px 32px',
                textAlign: 'center',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xs)', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    CURRICULUM FIREWALL / SEQUENTIAL PROGRESS REQUIRED
                  </span>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                  Lesson {lesson.globalNum} Is Locked
                </h2>

                <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px' }}>
                  To ensure mathematical discipline and eliminate premature losses, curriculum units must be completed in sequential order. You must complete and pass <strong>Lesson {nextRequiredLesson}</strong> before this unit unlocks.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <Link
                    href={`/academy/lesson-${nextRequiredLesson}`}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Resume Lesson {nextRequiredLesson} &rarr;
                  </Link>
                  <Link
                    href="/school"
                    className="btn btn-secondary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    View Curriculum Overview &rarr;
                  </Link>
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Current verified progress: {completedLessons.length} of 30 lessons certified.
                </div>
              </div>
            )}

            {/* Checkpoint 01: Account Link Required (Lessons 3 to 5) */}
            {gateReason === 'link_required' && (
              <div className="lesson-unlock-card" style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-accent, #e1c47c)',
                borderRadius: 'var(--radius-xs)',
                padding: '36px 32px',
                textAlign: 'center',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 'var(--radius-xs)', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    CHECKPOINT 01 / JUSTMARKETS ACCOUNT LINK REQUIRED
                  </span>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                  Unlock Lessons 3, 4 &amp; 5: Institutional Dynamics
                </h2>

                <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px' }}>
                  You have mastered market structure fundamentals in Lessons 1 &amp; 2. To study Fair Value Gaps, Institutional Order Blocks, and Asymmetric Risk Management (Lessons 3 to 5), connect your JustMarkets MT5 account. Subsidized 100% free under official partner code <strong style={{ color: 'var(--accent-gold)' }}>tohstb0d83</strong>.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '480px', margin: '0 auto 28px', textAlign: 'left', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>[+]</span>
                    <span><strong>Instant Study Access</strong>: Unlock Lessons 3, 4 &amp; 5 immediately upon linking</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>[+]</span>
                    <span><strong>Least-Privilege Security</strong>: Zero master passwords required or stored</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>[+]</span>
                    <span><strong>100% Free</strong>: Subsidized through official Introducing Broker partnership</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <Link
                    href={`/accounts?redirect=/academy/lesson-${lesson.globalNum}`}
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Link JustMarkets MT5 Account &rarr;
                  </Link>
                  <a
                    href="https://one.justmarkets.link/a/tohstb0d83"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-outline-gold"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Open Free JustMarkets Account &rarr;
                  </a>
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Already registered under partner code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</code>? Link your MT5 Account ID for instant activation.
                </div>
              </div>
            )}

            {/* Checkpoint 02: Deposit Required (Lessons 6 to 30) */}
            {gateReason === 'deposit_required' && (
              <div className="lesson-unlock-card" style={{
                background: 'linear-gradient(180deg, rgba(20, 84, 55, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%)',
                border: '1px solid var(--border-accent, #e1c47c)',
                borderRadius: 'var(--radius-xs)',
                padding: '36px 32px',
                textAlign: 'center',
                boxShadow: '0 20px 48px rgba(0, 0, 0, 0.65)'
              }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xs)', marginBottom: '20px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
                    CHECKPOINT 02 / MIN. USD 50 LIVE DEPOSIT REQUIRED
                  </span>
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                  Unlock Lesson {lesson.globalNum} &amp; Complete Quantitative Academy
                </h2>

                <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px' }}>
                  To preserve institutional edge and maintain execution discipline, Lessons 6 through 30 (covering Institutional SMC Execution, Multi-Agent Confluence, and the 200-Pip Growth Matrix) plus our Autonomous Live Trading Terminal are reserved for active traders who have deposited at least <strong>USD 50</strong> into their live JustMarkets account.
                </p>

                {/* 4 Compelling Value Drivers */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '520px', margin: '0 auto 28px', textAlign: 'left', fontSize: '13px', color: 'var(--text-primary)' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                    <span><strong>Autonomous AI Signals</strong>: Live London &amp; NY Overlap momentum triggers streamed directly onto your terminal.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                    <span><strong>Institutional Order Flow Blotter</strong>: Real-time detection of Smart Money liquidity sweeps, traps, and imbalances.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: 'var(--accent-gold)', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                    <span><strong>Complete 30-Lesson Syllabus</strong>: Full access to the institutional SMC curriculum and 200-pip compounding matrix.</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <span style={{ color: '#10B981', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                    <span><strong>100% Capital Custody</strong>: Zero platform subscription fees. Your USD 50 stays in your regulated JustMarkets MT5 account to trade or withdraw anytime.</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                  <a
                    href="https://one.justmarkets.link/a/tohstb0d83"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Deposit Minimum USD 50 on JustMarkets &rarr;
                  </a>
                  <Link
                    href={`/accounts?redirect=/academy/lesson-${lesson.globalNum}`}
                    className="btn btn-outline-gold"
                    style={{ padding: '12px 24px', fontSize: '14px' }}
                  >
                    Verify Funded MT5 Account &rarr;
                  </Link>
                </div>

                <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Already deposited? Link your MT5 Account ID for automated verification.
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ============================================================== */
          /* FULL LESSON CONTENT & ASSESSMENTS (UNLOCKED)                   */
          /* ============================================================== */
          <>
            {/* Section 1: Key Concept & Theory */}
            <section aria-label="Key Concept & Core Theory" className="panel-card" style={{ padding: '32px', lineHeight: 1.75, fontSize: '15px', color: 'var(--text-primary)', marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
                Core Concept &bull; Theoretical Foundation
              </div>
              <div
                style={{ whiteSpace: 'pre-line' }}
                dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n\n/g, '<br /><br />') }}
              />
            </section>

            {/* Section 2: Technical Application / Custom Dark-Mode SVG Diagram */}
            <section aria-label="Technical Application" style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                Technical Application &bull; Execution Diagram
              </div>
              {renderTechnicalDiagram()}
            </section>

            {/* Section 3: Real Market Example */}
            {lesson.example && (
              <section aria-label="Real Market Example" style={{
                background: 'var(--bg-surface-1)',
                borderLeft: '4px solid var(--accent-gold)',
                borderTop: '1px solid var(--border-default)',
                borderRight: '1px solid var(--border-default)',
                borderBottom: '1px solid var(--border-default)',
                padding: '20px 24px',
                borderRadius: '0 var(--radius-xs) var(--radius-xs) 0',
                marginBottom: '32px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Real Market Example &bull; XAUUSD Execution
                </div>
                <div
                  style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}
                  dangerouslySetInnerHTML={{ __html: lesson.example }}
                />
              </section>
            )}

            {/* Section 4: Shareable Key Takeaways Cheat Sheet */}
            <section aria-label="Key Takeaways Cheat Sheet">
              <LessonCheatSheet
                lessonNum={lesson.globalNum}
                title={lesson.title}
                takeaways={cheatSheet.takeaways}
                proTip={cheatSheet.proTip}
              />
            </section>

            {/* Section 5: Interactive 3-Question Micro-Assessment */}
            <section aria-label="Knowledge Assessment">
              <LessonQuiz
                lessonId={lesson.id}
                globalNum={lesson.globalNum}
                quiz={quizQuestions}
                nextLessonNum={nextLessonNum}
              />
            </section>
          </>
        )}

        {/* Milestone 1 Checkpoint: After Finishing Lesson 2 */}
        {lesson.globalNum === 2 && (
          <section
            style={{
              marginTop: '36px',
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.08) 0%, rgba(15, 23, 42, 0.7) 100%)',
              border: '1px solid var(--accent-gold, #D4AF37)',
              borderRadius: '8px',
              padding: '28px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: 'rgba(212, 175, 55, 0.15)', borderRadius: '4px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold, #D4AF37)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'monospace' }}>
                MILESTONE 1 / ACCOUNT CONFIGURATION
              </span>
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Step 1 Complete: Link Your JustMarkets Trading Account
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '680px', marginBottom: '20px' }}>
              Great job completing the first two foundation lessons on market structure and liquidity. Before proceeding through Lessons 3, 4, and 5, link your JustMarkets MT5 trading account so your telemetry and blotter are configured.
            </p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <Link
                href="/accounts"
                className="btn btn-primary"
                style={{ padding: '10px 20px', fontSize: '13.5px', textDecoration: 'none', background: 'var(--accent-gold)', color: '#030712', fontWeight: 700 }}
              >
                Link JustMarkets Account &rarr;
              </Link>
              <Link
                href="/academy/lesson-3"
                className="btn btn-secondary"
                style={{ padding: '10px 20px', fontSize: '13.5px', textDecoration: 'none' }}
              >
                Proceed to Lesson 3 &rarr;
              </Link>
            </div>
          </section>
        )}

        {/* Milestone 2 Checkpoint: After Finishing Lesson 5 */}
        {lesson.globalNum === 5 && (
          <section
            style={{
              marginTop: '36px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(15, 23, 42, 0.8) 100%)',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              borderRadius: '8px',
              padding: '32px 28px',
            }}
          >
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 10px', background: 'rgba(16, 185, 129, 0.15)', borderRadius: '4px', marginBottom: '12px' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-green, #10B981)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'monospace' }}>
                MILESTONE 2 / LIVE TRADING FLOOR ACTIVATION
              </span>
            </div>
            <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Core Foundations Mastered: Activate the Live Trading Floor
            </h3>
            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '720px', marginBottom: '16px' }}>
              Congratulations on completing Lessons 1 through 5. You have mastered session timing, liquidity mechanics, and risk ratios. You are now eligible to activate the <strong>Live Trading Terminal</strong> and continue learning through advanced Lessons 6 to 30.
            </p>

            <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '16px 20px', marginBottom: '22px' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '6px' }}>
                Requirement: Minimum USD 50 Deposit on Live MT5 Account
              </div>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
                Fund at least USD 50 directly in your own regulated JustMarkets live account (Partner code: <code>tohstb0d83</code>). 100% Capital Custody: your capital remains under your complete control with the broker at all times.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '11px 22px', fontSize: '13.5px', background: 'var(--accent-gold)', color: '#030712', fontWeight: 700, textDecoration: 'none' }}
              >
                Deposit on JustMarkets (Min $50) &rarr;
              </a>
              <Link
                href="/terminal"
                className="btn btn-secondary"
                style={{ padding: '11px 22px', fontSize: '13.5px', textDecoration: 'none', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-default)' }}
              >
                Open Live Trading Terminal &rarr;
              </Link>
              <Link
                href="/academy/lesson-6"
                className="btn btn-ghost"
                style={{ padding: '11px 18px', fontSize: '13.5px', color: 'var(--text-muted)' }}
              >
                Proceed to Lesson 6 &rarr;
              </Link>
            </div>
          </section>
        )}

        {/* Prev / Next Navigation Controls */}
        <div style={{
          marginTop: '40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingTop: '20px',
          borderTop: '1px solid var(--border-default)'
        }}>
          {prevLessonNum ? (
            <Link
              href={`/academy/lesson-${prevLessonNum}`}
              className="btn btn-secondary"
              style={{ fontSize: '13px' }}
            >
              &larr; Previous (Lesson {prevLessonNum})
            </Link>
          ) : (
            <div />
          )}

          {nextLessonNum ? (
            <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>
              Pass this lesson&apos;s assessment to unlock the next lesson.
            </span>
          ) : (
            <Link
              href="/academy"
              className="btn btn-primary"
              style={{ fontSize: '13px' }}
            >
              Return to Catalog &rarr;
            </Link>
          )}
        </div>

        {/* Broker Partnership Callout */}
        <aside style={{
          marginTop: '36px',
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xs)',
          padding: '18px 22px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px'
        }}>
          <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '520px' }}>
            Practice these strategies in live spot market conditions with an official JustMarkets MT5 account. 100% non-custodial capital protection.
          </div>
          <a
            href="https://one.justmarkets.link/a/tohstb0d83"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-gold"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Open MT5 Account &rarr;
          </a>
        </aside>
      </article>
      </CourseProgressGate>
    </>
  );
}

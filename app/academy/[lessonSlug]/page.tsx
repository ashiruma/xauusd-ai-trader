import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
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
    alternates: { canonical: `https://velarion-one.vercel.app/academy/lesson-${lesson.globalNum}` },
    openGraph: {
      title: `Lesson ${lesson.globalNum}: ${lesson.title} | Velarion Forex School`,
      description: lesson.summary,
      url: `https://velarion-one.vercel.app/academy/lesson-${lesson.globalNum}`,
      type: 'article',
    },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } }
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);

  if (!lesson) {
    notFound();
  }

  const cookieStore = await cookies();
  const { getServerSession } = await import('@/lib/auth');
  const session = await getServerSession();
  const masterSecret = process.env.ADMIN_MASTER_SECRET;
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const hasAdmin = Boolean(masterSecret && adminToken === masterSecret);
  const isLocked = !hasAdmin && (lesson.globalNum > 5 && (!session || !session.verified || !session.schoolCompleted));

  const prevLessonNum = lesson.globalNum > 1 ? lesson.globalNum - 1 : null;
  const nextLessonNum = lesson.globalNum < 30 ? lesson.globalNum + 1 : null;
  const wordCount = lesson.content ? lesson.content.split(/\s+/).length : 500;
  const estReadingTime = `${Math.max(3, Math.ceil(wordCount / 180))} min read`;

  // Preview only the already-public summary, never an excerpt of protected material.
  const firstParagraph = lesson.summary;

  const courseJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `Lesson ${lesson.globalNum}: ${lesson.title}`,
    description: lesson.summary,
    educationalLevel: lesson.levelTitle,
    learningResourceType: 'Lesson',
    provider: {
      '@type': 'Organization',
      name: 'Velarion Markets',
      url: 'https://velarion-one.vercel.app'
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

    // Default fallback to SVG if present in curriculum data or SMC sweep diagram
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

            {lesson.globalNum <= 5 ? (
              <span className="status-badge status-completed">
                FOUNDATION TRACK &bull; FREE
              </span>
            ) : (
              <span className="status-badge" style={{ background: 'var(--accent-gold-subtle)', color: 'var(--accent-gold)', borderColor: 'var(--border-accent)' }}>
                INSTITUTIONAL TRACK &bull; MT5 SPONSORED
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

        {/* Only the existing public title/summary are outside the progress gate. */}
        <CourseProgressGate lessonNum={lesson.globalNum}>
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
          /* ============================================================== */
          /* SERVER-SIDE SECURED PAYWALL CARD                               */
          /* Notice: Full content, diagram & quiz are omitted on the server */
          /* ============================================================== */
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

            {/* Unhackable Gate Overlay Card */}
            <div className="lesson-unlock-card" style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-accent, #e1c47c)',
              borderRadius: 'var(--radius-xs)',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xs)', marginBottom: '20px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Partner-sponsored access &bull; Broker costs apply
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                Unlock Lesson {lesson.globalNum} &amp; Complete Academy
              </h2>

              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px' }}>
                Lessons 6 through 30 (covering Institutional SMC Execution, Multi-Agent AI Confluence, and the 200-Pip Growth Matrix) plus our Live XAUUSD AI Terminal have <strong style={{ color: 'var(--accent-gold)' }}>no platform subscription fee</strong>&mdash;subject to partner eligibility with <strong>JustMarkets</strong>.
              </p>

              {/* Institutional Benefit Checkmarks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '460px', margin: '0 auto 28px', textAlign: 'left', fontSize: '13px', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>&#10003;</span>
                  <span>Zero subscription fees &bull; No payment cards required</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>&#10003;</span>
                  <span>Broker custody &bull; Trading losses remain possible</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>&#10003;</span>
                  <span>Sequential learning &bull; Separate automation consent required</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <a
                  href="https://one.justmarkets.link/a/tohstb0d83"
                  target="_blank"
                  rel="noopener noreferrer sponsored"
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Review JustMarkets registration &rarr;
                </a>
                <Link
                  href={`/onboarding?redirect=/academy/lesson-${lesson.globalNum}`}
                  className="btn btn-outline-gold"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Verify Existing MT5 ID &rarr;
                </Link>
              </div>

              <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Already registered under partner code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</code>? Submit your MT5 Account ID for verification; this does not activate automation.
              </div>
            </div>
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
            Review broker eligibility and risks before registering. Funds held with a broker remain exposed to trading loss. Learning and account linking do not activate automation.
          </div>
          <a
            href="https://one.justmarkets.link/a/tohstb0d83"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="btn btn-outline-gold"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Open MT5 Account &rarr;
          </a>
        </aside>
        </CourseProgressGate>
      </article>
    </>
  );
}

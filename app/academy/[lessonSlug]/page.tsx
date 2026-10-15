import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getLessonById } from '@/lib/curriculum';
import LessonQuiz from '@/components/LessonQuiz';

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

  const isPublicPreview = lesson.globalNum <= 5;

  return {
    title: `Lesson ${lesson.globalNum}: ${lesson.title} | Velarion Forex School`,
    description: lesson.summary,
    openGraph: {
      title: `Lesson ${lesson.globalNum}: ${lesson.title} | Velarion Forex School`,
      description: lesson.summary,
      url: `https://velarionmarkets.com/academy/lesson-${lesson.globalNum}`,
      type: 'article',
    },
    robots: isPublicPreview
      ? { index: true, follow: true }
      : { index: true, follow: true }
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);

  if (!lesson) {
    notFound();
  }

  const cookieStore = await cookies();
  const isMt5Verified = cookieStore.get('velarion_mt5_verified')?.value === 'true';
  const isLocked = lesson.globalNum > 5 && !isMt5Verified;

  const prevLessonNum = lesson.globalNum > 1 ? lesson.globalNum - 1 : null;
  const nextLessonNum = lesson.globalNum < 30 ? lesson.globalNum + 1 : null;
  const wordCount = lesson.content ? lesson.content.split(/\s+/).length : 500;
  const estReadingTime = `${Math.max(3, Math.ceil(wordCount / 180))} min read`;

  // First 250 characters as preview snippet if locked
  const previewSnippet = lesson.content
    ? lesson.content.slice(0, 320).replace(/\n/g, ' ') + '...'
    : '';

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
      url: 'https://velarionmarkets.com'
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseJsonLd) }}
      />

      <article style={{ maxWidth: '780px', margin: '40px auto 80px', padding: '0 20px' }}>
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
                PUBLIC PREVIEW
              </span>
            ) : (
              <span className="status-badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-gold)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
                PARTNER SPONSORED &bull; 100% FREE
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
            borderRadius: 'var(--radius-md)',
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
          /* Notice: Full content and quiz are NOT sent in the HTML stream  */
          /* ============================================================== */
          <div style={{ position: 'relative', marginBottom: '40px' }}>
            {/* Teaser Preview with Blur Fade */}
            <div style={{
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '28px',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                Lesson Overview &bull; Preview
              </div>
              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.7, margin: 0 }}>
                {previewSnippet}
              </p>
              <div style={{
                height: '80px',
                background: 'linear-gradient(to bottom, rgba(14,22,37,0) 0%, var(--bg-surface-1) 100%)',
                marginTop: '-40px',
                position: 'relative',
                pointerEvents: 'none'
              }} />
            </div>

            {/* Unhackable Gate Overlay Card */}
            <div style={{
              marginTop: '24px',
              background: 'linear-gradient(180deg, rgba(14,22,37,0.95) 0%, rgba(9,13,22,0.98) 100%)',
              border: '1px solid var(--border-gold)',
              borderRadius: 'var(--radius-lg)',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', marginBottom: '20px' }}>
                <span className="status-indicator live" style={{ background: 'var(--accent-gold)' }} />
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                  Sponsored by JustMarkets &bull; 100% Free
                </span>
              </div>

              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                Unlock Lesson {lesson.globalNum} &amp; Complete Academy
              </h2>

              <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px' }}>
                Lessons 6 through 30, technical execution diagrams, real-time case studies, and quantitative assessments are 100% subsidized when you connect an MT5 account registered with our official broker partner.
              </p>

              {/* Institutional Benefit Checkmarks */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '440px', margin: '0 auto 28px', textAlign: 'left', fontSize: '13px', color: 'var(--text-primary)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>&#10003;</span>
                  <span>Zero subscription fees &bull; No credit card required</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>&#10003;</span>
                  <span>100% Capital Custody &bull; Deposits stay in your own MT5 account</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>&#10003;</span>
                  <span>Instant Unlock &bull; Complete 30 lessons + Autonomous AI Terminal</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
                <Link
                  href={`/onboarding?redirect=/academy/lesson-${lesson.globalNum}`}
                  className="btn btn-primary"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Verify MT5 Account (Instant Unlock) &rarr;
                </Link>
                <a
                  href="https://one.justmarkets.link/a/tohstb0d83"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-gold"
                  style={{ padding: '12px 24px', fontSize: '14px' }}
                >
                  Register on JustMarkets &rarr;
                </a>
              </div>

              <div style={{ marginTop: '20px', fontSize: '12px', color: 'var(--text-muted)' }}>
                Already registered under partner code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</code>? Simply enter your MT5 account ID on the verification page.
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

            {/* Section 2: Technical Application / Execution Diagram */}
            {lesson.diagram && (
              <section aria-label="Technical Application" className="panel-card" style={{ padding: '24px', marginBottom: '32px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '14px' }}>
                  Technical Application &bull; Execution Diagram
                </div>
                <div style={{
                  background: 'var(--bg-base)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '16px',
                  overflowX: 'auto'
                }}>
                  {lesson.diagram.includes('<svg') ? (
                    <div dangerouslySetInnerHTML={{ __html: lesson.diagram }} />
                  ) : (
                    <pre style={{
                      margin: 0,
                      fontSize: '12px',
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      lineHeight: 1.5
                    }}>
                      {lesson.diagram}
                    </pre>
                  )}
                </div>
              </section>
            )}

            {/* Section 3: Real Market Example */}
            {lesson.example && (
              <section aria-label="Real Market Example" style={{
                background: 'var(--bg-surface-1)',
                borderLeft: '4px solid var(--accent-gold)',
                borderTop: '1px solid var(--border-default)',
                borderRight: '1px solid var(--border-default)',
                borderBottom: '1px solid var(--border-default)',
                padding: '20px 24px',
                borderRadius: '0 var(--radius-md) var(--radius-md) 0',
                marginBottom: '32px'
              }}>
                <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                  Real Market Example
                </div>
                <div
                  style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.65 }}
                  dangerouslySetInnerHTML={{ __html: lesson.example }}
                />
              </section>
            )}

            {/* Section 4: Knowledge Check / Interactive Quiz */}
            <section aria-label="Knowledge Assessment">
              <LessonQuiz
                lessonId={lesson.id}
                globalNum={lesson.globalNum}
                quiz={lesson.quiz}
                nextLessonNum={nextLessonNum}
              />
            </section>
          </>
        )}

        {/* Prev / Next Navigation Controls */}
        <div style={{
          marginTop: '36px',
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
            <Link
              href={`/academy/lesson-${nextLessonNum}`}
              className="btn btn-primary"
              style={{ fontSize: '13px' }}
            >
              Next: Lesson {nextLessonNum} &rarr;
            </Link>
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
          borderRadius: 'var(--radius-md)',
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
    </>
  );
}

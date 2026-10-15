import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { getAllLessons, getLessonById } from '@/lib/curriculum';
import LessonQuiz from '@/components/LessonQuiz';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

interface LessonPageProps {
  params: Promise<{
    lessonSlug: string;
  }>;
}

export async function generateStaticParams() {
  const lessons = getAllLessons();
  return lessons.map((l) => ({
    lessonSlug: `lesson-${l.globalNum}`
  }));
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);

  if (!lesson) {
    return {
      title: 'Lesson Not Found | Velarion Forex Academy'
    };
  }

  return {
    title: `Lesson ${lesson.globalNum}: ${lesson.title} | Velarion Forex Academy`,
    description: lesson.summary,
    openGraph: {
      title: `Lesson ${lesson.globalNum}: ${lesson.title} | Velarion Forex Academy`,
      description: lesson.summary,
      url: `https://xauusd-ai-trader.vercel.app/academy/lesson-${lesson.globalNum}`
    }
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);

  if (!lesson) {
    notFound();
  }

  const prevLessonNum = lesson.globalNum > 1 ? lesson.globalNum - 1 : null;
  const nextLessonNum = lesson.globalNum < 30 ? lesson.globalNum + 1 : null;
  const wordCount = lesson.content ? lesson.content.split(/\s+/).length : 500;
  const estReadingTime = `${Math.max(3, Math.ceil(wordCount / 180))} min read`;

  return (
    <article style={{ maxWidth: '740px', margin: '40px auto 80px', padding: '0 20px' }}>
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href="/academy" style={{ color: 'var(--text-secondary)' }}>Forex Academy</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--accent-gold)' }}>Lesson {lesson.globalNum}</span>
      </nav>

      {/* Lesson Header */}
      <header style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <span className={`status-badge ${
            lesson.level === 'beginner'
              ? 'status-completed'
              : lesson.level === 'intermediate'
              ? 'status-warning'
              : 'status-danger'
          }`}>
            {lesson.levelTitle.toUpperCase()} &bull; TIER {lesson.level === 'beginner' ? '1' : lesson.level === 'intermediate' ? '2' : '3'}
          </span>
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
            Return to Academy Catalog &rarr;
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
          Practice this concept in real market conditions with an official JustMarkets demo MT5 account using partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>.
        </div>
        <a
          href={DEFAULT_PARTNER_CONFIG.primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-outline-gold"
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Open MT5 Demo &rarr;
        </a>
      </aside>
    </article>
  );
}

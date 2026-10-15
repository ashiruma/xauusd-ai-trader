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

  return (
    <div style={{ maxWidth: '960px', margin: '40px auto 80px', padding: '0 24px' }}>
      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link> &gt;{' '}
        <Link href="/academy" style={{ color: 'var(--accent-gold)' }}>Forex Academy</Link> &gt;{' '}
        <span>Lesson {lesson.globalNum}</span>
      </div>

      {/* Lesson Header */}
      <div style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
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
        </div>

        <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.25, marginBottom: '12px' }}>
          {lesson.title}
        </h1>

        <p style={{ fontSize: '16px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {lesson.summary}
        </p>
      </div>

      {/* Learning Objectives Box */}
      {lesson.objectives && lesson.objectives.length > 0 && (
        <div style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-gold)',
          borderRadius: 'var(--radius-md)',
          padding: '20px',
          marginBottom: '32px'
        }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
            Core Learning Objectives
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '13.5px', color: 'var(--text-primary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {lesson.objectives.map((obj, i) => (
              <li key={i}>{obj}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Main Educational Content */}
      <div className="panel-card" style={{ padding: '32px', lineHeight: 1.8, fontSize: '15px', color: 'var(--text-primary)' }}>
        <div
          style={{ whiteSpace: 'pre-line' }}
          dangerouslySetInnerHTML={{ __html: lesson.content.replace(/\n\n/g, '<br /><br />') }}
        />

        {/* Practical Example */}
        {lesson.example && (
          <div style={{
            marginTop: '28px',
            background: 'var(--bg-surface-2)',
            borderLeft: '4px solid var(--accent-gold)',
            padding: '16px 20px',
            borderRadius: '0 6px 6px 0'
          }}>
            <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Practical Market Example
            </div>
            <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              {lesson.example}
            </div>
          </div>
        )}

        {/* Conceptual Diagram / Notes */}
        {lesson.diagram && (
          <div style={{
            marginTop: '20px',
            background: 'var(--bg-surface-3)',
            border: '1px solid var(--border-default)',
            padding: '16px 20px',
            borderRadius: '6px'
          }}>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Execution Diagram &bull; Market Mechanics
            </div>
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
          </div>
        )}
      </div>

      {/* Interactive Quiz Assessment */}
      <LessonQuiz
        lessonId={lesson.id}
        globalNum={lesson.globalNum}
        quiz={lesson.quiz}
        nextLessonNum={nextLessonNum}
      />

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
            className="btn btn-gold"
            style={{ fontSize: '13px' }}
          >
            Next: Lesson {nextLessonNum} &rarr;
          </Link>
        ) : (
          <Link
            href="/academy"
            className="btn btn-gold"
            style={{ fontSize: '13px' }}
          >
            Return to Academy Catalog &rarr;
          </Link>
        )}
      </div>

      {/* Regulated Broker Subsidized Callout */}
      <div style={{
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
        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
          Practice this lesson risk-free on a regulated JustMarkets MT5 demo account with partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>.
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
      </div>
    </div>
  );
}

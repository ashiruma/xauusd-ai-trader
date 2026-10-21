import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getLessonById } from '@/lib/curriculum';
import { COURSE_MANIFEST, CORE_LESSON_COUNT, lessonNeighbors, visibleLessons } from '@/lib/course-manifest';

interface LessonPageProps {
  params: Promise<{ lessonSlug: string }>;
}

export async function generateMetadata({ params }: LessonPageProps): Promise<Metadata> {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);
  if (!lesson) return { title: 'Lesson Not Found | Velarion Markets Forex School' };
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
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  };
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonSlug } = await params;
  const lesson = getLessonById(lessonSlug);
  if (!lesson) notFound();
  const { previous, next } = lessonNeighbors(lesson.id);
  const required = COURSE_MANIFEST.requiredCoreLessonIds.includes(lesson.id);

  // Deliberately summary-only for EVERY caller, including existing signed/admin
  // sessions. Existing identity/progress writers are not trustworthy enough to
  // release private data. No localStorage, query flag, cookie or owner bypass.
  // A client gate around server children would still leak those children in RSC.
  return (
    <article className="lesson-content" style={{ maxWidth: '820px', margin: '40px auto 80px', padding: '0 20px' }}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '20px' }}>
        <Link href="/">Home</Link> / <Link href="/academy">Forex School</Link> / Lesson {lesson.globalNum}
      </nav>
      <header style={{ marginBottom: '32px' }}>
        <span className="status-badge">{lesson.levelTitle} · Lesson {lesson.globalNum} · {required ? `Required core (${CORE_LESSON_COUNT} total)` : 'Optional extension'} · {visibleLessons().length} summaries</span>
        <h1>{lesson.title}</h1>
        <p>{lesson.summary}</p>
      </header>
      <section className="course-access-state course-access-locked" aria-labelledby="course-content-status">
        <h2 id="course-content-status">Lesson content temporarily unavailable</h2>
        <p>Public summaries remain available. Full lessons and assessments are withheld while verified server-side identity and sequential learning records are secured. Signing in or editing browser progress does not unlock content during this review.</p>
        <p>Required learning and quizzes remain prerequisites; unavailable assessments do not count as completed. Registration, funding, learning and account linking never activate automation. Automation requires its own separate explicit consent.</p>
        <Link className="btn btn-primary" href="/academy">Browse public lesson summaries</Link>
        {' '}<Link href="/how-it-works">Review the learning and activation journey</Link>
      </section>
      <nav aria-label="Lesson summaries" style={{ marginTop: '32px', display: 'flex', justifyContent: 'space-between' }}>
        {previous ? <Link href={previous.route}>Previous summary</Link> : <span />}
        {next ? <Link href={next.route}>Next summary</Link> : <Link href="/academy">Return to catalog</Link>}
      </nav>
    </article>
  );
}

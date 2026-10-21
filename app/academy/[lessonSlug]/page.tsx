import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLessonByGlobalNum } from '@/lib/curriculum';
export const metadata = { title: 'Curriculum summary | Velarion', robots: { index: false, follow: true } };
export default async function LessonPage({ params }: { params: Promise<{ lessonSlug: string }> }) {
  const { lessonSlug } = await params;
  const match = /^lesson-([1-9]|[12][0-9]|30)$/.exec(lessonSlug);
  if (!match) notFound();
  const lesson = getLessonByGlobalNum(Number(match[1]));
  if (!lesson) notFound();
  return <main style={{ maxWidth: 820, margin: '48px auto', padding: '0 24px' }}>
    <span className="status-badge">SUMMARY ONLY · DELIVERY DISABLED</span>
    <h1>Lesson {lesson.globalNum}: {lesson.title}</h1><p>{lesson.summary}</p>
    <p>Protected content and assessments are not available. No completion can be awarded by this preview.</p>
    <Link href="/academy">Back to the 30-lesson preview</Link>
  </main>;
}

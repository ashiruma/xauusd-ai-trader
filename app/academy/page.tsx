import React from 'react';
import Link from 'next/link';
import { getAllLessons } from '@/lib/curriculum';
export default function AcademyPage() {
  return <main style={{ maxWidth: 1000, margin: '48px auto', padding: '0 24px' }}>
    <h1>Velarion School — curriculum preview</h1>
    <p>Summary-only preview of the 30 required core lessons. Lesson bodies, quizzes and completion are disabled.
      No browser or legacy progress is recognized as authoritative.</p>
    <p>Optional extensions never replace these 30 lessons. School completion alone never authorizes trading.</p>
    <ol>{getAllLessons().map(lesson => <li key={lesson.id} style={{ marginBottom: 20 }}>
      <Link href={`/academy/lesson-${lesson.globalNum}`}>{lesson.title}</Link><p>{lesson.summary}</p>
    </li>)}</ol>
  </main>;
}

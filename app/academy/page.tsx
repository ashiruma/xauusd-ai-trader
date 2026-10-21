import React from 'react';
import Link from 'next/link';
import { getAllLessons } from '@/lib/curriculum';
export default function AcademyPage() {
  return <main style={{ maxWidth: 1000, margin: '48px auto', padding: '0 24px' }}>
    <h1>Velarion School — curriculum preview</h1>
    <p>Summary-only preview of the 30 required core lessons. Lesson bodies, quizzes and completion are disabled.
      No browser or legacy progress is recognized as authoritative.</p>
    <p>Optional extensions never replace these 30 lessons. School completion alone never authorizes trading. Planned progression: demo MT5 registration and required trading account ID, then five lessons, then trustworthy verification of live-account ownership, referral attribution and at least USD 50 deposited before lessons 6–30. The checkpoint is not graduation or active enforcement; delivery remains disabled. <Link href="/how-it-works">Read the planned journey, conditional free-access terms and risk disclosures</Link>.</p>
    <ol>{getAllLessons().map(lesson => <li key={lesson.id} style={{ marginBottom: 20 }}>
      <Link href={`/academy/lesson-${lesson.globalNum}`}>{lesson.title}</Link><p>{lesson.summary}</p>
    </li>)}</ol>
  </main>;
}

import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { AUTH_COOKIE_NAME, verifySession } from '@/lib/auth';
import MemberNav from '@/components/MemberNav';
import Link from 'next/link';
import { getAllLessons } from '@/lib/curriculum';
import { COURSE_MANIFEST, CORE_LESSON_COUNT, EARLY_CHECKPOINT_ID } from '@/lib/course-manifest';
import { readVerifiedCoreGraduation } from '@/lib/learning-authority';

export const metadata: Metadata = {
  title: 'Forex School | Systematic Curriculum & Checkpoints',
  description: 'Public curriculum summaries. Full lessons and verified progress are temporarily unavailable.',
  robots: { index: false, follow: false },
};
export default async function MemberSchoolPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifySession(token) : null;
  const adminSecret = process.env.ADMIN_MASTER_SECRET;
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const isOwner = Boolean((adminSecret && adminToken === adminSecret) || session?.role === 'admin');
  if (!session && !isOwner) redirect('/login?redirect=/school');
  const accountId = session?.mt5Account || session?.accountId || (isOwner ? 'ADMIN' : 'UNLINKED');
  const graduation = await readVerifiedCoreGraduation();
  const early = COURSE_MANIFEST.checkpoints.find(checkpoint => checkpoint.id === EARLY_CHECKPOINT_ID)!;
  const lessons = getAllLessons();
  return (
    <div style={{ minHeight: '100vh', color: 'var(--text-primary)' }}>
      <MemberNav accountId={accountId} environment="DEMO" automationStatus={session?.tradingActivated ? 'ACTIVE_DEMO' : 'OFF'} />
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px 64px' }}>
        <h1>Forex School &amp; Risk Checkpoints</h1>
        <p>All {CORE_LESSON_COUNT} original core lessons are required for graduation. The early {early.lessonIds.length}-lesson checkpoint is a milestone only, not graduation or automation eligibility.</p>
        <p role="status">{!graduation.available && 'Verified progress unavailable — no graduation, completed count or unlock is being claimed.'}</p>
        <p>Eligibility to study requires verified identity, partner attribution and deposit status. Sequential lesson prerequisites are separate from graduation. Account linking and explicit automation consent remain separate; learning never starts trading.</p>
        <p>Full lessons, quizzes and awards remain unavailable while secure identity and transactional learning records are prepared. Old browser data, backend flags and admin status are not graduation evidence.</p>
        <h2>Curriculum reference ({lessons.length} public summaries)</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
          {lessons.map(lesson => {
            const entry = COURSE_MANIFEST.lessons.find(item => item.id === lesson.id)!;
            return <article key={lesson.id}>
              <h3>Lesson {lesson.globalNum}: {lesson.title}</h3>
              <p>{COURSE_MANIFEST.requiredCoreLessonIds.includes(lesson.id) ? 'Required core' : 'Optional extension'} · Public summary only</p>
              <Link href={entry.route}>Read summary →</Link>
            </article>;
          })}
        </div>
        <p>Planned optional extension focus: {COURSE_MANIFEST.tracks.filter(track => track.kind === 'optional').map(track => track.label).join(', ')}. Extensions do not change the original core denominator or certificate policy.</p>
      </main>
    </div>
  );
}

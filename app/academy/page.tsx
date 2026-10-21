'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import CourseSchema from '@/components/CourseSchema';
import { getAllLessons } from '@/lib/curriculum';
import { COURSE_MANIFEST, CORE_LESSON_COUNT, EARLY_CHECKPOINT_ID, trackLabel } from '@/lib/course-manifest';

const panel: React.CSSProperties = {
  border: '1px solid var(--hb-hairline-amber)',
  background: 'var(--hb-bg-primary)',
  padding: '24px',
  marginBottom: '28px',
};

export default function AcademyPage() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const allLessons = useMemo(() => getAllLessons(), []);
  const filteredLessons = useMemo(() => selectedLevel === 'all' ? allLessons : allLessons.filter((lesson) => lesson.level === selectedLevel), [allLessons, selectedLevel]);

  const early = COURSE_MANIFEST.checkpoints.find(checkpoint => checkpoint.id === EARLY_CHECKPOINT_ID)!;
  // No browser completion cache, simulated totals or fabricated learner state.
  // Public catalogue metadata is the only curriculum data imported by this page.
  return (
    <div className="herbaria-page" style={{ minHeight: '100vh', padding: '40px 20px 80px' }}>
      <CourseSchema />
      <main style={{ maxWidth: '1100px', margin: '0 auto' }}>
        <nav aria-label="Academy navigation" style={{ marginBottom: '24px' }}>
          <Link href="/">Velarion</Link> / Learning academy
        </nav>
        <header style={{ marginBottom: '32px' }}>
          <div className="herbaria-plate-kicker">LEARN AT YOUR OWN PACE</div>
          <h1 className="herbaria-title">{COURSE_MANIFEST.title}: {allLessons.length} lesson summaries</h1>
          <p style={{ maxWidth: '820px', lineHeight: 1.7 }}>
            Explore public lesson titles and summaries. Full lessons, assessments and verified learning progress are temporarily unavailable while server-verified identity and private learning records are secured.
          </p>
          <p>All {CORE_LESSON_COUNT} original core lessons are mandatory. The early {early.lessonIds.length}-lesson checkpoint is not graduation or automation eligibility. Optional extensions do not change the core certificate.</p>
          <ul>{COURSE_MANIFEST.tracks.map(track => <li key={track.id}>{trackLabel(track.id)} · {track.kind === 'core' ? 'Required core' : 'Optional extension'} · {track.publication}</li>)}</ul>
          <p style={{ lineHeight: 1.7 }}>
            Required journey: JustMarkets referral and verified deposit → mandatory learning → account linking → separate, explicit automation activation. Completing lessons must never activate trading.
          </p>
        </header>

        <section aria-labelledby="learning-status" style={panel}>
          <h2 id="learning-status">Your learning record</h2>
          <p role="status">Verified progress unavailable — no completion or reward balance is being shown.</p>
          <p style={{ lineHeight: 1.7 }}>
            Old browser progress is not verified completion. It cannot unlock a lesson, award a badge or authorize account linking or trading. Existing records need a secure migration and reassessment policy before they can be trusted.
          </p>
          <Link href="/academy/lesson-1" className="herbaria-btn-secondary">Explore the first lesson summary →</Link>
        </section>

        <section aria-labelledby="rewards-preview" style={panel}>
          <div className="herbaria-plate-kicker">PROPOSED EXPERIENCE · NOT ENABLED</div>
          <h2 id="rewards-preview">Small wins. Lasting learning.</h2>
          <p style={{ lineHeight: 1.7 }}>
            A proposed non-cash rewards system celebrates learning, not financial activity. These are design previews, not earned rewards. No points, badges or streaks are currently recorded.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '20px', margin: '24px 0' }}>
            <article>
              <h3>Learning points</h3>
              <p style={{ lineHeight: 1.7 }}>Proposed: 20 points for the first server-verified assessment pass for each lesson. Repeats and content-version changes do not farm more points. Points have no cash value and cannot be redeemed.</p>
            </article>
            <article>
              <h3>Personal milestones</h3>
              <p style={{ lineHeight: 1.7 }}>Celebrate learning milestones with private badges. The early checkpoint and all-{CORE_LESSON_COUNT} core graduation are separate. A badge records a learning milestone, not trading expertise, safety or a profit guarantee.</p>
            </article>
            <article>
              <h3>Gentle streaks</h3>
              <p style={{ lineHeight: 1.7 }}>A first-time lesson pass can count as one active learning day, using the server’s UTC calendar. Multiple lessons on one day count once. A missed day resets only the current streak; earned progress, points, badges and your best streak stay.</p>
            </article>
          </div>
          <p style={{ lineHeight: 1.7 }}>
            Core safety learning and eligible access never depend on a streak, points or a badge. No leaderboards, countdown pressure or streak purchases. Take a break whenever you need one.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            No rewards for deposits, recruiting referrals, trading volume, profit, account linking or automation activation. Cash and broker-linked incentives are outside this proposal and require separate legal and broker approval.
          </p>
        </section>

        <section aria-labelledby="lesson-catalogue" style={{ marginBottom: '32px' }}>
          <h2 id="lesson-catalogue">Choose a public summary</h2>
          <p>All full lessons and quizzes remain unavailable. These cards are previews, not unlocks or proof of completion.</p>
          <div role="group" aria-label="Filter lessons by level" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', margin: '20px 0' }}>
            {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((level) => (
              <button key={level} type="button" aria-pressed={selectedLevel === level} onClick={() => setSelectedLevel(level)} className={selectedLevel === level ? 'herbaria-btn-citron' : 'herbaria-btn-secondary'}>
                {level === 'all' ? 'All lessons' : level} ({level === 'all' ? allLessons.length : allLessons.filter((lesson) => lesson.level === level).length})
              </button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px' }}>
            {filteredLessons.map((lesson) => (
              <article key={lesson.id} style={{ ...panel, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
                <span className="herbaria-plate-kicker">Lesson {String(lesson.globalNum).padStart(2, '0')} / {lesson.level}</span>
                <h3 style={{ lineHeight: 1.4 }}>{lesson.title}</h3>
                <p style={{ lineHeight: 1.7, flex: 1 }}>{lesson.summary}</p>
                <p style={{ fontSize: '13px' }}>{COURSE_MANIFEST.requiredCoreLessonIds.includes(lesson.id) ? 'Required core' : 'Optional extension'} · Public summary only · full lesson unavailable</p>
                <Link href={COURSE_MANIFEST.lessons.find(entry => entry.id === lesson.id)!.route} className="herbaria-btn-secondary">Read summary →</Link>
              </article>
            ))}
          </div>
        </section>

        <aside aria-labelledby="learning-disclosures" style={panel}>
          <h2 id="learning-disclosures">Important disclosures</h2>
          <p style={{ lineHeight: 1.7 }}>
            Velarion’s Introducing Broker relationship creates a financial conflict of interest. It must not influence assessment grading or learning rewards. Kenyan legal review remains a pre-launch requirement; regulatory status, broker terms and eligibility verification remain unresolved, not approved by this proposal.
          </p>
          <p style={{ lineHeight: 1.7 }}>
            <Link href="/legal/ib-disclosure">IB conflict disclosure</Link> · <Link href="/legal/risk-disclosure">Trading risk disclosure</Link> · <Link href="/legal/privacy">Privacy</Link>
          </p>
        </aside>
      </main>
    </div>
  );
}

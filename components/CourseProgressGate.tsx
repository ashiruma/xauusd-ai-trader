'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { COURSE_PROGRESS_STORAGE_KEY, parseCourseProgress, nextCourseLesson } from '@/lib/courseProgress';

interface CourseProgressGateProps {
  lessonNum: number;
  children: React.ReactNode;
}

export default function CourseProgressGate({ lessonNum, children }: CourseProgressGateProps) {
  const [isClientVerified, setIsClientVerified] = useState<boolean>(true);
  const [requiredLesson, setRequiredLesson] = useState<number>(1);

  useEffect(() => {
    try {
      const completed = parseCourseProgress(localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY));
      const nextAllowed = nextCourseLesson(completed, 30);

      // Lesson 1 is always allowed
      if (lessonNum === 1) {
        setIsClientVerified(true);
        return;
      }

      const isCompleted = completed.includes(lessonNum);
      const isNext = lessonNum === nextAllowed;

      if (!isCompleted && !isNext) {
        setIsClientVerified(false);
        setRequiredLesson(nextAllowed);
      } else {
        setIsClientVerified(true);
      }
    } catch {
      // Fallback to server rendering
      setIsClientVerified(true);
    }
  }, [lessonNum]);

  if (!isClientVerified) {
    return (
      <div style={{ maxWidth: '820px', margin: '40px auto 80px', padding: '0 20px' }}>
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-accent, #e1c47c)',
          borderRadius: 'var(--radius-xs)',
          padding: '36px 32px',
          textAlign: 'center',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.5)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xs)', marginBottom: '20px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.8px', textTransform: 'uppercase', fontFamily: 'monospace' }}>
              CURRICULUM FIREWALL / SEQUENTIAL PROGRESS REQUIRED
            </span>
          </div>

          <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
            Lesson {lessonNum} Is Locked
          </h2>

          <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '580px', margin: '0 auto 24px' }}>
            To ensure mathematical discipline and eliminate premature losses, curriculum units must be completed in sequential order. You must complete and pass <strong>Lesson {requiredLesson}</strong> before this unit unlocks.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href={`/academy/lesson-${requiredLesson}`}
              className="btn btn-primary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              Resume Lesson {requiredLesson} &rarr;
            </Link>
            <Link
              href="/school"
              className="btn btn-secondary"
              style={{ padding: '12px 24px', fontSize: '14px' }}
            >
              View Curriculum Overview &rarr;
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

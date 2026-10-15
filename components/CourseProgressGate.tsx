'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  COURSE_LESSON_COUNT,
  COURSE_PROGRESS_CHANGED_EVENT,
  COURSE_PROGRESS_STORAGE_KEY,
  nextCourseLesson,
  parseCourseProgress,
} from '@/lib/courseProgress';

interface CourseProgressGateProps {
  lessonNum: number;
  children: React.ReactNode;
}

export default function CourseProgressGate({ lessonNum, children }: CourseProgressGateProps) {
  const [progress, setProgress] = useState<{ ready: boolean; nextLesson: number; resetNotice: boolean }>({ ready: false, nextLesson: 1, resetNotice: false });

  useEffect(() => {
    const refreshProgress = (event?: Event) => {
      let completed: number[] = [];
      try {
        completed = parseCourseProgress(window.localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY));
      } catch {
        completed = [];
      }
      const resetNotice = event instanceof CustomEvent && Boolean((event as CustomEvent<{ reset?: boolean }>).detail?.reset);
      setProgress({ ready: true, nextLesson: nextCourseLesson(completed), resetNotice });
    };

    refreshProgress();
    window.addEventListener(COURSE_PROGRESS_CHANGED_EVENT, refreshProgress);
    window.addEventListener('pageshow', refreshProgress);
    window.addEventListener('popstate', refreshProgress);
    return () => {
      window.removeEventListener(COURSE_PROGRESS_CHANGED_EVENT, refreshProgress);
      window.removeEventListener('pageshow', refreshProgress);
      window.removeEventListener('popstate', refreshProgress);
    };
  }, [lessonNum]);

  if (!progress.ready) {
    return <div className="course-access-state" role="status">Checking course progress…</div>;
  }

  if (lessonNum > progress.nextLesson) {
    const targetLesson = Math.min(progress.nextLesson, COURSE_LESSON_COUNT);
    return (
      <div className="course-access-state course-access-locked" role="status">
        <span className="course-access-kicker">Course sequence</span>
        <h2>Complete the lessons in order</h2>
        {progress.resetNotice && <p className="course-reset-reminder">Course progress has been reset to Lesson 1. Rebuild progress in sequence; the assessment will be available again when you reach it.</p>}
        <p>Lesson {targetLesson} is next. Pass its assessment to unlock the following lesson.</p>
        <Link className="btn btn-primary" href={`/academy/lesson-${targetLesson}`}>Continue to Lesson {targetLesson} <span aria-hidden="true">→</span></Link>
      </div>
    );
  }

  return <>{children}</>;
}

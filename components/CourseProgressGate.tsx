'use client';
import React from 'react';

/** Compatibility boundary only. A browser progress cache must never release children.
 * This component is not the lesson-delivery boundary; server delivery is also suspended.
 */
export default function CourseProgressGate(_props: { lessonNum: number; children: React.ReactNode }) {
  return <div className="course-access-state course-access-locked" role="status">Verified learning progress and full lesson content are temporarily unavailable.</div>;
}

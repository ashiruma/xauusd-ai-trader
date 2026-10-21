import React from 'react';
// Never serialize protected children behind a client-only gate.
export default function CourseProgressGate(_props: { lessonNum: number; children: React.ReactNode }) {
  return <p>Lesson delivery is disabled. Curriculum summaries are available at /academy.</p>;
}

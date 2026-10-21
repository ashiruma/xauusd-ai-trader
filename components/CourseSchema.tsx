import React from 'react';
import { COURSE_MANIFEST, CORE_LESSON_COUNT, visibleLessons, trackLabel } from '@/lib/course-manifest';
import { SITE_ORIGIN } from '@/lib/site';

export default function CourseSchema() {
  const lessons = visibleLessons();
  const schema = {
    '@context': 'https://schema.org', '@type': 'Course',
    name: COURSE_MANIFEST.title,
    description: `Public catalogue of ${lessons.length} lesson summaries; ${CORE_LESSON_COUNT} original core lessons required for graduation. Full lessons, assessments and verified progress are temporarily unavailable. Optional extensions are separate.`,
    version: COURSE_MANIFEST.version,
    provider: { '@type': 'Organization', name: 'Velarion Markets', url: SITE_ORIGIN },
    educationalLevel: 'Beginner to Advanced',
    syllabusSections: COURSE_MANIFEST.tracks.filter(track => lessons.some(lesson => lesson.trackId === track.id)).map(track => ({
      '@type': 'Syllabus', name: trackLabel(track.id), description: track.focus,
    })),
    // No CourseInstance, credits or gated lesson URLs while delivery is suspended.
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, '\\u003c') }} />;
}

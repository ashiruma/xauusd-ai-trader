import React from 'react';
import { getAllLessons } from '@/lib/curriculum';

export default function CourseSchema() {
  const lessons = getAllLessons();

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: '30-Lesson Institutional Forex & Spot Gold Trading School',
    description: 'Comprehensive 30-lesson structured curriculum covering currency mechanics, pip calculations, margin leverage, session liquidity pools, and institutional risk management with interactive knowledge gating.',
    provider: {
      '@type': 'Organization',
      name: 'Velarion Markets',
      url: 'https://velarion-one.vercel.app'
    },
    educationalLevel: 'Beginner to Advanced',
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'Online'
    },
    syllabusSections: [
      {
        '@type': 'Syllabus',
        name: 'Tier 1: Forex Foundations (Lessons 1-12)',
        description: 'Currency pairs, bid/ask spreads, pips, lots, leverage, order types, and MT5 mechanics.'
      },
      {
        '@type': 'Syllabus',
        name: 'Tier 2: Technical & Market Dynamics (Lessons 13-22)',
        description: 'Market structure, support/resistance, candlestick anatomy, sessions, and economic indicators.'
      },
      {
        '@type': 'Syllabus',
        name: 'Tier 3: Institutional Risk & Psychology (Lessons 23-30)',
        description: 'Position sizing, drawdowns, risk-reward ratios, journal tracking, and algorithmic execution guardrails.'
      }
    ],
    hasPart: lessons.map((lesson) => ({
      '@type': 'Course',
      name: `Lesson ${lesson.globalNum}: ${lesson.title}`,
      description: lesson.summary,
      url: `https://velarion-one.vercel.app/academy/lesson-${lesson.globalNum}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

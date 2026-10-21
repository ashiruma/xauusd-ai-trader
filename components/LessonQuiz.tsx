'use client';
import React from 'react';
import type { QuizQuestion } from '@/lib/curriculum-types';

interface LessonQuizProps {
  lessonId: string;
  globalNum: number;
  quiz: QuizQuestion | QuizQuestion[];
  nextLessonNum?: number | null;
}
/** Compatibility placeholder; no answers, completion state, awards or graduation modal.
 * Protected pages must not serialize a quiz into these props while delivery is suspended.
 */
export default function LessonQuiz(_props: LessonQuizProps) {
  return <section className="lesson-quiz" role="status">Assessments and verified progress are temporarily unavailable. Early milestones do not count as core graduation or authorize automation.</section>;
}

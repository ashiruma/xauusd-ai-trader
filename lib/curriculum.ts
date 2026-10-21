import publicLessons from './curriculum-public.json';
import { buildPublicCatalogue, summaryById, type LessonSummary } from './course-catalogue';

// Public summary allowlist only; no bodies, objectives, diagrams or assessment data.
export type { LessonSummary } from './course-catalogue';
export const FOREX_LESSONS: readonly LessonSummary[] = buildPublicCatalogue(publicLessons);
export function getLessonByGlobalNum(num: number): LessonSummary | undefined {
  return FOREX_LESSONS.find(lesson => lesson.globalNum === num);
}
export function getLessonById(id: string): LessonSummary | undefined { return summaryById(id, FOREX_LESSONS); }
export function getAllLessons(): readonly LessonSummary[] { return FOREX_LESSONS; }

import publicLessons from './curriculum-public.json';

// This is the ONLY curriculum module intended for the client graph.
// Explicit allowlist: no body, objectives, examples, diagrams, glossary or quiz data.
export interface LessonSummary {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  levelTitle: string;
  lessonNum: number;
  globalNum: number;
  title: string;
  summary: string;
}

export const FOREX_LESSONS: readonly LessonSummary[] = publicLessons as LessonSummary[];

export function getLessonByGlobalNum(num: number): LessonSummary | undefined {
  return FOREX_LESSONS.find(lesson => lesson.globalNum === num);
}

export function getLessonById(id: string): LessonSummary | undefined {
  const match = /^(?:lesson-)?([1-9]\d*)$/i.exec(id);
  return match ? getLessonByGlobalNum(Number(match[1])) :
    FOREX_LESSONS.find(lesson => lesson.id.toLowerCase() === id.toLowerCase());
}

export function getAllLessons(): readonly LessonSummary[] {
  return FOREX_LESSONS;
}

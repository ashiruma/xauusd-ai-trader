import curriculumData from './curriculum-summary.json';

export interface QuizQuestion {
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  hint?: string;
}

export interface Lesson {
  id: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  levelTitle: string;
  lessonNum: number;
  globalNum: number;
  title: string;
  summary: string;
  objectives: string[];
  content: string;
  example: string;
  diagram: string;
  quiz: QuizQuestion;
}

export interface GlossaryTerm {
  term: string;
  category: string;
  definition: string;
  example: string;
  relatedLessonId?: string;
}

export const FOREX_LESSONS: Lesson[] = curriculumData.lessons as unknown as Lesson[];
export const FOREX_GLOSSARY: GlossaryTerm[] = curriculumData.glossary as unknown as GlossaryTerm[];

export function getLessonByGlobalNum(num: number): Lesson | undefined {
  return FOREX_LESSONS.find(l => l.globalNum === num);
}

export function getLessonById(id: string): Lesson | undefined {
  const clean = id.toLowerCase().replace('lesson-', '');
  const num = parseInt(clean, 10);
  if (!isNaN(num)) {
    return getLessonByGlobalNum(num);
  }
  return FOREX_LESSONS.find(l => l.id.toLowerCase() === id.toLowerCase() || l.id.toLowerCase() === clean);
}

export function getAllLessons(): Lesson[] {
  return FOREX_LESSONS;
}

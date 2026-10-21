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

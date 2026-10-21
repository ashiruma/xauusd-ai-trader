export const COURSE_PROGRESS_STORAGE_KEY = 'velarion_completed_lessons';
export const COURSE_PROGRESS_CHANGED_EVENT = 'velarion:course-progress-changed';
export const COURSE_LESSON_COUNT = 30;

function toLessonNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(?:lesson[-_ ]?)?(\d+)$/i);
  return match ? Number(match[1]) : null;
}

export function normalizeCourseProgress(values: unknown[], lessonCount = COURSE_LESSON_COUNT): number[] {
  return [...new Set(values.map(toLessonNumber).filter((value): value is number => value !== null && value >= 1 && value <= lessonCount))]
    .sort((a, b) => a - b);
}

export function parseCourseProgress(_raw: string | null, _lessonCount = COURSE_LESSON_COUNT): number[] {
  return []; // Legacy browser claims are not learner evidence.
}

export function nextCourseLesson(completed: readonly number[], lessonCount = COURSE_LESSON_COUNT): number {
  const completedSet = new Set(completed);
  for (let lesson = 1; lesson <= lessonCount; lesson += 1) {
    if (!completedSet.has(lesson)) return lesson;
  }
  return lessonCount + 1;
}

export function saveCourseProgress(_completed: readonly number[], _lessonCount = COURSE_LESSON_COUNT): number[] {
  return []; // Writes are disabled until an approved authoritative progress cutover.
}

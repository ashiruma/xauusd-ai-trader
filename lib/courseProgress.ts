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

export function parseCourseProgress(raw: string | null, lessonCount = COURSE_LESSON_COUNT): number[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? normalizeCourseProgress(value, lessonCount) : [];
  } catch {
    return [];
  }
}

export function nextCourseLesson(completed: readonly number[], lessonCount = COURSE_LESSON_COUNT): number {
  const completedSet = new Set(completed);
  for (let lesson = 1; lesson <= lessonCount; lesson += 1) {
    if (!completedSet.has(lesson)) return lesson;
  }
  return lessonCount + 1;
}

export function saveCourseProgress(completed: readonly number[], lessonCount = COURSE_LESSON_COUNT): number[] {
  const normalized = normalizeCourseProgress([...completed], lessonCount);
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(normalized));
    } catch {
      // Keep the in-memory UI usable if browser storage is unavailable.
    }
    window.dispatchEvent(new CustomEvent(COURSE_PROGRESS_CHANGED_EVENT, {
      detail: { reset: normalized.length === 0 },
    }));
  }
  return normalized;
}

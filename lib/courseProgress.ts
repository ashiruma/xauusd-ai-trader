import { COURSE_MANIFEST, visibleLessons, type CourseManifest } from './course-manifest.ts';

// Legacy cache compatibility only; NEVER use these numbers for eligibility or completion.
export const COURSE_PROGRESS_STORAGE_KEY = 'velarion_completed_lessons';
export const COURSE_PROGRESS_CHANGED_EVENT = 'velarion:course-progress-changed';
export const COURSE_LESSON_COUNT = visibleLessons().length;
function toLessonNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isInteger(value)) return value;
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(?:lesson[-_ ]?)?(\d+)$/i);
  return match ? Number(match[1]) : null;
}
export function normalizeCourseProgress(values: unknown[], manifest: CourseManifest = COURSE_MANIFEST): number[] {
  const numbers = new Set(values.map(toLessonNumber));
  return visibleLessons(manifest).filter(lesson => numbers.has(lesson.globalNum)).map(lesson => lesson.globalNum);
}
export function parseCourseProgress(raw: string | null, manifest: CourseManifest = COURSE_MANIFEST): number[] {
  try {
    const value: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(value) ? normalizeCourseProgress(value, manifest) : [];
  } catch { return []; }
}
/** Untrusted navigation hint only; no sentinel count+1 and no implicit optional credit. */
export function nextCourseLesson(completed: readonly number[], manifest: CourseManifest = COURSE_MANIFEST): number | null {
  return visibleLessons(manifest).find(lesson => !completed.includes(lesson.globalNum))?.globalNum ?? null;
}
export function saveCourseProgress(completed: readonly number[], manifest: CourseManifest = COURSE_MANIFEST): number[] {
  const normalized = normalizeCourseProgress([...completed], manifest);
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(COURSE_PROGRESS_STORAGE_KEY, JSON.stringify(normalized)); } catch { /* Untrusted hint only. */ }
    window.dispatchEvent(new CustomEvent(COURSE_PROGRESS_CHANGED_EVENT, { detail: { reset: normalized.length === 0 } }));
  }
  return normalized;
}

/**
 * School Quiz Attempt Governance, Mandatory Study Lockout & Timeout Reversal.
 *
 * Rules:
 * 1. A user is allowed only 1 retry on any lesson quiz (2 attempts total).
 * 2. If they fail twice, they must re-read the whole lesson for at least 10 minutes (strictly timed).
 * 3. If timeout occurs before passing, curriculum progress is reversed by two previous lessons (max(1, current - 2)).
 */

export const MANDATORY_STUDY_MINUTES = 10;
export const MANDATORY_STUDY_MS = MANDATORY_STUDY_MINUTES * 60 * 1000; // 600,000 ms

// Total session window before timeout reversal occurs (10 min study + 10 min quiz window)
export const TOTAL_TIMEOUT_MINUTES = 20;
export const TOTAL_TIMEOUT_MS = TOTAL_TIMEOUT_MINUTES * 60 * 1000; // 1,200,000 ms

export const LOCKOUT_COOKIE_PREFIX = 'velarion_lockout_';
export const ATTEMPTS_COOKIE_PREFIX = 'velarion_attempts_';

export interface QuizLockoutState {
  lessonId: number;
  fails: number;
  lockedUntil: number | null;
  timeoutAt: number | null;
  isLocked: boolean;
  isTimedOut: boolean;
  remainingStudySeconds: number;
  remainingTimeoutSeconds: number;
}

/**
 * Calculates the demoted lesson number after a timeout reversal penalty.
 * Reverses the user to two previous lessons: max(1, currentLesson - 2).
 */
export function calculateReversalLesson(currentLesson: number): number {
  return Math.max(1, currentLesson - 2);
}

/**
 * Revokes completion progress for the current lesson and any intervening lessons
 * back to the target reversed lesson.
 */
export function reverseCompletedLessons(
  completedLessons: readonly number[],
  currentLesson: number
): { targetLesson: number; updatedCompleted: number[] } {
  const targetLesson = calculateReversalLesson(currentLesson);
  // Remove any lessons >= targetLesson from completed list
  const updatedCompleted = completedLessons
    .filter((num) => typeof num === 'number' && num < targetLesson)
    .sort((a, b) => a - b);

  return { targetLesson, updatedCompleted };
}

/**
 * Resolves the real-time lockout and timeout status for a given lesson.
 */
export function evaluateQuizLockout(
  lessonId: number,
  fails: number,
  lockedUntil: number | null,
  timeoutAt: number | null,
  now: number = Date.now()
): QuizLockoutState {
  const isLocked = Boolean(lockedUntil && now < lockedUntil);
  const isTimedOut = Boolean(timeoutAt && now >= timeoutAt);

  const remainingStudySeconds = lockedUntil && now < lockedUntil
    ? Math.max(0, Math.ceil((lockedUntil - now) / 1000))
    : 0;

  const remainingTimeoutSeconds = timeoutAt && now < timeoutAt
    ? Math.max(0, Math.ceil((timeoutAt - now) / 1000))
    : 0;

  return {
    lessonId,
    fails,
    lockedUntil,
    timeoutAt,
    isLocked,
    isTimedOut,
    remainingStudySeconds,
    remainingTimeoutSeconds,
  };
}

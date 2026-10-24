// lib/curriculum-firewall.ts
/**
 * Server-authoritative Content Firewall and Sequential Curriculum Gate.
 * Enforces strict defense-in-depth access control across all 30 Forex School lessons:
 * - Lesson 1: Public access.
 * - Lesson 2: Requires passing Lesson 1.
 * - Lessons 3-5 (Tier 2): Requires sequential completion AND linked JustMarkets MT5 account.
 * - Lessons 6-30 (Tier 3): Requires passing Lessons 1-5 AND sequential completion AND verified live deposit ($50 min).
 * Strictly adheres to Universal System Rules: Zero emojis, Data Leak Prevention.
 */

export interface FirewallCheckParams {
  lessonNum: number;
  completedLessons: number[];
  isLinked: boolean;
  isFunded: boolean;
  isAdmin: boolean;
}

export type FirewallGateReason =
  | 'none'
  | 'sequence_locked'
  | 'link_required'
  | 'deposit_required';

export interface FirewallResult {
  allowed: boolean;
  gateReason: FirewallGateReason;
  requiredLessonNum?: number;
  nextAllowedLesson: number;
  message: string;
}

/**
 * Calculates the next sequential lesson a student is qualified to attempt.
 */
export function getNextSequentialLesson(completedLessons: number[]): number {
  const completedSet = new Set(completedLessons);
  for (let i = 1; i <= 30; i++) {
    if (!completedSet.has(i)) {
      return i;
    }
  }
  return 31; // Curriculum complete
}

/**
 * Evaluates whether a student is permitted to access full lesson content or submit quiz.
 */
export function evaluateLessonAccess({
  lessonNum,
  completedLessons,
  isLinked,
  isFunded,
  isAdmin,
}: FirewallCheckParams): FirewallResult {
  const nextAllowed = getNextSequentialLesson(completedLessons);

  // 1. True Admins have full inspection access
  if (isAdmin) {
    return {
      allowed: true,
      gateReason: 'none',
      nextAllowedLesson: nextAllowed,
      message: 'Administrative bypass active.',
    };
  }

  // 2. Lesson 1 is always unlocked
  if (lessonNum === 1) {
    return {
      allowed: true,
      gateReason: 'none',
      nextAllowedLesson: nextAllowed,
      message: 'Public foundation lesson unlocked.',
    };
  }

  // 3. Sequential Progress Firewall
  // A student can review any already-completed lesson, or attempt the next sequential lesson.
  const isAlreadyCompleted = completedLessons.includes(lessonNum);
  const isNextInSequence = lessonNum === nextAllowed;

  if (!isAlreadyCompleted && !isNextInSequence) {
    return {
      allowed: false,
      gateReason: 'sequence_locked',
      requiredLessonNum: nextAllowed,
      nextAllowedLesson: nextAllowed,
      message: `Sequential Curriculum Firewall: Complete Lesson ${nextAllowed} before accessing Lesson ${lessonNum}.`,
    };
  }

  // 4. Tier 2 Firewall: Lessons 3 to 5 require linked JustMarkets MT5 Account
  if (lessonNum >= 3 && lessonNum <= 5) {
    if (!isLinked) {
      return {
        allowed: false,
        gateReason: 'link_required',
        nextAllowedLesson: nextAllowed,
        message: 'Checkpoint 01 Firewall: Link your JustMarkets MT5 account to unlock Lessons 3 to 5.',
      };
    }
  }

  // 5. Tier 3 Firewall: Lessons 6 to 30 require active live funded deposit ($50 min)
  if (lessonNum >= 6) {
    // Foundation track must be fully certified first
    const hasFoundationCompleted = [1, 2, 3, 4, 5].every((n) => completedLessons.includes(n));
    if (!hasFoundationCompleted) {
      return {
        allowed: false,
        gateReason: 'sequence_locked',
        requiredLessonNum: nextAllowed,
        nextAllowedLesson: nextAllowed,
        message: 'Foundation track incomplete. Pass Lessons 1 through 5 before entering the Institutional Track.',
      };
    }

    if (!isFunded) {
      return {
        allowed: false,
        gateReason: 'deposit_required',
        nextAllowedLesson: nextAllowed,
        message: 'Checkpoint 02 Firewall: A minimum USD 50 live deposit on JustMarkets is required to unlock Lessons 6 to 30.',
      };
    }
  }

  return {
    allowed: true,
    gateReason: 'none',
    nextAllowedLesson: nextAllowed,
    message: 'Access granted.',
  };
}

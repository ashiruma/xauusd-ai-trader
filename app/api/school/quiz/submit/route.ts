import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { evaluateLessonAccess } from '@/lib/curriculum-firewall';
import { getQuizForLesson } from '@/lib/quizData';
import {
  MANDATORY_STUDY_MS,
  TOTAL_TIMEOUT_MS,
  LOCKOUT_COOKIE_PREFIX,
  ATTEMPTS_COOKIE_PREFIX,
  reverseCompletedLessons,
} from '@/lib/school-lockout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawLessonId = body.lessonId || body.globalNum;
    const answers = body.answers; // Map of question index -> option index

    if (rawLessonId === undefined || answers === undefined) {
      return NextResponse.json(
        { success: false, error: 'BAD_REQUEST', message: 'lessonId and answers payload are required.' },
        { status: 400 }
      );
    }

    const cleanNum = typeof rawLessonId === 'number' ? rawLessonId : parseInt(String(rawLessonId).replace(/\D/g, ''), 10);
    const questions = getQuizForLesson(cleanNum);

    if (!questions || questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'NO_QUIZ', message: `Lesson ${cleanNum} does not contain a quiz.` },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const existingCookie = cookieStore.get('velarion_completed_lessons')?.value;
    let completedLessons: number[] = [];

    if (existingCookie) {
      try {
        const parsed = JSON.parse(existingCookie);
        if (Array.isArray(parsed)) {
          completedLessons = parsed.filter((n): n is number => typeof n === 'number' && n >= 1 && n <= 30);
        }
      } catch {
        // ignore
      }
    }

    // 1. Authoritative Server Content Firewall Check
    const ADMIN_EMAILS = ['ashirumaabala@gmail.com'];
    let isAdmin = false;
    let isFunded = false;
    let mt5AccountId: string | null = null;

    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin, mt5_account_id, is_funded')
          .eq('id', data.user.id)
          .maybeSingle();

        const isStaffEmail = data.user.email ? ADMIN_EMAILS.includes(data.user.email.toLowerCase()) : false;
        isAdmin = Boolean(profile?.is_admin) || isStaffEmail;
        isFunded = Boolean(profile?.is_funded) || isAdmin;
        mt5AccountId = profile?.mt5_account_id || null;
      }
    } catch {
      // Supabase fallback
    }

    const adminSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
    const adminToken = cookieStore.get('velarion_admin_token')?.value;
    const isOwner = Boolean((adminSecret && adminToken === adminSecret) || isAdmin);
    const isLinked = Boolean(isOwner || mt5AccountId || cookieStore.get('velarion_mt5_account')?.value);

    const firewall = evaluateLessonAccess({
      lessonNum: cleanNum,
      completedLessons,
      isLinked,
      isFunded,
      isAdmin: isOwner,
    });

    if (!firewall.allowed) {
      return NextResponse.json(
        {
          success: false,
          passed: false,
          error: 'FIREWALL_BLOCKED',
          gateReason: firewall.gateReason,
          requiredLessonNum: firewall.requiredLessonNum,
          message: firewall.message,
        },
        { status: 403 }
      );
    }

    // 2. Check existing lockout & timeout status
    const lockoutCookie = cookieStore.get(`${LOCKOUT_COOKIE_PREFIX}${cleanNum}`)?.value;
    let lockedUntil: number | null = null;
    let timeoutAt: number | null = null;

    if (lockoutCookie) {
      try {
        const parsed = JSON.parse(lockoutCookie);
        lockedUntil = parsed.lockedUntil ?? null;
        timeoutAt = parsed.timeoutAt ?? null;
      } catch {
        // ignore
      }
    }

    const now = Date.now();

    // If active 10-minute study lockout is still in effect
    if (lockedUntil && now < lockedUntil) {
      const remainingSec = Math.ceil((lockedUntil - now) / 1000);
      return NextResponse.json(
        {
          success: false,
          passed: false,
          locked: true,
          remainingSeconds: remainingSec,
          message: `Mandatory study lock active. You must review the lesson material for at least ${Math.ceil(remainingSec / 60)} more minute(s) before submitting.`,
        },
        { status: 423 }
      );
    }

    // If timeout limit has been exceeded
    if (timeoutAt && now >= timeoutAt) {
      const { targetLesson, updatedCompleted } = reverseCompletedLessons(completedLessons, cleanNum);

      cookieStore.set({
        name: 'velarion_completed_lessons',
        value: JSON.stringify(updatedCompleted),
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 365,
        path: '/',
      });

      cookieStore.delete(`${LOCKOUT_COOKIE_PREFIX}${cleanNum}`);
      cookieStore.delete(`${ATTEMPTS_COOKIE_PREFIX}${cleanNum}`);

      return NextResponse.json({
        success: false,
        passed: false,
        timedOut: true,
        targetLesson,
        completedLessons: updatedCompleted,
        message: `Timeout exceeded on Lesson ${cleanNum}. Progress has been reversed to Lesson ${targetLesson}.`,
      });
    }

    // 3. Authoritative server-side grading
    let allCorrect = true;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const submitted = typeof answers === 'object' && answers !== null ? (answers[i] ?? answers[String(i)]) : undefined;
      if (submitted === undefined || Number(submitted) !== q.correct) {
        allCorrect = false;
        break;
      }
    }

    // Read previous failure count for this lesson
    const attemptsCookie = cookieStore.get(`${ATTEMPTS_COOKIE_PREFIX}${cleanNum}`)?.value;
    const previousFails = attemptsCookie ? parseInt(attemptsCookie, 10) || 0 : 0;

    if (!allCorrect) {
      const newFails = previousFails + 1;

      if (newFails === 1) {
        // 1 retry remaining
        cookieStore.set({
          name: `${ATTEMPTS_COOKIE_PREFIX}${cleanNum}`,
          value: '1',
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24, // 24 hours
          path: '/',
        });

        return NextResponse.json({
          success: false,
          passed: false,
          fails: 1,
          retriesRemaining: 1,
          message: 'Assessment did not meet the 100% threshold. You have 1 retry remaining.',
        });
      } else {
        // Failed twice: trigger mandatory 10-minute study lock & set timeout window
        const newLockedUntil = now + MANDATORY_STUDY_MS;
        const newTimeoutAt = now + TOTAL_TIMEOUT_MS;

        cookieStore.set({
          name: `${ATTEMPTS_COOKIE_PREFIX}${cleanNum}`,
          value: String(newFails),
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
          path: '/',
        });

        cookieStore.set({
          name: `${LOCKOUT_COOKIE_PREFIX}${cleanNum}`,
          value: JSON.stringify({ lockedUntil: newLockedUntil, timeoutAt: newTimeoutAt }),
          httpOnly: false,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          maxAge: 60 * 60 * 24,
          path: '/',
        });

        return NextResponse.json({
          success: false,
          passed: false,
          fails: newFails,
          retriesRemaining: 0,
          locked: true,
          lockedUntil: newLockedUntil,
          timeoutAt: newTimeoutAt,
          remainingSeconds: Math.ceil(MANDATORY_STUDY_MS / 1000),
          message: 'Failed twice. Institutional protocol requires you to re-read the entire lesson for at least 10 minutes before retrying.',
        });
      }
    }

    // 3. Quiz PASSED
    // Clear lockouts & failures for this lesson
    cookieStore.delete(`${LOCKOUT_COOKIE_PREFIX}${cleanNum}`);
    cookieStore.delete(`${ATTEMPTS_COOKIE_PREFIX}${cleanNum}`);

    if (!completedLessons.includes(cleanNum)) {
      completedLessons.push(cleanNum);
      completedLessons.sort((a, b) => a - b);
    }

    cookieStore.set({
      name: 'velarion_completed_lessons',
      value: JSON.stringify(completedLessons),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      passed: true,
      completedLessons,
      message: `Lesson ${cleanNum} assessment verified successfully.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

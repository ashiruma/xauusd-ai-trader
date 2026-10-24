import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { reverseCompletedLessons, LOCKOUT_COOKIE_PREFIX, ATTEMPTS_COOKIE_PREFIX } from '@/lib/school-lockout';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const rawLessonId = body.lessonId || body.globalNum;

    if (rawLessonId === undefined) {
      return NextResponse.json(
        { success: false, error: 'BAD_REQUEST', message: 'lessonId is required.' },
        { status: 400 }
      );
    }

    const currentLesson = typeof rawLessonId === 'number'
      ? rawLessonId
      : parseInt(String(rawLessonId).replace(/\D/g, ''), 10);

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

    // Apply two-lesson reversal
    const { targetLesson, updatedCompleted } = reverseCompletedLessons(completedLessons, currentLesson);

    // Save updated completed lessons
    cookieStore.set({
      name: 'velarion_completed_lessons',
      value: JSON.stringify(updatedCompleted),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });

    // Clear lockout & attempts for this lesson
    cookieStore.delete(`${LOCKOUT_COOKIE_PREFIX}${currentLesson}`);
    cookieStore.delete(`${ATTEMPTS_COOKIE_PREFIX}${currentLesson}`);

    return NextResponse.json({
      success: true,
      reversed: true,
      targetLesson,
      completedLessons: updatedCompleted,
      message: `Timeout exceeded on Lesson ${currentLesson}. You have been reversed to Lesson ${targetLesson}.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

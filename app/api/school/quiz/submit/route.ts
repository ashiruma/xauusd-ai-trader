import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getQuizForLesson } from '@/lib/quizData';

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

    // Authoritative server-side grading
    let allCorrect = true;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const submitted = typeof answers === 'object' && answers !== null ? (answers[i] ?? answers[String(i)]) : undefined;
      if (submitted === undefined || Number(submitted) !== q.correct) {
        allCorrect = false;
        break;
      }
    }

    if (!allCorrect) {
      return NextResponse.json({
        success: false,
        passed: false,
        message: 'Assessment did not meet the 100% threshold. Review the lesson material and retry.',
      });
    }

    // Read current completed lessons from cookie
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

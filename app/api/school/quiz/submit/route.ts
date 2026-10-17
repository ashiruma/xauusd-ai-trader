// app/api/school/quiz/submit/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession, signSession, AUTH_COOKIE_NAME } from '@/lib/auth';
import curriculumData from '@/lib/curriculum-data.json';

interface QuizQuestionItem {
  question: string;
  options: string[];
  correct?: number;
  correctAnswer?: number;
}

interface LessonItem {
  id: string;
  globalNum: number;
  quiz?: QuizQuestionItem | QuizQuestionItem[];
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session || !session.verified) {
      return NextResponse.json(
        {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'An active, verified session is required to record school progress and take assessments.',
        },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const rawLessonId = body.lessonId || body.globalNum;
    const answers = body.answers; // Map of question index -> option index

    if (rawLessonId === undefined || answers === undefined) {
      return NextResponse.json(
        { success: false, error: 'BAD_REQUEST', message: 'lessonId and answers payload are required.' },
        { status: 400 }
      );
    }

    // Resolve lesson
    const lessons: LessonItem[] = (curriculumData.lessons || []) as unknown as LessonItem[];
    const cleanNum = typeof rawLessonId === 'number' ? rawLessonId : parseInt(String(rawLessonId).replace(/\D/g, ''), 10);
    const lesson = lessons.find((l) => l.globalNum === cleanNum || l.id === String(rawLessonId));

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'LESSON_NOT_FOUND', message: `Lesson ${rawLessonId} not found in curriculum.` },
        { status: 404 }
      );
    }

    const accountId = session.mt5Account || session.accountId || '1200533810';

    // Fetch current progress from backend database
    let completedLessons: number[] = [];
    try {
      const progressRes = await fetch(`http://127.0.0.1:8000/api/school/progress?account_id=${encodeURIComponent(accountId)}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(3000),
      });
      if (progressRes.ok) {
        const pData = await progressRes.json();
        completedLessons = Array.isArray(pData.completed_lessons) ? pData.completed_lessons : [];
      }
    } catch {
      // Default to empty if DB query fails
      completedLessons = [];
    }

    // Enforce strict sequential completion: Lesson N requires 1 .. N-1
    if (lesson.globalNum > 1) {
      for (let prev = 1; prev < lesson.globalNum; prev++) {
        if (!completedLessons.includes(prev)) {
          return NextResponse.json(
            {
              success: false,
              passed: false,
              error: 'SEQUENTIAL_REQUIREMENT_UNMET',
              message: `Sequential curriculum enforcement: You must complete Lesson ${prev} before taking the assessment for Lesson ${lesson.globalNum}. Skipping ahead is not permitted.`,
              nextRequiredLesson: prev,
              completedLessons,
            },
            { status: 403 }
          );
        }
      }
    }

    // Extract questions and authoritative correct answers
    const quizRaw = lesson.quiz;
    const questions: QuizQuestionItem[] = Array.isArray(quizRaw) ? quizRaw : quizRaw ? [quizRaw] : [];

    if (questions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'NO_QUIZ', message: `Lesson ${lesson.globalNum} does not contain a quiz.` },
        { status: 400 }
      );
    }

    // Server-side grading: compare submitted answers against authoritative key
    let allCorrect = true;
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const target = q.correct !== undefined ? q.correct : q.correctAnswer;
      const submitted = typeof answers === 'object' && answers !== null ? (answers[i] ?? answers[String(i)]) : undefined;

      if (submitted === undefined || submitted !== target) {
        allCorrect = false;
        break;
      }
    }

    const cookieStore = await cookies();

    // ON ANY QUIZ FAILURE:
    // Reset course progress completely to Lesson 1 without revealing which question was wrong or the correct answer!
    if (!allCorrect) {
      try {
        await fetch('http://127.0.0.1:8000/api/school/progress/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            account_id: accountId,
            completed_lessons: [],
            school_completed: false,
          }),
          signal: AbortSignal.timeout(3000),
        });
      } catch (dbErr) {
        console.warn('[DB School Reset Warning]', dbErr);
      }

      // Update session cookie with reset progress
      const updatedSession = await signSession({
        ...session,
        schoolCompleted: false,
      });

      cookieStore.set({
        name: AUTH_COOKIE_NAME,
        value: updatedSession,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 30,
        path: '/',
      });

      return NextResponse.json({
        success: false,
        passed: false,
        resetToLesson: 1,
        completedLessons: [],
        sequentialCount: 0,
        message:
          'Comprehension assessment did not meet the 100% threshold required for institutional automated risk execution. Course progress has been reset to Lesson 1. Please review Lesson 1 and proceed sequentially.',
      });
    }

    // ON PASSING SCORE:
    // Add lesson to completed set
    const updatedLessons = Array.from(new Set([...completedLessons, lesson.globalNum])).sort((a, b) => a - b);
    let seqCount = 0;
    for (let i = 1; i <= 5; i++) {
      if (updatedLessons.includes(i)) seqCount++;
      else break;
    }
    const isSchoolComplete = seqCount >= 5;

    try {
      await fetch('http://127.0.0.1:8000/api/school/progress/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          completed_lessons: updatedLessons,
          school_completed: isSchoolComplete,
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (dbErr) {
      console.warn('[DB School Progress Save Warning]', dbErr);
    }

    // Update session cookie
    const updatedSession = await signSession({
      ...session,
      schoolCompleted: isSchoolComplete,
    });

    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: updatedSession,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return NextResponse.json({
      success: true,
      passed: true,
      completedLessons: updatedLessons,
      sequentialCount: seqCount,
      schoolCompleted: isSchoolComplete,
      nextRequiredLesson: seqCount < 5 ? seqCount + 1 : null,
      message: `Lesson ${lesson.globalNum} assessment passed successfully.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

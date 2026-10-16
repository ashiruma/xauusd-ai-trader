// app/api/school/progress/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const cookieStore = await cookies();
  const raw = cookieStore.get('velarion_school_progress')?.value;
  let completed: number[] = [];

  if (raw) {
    try {
      const parsed = JSON.parse(decodeURIComponent(raw));
      if (Array.isArray(parsed)) {
        completed = parsed.map(Number).filter(n => !isNaN(n));
      }
    } catch {
      completed = [];
    }
  }

  // Calculate sequential count (must be unbroken from 1)
  let sequentialCount = 0;
  for (let i = 1; i <= 5; i++) {
    if (completed.includes(i)) {
      sequentialCount++;
    } else {
      break;
    }
  }

  return NextResponse.json({
    completedLessons: completed,
    sequentialCount,
    isComplete: sequentialCount >= 5,
    nextRequiredLesson: sequentialCount < 5 ? sequentialCount + 1 : null,
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const globalNum = Number(body.globalNum || body.lessonNumber);
    const quizPassed = Boolean(body.quizPassed ?? true);

    if (!globalNum || isNaN(globalNum) || globalNum < 1 || globalNum > 10) {
      return NextResponse.json(
        { error: 'Valid sequential lesson number (1-10) is required.' },
        { status: 400 }
      );
    }

    if (!quizPassed) {
      return NextResponse.json(
        { error: 'A passing score on the lesson comprehension quiz is required before marking completion.' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const raw = cookieStore.get('velarion_school_progress')?.value;
    let completed: number[] = [];

    if (raw) {
      try {
        const parsed = JSON.parse(decodeURIComponent(raw));
        if (Array.isArray(parsed)) {
          completed = parsed.map(Number).filter(n => !isNaN(n));
        }
      } catch {
        completed = [];
      }
    }

    // Enforce strict sequential order: cannot complete lesson N if N-1 is not complete
    if (globalNum > 1) {
      for (let prev = 1; prev < globalNum; prev++) {
        if (!completed.includes(prev)) {
          return NextResponse.json(
            {
              error: `Sequential curriculum enforcement: You must complete Lesson ${prev} before Lesson ${globalNum}. Skipping ahead is not permitted.`,
              nextRequiredLesson: prev,
              completedLessons: completed,
            },
            { status: 403 }
          );
        }
      }
    }

    if (!completed.includes(globalNum)) {
      completed.push(globalNum);
      completed.sort((a, b) => a - b);
    }

    let sequentialCount = 0;
    for (let i = 1; i <= 5; i++) {
      if (completed.includes(i)) {
        sequentialCount++;
      } else {
        break;
      }
    }

    const res = NextResponse.json({
      success: true,
      message: `Lesson ${globalNum} marked complete with passing quiz score.`,
      completedLessons: completed,
      sequentialCount,
      isComplete: sequentialCount >= 5,
      nextRequiredLesson: sequentialCount < 5 ? sequentialCount + 1 : null,
    });

    res.cookies.set({
      name: 'velarion_school_progress',
      value: encodeURIComponent(JSON.stringify(completed)),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('[School Progress API Error]', error);
    return NextResponse.json(
      { error: 'Failed to record school progress.' },
      { status: 500 }
    );
  }
}

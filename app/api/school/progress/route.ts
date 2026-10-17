// app/api/school/progress/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const session = await getServerSession();
  const accountId = session?.mt5Account || session?.accountId;

  if (!session || !accountId) {
    return NextResponse.json({
      authenticated: false,
      completedLessons: [],
      sequentialCount: 0,
      isComplete: false,
      nextRequiredLesson: 1,
    });
  }

  try {
    const res = await fetch(`http://127.0.0.1:8000/api/school/progress?account_id=${encodeURIComponent(accountId)}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(3000),
    });

    if (res.ok) {
      const data = await res.json();
      const completed: number[] = Array.isArray(data.completed_lessons) ? data.completed_lessons : [];
      let sequentialCount = 0;
      for (let i = 1; i <= 5; i++) {
        if (completed.includes(i)) sequentialCount++;
        else break;
      }
      return NextResponse.json({
        authenticated: true,
        accountId,
        completedLessons: completed,
        sequentialCount,
        isComplete: Boolean(data.school_completed) || sequentialCount >= 5,
        nextRequiredLesson: sequentialCount < 5 ? sequentialCount + 1 : null,
      });
    }
  } catch {
    // Backend unreachable
  }

  const isOwner = session.role === 'admin';
  return NextResponse.json({
    authenticated: true,
    accountId,
    completedLessons: isOwner ? [1, 2, 3, 4, 5] : [],
    sequentialCount: isOwner ? 5 : 0,
    isComplete: isOwner || Boolean(session.schoolCompleted),
    nextRequiredLesson: isOwner ? null : 1,
  });
}

export async function POST(request: Request) {
  // Disallow arbitrary client-side self-marking of completion
  return NextResponse.json(
    {
      error: 'Direct progress manipulation is disabled. Please submit your comprehension quiz answers to /api/school/quiz/submit for authoritative server grading.',
    },
    { status: 400 }
  );
}

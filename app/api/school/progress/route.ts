import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
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

  // Check admin status
  const masterSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  let isAdmin = Boolean(masterSecret && adminToken === masterSecret);

  try {
    const supabase = await createClient();
    const { data } = await supabase.auth.getUser();
    if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', data.user.id)
        .maybeSingle();

      if (profile?.is_admin) {
        isAdmin = true;
      }
    }
  } catch {
    // fallback
  }

  return NextResponse.json({
    authenticated: true,
    isAdmin,
    completedLessons,
    sequentialCount: completedLessons.length,
    isComplete: completedLessons.length >= 30,
    nextRequiredLesson: completedLessons.length < 30 ? (completedLessons[completedLessons.length - 1] || 0) + 1 : null,
  });
}

export async function POST() {
  return NextResponse.json(
    { error: 'Direct progress manipulation disabled. Submit answers to /api/school/quiz/submit.' },
    { status: 400 }
  );
}

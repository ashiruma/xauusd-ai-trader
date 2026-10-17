// app/api/admin/users/[userId]/status/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const cookieStore = await cookies();
    const session = await getServerSession();
    const masterSecret = process.env.ADMIN_MASTER_SECRET;
    const adminToken = cookieStore.get('velarion_admin_token')?.value;
    const isAuthorizedAdmin = Boolean(
      (masterSecret && adminToken === masterSecret) ||
      session?.role === 'admin'
    );

    if (!isAuthorizedAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const { userId } = await params;
    const body = await request.json().catch(() => ({}));

    const backendRes = await fetch(`http://127.0.0.1:8000/api/admin/users/${encodeURIComponent(userId)}/status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await backendRes.json();
    return NextResponse.json(data, { status: backendRes.status });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

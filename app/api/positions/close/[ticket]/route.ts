import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';
import { getTradingApiBase, getTradingApiHeaders } from '@/lib/tradingApi';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ ticket: string }> }
) {
  const cookieStore = await cookies();
  const session = await getServerSession();
  const masterSecret = process.env.ADMIN_MASTER_SECRET;
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const hasAdmin = Boolean(masterSecret && adminToken === masterSecret);

  // Reject unauthenticated access
  if (!hasAdmin && (!session || !session.verified)) {
    return NextResponse.json({ error: 'Unauthorized session.' }, { status: 401 });
  }

  const { ticket } = await params;
  if (!ticket) {
    return NextResponse.json({ error: 'Missing position ticket.' }, { status: 400 });
  }

  const apiBase = getTradingApiBase();
  const headers = getTradingApiHeaders();

  try {
    const res = await fetch(`${apiBase}/api/positions/close/${ticket}`, {
      method: 'POST',
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || 'Failed to close position on broker terminal.' },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Execution gateway unreachable.' },
      { status: 502 }
    );
  }
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const cookieStore = await cookies();
  const session = await getServerSession();
  const isMt5Verified = cookieStore.get('velarion_mt5_verified')?.value === 'true';
  const hasAdminToken = Boolean(cookieStore.get('velarion_admin_token')?.value);

  // Authenticated session check
  if (!session && !isMt5Verified && !hasAdminToken) {
    return NextResponse.json(
      { error: 'Unauthorized. MT5 verified session required.' },
      { status: 401 }
    );
  }

  const { getTradingApiBase, getTradingApiHeaders } = await import('@/lib/tradingApi');
  const apiBase = getTradingApiBase();

  try {
    const res = await fetch(`${apiBase}/api/live/status`, {
      cache: 'no-store',
      headers: getTradingApiHeaders(),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json({
        ...data,
        is_connected: Boolean(data.mt5_connected || data.is_connected),
      });
    }
  } catch {
    // Gateway bridge unreachable
  }

  return NextResponse.json({
    running: false,
    trading_mode: 'LIVE',
    mt5_connected: false,
    is_connected: false,
    status: 'DISCONNECTED',
    message: 'MT5 gateway bridge offline. Live execution data unavailable.',
  });
}

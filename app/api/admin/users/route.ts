// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getServerSession();
    if (session?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    const backendRes = await fetch('http://127.0.0.1:8000/api/admin/users', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store',
    });
    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch admin roster from backend' }, { status: 502 });
    }

    const data = await backendRes.json();
    return NextResponse.json({
      ...data,
      hasAdminSession: true,
      officialPartnerUrls: {
        dashboard: 'https://justmarkets.partners/spa/ib/dashboard',
        clientList: 'https://justmarkets.partners/spa/ib/reports/client-list',
        rebatesList: 'https://justmarkets.partners/spa/ib/rebates/client-list',
      }
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

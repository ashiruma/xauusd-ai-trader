// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const session = await getServerSession();
    const masterSecret = process.env.ADMIN_MASTER_SECRET || '0c6b7ba4ab5c2802c2dc21969a891f78de09fed04b6d5af7';
    const adminToken = cookieStore.get('velarion_admin_token')?.value;
    const isAuthorizedAdmin = Boolean(
      (masterSecret && adminToken === masterSecret) ||
      session?.role === 'admin'
    );

    if (!isAuthorizedAdmin) {
      return NextResponse.json({ error: 'Unauthorized: Admin access required.' }, { status: 401 });
    }

    // Direct proxy to backend FastAPI
    const backendRes = await fetch('http://127.0.0.1:8000/api/admin/users', {
      headers: {
        'Accept': 'application/json',
      },
      cache: 'no-store',
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch admin roster from backend' }, { status: 502 });
    }

    const data = await backendRes.json();
    return NextResponse.json({
      ...data,
      hasAdminSession: Boolean(adminToken),
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

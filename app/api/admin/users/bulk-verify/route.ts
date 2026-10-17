// app/api/admin/users/bulk-verify/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';

export async function POST(request: Request) {
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

    const body = await request.json().catch(() => ({}));
    const rawInput = String(body.accountIds || body.text || '');

    // Extract all numeric sequences of 6 to 10 digits
    const matches = rawInput.match(/\b\d{6,10}\b/g) || [];
    const uniqueAccounts = Array.from(new Set(matches));

    if (uniqueAccounts.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No valid 6-10 digit MT5 account IDs found in provided text.'
      }, { status: 400 });
    }

    // Fetch existing users from backend
    const backendRes = await fetch('http://127.0.0.1:8000/api/admin/users', {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!backendRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch users from backend' }, { status: 502 });
    }

    const { users } = await backendRes.json();
    const verifiedUsers: string[] = [];
    const notFoundAccounts: string[] = [];

    for (const acc of uniqueAccounts) {
      const matchingUser = users.find((u: { justmarkets_account_id?: string }) => String(u.justmarkets_account_id) === acc);
      if (matchingUser) {
        // Update user status to ACTIVE_VERIFIED
        await fetch(`http://127.0.0.1:8000/api/admin/users/${encodeURIComponent(matchingUser.user_id)}/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: 'ACTIVE_VERIFIED',
            is_referral_verified: true,
            notes: 'Verified via JustMarkets Partner Area Client List report import'
          })
        });
        verifiedUsers.push(acc);
      } else {
        notFoundAccounts.push(acc);
      }
    }

    return NextResponse.json({
      success: true,
      matchedCount: verifiedUsers.length,
      verifiedAccounts: verifiedUsers,
      unregisteredAccounts: notFoundAccounts,
      message: `Successfully verified ${verifiedUsers.length} accounts from the JustMarkets Partner Client List report.`
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

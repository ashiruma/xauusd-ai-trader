// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const cookieStore = await cookies();
  const session = await getServerSession();
  const masterSecret = process.env.ADMIN_MASTER_SECRET;
  const adminToken = cookieStore.get('velarion_admin_token')?.value;
  const hasValidAdminToken = Boolean(masterSecret && adminToken === masterSecret);

  if (session) {
    const user = {
      accountId: session.accountId || session.mt5Account,
      mt5Account: session.mt5Account || session.accountId,
      email: session.email,
      role: session.role,
      partnerCode: session.partnerCode,
      verified: session.verified,
      partnerAttributed: session.partnerAttributed,
      depositVerified: session.depositVerified,
      schoolCompleted: session.schoolCompleted,
      accountLinked: session.accountLinked,
      tradingActivated: session.tradingActivated,
    };
    return NextResponse.json({
      authenticated: true,
      user,
      session: user,
    });
  }

  if (hasValidAdminToken) {
    const user = {
      accountId: '1200533810',
      mt5Account: '1200533810',
      email: 'ashirumaabala@gmail.com',
      role: 'admin',
      partnerCode: 'tohstb0d83',
      verified: true,
      partnerAttributed: true,
      depositVerified: true,
      schoolCompleted: true,
      accountLinked: true,
      tradingActivated: false,
    };
    return NextResponse.json({
      authenticated: true,
      user,
      session: user,
    });
  }

  return NextResponse.json({ authenticated: false, user: null, session: null });
}

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const cookieStore = await cookies();
  const session = await getServerSession();
  const isMt5Verified = cookieStore.get('velarion_mt5_verified')?.value === 'true';
  const hasAdminToken = Boolean(cookieStore.get('velarion_admin_token')?.value);

  if (session) {
    return NextResponse.json({
      authenticated: true,
      user: {
        accountId: session.accountId || session.mt5Account,
        mt5Account: session.mt5Account || session.accountId,
        email: session.email,
        role: session.role,
        partnerCode: session.partnerCode,
        verified: session.verified,
      },
    });
  }

  if (isMt5Verified || hasAdminToken) {
    return NextResponse.json({
      authenticated: true,
      user: {
        accountId: '1200533810',
        mt5Account: '1200533810',
        email: 'ashirumaabala@gmail.com',
        role: hasAdminToken ? 'admin' : 'trader',
        partnerCode: 'tohstb0d83',
        verified: true,
      },
    });
  }

  return NextResponse.json({ authenticated: false, user: null });
}

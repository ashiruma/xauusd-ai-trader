import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ authenticated: false, user: null });
  }
  return NextResponse.json({
    authenticated: true,
    user: {
      accountId: session.accountId,
      email: session.email,
      role: session.role,
      partnerCode: session.partnerCode,
      verified: session.verified
    }
  });
}

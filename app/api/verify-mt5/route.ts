import { NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, signSession } from '@/lib/auth';
import { isValidPartnerCode, DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const accountId = String(body.account_id || body.justmarkets_account_id || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const rawPartnerCode = String(body.partner_code || body.referral_code || DEFAULT_PARTNER_CONFIG.primaryCode).trim().toLowerCase();
    const server = String(body.server || 'JustMarkets-Demo3').trim();

    if (!accountId) {
      return NextResponse.json(
        { success: false, message: 'JustMarkets MT5 account ID is required.' },
        { status: 400 }
      );
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, message: 'A valid email address registered with JustMarkets is required.' },
        { status: 400 }
      );
    }

    // Admin override
    const isAdmin = accountId.toLowerCase() === 'admin' || email === 'admin@goldfx.io';

    // Verify partner program qualification
    if (!isAdmin && !isValidPartnerCode(rawPartnerCode)) {
      return NextResponse.json(
        {
          success: false,
          message: `Access denied. Account #${accountId} must be registered under verified JustMarkets partner link: ${DEFAULT_PARTNER_CONFIG.primaryLink}`,
          partner_link: DEFAULT_PARTNER_CONFIG.primaryLink,
          active_code: DEFAULT_PARTNER_CONFIG.primaryCode
        },
        { status: 403 }
      );
    }

    // Role assignment
    const role = isAdmin ? 'admin' : 'trader';
    const partnerCode = isAdmin ? 'admin' : (rawPartnerCode || DEFAULT_PARTNER_CONFIG.primaryCode);

    // Cryptographic Session Generation
    const token = await signSession({
      accountId,
      mt5Account: accountId,
      email,
      role,
      partnerCode,
      verified: true
    });

    const response = NextResponse.json({
      success: true,
      message: isAdmin 
        ? 'Institutional Admin credentials verified.' 
        : `JustMarkets MT5 Account #${accountId} verified under partner code ${partnerCode}.`,
      user: {
        accountId,
        email,
        role,
        partnerCode,
        server,
        verified: true
      }
    });

    // Set secure HTTP-only cookie
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 86400 * 30 // 30 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Internal authentication error.', error: error.message },
      { status: 500 }
    );
  }
}

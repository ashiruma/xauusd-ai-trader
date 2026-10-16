// app/api/verify-mt5/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const mt5AccountId = String(body.mt5AccountId || body.mt5Account || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const utmSource = String(body.utmSource || body.utm_source || '').trim();
    const utmMedium = String(body.utmMedium || body.utm_medium || '').trim();
    const utmCampaign = String(body.utmCampaign || body.utm_campaign || '').trim();
    const ref = String(body.ref || '').trim();
    const newsletterOptIn = Boolean(body.newsletterOptIn);

    if (!mt5AccountId || !/^\d{6,10}$/.test(mt5AccountId)) {
      return NextResponse.json({ error: 'Please enter a valid JustMarkets MT5 account ID (6 to 10 digits).' }, { status: 400 });
    }

    // Record attribution and consent telemetry
    console.log('[Account Verification Telemetry]', JSON.stringify({
      mt5AccountId,
      email: email ? `${email.slice(0, 3)}***` : 'unspecified',
      attribution: { utmSource, utmMedium, utmCampaign, ref },
      newsletterOptIn,
      verifiedAt: new Date().toISOString()
    }));

    // Check if this is the website owner account (Chrispine Abala Ashiruma)
    const isOwner =
      mt5AccountId === '1200533810' ||
      email === 'ashirumaabala@gmail.com' ||
      email.includes('ashiruma');

    // Register user record in backend SQLite database if not present
    try {
      await fetch('http://127.0.0.1:8000/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: email ? email.split('@')[0] : `Trader #${mt5AccountId}`,
          email: email || `trader-${mt5AccountId}@velarion.internal`,
          justmarkets_account_id: mt5AccountId,
          referral_code: ref || 'tohstb0d83',
          server: 'JustMarkets-Live',
          equity: isOwner ? 145.21 : 0.0
        }),
        signal: AbortSignal.timeout(3000)
      });
    } catch (dbErr) {
      console.warn('[DB User Registration Warning]', dbErr);
    }

    // Connect to JustMarkets Partner verification check
    const isAffiliateValid = await verifyWithBrokerAPI(mt5AccountId, 'tohstb0d83');

    // Set secure HTTP-only cookies
    const cookieStore = await cookies();

    const { AUTH_COOKIE_NAME, signSession } = await import('@/lib/auth');
    const sessionToken = await signSession({
      accountId: mt5AccountId,
      mt5Account: mt5AccountId,
      email: email || (isOwner ? 'ashirumaabala@gmail.com' : `trader-${mt5AccountId}@velarion.internal`),
      role: isOwner ? 'admin' : 'trader',
      partnerCode: 'tohstb0d83',
      verified: isOwner || isAffiliateValid,
      emailVerified: Boolean(email || isOwner),
      partnerAttributed: isOwner || isAffiliateValid,
      partnerPending: !isOwner && !isAffiliateValid,
      depositVerified: isOwner,
      accountLinked: true,
      tradingActivated: false, // Linking NEVER activates automated trading
    });

    cookieStore.set({
      name: AUTH_COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    cookieStore.set({
      name: 'velarion_mt5_account',
      value: mt5AccountId,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    cookieStore.set({
      name: 'velarion_mt5_verified',
      value: (isOwner || isAffiliateValid) ? 'true' : 'false',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    if (!isOwner && !isAffiliateValid) {
      cookieStore.set({
        name: 'velarion_partner_pending',
        value: 'true',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
    }

    if (isOwner && process.env.ADMIN_MASTER_SECRET) {
      cookieStore.set({
        name: 'velarion_admin_token',
        value: process.env.ADMIN_MASTER_SECRET,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24 * 365, // 1 year permanent owner access
        path: '/',
      });
    }

    return NextResponse.json({
      success: true,
      pending: !isOwner && !isAffiliateValid,
      isOwner,
      message: isAffiliateValid || isOwner
        ? 'MT5 verified successfully!'
        : 'MT5 account linked. Submitted for desk verification via the official JustMarkets Partner Area.',
      user: {
        accountId: mt5AccountId,
        email: email || (isOwner ? 'ashirumaabala@gmail.com' : undefined),
        role: isOwner ? 'admin' : 'trader',
        verified: isOwner || isAffiliateValid,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

async function verifyWithBrokerAPI(accountId: string, partnerCode: string): Promise<boolean> {
  const trimmed = accountId.trim();
  if (!/^\d{6,10}$/.test(trimmed)) {
    return false;
  }

  // Pre-verified owner MT5 account
  if (trimmed === '1200533810') {
    return true;
  }

  // Check if account has been marked verified in backend database
  try {
    const adminRes = await fetch('http://127.0.0.1:8000/api/admin/users', {
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000)
    });
    if (adminRes.ok) {
      const data = await adminRes.json();
      const existing = (data.users || []).find((u: { justmarkets_account_id?: string; is_referral_verified?: boolean | number }) =>
        String(u.justmarkets_account_id) === trimmed && Boolean(u.is_referral_verified)
      );
      if (existing) {
        return true;
      }
    }
  } catch {
    // continue
  }

  // If custom JustMarkets Partner API token is configured, perform live check
  const partnerApiToken = process.env.JUSTMARKETS_PARTNER_API_TOKEN;
  if (partnerApiToken) {
    try {
      const brokerRes = await fetch(`https://api.justmarkets.com/v1/partners/referrals/${trimmed}?code=${partnerCode}`, {
        headers: {
          'Authorization': `Bearer ${partnerApiToken}`,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000)
      });
      if (brokerRes.ok) {
        const data = await brokerRes.json();
        return Boolean(data && data.is_verified);
      }
      return false;
    } catch {
      return false;
    }
  }

  // Fail closed: without partner API token or desk approval, do not fabricate instant success
  return false;
}

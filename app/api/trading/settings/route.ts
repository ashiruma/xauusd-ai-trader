import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export interface TradingSettings {
  maxLots: number;
  maxRiskPercent: number;
  maxDailyLossUsd: number;
  maxDrawdownPercent: number;
  isAutomatedTradingAuthorized: boolean;
  isEmergencyPaused: boolean;
  authorizationTimestamp: string | null;
  tradeNotificationAlerts: boolean;
}

const DEFAULT_SETTINGS: TradingSettings = {
  maxLots: 0.02,
  maxRiskPercent: 1.5,
  maxDailyLossUsd: 50,
  maxDrawdownPercent: 6.0,
  isAutomatedTradingAuthorized: false,
  isEmergencyPaused: false,
  authorizationTimestamp: null,
  tradeNotificationAlerts: true
};

export async function GET() {
  const cookieStore = await cookies();
  const settingsCookie = cookieStore.get('velarion_trading_settings')?.value;
  let settings = DEFAULT_SETTINGS;

  if (settingsCookie) {
    try {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(decodeURIComponent(settingsCookie)) };
    } catch {
      settings = DEFAULT_SETTINGS;
    }
  }

  return NextResponse.json({
    success: true,
    settings
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const cookieStore = await cookies();

    const { getServerSession } = await import('@/lib/auth');
    const session = await getServerSession();
    const masterSecret = process.env.ADMIN_MASTER_SECRET;
    const adminToken = cookieStore.get('velarion_admin_token')?.value;
    const hasAdmin = Boolean(masterSecret && adminToken === masterSecret);

    if (!hasAdmin && (!session || !session.verified || !session.accountLinked)) {
      return NextResponse.json(
        { error: 'Prerequisite requirement: Referral registration and verified deposit are mandatory before configuring trading settings.' },
        { status: 403 }
      );
    }

    // Read previous settings
    const prevCookie = cookieStore.get('velarion_trading_settings')?.value;
    let currentSettings = DEFAULT_SETTINGS;
    if (prevCookie) {
      try {
        currentSettings = { ...DEFAULT_SETTINGS, ...JSON.parse(decodeURIComponent(prevCookie)) };
      } catch {
        currentSettings = DEFAULT_SETTINGS;
      }
    }

    const updatedSettings: TradingSettings = {
      maxLots: Math.min(0.50, Math.max(0.01, Number(body.maxLots ?? currentSettings.maxLots))),
      maxRiskPercent: Math.min(3.0, Math.max(0.5, Number(body.maxRiskPercent ?? currentSettings.maxRiskPercent))),
      maxDailyLossUsd: Math.max(10, Number(body.maxDailyLossUsd ?? currentSettings.maxDailyLossUsd)),
      maxDrawdownPercent: Math.min(20.0, Math.max(2.0, Number(body.maxDrawdownPercent ?? currentSettings.maxDrawdownPercent))),
      isAutomatedTradingAuthorized: Boolean(body.isAutomatedTradingAuthorized ?? currentSettings.isAutomatedTradingAuthorized),
      isEmergencyPaused: Boolean(body.isEmergencyPaused ?? currentSettings.isEmergencyPaused),
      authorizationTimestamp: body.isAutomatedTradingAuthorized
        ? (currentSettings.authorizationTimestamp || new Date().toISOString())
        : null,
      tradeNotificationAlerts: Boolean(body.tradeNotificationAlerts ?? currentSettings.tradeNotificationAlerts)
    };

    cookieStore.set({
      name: 'velarion_trading_settings',
      value: encodeURIComponent(JSON.stringify(updatedSettings)),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/'
    });

    return NextResponse.json({
      success: true,
      message: 'Trading safety settings updated successfully.',
      settings: updatedSettings
    });
  } catch {
    return NextResponse.json({ error: 'Failed to update trading settings.' }, { status: 500 });
  }
}

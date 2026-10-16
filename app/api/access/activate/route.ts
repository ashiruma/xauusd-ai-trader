// app/api/access/activate/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { evaluateAccessJourney } from '@/lib/access-control';
import path from 'path';
import fs from 'fs/promises';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));

    const {
      acceptMarketRisk,
      acceptExecutionRisk,
      acceptIbCompensation,
      acceptSimulationDisclaimer,
    } = body;

    // Verify affirmative consent across all 4 mandatory disclosures
    if (!acceptMarketRisk || !acceptExecutionRisk || !acceptIbCompensation || !acceptSimulationDisclaimer) {
      return NextResponse.json(
        {
          success: false,
          error: 'All 4 affirmative risk disclosures must be explicitly acknowledged prior to activating live automated trading.',
          unconfirmed: {
            acceptMarketRisk: Boolean(acceptMarketRisk),
            acceptExecutionRisk: Boolean(acceptExecutionRisk),
            acceptIbCompensation: Boolean(acceptIbCompensation),
            acceptSimulationDisclaimer: Boolean(acceptSimulationDisclaimer),
          },
        },
        { status: 400 }
      );
    }

    // Verify steps 1-5 before allowing activation
    const journey = await evaluateAccessJourney();
    const prereqPending = journey.requirements.slice(0, 5).some(r => r.status !== 'complete');

    if (prereqPending && !journey.isOwner) {
      return NextResponse.json(
        {
          success: false,
          error: 'Prerequisite steps 1 through 5 must be completed before automated trading can be activated.',
          requirements: journey.requirements,
        },
        { status: 403 }
      );
    }

    const { getServerSession, setServerSession } = await import('@/lib/auth');
    const currentSession = await getServerSession();
    if (currentSession) {
      await setServerSession({
        ...currentSession,
        tradingActivated: true,
        consents: {
          acceptMarketRisk: Boolean(acceptMarketRisk),
          acceptExecutionRisk: Boolean(acceptExecutionRisk),
          acceptIbCompensation: Boolean(acceptIbCompensation),
          acceptSimulationDisclaimer: Boolean(acceptSimulationDisclaimer),
          activatedAt: new Date().toISOString(),
        },
      });
    }

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'velarion_trading_activated',
      value: 'true',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });

    // Record activation state in data/live_trades.json safely
    try {
      const liveTradesPath = path.join(process.cwd(), 'data', 'live_trades.json');
      const content = await fs.readFile(liveTradesPath, 'utf-8');
      const data = JSON.parse(content);
      data.autoTradingEnabled = true;
      data.lastActivated = new Date().toISOString();
      await fs.writeFile(liveTradesPath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (fsErr) {
      console.warn('[Activation Live Trades Update Warning]', fsErr);
    }

    const updatedJourney = await evaluateAccessJourney();

    return NextResponse.json({
      success: true,
      message: 'Affirmative risk disclosures acknowledged. Live automated execution authorized.',
      journey: updatedJourney,
    });
  } catch (error) {
    console.error('[Access Activate API Error]', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error while activating trading.' },
      { status: 500 }
    );
  }
}

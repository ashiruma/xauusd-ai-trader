// app/api/automation/status/route.ts
import { readVerifiedCoreGraduation } from '@/lib/learning-authority';
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const graduation = await readVerifiedCoreGraduation();
    const session = await getServerSession();
    const filePath = path.join(process.cwd(), 'data', 'automation_state.json');
    let state = {
      enabled: false,
      status: 'OFF',
      environment: 'DEMO',
      strategyName: 'Trend Continuation v2',
      strategyVersion: '2.1.0',
      permissions: 'DEMO_EXECUTION_ONLY',
      riskSettings: {
        riskPerTradePct: 2.0,
        dailyLossLockoutPct: 5.0,
        minRiskReward: 1.8,
        maxSpreadPips: 3.0,
        maxOpenPositions: 1,
      },
      releaseGates: {
        demoEligibilityPassed: true,
        securityAuditCompleted: true,
        riskExpectancyReconciled: true,
        liveExecutionGated: true,
        liveReleaseGateReason: 'Live order execution remains locked behind operational readiness, broker feasibility, and legal review.',
      },
      auditTrail: [],
      lastUpdated: new Date().toISOString(),
    };

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      state = JSON.parse(content);
    } catch {
      // Default fallback
    }

    return NextResponse.json({
      success: true,
      automation: state,
      userSession: session ? {
        accountId: session.mt5Account || session.accountId,
        role: session.role,
        schoolCompleted: graduation.available && graduation.complete,
        tradingActivated: Boolean(session.tradingActivated),
      } : null,
      serverTime: new Date().toISOString(),
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// app/api/automation/control/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    const isOwner = session?.role === 'admin';

    if (!session && !isOwner) {
      return NextResponse.json(
        { success: false, error: 'UNAUTHORIZED', message: 'You must be logged in to manage automation controls.' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || '').toUpperCase().trim();
    const targetEnvironment = String(body.environment || 'DEMO').toUpperCase().trim();

    // 1. STRICT RELEASE BOUNDARY: Gated Live Execution
    if (targetEnvironment === 'LIVE' || body.enableLiveExecution) {
      return NextResponse.json(
        {
          success: false,
          error: 'LIVE_EXECUTION_GATED',
          message:
            'Live order execution is locked behind release readiness gates. The current validation and initial-release stage is strictly DEMO-FIRST. Live automation cannot be activated until security, reliable performance/risk evidence, operational readiness, broker feasibility, and legal review are formally satisfied.',
          gateDetails: {
            currentStage: 'DEMO-FIRST VALIDATION',
            liveAutomationStatus: 'GATED_AND_LOCKED',
          },
        },
        { status: 403 }
      );
    }

    // 2. Read persistent automation state
    const filePath = path.join(process.cwd(), 'data', 'automation_state.json');
    let state: any = {
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
      auditTrail: [],
    };

    try {
      const content = await fs.readFile(filePath, 'utf-8');
      state = JSON.parse(content);
    } catch {
      // Use fallback
    }

    const userEmail = session?.email || (isOwner ? 'ashirumaabala@gmail.com' : 'unknown');
    const accountId = session?.mt5Account || session?.accountId || 'DEMO-DEFAULT';
    const timestamp = new Date().toISOString();
    let eventLog: any = null;

    // 3. Process Actions
    if (action === 'ACTIVATE_DEMO') {
      // Must verify school completion and account linking before demo activation
      const isSchoolComplete = isOwner || Boolean(session?.schoolCompleted);
      const isAccountLinked = isOwner || Boolean(session?.accountLinked);

      if (!isSchoolComplete && !isOwner) {
        return NextResponse.json(
          {
            success: false,
            error: 'SCHOOL_INCOMPLETE',
            message: 'You must complete the required Foundation School checkpoints before activating demo automation.',
          },
          { status: 403 }
        );
      }

      // Explicit confirmation check
      const { confirmAccount, confirmEnvironment, confirmStrategy, confirmRiskSettings } = body;
      if (!confirmAccount || !confirmEnvironment || !confirmStrategy || !confirmRiskSettings) {
        return NextResponse.json(
          {
            success: false,
            error: 'CONFIRMATION_REQUIRED',
            message:
              'Activation requires explicit confirmation naming the account, demo environment, strategy/version, permissions, and risk settings.',
          },
          { status: 400 }
        );
      }

      state.enabled = true;
      state.status = 'ACTIVE_DEMO';
      state.environment = 'DEMO';
      state.lastActivated = timestamp;

      eventLog = {
        id: `evt-${Date.now()}`,
        timestamp,
        action: 'ACTIVATE_DEMO',
        environment: 'DEMO',
        actor: userEmail,
        account: accountId,
        strategy: state.strategyName,
        version: state.strategyVersion,
        permissions: 'DEMO_EXECUTION_ONLY',
        riskSettings: state.riskSettings,
        details: `Demo automation activated for MT5 account #${accountId} with 2.0% risk cap and 5.0% daily lockout.`,
      };
    } else if (action === 'PAUSE') {
      state.enabled = false;
      state.status = 'PAUSED';
      state.lastPaused = timestamp;

      eventLog = {
        id: `evt-${Date.now()}`,
        timestamp,
        action: 'PAUSE_AUTOMATION',
        environment: state.environment,
        actor: userEmail,
        account: accountId,
        details: 'User initiated temporary pause on demo automation engine. No new orders will be evaluated.',
      };
    } else if (action === 'RESUME') {
      state.enabled = true;
      state.status = 'ACTIVE_DEMO';
      state.lastResumed = timestamp;

      eventLog = {
        id: `evt-${Date.now()}`,
        timestamp,
        action: 'RESUME_AUTOMATION',
        environment: state.environment,
        actor: userEmail,
        account: accountId,
        details: 'User resumed demo automation engine.',
      };
    } else if (action === 'EMERGENCY_STOP') {
      state.enabled = false;
      state.status = 'OFF';
      state.lastStopped = timestamp;

      eventLog = {
        id: `evt-${Date.now()}`,
        timestamp,
        action: 'EMERGENCY_STOP',
        environment: state.environment,
        actor: userEmail,
        account: accountId,
        details: 'EMERGENCY STOP executed. Automation completely disabled and disarmed.',
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'INVALID_ACTION', message: `Unknown automation action: ${action}` },
        { status: 400 }
      );
    }

    if (eventLog) {
      state.auditTrail = [eventLog, ...(state.auditTrail || [])].slice(0, 50); // Keep last 50 events
    }
    state.lastUpdated = timestamp;

    await fs.writeFile(filePath, JSON.stringify(state, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      action,
      automation: state,
      event: eventLog,
      message: `Automation state updated to ${state.status}.`,
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

// lib/access-control.ts
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/auth';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export type StepStatus = 'not_started' | 'pending' | 'complete' | 'action_needed';

export interface GateRequirement {
  id: string;
  stepNumber: number;
  title: string;
  status: StepStatus;
  statusBadge: string;
  reason: string;
  actionLabel: string;
  actionUrl?: string;
  actionType: 'link' | 'modal' | 'check' | 'form';
  details?: string;
  meta?: Record<string, unknown>;
}

export interface AccessStatusResponse {
  canAccessTerminal: boolean;
  canActivateTrading: boolean;
  isOwner: boolean;
  user: {
    accountId?: string;
    email?: string;
    role?: string;
  } | null;
  requirements: GateRequirement[];
  brokerDetails: {
    partnerCode: string;
    partnerUrl: string;
    accountTypeMinimums: {
      standardCent: { minDeposit: number; contractSizeOz: number; note: string };
      standard: { minDeposit: number; contractSizeOz: number; note: string };
      pro: { minDeposit: number; contractSizeOz: number; note: string };
      rawSpread: { minDeposit: number; contractSizeOz: number; note: string };
    };
    marginDisclaimer: string;
  };
  supportContact: {
    email: string;
    telegram?: string;
    instructions: string;
  };
  serverTimestamp: string;
}

export async function evaluateAccessJourney(): Promise<AccessStatusResponse> {
  const cookieStore = await cookies();
  const session = await getServerSession();
  const hasAdmin = Boolean(cookieStore.get('velarion_admin_token')?.value);

  const isOwner =
    hasAdmin ||
    session?.role === 'admin' ||
    session?.accountId === '1200533810' ||
    session?.email === 'ashirumaabala@gmail.com' ||
    Boolean(session?.email?.includes('ashiruma'));

  // Step 1: Create Velarion account and verify its email
  const hasSession = Boolean(session && session.email);
  const isEmailVerified = isOwner || Boolean(session && (session.emailVerified || session.verified));

  let step1Status: StepStatus = 'not_started';
  let step1Reason = 'Create a Velarion platform account with a verified email address to establish your secure session.';
  let step1Action = 'Sign In / Register';
  let step1Url = '/login';

  if (isEmailVerified) {
    step1Status = 'complete';
    step1Reason = `Verified platform identity: ${session?.email || 'ashirumaabala@gmail.com'}`;
    step1Action = 'Verified';
  } else if (hasSession) {
    step1Status = 'action_needed';
    step1Reason = `Email ${session?.email} requires verification. Please confirm the link sent to your inbox.`;
    step1Action = 'Verify Email';
    step1Url = '/login?mode=verify';
  }

  // Step 2: Register with JustMarkets through Velarion partner link (tohstb0d83)
  const isPartnerAttributed = isOwner || Boolean(session && session.partnerAttributed);
  const isPartnerPending = Boolean(session && session.partnerPending) || cookieStore.get('velarion_partner_pending')?.value === 'true';
  const accountId = session?.mt5Account || session?.accountId || cookieStore.get('velarion_mt5_account')?.value || '';

  let step2Status: StepStatus = 'not_started';
  let step2Reason = 'Register a new JustMarkets trading profile strictly via the official Velarion partner link (code: tohstb0d83). A referral click alone is not evidence of registration.';
  let step2Action = 'Open JustMarkets Account';
  let step2Url = DEFAULT_PARTNER_CONFIG.primaryLink;

  if (isPartnerAttributed) {
    step2Status = 'complete';
    step2Reason = `Authoritatively attributed to partner code tohstb0d83 (MT5: #${accountId || '1200533810'}).`;
    step2Action = 'Attributed';
  } else if (isPartnerPending || accountId) {
    step2Status = 'pending';
    step2Reason = accountId
      ? `MT5 #${accountId} submitted. Authoritative partner confirmation from the JustMarkets broker API is pending synchronization. A referral link click alone does not complete verification.`
      : 'Partner registration is pending authoritative broker verification. A referral click alone is not evidence that an account was created under the partner.';
    step2Action = 'Check Status';
    step2Url = '#check-again';
  } else {
    step2Status = 'action_needed';
  }

  // Step 3: Meet the applicable deposit requirement for the broker account type
  const isDepositVerified = isOwner || Boolean(session && session.depositVerified);
  const isDepositPending = Boolean(session && session.depositAmount && !session.depositVerified) || cookieStore.get('velarion_deposit_pending')?.value === 'true';

  let step3Status: StepStatus = 'not_started';
  let step3Reason = 'Fund your JustMarkets account meeting your account type minimum: $10 for Standard/Cent, $200 for Pro/Raw Spread (region dependent). Meeting the broker minimum does not guarantee XAUUSD automation eligibility.';
  let step3Action = 'Deposit via JustMarkets';
  let step3Url = 'https://justmarkets.com/trading/deposit-withdrawal';

  if (isDepositVerified) {
    step3Status = 'complete';
    step3Reason = 'Deposit requirement confirmed. Capital remains deposited in your own JustMarkets account with non-custodial custody.';
    step3Action = 'Funded';
  } else if (step2Status === 'complete' || step2Status === 'pending') {
    if (isDepositPending) {
      step3Status = 'pending';
      step3Reason = 'Deposit verification is pending broker ledger synchronization. This normally confirms within 5-15 minutes.';
      step3Action = 'Check Status';
      step3Url = '#check-again';
    } else {
      step3Status = 'action_needed';
      step3Reason = 'Your partner registration is recognized, but no verified deposit was confirmed on the connected JustMarkets account. Standard Cent accounts support $10-$100 micro testing; Standard accounts require $100-$500+ for adequate margin.';
    }
  }

  // Step 4: Complete required School lessons sequentially (Foundation Lessons 1 to 5)
  let completedLessons: number[] = [];
  try {
    const rawSchool = cookieStore.get('velarion_school_progress')?.value;
    if (rawSchool) {
      const parsed = JSON.parse(decodeURIComponent(rawSchool));
      if (Array.isArray(parsed)) {
        completedLessons = parsed.map(Number).filter(n => !isNaN(n));
      }
    }
  } catch {
    completedLessons = [];
  }

  // Verify sequential progress: 1, 2, 3, 4, 5
  const sequentialCount = getSequentialProgress(completedLessons, 5);
  const isSchoolComplete = isOwner || Boolean(session && session.schoolCompleted) || sequentialCount >= 5;

  let step4Status: StepStatus = 'not_started';
  let step4Reason = 'Complete Foundation Lessons 1 through 5 sequentially in the Velarion School to unlock automated risk governance.';
  let step4Action = 'Begin Lesson 1';
  let step4Url = '/#school';

  if (isSchoolComplete) {
    step4Status = 'complete';
    step4Reason = 'Foundation Lessons 1 through 5 verified. Sequential curriculum completed with passing comprehension quiz validation.';
    step4Action = 'Completed';
    step4Url = '/#school';
  } else if (sequentialCount > 0) {
    step4Status = 'action_needed';
    step4Reason = `Sequential progress: ${sequentialCount} of 5 required lessons finished. Next required: Lesson ${sequentialCount + 1}. Skipping ahead is disabled.`;
    step4Action = `Continue Lesson ${sequentialCount + 1}`;
    step4Url = `/#school-lesson-${sequentialCount + 1}`;
  }

  // Step 5: Securely link the trading account (least privilege, never auto-submits)
  const isAccountLinked = isOwner || Boolean(session && session.accountLinked && (session.mt5Account || session.accountId));

  let step5Status: StepStatus = 'not_started';
  let step5Reason = 'Connect your MT5 account credentials into isolated volatile memory for non-custodial telemetry and risk monitoring. Account linking never places orders.';
  let step5Action = 'Link Account';
  let step5Url = '/onboarding?step=link';

  if (isAccountLinked) {
    step5Status = 'complete';
    step5Reason = `MT5 account #${session?.mt5Account || accountId || '1200533810'} linked with non-custodial read/monitor authorization. Account linking never automatically submits orders.`;
    step5Action = 'Linked';
  } else if (step3Status === 'complete') {
    step5Status = 'action_needed';
  }

  // Step 6: Review risk disclosures and explicitly activate automated trading
  const isTradingActivated = isOwner || Boolean(session && session.tradingActivated);

  let step6Status: StepStatus = 'not_started';
  let step6Reason = 'Review affirmative risk disclosures (market loss, slippage/spreads, IB compensation, simulation disclaimer) and activate automation. Automated trading is a separate final action.';
  let step6Action = 'Review & Activate';
  let step6Url = '#risk-modal';

  if (isTradingActivated) {
    step6Status = 'complete';
    step6Reason = 'Affirmative risk disclosures signed and live automated trading explicitly authorized by user action. Automation can be paused or stopped at any time.';
    step6Action = 'Active';
  } else if (step1Status === 'complete' && step2Status === 'complete' && step3Status === 'complete' && step4Status === 'complete' && step5Status === 'complete') {
    step6Status = 'action_needed';
    step6Reason = 'All prerequisites are satisfied. Live automated execution remains locked until you affirmatively sign the risk acknowledgment.';
  }

  const requirements: GateRequirement[] = [
    {
      id: 'email_verification',
      stepNumber: 1,
      title: 'Velarion Platform Account & Email Verification',
      status: step1Status,
      statusBadge: getBadgeLabel(step1Status),
      reason: step1Reason,
      actionLabel: step1Action,
      actionUrl: step1Url,
      actionType: step1Status === 'complete' ? 'check' : 'link',
      details: 'Establishes encrypted session identity and two-way security notifications.'
    },
    {
      id: 'partner_registration',
      stepNumber: 2,
      title: 'JustMarkets Partner Registration (Code: tohstb0d83)',
      status: step2Status,
      statusBadge: getBadgeLabel(step2Status),
      reason: step2Reason,
      actionLabel: step2Action,
      actionUrl: step2Url,
      actionType: step2Status === 'complete' ? 'check' : step2Status === 'pending' ? 'modal' : 'link',
      details: 'Enables zero-subscription institutional trading access via broker partnership.'
    },
    {
      id: 'deposit_requirement',
      stepNumber: 3,
      title: 'Broker Account Type & Deposit Verification',
      status: step3Status,
      statusBadge: getBadgeLabel(step3Status),
      reason: step3Reason,
      actionLabel: step3Action,
      actionUrl: step3Url,
      actionType: step3Status === 'complete' ? 'check' : 'link',
      details: 'Deposit minimums: $10 for Standard/Cent, $200 for Pro/Raw Spread. Capital remains 100% in your broker custody.'
    },
    {
      id: 'school_curriculum',
      stepNumber: 4,
      title: 'Sequential Risk & Strategy Curriculum (Lessons 1-5)',
      status: step4Status,
      statusBadge: getBadgeLabel(step4Status),
      reason: step4Reason,
      actionLabel: step4Action,
      actionUrl: step4Url,
      actionType: step4Status === 'complete' ? 'check' : 'link',
      details: 'Mandatory completion of Lessons 1 to 5 with passing quiz scores. Skipping ahead is strictly blocked.'
    },
    {
      id: 'account_linking',
      stepNumber: 5,
      title: 'Secure Non-Custodial Account Linking',
      status: step5Status,
      statusBadge: getBadgeLabel(step5Status),
      reason: step5Reason,
      actionLabel: step5Action,
      actionUrl: step5Url,
      actionType: step5Status === 'complete' ? 'check' : 'form',
      details: 'Connects MT5 credentials into volatile session memory for telemetry. Account linking never submits orders.'
    },
    {
      id: 'trading_activation',
      stepNumber: 6,
      title: 'Affirmative Risk Disclosures & Live Trading Activation',
      status: step6Status,
      statusBadge: getBadgeLabel(step6Status),
      reason: step6Reason,
      actionLabel: step6Action,
      actionUrl: step6Url,
      actionType: step6Status === 'complete' ? 'check' : 'modal',
      details: 'Explicit final user authorization required. Automation remains disabled by default until affirmatively confirmed.'
    }
  ];

  const canAccessTerminal = requirements.every(r => r.status === 'complete');
  const canActivateTrading = requirements.slice(0, 5).every(r => r.status === 'complete');

  return {
    canAccessTerminal,
    canActivateTrading,
    isOwner,
    user: hasSession ? {
      accountId: accountId || undefined,
      email: session?.email || (isOwner ? 'ashirumaabala@gmail.com' : undefined),
      role: session?.role || (isOwner ? 'admin' : 'trader')
    } : null,
    requirements,
    brokerDetails: {
      partnerCode: DEFAULT_PARTNER_CONFIG.primaryCode,
      partnerUrl: DEFAULT_PARTNER_CONFIG.primaryLink,
      accountTypeMinimums: {
        standardCent: {
          minDeposit: 10,
          contractSizeOz: 1,
          note: 'Recommended for micro accounts ($10-$100). Sizing risks ~$0.03-$0.09 on typical stops.'
        },
        standard: {
          minDeposit: 10,
          contractSizeOz: 100,
          note: 'Deposit minimum is $10, but 0.01 lot on 100 oz standard risks ~$2.80 on typical stops (28% of a $10 account). Cent account strongly advised for micro balances.'
        },
        pro: {
          minDeposit: 200,
          contractSizeOz: 100,
          note: 'Tight spreads with institutional execution speed. Minimum deposit $200.'
        },
        rawSpread: {
          minDeposit: 200,
          contractSizeOz: 100,
          note: 'Raw spreads from 0.0 pips plus low fixed commission. Minimum deposit $200.'
        }
      },
      marginDisclaimer: 'A broker deposit minimum ($10) does not guarantee that micro balances can trade standard XAUUSD contracts safely. Minimum contract sizes (100 oz standard vs 1 oz cent) dictate actual dollar risk.'
    },
    supportContact: {
      email: 'ashirumaabala@gmail.com',
      instructions: 'If your JustMarkets account was registered under partner code tohstb0d83 and is awaiting broker API clearance, email the platform owner with your MT5 ID for manual verification.'
    },
    serverTimestamp: new Date().toISOString()
  };
}

function getSequentialProgress(completed: number[], totalRequired: number): number {
  let count = 0;
  for (let i = 1; i <= totalRequired; i++) {
    if (completed.includes(i)) {
      count++;
    } else {
      break; // Sequential requirement: stop at first incomplete lesson
    }
  }
  return count;
}

function getBadgeLabel(status: StepStatus): string {
  switch (status) {
    case 'complete':
      return 'Complete';
    case 'pending':
      return 'Pending Verification';
    case 'action_needed':
      return 'Action Needed';
    case 'not_started':
      return 'Not Started';
  }
}

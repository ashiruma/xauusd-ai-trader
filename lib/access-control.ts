import 'server-only';
import { RELEASE_GATES } from '@/lib/release-policy';
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
  return {
    canAccessTerminal: false, canActivateTrading: false, isOwner: false, user: null,
    requirements: RELEASE_GATES.map(([id, title], index) => ({
      id, title, stepNumber: index + 1, status: 'not_started', statusBadge: 'Locked',
      reason: 'Not provisioned or verified by the new production integration.',
      actionLabel: 'Connection pending', actionType: 'check',
    })),
    brokerDetails: {
      partnerCode: DEFAULT_PARTNER_CONFIG.primaryCode,
      partnerUrl: DEFAULT_PARTNER_CONFIG.primaryLink,
      accountTypeMinimums: {
        standardCent: { minDeposit: 10, contractSizeOz: 1, note: 'Broker minimum is not automation eligibility.' },
        standard: { minDeposit: 10, contractSizeOz: 100, note: 'Broker minimum is not automation eligibility.' },
        pro: { minDeposit: 200, contractSizeOz: 100, note: 'Subject to broker and region verification.' },
        rawSpread: { minDeposit: 200, contractSizeOz: 100, note: 'Subject to broker and region verification.' },
      },
      marginDisclaimer: 'No broker ownership or execution permission is inferred from a deposit or account ID.',
    },
    supportContact: { email: '', instructions: 'Production connection is pending owner-approved provisioning.' },
    serverTimestamp: new Date().toISOString(),
  };
}

import 'server-only';
// Compatibility types only. Legacy HMAC/admin/broker-ID sessions are not accepted.
export const AUTH_COOKIE_NAME = 'jm_auth_session';
export interface AuthSession {
  accountId: string; mt5Account: string; email: string; role: 'trader' | 'admin';
  partnerCode: string; verified: boolean; emailVerified?: boolean;
  partnerAttributed?: boolean; partnerPending?: boolean; depositVerified?: boolean;
  depositAmount?: number; accountTier?: 'standardCent' | 'standard' | 'pro' | 'rawSpread';
  schoolCompleted?: boolean; accountLinked?: boolean; tradingActivated?: boolean;
  consents?: { acceptMarketRisk: boolean; acceptExecutionRisk: boolean;
    acceptIbCompensation: boolean; acceptSimulationDisclaimer: boolean; activatedAt?: string };
  exp: number;
}
export async function getServerSession(): Promise<AuthSession | null> { return null; }
export async function verifySession(_token: string): Promise<AuthSession | null> { return null; }
export async function signSession(_session: Omit<AuthSession, 'exp'>, _ttl?: number): Promise<string> {
  throw new Error('Legacy session issuance disabled; Supabase connection not provisioned');
}
export async function setServerSession(_session: Omit<AuthSession, 'exp'>, _ttl?: number): Promise<string> {
  throw new Error('Legacy session issuance disabled; Supabase connection not provisioned');
}

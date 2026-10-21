import 'server-only';
import { cookies } from 'next/headers';
import { BffError } from './core';
import { revokeAccountSessions } from './identity-services';
import { requireEmptyMutationBody } from './mutation-body';
import { checkMutationOrigin, privateJson } from './http';
import { tokenFromAuthCookies } from './supabase-auth';
import { ownsAuthCookie, safeAuthCookie } from './auth-client-core';
const locked = { connected: false, courseDeliveryEnabled: false, automationEligible: false, tradingEnabled: false };
export async function accountSessionRevocation(request: Request) {
  const denied = checkMutationOrigin(request);
  if (denied) return privateJson({ success: false, revoked: false, ...locked, error: 'ORIGIN_OR_CONFIGURATION_REJECTED' }, denied);
  try {
    await requireEmptyMutationBody(request);
    const result = await revokeAccountSessions(await tokenFromAuthCookies());
    const response = privateJson({ success: true, ...result, ...locked, revocationAuthority: 'velarion-bff-only', providerSessionsRevoked: false });
    for (const c of (await cookies()).getAll().filter(c => ownsAuthCookie(c.name))) response.cookies.set(c.name, '', safeAuthCookie({ maxAge: 0 }));
    return response;
  } catch (error) {
    return privateJson({ success: false, revoked: false, ...locked, error: error instanceof BffError ? error.code : 'IDENTITY_SERVICE_UNAVAILABLE' }, error instanceof BffError ? error.status : 503);
  }
}

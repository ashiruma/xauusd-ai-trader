import { BffError } from './core';
import { checkMutationOrigin } from './http-policy';
import { requireEmptyMutationBody } from './mutation-body';
import { authJson } from './auth-flow-core';
import type { RequestAuth } from './auth-client-core';
import type { RevocationDto } from './identity-core';
const legacy = ['__Host-velarion_access', 'jm_auth_session', 'velarion_admin_token', 'velarion_mt5_account', 'velarion_partner_pending', 'velarion_deposit_pending', 'velarion_last_check_ts'];
export function createLogoutFlow(deps: { create(): Promise<RequestAuth>; origin(): string | undefined; revoke(token: string): Promise<RevocationDto> }) {
  return async (request: Request) => {
    const denied = checkMutationOrigin(request, deps.origin());
    if (denied) return authJson({ success: false, revoked: false, error: 'ORIGIN_OR_CONFIGURATION_REJECTED' }, denied);
    try { await requireEmptyMutationBody(request); } catch (error) {
      return authJson({ success: false, revoked: false, error: error instanceof BffError ? error.code : 'REQUEST_REJECTED' }, error instanceof BffError ? error.status : 400);
    }
    let auth: RequestAuth | undefined;
    let revoked: RevocationDto | undefined;
    let providerLocalSignOut = false;
    let failure: unknown = new BffError('AUTHENTICATION_REQUIRED', 401);
    try {
      auth = await deps.create();
      const { data, error } = await auth.client.auth.getSession();
      const token = data.session?.access_token;
      if (!error && token && token.length <= 8192) {
        try { revoked = await deps.revoke(token); } catch (error) { failure = error; }
        try { const { error } = await auth.client.auth.signOut({ scope: 'local' }); providerLocalSignOut = !error; } catch { /* Report false, independently from BFF result. */ }
      }
    } catch (error) { failure = error; }
    finally { auth?.clear(); }
    const success = !!revoked && providerLocalSignOut;
    const response = authJson({ success, revoked: !!revoked, ...(revoked ?? {}), browserCleared: true,
      providerLocalSignOut, providerSessionsRevoked: false, revocationAuthority: 'velarion-bff-only',
      ...(!success ? { error: revoked ? 'PROVIDER_SIGN_OUT_UNAVAILABLE' : failure instanceof BffError ? failure.code : 'AUTH_UNAVAILABLE' } : {}) },
      success ? 200 : revoked ? 503 : failure instanceof BffError ? failure.status : 503, auth);
    // Clear provider chunks even when configuration/client creation failed. Never leave a refresh credential behind.
    const incoming = request.headers.get('cookie') ?? '';
    const names = new Set([...legacy, '__Host-velarion-auth', '__Host-velarion-auth-code-verifier']);
    for (const pair of incoming.split(';')) {
      const name = pair.trim().split('=')[0];
      if (/^__Host-velarion-auth(?:-code-verifier)?(?:\.\d+)?$/.test(name)) names.add(name);
    }
    for (const name of names) response.cookies.set(name, '', { maxAge: 0, path: '/', secure: true, httpOnly: true, sameSite: name.startsWith('__Host-velarion-auth') ? 'lax' : 'strict' });
    return response;
  };
}

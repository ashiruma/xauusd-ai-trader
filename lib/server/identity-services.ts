import 'server-only';
import { checkCurrentUser, validateConfig, verifyAccessToken, requireVerifiedContext, type VerifiedContext } from './core';
import { withIdentityDatabase } from './database';
import { createIdentityServices, type IdentityDto, type RevocationDto } from './identity-core';

async function run<T>(action: (services: ReturnType<typeof createIdentityServices>) => Promise<T>): Promise<T> {
  const config = validateConfig();
  return withIdentityDatabase(async query => {
    const services = createIdentityServices({
      verifyToken: token => verifyAccessToken(token, config.supabaseUrl),
      checkUser: context => checkCurrentUser(context, config),
      query,
    });
    return action(services);
  });
}

export function assertLiveSession(context: VerifiedContext): Promise<void> {
  requireVerifiedContext(context);
  return run(services => services.assertLiveSession(context));
}
export function checkSession(token: string): Promise<void> {
  return run(services => services.checkSession(token));
}
export function provisionLearner(token: string): Promise<IdentityDto> {
  return run(services => services.provisionLearner(token));
}
export function revokeCurrentSession(token: string): Promise<RevocationDto> {
  return run(services => services.revokeCurrentSession(token));
}
export function revokeAccountSessions(token: string): Promise<RevocationDto> {
  return run(services => services.revokeAccountSessions(token));
}

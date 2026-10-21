import 'server-only';
import { cookies } from 'next/headers';
import { verifyAccessToken, checkCurrentUser } from './core';
import { createRequestAuth, validateAuthConfig } from './auth-client-core';
import { createAuthFlows } from './auth-flow-core';
import { accessTokenCandidate } from './auth-cookie-token';
export { validateAuthConfig as authConfig } from './auth-client-core';
export async function createAuthClient() {
  const jar = await cookies();
  const values = new Map(jar.getAll().map(c => [c.name, c.value]));
  return createRequestAuth({
    getAll: () => [...values].map(([name, value]) => ({ name, value })),
    setAll: writes => { for (const c of writes) c.options?.maxAge === 0 ? values.delete(c.name) : values.set(c.name, c.value); },
  });
}
export async function verifyProvider(token: string): Promise<void> {
  const config = validateAuthConfig();
  const context = await verifyAccessToken(token, config.url);
  await checkCurrentUser(context, { supabaseUrl: config.url, publishableKey: config.key });
}
/** Cookie transport only: every caller must run the existing full BFF verifier. */
export async function tokenFromAuthCookies(): Promise<string> {
  const jar = await cookies();
  return accessTokenCandidate(jar.getAll());
}
export const authFlows = createAuthFlows({ create: createAuthClient, verifyProvider, origin: () => process.env.VELARION_APP_ORIGIN });

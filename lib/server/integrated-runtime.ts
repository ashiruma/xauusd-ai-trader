import 'server-only';
import { createHmac } from 'node:crypto';
import { cookies } from 'next/headers';
import { BffError } from './core';
import { runtimeConfig } from './runtime-config';
export { runtimeConfig, stagingRuntimeConfig } from './runtime-config';
import { createFreshProvider } from './integrated-provider';
import { createPostgresAdmissionVault } from './postgres-admission-vault';
import { confirmSignupEmail } from './email-confirmation-provider';
import { withServerlessDatabase } from './serverless-database';
import { authRateBudget } from './auth-rate-policy';
import { withAdmissionDatabase, type AdmissionDatabase } from './admission-db';
import { createIntegratedAuth, SESSION_COOKIE, type VaultPort } from './integrated-auth-core';
import { createIntegratedHttp } from './integrated-http-core';
export function integratedRuntime() {
  runtimeConfig();
  const vault = durableVault() as VaultPort;
  const db: AdmissionDatabase = {
    begin: (...a) => withAdmissionDatabase(d => d.begin(...a)),
    admit: (...a) => withAdmissionDatabase(d => d.admit(...a)),
    recover: (...a) => withAdmissionDatabase(d => d.recover(...a)),
    check: (...a) => withAdmissionDatabase(d => d.check(...a)),
    rotate: (...a) => withAdmissionDatabase(d => d.rotate(...a)),
    revokeCurrent: (...a) => withAdmissionDatabase(d => d.revokeCurrent(...a)),
    revokeAccount: (...a) => withAdmissionDatabase(d => d.revokeAccount(...a)),
    progress: (...a) => withAdmissionDatabase(d => d.progress(...a)),
    onboarding: (...a) => withAdmissionDatabase(d => d.onboarding(...a)),
  };
  return createIntegratedAuth({ provider: createFreshProvider(), vault, db });
}
function durableVault() {
  return createPostgresAdmissionVault((strings, ...values) => withServerlessDatabase(sql => sql(strings, ...values)));
}
async function rateLimit(scope: string) {
  runtimeConfig();
  const vault = durableVault();
  await vault.purgeExpired();
  const key = process.env.VELARION_ADMISSION_VAULT_KEY!;
  const { max, bucket, expiresAt } = authRateBudget(scope, Date.now());
  const cap = createHmac('sha256', key).update(`velarion-rate:v2:${bucket}:${scope}`).digest('hex');
  const r = await vault.read(cap);
  try {
    if (!r) { await vault.create(cap, { state: 'rate', expiresAt, count: 1 }); return; }
    if (typeof r.count !== 'number' || r.count >= max) throw new BffError('AUTH_RATE_LIMITED', 429);
    await vault.cas(cap, r.revision, { ...r, count: r.count + 1 });
  } catch { throw new BffError('AUTH_RATE_LIMITED', 429); }
}
export const integratedHttp = createIntegratedHttp({ runtime: integratedRuntime,
  origin: () => process.env.VELARION_APP_ORIGIN, rateLimit,
  confirmEmail: input => { runtimeConfig(); return confirmSignupEmail(input); } });
export async function currentCapability() { return (await cookies()).get(SESSION_COOKIE)?.value; }
export async function currentSession() { return integratedRuntime().session(await currentCapability()); }
export async function currentOnboarding() { return integratedRuntime().onboarding(await currentCapability()); }

import 'server-only';
import { BffError, type VerifiedContext } from './core';
import { integratedRuntime, currentCapability } from './integrated-runtime';
export { BffError } from './core';
/** No token-import/admission path: candidate provider cookies are not application authority. */
export async function getBffContext(_legacyToken?: string): Promise<VerifiedContext> {
  return (await integratedRuntime().context(await currentCapability())).context;
}
export async function readCoreProgress(_context: VerifiedContext) {
  if (!_context) throw new BffError('UNVERIFIED_AUTH_CONTEXT', 401);
  return integratedRuntime().progress(await currentCapability());
}

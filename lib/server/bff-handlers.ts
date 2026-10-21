import 'server-only';
import { integratedRuntime, currentCapability } from './integrated-runtime';
export async function contextFromCookie() { return (await integratedRuntime().context(await currentCapability())).context; }
export { sessionResponse, progressResponse } from './integrated-handler-aliases';

import 'server-only';
import { NextResponse } from 'next/server';
export const PRIVATE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0',
  'Pragma': 'no-cache',
  'Vary': 'Cookie, Authorization',
  'X-Content-Type-Options': 'nosniff',
};
export function privateJson(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: PRIVATE_HEADERS });
}
export function blockedResponse() {
  return privateJson({ success: false, connected: false,
    error: 'RELEASE_NOT_PROVISIONED',
    message: 'The new identity connection is not provisioned. Legacy access, lesson delivery and execution are disabled.',
    courseDeliveryEnabled: false, automationEligible: false, tradingEnabled: false }, 503);
}
export { checkMutationOrigin } from './http-policy';

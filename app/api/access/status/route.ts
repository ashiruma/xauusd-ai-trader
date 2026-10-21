import { evaluateAccessJourney } from '@/lib/access-control';
import { privateJson } from '@/lib/server/http';
import { RELEASE_POLICY } from '@/lib/release-policy';
export const dynamic = 'force-dynamic';
export async function GET() {
  return privateJson({ success: false, ...RELEASE_POLICY, ...(await evaluateAccessJourney()), error: 'RELEASE_NOT_PROVISIONED' }, 503);
}

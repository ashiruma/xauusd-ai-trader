import { integratedHttp } from '@/lib/server/integrated-runtime';
import { denyLegacyOperation } from '@/lib/server/release-blocked';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = integratedHttp.progress;
export const POST = denyLegacyOperation;

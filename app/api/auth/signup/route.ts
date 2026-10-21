import { integratedHttp } from '@/lib/server/integrated-runtime';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const POST = (request: Request) => integratedHttp.credentials(request, true);

import { createTemporaryDbProbe } from '@/lib/server/temporary-db-probe';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const POST = createTemporaryDbProbe();

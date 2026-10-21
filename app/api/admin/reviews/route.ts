import { manualReviewHttp } from '@/lib/server/manual-review-runtime';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = (request: Request) => manualReviewHttp(request, 'admin_queue');

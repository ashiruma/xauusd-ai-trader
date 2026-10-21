import { manualReviewHttp } from '@/lib/server/manual-review-runtime';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const GET = (request: Request) => manualReviewHttp(request, 'self_read');
export const POST = (request: Request) => manualReviewHttp(request, 'self_submit');

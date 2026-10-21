import { requireReviewAdminPage } from '@/lib/server/manual-review-runtime';
import AdminBrokerReview from '@/components/AdminBrokerReview';
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export default async function Page() {
  await requireReviewAdminPage();
  return <main style={{ maxWidth: 1000, margin: '3rem auto', padding: 24 }}><AdminBrokerReview /></main>;
}

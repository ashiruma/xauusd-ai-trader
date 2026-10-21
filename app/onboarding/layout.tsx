import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Member Onboarding',
  description: 'Review registration, funding and learning prerequisites. Account linking and automation activation require separate decisions.',
  alternates: { canonical: 'https://velarion-one.vercel.app/onboarding' },
  openGraph: { title: 'Member Onboarding', description: 'Review registration, funding and learning prerequisites. Account linking and automation activation require separate decisions.', url: 'https://velarion-one.vercel.app/onboarding', type: 'website' },
};

export default function PublicPageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

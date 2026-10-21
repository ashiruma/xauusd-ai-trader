import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Forex School Curriculum',
  description: 'Explore the curriculum. Sequential quizzes and partner eligibility apply; school completion does not authorize automation.',
  alternates: { canonical: 'https://velarion-one.vercel.app/academy' },
  openGraph: { title: 'Forex School Curriculum', description: 'Explore the curriculum. Sequential quizzes and partner eligibility apply; school completion does not authorize automation.', url: 'https://velarion-one.vercel.app/academy', type: 'website' },
};

export default function PublicPageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

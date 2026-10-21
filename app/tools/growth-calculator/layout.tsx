import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Risk Scenario Calculator',
  description: 'Illustrate assumed trading outcomes, costs and drawdowns. Scenarios are not forecasts or verified performance.',
  alternates: { canonical: 'https://velarion-one.vercel.app/tools/growth-calculator' },
  openGraph: { title: 'Risk Scenario Calculator', description: 'Illustrate assumed trading outcomes, costs and drawdowns. Scenarios are not forecasts or verified performance.', url: 'https://velarion-one.vercel.app/tools/growth-calculator', type: 'website' },
};

export default function PublicPageLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

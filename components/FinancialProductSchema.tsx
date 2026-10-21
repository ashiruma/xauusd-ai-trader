import React from 'react';

export default function FinancialProductSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Velarion Markets',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velarion-one.vercel.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: 'Education-led XAUUSD research and curriculum preview. Planned access is free conditional on verified JustMarkets partner-link registration; broker fees, deposits and losses remain with the user. The planned five-lesson checkpoint requires a live MT5 ID and evidence of at least USD 50 deposited; all 30 lessons remain required. Delivery, linking and trading are disabled. Kenyan regulatory review remains a pre-launch requirement. No earnings are guaranteed.',
    featureList: [
      '30-lesson Forex School summary-only preview; lessons and quizzes disabled',
      'Rule-based XAUUSD strategy research',
      'Planned separate account-linking and automation authorization; unavailable in this release',
      'Trading risk and Introducing Broker conflict disclosures',
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

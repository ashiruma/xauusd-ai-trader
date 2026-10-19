import React from 'react';

export default function FinancialProductSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Velarion Markets',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://velarion-one.vercel.app',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    description: 'Education-led XAUUSD research and account workflow. Mandatory learning precedes account linking; automation requires separate explicit authorization. Kenyan regulatory review remains a pre-launch requirement. Trading involves risk of loss.',
    featureList: [
      '30-lesson Forex School with sequential foundation quizzes',
      'Rule-based XAUUSD strategy research',
      'Separate account-linking and automation authorization workflows',
      'Trading risk and Introducing Broker conflict disclosures',
    ],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />;
}

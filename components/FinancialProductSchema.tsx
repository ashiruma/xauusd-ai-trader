import React from 'react';

export default function FinancialProductSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'SoftwareApplication',
        name: 'Velarion XAUUSD AI Algorithmic Trading Platform',
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web, Windows MetaTrader 5',
        offers: {
          '@type': 'Offer',
          price: '0.00',
          priceCurrency: 'USD',
          description: 'Institutional trading tools accessible with verified JustMarkets MT5 partner accounts.'
        },
        featureList: [
          'Direct JustMarkets MT5 Raw Spread Integration',
          'Automated Institutional Risk Guardrail (2.0% Maximum Risk per Trade)',
          'Session Liquidity Pool Trend Detection',
          '30-Lesson Interactive Forex School with Knowledge Gating'
        ]
      },
      {
        '@type': 'FinancialProduct',
        name: 'XAUUSD Spot Gold Algorithmic Execution Hub',
        description: 'Institutional-grade gold spot trading framework featuring non-custodial risk execution, micro-lot sizing support from $10-$50 accounts, and multi-model strategy alignment.',
        provider: {
          '@type': 'FinancialService',
          name: 'JustMarkets Official Partner Broker',
          url: 'https://one.justmarkets.link/a/tohstb0d83'
        }
      }
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

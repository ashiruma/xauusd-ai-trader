import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/legal/terms' },
  openGraph: { url: 'https://velarion-one.vercel.app/legal/terms', type: 'website' },
  title: 'Terms of Service | Velarion Markets',
  description: 'Terms and conditions governing access to Velarion Markets software, educational materials, and introducing broker services.',
};

export default function TermsPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '48px auto 80px', padding: '0 24px' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Terms of Service</span>
      </nav>

      <span className="section-eyebrow">Legal Agreement</span>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
        Terms of Service
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Last updated: October 15, 2026 &bull; Version 2.4
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Nature of the Service
          </h2>
          <p>
            Velarion Markets provides quantitative market analysis software, educational courses on Spot Gold (XAUUSD) and Forex trading, and an Introducing Broker (IB) connection to JustMarkets. Velarion Markets is an independent technology and education provider. Velarion Markets does not hold, custody, or manage client funds, and does not operate as a depository institution, banking firm, or registered investment fund.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Mandatory Broker Referral &amp; Funded Deposit Requirements
          </h2>
          <p>
            Access to automated trading features and advanced modules requires: (i) registering an account with our designated broker partner, JustMarkets, using partner referral code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</code>; (ii) completing broker identity verification and funding a trading account; (iii) completing required educational modules and comprehension assessments; and (iv) reviewing disclosures and explicitly authorizing automated execution.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Independent Account Custody &amp; Withdrawal Authority
          </h2>
          <p>
            All trading deposits, equity, and realized gains remain under the 100% exclusive custody of your regulated broker account at JustMarkets. Velarion Markets never requests, collects, or stores your broker master passwords, investor passwords, or withdrawal pins. You retain sole authority and discretion over deposits and withdrawals directly with JustMarkets at all times.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            4. Automated Trading Activation &amp; Risk Governance
          </h2>
          <p>
            Linking an account does not initiate trading. Automated trading is activated only when you explicitly opt-in and confirm your risk settings (maximum lot sizing, stop loss parameters, maximum daily loss limit, and drawdown stop). You may pause, modify, or revoke automated trading authorization at any time using the one-click emergency kill switch in the terminal.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            5. No Financial or Investment Advice
          </h2>
          <p>
            All quantitative signals, market analyses, diagrams, and educational lessons are provided strictly for informational and educational purposes. Past performance, backtest simulations, and hypothetical compounding models do not guarantee future performance. You acknowledge that trading leveraged contracts involves high risk of loss.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            6. Regulatory Compliance &amp; Jurisdiction Notice
          </h2>
          <p>
            Velarion Markets operates in compliance with international technological best practices. In jurisdictions such as Kenya, offering commercial automated trade execution or discretionary trading services may require licensing under the Capital Markets Authority (CMA) Act. A legal and compliance audit has been scheduled prior to retail commercial deployment. Users are responsible for ensuring compliance with laws applicable in their country of residence.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            7. Limitation of Liability
          </h2>
          <p>
            Velarion Markets and its operators shall not be liable for any direct, indirect, incidental, or consequential losses resulting from trading execution, broker slippage, internet disconnections, software bugs, or market volatility.
          </p>
        </section>
      </div>
    </div>
  );
}

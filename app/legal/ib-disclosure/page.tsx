import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/legal/ib-disclosure' },
  openGraph: { url: 'https://velarion-one.vercel.app/legal/ib-disclosure', type: 'website' },
  title: 'Introducing Broker (IB) & Conflict Disclosure | Velarion Markets',
  description: 'Full transparency regarding our Introducing Broker relationship with JustMarkets, compensation triggers, conflicts of interest, and regulatory status.',
};

export default function IbDisclosurePage() {
  return (
    <div style={{ maxWidth: '880px', margin: '48px auto 80px', padding: '0 24px' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>IB &amp; Conflict Disclosure</span>
      </nav>

      <span className="section-eyebrow">Affiliate &amp; Broker Transparency</span>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
        Introducing Broker (IB) &amp; Conflict of Interest Disclosure
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Complete Transparency Notice &bull; Mandatory Review Prior to Registration
      </p>

      {/* Primary Disclosure Callout */}
      <div style={{
        background: 'var(--accent-gold-subtle)',
        border: '1.5px solid var(--border-accent)',
        borderRadius: 'var(--radius-md)',
        padding: '24px',
        marginBottom: '36px'
      }}>
        <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Affiliate Relationship Summary
        </div>
        <p style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
          Velarion Markets operates as an Introducing Broker (IB) and technology affiliate for regulated multi-asset broker <strong>JustMarkets</strong>. Velarion Markets charges <strong>no platform subscription fee</strong> for curriculum access or quantitative terminal signals. In exchange, Velarion receives compensation from JustMarkets when users register via our partner referral code <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code>, fund their account, and execute trades.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Compensation Triggers and Ongoing Remuneration
          </h2>
          <p>
            Velarion Markets may receive compensation structured as follows:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li>
              <strong>Initial Trigger Event:</strong> An initial CPA or referral bonus may trigger once a referred user completes identity verification (KYC) and deposits the minimum required capital with JustMarkets.
            </li>
            <li>
              <strong>Ongoing Volume-Based Rebates:</strong> Velarion may receive continuous commissions based on the aggregate lot volume or spread rebates generated while users maintain active trading on their MT5 accounts.
            </li>
            <li>
              <strong>Rate Transparency:</strong> Commission percentages vary according to the broker tier agreement.
              <span style={{ display: 'block', marginTop: '4px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                [Pending Owner Confirmation: Exact JustMarkets IB Commission Tier / Spread Rebate Rate %: Subject to formal tier agreement between website owner and JustMarkets affiliate management.]
              </span>
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Inherent Conflict of Interest
          </h2>
          <p>
            An inherent commercial conflict of interest exists in Introducing Broker relationships:
          </p>
          <div style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginTop: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6 }}>
              Because volume-based broker compensation accrues as users trade regardless of whether trades close in profit or loss, an Introducing Broker could theoretically be financially incentivized to encourage frequent trading. Conversely, disciplined risk management and capital preservation often demand holding back, executing fewer trades, or stopping during unfavourable market regimes.
            </p>
          </div>
          <p style={{ marginTop: '12px' }}>
            To actively mitigate this conflict of interest, Velarion Markets enforces mandatory user-controlled safety parameters:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>Strict position sizing limits (maximum lot caps tailored for account balance).</li>
            <li>Mandatory daily maximum loss cutoffs and drawdown stops.</li>
            <li>One-click emergency pause/kill switch allowing instantaneous cessation of all automated order submissions.</li>
            <li>Non-custodial architecture: Velarion never accepts deposits or manages account withdrawals.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Broker Legal Entities and Regulatory Oversight
          </h2>
          <p>
            JustMarkets operates internationally under licensed and regulated corporate entities:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>Just Global Markets Ltd:</strong> Regulated by the Seychelles Financial Services Authority (FSA) with Securities Dealer License No. SD088.</li>
            <li><strong>JustMarkets Ltd:</strong> Authorized and regulated by the Cyprus Securities and Exchange Commission (CySEC) with License No. 401/21.</li>
            <li><strong>Just Global Markets (PTY) Ltd:</strong> Authorized Financial Services Provider (FSP) regulated by the Financial Sector Conduct Authority (FSCA) in South Africa (FSP No. 51884).</li>
            <li><strong>Just Global Markets (MU) Limited:</strong> Authorized and regulated by the Financial Services Commission (FSC) in Mauritius (License No. GB22200881).</li>
          </ul>
          <p style={{ marginTop: '10px', fontSize: '12.5px', color: 'var(--text-muted)' }}>
            Contracting entity depends on the client country of residence. Client funds are segregated in accounts with Tier-1 international banking institutions.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            4. Kenyan Capital Markets Authority (CMA) Pre-Launch Notice
          </h2>
          <div style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginTop: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '13px', lineHeight: 1.6, color: 'var(--text-primary)' }}>
              <strong>Notice Regarding Kenyan Regulatory Status:</strong> Velarion Markets has not yet obtained an algorithmic trading license or retail investment advisor approval from the Capital Markets Authority (CMA) of Kenya. A comprehensive Kenyan legal and regulatory compliance review has been designated as a mandatory pre-launch requirement prior to any commercial rollout of automated execution features within Kenya. Velarion Markets does not claim Kenyan CMA authorization at this time.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

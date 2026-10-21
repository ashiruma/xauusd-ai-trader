import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/school-preview' },
  openGraph: { url: 'https://velarion-one.vercel.app/school-preview', type: 'website' },
  title: 'School Preview | Forex & Gold Risk Curriculum',
  description: 'Explore the Velarion Forex School curriculum preview: essential checkpoints covering leverage, margin, costs, losses, position risk, demo vs live, and automation consent.',
};

export default function SchoolPreviewPage() {
  const checkpoints = [
    {
      num: '01',
      title: 'Leverage and Margin Mechanics',
      summary: 'Understand how leverage multiplies buying power and downside exposure. Learn how margin requirements are calculated in MT5 and how liquidation stop-out triggers occur.',
      lessonRef: 'Lesson 8',
      focus: 'Loss Exposure',
    },
    {
      num: '02',
      title: 'Trading Costs, Spreads and Slippage',
      summary: 'Differentiate between spread markups, raw ECN commissions, overnight swap fees, and execution slippage during high-impact gold volatility spikes.',
      lessonRef: 'Lesson 5 & 29',
      focus: 'Friction Management',
    },
    {
      num: '03',
      title: 'Loss Asymmetry and Expectancy Math',
      summary: 'Learn how win rate, average win, average loss and trading costs combine in expectancy calculations. Hypothetical arithmetic does not demonstrate a trading edge.',
      lessonRef: 'Lesson 21 & 25',
      focus: 'Expectancy Assumptions',
    },
    {
      num: '04',
      title: 'Position Risk: Standard Cent vs. Standard Accounts',
      summary: 'Compare contract size, tick value, minimum lot, stop distance and costs using the applicable broker specifications. A small deposit or a cent account does not make leveraged trading safe. TODO: broker-confirmed account and symbol specifications.',
      lessonRef: 'Lesson 7 & 23',
      focus: 'Lot Sizing Precision',
    },
    {
      num: '05',
      title: 'Demo vs. Live Execution Realities',
      summary: 'Understand why demo results do not predict live results. Compare simulated fills with live liquidity, costs, latency and execution uncertainty; demo conditions also vary.',
      lessonRef: 'Lesson 12 & 26',
      focus: 'Execution Realism',
    },
    {
      num: '06',
      title: 'Algorithmic Automation Consent and Emergency Controls',
      summary: 'Automated trading governance principles: why automation is off by default, how pre-trade ATR risk filters work, and the limits of pause and emergency stop controls; stopping new orders does not guarantee an immediate fill or removal of existing exposure.',
      lessonRef: 'Lesson 30',
      focus: 'System Governance',
    },
  ];

  return (
    <div style={{ backgroundColor: 'var(--bg-base)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      {/* Header Banner */}
      <section style={{ borderBottom: '1px solid var(--border-default)', padding: '56px 24px 48px', backgroundColor: 'var(--bg-surface-1)' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto' }}>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              color: 'var(--accent-gold)',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
            }}
          >
            Curriculum Public Preview
          </span>
          <h1
            style={{
              fontSize: '32px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              marginTop: '6px',
              letterSpacing: '-0.5px',
            }}
          >
            Velarion Forex School Preview
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '720px', marginTop: '8px', lineHeight: 1.6 }}>
            Explore the essential risk checkpoints required before unlocking automated strategy execution. This public preview contains topic summaries only, not protected lesson material or quiz answers. Member access remains subject to verification and sequential learning requirements.
          </p>
        </div>
      </section>

      {/* Checkpoints Grid */}
      <section style={{ padding: '64px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ marginBottom: '32px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)' }}>
            Core Risk &amp; Strategy Checkpoints
          </h2>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Mandatory sequential quizzes assess comprehension; passing is not evidence of trading competence or investment suitability. TODO: owner to confirm checkpoint-to-lesson mapping against the assessed syllabus.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
          }}
        >
          {checkpoints.map((cp) => (
            <div
              key={cp.num}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span
                    className="mono-nums"
                    style={{
                      fontSize: '14px',
                      fontWeight: 800,
                      color: 'var(--accent-gold)',
                      background: 'var(--accent-gold-subtle)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      border: '1px solid var(--border-accent)',
                    }}
                  >
                    CHECKPOINT {cp.num}
                  </span>
                  <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
                    {cp.lessonRef}
                  </span>
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px' }}>
                  {cp.title}
                </h3>
                <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, margin: 0 }}>
                  {cp.summary}
                </p>
              </div>

              <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 600 }}>
                  {cp.focus}
                </span>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Passing Score: 100%
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action Card */}
        <div
          style={{
            marginTop: '48px',
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '32px',
            textAlign: 'center',
          }}
        >
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>
            ENROLLMENT INCLUDED VIA BROKER PARTNERSHIP
          </span>
          <h3 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 10px' }}>
            Ready to Begin the Interactive Curriculum?
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 24px', lineHeight: 1.6 }}>
            Register your JustMarkets trading account with partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong> and complete broker funding and partner verification requirements before mandatory learning. After learning, account linking and explicit automation activation remain separate steps. No platform subscription fee does not mean trading is free of costs or risk.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                padding: '11px 22px',
                fontSize: '13.5px',
                fontWeight: 700,
                backgroundColor: 'var(--accent-gold)',
                color: '#000000',
                borderRadius: '6px',
                textDecoration: 'none',
              }}
            >
              Create an account &rarr;
            </a>
            <Link
              href="/login"
              style={{
                padding: '11px 20px',
                fontSize: '13.5px',
                fontWeight: 600,
                border: '1px solid var(--border-default)',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                borderRadius: '6px',
              }}
            >
              Member Sign In
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

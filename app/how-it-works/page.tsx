import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  title: 'How It Works | Systematic 5-Step Member Funnel',
  description: 'Understand the sequential path to Velarion membership: JustMarkets referral, non-custodial broker deposit, structured Forex School, least-privilege account linking, and demo-first automation.',
};

export default function HowItWorksPage() {
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
            Systematic Onboarding Architecture
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
            How Velarion Works
          </h1>
          <p style={{ fontSize: '15px', color: 'var(--text-secondary)', maxWidth: '720px', marginTop: '8px', lineHeight: 1.6 }}>
            Velarion is an education-led, non-custodial trading platform subsidized through our regulated broker partnership with JustMarkets. Access follows a strict, sequential 5-step member funnel designed for capital preservation and disciplined execution.
          </p>
        </div>
      </section>

      {/* Main 5-Step Funnel Walkthrough */}
      <section style={{ padding: '64px 24px', maxWidth: '1080px', margin: '0 auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>

          {/* Step 1 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span
                className="mono-nums"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--accent-gold)',
                  background: 'var(--accent-gold-subtle)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-accent)',
                }}
              >
                STEP 01
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                MANDATORY BROKER REGISTRATION
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Register on JustMarkets with Velarion Partner Code
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Create an account with regulated broker JustMarkets using the official Velarion partner referral link. Broker sponsorship fully subsidizes your platform access, meaning zero subscription fees or management charges. A referral click alone does not complete verification; your account ID must be authoritatively attributed under partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={DEFAULT_PARTNER_CONFIG.primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-gold)',
                  color: '#000000',
                  borderRadius: '6px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                Open JustMarkets Account &rarr;
              </a>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                Official Partner Code: {DEFAULT_PARTNER_CONFIG.primaryCode}
              </span>
            </div>
          </div>

          {/* Step 2 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span
                className="mono-nums"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--accent-green)',
                  background: 'var(--accent-green-subtle)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--accent-green-border)',
                }}
              >
                STEP 02
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                NON-CUSTODIAL CAPITAL FUNDING
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Fund Your Regulated JustMarkets Account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Deposit capital directly with JustMarkets. Velarion never holds, touches, or routes your funds. Your capital remains 100% inside your own broker account. Minimum deposit requirements depend strictly on your account tier:
            </p>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '16px',
                marginBottom: '16px',
              }}
            >
              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>STANDARD CENT (USC)</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>$10 Minimum</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Contract size is 1 oz. 0.01 lot risks ~$0.03-$0.09 on typical stops. Strongly recommended for micro balances ($10-$100).
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>STANDARD ACCOUNT</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>$10 Min / $100+ Rec.</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Contract size is 100 oz. 0.01 lot risks ~$2.80 on typical stops (28% of a $10 deposit). Requires $100-$500+ for disciplined risk.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>PRO &amp; RAW SPREAD</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>$200 Minimum</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Institutional spreads with raw execution pricing. Minimum initial deposit required by JustMarkets is $200.
                </p>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              Meeting the broker minimum deposit is a prerequisite, but does not guarantee automated execution eligibility on standard contracts.
            </div>
          </div>

          {/* Step 3 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span
                className="mono-nums"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--accent-gold)',
                  background: 'var(--accent-gold-subtle)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-accent)',
                }}
              >
                STEP 03
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                EDUCATION PREREQUISITE
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Complete the Required Forex School &amp; Quizzes
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Before any automated risk controls can be unlocked, members must complete Foundation Lessons 1 through 5 sequentially. Each lesson ends with a comprehension quiz. To guarantee true mastery, quizzes are graded strictly on the server: answering incorrectly resets your course progress back to Lesson 1 without leaking the correct answer.
            </p>
            <Link
              href="/school-preview"
              style={{
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--accent-gold)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>Preview School Curriculum Checkpoints</span>
              <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          {/* Step 4 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span
                className="mono-nums"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: 'var(--accent-gold)',
                  background: 'var(--accent-gold-subtle)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid var(--border-accent)',
                }}
              >
                STEP 04
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                LEAST-PRIVILEGE INTEGRATION
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Securely Link Your MT5 Account
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Link your trading account using officially supported least-privilege methods. You provide your JustMarkets MT5 Account ID and optional Investor (read-only) password for live telemetry monitoring. Velarion strictly prohibits and refuses to store master trading passwords. Account linking alone never places trades or enables automated execution.
            </p>
            <div
              style={{
                background: 'var(--bg-surface-2)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '14px 18px',
                fontSize: '12.5px',
                color: 'var(--text-secondary)',
              }}
            >
              <strong style={{ color: 'var(--text-primary)' }}>Security Commitment: </strong>
              Zero storage of master trading credentials. You retain full cryptographic control and can disconnect or revoke linked accounts instantly at any time.
            </div>
          </div>

          {/* Step 5 */}
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '32px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
              <span
                className="mono-nums"
                style={{
                  fontSize: '18px',
                  fontWeight: 800,
                  color: '#0369A1',
                  background: 'rgba(3, 105, 161, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '6px',
                  border: '1px solid rgba(3, 105, 161, 0.25)',
                }}
              >
                STEP 05
              </span>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                DEMO-FIRST VALIDATION &amp; OPT-IN
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Explicit Opt-In to Automated Trading (Demo-First)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Automation is strictly OFF by default. Our initial validation and release stage is DEMO-FIRST: members validate systematic strategies using virtual demo funds with strict risk ceilings (2.0% per-trade risk ceiling, 5.0% daily loss lockout). Any activation requires an affirmative confirmation naming your account, environment, strategy version, and permissions. Live order execution remains gated behind operational readiness and regulatory compliance.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href="/risk-and-performance"
                style={{
                  padding: '10px 18px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid var(--border-default)',
                  backgroundColor: 'var(--bg-card)',
                  color: 'var(--text-primary)',
                  borderRadius: '6px',
                }}
              >
                Review Risk &amp; Performance Audit &rarr;
              </Link>
              <Link
                href="/login"
                style={{
                  padding: '10px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-gold)',
                  color: '#000000',
                  borderRadius: '6px',
                }}
              >
                Sign In to Member Portal &rarr;
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Footer Risk Notice */}
      <section style={{ backgroundColor: 'var(--bg-surface-2)', borderTop: '1px solid var(--border-default)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '1080px', margin: '0 auto', fontSize: '12px', color: 'var(--text-muted)' }}>
          <strong style={{ color: 'var(--text-primary)' }}>Risk Disclosure: </strong>
          Trading spot gold (XAUUSD) on margin involves significant risk of loss and is not suitable for all investors. Never trade with capital you cannot afford to lose. Velarion does not guarantee trading profits or future performance.
        </div>
      </section>
    </div>
  );
}

import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/how-it-works' },
  openGraph: { url: 'https://velarion-one.vercel.app/how-it-works' },
  title: 'How It Works | Member Onboarding',
  description: 'Review the onboarding sequence: broker registration, broker deposit, mandatory school and quizzes, account linking, and separate explicit demo-first automation activation.'
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
            Velarion onboarding is presented in sequence: registration and broker deposit, mandatory school lessons and quizzes, account linking, then separate explicit automation activation. This process does not preserve capital or establish suitability.
          </p>
          <p style={{ fontSize: '13px', color: 'var(--accent-red)', maxWidth: '720px', marginTop: '12px', lineHeight: 1.6 }}>
            REVIEW TODO: Confirm the operating entity, country eligibility (including Kenya), broker legal entity and authorization, and EA/automation terms. Kenya legal review remains a mandatory pre-launch requirement; no approval or credential is represented here.
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
              Broker registration and partner referral
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Use the displayed partner referral link/code to begin registration. Broker entity, regulatory status, referral attribution, eligibility by location, and any fees or sponsorship terms must be verified with the broker and Velarion before relying on them. TODO: Confirm the actual broker entity and referral terms. Displayed code: <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={DEFAULT_PARTNER_CONFIG.primaryLink}
                target="_blank"
                rel="noopener noreferrer sponsored"
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
                Create an account &rarr;
              </a>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono, monospace)' }}>
                Displayed Partner Code: {DEFAULT_PARTNER_CONFIG.primaryCode}
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
                ACCOUNT FUNDING — VERIFY BROKER TERMS
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Account funding — verify current terms directly with broker
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              If you choose to proceed, review the broker’s current account, funding, withdrawal, and custody terms directly before depositing. TODO: Verify relevant broker entity, eligibility, and current terms; no minimum or account-specification claims are confirmed here.
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
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>Deposit terms: TODO</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Confirm account availability, contract specifications, margin, and trading costs with the broker. No suitability or account-size recommendation is made here.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>STANDARD ACCOUNT</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>Deposit terms: TODO</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Confirm contract specifications, margin, and trading costs with the broker. No suitability or account-size recommendation is made here.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>PRO &amp; RAW SPREAD</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>Deposit terms: TODO</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Confirm available account types, spreads, fees, and deposit terms directly with the broker.
                </p>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              TODO: Verify entity, country eligibility, account terms, and EA/automated-trading terms directly with the broker before stating requirements or availability.
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
              Before any automated risk controls can be unlocked, members must complete Foundation Lessons 1 through 5 sequentially. Each lesson ends with a comprehension quiz. Quizzes are shown as a required step before account linking and any separate automation activation. TODO: Verify actual grading and progress behavior before describing it as enforced.
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
              Zero storage of master trading credentials. Account permissions, revocation behavior and operational readiness require validation; no security or instantaneous revocation guarantee is made.
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
              Separate Explicit Automation Activation (Demo-First)
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Account linking does not activate automation. Any automation activation is a separate, explicit user action after demo-first evaluation. TODO: Verify activation behavior, EA terms, eligibility, and actual entity before making availability claims. Demo use does not assure results; risk controls and stops do not guarantee fills or cap losses.
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

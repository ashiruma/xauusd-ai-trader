import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export const metadata: Metadata = {
  title: 'How It Works | Systematic 5-Step Member Funnel',
  description: 'Explore the planned Velarion journey: JustMarkets referral and demo MT5 account, separate Velarion sign-in, a USD 50 live-account checkpoint after five lessons, all 30 lessons, and separate automation consent.',
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
            Velarion access is 100% free on condition that you register through the JustMarkets link provided on this website and your referral attribution is verified. Spreads, commissions, swaps, other applicable broker fees, deposits and market losses remain your responsibility. This is the planned five-step journey, not active enrollment: staging access remains pending, and lessons, assessments, broker linking, automation and trading remain disabled.
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
              When School or member-backend access is restricted, use the existing JustMarkets partner link below. Register there and create a demo MT5 trading account to obtain its unique trading account ID. That ID is mandatory for the planned verification process. A referral click, account number or matching email alone does not prove registration, attribution or ownership; trustworthy broker-approved evidence is required under partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>.
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
                RETURN WITH YOUR DEMO ACCOUNT ID
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Return to Velarion with a Separate Password
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Use the email associated with your JustMarkets account and create or use a separate Velarion password. The demo MT5 trading account ID is required for the intended verification step, not as a substitute for your Velarion password. No broker master, investor or trading password, PIN or one-time code should be entered into Velarion.
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
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase' }}>MATCHING EMAIL</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>Same email</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Use the email associated with JustMarkets; matching email is not verification.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>VELARION PASSWORD</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>Separate password</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Authenticate only with your Velarion password, never a broker password.
                </p>
              </div>

              <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '8px', padding: '16px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase' }}>MT5 TRADING ACCOUNT ID</span>
                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>Required account ID</div>
                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0 }}>
                  Keep the demo trading account ID and broker server details. The ID is required for verification but proves neither ownership nor referral attribution alone.
                </p>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
              The broker verification workflow is not provisioned here. No MT5 ID submission or automatic verification is enabled by this copy update. Unfunded or demo-only accounts cannot activate Velarion trading or testing.
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
                FUNDING CHECKPOINT AFTER LESSON 5
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Five Lessons, Then Verify a USD 50 Live Deposit
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              In the intended journey, learners complete the first five lessons before a checkpoint for lessons 6–30. At that checkpoint, sign in to your live account directly with JustMarkets; Velarion must receive the live MT5 trading account ID and trustworthy evidence of ownership, partner attribution and at least USD 50 deposited. USD 50 is a Velarion access condition, not a claim about broker minimums or safe capital. Deposit only with the broker. No automated broker verification is currently provided; this checkpoint is proposed policy, not active enforcement. Protected lesson delivery and assessment submission remain disabled.
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
                ALL 30 LESSONS REMAIN REQUIRED
              </span>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Finish the Course; Verify Ownership Separately
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
              Passing the five-lesson funding checkpoint is not graduation. All 30 required core School lessons and authoritative assessments must be completed to graduate. A checkpoint review does not replace independent execution-account ownership verification and secure linking. No browser progress is accepted as evidence. Broker linking remains disabled; linking and graduation never place orders or authorize automation.
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
              No broker credentials are accepted in this preparation release. Future execution additionally requires explicit account-scoped automation consent and exact authenticated worker acknowledgement. Automation and trading remain disabled.
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
              Automation is OFF by default and unavailable in this release, including demo testing. A funded live account does not unlock it. Future testing or execution requires independent ownership verification, separate affirmative consent naming the account, environment, strategy version, permissions and risk settings, operational approval and exact authenticated worker acknowledgement. All 30 lessons remain required. Automation can lose money; neither earnings nor profitability while studying are promised. Deposits and withdrawals stay under your control directly with the broker.
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
          Trading spot gold (XAUUSD) on margin involves significant risk of loss and is not suitable for all investors. Never trade with capital you cannot afford to lose. Velarion does not guarantee trading profits, any income while studying, or future performance. Referral compensation and volume-based IB rebates create a conflict of interest; <Link href="/legal/ib-disclosure">read the IB disclosure</Link>. Kenya legal and regulatory review remains a pre-launch requirement; broker registration does not establish local authorization.
        </div>
      </section>
    </div>
  );
}

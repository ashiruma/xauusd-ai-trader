import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Velarion Markets',
  description: 'Velarion Markets privacy policy explaining zero credential retention, minimal data telemetry, and user privacy protections.',
};

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '48px auto 80px', padding: '0 24px' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Privacy Notice</span>
      </nav>

      <span className="section-eyebrow">Data Protection</span>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
        Privacy Policy &amp; Security Architecture
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Last updated: October 15, 2026 &bull; Strict Non-Custodial Architecture
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Zero Credential Retention Policy
          </h2>
          <div style={{
            background: 'var(--accent-green-subtle)',
            border: '1px solid var(--accent-green-border)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '12px'
          }}>
            <strong style={{ color: 'var(--accent-green)', display: 'block', marginBottom: '4px' }}>
              We Never Collect or Store Broker Passwords
            </strong>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-primary)' }}>
              Velarion Markets strictly enforces a least-privilege security model. We never request, record, or store your JustMarkets MT5 master password, investor password, or broker withdrawal authorization codes. All account funding and withdrawal operations are executed exclusively inside the broker secure portal.
            </p>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Data We Collect
          </h2>
          <p>
            We collect only the minimum telemetry required to verify partner sponsorship and deliver quantitative software features:
          </p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><strong>MT5 Account Number:</strong> Used solely to verify partner code association (<code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</code>) with JustMarkets.</li>
            <li><strong>Contact Email:</strong> Used for account notifications, system updates, and learner support.</li>
            <li><strong>Curriculum Progress:</strong> Stored locally in your browser and essential cookies to track lesson comprehension check milestones.</li>
            <li><strong>Trading Risk Settings:</strong> User-configured lot limits, daily loss cutoffs, and pause toggles stored to enforce client-side safety bounds.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Use of Cookies and Local Storage
          </h2>
          <p>
            We use essential security cookies (<code className="mono-nums">jm_auth_session</code>, <code className="mono-nums">velarion_cookie_consent</code>, and <code className="mono-nums">velarion_trading_settings</code>) strictly to maintain session authentication and ensure safety parameters persist across sessions. We do not sell personal data or track users across third-party websites.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            4. Data Retention and Erasure
          </h2>
          <p>
            You may request complete erasure of your contact details and account verification records at any time by contacting our data protection officer at <code className="mono-nums">privacy@velarionmarkets.com</code>. Requests are processed within 48 business hours.
          </p>
        </section>
      </div>
    </div>
  );
}

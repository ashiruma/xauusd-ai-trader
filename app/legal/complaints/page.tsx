import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  alternates: { canonical: 'https://velarion-one.vercel.app/legal/complaints' },
  openGraph: { url: 'https://velarion-one.vercel.app/legal/complaints', type: 'website' },
  title: 'Complaints & Support Procedure | Velarion Markets',
  description: 'Velarion Markets dispute escalation procedure, complaint submission guidelines, and regulatory support routing.',
};

export default function ComplaintsPage() {
  return (
    <div style={{ maxWidth: '880px', margin: '48px auto 80px', padding: '0 24px' }}>
      <nav aria-label="Breadcrumb" style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>Complaints &amp; Support</span>
      </nav>

      <span className="section-eyebrow">User Assistance</span>
      <h1 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.5px' }}>
        Support &amp; Complaint Handling Procedure
      </h1>
      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px' }}>
        Transparent Dispute Resolution Protocol &bull; Operational Standards
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '14px' }}>
        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            1. Dedicated Communication Channels
          </h2>
          <p>
            For software assistance, onboarding inquiries, or complaints regarding educational modules or platform telemetry, users may reach our compliance and support desk:
          </p>
          <div style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginTop: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '13.5px'
          }}>
            <div><strong>General Inquiries:</strong> Contact channel pending verification.</div>
            <div><strong>Compliance &amp; Disputes:</strong> Contact channel pending verification.</div>
            <div><strong>Operating Hours:</strong> Monday &ndash; Friday, 08:00 &ndash; 18:00 UTC+3 (Nairobi Time)</div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            2. Complaint Escalation Timeline
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '8px' }}>
            <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>Step 1 &bull; Acknowledgement</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>Within 24 Hours</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                Your inquiry is assigned a formal case tracking number and acknowledged in writing.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>Step 2 &bull; Investigation</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>1 to 3 Business Days</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                Technical telemetry, execution logs, and timestamps are audited against market feed data.
              </p>
            </div>

            <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>Step 3 &bull; Resolution</div>
              <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '4px' }}>Within 5 Business Days</div>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.5 }}>
                A written resolution findings report and recommended corrective actions are issued.
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '10px' }}>
            3. Broker-Level Disputed Execution Escalation
          </h2>
          <p>
            For issues relating directly to trade execution pricing, liquidity slippage, deposits, or withdrawals on your MT5 account, inquiries should also be logged directly with JustMarkets customer support through the official JustMarkets Client Cabinet, citing your MT5 ticket number.
          </p>
        </section>
      </div>
    </div>
  );
}

import React from 'react';
import { Metadata } from 'next';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';
import AdminAccessControls from '@/components/admin/AdminAccessControls';

export const metadata: Metadata = {
  title: 'Secret Partner Portal | Velarion Admin',
  robots: {
    index: false,
    follow: false
  }
};

export default function SecretAdminPage() {
  const sampleRoster = [
    { account: '1200533810', name: 'Chrispine Abala Ashiruma', email: 'ashirumaabala@gmail.com', date: '2026-10-12', partnerCode: 'tohstb0d83', status: 'Owner / ECN Pro', balance: '$145.21' },
    { account: '1200541192', name: 'John Miller', email: 'j.miller@firm.co', date: '2026-10-13', partnerCode: 'tohstb0d83', status: 'Active (Standard)', balance: '$1,120.00' },
    { account: '1200552084', name: 'Quant Systems AG', email: 'quant7@fund.ch', date: '2026-10-14', partnerCode: 'tohstb0d83', status: 'Active (ECN)', balance: '$12,450.00' },
    { account: '1200569831', name: 'Alex Gold', email: 'alex.gold@trader.io', date: '2026-10-14', partnerCode: 'tohstb0d83', status: 'Active (Pro)', balance: '$540.00' },
    { account: '1200574920', name: 'M. Petrov', email: 'm.petrov@algotrade.net', date: '2026-10-15', partnerCode: 'tohstb0d83', status: 'Active (Standard)', balance: '$890.00' },
  ];

  const primaryCount = sampleRoster.filter(r => r.partnerCode === DEFAULT_PARTNER_CONFIG.primaryCode).length;
  const maxPrimary = DEFAULT_PARTNER_CONFIG.primaryLimit;
  const pctFilled = Math.min(100, Math.round((primaryCount / maxPrimary) * 100));

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto 80px', padding: '0 24px' }}>
      {/* Secret Admin Banner */}
      <div style={{
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-gold)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px 28px',
        marginBottom: '28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <span className="status-badge status-warning" style={{ marginBottom: '6px' }}>
            AUTHORIZED OWNER CONSOLE / ROUTE: /admin-secure-x9f8k2
          </span>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
            Registered Clients &amp; Referral Roster
          </h1>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Primary Partner Code: <strong className="mono-nums val-gold">tohstb0d83</strong> / Spillover: <strong className="mono-nums">p4cui0wkfz</strong>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span className="status-badge status-completed">
            AUTHENTICATED OWNER: #1200533810
          </span>
        </div>
      </div>
      
      {/* Interactive Terminal and Forex School Access Controls */}
      <AdminAccessControls />

      {/* 1. Multi-Tier Partner Drip & Tracking Manager */}
      <div className="panel-card" style={{ padding: '24px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-badge status-completed">DYNAMIC DRIP ROUTER</span>
              <span className="status-badge" style={{ background: 'rgba(230,187,89,0.15)', color: 'var(--accent-gold)' }}>
                {primaryCount < maxPrimary ? 'PRIMARY ACTIVE (10 PARTNER CAP)' : 'SECONDARY DRIP ACTIVE'}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px' }}>
              Referral Link Allocation &amp; Automated Spillover
            </h2>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              Traders are routed to Primary Link until 10 partners are enrolled, then automatically spill over to Secondary Link.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Primary Allocation</div>
            <div className="mono-nums" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--accent-gold)' }}>
              {primaryCount} / {maxPrimary} Partners ({pctFilled}%)
            </div>
          </div>
        </div>

        {/* Capacity Progress Bar */}
        <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', borderRadius: '6px', height: '10px', overflow: 'hidden', marginBottom: '20px' }}>
          <div style={{ height: '100%', width: `${pctFilled}%`, background: 'var(--accent-gold)', transition: 'width 0.3s ease' }} />
        </div>

        {/* Links Breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-gold)', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Primary Partner Link</strong>
              <span className="status-badge status-completed">ACTIVE</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', marginBottom: '8px' }}>
              {DEFAULT_PARTNER_CONFIG.primaryLink}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Referral Code: <strong className="mono-nums" style={{ color: 'var(--text-primary)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong> / Capacity: {primaryCount}/{maxPrimary} slots
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>Secondary Partner Link (Spillover)</strong>
              <span className="status-badge" style={{ background: 'var(--bg-surface-3)', color: 'var(--text-secondary)' }}>STANDBY</span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', wordBreak: 'break-all', marginBottom: '8px' }}>
              {DEFAULT_PARTNER_CONFIG.secondaryLink}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
              Referral Code: <strong className="mono-nums" style={{ color: 'var(--text-primary)' }}>{DEFAULT_PARTNER_CONFIG.secondaryCode}</strong> / Triggers automatically once Primary hits 10
            </div>
          </div>
        </div>
      </div>

      {/* 2. Client Referral Roster Table */}
      <div className="panel-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px' }}>
          Enrolled Trader Client Directory
        </h2>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>
                <th style={{ padding: '10px 12px' }}>MT5 Account</th>
                <th style={{ padding: '10px 12px' }}>Full Name</th>
                <th style={{ padding: '10px 12px' }}>Registered Email</th>
                <th style={{ padding: '10px 12px' }}>Partner Code</th>
                <th style={{ padding: '10px 12px' }}>Enrollment Date</th>
                <th style={{ padding: '10px 12px' }}>Status</th>
                <th style={{ padding: '10px 12px' }}>Balance</th>
              </tr>
            </thead>
            <tbody>
              {sampleRoster.map((item, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-gold)' }}>
                    #{item.account}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-primary)' }}>
                    {item.name}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-secondary)' }}>
                    {item.email}
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)' }}>
                    {item.partnerCode}
                  </td>
                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {item.date}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className="status-badge status-completed">
                      {item.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--accent-green)' }}>
                    {item.balance}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

interface SettingsClientPanelProps {
  accountId: string;
  userEmail: string;
  isOwner: boolean;
  isVerified: boolean;
  partnerCode: string;
}

export default function SettingsClientPanel({
  accountId,
  userEmail,
  isOwner,
  isVerified,
  partnerCode,
}: SettingsClientPanelProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('velarion_theme') as 'light' | 'dark' | null;
      if (saved) {
        setTheme(saved);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(newTheme);
    try {
      localStorage.setItem('velarion_theme', newTheme);
      if (newTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
      }
    } catch {
      // ignore
    }
  };

  const handleSignOutAll = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Profile & Membership Card */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px' }}>
          Member Profile &amp; Role
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', fontSize: '13px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Registered Email</span>
            <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{userEmail}</div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>MT5 Account ID</span>
            <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              #{accountId}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Membership Authority</span>
            <div style={{ fontWeight: 700, color: isOwner ? 'var(--accent-gold)' : 'var(--text-primary)', marginTop: '2px' }}>
              {isOwner ? 'Platform Administrator' : 'Subsidized Partner Member'}
            </div>
          </div>

          <div>
            <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Attribution Status</span>
            <div style={{ fontWeight: 700, color: isVerified ? 'var(--accent-green)' : 'var(--accent-gold)', marginTop: '2px' }}>
              {isVerified ? 'Verified under tohstb0d83' : 'Pending Broker Sync'}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Visual Theme Preferences */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
          Display Preferences
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: '0 0 16px' }}>
          Choose your preferred eye-comfort theme for charting and data tables.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => handleThemeChange('light')}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '6px',
              border: theme === 'light' ? '2px solid var(--accent-gold)' : '1px solid var(--border-default)',
              backgroundColor: theme === 'light' ? 'var(--accent-gold-subtle)' : 'var(--bg-surface-1)',
              color: theme === 'light' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Comfort White (Default)</span>
          </button>

          <button
            type="button"
            onClick={() => handleThemeChange('dark')}
            style={{
              padding: '10px 20px',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '6px',
              border: theme === 'dark' ? '2px solid var(--accent-gold)' : '1px solid var(--border-default)',
              backgroundColor: theme === 'dark' ? 'var(--accent-gold-subtle)' : 'var(--bg-surface-1)',
              color: theme === 'dark' ? 'var(--accent-gold)' : 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>Luxury Dark (Charcoal &amp; Gold)</span>
          </button>
        </div>
      </div>

      {/* 3. Partner Verification Desk & Support */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', fontWeight: 700, textTransform: 'uppercase' }}>
          PARTNER VERIFICATION DESK
        </span>
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 10px' }}>
          Broker Verification &amp; Help Desk
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
          If your JustMarkets account was registered under partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{partnerCode}</strong> and you are awaiting manual clearance or experiencing ledger synchronization delays, please contact the platform administrator directly:
        </p>

        <div
          style={{
            background: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
            padding: '16px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '16px',
          }}
        >
          <div><strong style={{ color: 'var(--text-primary)' }}>Support Email:</strong> ashirumaabala@gmail.com</div>
          <div style={{ marginTop: '4px' }}><strong style={{ color: 'var(--text-primary)' }}>Required Details:</strong> Your 6-10 digit JustMarkets MT5 Account ID and registration timestamp.</div>
        </div>
      </div>

      {/* 4. Security & Non-Custodial Principles */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
          Security &amp; Non-Custodial Architecture
        </h2>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
          Velarion does not accept, hold, or transmit client capital. All funds remain in your regulated JustMarkets account. We strictly enforce least-privilege access and never store master trading passwords.
        </p>

        <button
          type="button"
          onClick={handleSignOutAll}
          style={{
            padding: '8px 16px',
            fontSize: '12.5px',
            fontWeight: 600,
            backgroundColor: 'transparent',
            color: 'var(--accent-red)',
            border: '1px solid var(--accent-red-border)',
            borderRadius: '6px',
            cursor: 'pointer',
          }}
        >
          Sign Out of All Active Sessions
        </button>
      </div>

    </div>
  );
}

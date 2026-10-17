'use client';

import React, { useState } from 'react';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

interface AccountsClientDeskProps {
  currentAccountId: string;
  isInitiallyLinked: boolean;
  isOwner: boolean;
  userEmail: string;
}

export default function AccountsClientDesk({
  currentAccountId,
  isInitiallyLinked,
  isOwner,
  userEmail,
}: AccountsClientDeskProps) {
  const [accountId, setAccountId] = useState(currentAccountId || '');
  const [server, setServer] = useState('JustMarkets-Demo3');
  const [environment, setEnvironment] = useState<'DEMO' | 'LIVE'>('DEMO');
  const [investorPassword, setInvestorPassword] = useState('');
  const [masterPasswordInput, setMasterPasswordInput] = useState('');
  const [isLinked, setIsLinked] = useState(isInitiallyLinked);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    // Client-side guard against master passwords
    if (masterPasswordInput.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Master password submission prohibited. Velarion adheres to least-privilege architecture. Leave master password blank and supply Investor password only if needed.',
      });
      return;
    }

    if (!accountId.trim() || !/^\d{6,10}$/.test(accountId.trim())) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter a valid 6-10 digit JustMarkets MT5 account ID.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/accounts/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountId: accountId.trim(),
          server,
          environment,
          investorPassword: investorPassword.trim() || undefined,
          masterPassword: masterPasswordInput.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setIsLinked(true);
        setStatusMessage({
          type: 'success',
          text: data.message || `Account #${accountId} successfully linked.`,
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || data.error || 'Failed to link account.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error linking account. Please verify backend connection and retry.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnlink = async () => {
    if (!confirm('Are you sure you want to disconnect this account? Active telemetry and automation will be disarmed immediately.')) {
      return;
    }

    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/accounts/unlink', { method: 'POST' });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsLinked(false);
        setAccountId('');
        setStatusMessage({
          type: 'success',
          text: data.message || 'Account successfully disconnected.',
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: data.message || 'Failed to disconnect account.',
        });
      }
    } catch {
      setStatusMessage({
        type: 'error',
        text: 'Network error disconnecting account.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Status Notice */}
      {statusMessage && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            backgroundColor:
              statusMessage.type === 'success'
                ? 'var(--accent-green-subtle)'
                : statusMessage.type === 'warning'
                ? 'var(--accent-gold-subtle)'
                : 'var(--accent-red-subtle)',
            color:
              statusMessage.type === 'success'
                ? 'var(--accent-green)'
                : statusMessage.type === 'warning'
                ? 'var(--accent-gold)'
                : 'var(--accent-red)',
            border: `1px solid ${
              statusMessage.type === 'success'
                ? 'var(--accent-green-border)'
                : statusMessage.type === 'warning'
                ? 'var(--border-accent)'
                : 'var(--accent-red-border)'
            }`,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* Linked Account Card */}
      {isLinked ? (
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-green)', fontWeight: 700, textTransform: 'uppercase' }}>
                ACTIVE INTEGRATION
              </span>
              <h2 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0' }}>
                JustMarkets MT5 #{accountId}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  padding: '3px 8px',
                  borderRadius: '4px',
                  backgroundColor: environment === 'DEMO' ? 'rgba(3, 105, 161, 0.1)' : 'var(--accent-green-subtle)',
                  color: environment === 'DEMO' ? '#0369A1' : 'var(--accent-green)',
                  border: `1px solid ${environment === 'DEMO' ? 'rgba(3, 105, 161, 0.25)' : 'var(--accent-green-border)'}`,
                }}
              >
                ENVIRONMENT: {environment}
              </span>
              <button
                type="button"
                onClick={handleUnlink}
                disabled={loading}
                style={{
                  padding: '6px 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  backgroundColor: 'var(--accent-red-subtle)',
                  color: 'var(--accent-red)',
                  border: '1px solid var(--accent-red-border)',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? 'Disconnecting...' : 'Disconnect Account'}
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
              padding: '18px',
              backgroundColor: 'var(--bg-surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              fontSize: '13px',
              marginBottom: '20px',
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Broker Server</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>{server}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Attribution Code</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-gold)', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
                {DEFAULT_PARTNER_CONFIG.primaryCode}
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Permissions Granted</span>
              <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                Read Telemetry &amp; Demo Order Execution
              </div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase' }}>Security Mode</span>
              <div style={{ fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px' }}>
                Non-Custodial (No Master Password)
              </div>
            </div>
          </div>

          <div style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            To view live market telemetry or adjust automated demo risk controls, visit the <a href="/overview" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Overview</a> or <a href="/automation" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>Automation</a> desks.
          </div>
        </div>
      ) : (
        /* Account Linking Form */
        <div
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-default)',
            borderRadius: '12px',
            padding: '28px',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
          }}
        >
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px' }}>
              Connect JustMarkets MT5 Account
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', margin: 0 }}>
              Enter your MT5 Account ID and select your server environment. To maintain zero-risk least privilege, do not enter a master trading password.
            </p>
          </div>

          <form onSubmit={handleLink} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Account ID */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                JustMarkets MT5 Account ID *
              </label>
              <input
                type="text"
                placeholder="e.g. 1200533810"
                value={accountId}
                onChange={(e) => setAccountId(e.target.value.replace(/\D/g, ''))}
                required
                maxLength={10}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  fontFamily: 'var(--font-mono, monospace)',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Server & Environment Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Broker Server *
                </label>
                <select
                  value={server}
                  onChange={(e) => setServer(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="JustMarkets-Demo3">JustMarkets-Demo3 (Recommended for Testing)</option>
                  <option value="JustMarkets-Live">JustMarkets-Live (Read-Only Telemetry)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                  Execution Environment *
                </label>
                <select
                  value={environment}
                  onChange={(e) => setEnvironment(e.target.value as 'DEMO' | 'LIVE')}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    fontSize: '13px',
                    backgroundColor: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                  }}
                >
                  <option value="DEMO">Demo Environment (Supported in Initial Release)</option>
                  <option value="LIVE">Live Account (Read-Only Monitoring - Orders Gated)</option>
                </select>
              </div>
            </div>

            {/* Investor Password (Optional) */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Investor Password (Optional, Read-Only)
              </label>
              <span style={{ display: 'block', fontSize: '11.5px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                Used strictly for read-only equity and balance telemetry. Cannot place or close orders.
              </span>
              <input
                type="password"
                placeholder="Optional read-only investor password"
                value={investorPassword}
                onChange={(e) => setInvestorPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-input)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  color: 'var(--text-primary)',
                }}
              />
            </div>

            {/* Master Password Field (Purposely prohibited) */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Master Trading Password (Do NOT Enter)
              </label>
              <input
                type="password"
                placeholder="Master passwords are strictly rejected"
                value={masterPasswordInput}
                onChange={(e) => setMasterPasswordInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '13px',
                  backgroundColor: 'var(--bg-surface-2)',
                  border: '1px dashed var(--border-default)',
                  borderRadius: '6px',
                  color: 'var(--text-muted)',
                }}
              />
              <span style={{ display: 'block', fontSize: '11px', color: 'var(--accent-red)', marginTop: '4px' }}>
                Submitting a master trading password will be blocked with a 400 validation error.
              </span>
            </div>

            {/* Submit Button */}
            <div style={{ marginTop: '10px' }}>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '11px 24px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  backgroundColor: 'var(--accent-gold)',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{loading ? 'Linking Account...' : 'Link MT5 Account &rarr;'}</span>
              </button>
            </div>

          </form>
        </div>
      )}

      {/* Regulated Broker Partnership Reference Card */}
      <div
        style={{
          background: 'var(--bg-surface-1)',
          border: '1px solid var(--border-default)',
          borderRadius: '10px',
          padding: '20px 24px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        <strong style={{ color: 'var(--text-primary)' }}>Do Not Have a JustMarkets Account Yet?</strong>
        <p style={{ margin: '6px 0 12px' }}>
          Open an MT5 Standard Cent or Standard account through the official Velarion partner referral link to receive 100% subsidized membership with zero platform subscriptions.
        </p>
        <a
          href={DEFAULT_PARTNER_CONFIG.primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: 'var(--accent-gold)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span>Open Account via JustMarkets (Partner Code: {DEFAULT_PARTNER_CONFIG.primaryCode})</span>
          <span aria-hidden="true">&rarr;</span>
        </a>
      </div>

    </div>
  );
}

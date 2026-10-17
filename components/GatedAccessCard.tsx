'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function GatedAccessCard() {
  const router = useRouter();
  const [accountId, setAccountId] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'verified' | 'unverified' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanId = accountId.trim();
    if (!cleanId || !/^\d{6,10}$/.test(cleanId)) {
      setStatus('error');
      setStatusMessage('Please enter a valid 6-10 digit JustMarkets MT5 account number.');
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/verify-mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountId: cleanId }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.status === 'VERIFIED') {
        setStatus('verified');
        setStatusMessage('Account verified under partner code. Redirecting to terminal...');
        setTimeout(() => {
          router.push('/terminal');
        }, 1200);
      } else {
        setStatus('unverified');
        setStatusMessage(
          data.message ||
            `Account #${cleanId} is not verified under Velarion partner code (${DEFAULT_PARTNER_CONFIG.primaryCode}). Please register using the official link below.`
        );
      }
    } catch {
      setStatus('error');
      setStatusMessage('Unable to connect to verification bridge. Please check your connection and retry.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAgain = () => {
    if (accountId.trim()) {
      handleVerify({ preventDefault: () => {} } as React.FormEvent);
    }
  };

  return (
    <div
      style={{
        background: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '12px',
        padding: '28px 24px',
        boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        width: '100%',
        maxWidth: '460px',
      }}
    >
      <div style={{ marginBottom: '16px' }}>
        <span
          style={{
            fontSize: '11px',
            fontFamily: 'var(--font-mono, monospace)',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            color: '#B45309',
            display: 'block',
            marginBottom: '4px',
          }}
        >
          Partner Gated Access
        </span>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', margin: '0 0 6px' }}>
          Access Velarion For Free
        </h2>
        <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: 1.5 }}>
          Sign up for JustMarkets through our partner link. Verify your MT5 account number to unlock the terminal.
        </p>
      </div>

      {status === 'unverified' ? (
        <div
          style={{
            background: '#FEF2F2',
            border: '1px solid #FCA5A5',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '10.5px',
                fontFamily: 'var(--font-mono, monospace)',
                fontWeight: 700,
                color: '#B91C1C',
                textTransform: 'uppercase',
              }}
            >
              [LOCKED] ATTRIBUTION PENDING
            </span>
          </div>
          <p style={{ fontSize: '12.5px', color: '#7F1D1D', margin: '0 0 14px', lineHeight: 1.5 }}>
            {statusMessage}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                textAlign: 'center',
                backgroundColor: '#B45309',
                color: '#FFFFFF',
                padding: '10px 14px',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              Open JustMarkets Account (Code: {DEFAULT_PARTNER_CONFIG.primaryCode}) &rarr;
            </a>

            <button
              type="button"
              onClick={handleCheckAgain}
              disabled={loading}
              style={{
                backgroundColor: '#FFFFFF',
                color: '#0F172A',
                border: '1px solid #CBD5E1',
                padding: '9px 14px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Re-checking broker...' : 'Check again'}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label
              htmlFor="justmarkets-account-input"
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 700,
                color: '#334155',
                marginBottom: '6px',
              }}
            >
              JustMarkets MT5 Account ID
            </label>
            <input
              id="justmarkets-account-input"
              type="text"
              inputMode="numeric"
              placeholder="e.g. 8141994"
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              disabled={loading}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '6px',
                border: status === 'error' ? '1px solid #EF4444' : '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                color: '#0F172A',
                fontSize: '14px',
                fontFamily: 'var(--font-mono, monospace)',
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {statusMessage && (
            <div
              style={{
                fontSize: '12px',
                color: status === 'verified' ? '#047857' : '#B91C1C',
                lineHeight: 1.4,
              }}
            >
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: '#B45309',
              color: '#FFFFFF',
              padding: '12px 16px',
              borderRadius: '6px',
              border: 'none',
              fontSize: '13.5px',
              fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            {loading ? 'Verifying with broker...' : 'Verify & Unlock Terminal \u2192'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748B' }}>New to JustMarkets? </span>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '12px', color: '#B45309', fontWeight: 700, textDecoration: 'none' }}
            >
              Create Account with Code {DEFAULT_PARTNER_CONFIG.primaryCode} &rarr;
            </a>
          </div>
        </form>
      )}
    </div>
  );
}

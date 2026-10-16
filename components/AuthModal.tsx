'use client';

import React, { useState } from 'react';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialCallbackUrl?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialCallbackUrl = '/terminal'
}: AuthModalProps) {
  const [mt5Account, setMt5Account] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!mt5Account.trim()) {
      setErrorMsg('Please enter your JustMarkets MT5 Account Number.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/verify-mt5', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5Account: mt5Account.trim(),
          email: email.trim(),
          partnerCode: DEFAULT_PARTNER_CONFIG.primaryCode
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Verification failed. Please check your MT5 account credentials.');
        setLoading(false);
        return;
      }

      setLoading(false);
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = initialCallbackUrl;
      }
    } catch {
      setErrorMsg('Network error connecting to verification gateway. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
          <div>
            <span className="status-badge status-completed" style={{ marginBottom: '8px' }}>
              JUSTMARKETS PARTNER VERIFICATION
            </span>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0' }}>
              Verify MT5 Account Access
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              Enter your JustMarkets MT5 account details to activate subsidized AI terminal access and curriculum unlocking.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '20px',
              cursor: 'pointer',
              padding: '4px 8px'
            }}
          >
            &times;
          </button>
        </div>

        {/* Step 1 Reminder */}
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 14px',
          marginBottom: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
              Step 1: Need a JustMarkets Account?
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              No Platform Fee / Subsidized Access
            </div>
          </div>
          <a
            href="https://one.justmarkets.link/a/tohstb0d83"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            Open Account &rarr;
          </a>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              JustMarkets MT5 Account Number (Login)
            </label>
            <input
              type="text"
              placeholder="e.g. 21094821"
              value={mt5Account}
              onChange={(e) => setMt5Account(e.target.value)}
              className="calc-input mono-nums"
              required
            />
          </div>

          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Registered Email Address (Optional)
            </label>
            <input
              type="email"
              placeholder="e.g. yourname@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="calc-input"
            />
          </div>

          {errorMsg && (
            <div style={{
              background: 'var(--accent-red-subtle)',
              border: '1px solid var(--accent-red-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 12px',
              fontSize: '12px',
              color: 'var(--accent-red)',
              marginBottom: '16px'
            }}>
              {errorMsg}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '13px' }}
          >
            {loading ? 'Verifying Gateway...' : 'Verify MT5 & Unlock Session'}
          </button>
        </form>

        {/* Security Notice */}
        <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-default)', paddingTop: '12px', fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' }}>
          Non-custodial cryptographic verification. No passwords required. Your funds remain 100% inside regulated JustMarkets MT5 custody.
        </div>
      </div>
    </div>
  );
}

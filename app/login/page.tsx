'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || '/verification';

  const [mode, setMode] = useState<'trader' | 'admin'>('trader');
  const [accountId, setAccountId] = useState('');
  const [email, setEmail] = useState('');
  const [adminSecret, setAdminSecret] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const payload: Record<string, string> = {};
      if (mode === 'admin') {
        if (!adminSecret.trim()) {
          setErrorMsg('Master Administrator Secret is required.');
          setLoading(false);
          return;
        }
        payload.adminSecret = adminSecret.trim();
        payload.email = email.trim() || 'coordinator@velarion.internal';
      } else {
        if (!accountId.trim() || !/^\d{6,10}$/.test(accountId.trim())) {
          setErrorMsg('Please enter a valid 6-10 digit JustMarkets MT5 account ID.');
          setLoading(false);
          return;
        }
        if (!email.trim() || !email.includes('@')) {
          setErrorMsg('Please enter the email address used to open your JustMarkets account.');
          setLoading(false);
          return;
        }
        payload.accountId = accountId.trim();
        payload.email = email.trim().toLowerCase();
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrorMsg(data.message || data.error || 'Authentication rejected. Verify your account details.');
        setLoading(false);
        return;
      }

      setSuccessMsg('Session authenticated. Redirecting...');
      setTimeout(() => {
        if (mode === 'admin') {
          router.push('/admin-secure-x9f8k2');
        } else {
          router.push(redirectTarget);
        }
      }, 700);
    } catch {
      setErrorMsg('Network error connecting to authentication ledger. Please retry.');
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-base)',
        minHeight: 'calc(100vh - 78px)',
        color: 'var(--text-primary)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-xs)',
          padding: '36px 32px',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header Branding */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ display: 'inline-block', marginBottom: '14px' }}>
            <img
              src="/velarion_brand_dark.png"
              alt="Velarion Markets"
              width={140}
              height={38}
              style={{ height: '36px', width: 'auto', display: 'block', margin: '0 auto' }}
            />
          </Link>
          <h1
            style={{
              fontFamily: 'var(--font-sans, "Inter", sans-serif)',
              fontSize: '22px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: '0 0 6px',
              letterSpacing: '-0.02em',
            }}
          >
            Sign In to Velarion
          </h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: 0 }}>
            Enter your JustMarkets trading credentials to resume your session.
          </p>
        </div>

        {/* Tab Toggle: Trader vs Admin */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xs)',
            padding: '3px',
            marginBottom: '24px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setMode('trader');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '11px',
              fontWeight: mode === 'trader' ? 600 : 500,
              background: mode === 'trader' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'trader' ? 'var(--text-primary)' : 'var(--text-muted)',
              border: mode === 'trader' ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Trader Login
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('admin');
              setErrorMsg(null);
            }}
            style={{
              flex: 1,
              padding: '8px',
              fontSize: '11px',
              fontWeight: mode === 'admin' ? 600 : 500,
              background: mode === 'admin' ? 'var(--bg-card)' : 'transparent',
              color: mode === 'admin' ? 'var(--accent-gold)' : 'var(--text-muted)',
              border: mode === 'admin' ? '1px solid var(--border-default)' : '1px solid transparent',
              borderRadius: 'var(--radius-xs)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Partner Desk / Admin
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.35)',
              color: '#FCA5A5',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              color: '#6EE7B7',
              padding: '10px 14px',
              borderRadius: '6px',
              fontSize: '12.5px',
              marginBottom: '20px',
              lineHeight: 1.5,
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {mode === 'trader' ? (
            <>
              <div>
                <label
                  htmlFor="mt5-account-input"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#94A3B8',
                    marginBottom: '6px',
                  }}
                >
                  JustMarkets MT5 Account ID
                </label>
                <input
                  id="mt5-account-input"
                  type="text"
                  placeholder="e.g. 1200533810"
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="calc-input mono-nums"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  6 to 10 digit number provided in your JustMarkets welcome email.
                </span>
              </div>

              <div>
                <label
                  htmlFor="email-input"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Registered Email Address
                </label>
                <input
                  id="email-input"
                  type="email"
                  placeholder="trader@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
                <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                  Must match the email address registered with JustMarkets.
                </span>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  htmlFor="admin-secret-input"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Master Administrator Secret Key
                </label>
                <input
                  id="admin-secret-input"
                  type="password"
                  placeholder="Enter production master secret"
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  className="mono-nums"
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="admin-email-input"
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '6px',
                  }}
                >
                  Authorized Admin Email (Optional)
                </label>
                <input
                  id="admin-email-input"
                  type="email"
                  placeholder="coordinator@velarion.internal"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '11px 14px',
                    fontSize: '14px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: '8px',
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Authenticating...' : mode === 'admin' ? 'Sign In as Administrator' : 'Sign In to Account'}
          </button>
        </form>

        {/* Footer links */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-default)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '12px',
          }}
        >
          <span style={{ color: 'var(--text-muted)' }}>New to Velarion?</span>
          <Link
            href="/onboarding"
            style={{ color: 'var(--accent-gold)', textDecoration: 'none', fontWeight: 600 }}
          >
            Start Free Onboarding &rarr;
          </Link>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center' }}>
          <Link
            href="/verification"
            style={{ fontSize: '11.5px', color: '#64748B', textDecoration: 'none' }}
          >
            Check Existing Attribution &amp; Gating Status &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div
          className="login-page"
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#090D16',
            color: '#94A3B8',
            fontFamily: 'Inter, sans-serif',
          }}
        >
          Loading authentication portal...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

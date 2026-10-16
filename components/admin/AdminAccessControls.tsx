'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AdminAccessControls() {
  const [isAdminActive, setIsAdminActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<string | null>(null);

  // VIP Link generation state
  const [vipAccountInput, setVipAccountInput] = useState<string>('');
  const [generatedVipLink, setGeneratedVipLink] = useState<string | null>(null);

  // School VIP link state
  const [schoolVipLink, setSchoolVipLink] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        setIsAdminActive(Boolean(data.hasAdminSession));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleToggleAdminSession = async (action: 'activate' | 'revoke') => {
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (res.ok) {
        setIsAdminActive(action === 'activate');
        setMsg(data.message || (action === 'activate' ? 'Admin session activated.' : 'Admin session revoked.'));
      } else {
        setMsg(data.error || 'Failed to update session.');
      }
    } catch (err: unknown) {
      setMsg((err as Error)?.message || 'Network error');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 6000);
    }
  };

  const handleGenerateVipTerminalLink = () => {
    if (!vipAccountInput.trim()) {
      setMsg('Please enter an MT5 account number.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://velarionmarkets.com';
    const link = `${origin}/onboarding?ref=ADMIN_VIP&mt5=${encodeURIComponent(vipAccountInput.trim())}&auto_verify=true`;
    setGeneratedVipLink(link);
    setMsg(`VIP link generated for account #${vipAccountInput.trim()}`);
  };

  const handleGenerateSchoolVipLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://velarionmarkets.com';
    const link = `${origin}/academy?vip_access=true&bypass=owner`;
    setSchoolVipLink(link);
    setMsg('Full School VIP access link generated.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
      {/* 1. Master Session Authorization Banner */}
      <div
        className="panel-card"
        style={{
          padding: '24px',
          border: '1.5px solid var(--border-gold)',
          background: 'linear-gradient(90deg, rgba(230,187,89,0.08) 0%, rgba(14,22,37,0.98) 100%)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="status-badge status-warning">
                MASTER ADMIN ACCESS SWITCH
              </span>
              <span
                className="status-badge"
                style={{
                  background: isAdminActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                  color: isAdminActive ? '#10B981' : '#F43F5E',
                  border: `1px solid ${isAdminActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
                }}
              >
                {isAdminActive ? 'ADMIN SESSION ACTIVE IN THIS BROWSER' : 'BROWSER NOT AUTHENTICATED'}
              </span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              One-Click Master Admin Authorization
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: '4px 0 0', maxWidth: '650px' }}>
              Activating your admin session writes the secure owner session cookie (`velarion_admin_token`), granting instant unrestricted access to the AI Trading Terminal and all 30 Forex School lessons without login prompts.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {isAdminActive ? (
              <button
                type="button"
                onClick={() => handleToggleAdminSession('revoke')}
                disabled={loading}
                style={{
                  padding: '9px 18px',
                  fontSize: '12px',
                  fontWeight: 700,
                  borderRadius: '6px',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  background: 'rgba(244, 63, 94, 0.15)',
                  color: '#F43F5E',
                  cursor: 'pointer'
                }}
              >
                {loading ? 'Processing...' : 'Revoke Admin Session'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleToggleAdminSession('activate')}
                disabled={loading}
                style={{
                  padding: '10px 22px',
                  fontSize: '12.5px',
                  fontWeight: 800,
                  borderRadius: '6px',
                  border: '1px solid var(--border-gold)',
                  background: 'var(--accent-gold)',
                  color: '#000',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(245, 158, 11, 0.3)'
                }}
              >
                {loading ? 'Processing...' : 'Activate Master Admin Session'}
              </button>
            )}

            <Link
              href="/terminal"
              style={{
                padding: '9px 18px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface-2)',
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
            >
              Open AI Terminal &rarr;
            </Link>

            <Link
              href="/academy"
              style={{
                padding: '9px 18px',
                fontSize: '12px',
                fontWeight: 700,
                borderRadius: '6px',
                border: '1px solid var(--border-default)',
                background: 'var(--bg-surface-2)',
                color: 'var(--text-primary)',
                textDecoration: 'none'
              }}
            >
              Open Forex School &rarr;
            </Link>
          </div>
        </div>

        {msg && (
          <div style={{
            marginTop: '16px',
            padding: '10px 16px',
            borderRadius: '6px',
            background: 'rgba(245, 158, 11, 0.12)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            fontSize: '12px',
            color: 'var(--accent-gold)'
          }}>
            {msg}
          </div>
        )}
      </div>

      {/* 2-Column Gatekeeper Controls: Terminal on Left | School on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '20px' }}>
        {/* Terminal Gatekeeper */}
        <div className="panel-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              AI Trading Terminal Gatekeeper
            </h3>
            <span className="status-badge status-completed">PROTECTED (MT5 VERIFIED)</span>
          </div>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            <strong>How it works:</strong> Anyone visiting `/terminal` must have a verified JustMarkets account (`#1200533810` or client account under partner code `tohstb0d83`) with at least \$100 deposit. Unauthorized users are auto-redirected to `/onboarding`.
          </p>

          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-default)', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Generate One-Click VIP Trader Access Link
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                placeholder="Enter client MT5 account (e.g. 1200541192)"
                value={vipAccountInput}
                onChange={(e) => setVipAccountInput(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: '12.5px',
                  background: 'var(--bg-surface-3)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '4px',
                  color: 'var(--text-primary)',
                  fontFamily: 'monospace'
                }}
              />
              <button
                type="button"
                onClick={handleGenerateVipTerminalLink}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'var(--accent-gold)',
                  border: 'none',
                  borderRadius: '4px',
                  color: '#000',
                  cursor: 'pointer'
                }}
              >
                Generate Link
              </button>
            </div>

            {generatedVipLink && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Send this direct link to the trader:</div>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  color: 'var(--accent-gold)',
                  wordBreak: 'break-all',
                  userSelect: 'all'
                }}>
                  {generatedVipLink}
                </div>
              </div>
            )}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>Active Rules:</strong>
            <ul style={{ margin: '6px 0 0 16px', padding: 0, lineHeight: 1.6 }}>
              <li>Owner Account #1200533810 has permanent master bypass.</li>
              <li>Deposit requirement enforced: \$100.00 minimum equity.</li>
              <li>Broker Server: JustMarkets-Live or JustMarkets-Demo3.</li>
            </ul>
          </div>
        </div>

        {/* Forex School Gatekeeper */}
        <div className="panel-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              30-Lesson Forex School Gatekeeper
            </h3>
            <span className="status-badge status-warning">FREEMIUM + GATED</span>
          </div>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            <strong>How it works:</strong>
            <br />
            - <strong>Lessons 1 to 5:</strong> 100% Free public preview (builds organic SEO traffic and user trust).
            <br />
            - <strong>Lessons 6 to 30:</strong> Gated behind verified JustMarkets MT5 account. Requires sequential quiz comprehension completion.
          </p>

          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '6px', border: '1px solid var(--border-default)', marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Student VIP Full-Access Pass
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={handleGenerateSchoolVipLink}
                style={{
                  padding: '8px 16px',
                  fontSize: '12px',
                  fontWeight: 700,
                  background: 'rgba(230,187,89,0.18)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '4px',
                  color: 'var(--accent-gold)',
                  cursor: 'pointer'
                }}
              >
                Generate Student VIP Link
              </button>
            </div>

            {schoolVipLink && (
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Share this VIP invite link:</div>
                <div style={{
                  padding: '8px 12px',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid var(--border-gold)',
                  borderRadius: '4px',
                  fontSize: '11.5px',
                  fontFamily: 'monospace',
                  color: 'var(--accent-gold)',
                  wordBreak: 'break-all',
                  userSelect: 'all'
                }}>
                  {schoolVipLink}
                </div>
              </div>
            )}
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            <strong>Curriculum Structure:</strong>
            <ul style={{ margin: '6px 0 0 16px', padding: 0, lineHeight: 1.6 }}>
              <li>Beginner (Lessons 1–10): Market Mechanics &amp; Execution.</li>
              <li>Intermediate (Lessons 11–20): SMC Liquidity &amp; Order Blocks.</li>
              <li>Advanced (Lessons 21–30): Algorithmic Fusion &amp; Risk Compounding.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

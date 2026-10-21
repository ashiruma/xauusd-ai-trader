'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { COURSE_MANIFEST, trackLabel } from '@/lib/course-manifest';

interface AdminUser {
  id: number;
  user_id: string;
  full_name: string;
  email: string;
  justmarkets_account_id: string;
  server: string;
  referral_code: string;
  is_referral_verified: boolean | number;
  registered_at: string;
  last_login_at: string;
  equity: number;
  status: string;
  notes: string;
}

export default function AdminAccessControls() {
  const [isAdminActive, setIsAdminActive] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [msg, setMsg] = useState<string | null>(null);

  // VIP Link generation state
  const [vipAccountInput, setVipAccountInput] = useState<string>('');
  const [generatedVipLink, setGeneratedVipLink] = useState<string | null>(null);

  // School VIP link state
  const [schoolVipLink, setSchoolVipLink] = useState<string | null>(null);

  // Live Users Roster from backend
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [rosterLoading, setRosterLoading] = useState<boolean>(false);
  const [bulkInput, setBulkInput] = useState<string>('');
  const [bulkProcessing, setBulkProcessing] = useState<boolean>(false);

  const fetchUsers = useCallback(async () => {
    setRosterLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch {
      // ignore
    } finally {
      setRosterLoading(false);
    }
  }, []);

  useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        setIsAdminActive(Boolean(data.hasAdminSession));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    fetchUsers();
  }, [fetchUsers]);

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

  const handleVerifyUser = async (userId: string, accountId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${encodeURIComponent(userId)}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'ACTIVE_VERIFIED',
          is_referral_verified: true,
          notes: 'Manually verified via JustMarkets Partner Area Client List'
        }),
      });
      if (res.ok) {
        setMsg(`MT5 Account #${accountId} successfully verified! Client will now pass partner check on next status query.`);
        fetchUsers();
      } else {
        setMsg(`Failed to verify account #${accountId}.`);
      }
    } catch (err: unknown) {
      setMsg((err as Error)?.message || 'Network error');
    } finally {
      setLoading(false);
      setTimeout(() => setMsg(null), 8000);
    }
  };

  const handleBulkVerify = async () => {
    if (!bulkInput.trim()) {
      setMsg('Please paste MT5 account numbers from your JustMarkets Client List report.');
      return;
    }
    setBulkProcessing(true);
    setMsg(null);
    try {
      const res = await fetch('/api/admin/users/bulk-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: bulkInput }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message || `Successfully verified ${data.matchedCount} accounts.`);
        setBulkInput('');
        fetchUsers();
      } else {
        setMsg(data.error || 'Bulk verification failed.');
      }
    } catch (err: unknown) {
      setMsg((err as Error)?.message || 'Network error');
    } finally {
      setBulkProcessing(false);
      setTimeout(() => setMsg(null), 8000);
    }
  };

  const handleGenerateVipTerminalLink = () => {
    if (!vipAccountInput.trim()) {
      setMsg('Please enter an MT5 account number.');
      return;
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://velarion-one.vercel.app';
    const link = `${origin}/onboarding?ref=ADMIN_VIP&mt5=${encodeURIComponent(vipAccountInput.trim())}&auto_verify=true`;
    setGeneratedVipLink(link);
    setMsg(`VIP link generated for account #${vipAccountInput.trim()}`);
  };

  const handleGenerateSchoolVipLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://velarion-one.vercel.app';
    const link = `${origin}/academy?vip_access=true&bypass=owner`;
    setSchoolVipLink(link);
    setMsg('Full School VIP access link generated.');
  };

  const pendingUsers = users.filter((u) => !u.is_referral_verified && u.status !== 'KICKED_INACTIVE');
  const verifiedUsers = users.filter((u) => Boolean(u.is_referral_verified));

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
              An admin session is not evidence of learner completion. Full lessons, assessments and verified progress remain unavailable during containment; admin status does not bypass the core learning requirement.
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

      {/* 2. OFFICIAL JUSTMARKETS PARTNER AREA VERIFICATION DESK */}
      <div
        className="panel-card"
        style={{
          padding: '24px',
          border: '1.5px solid var(--border-gold)',
          background: 'var(--bg-surface-1)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span className="status-badge status-completed">JUSTMARKETS PARTNER PROTOCOL</span>
              <span className="status-badge status-warning">MANUAL REPORT DESK</span>
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '6px 0 2px' }}>
              JustMarkets Partner Area Verification Desk
            </h2>
            <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', margin: 0, maxWidth: '780px' }}>
              JustMarkets does not provide a public partner API. Client attribution, account funding, and rebate assignments are confirmed via the official built-in Partner Area sections below.
            </p>
          </div>

          {/* Direct Outbound Shortcuts to JustMarkets Partner Area */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <a
              href="https://justmarkets.partners/spa/ib/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
            >
              Open IB Dashboard &#8599;
            </a>
            <a
              href="https://justmarkets.partners/spa/ib/reports/client-list"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline-gold"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
            >
              Open Client List Report &#8599;
            </a>
            <a
              href="https://justmarkets.partners/spa/ib/rebates/client-list"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-secondary"
              style={{ fontSize: '11.5px', padding: '6px 12px' }}
            >
              Open Rebates List &#8599;
            </a>
          </div>
        </div>

        {/* 2-Column: Left = Pending Requests Queue | Right = Bulk Paste Matcher */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '20px' }}>
          {/* Pending Queue */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                Pending Verification Queue ({pendingUsers.length})
              </strong>
              <button
                type="button"
                onClick={fetchUsers}
                disabled={rosterLoading}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--accent-gold)',
                  fontSize: '11.5px',
                  cursor: 'pointer',
                  fontWeight: 600
                }}
              >
                {rosterLoading ? 'Refreshing...' : 'Refresh List'}
              </button>
            </div>

            {pendingUsers.length === 0 ? (
              <div style={{ padding: '24px 12px', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
                No pending verification requests. All submitted MT5 accounts are verified.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '320px', overflowY: 'auto' }}>
                {pendingUsers.map((u) => (
                  <div
                    key={u.user_id}
                    style={{
                      padding: '12px',
                      background: 'var(--bg-surface-3)',
                      borderRadius: '6px',
                      border: '1px solid rgba(234, 177, 103, 0.25)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '12px',
                    }}
                  >
                    <div>
                      <div className="mono-nums" style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-gold)' }}>
                        #{u.justmarkets_account_id}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                        {u.email} / Registered: {new Date(u.registered_at).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Code: {u.referral_code}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleVerifyUser(u.user_id, u.justmarkets_account_id)}
                      disabled={loading}
                      style={{
                        padding: '6px 12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(16, 185, 129, 0.18)',
                        color: '#10B981',
                        border: '1px solid rgba(16, 185, 129, 0.35)',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Verify Attribution
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bulk Paste Matcher */}
          <div style={{ background: 'var(--bg-surface-2)', padding: '16px', borderRadius: '8px', border: '1px solid var(--border-default)' }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
              Bulk Client List Matcher
            </strong>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)', marginBottom: '10px', lineHeight: 1.5 }}>
              Copy the account number column from <a href="https://justmarkets.partners/spa/ib/reports/client-list" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-gold)', textDecoration: 'underline' }}>Client List</a> and paste it below. Any matching pending accounts in Velarion will be verified immediately.
            </p>

            <textarea
              rows={4}
              placeholder="e.g.&#10;1200541192&#10;1200552084&#10;1200569831"
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'var(--bg-surface-3)',
                border: '1px solid var(--border-default)',
                borderRadius: '4px',
                color: 'var(--text-primary)',
                fontFamily: 'monospace',
                fontSize: '12px',
                resize: 'vertical',
                marginBottom: '10px'
              }}
            />

            <button
              type="button"
              onClick={handleBulkVerify}
              disabled={bulkProcessing}
              style={{
                width: '100%',
                padding: '9px 16px',
                fontSize: '12px',
                fontWeight: 800,
                background: 'var(--accent-gold)',
                color: '#000',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {bulkProcessing ? 'Matching & Verifying...' : 'Match & Verify Accounts from Client List'}
            </button>
          </div>
        </div>
      </div>

      {/* 3. 2-Column Gatekeeper Controls: Terminal on Left / School on Right */}
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
            <strong>How it works:</strong> Anyone visiting `/terminal` must have a verified JustMarkets account (`#1200533810` or client account under partner code `tohstb0d83`) with at least \$10 deposit on Cent/Standard. Unauthorized users are auto-redirected to `/onboarding`.
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
              <li>Deposit requirement enforced: \$10 Cent/Standard, \$200 Pro/Raw.</li>
              <li>Broker Server: JustMarkets-Live or JustMarkets-Demo3.</li>
            </ul>
          </div>
        </div>

        {/* Forex School Gatekeeper */}
        <div className="panel-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Core Forex School Learning Requirement
            </h3>
            <span className="status-badge status-warning">FREEMIUM + GATED</span>
          </div>

          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
            <strong>How it works:</strong>
            <br />
            - <strong>Public summaries:</strong> Preview only. No full lesson, assessment or completion is released.
            <br />
            - <strong>All core lessons:</strong> Required for graduation. Full lessons and assessments remain temporarily unavailable; the early milestone is not graduation.
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
              {COURSE_MANIFEST.tracks.map(track => <li key={track.id}>{trackLabel(track.id)} · {track.kind} · {track.publication}</li>)}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface AutomationClientDeskProps {
  accountId: string;
  isSchoolComplete: boolean;
  isAccountLinked: boolean;
  isOwner: boolean;
  userEmail: string;
}

interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  environment: string;
  actor: string;
  account?: string;
  details: string;
}

export default function AutomationClientDesk({
  accountId,
  isSchoolComplete,
  isAccountLinked,
  isOwner,
  userEmail,
}: AutomationClientDeskProps) {
  const [status, setStatus] = useState<'OFF' | 'ACTIVE_DEMO' | 'PAUSED'>('OFF');
  const [environment, setEnvironment] = useState<string>('DEMO');
  const [auditTrail, setAuditTrail] = useState<AuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Modal State
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [confirmDemoEnv, setConfirmDemoEnv] = useState<boolean>(false);
  const [confirmRiskCeiling, setConfirmRiskCeiling] = useState<boolean>(false);
  const [confirmPauseStop, setConfirmPauseStop] = useState<boolean>(false);

  // Fetch live automation status from backend
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/automation/status', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.automation) {
          setStatus(data.automation.status || 'OFF');
          setEnvironment(data.automation.environment || 'DEMO');
          if (Array.isArray(data.automation.auditTrail)) {
            setAuditTrail(data.automation.auditTrail);
          }
        }
      }
    } catch {
      // Ignore network hiccup
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 4000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const handleControlAction = async (action: 'ACTIVATE_DEMO' | 'PAUSE' | 'RESUME' | 'EMERGENCY_STOP') => {
    setLoading(true);
    setActionNotice(null);

    try {
      const payload: any = { action, environment: 'DEMO' };

      if (action === 'ACTIVATE_DEMO') {
        payload.confirmAccount = accountId;
        payload.confirmEnvironment = 'DEMO';
        payload.confirmStrategy = 'Trend Continuation v2';
        payload.confirmRiskSettings = true;
      }

      const res = await fetch('/api/automation/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatus(data.automation?.status || 'OFF');
        if (Array.isArray(data.automation?.auditTrail)) {
          setAuditTrail(data.automation.auditTrail);
        }
        setActionNotice({
          type: 'success',
          text: data.message || `Automation status updated to ${data.automation?.status}.`,
        });
        setModalOpen(false);
      } else {
        setActionNotice({
          type: 'error',
          text: data.message || data.error || 'Control action could not be processed.',
        });
      }
    } catch {
      setActionNotice({
        type: 'error',
        text: 'Network error executing automation control action.',
      });
    } finally {
      setLoading(false);
      fetchStatus();
    }
  };

  const canActivate = isSchoolComplete && (isAccountLinked || isOwner);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Action Notice */}
      {actionNotice && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '8px',
            fontSize: '13px',
            backgroundColor:
              actionNotice.type === 'success'
                ? 'var(--accent-green-subtle)'
                : actionNotice.type === 'warning'
                ? 'var(--accent-gold-subtle)'
                : 'var(--accent-red-subtle)',
            color:
              actionNotice.type === 'success'
                ? 'var(--accent-green)'
                : actionNotice.type === 'warning'
                ? 'var(--accent-gold)'
                : 'var(--accent-red)',
            border: `1px solid ${
              actionNotice.type === 'success'
                ? 'var(--accent-green-border)'
                : actionNotice.type === 'warning'
                ? 'var(--border-accent)'
                : 'var(--accent-red-border)'
            }`,
          }}
        >
          {actionNotice.text}
        </div>
      )}

      {/* Main Status & Control Panel */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              AUTOMATION ENGINE STATE
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {status === 'ACTIVE_DEMO' ? 'Active (Demo Environment)' : status === 'PAUSED' ? 'Paused (Temporary Standby)' : 'Disarmed (OFF)'}
              </h2>
              <span
                style={{
                  fontSize: '11.5px',
                  fontFamily: 'var(--font-mono, monospace)',
                  fontWeight: 700,
                  padding: '3px 10px',
                  borderRadius: '5px',
                  backgroundColor:
                    status === 'ACTIVE_DEMO'
                      ? 'var(--accent-green-subtle)'
                      : status === 'PAUSED'
                      ? 'var(--accent-gold-subtle)'
                      : 'var(--bg-surface-2)',
                  color:
                    status === 'ACTIVE_DEMO'
                      ? 'var(--accent-green)'
                      : status === 'PAUSED'
                      ? 'var(--accent-gold)'
                      : 'var(--text-muted)',
                  border: `1px solid ${
                    status === 'ACTIVE_DEMO'
                      ? 'var(--accent-green-border)'
                      : status === 'PAUSED'
                      ? 'var(--border-accent)'
                      : 'var(--border-default)'
                  }`,
                }}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            {status === 'OFF' ? (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                disabled={!canActivate || loading}
                style={{
                  padding: '10px 22px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  backgroundColor: canActivate ? 'var(--accent-gold)' : 'var(--bg-surface-2)',
                  color: canActivate ? '#000000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: canActivate && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                Activate Demo Automation &rarr;
              </button>
            ) : status === 'ACTIVE_DEMO' ? (
              <>
                <button
                  type="button"
                  onClick={() => handleControlAction('PAUSE')}
                  disabled={loading}
                  style={{
                    padding: '10px 18px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-gold-subtle)',
                    color: 'var(--accent-gold)',
                    border: '1px solid var(--border-accent)',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Processing...' : 'Pause Engine'}
                </button>
                <button
                  type="button"
                  onClick={() => handleControlAction('EMERGENCY_STOP')}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-red)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  EMERGENCY STOP
                </button>
              </>
            ) : (
              /* Paused State */
              <>
                <button
                  type="button"
                  onClick={() => handleControlAction('RESUME')}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-green)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  {loading ? 'Processing...' : 'Resume Demo Execution'}
                </button>
                <button
                  type="button"
                  onClick={() => handleControlAction('EMERGENCY_STOP')}
                  disabled={loading}
                  style={{
                    padding: '10px 20px',
                    fontSize: '13px',
                    fontWeight: 700,
                    backgroundColor: 'var(--accent-red)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                  }}
                >
                  EMERGENCY STOP
                </button>
              </>
            )}
          </div>
        </div>

        {/* Prerequisites Alert if Not Qualified */}
        {!canActivate && (
          <div
            style={{
              padding: '14px 18px',
              backgroundColor: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              marginBottom: '20px',
            }}
          >
            <strong style={{ color: 'var(--text-primary)' }}>Prerequisites Required Before Activation:</strong>
            <ul style={{ margin: '6px 0 0', paddingLeft: '20px' }}>
              {!isSchoolComplete && (
                <li>
                  Complete Foundation School Checkpoints 1-5 (<Link href="/school" style={{ color: 'var(--accent-gold)' }}>Go to School</Link>)
                </li>
              )}
              {!isAccountLinked && (
                <li>
                  Link your JustMarkets MT5 account ID (<Link href="/accounts" style={{ color: 'var(--accent-gold)' }}>Go to Accounts Desk</Link>)
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Active Strategy Configuration Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '16px',
            padding: '20px',
            backgroundColor: 'var(--bg-surface-1)',
            border: '1px solid var(--border-default)',
            borderRadius: '8px',
          }}
        >
          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Target Strategy</span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
              Trend Continuation v2
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>SMC Liquidity &amp; EMA Alignment</div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Strategy Version</span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              v2.1.0 (Production Candidate)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Strictly Single-Ticket</div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Risk Per Trade</span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-green)', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              2.0% Equity Ceiling
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Hard protective stop loss</div>
          </div>

          <div>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Daily Loss Lockout</span>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--accent-red)', marginTop: '2px', fontFamily: 'var(--font-mono, monospace)' }}>
              5.0% Equity Cease
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Locks until next UTC 00:00</div>
          </div>
        </div>
      </div>

      {/* Gated Live Order Execution Boundary */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-red)', fontWeight: 700, textTransform: 'uppercase' }}>
              RELEASE BOUNDARY GOVERNANCE
            </span>
            <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '2px 0 0' }}>
              Live Order Execution: Gated &amp; Locked
            </h3>
          </div>
          <span
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(185, 28, 28, 0.1)',
              color: 'var(--accent-red)',
              border: '1px solid var(--accent-red-border)',
            }}
          >
            GATED BEHIND 5 READINESS CHECKS
          </span>
        </div>

        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 16px' }}>
          To prevent real capital exposure during validation, the initial platform release is strictly demo-first. Live order placement is structurally disabled in code and will only be activated after all five gates are completed:
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px', fontSize: '12.5px' }}>
          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '12px' }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>1. Security Audit:</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Cryptographic JWT &amp; Gate Bypasses Closed</div>
          </div>
          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '12px' }}>
            <span style={{ color: 'var(--accent-green)', fontWeight: 700 }}>2. Expectancy Reconciliation:</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>1.8:1 Min R:R (Eliminates Historical Loss Tail)</div>
          </div>
          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>3. 24/7 VPS Watchdog:</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Operational Heartbeat Verification</div>
          </div>
          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>4. Broker API Formalization:</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Partner Client List Sync &amp; EA Bridge</div>
          </div>
          <div style={{ background: 'var(--bg-surface-1)', border: '1px solid var(--border-default)', borderRadius: '6px', padding: '12px' }}>
            <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>5. Legal &amp; Compliance Signoff:</span>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>Non-Custodial Disclosure Alignment</div>
          </div>
        </div>
      </div>

      {/* Audit Trail of Automation Events */}
      <div
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.04)',
        }}
      >
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Automation Audit Trail
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '4px 0 0' }}>
            Every state change, pause, resume, and emergency stop is cryptographically signed and logged with timestamp and user ID.
          </p>
        </div>

        {auditTrail.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
            No automation events recorded yet for this session.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '8px 12px' }}>Time (UTC)</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                  <th style={{ padding: '8px 12px' }}>Environment</th>
                  <th style={{ padding: '8px 12px' }}>Actor</th>
                  <th style={{ padding: '8px 12px' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {auditTrail.map((evt) => (
                  <tr key={evt.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-secondary)' }}>
                      {evt.timestamp ? evt.timestamp.slice(0, 19).replace('T', ' ') : '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          backgroundColor:
                            evt.action.includes('STOP')
                              ? 'var(--accent-red-subtle)'
                              : evt.action.includes('PAUSE')
                              ? 'var(--accent-gold-subtle)'
                              : 'var(--accent-green-subtle)',
                          color:
                            evt.action.includes('STOP')
                              ? 'var(--accent-red)'
                              : evt.action.includes('PAUSE')
                              ? 'var(--accent-gold)'
                              : 'var(--accent-green)',
                        }}
                      >
                        {evt.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#0369A1' }}>
                      {evt.environment}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {evt.actor}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>
                      {evt.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {modalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-card)',
              border: '1px solid var(--border-default)',
              borderRadius: '12px',
              padding: '28px',
              maxWidth: '520px',
              width: '100%',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
            }}
          >
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 10px' }}>
              Confirm Demo Automation Activation
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 18px' }}>
              Please affirmatively verify the parameters and risk constraints for this execution session:
            </p>

            <div
              style={{
                backgroundColor: 'var(--bg-surface-1)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '14px',
                fontSize: '12.5px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '18px',
              }}
            >
              <div><strong style={{ color: 'var(--text-primary)' }}>Account ID:</strong> #{accountId}</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Environment:</strong> DEMO (Virtual Capital Only)</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Strategy Model:</strong> Trend Continuation v2 (v2.1.0)</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Permissions:</strong> DEMO_EXECUTION_ONLY (No Real Funds)</div>
              <div><strong style={{ color: 'var(--text-primary)' }}>Risk Limits:</strong> 2.0% Per Trade | 5.0% Daily Loss Lockout</div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '22px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmDemoEnv}
                  onChange={(e) => setConfirmDemoEnv(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span>I confirm this session runs strictly in the DEMO environment with virtual simulated funds.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmRiskCeiling}
                  onChange={(e) => setConfirmRiskCeiling(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span>I acknowledge the 2% per-trade risk ceiling and that simulated performance does not guarantee future results.</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={confirmPauseStop}
                  onChange={(e) => setConfirmPauseStop(e.target.checked)}
                  style={{ marginTop: '3px' }}
                />
                <span>I confirm that I have access to instant PAUSE and EMERGENCY STOP controls at all times.</span>
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                style={{
                  padding: '9px 16px',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  border: '1px solid var(--border-default)',
                  borderRadius: '6px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleControlAction('ACTIVATE_DEMO')}
                disabled={!confirmDemoEnv || !confirmRiskCeiling || !confirmPauseStop || loading}
                style={{
                  padding: '9px 20px',
                  fontSize: '13px',
                  fontWeight: 700,
                  backgroundColor: confirmDemoEnv && confirmRiskCeiling && confirmPauseStop ? 'var(--accent-gold)' : 'var(--bg-surface-2)',
                  color: confirmDemoEnv && confirmRiskCeiling && confirmPauseStop ? '#000000' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: confirmDemoEnv && confirmRiskCeiling && confirmPauseStop && !loading ? 'pointer' : 'not-allowed',
                }}
              >
                {loading ? 'Activating...' : 'Confirm & Activate Demo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

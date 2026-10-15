'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

interface HomeBrokerSectionProps {
  initialSignedIn: boolean;
}

export default function HomeBrokerSection({ initialSignedIn }: HomeBrokerSectionProps) {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(initialSignedIn);
  const [accountId, setAccountId] = useState<string>('');

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsSignedIn(true);
          const user = data.user || data.session;
          if (user?.mt5Account || user?.accountId) {
            setAccountId(user.mt5Account || user.accountId);
          }
        } else {
          setIsSignedIn(false);
        }
      })
      .catch(() => {
        // Fallback
      });
  }, []);

  return (
    <section style={{ padding: '48px 0 80px' }}>
      <div className="container-main">
        <div className="broker-card broker-card-grid">
          <div>
            <span className="status-badge status-completed" style={{ marginBottom: '12px' }}>
              OFFICIAL BROKER PARTNERSHIP
            </span>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', letterSpacing: '-0.3px' }}>
              100% Subsidized Access via JustMarkets
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              All quantitative trading models, live telemetry feeds, and 30-lesson academy modules are completely free for traders registered under our verified partner code. Capital remains 100% inside your regulated JustMarkets MT5 account with non-custodial protection.
            </p>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
              <a
                href={DEFAULT_PARTNER_CONFIG.primaryLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '12px 24px', fontSize: '13.5px' }}
              >
                {isSignedIn ? 'JustMarkets Portal &rarr;' : 'Open JustMarkets Account &rarr;'}
              </a>
              <span className="mono-nums" style={{ fontSize: '13px', color: 'var(--accent-gold)' }}>
                Partner Code: <strong>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>
              </span>
            </div>
          </div>

          <div style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '22px'
          }}>
            {isSignedIn ? (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Verified Partner Account Active
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
                  <div>Account: <strong className="mono-nums" style={{ color: 'var(--text-primary)' }}>#{accountId || 'ACTIVE'}</strong></div>
                  <div>Sponsor: <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>JustMarkets MT5</span></div>
                  <div>Partner Code: <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</code></div>
                  <div>Status: <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Institutional Access Unlocked</span></div>
                </div>
                <div style={{ marginTop: '16px' }}>
                  <Link
                    href="/terminal"
                    className="btn btn-secondary"
                    style={{ width: '100%', fontSize: '12px', padding: '8px 12px' }}
                  >
                    Open AI Terminal &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Onboarding Protocol
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div>1. Register at JustMarkets with partner code <strong className="mono-nums" style={{ color: 'var(--accent-gold)' }}>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong></div>
                  <div>2. Open an MT5 Standard or Pro account</div>
                  <div>3. Verify your MT5 Account ID in Velarion</div>
                  <div>4. Instant Subsidized Access to Terminal and Academy</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

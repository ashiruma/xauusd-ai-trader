'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function Navbar() {
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [session, setSession] = useState<{
    verified: boolean;
    mt5Account?: string;
    role?: string;
  } | null>(null);

  useEffect(() => {
    // Fetch server session from HTTP-only cookie
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.session) {
          setSession(data.session);
        } else {
          setSession(null);
        }
      })
      .catch(() => setSession(null));
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setSession(null);
      window.location.href = '/';
    } catch {
      // ignore
    }
  };

  const navLinks = [
    { href: '/', label: 'Overview' },
    { href: '/why-gold', label: 'Why Gold' },
    { href: '/strategies', label: 'Quant Models' },
    { href: '/academy', label: 'Forex School' },
    { href: '/tools/growth-calculator', label: '200-Pip Calculator' },
    { href: '/terminal', label: 'Terminal', protected: true },
    { href: '/onboarding', label: 'Onboarding' },
    ...(session?.role === 'admin' ? [{ href: '/admin-secure-x9f8k2', label: 'Partner Portal' }] : [])
  ];

  return (
    <>
      <header style={{
        background: 'var(--bg-surface-1)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '0 24px',
        height: '58px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #E6BB59, #B88E30)',
              color: '#080D18',
              fontWeight: 800,
              fontSize: '17px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-sans)'
            }}>
              V
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: '14px',
                fontWeight: 800,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: 'var(--text-primary)',
                lineHeight: 1.1
              }}>
                VELARION MARKETS
              </span>
              <span style={{
                fontSize: '9.5px',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}>
                XAUUSD QUANTITATIVE &amp; ACADEMY
              </span>
            </div>
          </Link>

          {/* Navigation Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="hidden-mobile">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '4px',
                    fontSize: '12.5px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    background: isActive ? 'var(--bg-surface-2)' : 'transparent',
                    borderBottom: isActive ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Actions & Auth Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Uplink Telemetry */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--border-subtle)',
            padding: '4px 10px',
            borderRadius: '4px',
            fontSize: '11px',
            color: 'var(--text-secondary)',
            fontFamily: 'var(--font-mono)'
          }}>
            <span className="dot-indicator" style={{ width: '6px', height: '6px' }} />
            <span>MT5 UPLINK</span>
          </div>

          {session?.verified ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11.5px',
                color: 'var(--accent-gold)',
                background: 'rgba(230, 187, 89, 0.1)',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid rgba(230, 187, 89, 0.3)',
                fontFamily: 'var(--font-mono)'
              }}>
                MT5: #{session.mt5Account}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: '5px 10px', fontSize: '11px' }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setAuthModalOpen(true)}
                className="btn btn-gold"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Verify MT5 Account
              </button>
            </div>
          )}
        </div>
      </header>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setAuthModalOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}

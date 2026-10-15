'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
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
        height: '60px',
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
              background: 'linear-gradient(135deg, #C5A059, #8C6D2D)',
              color: '#0B0F19',
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

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="nav-desktop-links">
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
            <span className="dot-indicator" />
            <span>MT5 UPLINK</span>
          </div>

          {session?.verified ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '11.5px',
                color: 'var(--accent-gold)',
                background: 'var(--accent-gold-subtle)',
                padding: '4px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-accent)',
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
            <button
              onClick={() => setAuthModalOpen(true)}
              className="btn btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px' }}
            >
              Verify MT5 Account
            </button>
          )}

          {/* Mobile Hamburger Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            style={{
              display: 'none',
              background: 'transparent',
              border: '1px solid var(--border-default)',
              borderRadius: '4px',
              padding: '6px 8px',
              color: 'var(--text-primary)',
              cursor: 'pointer'
            }}
            className="nav-mobile-toggle"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {mobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div style={{
          position: 'fixed',
          top: '60px',
          left: 0,
          right: 0,
          background: 'var(--bg-surface-1)',
          borderBottom: '1px solid var(--border-default)',
          padding: '16px 24px',
          zIndex: 99,
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
        }}>
          {navLinks.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                style={{
                  padding: '10px 14px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)',
                  background: isActive ? 'var(--bg-surface-2)' : 'transparent',
                  borderLeft: isActive ? '3px solid var(--accent-gold)' : '3px solid transparent'
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

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

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

  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'gateway' | 'offline'>('checking');

  // Fetch real MT5 quote connection status
  useEffect(() => {
    let isMounted = true;
    const checkConnection = async () => {
      try {
        const res = await fetch('/api/market/quote', { cache: 'no-store' });
        if (!res.ok) throw new Error('Offline');
        const data = await res.json();
        if (isMounted) {
          if (data && typeof data.price === 'number') {
            if (data.source === 'JUSTMARKETS_MT5_DIRECT') {
              setConnectionStatus('connected');
            } else {
              setConnectionStatus('gateway');
            }
          } else {
            setConnectionStatus('offline');
          }
        }
      } catch {
        if (isMounted) {
          setConnectionStatus('offline');
        }
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 10000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Fetch session from server cookie
  useEffect(() => {
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

  // Handle escape key to close mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

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

  const statusLabel =
    connectionStatus === 'connected'
      ? 'MT5 CONNECTED'
      : connectionStatus === 'gateway'
      ? 'MT5 GATEWAY'
      : connectionStatus === 'checking'
      ? 'CHECKING UPLINK'
      : 'MT5 OFFLINE';

  const dotClass =
    connectionStatus === 'connected' || connectionStatus === 'gateway'
      ? 'connected'
      : connectionStatus === 'checking'
      ? 'checking'
      : 'offline';

  return (
    <>
      <header className="header-wrapper" role="banner">
        <div className="header-container">
          {/* Brand Identity on the Left */}
          <Link href="/" className="brand-group" aria-label="Velarion Markets Homepage" style={{ cursor: 'pointer' }}>
            <div className="brand-logo" aria-hidden="true">
              <picture>
                <source srcSet="/velarion_emblem_dark.webp" type="image/webp" />
                <img
                  src="/velarion_emblem_dark.png"
                  alt="Velarion Markets Logo"
                  width="42"
                  height="42"
                  style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                />
              </picture>
            </div>
            <div className="brand-text">
              <span className="brand-title">VELARION MARKETS</span>
              <span className="brand-subtitle">QUANTITATIVE TRADING &amp; ACADEMY</span>
            </div>
          </Link>

          {/* Desktop Navigation on a Single Horizontal Line */}
          <nav className="nav-desktop" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Group: MT5 Status & Verification CTA */}
          <div className="header-actions">
            {/* Real Connection Status Pill */}
            <div
              className="mt5-status-pill"
              title={`Market Feed Uplink Status: ${statusLabel}`}
              role="status"
              aria-live="polite"
            >
              <span className={`mt5-indicator-dot ${dotClass}`} aria-hidden="true" />
              <span>{statusLabel}</span>
            </div>

            {session?.verified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="verified-account-badge">
                  MT5: #{session.mt5Account}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '11.5px' }}
                  aria-label="Logout from MT5 Session"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="cta-verify"
                aria-label="Verify MT5 Account"
              >
                Verify MT5 Account
              </button>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="mobile-toggle-btn"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
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
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <>
          <div
            className="mobile-drawer-overlay"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <nav className="mobile-drawer-content" aria-label="Mobile Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span>{item.label}</span>
                  {isActive && <span style={{ color: 'var(--accent-gold)', fontSize: '12px' }}>Active</span>}
                </Link>
              );
            })}

            {/* Mobile Drawer Footer with Connection Status & CTA */}
            <div className="mobile-drawer-footer">
              <div
                className="mt5-status-pill"
                style={{ width: 'fit-content', padding: '6px 12px' }}
                role="status"
              >
                <span className={`mt5-indicator-dot ${dotClass}`} aria-hidden="true" />
                <span>{statusLabel}</span>
              </div>

              {!session?.verified ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setAuthModalOpen(true);
                  }}
                  className="cta-verify"
                  style={{ width: '100%', padding: '12px', fontSize: '13px' }}
                >
                  Verify MT5 Account
                </button>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="verified-account-badge">
                    MT5: #{session.mt5Account}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="btn btn-secondary"
                    style={{ padding: '8px 16px', fontSize: '12px' }}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </nav>
        </>
      )}

      {/* Verification Auth Modal */}
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

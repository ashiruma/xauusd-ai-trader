'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';
import TerminalAccountStatus from './TerminalAccountStatus';

export default function Navbar() {
  const pathname = usePathname();
  const isTerminalPage = pathname === '/terminal' || pathname.startsWith('/terminal/');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{
    verified: boolean;
    mt5Account?: string;
    accountId?: string;
    role?: string;
  } | null>(null);

  // Fetch session from server
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        const sess = data.session || data.user;
        if (data.authenticated && sess) {
          setSession(sess);
        } else if (!isTerminalPage) {
          setSession(null);
        }
      })
      .catch(() => {
        if (!isTerminalPage) setSession(null);
      });
  }, [pathname, isTerminalPage]);

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
      window.location.href = '/';
    }
  };

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/why-gold', label: 'Why Gold' },
    { href: '/academy', label: 'Forex School' },
    { href: '/tools/growth-calculator', label: 'Risk calculator' },
  ];

  const isAuthenticated = Boolean(session?.verified || isTerminalPage);
  const displayAccountId = session?.mt5Account || session?.accountId || '1200533810';

  return (
    <>
      <header
        className={`header-wrapper ${isTerminalPage ? 'header-terminal' : ''}`}
        role="banner"
        style={{
          backgroundColor: '#0B0F19',
          borderBottom: '1px solid #1E293B',
          color: '#F8FAFC',
        }}
      >
        <div className="header-container" style={isTerminalPage ? { maxWidth: '1680px' } : undefined}>
          {/* Brand Identity on the Left */}
          <Link
            href="/"
            className="brand-group"
            aria-label="Velarion Markets Homepage"
            style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <picture>
              <source srcSet="/velarion_brand_dark.webp" type="image/webp" />
              <img
                src="/velarion_brand_dark.png"
                alt="VELARION MARKETS"
                width={130}
                height={36}
                style={{ height: '34px', width: 'auto', display: 'block' }}
                fetchPriority="high"
              />
            </picture>
            {isTerminalPage && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent-gold, #C5A059)',
                  background: 'rgba(197, 160, 89, 0.12)',
                  border: '1px solid rgba(197, 160, 89, 0.3)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                }}
              >
                Terminal
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="nav-desktop" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  style={{
                    color: isActive ? 'var(--accent-gold, #C5A059)' : '#94A3B8',
                    fontWeight: isActive ? 600 : 500,
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div className="header-actions">
            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isTerminalPage && <TerminalAccountStatus />}

                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: '#94A3B8',
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: '1px solid #1E293B',
                    background: '#111827',
                  }}
                >
                  MT5: #{displayAccountId}
                </span>

                {!isTerminalPage && (
                  <Link
                    href="/terminal"
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '12px' }}
                  >
                    AI Terminal &rarr;
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    color: '#94A3B8',
                    border: '1px solid #1E293B',
                    borderRadius: '5px',
                    cursor: 'pointer',
                  }}
                  aria-label="Logout from MT5 Session"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                href="/onboarding"
                className="cta-verify"
                aria-label="Unlock Free Access to Velarion Markets"
              >
                Unlock Free Access
              </Link>
            )}

            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="mobile-toggle-btn"
              style={isTerminalPage ? { color: '#F8FAFC' } : undefined}
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
          <nav
            className="mobile-drawer-content"
            aria-label="Mobile Navigation"
            style={{ background: '#0B0F19', borderBottom: '1px solid #1E293B' }}
          >
            {navLinks.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                  aria-current={isActive ? 'page' : undefined}
                  style={{ color: isActive ? 'var(--accent-gold, #C5A059)' : '#94A3B8' }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Drawer Footer */}
            <div className="mobile-drawer-footer">
              {!isAuthenticated ? (
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="cta-verify"
                  style={{ width: '100%', padding: '12px', fontSize: '13px', textAlign: 'center' }}
                >
                  Unlock Free Access
                </Link>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontSize: '12px',
                      color: 'var(--accent-gold, #C5A059)',
                    }}
                  >
                    MT5: #{displayAccountId}
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

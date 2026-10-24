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
    isAdmin?: boolean;
  } | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Synchronize client eye-comfort theme preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem('velarion_theme') as 'light' | 'dark' | null;
      if (saved) {
        setTheme(saved);
        if (saved === 'dark') {
          document.documentElement.setAttribute('data-theme', 'dark');
        } else {
          document.documentElement.removeAttribute('data-theme');
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('velarion_theme', next);
    } catch {
      // ignore
    }
    if (next === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  // Fetch session from server
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        const sess = data.session || data.user;
        if (data.authenticated && sess) {
          setSession({
            ...sess,
            verified: true,
            isAdmin: Boolean(sess.isAdmin || sess.role === 'admin'),
          });
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

  const isAuthenticated = Boolean(session?.verified);
  const displayAccountId = session?.mt5Account || session?.accountId || '';

  const navLinks = isAuthenticated
    ? [
        { href: '/overview', label: 'Overview' },
        { href: '/school', label: 'School' },
        { href: '/accounts', label: 'Accounts' },
        { href: '/automation', label: 'Automation' },
        { href: '/activity', label: 'Activity' },
        { href: '/assistant', label: 'AI Assistant' },
        { href: '/settings', label: 'Settings / Help' },
        ...(session?.isAdmin ? [{ href: '/control', label: 'Admin' }] : []),
      ]
    : [
        { href: '/', label: 'Home' },
        { href: '/how-it-works', label: 'How It Works' },
        { href: '/school-preview', label: 'School Preview' },
        { href: '/risk-and-performance', label: 'Risk & Performance' },
        { href: '/assistant', label: 'AI Assistant' },
      ];

  const isMemberPortalPage =
    pathname.startsWith('/overview') ||
    pathname.startsWith('/accounts') ||
    pathname.startsWith('/automation') ||
    pathname.startsWith('/activity') ||
    pathname.startsWith('/settings') ||
    pathname === '/school';

  const isAuthAssistant =
    pathname.startsWith('/assistant') &&
    (isAuthenticated || (typeof document !== 'undefined' && document.cookie.includes('jm_auth_session')));

  if (isMemberPortalPage || isAuthAssistant) {
    return null;
  }

  return (
    <>
      <header
        className={`header-wrapper ${isTerminalPage ? 'header-terminal' : ''} header-home`}
        role="banner"
        style={{
          backgroundColor: 'var(--bg-base)',
          borderBottom: '1px solid var(--border-default)',
          color: 'var(--text-primary)',
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
              {theme === 'dark' ? (
                <>
                  <source srcSet="/velarion_brand_dark.webp" type="image/webp" />
                  <img
                    src="/velarion_brand_dark.png"
                    alt="VELARION MARKETS"
                    width={140}
                    height={36}
                    style={{ height: '32px', width: 'auto', display: 'block' }}
                    fetchPriority="high"
                  />
                </>
              ) : (
                <>
                  <source srcSet="/velarion_brand_navy.webp" type="image/webp" />
                  <img
                    src="/velarion_brand_navy.png"
                    alt="VELARION MARKETS"
                    width={140}
                    height={36}
                    style={{ height: '32px', width: 'auto', display: 'block' }}
                    fetchPriority="high"
                  />
                </>
              )}
            </picture>
            {isTerminalPage && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: 'var(--accent-gold)',
                  background: 'var(--accent-gold-subtle)',
                  border: '1px solid var(--border-accent)',
                  padding: '2px 8px',
                  borderRadius: '2px',
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
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Group */}
          <div className="header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Eye-Comfort Light / Dark Mode Toggle */}
            <button
              onClick={toggleTheme}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 11px',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: 'var(--font-mono, monospace)',
                cursor: 'pointer',
                borderRadius: '2px',
                backgroundColor: 'var(--bg-surface-2)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                transition: 'all 0.15s ease',
              }}
              title="Toggle Light / Dark Eye Comfort Mode"
              aria-label="Toggle Color Theme"
              type="button"
            >
              {theme === 'dark' ? (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span>{theme === 'dark' ? 'LIGHT' : 'DARK'}</span>
            </button>

            {isAuthenticated ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {isTerminalPage && <TerminalAccountStatus />}

                <span
                  style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-mono, monospace)',
                    color: 'var(--text-secondary)',
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: '1px solid var(--border-default)',
                    background: 'var(--bg-surface-1)',
                    fontWeight: 600,
                  }}
                >
                  MT5: #{displayAccountId}
                </span>

                {!isTerminalPage && (
                  <Link
                    href="/terminal"
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '12px', background: 'var(--text-primary)', color: 'var(--bg-base)', border: 'none' }}
                  >
                    Open Terminal &rarr;
                  </Link>
                )}

                <Link
                  href="/control"
                  style={{
                    padding: '6px 11px',
                    fontSize: '11.5px',
                    color: 'var(--accent-gold, #D4AF37)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '5px',
                    background: 'rgba(212, 175, 55, 0.08)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                  title="Admin Control Dashboard"
                >
                  Admin
                </Link>

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                  aria-label="Logout from MT5 Session"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link
                  href="/control"
                  style={{
                    padding: '6px 10px',
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    textDecoration: 'none',
                    fontWeight: 600,
                  }}
                  title="Admin Dashboard"
                >
                  Admin
                </Link>
                <Link
                  href="/login"
                  className="btn btn-ghost"
                  style={{
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    background: 'var(--bg-card)',
                  }}
                >
                  Sign In
                </Link>
                <a
                  href="https://one.justmarkets.link/a/tohstb0d83"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{
                    padding: '7px 16px',
                    fontSize: '12.5px',
                    backgroundColor: 'var(--accent-gold)',
                    color: '#FFFFFF',
                    borderRadius: '6px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    border: 'none',
                  }}
                  aria-label="Register on JustMarkets with partner code"
                >
                  Register on JustMarkets
                </a>
              </div>
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
            style={{ background: 'var(--bg-base)', borderBottom: '1px solid var(--border-default)' }}
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
                  style={{ color: isActive ? 'var(--accent-gold)' : 'var(--text-primary)', fontWeight: isActive ? 700 : 500 }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Drawer Footer with High-Impact CTA and Theme Switcher */}
            <div className="mobile-drawer-footer" style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={toggleTheme}
                type="button"
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '10px',
                  fontSize: '12px',
                  justifyContent: 'center',
                  background: 'var(--bg-surface-2)',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border-default)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  borderRadius: '6px',
                }}
              >
                {theme === 'dark' ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                )}
                <span>{theme === 'dark' ? 'Switch to Eye-Comfort White' : 'Switch to Dark Mode'}</span>
              </button>

              {!isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href="https://one.justmarkets.link/a/tohstb0d83"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '13px', textAlign: 'center', backgroundColor: 'var(--accent-gold)', color: '#FFFFFF', borderRadius: '6px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Register on JustMarkets
                  </a>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px', fontSize: '13px', textAlign: 'center', textDecoration: 'none', background: 'var(--bg-surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border-default)', borderRadius: '6px' }}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/control"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)', textDecoration: 'none', padding: '6px' }}
                  >
                    Admin Dashboard
                  </Link>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                  <Link
                    href="/control"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary"
                    style={{
                      width: '100%',
                      padding: '10px',
                      fontSize: '13px',
                      textAlign: 'center',
                      textDecoration: 'none',
                      background: 'rgba(212, 175, 55, 0.1)',
                      color: 'var(--accent-gold, #D4AF37)',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: '6px',
                      fontWeight: 600,
                    }}
                  >
                    Admin Dashboard
                  </Link>
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

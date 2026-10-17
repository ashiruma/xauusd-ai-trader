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
    { href: '/academy', label: 'Forex School' },
    { href: '/terminal', label: 'Trading Terminal' },
  ];

  const isAuthenticated = Boolean(session?.verified);
  const displayAccountId = session?.mt5Account || session?.accountId || '';

  return (
    <>
      <header
        className={`header-wrapper ${isTerminalPage ? 'header-terminal' : ''}`}
        role="banner"
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #CBD5E1',
          color: '#0F172A',
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
              <source srcSet="/velarion_brand_navy.webp" type="image/webp" />
              <img
                src="/velarion_brand_navy.png"
                alt="VELARION MARKETS"
                width={140}
                height={36}
                style={{ height: '32px', width: 'auto', display: 'block' }}
                fetchPriority="high"
              />
            </picture>
            {isTerminalPage && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#B45309',
                  background: 'rgba(180, 83, 9, 0.08)',
                  border: '1px solid rgba(180, 83, 9, 0.25)',
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
                    color: isActive ? '#B45309' : '#334155',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '13.5px',
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
                    color: '#334155',
                    padding: '4px 10px',
                    borderRadius: '5px',
                    border: '1px solid #CBD5E1',
                    background: '#F8FAFC',
                    fontWeight: 600,
                  }}
                >
                  MT5: #{displayAccountId}
                </span>

                {!isTerminalPage && (
                  <Link
                    href="/terminal"
                    className="btn btn-secondary"
                    style={{ padding: '7px 14px', fontSize: '12px', background: '#0F172A', color: '#FFFFFF', border: 'none' }}
                  >
                    Open Terminal &rarr;
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{
                    padding: '6px 12px',
                    fontSize: '11.5px',
                    color: '#64748B',
                    border: '1px solid #CBD5E1',
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
                  href="/login"
                  className="btn btn-ghost"
                  style={{
                    padding: '7px 14px',
                    fontSize: '12.5px',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontWeight: 600,
                    background: '#FFFFFF',
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
                    backgroundColor: '#B45309',
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
            style={{ background: '#FFFFFF', borderBottom: '1px solid #CBD5E1' }}
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
                  style={{ color: isActive ? '#B45309' : '#0F172A', fontWeight: isActive ? 700 : 500 }}
                >
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile Drawer Footer */}
            <div className="mobile-drawer-footer" style={{ borderTop: '1px solid #E2E8F0', paddingTop: '16px' }}>
              {!isAuthenticated ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <a
                    href="https://one.justmarkets.link/a/tohstb0d83"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '12px', fontSize: '13px', textAlign: 'center', backgroundColor: '#B45309', color: '#FFFFFF', borderRadius: '6px', fontWeight: 700, textDecoration: 'none' }}
                  >
                    Register on JustMarkets
                  </a>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="btn btn-secondary"
                    style={{ width: '100%', padding: '10px', fontSize: '13px', textAlign: 'center', textDecoration: 'none', background: '#F1F5F9', color: '#0F172A', border: '1px solid #CBD5E1', borderRadius: '6px' }}
                  >
                    Sign In
                  </Link>
                </div>
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

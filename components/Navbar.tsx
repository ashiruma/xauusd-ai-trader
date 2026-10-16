'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthModal from './AuthModal';

export default function Navbar() {
  const pathname = usePathname();
  const isTerminalPage = pathname === '/terminal' || pathname.startsWith('/terminal/');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<{
    verified: boolean;
    mt5Account?: string;
    role?: string;
  } | null>(null);



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
    { href: '/why-gold', label: 'Why Gold' },
    { href: '/academy', label: 'Forex School' },
    { href: '/tools/growth-calculator', label: 'Risk calculator' },
  ];

  return (
    <>
      <header className="header-wrapper" role="banner">
        <div className="header-container">
          {/* Brand Identity on the Left - Prominent Official Picture Element */}
          <Link href="/" className="brand-group" aria-label="Velarion Markets Homepage" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <picture>
              <source srcSet="/velarion_brand_dark.webp" type="image/webp" />
              <img
                src="/velarion_brand_dark.png"
                alt="VELARION MARKETS"
                width={130}
                height={36}
                style={{ height: '36px', width: 'auto', display: 'block' }}
                fetchPriority="high"
              />
            </picture>
          </Link>

          {/* Desktop Navigation on a Single Horizontal Line - 3 High Impact Links */}
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

          {/* Right Action Group: High-Contrast Gold CTA */}
          <div className="header-actions">
            {session?.verified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {!isTerminalPage && (
                  <Link
                    href="/terminal"
                    className="btn btn-secondary"
                    style={{ padding: '8px 14px', fontSize: '12px' }}
                  >
                    AI Terminal &rarr;
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="btn btn-ghost"
                  style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-muted)' }}
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
                </Link>
              );
            })}

            {/* Mobile Drawer Footer with High-Impact CTA */}
            <div className="mobile-drawer-footer">
              {!session?.verified ? (
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

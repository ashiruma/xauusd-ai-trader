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



  // Fetch session from server cookie
  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && (data.user || data.session)) {
          setSession(data.user || data.session);
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

  const [theme, setTheme] = useState<'light' | 'dark'>('light');

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

  const navLinks = [
    { href: '/why-gold', label: 'Why Spot Gold' },
    { href: '/academy', label: '30-Lesson Forex School' },
    { href: '/tools/growth-calculator', label: '200-Pip Calculator' },
  ];

  return (
    <>
      <header className="header-wrapper" role="banner">
        <div className="header-container">
          {/* Brand Identity on the Left - Prominent Official Emblem Icon & Typography */}
          <Link href="/" className="brand-group" aria-label="Velarion Markets Homepage" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="brand-logo" aria-hidden="true" style={{ width: '38px', height: '38px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <picture style={{ width: '36px', height: '36px', display: 'block' }}>
                {theme === 'dark' ? (
                  <>
                    <source srcSet="/velarion_emblem_dark.webp" type="image/webp" />
                    <img
                      src="/velarion_emblem_dark.png"
                      alt="Velarion Emblem"
                      width={36}
                      height={36}
                      style={{ width: '36px', height: '36px', objectFit: 'contain', display: 'block' }}
                      fetchPriority="high"
                    />
                  </>
                ) : (
                  <img
                    src="/velarion_emblem_navy.png"
                    alt="Velarion Emblem"
                    width={36}
                    height={36}
                    style={{ width: '36px', height: '36px', objectFit: 'contain', display: 'block' }}
                    fetchPriority="high"
                  />
                )}
              </picture>
            </div>
            <div className="brand-text">
              <span className="brand-title">VELARION MARKETS</span>
              <span className="brand-subtitle">QUANTITATIVE TRADING &bull; XAUUSD</span>
            </div>
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

          {/* Right Action Group: Live Status, Theme Switcher & High-Contrast Gold CTA */}
          <div className="header-actions">
            {/* Live Market Uplink Status Pill with Emerald Green Dot */}
            <div
              className="mt5-status-pill"
              title="Real-Time XAUUSD Spot Data Stream via TradingView & JustMarkets MT5"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <span className="mt5-indicator-dot connected" style={{ background: '#047857' }} />
              <span style={{ fontSize: '10.5px' }}>LIVE MT5</span>
            </div>

            {/* Eye Comfort Theme Switcher */}
            <button
              onClick={toggleTheme}
              className="btn btn-ghost"
              style={{ padding: '6px 10px', fontSize: '11px', color: 'var(--text-secondary)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)' }}
              title="Toggle Light / Dark Eye Comfort Mode"
              aria-label="Toggle Color Theme"
              type="button"
            >
              {theme === 'dark' ? 'Light Mode' : 'Comfort White'}
            </button>

            {session?.verified ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="verified-account-badge" style={{ fontSize: '11px', padding: '5px 10px' }}>
                  MT5: #{session.mt5Account || 'ACTIVE'}
                </span>
                <Link
                  href="/terminal"
                  className="btn btn-secondary"
                  style={{ padding: '8px 14px', fontSize: '12px' }}
                >
                  AI Terminal &rarr;
                </Link>
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
                aria-label="Unlock Access to Velarion Markets"
              >
                Unlock Access
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
                  {isActive && <span style={{ color: 'var(--accent-gold)', fontSize: '12px' }}>Active</span>}
                </Link>
              );
            })}

            {/* Mobile Drawer Footer with High-Impact CTA and Theme Toggle */}
            <div className="mobile-drawer-footer" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={toggleTheme}
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', padding: '10px', fontSize: '12px', justifyContent: 'center' }}
              >
                {theme === 'dark' ? 'Switch to Eye-Comfort White' : 'Switch to Dark Mode'}
              </button>

              {!session?.verified ? (
                <Link
                  href="/onboarding"
                  onClick={() => setMobileMenuOpen(false)}
                  className="cta-verify"
                  style={{ width: '100%', padding: '12px', fontSize: '13px', textAlign: 'center' }}
                >
                  Unlock Access
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

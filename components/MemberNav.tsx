'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { resolveMt5AccountDisplay } from '@/lib/account-utils';

interface MemberNavProps {
  accountId?: string;
  environment?: string;
  lastSyncTime?: string;
  automationStatus?: string;
  isAdmin?: boolean;
}

export default function MemberNav({
  accountId = '',
  environment = 'DEMO',
  lastSyncTime = '',
  automationStatus = 'OFF',
  isAdmin: propIsAdmin,
}: MemberNavProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isAdmin, setIsAdmin] = useState<boolean>(Boolean(propIsAdmin));
  const [resolvedAccount, setResolvedAccount] = useState<string>(accountId);

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

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then((data) => {
        const u = data.user || data.session;
        if (u?.isAdmin) setIsAdmin(true);
        if (u?.mt5Account || u?.accountId) {
          setResolvedAccount(u.mt5Account || u.accountId);
        }
      })
      .catch(() => {});
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

  const mt5Info = resolveMt5AccountDisplay({
    mt5Account: resolvedAccount || accountId,
    isAdmin,
  });

  const navItems = [
    { href: '/overview', label: 'Dashboard' },
    { href: '/school', label: 'School' },
    { href: '/accounts', label: 'Accounts' },
    { href: '/assistant', label: 'AI Assistant' },
    ...(isAdmin ? [{ href: '/control', label: 'Admin' }] : []),
  ];

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      window.location.href = '/';
    } catch {
      window.location.href = '/';
    }
  };

  return (
    <header
      style={{
        backgroundColor: 'var(--bg-base)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 40px',
          height: '78px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand & Left Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link href="/overview" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={theme === 'dark' ? '/velarion_brand_dark.png' : '/velarion_brand_navy.png'}
              alt="Velarion Markets"
              style={{ height: '28px', width: 'auto' }}
            />
            <span
              style={{
                fontSize: '10px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--accent-gold)',
                fontWeight: 600,
                letterSpacing: '0.12em',
                padding: '2px 8px',
                borderRadius: '2px',
                background: 'var(--accent-gold-subtle)',
                border: '1px solid var(--border-default)',
              }}
            >
              MEMBER PORTAL
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }} className="desktop-member-links">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderRadius: '2px',
                    borderBottom: isActive ? '2px solid var(--accent-gold)' : '2px solid transparent',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Status Indicators & Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* MT5 Status Badge */}
          {mt5Info.isLinked ? (
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
              title="Linked JustMarkets MT5 Account"
            >
              MT5: {mt5Info.display}
            </span>
          ) : (
            <Link
              href="/accounts"
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--accent-gold, #D4AF37)',
                padding: '4px 10px',
                borderRadius: '5px',
                border: '1px solid rgba(212, 175, 55, 0.4)',
                background: 'rgba(212, 175, 55, 0.08)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
              title="Click to link your JustMarkets MT5 Account"
            >
              MT5: UNLINKED
            </Link>
          )}

          {/* Live Terminal Quick Action */}
          <Link
            href="/terminal"
            className="btn btn-secondary"
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              background: 'var(--text-primary)',
              color: 'var(--bg-base)',
              border: 'none',
              fontWeight: 600,
            }}
          >
            Open Terminal &rarr;
          </Link>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '2px',
              border: '1px solid var(--border-default)',
              backgroundColor: 'var(--bg-surface-1)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} theme`}
            aria-label="Toggle visual theme"
          >
            {theme === 'light' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            )}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={handleLogout}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-default)',
              borderRadius: '2px',
              cursor: 'pointer',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
}

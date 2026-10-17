'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface MemberNavProps {
  accountId?: string;
  environment?: string;
  lastSyncTime?: string;
  automationStatus?: string;
}

export default function MemberNav({
  accountId = 'UNLINKED',
  environment = 'DEMO',
  lastSyncTime = '',
  automationStatus = 'OFF',
}: MemberNavProps) {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const navItems = [
    { href: '/overview', label: 'Overview' },
    { href: '/school', label: 'School' },
    { href: '/accounts', label: 'Accounts' },
    { href: '/automation', label: 'Automation' },
    { href: '/activity', label: 'Activity' },
    { href: '/settings', label: 'Settings / Help' },
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
        backgroundColor: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-default)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
      }}
    >
      <div
        style={{
          maxWidth: '1720px',
          margin: '0 auto',
          padding: '0 20px',
          height: '62px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        {/* Brand & Left Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
          <Link href="/overview" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={theme === 'dark' ? '/velarion_brand_dark.png' : '/velarion_brand_navy.png'}
              alt="Velarion Markets"
              style={{ height: '24px', width: 'auto' }}
            />
            <span
              style={{
                fontSize: '11px',
                fontFamily: 'var(--font-mono, monospace)',
                color: 'var(--accent-gold)',
                fontWeight: 700,
                letterSpacing: '0.5px',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'var(--accent-gold-subtle)',
                border: '1px solid var(--border-accent)',
              }}
            >
              MEMBER PORTAL
            </span>
          </Link>

          {/* Desktop Nav Items */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '4px' }} className="desktop-member-links">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/overview' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  style={{
                    padding: '8px 14px',
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? 'var(--accent-gold)' : 'var(--text-secondary)',
                    borderRadius: '6px',
                    backgroundColor: isActive ? 'var(--accent-gold-subtle)' : 'transparent',
                    border: isActive ? '1px solid var(--border-accent)' : '1px solid transparent',
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
          {/* Environment Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: environment === 'DEMO' ? 'rgba(3, 105, 161, 0.1)' : 'var(--accent-green-subtle)',
              color: environment === 'DEMO' ? '#0369A1' : 'var(--accent-green)',
              border: `1px solid ${environment === 'DEMO' ? 'rgba(3, 105, 161, 0.25)' : 'var(--accent-green-border)'}`,
            }}
            title="Current trading execution stage: DEMO-FIRST validation"
          >
            <span>STAGE: {environment}</span>
          </div>

          {/* Automation Status Badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '11px',
              fontFamily: 'var(--font-mono, monospace)',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor:
                automationStatus === 'ACTIVE_DEMO'
                  ? 'var(--accent-green-subtle)'
                  : automationStatus === 'PAUSED'
                  ? 'var(--accent-gold-subtle)'
                  : 'var(--bg-surface-2)',
              color:
                automationStatus === 'ACTIVE_DEMO'
                  ? 'var(--accent-green)'
                  : automationStatus === 'PAUSED'
                  ? 'var(--accent-gold)'
                  : 'var(--text-muted)',
              border: '1px solid var(--border-default)',
            }}
          >
            <span>AUTO: {automationStatus}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
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
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              fontSize: '12px',
              fontWeight: 600,
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-default)',
              borderRadius: '6px',
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

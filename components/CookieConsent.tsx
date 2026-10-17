'use client';

import React, { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem('velarion_cookie_consent');
      if (!consent) {
        setVisible(true);
      }
    } catch {
      // ignore
    }
  }, []);

  const handleConsent = (level: 'all' | 'essential') => {
    try {
      localStorage.setItem('velarion_cookie_consent', JSON.stringify({
        level,
        timestamp: new Date().toISOString()
      }));
    } catch {
      // ignore
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent banner"
      className="cookie-banner-wrapper"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
            Data and Cookie Preferences
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: 0 }}>
            We use essential security cookies to authenticate your MT5 account and maintain platform sessions. We do not sell personal data.
          </p>
        </div>
        <button
          onClick={() => handleConsent('essential')}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '18px',
            lineHeight: 1,
            cursor: 'pointer',
            padding: '2px 4px'
          }}
          aria-label="Close cookie banner"
        >
          &times;
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginTop: '14px', alignItems: 'center' }}>
        <button
          onClick={() => handleConsent('all')}
          className="btn btn-primary"
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Accept All
        </button>
        <button
          onClick={() => handleConsent('essential')}
          className="btn btn-secondary"
          style={{ fontSize: '12px', padding: '6px 14px' }}
        >
          Accept Essential Only
        </button>
      </div>
    </div>
  );
}

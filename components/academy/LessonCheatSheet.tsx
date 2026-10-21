'use client';

import React, { useState } from 'react';

interface LessonCheatSheetProps {
  lessonNum: number;
  title: string;
  takeaways?: string[];
  proTip?: string;
}

export default function LessonCheatSheet({
  lessonNum,
  title,
  takeaways,
  proTip
}: LessonCheatSheetProps) {
  const [copied, setCopied] = useState(false);

  const defaultTakeaways = [
    'Spot Gold (XAUUSD) trades on sovereign liquidity and real interest rate differentials, not retail technical indicators alone.',
    'Always identify Asian Range boundaries (00:00 - 06:00 UTC) before executing London open manipulation setups.',
    'Maintain strict 1:3 minimum Risk-to-Reward. Never risk more than 2.0% of account equity on any single execution.',
    'Institutional algorithms seek stop-loss clusters resting above Equal Highs and below Equal Lows before expanding price.'
  ];

  const items = takeaways && takeaways.length > 0 ? takeaways : defaultTakeaways;

  const tip = proTip || 'XAUUSD Execution Rule: Never place hard stop-losses directly on obvious swing levels. Always include a 15-20 pip volatility buffer to absorb institutional sweep wicks.';

  const handleCopy = () => {
    const text = `VELARION MARKETS - XAUUSD CHEAT SHEET (LESSON ${lessonNum}: ${title})\n\n` +
      items.map((item, i) => `${i + 1}. ${item}`).join('\n') +
      `\n\nPRO TIP: ${tip}\n\nStudy complete structured curriculum at: https://velarion-one.vercel.app/academy`;

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
    }
  };

  return (
    <div
      style={{
        marginTop: '36px',
        marginBottom: '36px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-accent)',
        borderRadius: 'var(--radius-xs, 2px)',
        padding: '28px 24px 20px',
        position: 'relative',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
      }}
    >
      {/* Header with Authentic Branding & Watermark */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: '16px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src="/velarion_emblem_dark.png"
            alt="Velarion Emblem"
            width={30}
            height={30}
            style={{ width: '30px', height: '30px', objectFit: 'contain' }}
          />
          <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)' }}>
            VELARION MARKETS
          </span>
          <span style={{ height: '18px', width: '1px', background: 'var(--border-default)' }} />
          <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--accent-gold)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
            DESK CHEAT SHEET &bull; LESSON {lessonNum < 10 ? `0${lessonNum}` : lessonNum}
          </span>
        </div>

        <button
          onClick={handleCopy}
          type="button"
          className="btn btn-secondary"
          style={{ fontSize: '11.5px', padding: '6px 14px', borderRadius: 'var(--radius-xs, 2px)' }}
          aria-label="Copy key takeaways to clipboard"
        >
          {copied ? 'Summary Copied to Clipboard' : 'Copy Key Takeaways'}
        </button>
      </div>

      {/* Lesson Title Banner */}
      <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '16px', letterSpacing: '-0.3px' }}>
        Key Takeaways &bull; {title}
      </h3>

      {/* Bullet Points */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        {items.map((item, idx) => (
          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
            <span style={{ color: 'var(--accent-gold)', fontWeight: 800, fontSize: '14px', lineHeight: 1.4, flexShrink: 0 }}>
              &bull;
            </span>
            <p style={{ margin: 0, fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.55 }}>
              {item}
            </p>
          </div>
        ))}
      </div>

      {/* Pro Execution Tip Box */}
      <div style={{
        background: 'var(--bg-surface-2)',
        borderLeft: '3px solid var(--accent-gold)',
        borderTop: '1px solid var(--border-default)',
        borderRight: '1px solid var(--border-default)',
        borderBottom: '1px solid var(--border-default)',
        borderRadius: '0 var(--radius-xs, 2px) var(--radius-xs, 2px) 0',
        padding: '12px 16px',
        marginBottom: '20px'
      }}>
        <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 800, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
          Institutional Pro Tip &bull; Spot Gold (BabyPips Standard)
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
          {tip}
        </div>
      </div>

      {/* Screenshot & Sharing Watermark Footer */}
      <div style={{
        borderTop: '1px solid var(--border-default)',
        paddingTop: '14px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '11px',
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-mono, monospace)'
      }}>
        <span>Screenshot &amp; Share: Telegram &bull; Discord &bull; Reddit</span>
        <span style={{ color: 'var(--accent-gold)', fontWeight: 700 }}>velarion-one.vercel.app/academy</span>
      </div>
    </div>
  );
}

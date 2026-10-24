'use client';

import React, { useState } from 'react';
import { CURRICULUM_LEVELS, LevelDefinition } from '@/lib/curriculum-levels';
import LevelCelebrationModal from './LevelCelebrationModal';

interface CelebrationTriggerButtonProps {
  levelKey: 'foundation' | 'beginner' | 'intermediate' | 'advanced';
  label?: string;
  autoOpen?: boolean;
}

export default function CelebrationTriggerButton({
  levelKey,
  label = 'View Level Honors & Credential',
  autoOpen = false,
}: CelebrationTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const level: LevelDefinition = CURRICULUM_LEVELS[levelKey] || CURRICULUM_LEVELS.foundation;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '7px 16px',
          fontSize: '12px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono, monospace)',
          backgroundColor: 'var(--accent-gold-subtle, rgba(212, 175, 55, 0.12))',
          color: 'var(--accent-gold, #D4AF37)',
          border: '1px solid var(--border-accent, #D4AF37)',
          borderRadius: '5px',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          transition: 'all 0.2s ease',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="8" r="6" />
          <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
        </svg>
        <span>{label}</span>
      </button>

      {isOpen && (
        <LevelCelebrationModal
          level={level}
          onClose={() => setIsOpen(false)}
          passedLessonNum={level.capstoneLesson}
        />
      )}
    </>
  );
}

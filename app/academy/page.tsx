'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import CourseSchema from '@/components/CourseSchema';
import { getAllLessons } from '@/lib/curriculum';

export default function AcademyPage() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const allLessons = useMemo(() => getAllLessons(), []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('velarion_completed_lessons');
      if (stored) {
        setCompletedLessons(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const filteredLessons = useMemo(() => {
    if (selectedLevel === 'all') return allLessons;
    return allLessons.filter((l) => l.level === selectedLevel);
  }, [allLessons, selectedLevel]);

  const beginnerCount = allLessons.filter((l) => l.level === 'beginner').length;
  const intermediateCount = allLessons.filter((l) => l.level === 'intermediate').length;
  const advancedCount = allLessons.filter((l) => l.level === 'advanced').length;

  const totalLessons = allLessons.length;
  const passedCount = completedLessons.length;
  const progressPercent = totalLessons > 0 ? Math.round((passedCount / totalLessons) * 100) : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto 80px', padding: '0 24px' }}>
      <CourseSchema />

      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)' }}>Home</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: 'var(--text-primary)' }}>30-Lesson Forex School</span>
      </div>

      <div className="section-eyebrow">
        <span>30-Lesson Structured Curriculum</span>
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '14px', letterSpacing: '-0.5px' }}>
        Forex School &bull; Quantitative Curriculum
      </h1>

      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '820px', marginBottom: '32px' }}>
        A progressive, institutional curriculum designed to build market literacy from first principles. Lessons 1 through 5 are open for instant public study. Lessons 6 through 30 are 100% free when verified with our official broker partner, JustMarkets.
      </p>

      {/* Progress & Overview Panel */}
      <div className="panel-card" style={{ padding: '24px 28px', marginBottom: '36px', background: 'var(--bg-surface-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '18px' }}>
          <div>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
              Curriculum Progress Tracking
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              {passedCount} of {totalLessons} Lessons Completed ({progressPercent}%)
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Subsidized 100% free through our official JustMarkets regulated broker partnership.
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Link
              href="/academy/lesson-1"
              className="btn btn-primary"
              style={{ padding: '10px 20px', fontSize: '13px' }}
            >
              {passedCount > 0 ? 'Continue Curriculum' : 'Start Lesson 01 (Public)'} &rarr;
            </Link>
            <Link
              href="/onboarding"
              className="btn btn-outline-gold"
              style={{ padding: '10px 18px', fontSize: '13px' }}
            >
              Unlock All Lessons (Free) &rarr;
            </Link>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div style={{
          width: '100%',
          height: '6px',
          background: 'var(--bg-surface-3)',
          borderRadius: '3px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: `${progressPercent}%`,
            height: '100%',
            background: 'var(--accent-gold)',
            transition: 'width 0.3s ease'
          }} />
        </div>
      </div>

      {/* 3 Tier Navigation Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div
          onClick={() => setSelectedLevel('beginner')}
          style={{
            background: selectedLevel === 'beginner' ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
            border: selectedLevel === 'beginner' ? '1px solid var(--accent-green)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="status-badge status-completed" style={{ marginBottom: '10px' }}>
            TIER 1 &bull; FOUNDATIONS
          </span>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Forex Foundations
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            Currency pairs, bid/ask spreads, pip values, lot sizing, margin, leverage, and MT5 order types. Lessons 1–5 publicly open.
          </p>
          <div className="mono-nums" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>
            {beginnerCount} Lessons (Lessons 1&ndash;12)
          </div>
        </div>

        <div
          onClick={() => setSelectedLevel('intermediate')}
          style={{
            background: selectedLevel === 'intermediate' ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
            border: selectedLevel === 'intermediate' ? '1px solid var(--accent-gold)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="status-badge status-warning" style={{ marginBottom: '10px' }}>
            TIER 2 &bull; ANALYSIS &amp; DYNAMICS
          </span>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Analysis &amp; Market Dynamics
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            Candlestick anatomy, market structure, support/resistance, multi-timeframe analysis, and session liquidity windows.
          </p>
          <div className="mono-nums" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)' }}>
            {intermediateCount} Lessons (Lessons 13&ndash;22)
          </div>
        </div>

        <div
          onClick={() => setSelectedLevel('advanced')}
          style={{
            background: selectedLevel === 'advanced' ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
            border: selectedLevel === 'advanced' ? '1px solid var(--accent-red)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-md)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="status-badge status-danger" style={{ marginBottom: '10px' }}>
            TIER 3 &bull; RISK &amp; STRATEGY
          </span>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Risk &amp; Institutional Strategy
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            Mathematical position sizing, asymmetric drawdown mechanics, execution psychology, backtesting rigor, and XAUUSD mechanics.
          </p>
          <div className="mono-nums" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)' }}>
            {advancedCount} Lessons (Lessons 23&ndash;30)
          </div>
        </div>
      </div>

      {/* Filter Tabs Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
          Curriculum Catalog ({filteredLessons.length} Lessons)
        </h2>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl)}
              className="btn btn-secondary"
              style={{
                fontSize: '12px',
                padding: '6px 14px',
                background: selectedLevel === lvl ? 'var(--accent-gold)' : 'var(--bg-surface-2)',
                color: selectedLevel === lvl ? '#0B0F19' : 'var(--text-secondary)',
                fontWeight: selectedLevel === lvl ? 700 : 500,
                borderColor: selectedLevel === lvl ? 'var(--accent-gold)' : 'var(--border-default)'
              }}
            >
              {lvl.toUpperCase()} ({lvl === 'all' ? 30 : lvl === 'beginner' ? 12 : lvl === 'intermediate' ? 10 : 8})
            </button>
          ))}
        </div>
      </div>

      {/* 30 Lessons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredLessons.map((lesson) => {
          const isCompleted = completedLessons.includes(lesson.id) || completedLessons.includes(`lesson-${lesson.globalNum}`);
          const wordCount = lesson.content ? lesson.content.split(/\s+/).length : 500;
          const estReadingTime = `${Math.max(3, Math.ceil(wordCount / 180))} min read`;
          const isPublic = lesson.globalNum <= 5;

          // Determine status label
          let statusBadge = (
            <span className="status-badge" style={{ fontSize: '10px', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--accent-gold)', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              PARTNER (FREE)
            </span>
          );

          if (isCompleted) {
            statusBadge = (
              <span className="status-badge status-completed" style={{ fontSize: '10px' }}>
                COMPLETED
              </span>
            );
          } else if (isPublic) {
            statusBadge = (
              <span className="status-badge status-completed" style={{ fontSize: '10px' }}>
                PUBLIC PREVIEW
              </span>
            );
          }

          return (
            <div
              key={lesson.id}
              className="feature-card-clean"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                    LESSON {lesson.globalNum < 10 ? `0${lesson.globalNum}` : lesson.globalNum}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="mono-nums" style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                      {estReadingTime}
                    </span>
                    {statusBadge}
                  </div>
                </div>

                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.35 }}>
                  {lesson.title}
                </h3>

                <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
                  {lesson.summary}
                </p>
              </div>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '12px',
                borderTop: '1px solid var(--border-default)'
              }}>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  Tier {lesson.level === 'beginner' ? '1' : lesson.level === 'intermediate' ? '2' : '3'}
                </span>
                <Link
                  href={`/academy/lesson-${lesson.globalNum}`}
                  className="btn btn-outline-gold"
                  style={{ padding: '6px 14px', fontSize: '12px' }}
                >
                  {isCompleted ? 'Review Lesson' : isPublic ? 'Study (Public)' : 'Access Lesson'} &rarr;
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subsidized Footnote */}
      <div style={{
        marginTop: '48px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-md)',
        padding: '28px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '15px', color: 'var(--text-primary)', fontWeight: 700, marginBottom: '6px' }}>
          Lifetime Subsidized Forex &amp; Spot Gold Education
        </div>
        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 20px', lineHeight: 1.6 }}>
          Lessons 1 through 5 are open for instant public study. Lessons 6 through 30 and all quantitative assessments are 100% free when verified with our official regulated broker partner, JustMarkets.
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <Link
            href="/onboarding"
            className="btn btn-primary"
            style={{ fontSize: '13px', padding: '10px 20px' }}
          >
            Unlock Free Access Now &rarr;
          </Link>
          <a
            href="https://one.justmarkets.link/a/tohstb0d83"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-outline-gold"
            style={{ fontSize: '13px', padding: '10px 20px' }}
          >
            Register on JustMarkets &rarr;
          </a>
        </div>
      </div>
    </div>
  );
}

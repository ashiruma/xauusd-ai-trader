'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import CourseSchema from '@/components/CourseSchema';
import { getAllLessons, Lesson } from '@/lib/curriculum';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function AcademyPage() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const allLessons = useMemo(() => getAllLessons(), []);

  const filteredLessons = useMemo(() => {
    if (selectedLevel === 'all') return allLessons;
    return allLessons.filter((l) => l.level === selectedLevel);
  }, [allLessons, selectedLevel]);

  const beginnerCount = allLessons.filter((l) => l.level === 'beginner').length;
  const intermediateCount = allLessons.filter((l) => l.level === 'intermediate').length;
  const advancedCount = allLessons.filter((l) => l.level === 'advanced').length;

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto 80px', padding: '0 24px' }}>
      <CourseSchema />

      {/* Breadcrumb */}
      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        <Link href="/" style={{ color: 'var(--accent-gold)' }}>Home</Link> &gt; Forex Academy
      </div>

      <div className="landing-eyebrow">
        <span>30-LESSON STRUCTURED CURRICULUM</span>
      </div>

      <h1 style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, marginBottom: '14px' }}>
        Velarion Forex Academy
      </h1>

      <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, maxWidth: '820px', marginBottom: '32px' }}>
        A progressive, institutional curriculum designed to turn complete beginners into literacy-hardened traders. Master currency mechanics, candlestick anatomy, liquidity sweeps, and mathematical position sizing with mandatory knowledge assessments.
      </p>

      {/* Learning Progress Hero */}
      <div className="panel-card" style={{ padding: '24px 28px', marginBottom: '36px', background: 'var(--bg-surface-1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)', textTransform: 'uppercase', marginBottom: '6px' }}>
              Sequential Learning Progression
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              30 Comprehensive Lessons Across 3 Tiers
            </h2>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Subsidized 100% free through our official JustMarkets partnership.
            </div>
          </div>
          <Link
            href="/academy/lesson-1"
            className="btn btn-gold"
            style={{ padding: '12px 24px', fontSize: '13.5px' }}
          >
            Start Lesson 01 &rarr;
          </Link>
        </div>
      </div>

      {/* 3 Level Tier Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div
          onClick={() => setSelectedLevel('beginner')}
          style={{
            background: selectedLevel === 'beginner' ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
            border: selectedLevel === 'beginner' ? '1px solid var(--accent-green)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="status-badge" style={{ background: 'rgba(25, 184, 120, 0.12)', color: 'var(--accent-green)', marginBottom: '10px' }}>
            TIER 1 &bull; FOUNDATIONS
          </span>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Forex Foundations
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            Currency pairs, bid/ask spreads, pip values, lot sizing, margin, leverage, and MT5 order types.
          </p>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>
            {beginnerCount} Lessons (Lessons 1&ndash;12)
          </div>
        </div>

        <div
          onClick={() => setSelectedLevel('intermediate')}
          style={{
            background: selectedLevel === 'intermediate' ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
            border: selectedLevel === 'intermediate' ? '1px solid var(--accent-gold)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="status-badge" style={{ background: 'rgba(230, 187, 89, 0.12)', color: 'var(--accent-gold)', marginBottom: '10px' }}>
            TIER 2 &bull; ANALYSIS
          </span>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Analysis &amp; Strategy
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            Candlestick anatomy, market structure, support/resistance, multi-timeframe analysis, and session liquidity.
          </p>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-gold)' }}>
            {intermediateCount} Lessons (Lessons 13&ndash;22)
          </div>
        </div>

        <div
          onClick={() => setSelectedLevel('advanced')}
          style={{
            background: selectedLevel === 'advanced' ? 'var(--bg-surface-3)' : 'var(--bg-surface-1)',
            border: selectedLevel === 'advanced' ? '1px solid var(--accent-red)' : '1px solid var(--border-default)',
            borderRadius: 'var(--radius-lg)',
            padding: '20px',
            cursor: 'pointer',
            transition: 'all 0.15s ease'
          }}
        >
          <span className="status-badge" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--accent-red)', marginBottom: '10px' }}>
            TIER 3 &bull; RISK &amp; EXECUTION
          </span>
          <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Institutional Risk
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
            Mathematical position sizing, asymmetric drawdowns, psychology, backtesting rigor, and XAUUSD mechanics.
          </p>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-red)' }}>
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
                color: selectedLevel === lvl ? '#080D18' : 'var(--text-secondary)',
                fontWeight: selectedLevel === lvl ? 700 : 500
              }}
            >
              {lvl.toUpperCase()} ({lvl === 'all' ? 30 : lvl === 'beginner' ? 12 : lvl === 'intermediate' ? 10 : 8})
            </button>
          ))}
        </div>
      </div>

      {/* 30 Lessons Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {filteredLessons.map((lesson) => (
          <div
            key={lesson.id}
            className="panel-card"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              marginBottom: 0
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span className="mono-nums" style={{ fontSize: '11px', color: 'var(--accent-gold)', fontWeight: 700 }}>
                  LESSON {lesson.globalNum < 10 ? `0${lesson.globalNum}` : lesson.globalNum}
                </span>
                <span className={`status-badge ${
                  lesson.level === 'beginner'
                    ? 'status-completed'
                    : lesson.level === 'intermediate'
                    ? 'status-warning'
                    : 'status-danger'
                }`}>
                  {lesson.level.toUpperCase()}
                </span>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px', lineHeight: 1.3 }}>
                {lesson.title}
              </h3>

              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.55, marginBottom: '16px' }}>
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
                Knowledge Quiz
              </span>
              <Link
                href={`/academy/lesson-${lesson.globalNum}`}
                className="btn btn-outline-gold"
                style={{ padding: '6px 14px', fontSize: '12px' }}
              >
                Study Lesson &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Subsidized Footnote */}
      <div style={{
        marginTop: '48px',
        background: 'var(--bg-surface-1)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-lg)',
        padding: '24px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '14px', color: 'var(--text-primary)', fontWeight: 600, marginBottom: '4px' }}>
          Lifetime Subsidized Forex Education
        </div>
        <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 16px' }}>
          Zero paywalls, zero subscription fees. All 30 lessons and knowledge assessments are sponsored directly by JustMarkets under partner code <strong>{DEFAULT_PARTNER_CONFIG.primaryCode}</strong>.
        </div>
        <a
          href={DEFAULT_PARTNER_CONFIG.primaryLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-gold"
          style={{ fontSize: '12px' }}
        >
          Open JustMarkets Partner MT5 Account &rarr;
        </a>
      </div>
    </div>
  );
}

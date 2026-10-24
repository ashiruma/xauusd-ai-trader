'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import CourseSchema from '@/components/CourseSchema';
import { getAllLessons } from '@/lib/curriculum';
import { COURSE_PROGRESS_CHANGED_EVENT, COURSE_PROGRESS_STORAGE_KEY, nextCourseLesson, parseCourseProgress } from '@/lib/courseProgress';
import { DEFAULT_PARTNER_CONFIG } from '@/lib/partner';

export default function AcademyPage() {
  const [selectedLevel, setSelectedLevel] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const allLessons = useMemo(() => getAllLessons(), []);

  useEffect(() => {
    try {
      setCompletedLessons(parseCourseProgress(localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY)));
    } catch {
      // ignore
    }
    const refreshProgress = () => setCompletedLessons(parseCourseProgress(localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY)));
    window.addEventListener(COURSE_PROGRESS_CHANGED_EVENT, refreshProgress);
    return () => window.removeEventListener(COURSE_PROGRESS_CHANGED_EVENT, refreshProgress);
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
  const firstIncompleteLesson = useMemo(() => nextCourseLesson(completedLessons, totalLessons), [completedLessons, totalLessons]);
  const courseComplete = firstIncompleteLesson > totalLessons;

  return (
    <div className="herbaria-page" style={{ minHeight: '100vh', padding: '48px 24px 96px', borderTop: '1px solid var(--hb-hairline-amber)' }}>
      <CourseSchema />

      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Navigation / Breadcrumb */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid var(--hb-hairline-amber)', paddingBottom: '16px' }}>
          <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--hb-accent-amber)' }}>
            <Link href="/" style={{ color: 'var(--hb-text-cream)', textDecoration: 'none' }}>VELARION</Link>
            <span style={{ margin: '0 8px', color: 'var(--hb-hairline-amber)' }}>/</span>
            <span style={{ color: 'var(--hb-accent-citron)' }}>FOREX SCHOOL CURRICULUM</span>
          </div>
          <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--hb-accent-vermillion)' }}>
            CURRICULUM SPECIMEN FOLIO
          </div>
        </div>

        {/* Section 01: Hero Header */}
        <header style={{ marginBottom: '56px' }}>
          <div className="herbaria-plate-kicker">
            <span>&sect; 01</span>
            <span style={{ color: 'var(--hb-accent-amber)' }}>/</span>
            <span>EVIDENCE-BASED TRADING ACADEMY</span>
          </div>

          <h1 className="herbaria-title">
            Forex School: The 30-Lesson Quantitative Curriculum
          </h1>

          <div className="herbaria-italic-quote">
            &ldquo;A progressive, evidence-based syllabus engineered to build systematic execution discipline from first principles &mdash; subsidized through our official Introducing Broker partnership.&rdquo;
          </div>

          <p style={{ fontSize: '16px', lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: '820px', marginBottom: '32px' }}>
            Lessons 1 through 5 are open for instant public study. Lessons 6 through 30 carry no platform subscription fee when verified with our official Introducing Broker partner, JustMarkets. Non-custodial MT5 execution with disciplined risk sizing.
          </p>
        </header>

        {/* Section 02: Progress Dossier (Plate II) */}
        <section style={{
          border: '1px solid var(--hb-hairline-citron)',
          backgroundColor: 'var(--hb-bg-primary)',
          padding: '36px 32px',
          marginBottom: '56px',
          borderRadius: 0,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10px', letterSpacing: '0.25em', color: 'var(--hb-accent-citron)', textTransform: 'uppercase', marginBottom: '8px' }}>
                &sect; 02 / CURRICULUM PROGRESS TRACKER
              </div>
              <h2 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '26px', color: 'var(--text-primary)', margin: '0 0 6px', fontWeight: 400 }}>
                {passedCount} of {totalLessons} Units Certified ({progressPercent}%)
              </h2>
              <div style={{ fontSize: '13.5px', color: 'var(--text-secondary)' }}>
                Fully subsidized through JustMarkets IB partner code <strong style={{ color: 'var(--hb-accent-citron)', fontFamily: 'var(--font-herbaria-mono)' }}>tohstb0d83</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link
                href={courseComplete ? '/academy' : `/academy/lesson-${firstIncompleteLesson}`}
                className="herbaria-btn-citron"
              >
                {courseComplete ? 'Curriculum Complete' : passedCount > 0 ? `Resume Lesson ${String(firstIncompleteLesson).padStart(2, '0')}` : 'Begin Lesson 01 (Public)'} &rarr;
              </Link>
              <Link
                href="/onboarding"
                className="herbaria-btn-secondary"
              >
                Unlock Gated Modules &rarr;
              </Link>
            </div>
          </div>

          {/* Sharp Progress Bar */}
          <div
            role="progressbar"
            aria-label="Course progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
            style={{
              width: '100%',
              height: '8px',
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--hb-hairline-amber)',
              borderRadius: 0,
              overflow: 'hidden'
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: '100%',
                background: 'var(--hb-accent-citron)',
                transition: 'width 0.4s ease'
              }}
            />
          </div>
        </section>

        {/* Section 03: Three-Tier Specimen Triptych (Plate III) */}
        <section style={{ marginBottom: '56px' }}>
          <div className="herbaria-plate-kicker">
            <span>&sect; 03</span>
            <span style={{ color: 'var(--hb-accent-amber)' }}>/</span>
            <span>THREE CURRICULUM TIERS</span>
          </div>

          <div className="herbaria-triptych">
            {/* Tier 1: Foundations */}
            <div
              onClick={() => setSelectedLevel('beginner')}
              className={`herbaria-triptych-col ${selectedLevel === 'beginner' ? 'herbaria-panel-green' : 'herbaria-panel-dark'}`}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="herbaria-badge-sharp" style={{ background: 'var(--accent-gold-subtle)', color: 'var(--accent-gold)', border: '1px solid var(--border-accent)' }}>
                  TIER 1
                </span>
                <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: 'var(--accent-gold)' }}>
                  FOUNDATIONS
                </span>
              </div>

              <div className="herbaria-numeral" style={{ marginBottom: '10px' }}>
                {beginnerCount} Units
              </div>

              <h3 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '22px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                Forex Foundations
              </h3>

              <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)', flex: 1, margin: '0 0 16px' }}>
                Currency pairs, bid/ask spreads, pip values, lot sizing, margin, leverage, and MT5 order types. Lessons 1&ndash;5 are open for instant public study.
              </p>

              <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: 'var(--accent-gold)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Lessons 01&ndash;12 / Foundational
              </div>
            </div>

            {/* Tier 2: Dynamics */}
            <div
              onClick={() => setSelectedLevel('intermediate')}
              className={`herbaria-triptych-col ${selectedLevel === 'intermediate' ? 'herbaria-panel-cream' : 'herbaria-panel-dark'}`}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="herbaria-badge-sharp" style={{ background: 'rgba(56, 189, 248, 0.14)', color: '#38BDF8', border: '1px solid rgba(56, 189, 248, 0.35)' }}>
                  TIER 2
                </span>
                <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: 'var(--accent-gold)' }}>
                  DYNAMICS
                </span>
              </div>

              <div className="herbaria-numeral" style={{ color: 'var(--accent-gold)', marginBottom: '10px' }}>
                {intermediateCount} Units
              </div>

              <h3 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '22px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                Analysis &amp; Market Structure
              </h3>

              <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)', flex: 1, margin: '0 0 16px' }}>
                Candlestick anatomy, market structure, support/resistance, multi-timeframe analysis, and session liquidity windows.
              </p>

              <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: 'var(--accent-gold)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Lessons 13&ndash;22 / Gated by IB Link
              </div>
            </div>

            {/* Tier 3: Institutional */}
            <div
              onClick={() => setSelectedLevel('advanced')}
              className={`herbaria-triptych-col ${selectedLevel === 'advanced' ? 'herbaria-panel-green' : 'herbaria-panel-dark'}`}
              style={{ cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="herbaria-badge-sharp" style={{ background: 'var(--accent-green-subtle)', color: 'var(--accent-green)', border: '1px solid var(--accent-green-border)' }}>
                  TIER 3
                </span>
                <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: 'var(--accent-gold)' }}>
                  INSTITUTIONAL
                </span>
              </div>

              <div className="herbaria-numeral" style={{ marginBottom: '10px' }}>
                {advancedCount} Units
              </div>

              <h3 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '22px', fontWeight: 500, color: 'var(--text-primary)', margin: '0 0 10px' }}>
                Asymmetric Risk &amp; Strategy
              </h3>

              <p style={{ fontSize: '13.5px', lineHeight: 1.6, color: 'var(--text-secondary)', flex: 1, margin: '0 0 16px' }}>
                Mathematical position sizing, asymmetric drawdown mechanics, execution psychology, backtesting rigor, and XAUUSD mechanics.
              </p>

              <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: 'var(--accent-gold)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Lessons 23&ndash;30 / Master Quantitative
              </div>
            </div>
          </div>
        </section>

        {/* Section 04: Filter Bar & Catalog (Plate IV) */}
        <section style={{ marginBottom: '72px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px', borderBottom: '1px solid var(--hb-hairline-amber)', paddingBottom: '16px' }}>
            <div className="herbaria-plate-kicker" style={{ margin: 0 }}>
              <span>&sect; 04</span>
              <span style={{ color: 'var(--hb-accent-amber)' }}>/</span>
              <span>CURRICULUM SPECIMEN CATALOG ({filteredLessons.length} UNITS)</span>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedLevel(lvl)}
                  style={{
                    fontFamily: 'var(--font-herbaria-mono)',
                    fontSize: '11px',
                    fontWeight: 600,
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    padding: '8px 16px',
                    borderRadius: 0,
                    border: '1px solid',
                    borderColor: selectedLevel === lvl ? 'var(--hb-accent-citron)' : 'var(--hb-hairline-amber)',
                    backgroundColor: selectedLevel === lvl ? 'var(--hb-accent-citron)' : 'transparent',
                    color: selectedLevel === lvl ? '#f7f7f0' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {lvl === 'all' ? 'ALL MODULES' : lvl.toUpperCase()} ({lvl === 'all' ? 30 : lvl === 'beginner' ? 12 : lvl === 'intermediate' ? 10 : 8})
                </button>
              ))}
            </div>
          </div>

          {/* 30 Lesson Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
            {filteredLessons.map((lesson) => {
              const isCompleted = completedLessons.includes(lesson.globalNum);
              const wordCount = lesson.content ? lesson.content.split(/\s+/).length : 500;
              const estReadingTime = `${Math.max(3, Math.ceil(wordCount / 180))} min read`;
              const isPublic = lesson.globalNum <= 5;
              const isSequenceLocked = lesson.globalNum > firstIncompleteLesson;

              let statusBadge = (
                <span className="herbaria-badge-sharp" style={{ background: 'rgba(234, 177, 103, 0.12)', color: 'var(--hb-accent-citron)', border: '1px solid rgba(234, 177, 103, 0.3)' }}>
                  PARTNER SUBSIDIZED
                </span>
              );

              if (isCompleted) {
                statusBadge = (
                  <span className="herbaria-badge-sharp" style={{ background: 'rgba(200, 212, 0, 0.2)', color: 'var(--hb-accent-citron)', border: '1px solid var(--hb-accent-citron)' }}>
                    PASSED
                  </span>
                );
              } else if (isSequenceLocked) {
                statusBadge = (
                  <span className="herbaria-badge-sharp" style={{ background: 'var(--bg-surface-2)', color: 'var(--text-muted)', border: '1px solid var(--border-subtle)' }}>
                    LOCKED - PASS PRIOR UNIT
                  </span>
                );
              } else if (lesson.globalNum === firstIncompleteLesson) {
                statusBadge = (
                  <span className="herbaria-badge-sharp" style={{ background: 'var(--accent-gold-subtle)', color: 'var(--hb-accent-citron)', border: '1px solid var(--hb-accent-citron)' }}>
                    NEXT IN SEQUENCE
                  </span>
                );
              } else if (isPublic) {
                statusBadge = (
                  <span className="herbaria-badge-sharp" style={{ background: 'var(--bg-surface-1)', color: 'var(--text-primary)', border: '1px solid var(--hb-hairline-cream)' }}>
                    PUBLIC ACCESS
                  </span>
                );
              }

              return (
                <article
                  key={lesson.id}
                  style={{
                    backgroundColor: 'var(--hb-bg-dark-card)',
                    border: '1px solid var(--hb-hairline-amber)',
                    borderRadius: 0,
                    padding: '24px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'border-color 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--hb-accent-citron)')}
                  onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--hb-hairline-amber)')}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px dotted var(--hb-hairline-amber)', paddingBottom: '10px' }}>
                      <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '11px', color: 'var(--hb-accent-citron)', fontWeight: 700 }}>
                        &sect; {lesson.globalNum < 10 ? `0${lesson.globalNum}` : lesson.globalNum}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                          {estReadingTime}
                        </span>
                        {statusBadge}
                      </div>
                    </div>

                    <h3 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '18px', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 10px', lineHeight: 1.3 }}>
                      {lesson.title}
                    </h3>

                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '20px' }}>
                      {lesson.summary}
                    </p>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '14px',
                    borderTop: '1px solid var(--hb-hairline-amber)'
                  }}>
                    <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10.5px', color: 'var(--hb-accent-amber)', textTransform: 'uppercase' }}>
                      Tier {lesson.level === 'beginner' ? '1 Foundations' : lesson.level === 'intermediate' ? '2 Dynamics' : '3 Asymmetric'}
                    </span>

                    {isSequenceLocked ? (
                      <span style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10.5px', color: 'var(--text-muted)' }}>
                        Unlock via Unit {firstIncompleteLesson}
                      </span>
                    ) : (
                      <Link
                        href={`/academy/lesson-${lesson.globalNum}`}
                        style={{
                          fontFamily: 'var(--font-herbaria-mono)',
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '0.15em',
                          textTransform: 'uppercase',
                          textDecoration: 'none',
                          color: '#f7f7f0',
                          backgroundColor: 'var(--hb-accent-citron)',
                          padding: '6px 14px',
                          borderRadius: 0,
                          transition: 'background 0.2s ease'
                        }}
                      >
                        {isCompleted ? 'Review Unit' : isPublic ? 'Study (Public)' : 'Study Unit'} &rarr;
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* Section 05: Subsidized Footnote & IB Verification */}
        <section style={{
          border: '1px solid var(--hb-hairline-amber)',
          backgroundColor: 'var(--hb-bg-primary)',
          borderRadius: 0,
          padding: '36px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '24px'
        }}>
          <div style={{ maxWidth: '640px' }}>
            <div style={{ fontFamily: 'var(--font-herbaria-mono)', fontSize: '10px', letterSpacing: '0.25em', color: 'var(--hb-accent-citron)', textTransform: 'uppercase', marginBottom: '8px' }}>
              &sect; 05 / LIFETIME SPONSORED TRADING EDUCATION
            </div>
            <h3 style={{ fontFamily: 'var(--font-herbaria-display)', fontSize: '24px', color: 'var(--text-primary)', margin: '0 0 10px', fontWeight: 400 }}>
              Zero Subscription Fees &mdash; Subsidized by JustMarkets
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
              Units 1 through 5 are open for instant public study. Units 6 through 30 carry no subscription fees when verified under our JustMarkets Introducing Broker partner agreement (code tohstb0d83).
            </p>
          </div>

          <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
            <Link
              href="/onboarding"
              className="herbaria-btn-citron"
            >
              Unlock Full Curriculum &rarr;
            </Link>
            <a
              href={DEFAULT_PARTNER_CONFIG.primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              className="herbaria-btn-secondary"
            >
              Create an account &rarr;
            </a>
          </div>
        </section>

      </div>
    </div>
  );
}

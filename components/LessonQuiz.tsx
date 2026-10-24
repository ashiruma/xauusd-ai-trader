'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QuizQuestion } from '@/lib/curriculum';
import {
  COURSE_PROGRESS_STORAGE_KEY,
  parseCourseProgress,
  saveCourseProgress,
} from '@/lib/courseProgress';

interface LessonQuizProps {
  lessonId: string;
  globalNum: number;
  quiz: QuizQuestion | QuizQuestion[];
  nextLessonNum?: number | null;
}

export default function LessonQuiz({
  lessonId: _lessonId,
  globalNum,
  quiz,
  nextLessonNum,
}: LessonQuizProps) {
  const quizList: QuizQuestion[] = Array.isArray(quiz) ? quiz : (quiz ? [quiz] : []);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [assessmentFailed, setAssessmentFailed] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState<boolean>(false);
  const [showGraduationModal, setShowGraduationModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState(false);
  const [isPassed, setIsPassed] = useState(false);

  // Load completion state from server API & fallback to local storage
  useEffect(() => {
    let mounted = true;

    try {
      const local = parseCourseProgress(localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY));
      if (local.length > 0 && mounted) {
        setCompletedLessons(local);
        if (local.includes(globalNum)) {
          setIsPassed(true);
        }
      }
    } catch {
      // ignore
    }

    fetch('/api/school/progress')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!mounted || !data) return;
        const completed: number[] = Array.isArray(data.completedLessons) ? data.completedLessons : [];
        if (completed.length > 0) {
          setCompletedLessons(completed);
          saveCourseProgress(completed);
          if (completed.includes(globalNum)) {
            setIsPassed(true);
          }
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [globalNum]);

  if (quizList.length === 0) {
    return null;
  }

  // Count how many of Foundation Track (Lessons 1-5) are completed
  const foundationCompletedCount = [1, 2, 3, 4, 5].filter((num) => completedLessons.includes(num)).length;

  const handleSelect = async (qIdx: number, optIdx: number) => {
    if (assessmentFailed || isPassed || submitting) return;

    const updated = { ...selectedAnswers, [qIdx]: optIdx };
    setSelectedAnswers(updated);

    // If all questions in this assessment have been answered, submit to server for grading
    if (Object.keys(updated).length === quizList.length) {
      setSubmitting(true);
      try {
        const res = await fetch('/api/school/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            lessonId: globalNum,
            answers: updated,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (res.ok && data.passed) {
          setIsPassed(true);
          const nextCompleted = Array.from(new Set([...completedLessons, globalNum, ...(data.completedLessons || [])])).sort((a, b) => a - b);
          setCompletedLessons(nextCompleted);
          saveCourseProgress(nextCompleted);

          if (globalNum === 2) {
            setTimeout(() => setShowLinkModal(true), 600);
          } else if (globalNum === 5) {
            setTimeout(() => setShowGraduationModal(true), 600);
          }
        } else {
          setAssessmentFailed(true);
        }
      } catch {
        setAssessmentFailed(true);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setAssessmentFailed(false);
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isComplete = answeredCount === quizList.length || isPassed;
  const correctCount = isPassed ? quizList.length : 0;

  return (
    <>
      <div className="lesson-quiz" style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xs, 2px)',
        padding: '28px 24px',
        marginTop: '36px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
      }}>
        {/* Progress Tracker Bar */}
        <div className="lesson-quiz-progress" style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xs, 2px)',
          padding: '12px 16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span className="lesson-quiz-progress-primary" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>
              Foundation Track: {foundationCompletedCount} of 5 Lessons Completed
            </span>
            <span className="lesson-quiz-progress-secondary" style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
              Institutional Track: Lessons 6&ndash;30 (Live JustMarkets Funded)
            </span>
          </div>

          <div className="lesson-quiz-progress-track" style={{ width: '100%', height: '6px', background: 'var(--bg-surface-3)', borderRadius: 'var(--radius-xs, 2px)', overflow: 'hidden', display: 'flex' }}>
            <div
              className="lesson-quiz-progress-foundation"
              style={{
                width: `${Math.min(100, (foundationCompletedCount / 5) * 100 * (5 / 30))}%`,
                height: '100%',
                background: 'var(--accent-green)',
                transition: 'width 0.4s ease'
              }}
            />
            <div
              className="lesson-quiz-progress-sponsored"
              style={{
                width: `${(25 / 30) * 100}%`,
                height: '100%',
                background: 'var(--accent-gold-subtle)',
                marginLeft: '2px'
              }}
            />
          </div>
        </div>

        {/* Assessment Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span className="lesson-quiz-kicker" style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: 'var(--accent-gold)', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', padding: '2px 8px', borderRadius: 'var(--radius-xs, 2px)' }}>
              MICRO-ASSESSMENT / {quizList.length} QUESTIONS
            </span>
            <h3 className="lesson-quiz-title" style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: '8px 0 0' }}>
              Lesson {globalNum} Comprehension Check
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--text-muted)' }}>
              {assessmentFailed ? 'Requires review' : isPassed ? `Score: ${correctCount} / ${quizList.length}` : `Answered: ${answeredCount} / ${quizList.length}`}
            </span>
            {isPassed && (
              <span className="status-badge status-completed">
                PASSED
              </span>
            )}
          </div>
        </div>

        <p className="lesson-quiz-intro" style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px', lineHeight: 1.5 }}>
          Pass all comprehension questions to verify your understanding and log this lesson in your curriculum tracker.
        </p>

        {assessmentFailed ? (
          <div className="course-reset-notice" role="status" style={{
            background: 'var(--bg-surface-2)',
            border: '1px solid var(--accent-red-border, rgba(239, 68, 68, 0.4))',
            borderRadius: 'var(--radius-xs, 2px)',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <strong style={{ color: 'var(--accent-red, #ef4444)', display: 'block', marginBottom: '6px' }}>
              Assessment Incomplete &bull; 100% Mastery Required
            </strong>
            <p style={{ margin: '0 0 16px', fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              One or more answers did not meet the institutional comprehension threshold. Review the lesson concepts above and retry the assessment.
            </p>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleRetry}
              style={{ fontSize: '13px', padding: '8px 18px' }}
            >
              Retry Assessment &rarr;
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
            {quizList.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              const hasAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={qIdx}
                  className="lesson-quiz-question"
                  style={{
                    background: 'var(--bg-surface-2)',
                    border: isPassed ? '1px solid var(--accent-green-border)' : hasAnswered ? '1px solid var(--border-accent)' : '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xs, 2px)',
                    padding: '18px 20px',
                    transition: 'border-color 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                    <div className="lesson-quiz-prompt" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                      <span className="lesson-quiz-question-number" style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono, monospace)', marginRight: '6px' }}>
                        0{qIdx + 1}.
                      </span>
                      {q.question}
                    </div>

                    {isPassed && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono, monospace)',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-xs, 2px)',
                          flexShrink: 0,
                          background: 'var(--accent-green-subtle)',
                          color: 'var(--accent-green)',
                          border: '1px solid var(--accent-green-border)'
                        }}
                      >
                        VERIFIED
                      </span>
                    )}
                  </div>

                  {/* Options */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;

                      let bg = 'var(--bg-surface-1)';
                      let border = 'var(--border-default)';
                      let color = 'var(--text-secondary)';
                      let markerBg = 'var(--bg-surface-3)';
                      let markerColor = 'var(--text-muted)';

                      if (isPassed && isSelected) {
                        bg = 'var(--accent-green-subtle)';
                        border = 'var(--accent-green)';
                        color = 'var(--text-primary)';
                        markerBg = 'var(--accent-green)';
                        markerColor = '#ffffff';
                      } else if (hasAnswered && isSelected) {
                        bg = 'var(--accent-gold-subtle)';
                        border = 'var(--border-accent)';
                        color = 'var(--text-primary)';
                        markerBg = 'var(--accent-gold)';
                        markerColor = '#0c241a';
                      }

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          className={`lesson-quiz-option ${isPassed && isSelected ? 'correct' : hasAnswered && isSelected ? 'selected' : ''}`}
                          onClick={() => handleSelect(qIdx, optIdx)}
                          disabled={hasAnswered || assessmentFailed || isPassed}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '11px 14px',
                            borderRadius: 'var(--radius-xs, 2px)',
                            background: bg,
                            border: `1px solid ${border}`,
                            color,
                            textAlign: 'left',
                            cursor: hasAnswered || assessmentFailed || isPassed ? 'default' : 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.15s ease',
                            width: '100%'
                          }}
                        >
                          <span className="lesson-quiz-option-marker"
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: 'var(--radius-xs, 2px)',
                              background: markerBg,
                              color: markerColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
                              fontFamily: 'var(--font-mono, monospace)',
                              flexShrink: 0
                            }}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span style={{ lineHeight: 1.45, flex: 1 }}>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Institutional Explanation */}
                  {isPassed && q.explanation && (
                    <div
                      className="lesson-quiz-explanation"
                      style={{
                        marginTop: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-xs, 2px)',
                        fontSize: '12px',
                        lineHeight: 1.5,
                        background: 'var(--accent-green-subtle)',
                        borderLeft: '3px solid var(--accent-green)',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <strong style={{ color: 'var(--accent-green)', marginRight: '6px' }}>
                        Institutional Context:
                      </strong>
                      {q.explanation}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Controls */}
        <div className="lesson-quiz-controls" style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid var(--border-default)', paddingTop: '18px' }}>
          <div>
            {!isComplete ? (
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Select answers for all {quizList.length} questions to complete Lesson {globalNum}.
              </span>
            ) : isPassed ? (
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)' }}>
                Comprehension verified. Lesson {globalNum} logged in curriculum tracker.
              </span>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {isPassed && globalNum === 2 && (
              <button
                type="button"
                onClick={() => setShowLinkModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '9px 20px' }}
              >
                Milestone 1: Link Account &rarr;
              </button>
            )}

            {isPassed && globalNum === 5 && (
              <button
                type="button"
                onClick={() => setShowGraduationModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '9px 20px' }}
              >
                Milestone 2: Activate Live Account &rarr;
              </button>
            )}

            {isPassed && globalNum !== 2 && globalNum !== 5 && nextLessonNum && (
              <Link
                href={`/academy/lesson-${nextLessonNum}`}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '9px 20px' }}
              >
                Proceed to Lesson {nextLessonNum} &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MILESTONE 1 MODAL (AFTER LESSON 2: LINK JUSTMARKETS ACCOUNT)   */}
      {/* ============================================================== */}
      {showLinkModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowLinkModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 7, 13, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="milestone-1-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '580px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-accent, #e1c47c)',
              borderRadius: 'var(--radius-xs, 2px)',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowLinkModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Close dialog"
            >
              &times;
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(56, 189, 248, 0.12)', border: '1px solid rgba(56, 189, 248, 0.35)', borderRadius: 'var(--radius-xs, 2px)', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#38bdf8', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                MILESTONE 1 / ACCOUNT LINKING CHECKPOINT
              </span>
            </div>

            <h2 id="milestone-1-title" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
              Lesson 2 Passed: Connect JustMarkets Account
            </h2>

            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>
              You have completed the foundational market structure. To unlock <strong>Lessons 3, 4, and 5</strong> (covering Fair Value Gaps, Institutional Order Blocks, and Asymmetric Risk), connect your free JustMarkets MT5 account. Subsidized 100% free under official partner code <strong style={{ color: 'var(--accent-gold)' }}>tohstb0d83</strong>.
            </p>

            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs, 2px)',
              padding: '16px 20px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>[+]</span>
                <span>Unlocks Lessons 3, 4, and 5 instantly</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>[+]</span>
                <span>Zero master passwords requested &bull; Non-custodial least privilege</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800 }}>[+]</span>
                <span>No fee &bull; Fully partner subsidized</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/accounts?redirect=/academy/lesson-3"
                className="btn btn-primary"
                style={{ padding: '13px 24px', fontSize: '14px', fontWeight: 700 }}
              >
                Link MT5 Account ID &rarr;
              </Link>
              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline-gold"
                style={{ padding: '11px 20px', fontSize: '13px' }}
              >
                Need an account? Open Free JustMarkets MT5 &rarr;
              </a>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MILESTONE 2 MODAL (AFTER LESSON 5: MIN. $50 LIVE DEPOSIT)      */}
      {/* ============================================================== */}
      {showGraduationModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowGraduationModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(4, 7, 13, 0.85)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="milestone-2-title"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '620px',
              width: '100%',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-accent, #e1c47c)',
              borderRadius: 'var(--radius-xs, 2px)',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
              position: 'relative'
            }}
          >
            <button
              onClick={() => setShowGraduationModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Close dialog"
            >
              &times;
            </button>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'var(--accent-gold-subtle)', border: '1px solid var(--border-accent)', borderRadius: 'var(--radius-xs, 2px)', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-gold)', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                MILESTONE 2 / MIN. USD 50 LIVE DEPOSIT REQUIRED
              </span>
            </div>

            <h2 id="milestone-2-title" style={{ fontSize: '25px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '14px', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
              Foundation Track Complete: Activate Live Trading Floor
            </h2>

            <p style={{ fontSize: '14.5px', color: 'var(--text-secondary)', lineHeight: 1.65, marginBottom: '20px' }}>
              You have mastered the foundations. To maintain execution discipline and access <strong>Lessons 6 to 30</strong> plus the <strong>Live Autonomous XAUUSD AI Terminal</strong>, make a deposit of at least <strong>USD 50</strong> into your live JustMarkets account.
            </p>

            {/* 4 Compelling Value Drivers */}
            <div style={{
              background: 'var(--bg-surface-2)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xs, 2px)',
              padding: '18px 20px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              display: 'grid',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                <span><strong>Live Autonomous AI Signals</strong>: Real-time London &amp; NY Overlap breakout triggers streamed directly to your terminal.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                <span><strong>Institutional Order Flow Blotter</strong>: Live detection of Smart Money liquidity sweeps, order blocks, and fair value gaps.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: 'var(--accent-gold)', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                <span><strong>Complete 30-Lesson Syllabus</strong>: Full access to the 200-Pip Growth Matrix and multi-agent confluence setups.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                <span style={{ color: '#10B981', fontWeight: 800, flexShrink: 0 }}>[+]</span>
                <span><strong>100% Capital Custody</strong>: Zero subscription fees. Your USD 50 stays in your regulated JustMarkets MT5 account to trade or withdraw anytime.</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '13px 24px', fontSize: '14px', fontWeight: 700 }}
              >
                Deposit Minimum USD 50 on JustMarkets &rarr;
              </a>

              <Link
                href="/accounts?redirect=/academy/lesson-6"
                className="btn btn-outline-gold"
                style={{ padding: '11px 20px', fontSize: '13px' }}
              >
                Already Funded? Verify MT5 Account ID &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QuizQuestion } from '@/lib/curriculum';

interface LessonQuizProps {
  lessonId: string;
  globalNum: number;
  quiz: QuizQuestion | QuizQuestion[];
  nextLessonNum?: number | null;
}

export default function LessonQuiz({
  globalNum,
  quiz,
  nextLessonNum
}: LessonQuizProps) {
  const quizList: QuizQuestion[] = Array.isArray(quiz) ? quiz : (quiz ? [quiz] : []);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [hasEvaluated, setHasEvaluated] = useState<boolean>(false);
  const [isPassed, setIsPassed] = useState<boolean>(false);
  const [showGraduationModal, setShowGraduationModal] = useState<boolean>(false);

  // Load completion state from localStorage or cookie
  useEffect(() => {
    try {
      const stored = localStorage.getItem('velarion_completed_lessons');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCompletedLessons(parsed);
        if (parsed.includes(`lesson-${globalNum}`)) {
          setIsPassed(true);
        }
      }
    } catch {
      // ignore
    }
  }, [globalNum]);

  if (quizList.length === 0) {
    return null;
  }

  // Count foundation lessons completed (1-5)
  const foundationCompletedCount = [1, 2, 3, 4, 5].filter((num) =>
    completedLessons.includes(`lesson-${num}`) || completedLessons.includes(String(num))
  ).length;

  // Handle option selection without revealing correctness
  const handleSelect = (qIdx: number, optIdx: number) => {
    if (isPassed) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [qIdx]: optIdx
    }));
    // Reset evaluated state if user changes any selection
    if (hasEvaluated) {
      setHasEvaluated(false);
    }
  };

  const answeredCount = Object.keys(selectedAnswers).length;
  const isAllAnswered = answeredCount === quizList.length;

  // Check answers on explicit submission
  const handleSubmitAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAllAnswered) return;

    // Check if every answer matches the target without revealing which failed
    const allCorrect = quizList.every((q, idx) => {
      const target = q.correct !== undefined ? q.correct : (q as unknown as { correctAnswer: number }).correctAnswer;
      return selectedAnswers[idx] === target;
    });

    setHasEvaluated(true);

    if (allCorrect) {
      setIsPassed(true);
      try {
        const stored: string[] = JSON.parse(localStorage.getItem('velarion_completed_lessons') || '[]');
        const key = `lesson-${globalNum}`;
        if (!stored.includes(key)) {
          stored.push(key);
          localStorage.setItem('velarion_completed_lessons', JSON.stringify(stored));
          setCompletedLessons(stored);
        }

        // Persist cookie for server-side Next.js route gating
        document.cookie = `velarion_completed_lessons=${encodeURIComponent(JSON.stringify(stored))}; path=/; max-age=31536000; SameSite=Lax`;
        window.dispatchEvent(new CustomEvent('lesson_passed', { detail: { lessonNum: globalNum } }));

        if (globalNum === 5) {
          setTimeout(() => {
            setShowGraduationModal(true);
          }, 500);
        }
      } catch {
        // ignore
      }
    } else {
      setIsPassed(false);
    }
  };

  // Reset course to beginning and require review before retrying
  const handleResetCourseAndRetry = () => {
    setSelectedAnswers({});
    setHasEvaluated(false);
    setIsPassed(false);
    // Smooth scroll learner back to top of lesson content
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <>
      <div style={{
        background: 'var(--bg-surface-1)',
        border: '1.5px solid var(--border-default)',
        borderRadius: '12px',
        padding: '28px 24px',
        marginTop: '36px',
        boxShadow: '0 4px 16px rgba(15, 23, 42, 0.05)'
      }}>
        {/* Progress Tracker Bar */}
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>
              Required Foundation Track: {foundationCompletedCount} of 5 Lessons Completed
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)' }}>
              Lessons 6&ndash;30 &bull; Institutional Modules (JustMarkets Verified Access)
            </span>
          </div>

          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-3)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
            <div
              style={{
                width: `${Math.min(100, (foundationCompletedCount / 5) * 100 * (5 / 30))}%`,
                height: '100%',
                background: 'var(--accent-green)',
                transition: 'width 0.4s ease'
              }}
            />
            <div
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div>
            <span className="section-eyebrow" style={{ fontSize: '11px' }}>
              Micro-Assessment &bull; 3 Questions
            </span>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)', margin: '4px 0 0' }}>
              Lesson {globalNum} Comprehension Check
            </h3>
          </div>

          <div>
            {isPassed ? (
              <span className="status-badge status-completed">
                100% PASSED &bull; UNLOCKED
              </span>
            ) : (
              <span className="status-badge status-warning">
                REQUIRED FOR PROGRESSION
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '22px', lineHeight: 1.55 }}>
          Select the most accurate response for each question. To preserve educational rigor and prevent speculative guessing, individual questions will not reveal answer keys. All 3 questions must be answered correctly to advance.
        </p>

        {/* Failed Assessment Remediation Banner */}
        {hasEvaluated && !isPassed && (
          <div style={{
            background: 'var(--accent-red-subtle)',
            border: '1px solid var(--accent-red-border)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-red)', marginBottom: '4px' }}>
              Comprehension Check Incomplete
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>
              One or more responses did not meet the required 100% standard. In accordance with risk management training standards, answer keys are not exposed. Please review the lesson content from the beginning to reinforce core concepts, then retake the assessment.
            </p>
            <div style={{ marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleResetCourseAndRetry}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '7px 14px' }}
              >
                Review Lesson From Start &amp; Retake &uarr;
              </button>
            </div>
          </div>
        )}

        {/* Passed Assessment Banner */}
        {isPassed && (
          <div style={{
            background: 'var(--accent-green-subtle)',
            border: '1px solid var(--accent-green-border)',
            borderRadius: '8px',
            padding: '16px 20px',
            marginBottom: '24px'
          }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-green)', marginBottom: '4px' }}>
              Comprehension Verified (100% Score)
            </div>
            <p style={{ fontSize: '12.5px', color: 'var(--text-primary)', lineHeight: 1.55, margin: 0 }}>
              You have demonstrated conceptual understanding of Lesson {globalNum}. This milestone has been verified in your curriculum record.
            </p>
          </div>
        )}

        {/* Question Form */}
        <form onSubmit={handleSubmitAssessment}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {quizList.map((q, qIdx) => {
              const selectedOpt = selectedAnswers[qIdx];
              const isSelected = selectedOpt !== undefined;

              return (
                <div
                  key={qIdx}
                  style={{
                    background: 'var(--bg-surface-1)',
                    border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-default)',
                    borderRadius: '8px',
                    padding: '18px 20px',
                    transition: 'border-color 0.15s ease'
                  }}
                >
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45, marginBottom: '14px' }}>
                    <span className="mono-nums" style={{ color: 'var(--accent-gold)', marginRight: '6px' }}>
                      0{qIdx + 1}.
                    </span>
                    {q.question}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isOptionChosen = selectedOpt === optIdx;

                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelect(qIdx, optIdx)}
                          disabled={isPassed}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            background: isOptionChosen ? 'var(--accent-gold-subtle)' : 'var(--bg-base)',
                            border: isOptionChosen ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
                            color: 'var(--text-primary)',
                            textAlign: 'left',
                            cursor: isPassed ? 'default' : 'pointer',
                            fontSize: '13px',
                            transition: 'all 0.15s ease',
                            width: '100%'
                          }}
                        >
                          <span
                            className="mono-nums"
                            style={{
                              width: '22px',
                              height: '22px',
                              borderRadius: '4px',
                              background: isOptionChosen ? 'var(--accent-gold)' : 'var(--bg-surface-2)',
                              color: isOptionChosen ? '#FFFFFF' : 'var(--text-secondary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '11px',
                              fontWeight: 700,
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
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '18px'
          }}>
            <div>
              {!isPassed && (
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {answeredCount} of {quizList.length} questions answered
                </span>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {!isPassed && (
                <button
                  type="submit"
                  disabled={!isAllAnswered}
                  className="btn btn-primary"
                  style={{
                    fontSize: '13px',
                    padding: '9px 20px',
                    opacity: isAllAnswered ? 1 : 0.6,
                    cursor: isAllAnswered ? 'pointer' : 'not-allowed'
                  }}
                >
                  Verify Comprehension &rarr;
                </button>
              )}

              {isPassed && nextLessonNum && (
                <Link
                  href={`/academy/lesson-${nextLessonNum}`}
                  className="btn btn-primary"
                  style={{ fontSize: '13px', padding: '9px 20px' }}
                >
                  Proceed to Lesson {nextLessonNum} &rarr;
                </Link>
              )}

              {isPassed && globalNum === 5 && (
                <button
                  type="button"
                  onClick={() => setShowGraduationModal(true)}
                  className="btn btn-outline-gold"
                  style={{ fontSize: '13px', padding: '9px 18px' }}
                >
                  Foundation Milestone Status &rarr;
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Education & Risk Clarification Footnote */}
        <div style={{
          marginTop: '20px',
          paddingTop: '14px',
          borderTop: '1px solid var(--border-subtle)',
          fontSize: '11px',
          color: 'var(--text-muted)',
          lineHeight: 1.5
        }}>
          <strong>Educational Risk Notice:</strong> Demonstrating conceptual comprehension through lesson assessments does not guarantee trading profitability, eliminate market risk, or prevent account drawdowns. Spot Gold and leveraged FX instruments carry a significant risk of losing deposited capital.
        </div>
      </div>

      {/* Lesson 5 Completion Modal */}
      {showGraduationModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowGraduationModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.75)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
        >
          <div
            className="modal-card"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '560px',
              width: '100%',
              background: 'var(--bg-base)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)',
              padding: '32px 28px',
              textAlign: 'center',
              boxShadow: '0 20px 48px rgba(15, 23, 42, 0.2)',
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
              aria-label="Close milestone dialog"
            >
              &times;
            </button>

            <span className="status-badge status-completed" style={{ marginBottom: '14px' }}>
              FOUNDATION TRACK COMPLETED &bull; 5/5
            </span>

            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.3 }}>
              XAUUSD Foundations Milestone Reached
            </h2>

            <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '20px' }}>
              You have completed the core market literacy modules. Lessons 6 through 30 (covering Market Structure Shifts, Liquidity Sweeps, and Drawdown Governance) and the AI Trading Terminal carry <strong>no platform subscription fee</strong>, subsidized through our official Introducing Broker partnership with <strong>JustMarkets</strong>.
            </p>

            <div style={{
              background: 'var(--bg-surface-1)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-md)',
              padding: '14px 18px',
              marginBottom: '20px',
              textAlign: 'left',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.55
            }}>
              <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '4px' }}>
                Progression Requirements to Institutional Modules &amp; Terminal:
              </strong>
              1. Open an account via our official JustMarkets partner link (code: <code className="mono-nums" style={{ color: 'var(--accent-gold)' }}>tohstb0d83</code>).<br />
              2. Complete account verification and initial trading deposit.<br />
              3. Enter your MT5 Account ID in Velarion to unlock subsequent curriculum and account linking.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '11px 20px', fontSize: '13px' }}
              >
                Register on JustMarkets (Code: tohstb0d83) &rarr;
              </a>

              <Link
                href="/onboarding?redirect=/academy/lesson-6"
                className="btn btn-outline-gold"
                style={{ padding: '10px 18px', fontSize: '12.5px' }}
              >
                Verify Existing Funded MT5 ID &rarr;
              </Link>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Non-custodial: Trading capital remains strictly in your own regulated JustMarkets broker account. Users bear broker spreads, swaps, and market risks.
            </div>
          </div>
        </div>
      )}
    </>
  );
}

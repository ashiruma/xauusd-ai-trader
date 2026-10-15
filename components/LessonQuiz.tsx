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
  lessonId,
  globalNum,
  quiz,
  nextLessonNum
}: LessonQuizProps) {
  const quizList: QuizQuestion[] = Array.isArray(quiz) ? quiz : (quiz ? [quiz] : []);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [showGraduationModal, setShowGraduationModal] = useState<boolean>(false);

  // Load completion state from localStorage
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

  if (quizList.length === 0) {
    return null;
  }

  // Count how many of Foundation Track (Lessons 1-5) are completed
  const foundationCompletedCount = [1, 2, 3, 4, 5].filter((num) =>
    completedLessons.includes(`lesson-${num}`) || completedLessons.includes(String(num))
  ).length;

  // Handle instant selection and immediate feedback
  const handleSelect = (qIdx: number, optIdx: number) => {
    if (selectedAnswers[qIdx] !== undefined) {
      // Already selected
      return;
    }

    const updated = { ...selectedAnswers, [qIdx]: optIdx };
    setSelectedAnswers(updated);

    // Check if all questions are answered
    if (Object.keys(updated).length === quizList.length) {
      // Check if all are correct
      const allCorrect = quizList.every((q, idx) => {
        const target = q.correct !== undefined ? q.correct : (q as unknown as { correctAnswer: number }).correctAnswer;
        return updated[idx] === target;
      });

      if (allCorrect) {
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

          // Trigger Lesson 5 Graduation Celebration Modal
          if (globalNum === 5) {
            setTimeout(() => {
              setShowGraduationModal(true);
            }, 600);
          }
        } catch {
          // ignore
        }
      }
    }
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
  };

  // Calculate current score
  const answeredCount = Object.keys(selectedAnswers).length;
  let correctCount = 0;
  quizList.forEach((q, idx) => {
    const target = q.correct !== undefined ? q.correct : (q as unknown as { correctAnswer: number }).correctAnswer;
    if (selectedAnswers[idx] === target) {
      correctCount++;
    }
  });

  const isComplete = answeredCount === quizList.length;
  const isPassed = isComplete && correctCount === quizList.length;

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
        {/* ============================================================== */}
        {/* TOP CURRICULUM PROGRESS TRACKER BAR                            */}
        {/* ============================================================== */}
        <div style={{
          background: 'var(--bg-surface-2)',
          border: '1px solid var(--border-default)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-green)' }}>
              Foundation Track: {foundationCompletedCount} of 5 Free Lessons Completed
            </span>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-gold)' }} />
              Institutional Track: Lessons 6&ndash;30 (Sponsored by JustMarkets)
            </span>
          </div>

          {/* Dual Segment Progress Bar */}
          <div style={{ width: '100%', height: '6px', background: 'var(--bg-surface-3)', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
            {/* Foundation segment (out of 5) */}
            <div
              style={{
                width: `${Math.min(100, (foundationCompletedCount / 5) * 100 * (5 / 30))}%`,
                height: '100%',
                background: 'var(--accent-green)',
                transition: 'width 0.4s ease'
              }}
            />
            {/* Locked segment indicator */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              MICRO-ASSESSMENT &bull; 3 QUESTIONS
            </span>
            <h3 style={{ fontSize: '19px', fontWeight: 800, color: '#F8FAFC', margin: '8px 0 0' }}>
              Lesson {globalNum} Comprehension Check
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
              Score: {correctCount} / {quizList.length}
            </span>
            {isPassed && (
              <span className="status-badge status-completed">
                PASSED
              </span>
            )}
          </div>
        </div>

        <p style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '24px', lineHeight: 1.5 }}>
          Click an option to test your comprehension. Immediate institutional feedback will reveal why the answer aligns with XAUUSD market structure.
        </p>

        {/* 3-Question List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {quizList.map((q, qIdx) => {
            const targetAns = q.correct !== undefined ? q.correct : (q as unknown as { correctAnswer: number }).correctAnswer;
            const selectedOpt = selectedAnswers[qIdx];
            const hasAnswered = selectedOpt !== undefined;
            const isAnswerCorrect = hasAnswered && selectedOpt === targetAns;

            return (
              <div
                key={qIdx}
                style={{
                  background: 'var(--bg-card)',
                  border: hasAnswered
                    ? isAnswerCorrect
                      ? '1.5px solid var(--accent-green)'
                      : '1.5px solid var(--accent-red)'
                    : '1px solid var(--border-default)',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.45 }}>
                    <span style={{ color: 'var(--accent-gold)', fontFamily: 'var(--font-mono, monospace)', marginRight: '6px' }}>
                      0{qIdx + 1}.
                    </span>
                    {q.question}
                  </div>

                  {hasAnswered && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        background: isAnswerCorrect ? 'var(--accent-green-subtle)' : 'var(--accent-red-subtle)',
                        color: isAnswerCorrect ? 'var(--accent-green)' : 'var(--accent-red)',
                        border: `1px solid ${isAnswerCorrect ? 'var(--accent-green-border)' : 'var(--accent-red-border)'}`
                      }}
                    >
                      {isAnswerCorrect ? 'CORRECT' : 'INCORRECT'}
                    </span>
                  )}
                </div>

                {/* Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedOpt === optIdx;
                    const isTarget = optIdx === targetAns;

                    let bg = 'var(--bg-surface-1)';
                    let border = 'var(--border-default)';
                    let color = 'var(--text-primary)';
                    let markerBg = 'var(--bg-surface-2)';
                    let markerColor = 'var(--text-secondary)';

                    if (hasAnswered) {
                      if (isTarget) {
                        bg = 'var(--accent-green-subtle)';
                        border = 'var(--accent-green)';
                        color = 'var(--text-primary)';
                        markerBg = 'var(--accent-green)';
                        markerColor = '#FFFFFF';
                      } else if (isSelected && !isTarget) {
                        bg = 'var(--accent-red-subtle)';
                        border = 'var(--accent-red)';
                        color = 'var(--text-primary)';
                        markerBg = 'var(--accent-red)';
                        markerColor = '#FFFFFF';
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        onClick={() => handleSelect(qIdx, optIdx)}
                        disabled={hasAnswered}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '11px 14px',
                          borderRadius: '6px',
                          background: bg,
                          border: `1px solid ${border}`,
                          color,
                          textAlign: 'left',
                          cursor: hasAnswered ? 'default' : 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.15s ease',
                          width: '100%'
                        }}
                      >
                        <span
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '4px',
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

                {/* Instant 1-Sentence Institutional Explanation */}
                {hasAnswered && q.explanation && (
                  <div
                    style={{
                      marginTop: '12px',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      lineHeight: 1.5,
                      background: isAnswerCorrect ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
                      borderLeft: `3px solid ${isAnswerCorrect ? '#10B981' : '#F43F5E'}`,
                      color: '#E2E8F0'
                    }}
                  >
                    <strong style={{ color: isAnswerCorrect ? '#10B981' : '#F43F5E', marginRight: '6px' }}>
                      Institutional Context:
                    </strong>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Assessment Controls & Graduation Actions */}
        <div style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid #1E293B', paddingTop: '18px' }}>
          <div>
            {!isComplete ? (
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                Select answers for all 3 questions to complete Lesson {globalNum}.
              </span>
            ) : isPassed ? (
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                Comprehension verified. Lesson {globalNum} logged in curriculum tracker.
              </span>
            ) : (
              <span style={{ fontSize: '12.5px', color: '#F43F5E' }}>
                Score: {correctCount}/{quizList.length}. Review incorrect answers and retry.
              </span>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {isComplete && !isPassed && (
              <button
                type="button"
                onClick={handleResetQuiz}
                className="btn btn-secondary"
                style={{ fontSize: '12px', padding: '8px 16px' }}
              >
                Retry Assessment
              </button>
            )}

            {isPassed && globalNum < 5 && nextLessonNum && (
              <Link
                href={`/academy/lesson-${nextLessonNum}`}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '9px 20px' }}
              >
                Proceed to Lesson {nextLessonNum} &rarr;
              </Link>
            )}

            {isPassed && globalNum === 5 && (
              <button
                type="button"
                onClick={() => setShowGraduationModal(true)}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '9px 20px' }}
              >
                View Graduation Milestone &rarr;
              </button>
            )}

            {isPassed && globalNum > 5 && nextLessonNum && (
              <Link
                href={`/academy/lesson-${nextLessonNum}`}
                className="btn btn-primary"
                style={{ fontSize: '12.5px', padding: '9px 20px' }}
              >
                Next: Lesson {nextLessonNum} &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* HIGH-CONVERTING LESSON 5 GRADUATION CELEBRATION MODAL          */}
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
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: '580px',
              width: '100%',
              background: 'linear-gradient(180deg, #0F172A 0%, #090D16 100%)',
              border: '1.5px solid var(--border-gold, #C5A059)',
              borderRadius: '16px',
              padding: '36px 32px',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7)',
              position: 'relative'
            }}
          >
            {/* Close Button */}
            <button
              onClick={() => setShowGraduationModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '18px',
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '4px'
              }}
              aria-label="Close graduation dialog"
            >
              &times;
            </button>

            {/* Achievement Badge */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', marginBottom: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                FOUNDATION TRACK COMPLETED &bull; 5/5
              </span>
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: 800, color: '#F8FAFC', marginBottom: '14px', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
              Congratulations! You&apos;ve Completed the XAUUSD Foundations.
            </h2>

            <p style={{ fontSize: '14.5px', color: '#CBD5E1', lineHeight: 1.65, marginBottom: '20px' }}>
              Lessons 6 through 30 (covering Institutional SMC Execution, Multi-Agent AI Confluence, and the 200-Pip Growth Matrix) plus our Live XAUUSD AI Terminal are <strong style={{ color: '#F59E0B' }}>100% Free</strong>&mdash;fully subsidized by our official broker partner, <strong>JustMarkets</strong>.
            </p>

            <div style={{
              background: '#090D16',
              border: '1px solid #1E293B',
              borderRadius: '8px',
              padding: '14px 18px',
              marginBottom: '24px',
              textAlign: 'left',
              fontSize: '12.5px',
              color: '#94A3B8',
              lineHeight: 1.55
            }}>
              <strong style={{ color: '#F8FAFC', display: 'block', marginBottom: '4px' }}>
                How to Unlock Lessons 6&ndash;30 &amp; Live Terminal:
              </strong>
              To unlock the remaining 25 lessons and live signals instantly, open your live MT5 account via our official JustMarkets partner link, make your initial trading deposit, and enter your MT5 Account ID.
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href="https://one.justmarkets.link/a/tohstb0d83"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ padding: '13px 24px', fontSize: '14px', fontWeight: 700 }}
              >
                Open JustMarkets Account &amp; Unlock Lessons 6&ndash;30 &rarr;
              </a>

              <Link
                href="/onboarding?redirect=/academy/lesson-6"
                className="btn btn-outline-gold"
                style={{ padding: '11px 20px', fontSize: '13px' }}
              >
                Already have an MT5 account? Verify ID &rarr;
              </Link>
            </div>

            <div style={{ marginTop: '16px', fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono, monospace)' }}>
              100% Non-Custodial &bull; Funds remain securely in your own regulated JustMarkets MT5 account
            </div>
          </div>
        </div>
      )}
    </>
  );
}

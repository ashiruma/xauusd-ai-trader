'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { QuizQuestion } from '@/lib/curriculum';
import {
  COURSE_PROGRESS_CHANGED_EVENT,
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
  lessonId,
  globalNum,
  quiz,
  nextLessonNum
}: LessonQuizProps) {
  const quizList: QuizQuestion[] = Array.isArray(quiz) ? quiz : (quiz ? [quiz] : []);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [assessmentFailed, setAssessmentFailed] = useState(false);
  const [showGraduationModal, setShowGraduationModal] = useState<boolean>(false);

  // Load completion state from localStorage
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

  if (quizList.length === 0) {
    return null;
  }

  // Count how many of Foundation Track (Lessons 1-5) are completed
  const foundationCompletedCount = [1, 2, 3, 4, 5].filter((num) => completedLessons.includes(num)).length;

  // Any wrong response restarts the whole course and hides all answer-level feedback.
  const handleSelect = (qIdx: number, optIdx: number) => {
    if (assessmentFailed || selectedAnswers[qIdx] !== undefined) return;

    const question = quizList[qIdx];
    const target = question.correct !== undefined ? question.correct : (question as unknown as { correctAnswer: number }).correctAnswer;
    if (optIdx !== target) {
      setSelectedAnswers({});
      setCompletedLessons(saveCourseProgress([]));
      setAssessmentFailed(true);
      setShowGraduationModal(false);
      return;
    }

    const updated = { ...selectedAnswers, [qIdx]: optIdx };
    setSelectedAnswers(updated);
    if (Object.keys(updated).length === quizList.length) {
      try {
        const stored = parseCourseProgress(localStorage.getItem(COURSE_PROGRESS_STORAGE_KEY));
        const completed = saveCourseProgress([...stored, globalNum]);
        setCompletedLessons(completed);
        if (globalNum === 5) {
          setTimeout(() => setShowGraduationModal(true), 600);
        }
      } catch {
        // Completion remains visible in this assessment even if browser storage is unavailable.
      }
    }
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
      <div className="lesson-quiz" style={{
        background: 'linear-gradient(180deg, #0F172A 0%, #090D16 100%)',
        border: '1px solid #1E293B',
        borderRadius: '12px',
        padding: '28px 24px',
        marginTop: '36px',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.4)'
      }}>
        {/* ============================================================== */}
        {/* TOP CURRICULUM PROGRESS TRACKER BAR                            */}
        {/* ============================================================== */}
        <div className="lesson-quiz-progress" style={{
          background: 'rgba(15, 23, 42, 0.8)',
          border: '1px solid #1E293B',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
            <span className="lesson-quiz-progress-primary" style={{ fontSize: '12px', fontWeight: 700, color: '#10B981' }}>
              Foundation Track: {foundationCompletedCount} of 5 Lessons Completed
            </span>
            <span className="lesson-quiz-progress-secondary" style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', color: '#F59E0B', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', background: '#F59E0B' }} />
              Institutional Track: Lessons 6&ndash;30 (Sponsored by JustMarkets)
            </span>
          </div>

          {/* Dual Segment Progress Bar */}
          <div className="lesson-quiz-progress-track" style={{ width: '100%', height: '6px', background: '#1E293B', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
            {/* Foundation segment (out of 5) */}
            <div
              className="lesson-quiz-progress-foundation"
              style={{
                width: `${Math.min(100, (foundationCompletedCount / 5) * 100 * (5 / 30))}%`,
                height: '100%',
                background: '#10B981',
                transition: 'width 0.4s ease'
              }}
            />
            {/* Locked segment indicator */}
            <div
              className="lesson-quiz-progress-sponsored"
              style={{
                width: `${(25 / 30) * 100}%`,
                height: '100%',
                background: 'rgba(245, 158, 11, 0.25)',
                marginLeft: '2px'
              }}
            />
          </div>
        </div>

        {/* Assessment Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <span className="lesson-quiz-kicker" style={{ fontSize: '11px', fontFamily: 'var(--font-mono, monospace)', fontWeight: 700, color: '#F59E0B', background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: '4px' }}>
              MICRO-ASSESSMENT &bull; 3 QUESTIONS
            </span>
            <h3 className="lesson-quiz-title" style={{ fontSize: '19px', fontWeight: 800, color: '#F8FAFC', margin: '8px 0 0' }}>
              Lesson {globalNum} Comprehension Check
            </h3>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '12px', fontFamily: 'var(--font-mono, monospace)', color: '#94A3B8' }}>
              {assessmentFailed ? 'Course reset' : isPassed ? `Score: ${correctCount} / ${quizList.length}` : `Answered: ${answeredCount} / ${quizList.length}`}
            </span>
            {isPassed && (
              <span className="status-badge status-completed">
                PASSED
              </span>
            )}
          </div>
        </div>

        <p className="lesson-quiz-intro" style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '24px', lineHeight: 1.5 }}>
          Pass every question to unlock the next lesson. Any incorrect response clears all course progress and restarts the sequence at Lesson 1; this assessment becomes available again when you reach it in order.
        </p>

        {assessmentFailed ? (
          <div className="course-reset-notice" role="status">
            <strong>Course progress reset</strong>
            <p>Your assessment was not passed. All completed lessons have been cleared. Start again from Lesson 1 and pass each assessment in order; this assessment will unlock when you reach it again.</p>
            <Link className="btn btn-primary" href="/academy">Return to course overview <span aria-hidden="true">→</span></Link>
          </div>
        ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          {quizList.map((q, qIdx) => {
            const targetAns = q.correct !== undefined ? q.correct : (q as unknown as { correctAnswer: number }).correctAnswer;
            const selectedOpt = selectedAnswers[qIdx];
            const hasAnswered = selectedOpt !== undefined;
            const isAnswerCorrect = hasAnswered && selectedOpt === targetAns;

            return (
              <div
                key={qIdx}
                className="lesson-quiz-question"
                style={{
                  background: '#090D16',
                  border: isPassed && isAnswerCorrect ? '1px solid rgba(16, 185, 129, 0.4)' : hasAnswered ? '1px solid rgba(197, 160, 89, 0.4)' : '1px solid #1E293B',
                  borderRadius: '10px',
                  padding: '18px 20px',
                  transition: 'border-color 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '14px' }}>
                  <div className="lesson-quiz-prompt" style={{ fontSize: '14px', fontWeight: 700, color: '#F8FAFC', lineHeight: 1.45 }}>
                    <span className="lesson-quiz-question-number" style={{ color: '#F59E0B', fontFamily: 'var(--font-mono, monospace)', marginRight: '6px' }}>
                      0{qIdx + 1}.
                    </span>
                    {q.question}
                  </div>

                  {isPassed && isAnswerCorrect && (
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono, monospace)',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: '4px',
                        flexShrink: 0,
                        background: isAnswerCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                        color: isAnswerCorrect ? '#10B981' : '#F43F5E',
                        border: `1px solid ${isAnswerCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`
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
                    const isTarget = optIdx === targetAns;

                    let bg = '#0F172A';
                    let border = '#1E293B';
                    let color = '#CBD5E1';
                    let markerBg = '#1E293B';
                    let markerColor = '#94A3B8';

                    if (isPassed && isAnswerCorrect && isTarget) {
                        bg = 'rgba(16, 185, 129, 0.12)';
                        border = '#10B981';
                        color = '#F8FAFC';
                        markerBg = '#10B981';
                        markerColor = '#090D16';
                    } else if (hasAnswered && isSelected) {
                        bg = 'rgba(197, 160, 89, 0.12)';
                        border = '#C5A059';
                        color = '#F8FAFC';
                        markerBg = '#C5A059';
                        markerColor = '#090D16';
                    }

                    return (
                      <button
                        key={optIdx}
                        type="button"
                        className={`lesson-quiz-option ${isPassed && isTarget ? 'correct' : hasAnswered && isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        disabled={hasAnswered || assessmentFailed || isPassed}
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
                {isPassed && isAnswerCorrect && q.explanation && (
                  <div
                    className="lesson-quiz-explanation"
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
        )}

        {/* Assessment Controls & Graduation Actions */}
        <div className="lesson-quiz-controls" style={{ marginTop: '28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderTop: '1px solid #1E293B', paddingTop: '18px' }}>
          <div>
            {assessmentFailed ? (
              <span style={{ fontSize: '12px', color: '#F59E0B' }}>
                Start again at Lesson 1. Progression unlocks only after each assessment is passed.
              </span>
            ) : !isComplete ? (
              <span style={{ fontSize: '12px', color: '#94A3B8' }}>
                Select answers for all 3 questions to complete Lesson {globalNum}.
              </span>
            ) : isPassed ? (
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#10B981' }}>
                Comprehension verified. Lesson {globalNum} logged in curriculum tracker.
              </span>
            ) : null}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
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
          data-lesson-quiz-modal="true"
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
            data-lesson-quiz-card="true"
            role="dialog"
            aria-modal="true"
            aria-labelledby="foundation-complete-title"
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
            <div className="lesson-quiz-graduation-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 14px', background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', marginBottom: '20px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#10B981', fontFamily: 'var(--font-mono, monospace)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                FOUNDATION TRACK COMPLETED &bull; 5/5
              </span>
            </div>

            <h2 id="foundation-complete-title" className="lesson-quiz-modal-title" style={{ fontSize: '26px', fontWeight: 800, color: '#F8FAFC', marginBottom: '14px', letterSpacing: '-0.4px', lineHeight: 1.25 }}>
              Congratulations! You&apos;ve Completed the XAUUSD Foundations.
            </h2>

            <p className="lesson-quiz-modal-copy" style={{ fontSize: '14.5px', color: '#CBD5E1', lineHeight: 1.65, marginBottom: '20px' }}>
              Lessons 6 through 30 (covering Institutional SMC Execution, Multi-Agent AI Confluence, and the 200-Pip Growth Matrix) plus our Live XAUUSD AI Terminal carry <strong style={{ color: '#F59E0B' }}>no platform subscription fee</strong>&mdash;subsidized through our official Introducing Broker partnership with <strong>JustMarkets</strong>.
            </p>

            <div className="lesson-quiz-graduation-note" style={{
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
              To unlock the remaining 25 lessons and live signals, open your MT5 account via our official JustMarkets partner link, fund your trading account, and complete partner verification.
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
              Non-Custodial Direct Broker Custody &bull; Funds remain securely in your own regulated JustMarkets MT5 account
            </div>
          </div>
        </div>
      )}
    </>
  );
}

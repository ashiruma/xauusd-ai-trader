'use client';

import React, { useState } from 'react';
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
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState<number>(0);

  if (quizList.length === 0) {
    return null;
  }

  const handleSelect = (qIdx: number, optIdx: number) => {
    if (submitted) return;
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.keys(selectedAnswers).length < quizList.length) {
      alert('Please select an answer before submitting the assessment.');
      return;
    }

    let correctCount = 0;
    quizList.forEach((q, idx) => {
      const targetAns = q.correct !== undefined ? q.correct : (q as unknown as { correctAnswer: number }).correctAnswer;
      if (selectedAnswers[idx] === targetAns) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    if (correctCount === quizList.length) {
      try {
        const completed = JSON.parse(localStorage.getItem('velarion_completed_lessons') || '[]');
        if (!completed.includes(lessonId)) {
          completed.push(lessonId);
          localStorage.setItem('velarion_completed_lessons', JSON.stringify(completed));
        }
      } catch {
        // ignore
      }
    }
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  const isPassed = submitted && score === quizList.length;

  return (
    <div style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border-default)',
      borderRadius: 'var(--radius-lg)',
      padding: '24px',
      marginTop: '32px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
        <div>
          <span className="status-badge status-warning" style={{ marginBottom: '6px' }}>
            KNOWLEDGE ASSESSMENT
          </span>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
            Lesson {globalNum} Mastery Assessment
          </h3>
        </div>
        {submitted && (
          <span className={`status-badge ${isPassed ? 'status-completed' : 'status-danger'}`}>
            {isPassed ? `PASSED (${score}/${quizList.length})` : `REVIEW REQUIRED (${score}/${quizList.length})`}
          </span>
        )}
      </div>

      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.5 }}>
        Answer the knowledge assessment question to demonstrate comprehension and unlock the next lesson.
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {quizList.map((q, qIdx) => {
            const targetAns = q.correct !== undefined ? q.correct : (q as unknown as { correctAnswer: number }).correctAnswer;
            const isCorrect = submitted && selectedAnswers[qIdx] === targetAns;
            const isWrong = submitted && selectedAnswers[qIdx] !== targetAns;

            return (
              <div
                key={qIdx}
                style={{
                  background: 'var(--bg-surface-1)',
                  border: isCorrect
                    ? '1px solid var(--accent-green-border)'
                    : isWrong
                    ? '1px solid var(--accent-red-border)'
                    : '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: '16px'
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
                  {quizList.length > 1 ? `${qIdx + 1}. ` : ''}{q.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {q.options.map((opt, optIdx) => {
                    const isSelected = selectedAnswers[qIdx] === optIdx;
                    const isTargetCorrect = submitted && optIdx === targetAns;

                    let bg = 'var(--bg-surface-2)';
                    let border = 'var(--border-default)';
                    let color = 'var(--text-secondary)';

                    if (submitted) {
                      if (isTargetCorrect) {
                        bg = 'rgba(25, 184, 120, 0.12)';
                        border = 'var(--accent-green)';
                        color = 'var(--accent-green)';
                      } else if (isSelected && !isTargetCorrect) {
                        bg = 'var(--accent-red-subtle)';
                        border = 'var(--accent-red)';
                        color = 'var(--accent-red)';
                      }
                    } else if (isSelected) {
                      bg = 'rgba(230, 187, 89, 0.12)';
                      border = 'var(--accent-gold)';
                      color = 'var(--accent-gold)';
                    }

                    return (
                      <label
                        key={optIdx}
                        onClick={() => handleSelect(qIdx, optIdx)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '10px 14px',
                          borderRadius: 'var(--radius-sm)',
                          background: bg,
                          border: `1px solid ${border}`,
                          color,
                          cursor: submitted ? 'default' : 'pointer',
                          fontSize: '13px',
                          transition: 'all 0.12s ease'
                        }}
                      >
                        <input
                          type="radio"
                          name={`q-${qIdx}`}
                          checked={isSelected}
                          onChange={() => handleSelect(qIdx, optIdx)}
                          disabled={submitted}
                          style={{ accentColor: 'var(--accent-gold)' }}
                        />
                        <span>{opt}</span>
                      </label>
                    );
                  })}
                </div>

                {submitted && q.explanation && (
                  <div style={{
                    marginTop: '12px',
                    fontSize: '12px',
                    lineHeight: 1.5,
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: isCorrect ? 'rgba(25, 184, 120, 0.08)' : 'rgba(239, 68, 68, 0.08)',
                    color: isCorrect ? 'var(--accent-green)' : 'var(--text-secondary)'
                  }}>
                    <strong>Explanation:</strong> {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
          {!submitted ? (
            <button
              type="submit"
              className="btn btn-gold"
              style={{ padding: '10px 22px', fontSize: '13px' }}
            >
              Submit Answer
            </button>
          ) : (
            <>
              {!isPassed && (
                <button
                  type="button"
                  onClick={handleRetry}
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '13px' }}
                >
                  Retry Question
                </button>
              )}
              {isPassed && nextLessonNum && (
                <a
                  href={`/academy/lesson-${nextLessonNum}`}
                  className="btn btn-gold"
                  style={{ padding: '10px 22px', fontSize: '13px' }}
                >
                  Proceed to Lesson {nextLessonNum} &rarr;
                </a>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, RotateCcw, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { McqQuestion } from '../types';

interface Props {
  examGroup: 'govt' | 'ability';
  title: string;
}

export function McqPracticeEngine({ examGroup, title }: Props) {
  const { mcqs, saveTestAttempt, user, showToast } = useApp();

  const pool = useMemo(() => mcqs.filter((m) => m.examGroup === examGroup), [mcqs, examGroup]);
  const categories = useMemo(
    () => ['All Categories', ...Array.from(new Set(pool.map((q) => q.examCategory)))],
    [pool],
  );
  const subjects = useMemo(
    () => ['All Subjects', ...Array.from(new Set(pool.map((q) => q.subject)))],
    [pool],
  );

  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedSubject, setSelectedSubject] = useState('All Subjects');
  const [mode, setMode] = useState<'practice' | 'timed'>('practice');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [timerActive, setTimerActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(300);

  const filteredQuestions: McqQuestion[] = useMemo(() => {
    return pool.filter((q) => {
      const catOk = selectedCategory === 'All Categories' || q.examCategory === selectedCategory;
      const subOk = selectedSubject === 'All Subjects' || q.subject === selectedSubject;
      return catOk && subOk;
    });
  }, [pool, selectedCategory, selectedSubject]);

  useEffect(() => {
    if (!timerActive || submitted) return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerActive(false);
          setSubmitted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [timerActive, submitted]);

  const startMockExam = () => {
    setMode('timed');
    setAnswers({});
    setSubmitted(false);
    setSecondsLeft(Math.max(60, filteredQuestions.length * 60));
    setTimerActive(true);
  };

  const resetAll = () => {
    setAnswers({});
    setSubmitted(false);
    setTimerActive(false);
    setSecondsLeft(Math.max(60, filteredQuestions.length * 60));
  };

  const correctCount = useMemo(() => {
    return filteredQuestions.reduce((acc, q) => {
      return acc + (answers[q.id] === q.correctIndex ? 1 : 0);
    }, 0);
  }, [filteredQuestions, answers]);

  const handleFinishMock = async () => {
    setSubmitted(true);
    setTimerActive(false);
    const total = filteredQuestions.length || 1;
    const scorePercent = Math.round((correctCount / total) * 100);
    const totalDuration = Math.max(60, filteredQuestions.length * 60);
    const elapsed = Math.max(1, totalDuration - secondsLeft);

    if (user) {
      await saveTestAttempt({
        examCategory: selectedCategory,
        testTitle: `${title} (${selectedSubject})`,
        totalQuestions: filteredQuestions.length,
        correctCount,
        scorePercent,
        durationSeconds: elapsed,
      });
      showToast(`Mock exam scored ${scorePercent}% and saved to your progress history.`, 'success');
    } else {
      showToast(`Mock exam completed: ${correctCount}/${filteredQuestions.length} (${scorePercent}%). Sign in to save progress.`, 'info');
    }
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h2 className="font-display text-xl sm:text-2xl font-bold text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-600">
            Choose Practice Mode for instant explanations or Timed Mock Examination to track accuracy.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setMode('practice');
                resetAll();
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                mode === 'practice' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Practice Mode
            </button>
            <button
              type="button"
              onClick={startMockExam}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                mode === 'timed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timed Mock Exam
            </button>
          </div>

          {mode === 'timed' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white text-xs font-mono-tabular rounded-lg">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{formatTimer(secondsLeft)}</span>
            </div>
          )}

          <button
            type="button"
            onClick={resetAll}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Exam / Program</label>
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              resetAll();
            }}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">Subject Filter</label>
          <select
            value={selectedSubject}
            onChange={(e) => {
              setSelectedSubject(e.target.value);
              resetAll();
            }}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            {subjects.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Result Banner */}
      {submitted && filteredQuestions.length > 0 && (
        <div className="mt-6 p-5 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-sky-400 font-semibold">Performance Report</div>
            <div className="mt-1 text-xl font-display font-bold tabular-nums">
              Score: {correctCount} / {filteredQuestions.length} (
              {Math.round((correctCount / filteredQuestions.length) * 100)}%)
            </div>
            <p className="mt-1 text-xs text-slate-300">
              Review each explanation below to strengthen weak areas before your examination.
            </p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg whitespace-nowrap shrink-0"
          >
            Retake Test
          </button>
        </div>
      )}

      {/* Question List */}
      <div className="mt-6 space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="py-10 text-center text-sm text-slate-500">
            No MCQs match the selected filter yet.
          </div>
        ) : (
          filteredQuestions.map((q, index) => {
            const chosen = answers[q.id];
            const showAnswer = (mode === 'practice' && chosen !== undefined) || submitted;
            return (
              <div key={q.id} className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="text-xs text-slate-500 flex items-center gap-2 flex-wrap">
                  <span className="font-mono-tabular font-semibold text-slate-700">Q{index + 1}</span>
                  <span aria-hidden="true">·</span>
                  <span>{q.examCategory}</span>
                  <span aria-hidden="true">·</span>
                  <span>{q.subject}</span>
                </div>
                <h3 className="mt-2 text-base font-semibold text-slate-900 leading-snug">
                  {q.question}
                </h3>

                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = chosen === optIdx;
                    const isCorrect = optIdx === q.correctIndex;
                    let styleClass =
                      'bg-white border-slate-200 text-slate-800 hover:border-blue-400';

                    if (showAnswer) {
                      if (isCorrect) {
                        styleClass = 'bg-emerald-50 border-emerald-500 text-emerald-950 font-medium';
                      } else if (isSelected && !isCorrect) {
                        styleClass = 'bg-red-50 border-red-400 text-red-900';
                      }
                    } else if (isSelected) {
                      styleClass = 'bg-blue-50 border-blue-600 text-blue-950 font-medium';
                    }

                    return (
                      <button
                        key={`${q.id}-${optIdx}`}
                        type="button"
                        disabled={submitted || (mode === 'practice' && chosen !== undefined)}
                        onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: optIdx }))}
                        className={`text-left px-4 py-3 text-sm border rounded-lg transition-colors flex items-center justify-between gap-2 ${styleClass}`}
                      >
                        <span>
                          <span className="font-mono-tabular text-xs text-slate-500 mr-2">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>
                          {opt}
                        </span>
                        {showAnswer && isCorrect && (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        )}
                        {showAnswer && isSelected && !isCorrect && (
                          <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {showAnswer && (
                  <div className="mt-3 pt-3 border-t border-slate-200 text-xs text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900">Explanation: </span>
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {mode === 'timed' && !submitted && filteredQuestions.length > 0 && (
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={() => void handleFinishMock()}
            className="px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Submit Mock Examination
          </button>
        </div>
      )}
    </section>
  );
}

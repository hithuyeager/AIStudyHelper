import React, { useState } from 'react';
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  Trophy,
  Award,
  Layers,
} from 'lucide-react';
import { SyllabusDocument, QuizData, QuizQuestion } from '../types';

interface QuizToolProps {
  activeDoc: SyllabusDocument | null;
  onNavigateToUpload: () => void;
}

export const QuizTool: React.FC<QuizToolProps> = ({
  activeDoc,
  onNavigateToUpload,
}) => {
  const [numQuestions, setNumQuestions] = useState<number>(5);
  const [difficulty, setDifficulty] = useState<string>('medium');
  const [unitFocus, setUnitFocus] = useState<string>('all');

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuiz = async () => {
    if (!activeDoc) return;

    setIsLoading(true);
    setError(null);
    setUserAnswers({});
    setSubmitted(false);

    try {
      const response = await fetch('/api/study-tools/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: activeDoc.extractedText,
          documentName: activeDoc.name,
          numQuestions,
          difficulty,
          unitFocus: unitFocus === 'all' ? undefined : unitFocus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate practice quiz.');
      }

      setQuizData(data);
    } catch (err: any) {
      console.error('Quiz error:', err);
      setError(err.message || 'An error occurred while generating the quiz.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, optionIndex: number) => {
    if (submitted) return; // locked after submission or can allow live answering
    setUserAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }));
  };

  const calculateScore = () => {
    if (!quizData) return 0;
    let score = 0;
    quizData.questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correctAnswerIndex) {
        score += 1;
      }
    });
    return score;
  };

  const handleRetake = () => {
    setUserAnswers({});
    setSubmitted(false);
  };

  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Upload a Syllabus to Generate Practice Quizzes
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          StudyMate AI creates custom multiple-choice question quizzes directly testing your syllabus topics with instant answer explanations.
        </p>
        <button
          onClick={onNavigateToUpload}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors inline-flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          <span>Upload Syllabus</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const score = calculateScore();
  const totalQuestions = quizData?.questions.length || 0;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Quiz Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Interactive Practice MCQs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Test your mastery with exam-style questions generated strictly from{' '}
              <strong className="text-slate-700">{activeDoc.name}</strong>.
            </p>
          </div>
        </div>

        {/* Controls row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
          {/* Question Count */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Question Count
            </label>
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              {[5, 10].map((count) => (
                <button
                  key={count}
                  type="button"
                  onClick={() => setNumQuestions(count)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    numQuestions === count
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {count} Questions
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Difficulty Level
            </label>
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              {[
                { id: 'easy', label: 'Easy' },
                { id: 'medium', label: 'Medium' },
                { id: 'hard', label: 'Hard' },
              ].map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => setDifficulty(lvl.id)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    difficulty === lvl.id
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unit Focus */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Unit Scope
            </label>
            <select
              value={unitFocus}
              onChange={(e) => setUnitFocus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">Entire Syllabus (All Units)</option>
              {activeDoc.detectedUnits.map((u, i) => (
                <option key={i} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Each option comes with detailed explanatory feedback.
          </span>
          <button
            onClick={handleGenerateQuiz}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Practice Quiz...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate MCQs Quiz</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Quiz Render */}
      {quizData && quizData.questions.length > 0 && (
        <div className="space-y-5 animate-fade-in">
          {/* Progress / Status Header */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                {quizData.quizTitle || 'Practice Quiz'}
              </span>
              <span className="text-xs text-slate-500">
                • {answeredCount} of {totalQuestions} answered
              </span>
            </div>

            {submitted ? (
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">
                  Score: {score}/{totalQuestions} ({percentage}%)
                </span>
                <button
                  onClick={handleRetake}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retake</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setSubmitted(true)}
                disabled={answeredCount === 0}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Answers &amp; View Explanations
              </button>
            )}
          </div>

          {/* Submitted Score Summary Banner */}
          {submitted && (
            <div
              className={`p-6 rounded-2xl border text-center ${
                percentage >= 80
                  ? 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
                  : percentage >= 50
                  ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                  : 'bg-rose-50/80 border-rose-200 text-rose-950'
              }`}
            >
              <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center mb-2 shadow-xs bg-white">
                <Trophy
                  className={`w-6 h-6 ${
                    percentage >= 80
                      ? 'text-emerald-600'
                      : percentage >= 50
                      ? 'text-amber-600'
                      : 'text-rose-600'
                  }`}
                />
              </div>
              <h2 className="text-xl font-bold">
                {percentage >= 80
                  ? 'Outstanding Academic Mastery!'
                  : percentage >= 50
                  ? 'Good Progress — Review the Missed Concepts'
                  : 'Needs Review — Check the Explanations Below'}
              </h2>
              <p className="text-sm mt-1 opacity-80">
                You scored {score} out of {totalQuestions} questions correctly ({percentage}%).
              </p>
            </div>
          )}

          {/* Question List */}
          <div className="space-y-4">
            {quizData.questions.map((q, qIndex) => {
              const selectedOption = userAnswers[qIndex];
              const isAnswered = selectedOption !== undefined;
              const isCorrect = selectedOption === q.correctAnswerIndex;

              return (
                <div
                  key={q.id || qIndex}
                  className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
                >
                  {/* Question header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {qIndex + 1}
                      </span>
                      <div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                          {q.question}
                        </h3>
                        {q.unitRef && (
                          <span className="text-[11px] text-indigo-600 font-medium mt-1 inline-flex items-center gap-1">
                            <Layers className="w-3 h-3" />
                            {q.unitRef}
                          </span>
                        )}
                      </div>
                    </div>

                    {submitted && (
                      <div>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {q.options.map((option, optIndex) => {
                      const isChosen = selectedOption === optIndex;
                      const isRightOption = optIndex === q.correctAnswerIndex;

                      let optionStyle =
                        'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/80 bg-white text-slate-800';

                      if (submitted) {
                        if (isRightOption) {
                          optionStyle =
                            'border-emerald-500 bg-emerald-50/90 text-emerald-950 font-semibold ring-1 ring-emerald-500';
                        } else if (isChosen && !isRightOption) {
                          optionStyle =
                            'border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-400 line-through opacity-80';
                        } else {
                          optionStyle = 'border-slate-200 bg-slate-50/50 text-slate-400';
                        }
                      } else if (isChosen) {
                        optionStyle =
                          'border-indigo-600 bg-indigo-50/80 text-indigo-950 font-semibold ring-1 ring-indigo-500';
                      }

                      const optionLetter = String.fromCharCode(65 + optIndex);

                      return (
                        <button
                          key={optIndex}
                          type="button"
                          onClick={() => handleSelectOption(qIndex, optIndex)}
                          className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-start gap-3 ${optionStyle}`}
                        >
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 ${
                              submitted && isRightOption
                                ? 'bg-emerald-600 text-white'
                                : submitted && isChosen && !isRightOption
                                ? 'bg-rose-600 text-white'
                                : isChosen
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {optionLetter}
                          </span>
                          <span className="flex-1 leading-relaxed">{option}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation (Shown when submitted) */}
                  {submitted && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Syllabus Explanation &amp; Rationale:</span>
                      </div>
                      <p className="leading-relaxed text-slate-600">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Submit / Retake Action Bar */}
          {!submitted && answeredCount > 0 && (
            <div className="sticky bottom-4 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200 p-4 shadow-lg flex items-center justify-between">
              <span className="text-xs text-slate-600">
                You have answered <strong>{answeredCount}</strong> of <strong>{totalQuestions}</strong> questions.
              </span>
              <button
                onClick={() => setSubmitted(true)}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-200 transition-colors"
              >
                Submit Answers &amp; Check Results
              </button>
            </div>
          )}
        </div>
      )}

      {!quizData && !isLoading && (
        <div className="border border-dashed border-slate-200 bg-white/60 rounded-2xl p-10 text-center">
          <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            No Quiz Generated Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Choose your desired question count and difficulty above, then click &quot;Generate MCQs Quiz&quot;.
          </p>
        </div>
      )}
    </div>
  );
};

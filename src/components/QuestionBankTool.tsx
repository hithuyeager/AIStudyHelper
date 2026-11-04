import React, { useState } from 'react';
import {
  BookMarked,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  Check,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  Award,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { SyllabusDocument, QuestionBankData } from '../types';

interface QuestionBankToolProps {
  activeDoc: SyllabusDocument | null;
  onNavigateToUpload: () => void;
}

export const QuestionBankTool: React.FC<QuestionBankToolProps> = ({
  activeDoc,
  onNavigateToUpload,
}) => {
  const [unitFocus, setUnitFocus] = useState<string>('all');
  const [bankData, setBankData] = useState<QuestionBankData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openAnswerIds, setOpenAnswerIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'short' | 'long'>('all');

  const handleGenerateBank = async () => {
    if (!activeDoc) return;

    setIsLoading(true);
    setError(null);
    setOpenAnswerIds({});

    try {
      const response = await fetch('/api/study-tools/question-bank', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: activeDoc.extractedText,
          documentName: activeDoc.name,
          unitFocus: unitFocus === 'all' ? undefined : unitFocus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate question bank.');
      }

      setBankData(data);
    } catch (err: any) {
      console.error('Question bank error:', err);
      setError(err.message || 'An error occurred while generating question bank.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAnswer = (id: string) => {
    setOpenAnswerIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleCopyQuestion = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <BookMarked className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Upload a Syllabus to Generate Exam Questions
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          Generate university-level short and long answer exam questions complete with marking rubrics and model answers.
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Config Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Exam Question Bank
              </h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Short and Long Answer exam questions with model answers and evaluation rubrics for{' '}
                <strong className="text-slate-700">{activeDoc.name}</strong>.
              </p>
            </div>
          </div>

          {/* Unit Scope */}
          <div className="w-full sm:w-64">
            <select
              value={unitFocus}
              onChange={(e) => setUnitFocus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Syllabus Units</option>
              {activeDoc.detectedUnits.map((u, i) => (
                <option key={i} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button Row */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Includes Short Answer (2-3 Marks) &amp; Long Answer (7-10 Marks)
          </span>
          <button
            onClick={handleGenerateBank}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Formulating Exam Bank...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Question Bank</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Render Output */}
      {bankData && (
        <div className="space-y-6 animate-fade-in">
          {/* Tabs: All / Short / Long */}
          <div className="flex items-center justify-between gap-3 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                All Questions ({bankData.shortAnswerQuestions.length + bankData.longAnswerQuestions.length})
              </button>
              <button
                onClick={() => setActiveTab('short')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'short'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Short Answer ({bankData.shortAnswerQuestions.length})
              </button>
              <button
                onClick={() => setActiveTab('long')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'long'
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Long / Analytical ({bankData.longAnswerQuestions.length})
              </button>
            </div>

            <span className="text-[11px] text-slate-400 hidden sm:inline">
              Click &quot;Show Model Answer&quot; to reveal evaluation rubrics.
            </span>
          </div>

          {/* Short Answer Section */}
          {(activeTab === 'all' || activeTab === 'short') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                  Part A: Short Answer Questions (2–3 Marks)
                </span>
                <span className="text-xs text-slate-400">
                  Focus on definitions, distinctions, and direct mechanisms
                </span>
              </div>

              {bankData.shortAnswerQuestions.map((q, idx) => {
                const isOpen = !!openAnswerIds[q.id || `short-${idx}`];
                const qKey = q.id || `short-${idx}`;

                return (
                  <div
                    key={qKey}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          S{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                              {q.marks || '3 Marks'}
                            </span>
                            {q.unitRef && (
                              <span className="text-[11px] text-indigo-600 font-medium">
                                {q.unitRef}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                            {q.question}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleCopyQuestion(
                            qKey,
                            `Question: ${q.question}\n\nModel Answer:\n${q.sampleModelAnswer}`
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                        title="Copy question & answer"
                      >
                        {copiedId === qKey ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Toggle Model Answer Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => toggleAnswer(qKey)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isOpen ? 'Hide Model Answer' : 'Show Model Answer & Grading Points'}</span>
                      </button>
                    </div>

                    {/* Collapsible Model Answer & Points */}
                    {isOpen && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 animate-fade-in">
                        <div>
                          <span className="font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Examiner Key Points Required for Full Credit:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                            {q.expectedKeyPoints.map((pt, pIdx) => (
                              <li key={pIdx}>{pt}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-900 block mb-1">
                            Exemplar Student Model Answer:
                          </span>
                          <p className="bg-white p-3 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-sans">
                            {q.sampleModelAnswer}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Long Answer Section */}
          {(activeTab === 'all' || activeTab === 'long') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">
                  Part B: Long &amp; Analytical Questions (7–10 Marks)
                </span>
                <span className="text-xs text-slate-400">
                  In-depth architectural, mathematical, design, or algorithmic questions
                </span>
              </div>

              {bankData.longAnswerQuestions.map((q, idx) => {
                const isOpen = !!openAnswerIds[q.id || `long-${idx}`];
                const qKey = q.id || `long-${idx}`;

                return (
                  <div
                    key={qKey}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs transition-all hover:border-slate-300"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                          L{idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                              {q.marks || '10 Marks'}
                            </span>
                            {q.unitRef && (
                              <span className="text-[11px] text-indigo-600 font-medium">
                                {q.unitRef}
                              </span>
                            )}
                          </div>
                          <h3 className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                            {q.question}
                          </h3>
                        </div>
                      </div>

                      <button
                        onClick={() =>
                          handleCopyQuestion(
                            qKey,
                            `Question: ${q.question}\n\nModel Answer:\n${q.sampleModelAnswer}`
                          )
                        }
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                        title="Copy question & answer"
                      >
                        {copiedId === qKey ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Toggle Model Answer Button */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <button
                        onClick={() => toggleAnswer(qKey)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span>{isOpen ? 'Hide Comprehensive Model Answer' : 'Show Comprehensive Model Answer & Rubric'}</span>
                      </button>
                    </div>

                    {/* Collapsible Model Answer & Points */}
                    {isOpen && (
                      <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-3 animate-fade-in">
                        <div>
                          <span className="font-bold text-slate-800 flex items-center gap-1 mb-1.5">
                            <Award className="w-3.5 h-3.5 text-indigo-600" />
                            Marking Rubric &amp; Step-by-Step Breakdown:
                          </span>
                          <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                            {q.breakdownCriteria.map((criterion, cIdx) => (
                              <li key={cIdx}>{criterion}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="pt-2 border-t border-slate-200">
                          <span className="font-bold text-slate-900 block mb-1">
                            Complete Academic Model Answer:
                          </span>
                          <div className="bg-white p-3.5 rounded-lg border border-slate-200 text-slate-700 leading-relaxed font-sans whitespace-pre-wrap">
                            {q.sampleModelAnswer}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {!bankData && !isLoading && (
        <div className="border border-dashed border-slate-200 bg-white/60 rounded-2xl p-10 text-center">
          <BookMarked className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            No Questions Generated Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Click &quot;Generate Question Bank&quot; to synthesize semester exam questions with grading keys.
          </p>
        </div>
      )}
    </div>
  );
};

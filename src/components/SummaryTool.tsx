import React, { useState } from 'react';
import {
  FileCheck2,
  Layers,
  Sparkles,
  BookOpen,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { SyllabusDocument } from '../types';
import { MarkdownView } from './MarkdownView';

interface SummaryToolProps {
  activeDoc: SyllabusDocument | null;
  onNavigateToUpload: () => void;
}

export const SummaryTool: React.FC<SummaryToolProps> = ({
  activeDoc,
  onNavigateToUpload,
}) => {
  const [scope, setScope] = useState<'full' | 'unit'>('full');
  const [selectedUnit, setSelectedUnit] = useState<string>(
    activeDoc?.detectedUnits[0] || 'Unit 1'
  );
  const [customUnit, setCustomUnit] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    if (!activeDoc) return;

    setIsLoading(true);
    setError(null);

    const unitQuery = scope === 'unit' ? customUnit.trim() || selectedUnit : undefined;

    try {
      const response = await fetch('/api/study-tools/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: activeDoc.extractedText,
          documentName: activeDoc.name,
          scope,
          unitQuery,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate summary.');
      }

      setSummary(data.summary);
    } catch (err: any) {
      console.error('Summary error:', err);
      setError(err.message || 'An error occurred while generating summary.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Upload a Syllabus to Generate Summaries
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          To synthesize high-yield summaries or module breakdowns, please upload your course syllabus first.
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
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileCheck2 className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                Syllabus Summarizer
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Extract high-yield executive summaries or deep-dive into individual units from{' '}
              <strong className="text-slate-700">{activeDoc.name}</strong>.
            </p>
          </div>

          {/* Scope Selector Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
            <button
              onClick={() => setScope('full')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === 'full'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Full Syllabus
            </button>
            <button
              onClick={() => setScope('unit')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                scope === 'unit'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Individual Unit
            </button>
          </div>
        </div>

        {/* Options for Unit Scope */}
        {scope === 'unit' && (
          <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Choose or Enter Unit to Summarize
            </label>

            {/* Quick detected unit chips */}
            {activeDoc.detectedUnits.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeDoc.detectedUnits.map((unit, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedUnit(unit);
                      setCustomUnit('');
                    }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      selectedUnit === unit && !customUnit
                        ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                    }`}
                  >
                    {unit}
                  </button>
                ))}
              </div>
            )}

            {/* Custom Unit input */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={customUnit}
                onChange={(e) => setCustomUnit(e.target.value)}
                placeholder="Or type custom unit / module name (e.g. Unit 3: Trees & Graphs)..."
                className="flex-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mt-5 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Powered by Gemini 3.8 Flash • High precision academic output
          </span>
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Synthesizing Summary...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>
                  {scope === 'full' ? 'Generate Full Syllabus Summary' : 'Summarize Selected Unit'}
                </span>
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

      {/* Output Card */}
      {summary ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-fade-in">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                {scope === 'full' ? 'Executive Course Overview' : `Unit Deep Dive: ${customUnit || selectedUnit}`}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {scope === 'full' ? 'Complete Syllabus Summary' : 'Unit Learning Objectives & Focus Points'}
              </h2>
            </div>
            <button
              onClick={handleGenerateSummary}
              disabled={isLoading}
              className="text-xs text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
              title="Regenerate summary"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Regenerate</span>
            </button>
          </div>

          <MarkdownView content={summary} />
        </div>
      ) : !isLoading ? (
        <div className="border border-dashed border-slate-200 bg-white/60 rounded-2xl p-10 text-center">
          <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            No Summary Generated Yet
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Choose whether to summarize the full course syllabus or drill into a specific module, then click the button above.
          </p>
        </div>
      ) : null}
    </div>
  );
};

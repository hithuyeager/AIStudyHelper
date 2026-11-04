import React, { useState } from 'react';
import {
  Lightbulb,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  Smile,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { SyllabusDocument } from '../types';
import { MarkdownView } from './MarkdownView';

interface ExplainerToolProps {
  activeDoc: SyllabusDocument | null;
  onNavigateToUpload: () => void;
}

export const ExplainerTool: React.FC<ExplainerToolProps> = ({
  activeDoc,
  onNavigateToUpload,
}) => {
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState<'freshman' | 'analogy' | 'eli5'>('freshman');
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Suggest sample topics based on active syllabus
  const getTopicSuggestions = () => {
    if (!activeDoc) return [];
    if (activeDoc.id.includes('cs204')) {
      return [
        'AVL Tree Balancing & Rotations',
        'Dynamic Programming vs Memoization',
        "Dijkstra's Shortest Path Algorithm",
        'Master Theorem for Recurrences',
        'Hash Collisions & Quadratic Probing',
      ];
    }
    if (activeDoc.id.includes('ee104')) {
      return [
        'Karnaugh Maps & Don’t Care Conditions',
        'Mealy vs Moore State Machines',
        'Direct Mapped vs Set Associative Cache',
        'Pipelining Hazards & Branch Prediction',
      ];
    }
    if (activeDoc.id.includes('bio210')) {
      return [
        'CRISPR-Cas9 Gene Editing Mechanism',
        'Oxidative Phosphorylation & ATP Synthase',
        'Lac Operon Positive vs Negative Regulation',
        'G-Protein Coupled Receptors (GPCRs)',
      ];
    }
    // Generic extraction from detected units
    return activeDoc.detectedUnits.slice(0, 5).map((u) => u.replace(/^Unit \d+:\s*/, ''));
  };

  const topicSuggestions = getTopicSuggestions();

  const handleExplain = async (topicToExplain?: string) => {
    const targetTopic = (topicToExplain || topic).trim();
    if (!targetTopic || !activeDoc) return;

    if (topicToExplain) {
      setTopic(topicToExplain);
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/study-tools/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: targetTopic,
          syllabusText: activeDoc.extractedText,
          style,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to explain topic.');
      }

      setExplanation(data.explanation);
    } catch (err: any) {
      console.error('Explainer error:', err);
      setError(err.message || 'An error occurred while generating explanation.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <Lightbulb className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Upload a Syllabus to Use Concept Explainer
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          Demystify complex academic topics using intuitive real-world analogies, step-by-step breakdowns, and exam memory hooks.
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
      {/* Configuration Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center gap-3 pb-5 border-b border-slate-100">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Difficult Topic Explainer
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Break down challenging syllabus concepts into clear analogies and high-retention mental models.
            </p>
          </div>
        </div>

        {/* Input & Style */}
        <div className="mt-5 space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Topic or Concept to Demystify
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleExplain();
                }}
                placeholder="e.g. Dynamic Programming, AVL Tree Rotations, Dijkstra's Algorithm, Karnaugh Maps..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <button
                onClick={() => handleExplain()}
                disabled={!topic.trim() || isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200 disabled:opacity-40"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Explain</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick suggestions */}
          {topicSuggestions.length > 0 && (
            <div>
              <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                Suggested from this syllabus:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {topicSuggestions.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleExplain(item)}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 transition-colors"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Explanation Style Selector */}
          <div className="pt-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5">
              Explanation Persona &amp; Style
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  id: 'freshman',
                  label: 'College Senior Mentor',
                  desc: 'Intuitive, precise, friendly & zero gatekeeping',
                },
                {
                  id: 'analogy',
                  label: 'Everyday Real-World Analogy',
                  desc: 'Everyday physical analogies (traffic, cooking, sports)',
                },
                {
                  id: 'eli5',
                  label: 'Ultra-Simple (No Jargon)',
                  desc: 'Plain English without unnecessary academic formulas',
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setStyle(item.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    style === item.id
                      ? 'border-indigo-600 bg-indigo-50/70 ring-1 ring-indigo-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p
                    className={`text-xs font-bold ${
                      style === item.id ? 'text-indigo-900' : 'text-slate-800'
                    }`}
                  >
                    {item.label}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                    {item.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Error notification */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Explanation Output */}
      {explanation && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-fade-in space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Syllabus Topic Demystified
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                {topic}
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              Style: {style}
            </span>
          </div>

          <MarkdownView content={explanation} />
        </div>
      )}

      {!explanation && !isLoading && (
        <div className="border border-dashed border-slate-200 bg-white/60 rounded-2xl p-10 text-center">
          <Smile className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            Ready to Explain Any Topic
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Pick a topic from the quick tags or type any term from the syllabus to get an intuitive explanation.
          </p>
        </div>
      )}
    </div>
  );
};

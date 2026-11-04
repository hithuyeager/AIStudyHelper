import React, { useState } from 'react';
import {
  CalendarCheck2,
  Sparkles,
  BookOpen,
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  Calendar,
  Layers,
} from 'lucide-react';
import { SyllabusDocument } from '../types';
import { MarkdownView } from './MarkdownView';

interface StudyPlanToolProps {
  activeDoc: SyllabusDocument | null;
  onNavigateToUpload: () => void;
}

export const StudyPlanTool: React.FC<StudyPlanToolProps> = ({
  activeDoc,
  onNavigateToUpload,
}) => {
  const [totalDays, setTotalDays] = useState<number>(14);
  const [hoursPerDay, setHoursPerDay] = useState<number>(3);
  const [plan, setPlan] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGeneratePlan = async () => {
    if (!activeDoc) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/study-tools/study-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          syllabusText: activeDoc.extractedText,
          documentName: activeDoc.name,
          totalDays,
          hoursPerDay,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate revision schedule.');
      }

      setPlan(data.plan);
    } catch (err: any) {
      console.error('Study plan error:', err);
      setError(err.message || 'An error occurred while generating study plan.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <CalendarCheck2 className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Upload a Syllabus to Build a Revision Plan
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          Generate an actionable, day-by-day revision timetable calibrated to your course modules and timeline.
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
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CalendarCheck2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
              Exam Revision Schedule
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Personalized spaced-repetition timetable based on the units in{' '}
              <strong className="text-slate-700">{activeDoc.name}</strong>.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
          {/* Days */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-600" />
              Target Revision Horizon
            </label>
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              {[
                { days: 7, label: '7-Day Sprint' },
                { days: 14, label: '14-Day Standard' },
                { days: 30, label: '30-Day Mastery' },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setTotalDays(opt.days)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    totalDays === opt.days
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Daily commitment */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-600" />
              Daily Study Commitment
            </label>
            <div className="flex rounded-lg bg-slate-100 p-1 border border-slate-200">
              {[
                { hrs: 2, label: '2 Hours / Day' },
                { hrs: 3, label: '3 Hours / Day' },
                { hrs: 4, label: '4 Hours / Day' },
              ].map((opt) => (
                <button
                  key={opt.hrs}
                  type="button"
                  onClick={() => setHoursPerDay(opt.hrs)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    hoursPerDay === opt.hrs
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Distributes heavier modules logically with dedicated review days.
          </span>
          <button
            onClick={handleGeneratePlan}
            disabled={isLoading}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm shadow-indigo-200 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Designing Revision Schedule...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Revision Plan</span>
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

      {/* Plan Render */}
      {plan && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs animate-fade-in space-y-4">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {totalDays}-Day Spaced Revision Timetable
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-1">
                Strategic Study Schedule for {activeDoc.name}
              </h2>
            </div>
            <span className="text-xs text-slate-500">
              {hoursPerDay} hrs/day • Total {totalDays * hoursPerDay} study hours
            </span>
          </div>

          <MarkdownView content={plan} />
        </div>
      )}

      {!plan && !isLoading && (
        <div className="border border-dashed border-slate-200 bg-white/60 rounded-2xl p-10 text-center">
          <CalendarCheck2 className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-slate-700">
            No Study Plan Generated
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Choose your exam preparation timeline above and click &quot;Generate Revision Plan&quot;.
          </p>
        </div>
      )}
    </div>
  );
};

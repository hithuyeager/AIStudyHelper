import React from 'react';
import {
  GraduationCap,
  FileText,
  RefreshCw,
  Sparkles,
  BookOpen,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { SyllabusDocument } from '../types';

interface HeaderProps {
  activeDoc: SyllabusDocument | null;
  onOpenUpload: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeDoc,
  onOpenUpload,
  onToggleSidebar,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-6 py-3 transition-colors shadow-xs">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">
                  StudyMate AI
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  Academic Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Syllabus-Grounded AI Study Assistant
              </p>
            </div>
          </div>
        </div>

        {/* Right: Active Document Badge & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {activeDoc ? (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-1.5 sm:px-3 sm:py-1.5 shadow-xs">
              <div className="w-7 h-7 rounded-md bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div className="text-left hidden md:block max-w-[210px] truncate">
                <p className="text-xs font-semibold text-slate-900 truncate">
                  {activeDoc.name}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span>{activeDoc.numPages} pg{activeDoc.numPages > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{(activeDoc.characterCount / 1000).toFixed(1)}k chars</span>
                  <span>•</span>
                  <span className="text-emerald-600 font-medium flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 inline" /> Grounded
                  </span>
                </div>
              </div>

              <button
                onClick={onOpenUpload}
                className="ml-1 text-xs px-2.5 py-1 text-slate-700 bg-white hover:bg-slate-100 hover:text-indigo-600 border border-slate-200 rounded-md font-medium transition-colors flex items-center gap-1 shadow-2xs"
                title="Replace or switch syllabus"
              >
                <RefreshCw className="w-3 h-3" />
                <span className="hidden sm:inline">Switch</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenUpload}
              className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm shadow-indigo-200"
            >
              <BookOpen className="w-4 h-4" />
              <span>Upload Syllabus PDF</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

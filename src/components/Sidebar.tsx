import React from 'react';
import {
  FileText,
  MessageSquare,
  FileCheck2,
  HelpCircle,
  BookMarked,
  Lightbulb,
  CalendarCheck2,
  X,
  Upload,
  Layers,
  Sparkles,
} from 'lucide-react';
import { SyllabusDocument, ViewType } from '../types';

interface SidebarProps {
  activeView: ViewType;
  onSelectView: (view: ViewType) => void;
  activeDoc: SyllabusDocument | null;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  activeDoc,
  isOpen,
  onClose,
}) => {
  const navItems = [
    {
      id: 'upload' as ViewType,
      label: 'Syllabus Document',
      description: 'Upload & active details',
      icon: Upload,
      badge: activeDoc ? 'Active' : 'Required',
      badgeColor: activeDoc ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700',
    },
    {
      id: 'chat' as ViewType,
      label: 'AI Study Chat',
      description: 'Grounded syllabus Q&A',
      icon: MessageSquare,
      badge: 'Core',
      badgeColor: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 'summary' as ViewType,
      label: 'Syllabus & Unit Summaries',
      description: 'Executive & unit breakdown',
      icon: FileCheck2,
    },
    {
      id: 'quiz' as ViewType,
      label: 'Practice MCQs Quiz',
      description: 'Interactive test prep',
      icon: HelpCircle,
      badge: 'Interactive',
      badgeColor: 'bg-purple-100 text-purple-700',
    },
    {
      id: 'question-bank' as ViewType,
      label: 'Exam Question Bank',
      description: 'Short & long answer bank',
      icon: BookMarked,
    },
    {
      id: 'explainer' as ViewType,
      label: 'Topic Explainer',
      description: 'Simple terms & analogies',
      icon: Lightbulb,
    },
    {
      id: 'study-plan' as ViewType,
      label: 'Revision Schedule',
      description: 'Spaced study timetable',
      icon: CalendarCheck2,
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-slate-900 text-slate-200 border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static flex flex-col justify-between ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header inside sidebar for mobile */}
        <div>
          <div className="flex items-center justify-between p-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm tracking-tight">
                  StudyMate AI
                </span>
                <p className="text-[11px] text-slate-400">Navigation Suite</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Workspace & Tools
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              const isLocked = !activeDoc && item.id !== 'upload';

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectView(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative ${
                    isActive
                      ? 'bg-indigo-600 text-white font-medium shadow-sm shadow-indigo-900/50'
                      : isLocked
                      ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 mt-0.5 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs sm:text-sm truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold uppercase tracking-wider shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : item.badgeColor || 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-[11px] truncate ${
                        isActive ? 'text-indigo-100' : 'text-slate-400'
                      }`}
                    >
                      {item.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Syllabus Status Card */}
        <div className="p-3 border-t border-slate-800">
          {activeDoc ? (
            <div className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/80 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-medium text-[11px] flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  Loaded Syllabus
                </span>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="font-semibold text-slate-100 truncate mb-1" title={activeDoc.name}>
                {activeDoc.name}
              </p>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{activeDoc.numPages} Page{activeDoc.numPages > 1 ? 's' : ''}</span>
                <span>{activeDoc.detectedUnits.length} Units detected</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/50 rounded-xl p-3 border border-dashed border-slate-700 text-xs text-center">
              <Sparkles className="w-4 h-4 mx-auto text-indigo-400 mb-1" />
              <p className="font-medium text-slate-300">No Syllabus Uploaded</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Upload a PDF or select a sample to enable AI study tools.
              </p>
            </div>
          )}

          <div className="mt-3 px-2 text-center">
            <span className="text-[10px] text-slate-400 font-mono">
              College Academic Project • v1.0
            </span>
          </div>
        </div>
      </aside>
    </>
  );
};

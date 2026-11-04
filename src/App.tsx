import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { PdfUploader } from './components/PdfUploader';
import { ChatView } from './components/ChatView';
import { SummaryTool } from './components/SummaryTool';
import { QuizTool } from './components/QuizTool';
import { QuestionBankTool } from './components/QuestionBankTool';
import { ExplainerTool } from './components/ExplainerTool';
import { StudyPlanTool } from './components/StudyPlanTool';
import { SyllabusDocument, ViewType } from './types';
import { SAMPLE_SYLLABI } from './data/sampleSyllabi';

export default function App() {
  // Pre-load with the authentic CS 204 Data Structures & Algorithms syllabus so everything works instantly
  const [activeDoc, setActiveDoc] = useState<SyllabusDocument | null>(() => {
    return SAMPLE_SYLLABI[0];
  });

  const [activeView, setActiveView] = useState<ViewType>('chat');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  const handleDocumentLoaded = (doc: SyllabusDocument) => {
    setActiveDoc(doc);
    setActiveView('chat');
  };

  const handleDocumentRemoved = () => {
    setActiveDoc(null);
    setActiveView('upload');
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans antialiased selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Navigation Bar */}
      <Header
        activeDoc={activeDoc}
        onOpenUpload={() => setActiveView('upload')}
        onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(view) => setActiveView(view)}
          activeDoc={activeDoc}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Dynamic Content Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {activeView === 'upload' && (
            <PdfUploader
              activeDoc={activeDoc}
              onDocumentLoaded={handleDocumentLoaded}
              onDocumentRemoved={handleDocumentRemoved}
              onNavigateToChat={() => setActiveView('chat')}
            />
          )}

          {activeView === 'chat' && (
            <ChatView
              activeDoc={activeDoc}
              onNavigateToUpload={() => setActiveView('upload')}
            />
          )}

          {activeView === 'summary' && (
            <SummaryTool
              activeDoc={activeDoc}
              onNavigateToUpload={() => setActiveView('upload')}
            />
          )}

          {activeView === 'quiz' && (
            <QuizTool
              activeDoc={activeDoc}
              onNavigateToUpload={() => setActiveView('upload')}
            />
          )}

          {activeView === 'question-bank' && (
            <QuestionBankTool
              activeDoc={activeDoc}
              onNavigateToUpload={() => setActiveView('upload')}
            />
          )}

          {activeView === 'explainer' && (
            <ExplainerTool
              activeDoc={activeDoc}
              onNavigateToUpload={() => setActiveView('upload')}
            />
          )}

          {activeView === 'study-plan' && (
            <StudyPlanTool
              activeDoc={activeDoc}
              onNavigateToUpload={() => setActiveView('upload')}
            />
          )}
        </main>
      </div>
    </div>
  );
}

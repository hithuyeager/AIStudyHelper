import React, { useState, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Sparkles,
  Layers,
  FileCheck,
  FileWarning,
  Eye,
  Loader2,
  Cpu,
  Dna,
  Binary,
} from 'lucide-react';
import { SyllabusDocument } from '../types';
import { SAMPLE_SYLLABI } from '../data/sampleSyllabi';

interface PdfUploaderProps {
  activeDoc: SyllabusDocument | null;
  onDocumentLoaded: (doc: SyllabusDocument) => void;
  onDocumentRemoved: () => void;
  onNavigateToChat: () => void;
}

export const PdfUploader: React.FC<PdfUploaderProps> = ({
  activeDoc,
  onDocumentLoaded,
  onDocumentRemoved,
  onNavigateToChat,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showFullText, setShowFullText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const processFile = async (file: File) => {
    setErrorMessage(null);

    // Validate extension
    const validExtensions = ['.pdf', '.txt', '.md'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      setErrorMessage(
        'Invalid file type. Please upload a PDF syllabus (.pdf) or text/markdown document (.txt, .md).'
      );
      return;
    }

    if (file.size === 0) {
      setErrorMessage('The selected file is empty (0 bytes). Please select a valid syllabus.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setErrorMessage('File size exceeds 25MB limit. Please upload a smaller document.');
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload-pdf', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process syllabus PDF.');
      }

      const newDoc: SyllabusDocument = {
        id: `doc-${Date.now()}`,
        name: data.filename || file.name,
        characterCount: data.characterCount || 0,
        numPages: data.numPages || 1,
        fileSize: data.fileSize || file.size,
        uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extractedText: data.extractedText,
        textSnippet: data.textSnippet || data.extractedText.slice(0, 300),
        detectedUnits: data.detectedUnits || [],
      };

      onDocumentLoaded(newDoc);
    } catch (err: any) {
      console.error('Upload error:', err);
      setErrorMessage(
        err.message || 'An error occurred during file upload. Please verify the PDF is readable.'
      );
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const loadSample = (sample: SyllabusDocument) => {
    setErrorMessage(null);
    onDocumentLoaded({
      ...sample,
      uploadedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white/10 backdrop-blur-xs text-indigo-200 border border-white/10 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Academic Syllabus Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Upload Your Course Syllabus
          </h1>
          <p className="text-sm sm:text-base text-indigo-100 leading-relaxed">
            Upload your syllabus PDF to unlock grounded AI Q&amp;A, full summaries, unit-by-unit breakdowns, practice MCQs, exam question banks, and topic explanations.
          </p>
        </div>

        {/* Decorative background shapes */}
        <div className="absolute right-0 -bottom-10 opacity-10 pointer-events-none">
          <BookOpen className="w-72 h-72 text-white" />
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl flex items-start gap-3 shadow-2xs animate-fade-in">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-semibold">Upload Notice</p>
            <p className="text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-700 text-xs font-bold px-2 py-1"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active Document Card (if loaded) */}
      {activeDoc ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <FileCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                    {activeDoc.name}
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Session Ready
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Uploaded at {activeDoc.uploadedAt} • Document size: {(activeDoc.fileSize / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <Upload className="w-4 h-4" />
                <span>Replace File</span>
              </button>
              <button
                onClick={onDocumentRemoved}
                className="px-3.5 py-2 text-xs sm:text-sm font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors flex items-center gap-1.5"
                title="Remove syllabus"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-6">
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">Document Pages</span>
              <span className="text-xl font-bold text-slate-900">{activeDoc.numPages}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">Extracted Characters</span>
              <span className="text-xl font-bold text-slate-900">
                {activeDoc.characterCount.toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">Estimated Words</span>
              <span className="text-xl font-bold text-slate-900">
                {Math.round(activeDoc.characterCount / 5.5).toLocaleString()}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
              <span className="text-xs text-slate-500 block mb-1">Detected Units</span>
              <span className="text-xl font-bold text-indigo-600">
                {activeDoc.detectedUnits.length}
              </span>
            </div>
          </div>

          {/* Detected Units Tags */}
          {activeDoc.detectedUnits.length > 0 && (
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-500" />
                Detected Units &amp; Modules
              </h3>
              <div className="flex flex-wrap gap-2">
                {activeDoc.detectedUnits.map((unit, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-100"
                  >
                    <BookOpen className="w-3 h-3 text-indigo-600" />
                    {unit}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Extracted Text Snippet */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-500" />
                Extracted Syllabus Text
              </span>
              <button
                onClick={() => setShowFullText(!showFullText)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
              >
                <Eye className="w-3.5 h-3.5" />
                {showFullText ? 'Collapse Text' : 'View Full Extracted Text'}
              </button>
            </div>
            <pre className="text-xs font-mono text-slate-700 whitespace-pre-wrap max-h-48 overflow-y-auto bg-white p-3 rounded-lg border border-slate-200 leading-relaxed">
              {showFullText ? activeDoc.extractedText : activeDoc.textSnippet}
            </pre>
          </div>

          {/* Action Launch Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Ready to study! Ask questions, generate practice quizzes, or summarize units.
            </p>
            <button
              onClick={onNavigateToChat}
              className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-sm shadow-indigo-200"
            >
              <span>Launch AI Study Chat</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
            isDragging
              ? 'border-indigo-600 bg-indigo-50/60 scale-[1.005]'
              : 'border-slate-300 hover:border-indigo-400 bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md,application/pdf"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
              {isUploading ? (
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
              ) : (
                <Upload className="w-8 h-8" />
              )}
            </div>

            {isUploading ? (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Extracting Syllabus Content...
                </h3>
                <p className="text-xs text-slate-500">
                  Parsing PDF text layers, extracting course modules, and preparing study context.
                </p>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Drag and drop your syllabus PDF here
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mb-5">
                  Supports standard university syllabus PDFs (.pdf), course text files (.txt), or markdown notes (.md).
                </p>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm shadow-indigo-200 inline-flex items-center gap-2 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>Browse Syllabus File</span>
                </button>

                <p className="text-[11px] text-slate-400 mt-3">
                  Max file size: 25MB • Local session storage (no account required)
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden file input for Replace File action */}
      {activeDoc && (
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.md,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />
      )}

      {/* Quick Load Sample Syllabi Section */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span>Or Try with a Sample Syllabus</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Click any authentic curriculum below to immediately test grounded Q&amp;A, summaries, and quizzes.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SAMPLE_SYLLABI.map((sample) => {
            const isCurrentlyActive = activeDoc?.id === sample.id;
            let Icon = Binary;
            if (sample.id.includes('ee')) Icon = Cpu;
            if (sample.id.includes('bio')) Icon = Dna;

            return (
              <div
                key={sample.id}
                className={`bg-white rounded-xl p-4 border transition-all text-left flex flex-col justify-between ${
                  isCurrentlyActive
                    ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    {isCurrentlyActive && (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        Active
                      </span>
                    )}
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                    {sample.name.replace(/_/g, ' ').replace('.pdf', '')}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {sample.textSnippet.slice(0, 110)}...
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {sample.numPages} pages • {sample.detectedUnits.length} Units
                  </span>
                  <button
                    onClick={() => loadSample(sample)}
                    disabled={isCurrentlyActive}
                    className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                      isCurrentlyActive
                        ? 'bg-slate-100 text-slate-400 cursor-default'
                        : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                    }`}
                  >
                    {isCurrentlyActive ? 'Loaded' : 'Load Syllabus'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

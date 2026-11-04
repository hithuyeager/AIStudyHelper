import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  RotateCcw,
  Download,
  AlertCircle,
  HelpCircle,
  BookOpen,
  ArrowRight,
  Loader2,
  FileText,
} from 'lucide-react';
import { SyllabusDocument, ChatMessage } from '../types';
import { MarkdownView } from './MarkdownView';

interface ChatViewProps {
  activeDoc: SyllabusDocument | null;
  onNavigateToUpload: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  activeDoc,
  onNavigateToUpload,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'welcome',
        role: 'assistant',
        content: activeDoc
          ? `Hello! I am your StudyMate assistant for **${activeDoc.name}**.\n\nI have indexed the syllabus details including course policies, grading weights, textbooks, and ${activeDoc.detectedUnits.length} detected modules. You can ask me anything about your course schedule, exams, concepts, or academic requirements.\n\n*Note: All answers are strictly grounded in your syllabus. If a detail is not present in the document, I will clearly let you know.*`
          : `Welcome to **StudyMate AI**! Please upload or select a syllabus PDF first to begin grounded academic study sessions.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // If activeDoc changes, update initial message if only welcome was present
  useEffect(() => {
    if (activeDoc) {
      setMessages((prev) => {
        if (prev.length <= 1) {
          return [
            {
              id: `welcome-${activeDoc.id}`,
              role: 'assistant',
              content: `Hello! I am your StudyMate assistant for **${activeDoc.name}**.\n\nI have loaded your syllabus (${activeDoc.numPages} pages, ${activeDoc.detectedUnits.length} units detected). Ask me about:\n- Grading weights & exam dates\n- Unit breakdowns & required readings\n- Late assignment and attendance policies\n- Concept explanations from any unit\n\n*All responses are strictly grounded in your syllabus.*`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ];
        }
        return prev;
      });
    }
  }, [activeDoc?.id]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || isLoading || !activeDoc) return;

    setApiError(null);
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputPrompt('');
    setIsLoading(true);

    try {
      // Send chat history and syllabus text to backend proxy
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          syllabusText: activeDoc.extractedText,
          documentName: activeDoc.name,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to receive response from Gemini API.');
      }

      const assistantMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply || 'No response formulated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setApiError(
        err.message || 'An error occurred while contacting the AI study assistant.'
      );
    } finally {
      setIsLoading(false);
      // refocus input
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear conversation history?')) {
      setMessages([
        {
          id: `welcome-${Date.now()}`,
          role: 'assistant',
          content: `Conversation cleared. What would you like to explore in **${
            activeDoc?.name || 'your syllabus'
          }**?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setApiError(null);
    }
  };

  const handleExportChat = () => {
    const formatted = messages
      .map((m) => `[${m.timestamp}] ${m.role === 'user' ? 'Student' : 'StudyMate AI'}:\n${m.content}\n\n---\n`)
      .join('\n');
    const blob = new Blob([formatted], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `StudyMate_Chat_${activeDoc?.name || 'Syllabus'}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const samplePrompts = [
    'What are the grading weights and assessment percentages?',
    'When are the midterm and final exams scheduled?',
    'What is the policy on late assignment submissions?',
    'What textbooks and reference materials are required?',
    'Who is the instructor and when are their office hours?',
    'What topics are covered in Unit 2?',
  ];

  if (!activeDoc) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-xs">
          <BookOpen className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
          Upload a Syllabus to Start Studying
        </h2>
        <p className="text-slate-600 text-sm max-w-md mx-auto mb-6">
          To ensure accurate and strictly grounded answers, please upload your course syllabus PDF or select a pre-loaded curriculum sample.
        </p>
        <button
          onClick={onNavigateToUpload}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors inline-flex items-center gap-2 shadow-sm shadow-indigo-200"
        >
          <span>Go to Syllabus Upload</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-[calc(100vh-8.5rem)] min-h-[500px]">
      {/* Top Chat Bar */}
      <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 px-4 py-3 flex items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
            <Bot className="w-4 h-4" />
          </div>
          <div className="truncate">
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                AI Study Assistant
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3 h-3" />
                Grounded to {activeDoc.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate">
              Answers are strictly drawn from course document text.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleExportChat}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors text-xs flex items-center gap-1"
            title="Download conversation transcript"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          <button
            onClick={handleClearChat}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 transition-colors text-xs flex items-center gap-1"
            title="Clear chat history"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-slate-50/70 border-x border-slate-200 p-4 sm:p-6 space-y-4">
        {messages.map((message) => {
          const isUser = message.role === 'user';
          return (
            <div
              key={message.id}
              className={`flex items-start gap-3 ${
                isUser ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                  isUser
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-indigo-700 border border-slate-200'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Box */}
              <div
                className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 shadow-2xs ${
                  isUser
                    ? 'bg-indigo-600 text-white rounded-tr-xs'
                    : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-1.5 pb-1 border-b border-white/10">
                  <span
                    className={`text-[11px] font-bold ${
                      isUser ? 'text-indigo-100' : 'text-slate-900'
                    }`}
                  >
                    {isUser ? 'You' : 'StudyMate AI'}
                  </span>
                  <span
                    className={`text-[10px] ${
                      isUser ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {message.timestamp}
                  </span>
                </div>

                {isUser ? (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {message.content}
                  </p>
                ) : (
                  <MarkdownView content={message.content} />
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-white text-indigo-600 border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-4 shadow-2xs flex items-center gap-3 text-slate-600">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span className="text-xs font-medium">
                Searching syllabus text and generating grounded answer...
              </span>
            </div>
          </div>
        )}

        {/* Error notification in chat */}
        {apiError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="flex-1">{apiError}</span>
            <button
              onClick={() => handleSendMessage()}
              className="text-indigo-600 font-semibold hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Chips (if short history) */}
      <div className="bg-white border-x border-slate-200 px-4 py-2">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <HelpCircle className="w-3 h-3 text-indigo-500" />
            Ask:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 font-medium whitespace-nowrap transition-colors shrink-0 disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <div className="bg-white rounded-b-2xl border border-t border-slate-200 p-3 sm:p-4 shadow-xs">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-end gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask any question about ${activeDoc.name}... (Press Enter to send)`}
              rows={2}
              className="w-full resize-none rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 placeholder:text-slate-400 bg-slate-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="h-11 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shadow-sm shadow-indigo-200 disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>Ask</span>
                <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Check, Copy } from 'lucide-react';

interface MarkdownViewProps {
  content: string;
  className?: string;
}

export const MarkdownView: React.FC<MarkdownViewProps> = ({ content, className = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded text-xs flex items-center gap-1 shadow-sm border border-slate-200 z-10"
        title="Copy text"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5" />
            <span>Copy</span>
          </>
        )}
      </button>

      <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed text-sm sm:text-base">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ node, ...props }) => (
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-6 mb-3 pb-2 border-b border-slate-200" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 mt-5 mb-2.5 pb-1 border-b border-slate-100" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-base sm:text-lg font-semibold text-indigo-950 mt-4 mb-2" {...props} />
            ),
            p: ({ node, ...props }) => (
              <p className="mb-3 text-slate-700 leading-relaxed" {...props} />
            ),
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-outside pl-5 mb-3 space-y-1 text-slate-700" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-outside pl-5 mb-3 space-y-1 text-slate-700" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="leading-relaxed" {...props} />
            ),
            blockquote: ({ node, ...props }) => (
              <blockquote className="border-l-4 border-indigo-400 pl-4 py-1 italic bg-indigo-50/50 rounded-r my-3 text-slate-700" {...props} />
            ),
            code: ({ node, className, children, ...props }) => {
              const isInline = !className?.includes('language-');
              return isInline ? (
                <code className="bg-slate-100 text-indigo-700 px-1.5 py-0.5 rounded text-xs font-mono border border-slate-200" {...props}>
                  {children}
                </code>
              ) : (
                <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-lg overflow-x-auto text-xs sm:text-sm font-mono my-3 shadow-inner">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 border border-slate-200 rounded-lg shadow-xs">
                <table className="w-full text-left text-sm border-collapse" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-slate-100/90 text-slate-800 font-semibold border-b border-slate-200" {...props} />
            ),
            th: ({ node, ...props }) => (
              <th className="px-3.5 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3.5 py-2.5 border-b border-slate-100 text-slate-700 text-sm" {...props} />
            ),
            strong: ({ node, ...props }) => (
              <strong className="font-semibold text-slate-900" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

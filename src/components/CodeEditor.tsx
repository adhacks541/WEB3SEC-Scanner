'use client';

import React, { useMemo, useRef } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-solidity';

interface CodeEditorProps {
  code: string;
  onChange: (code: string) => void;
  fileName?: string;
}

export default function CodeEditor({ code, onChange, fileName = 'Contract.sol' }: CodeEditorProps) {
  const lineNumbersRef = useRef<HTMLDivElement>(null);
  const highlightedCodeRef = useRef<HTMLElement>(null);

  const highlightedCode = useMemo(() => {
    if (!Prism.languages.solidity) {
      return escapeHtml(code);
    }

    return Prism.highlight(code, Prism.languages.solidity, 'solidity');
  }, [code]);

  const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(event.target.value);
  };

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const target = event.currentTarget;

    if (lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = target.scrollTop;
    }

    if (highlightedCodeRef.current) {
      highlightedCodeRef.current.style.transform = `translate(${-target.scrollLeft}px, ${-target.scrollTop}px)`;
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <div className="glass-panel flex h-[600px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[var(--panel-border)] bg-[#1a1a1a] px-4 py-2">
        <div>
          <span className="font-mono text-xs text-gray-400">{fileName}</span>
          <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-gray-500">Highlighted Solidity input</p>
        </div>
        <div className="flex gap-1">
          <div className="h-3 w-3 rounded-full bg-red-500/50"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500/50"></div>
          <div className="h-3 w-3 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div
          ref={lineNumbersRef}
          className="w-14 overflow-hidden border-r border-[var(--panel-border)] bg-[#111] py-4 pr-3 text-right font-mono text-sm text-gray-600 select-none"
        >
          {Array.from({ length: Math.max(lineCount, 20) }).map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>

        <div className="relative flex-1 overflow-hidden bg-[#0a0a0a]">
          <pre
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden p-4 font-mono text-sm leading-6 text-gray-300"
          >
            <code
              ref={highlightedCodeRef}
              className="language-solidity block min-h-full whitespace-pre"
              dangerouslySetInnerHTML={{ __html: `${highlightedCode}\n` }}
            />
          </pre>

          <textarea
            value={code}
            onChange={handleChange}
            onScroll={handleScroll}
            className="absolute inset-0 resize-none bg-transparent p-4 font-mono text-sm leading-6 text-transparent caret-[var(--neon-green)] focus:outline-none"
            spellCheck={false}
            placeholder="// Paste your Solidity code here..."
          />
        </div>
      </div>
    </div>
  );
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

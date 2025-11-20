'use client';

import React, { useState } from 'react';

interface CodeEditorProps {
    code: string;
    onChange: (code: string) => void;
}

export default function CodeEditor({ code, onChange }: CodeEditorProps) {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e.target.value);
    };

    const lineCount = code.split('\n').length;

    return (
        <div className="glass-panel flex flex-col h-[600px] relative group">
            <div className="bg-[#1a1a1a] px-4 py-2 border-b border-[var(--panel-border)] flex justify-between items-center">
                <span className="text-xs text-gray-400 font-mono">Contract.sol</span>
                <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
            </div>

            <div className="flex-1 flex relative overflow-hidden">
                {/* Line Numbers */}
                <div className="w-12 bg-[#111] text-gray-600 text-right pr-3 py-4 font-mono text-sm select-none border-r border-[var(--panel-border)]">
                    {Array.from({ length: Math.max(lineCount, 20) }).map((_, i) => (
                        <div key={i} className="leading-6">{i + 1}</div>
                    ))}
                </div>

                {/* Text Area */}
                <textarea
                    value={code}
                    onChange={handleChange}
                    className="flex-1 bg-[#0a0a0a] text-gray-300 p-4 font-mono text-sm resize-none focus:outline-none leading-6"
                    spellCheck={false}
                    placeholder="// Paste your Solidity code here..."
                />
            </div>
        </div>
    );
}

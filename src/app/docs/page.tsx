'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Book, Terminal, Code } from 'lucide-react';

export default function DocsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">Documentation</h1>
          <p className="mx-auto max-w-2xl text-gray-400">
            Learn what 0xSENTINEL checks today, how to interpret the output, and where lightweight scanning stops.
          </p>
        </div>

        <div className="grid gap-8">
          <section className="glass-panel p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-[var(--neon-green-dim)] p-2">
                <Terminal className="h-6 w-6 text-[var(--neon-green)]" />
              </div>
              <h2 className="text-2xl font-bold text-white">How it Works</h2>
            </div>
          <p className="mb-4 leading-relaxed text-gray-300">
              0xSENTINEL accepts pasted or uploaded Solidity source code, sends it through a Next.js server action, and runs an
              AST-backed analysis pass against common risk patterns.
            </p>
            <p className="leading-relaxed text-gray-300">
              When the parser cannot recover cleanly, the scanner falls back to regex heuristics so users still get a first-pass read.
              It remains a triage tool, not a substitute for a full manual audit or deeper symbolic analysis.
            </p>
          </section>

          <section className="glass-panel p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-blue-500/10 p-2">
                <Code className="h-6 w-6 text-blue-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Supported Checks</h2>
            </div>
            <ul className="space-y-3 text-gray-300">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-[var(--neon-green)]">✓</span>
                <span><strong>Reentrancy:</strong> Flags value-transferring external calls that often deserve manual ordering review.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-[var(--neon-green)]">✓</span>
                <span><strong>tx.origin:</strong> Identifies authorization logic that depends on `tx.origin`.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-[var(--neon-green)]">✓</span>
                <span><strong>Unchecked calls:</strong> Flags low-level calls when the success value is not obviously handled.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-[var(--neon-green)]">✓</span>
                <span><strong>Weak randomness:</strong> Flags `block.timestamp`, `block.difficulty`, and `now` when used as entropy.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-[var(--neon-green)]">✓</span>
                <span><strong>Floating pragma:</strong> Flags version ranges such as `pragma solidity ^0.8.0`.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-[var(--neon-green)]">✓</span>
                <span><strong>delegatecall risk:</strong> Highlights delegatecall usage because it executes in the caller storage context.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-[var(--neon-green)]">✓</span>
                <span><strong>selfdestruct usage:</strong> Flags shutdown primitives that can permanently alter production behavior.</span>
              </li>
            </ul>
          </section>

          <section className="glass-panel p-8">
            <div className="mb-4 flex items-center gap-3">
              <div className="rounded-lg bg-purple-500/10 p-2">
                <Book className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-2xl font-bold text-white">Best Practices</h2>
            </div>
            <div className="space-y-4">
              <div className="rounded border border-[#333] bg-[#151515] p-4">
                <h3 className="mb-2 font-bold text-white">Treat findings as leads, not verdicts</h3>
                <p className="text-sm text-gray-400">
                  Review flagged lines in context. AST-backed analysis improves precision, but contract safety still depends on
                  surrounding logic, access control, upgrade paths, and system design.
                </p>
              </div>
              <div className="rounded border border-[#333] bg-[#151515] p-4">
                <h3 className="mb-2 font-bold text-white">Checks-Effects-Interactions</h3>
                <p className="text-sm text-gray-400">
                  Update state before external calls whenever possible. This remains one of the clearest habits for preventing common
                  reentrancy mistakes.
                </p>
              </div>
              <div className="rounded border border-[#333] bg-[#151515] p-4">
                <h3 className="mb-2 font-bold text-white">Lock your compiler version</h3>
                <p className="text-sm text-gray-400">
                  Prefer exact Solidity versions so the code you audit matches the code you compile and deploy.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
}

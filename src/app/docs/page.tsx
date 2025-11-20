'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { Book, Terminal, Code } from 'lucide-react';

export default function DocsPage() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-white mb-4">Documentation</h1>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Learn how to use the Web3Sec Scanner to secure your smart contracts.
                    </p>
                </div>

                <div className="grid gap-8">
                    <section className="glass-panel p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-[var(--neon-green-dim)] rounded-lg">
                                <Terminal className="w-6 h-6 text-[var(--neon-green)]" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">How it Works</h2>
                        </div>
                        <p className="text-gray-300 leading-relaxed mb-4">
                            The Web3Sec Scanner runs entirely in your browser. It uses a static analysis engine powered by
                            regular expressions to scan your Solidity code for known vulnerability patterns.
                        </p>
                        <p className="text-gray-300 leading-relaxed">
                            Unlike other tools that require complex backend setups or Python environments,
                            this scanner provides instant feedback as you type or paste your code.
                        </p>
                    </section>

                    <section className="glass-panel p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Code className="w-6 h-6 text-blue-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Supported Checks</h2>
                        </div>
                        <ul className="space-y-3 text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--neon-green)] mt-1">✓</span>
                                <span><strong>Reentrancy:</strong> Detects unsafe external calls that can lead to reentrancy attacks.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--neon-green)] mt-1">✓</span>
                                <span><strong>Tx.Origin:</strong> Identifies phishing vulnerabilities using tx.origin for auth.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--neon-green)] mt-1">✓</span>
                                <span><strong>Weak Randomness:</strong> Flags usage of block.timestamp or block.difficulty.</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-[var(--neon-green)] mt-1">✓</span>
                                <span><strong>Unchecked Calls:</strong> Warns when low-level calls are made without checking return values.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="glass-panel p-8">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Book className="w-6 h-6 text-purple-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">Best Practices</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-[#151515] p-4 rounded border border-[#333]">
                                <h3 className="text-white font-bold mb-2">Checks-Effects-Interactions</h3>
                                <p className="text-gray-400 text-sm">
                                    Always update your state variables (Effects) before making external calls (Interactions).
                                    This simple pattern prevents most reentrancy attacks.
                                </p>
                            </div>
                            <div className="bg-[#151515] p-4 rounded border border-[#333]">
                                <h3 className="text-white font-bold mb-2">Use Latest Solidity</h3>
                                <p className="text-gray-400 text-sm">
                                    Newer versions of Solidity (0.8.0+) have built-in overflow protection.
                                    Always lock your pragma version.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </Layout>
    );
}

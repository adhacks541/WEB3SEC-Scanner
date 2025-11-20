'use client';

import React from 'react';
import Layout from '@/components/Layout';
import { VULNERABILITY_PATTERNS } from '@/lib/analyzer';
import { AlertTriangle, Shield } from 'lucide-react';

export default function VulnerabilitiesPage() {
    return (
        <Layout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-[var(--neon-green)]" />
                        Vulnerability Database
                    </h1>
                    <p className="text-gray-400">
                        Our scanner currently detects the following common smart contract vulnerabilities using static analysis patterns.
                    </p>
                </div>

                <div className="grid gap-6">
                    {VULNERABILITY_PATTERNS.map((pattern) => (
                        <div key={pattern.id} className="glass-panel p-6 border-l-4 border-l-[var(--neon-green)]">
                            <div className="flex justify-between items-start mb-3">
                                <h2 className="text-xl font-bold text-gray-200">{pattern.name}</h2>
                                <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${pattern.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                                        pattern.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                            'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {pattern.severity} Severity
                                </span>
                            </div>

                            <p className="text-gray-300 mb-4">{pattern.description}</p>

                            <div className="bg-[#151515] p-4 rounded border border-[#333]">
                                <h3 className="text-sm font-bold text-gray-500 uppercase mb-2">Remediation</h3>
                                <p className="text-gray-400 text-sm font-mono">{pattern.remediation}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </Layout>
    );
}

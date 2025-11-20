'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { AnalysisReport, Vulnerability } from '@/lib/analyzer';

interface ResultsProps {
    report: AnalysisReport | null;
    isScanning: boolean;
}

export default function Results({ report, isScanning }: ResultsProps) {
    if (isScanning) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-[var(--neon-green)]">
                <div className="w-16 h-16 border-4 border-[var(--neon-green)] border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="animate-pulse tracking-widest">SCANNING CONTRACT...</p>
            </div>
        );
    }

    if (!report) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <Info className="w-12 h-12 mb-4 opacity-50" />
                <p>Ready to scan. Paste code and hit Analyze.</p>
            </div>
        );
    }

    const highSeverity = report.vulnerabilities.filter(v => v.severity === 'High').length;
    const mediumSeverity = report.vulnerabilities.filter(v => v.severity === 'Medium').length;
    const lowSeverity = report.vulnerabilities.filter(v => v.severity === 'Low').length;
    const score = Math.max(0, 100 - (highSeverity * 20 + mediumSeverity * 10 + lowSeverity * 5));

    return (
        <div className="h-full flex flex-col gap-6 overflow-y-auto pr-2">
            {/* Score Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-6 flex items-center justify-between bg-gradient-to-r from-[var(--panel-bg)] to-[#1a1a1a]"
            >
                <div>
                    <h2 className="text-lg font-bold text-gray-300">Security Score</h2>
                    <p className="text-sm text-gray-500">Based on static analysis</p>
                </div>
                <div className={`text-4xl font-bold ${score > 80 ? 'text-[var(--neon-green)]' : score > 50 ? 'text-[var(--warning-yellow)]' : 'text-[var(--alert-red)]'}`}>
                    {score}/100
                </div>
            </motion.div>

            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-4">
                <StatCard label="High Risk" count={highSeverity} color="text-[var(--alert-red)]" />
                <StatCard label="Medium Risk" count={mediumSeverity} color="text-[var(--warning-yellow)]" />
                <StatCard label="Low Risk" count={lowSeverity} color="text-blue-400" />
            </div>

            {/* Vulnerability List */}
            <div className="flex flex-col gap-4">
                <h3 className="text-gray-400 font-mono uppercase text-sm tracking-wider mt-4">Detected Issues</h3>
                {report.vulnerabilities.length === 0 ? (
                    <div className="glass-panel p-8 text-center text-[var(--neon-green)]">
                        <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                        <p>No obvious vulnerabilities detected.</p>
                    </div>
                ) : (
                    report.vulnerabilities.map((vuln, idx) => (
                        <VulnerabilityCard key={idx} vuln={vuln} index={idx} />
                    ))
                )}
            </div>
        </div>
    );
}

function StatCard({ label, count, color }: { label: string, count: number, color: string }) {
    return (
        <div className="glass-panel p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-gray-500 uppercase mt-1">{label}</div>
        </div>
    );
}

function VulnerabilityCard({ vuln, index }: { vuln: Vulnerability, index: number }) {
    const borderColor =
        vuln.severity === 'High' ? 'border-l-[var(--alert-red)]' :
            vuln.severity === 'Medium' ? 'border-l-[var(--warning-yellow)]' :
                'border-l-blue-400';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`glass-panel p-4 border-l-4 ${borderColor} bg-[#151515]`}
        >
            <div className="flex justify-between items-start mb-2">
                <h4 className="font-bold text-gray-200 flex items-center gap-2">
                    {vuln.severity === 'High' && <AlertTriangle className="w-4 h-4 text-[var(--alert-red)]" />}
                    {vuln.name}
                </h4>
                {vuln.line && <span className="text-xs font-mono bg-[#222] px-2 py-1 rounded text-gray-400">Line {vuln.line}</span>}
            </div>
            <p className="text-sm text-gray-400 mb-3">{vuln.description}</p>
            <div className="bg-[#0f0f0f] p-3 rounded text-xs text-gray-500 font-mono border border-[#222]">
                <strong className="text-gray-400">Fix:</strong> {vuln.remediation}
            </div>
        </motion.div>
    );
}

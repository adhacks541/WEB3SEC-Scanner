'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, CheckCircle, Info, ShieldAlert } from 'lucide-react';
import { AnalysisReport, Vulnerability, calculateSecurityScore } from '@/lib/analyzer';

interface ResultsProps {
  report: AnalysisReport | null;
  isScanning: boolean;
  errorMessage?: string | null;
}

export default function Results({ report, isScanning, errorMessage }: ResultsProps) {
  if (isScanning) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-[var(--neon-green)]">
        <div className="mb-4 h-16 w-16 animate-spin rounded-full border-4 border-[var(--neon-green)] border-t-transparent"></div>
        <p className="animate-pulse tracking-widest">SCANNING CONTRACT...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="glass-panel flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
        <ShieldAlert className="h-12 w-12 text-[var(--alert-red)]" />
        <div>
          <p className="font-semibold text-white">Analysis unavailable</p>
          <p className="mt-2 text-sm text-gray-400">{errorMessage}</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center text-gray-500">
        <Info className="mb-4 h-12 w-12 opacity-50" />
        <p className="font-medium text-gray-300">Ready for a first-pass scan.</p>
        <p className="mt-2 max-w-sm text-sm text-gray-500">
          Paste Solidity code and run the analyzer to surface likely issues, then verify findings during review.
        </p>
      </div>
    );
  }

  const highSeverity = report.vulnerabilities.filter((vulnerability) => vulnerability.severity === 'High').length;
  const mediumSeverity = report.vulnerabilities.filter((vulnerability) => vulnerability.severity === 'Medium').length;
  const lowSeverity = report.vulnerabilities.filter((vulnerability) => vulnerability.severity === 'Low').length;
  const score = calculateSecurityScore(report.vulnerabilities);
  const generatedAt = new Date(report.timestamp).toLocaleString();

  return (
    <div className="flex h-full flex-col gap-6 overflow-y-auto pr-2">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel flex items-center justify-between bg-gradient-to-r from-[var(--panel-bg)] to-[#1a1a1a] p-6"
      >
        <div>
          <h2 className="text-lg font-bold text-gray-300">Security Score</h2>
          <p className="text-sm text-gray-500">
            {report.mode === 'AST' ? 'AST-backed analysis for higher-precision triage' : 'Regex fallback analysis for fast recovery'}
          </p>
          <p className="mt-3 text-xs uppercase tracking-[0.2em] text-gray-500">
            {report.contractName} • {report.mode} mode
          </p>
        </div>
        <div
          className={`text-4xl font-bold ${
            score > 80 ? 'text-[var(--neon-green)]' : score > 50 ? 'text-[var(--warning-yellow)]' : 'text-[var(--alert-red)]'
          }`}
        >
          {score}/100
        </div>
      </motion.div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="High Risk" count={highSeverity} color="text-[var(--alert-red)]" />
        <StatCard label="Medium Risk" count={mediumSeverity} color="text-[var(--warning-yellow)]" />
        <StatCard label="Low Risk" count={lowSeverity} color="text-blue-400" />
      </div>

      <div className="rounded-lg border border-[#232323] bg-[#101010] px-4 py-3 text-xs text-gray-400">
        Findings are heuristics, not an audit. Review each flagged line manually before treating it as a confirmed issue.
        <span className="ml-2 text-gray-500">Generated {generatedAt}</span>
      </div>

      {report.warnings?.length ? (
        <div className="rounded-lg border border-[var(--warning-yellow)]/40 bg-[var(--warning-yellow-dim)] px-4 py-3 text-sm text-yellow-200">
          {report.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <div className="flex flex-col gap-4">
        <h3 className="mt-4 font-mono text-sm uppercase tracking-wider text-gray-400">Detected Issues</h3>
        {report.vulnerabilities.length === 0 ? (
          <div className="glass-panel p-8 text-center text-[var(--neon-green)]">
            <CheckCircle className="mx-auto mb-2 h-12 w-12" />
            <p className="font-medium">No obvious issues detected in this pass.</p>
            <p className="mt-2 text-sm text-gray-400">
              That does not guarantee the contract is safe. Use manual review and deeper tooling before deployment.
            </p>
          </div>
        ) : (
          report.vulnerabilities.map((vulnerability, index) => (
            <VulnerabilityCard key={`${vulnerability.id}-${vulnerability.line ?? index}`} vuln={vulnerability} index={index} />
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="glass-panel p-4 text-center">
      <div className={`text-2xl font-bold ${color}`}>{count}</div>
      <div className="mt-1 text-xs uppercase text-gray-500">{label}</div>
    </div>
  );
}

function VulnerabilityCard({ vuln, index }: { vuln: Vulnerability; index: number }) {
  const borderColor =
    vuln.severity === 'High'
      ? 'border-l-[var(--alert-red)]'
      : vuln.severity === 'Medium'
        ? 'border-l-[var(--warning-yellow)]'
        : 'border-l-blue-400';

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.08 }}
      className={`glass-panel border-l-4 bg-[#151515] p-4 ${borderColor}`}
    >
      <div className="mb-2 flex items-start justify-between">
        <div>
          <h4 className="flex items-center gap-2 font-bold text-gray-200">
            {vuln.severity === 'High' && <AlertTriangle className="h-4 w-4 text-[var(--alert-red)]" />}
            {vuln.name}
          </h4>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-gray-500">
            {vuln.severity} severity{vuln.confidence ? ` • ${vuln.confidence} confidence` : ''}
          </p>
        </div>
        {vuln.line && <span className="rounded bg-[#222] px-2 py-1 font-mono text-xs text-gray-400">Line {vuln.line}</span>}
      </div>
      <p className="mb-3 text-sm text-gray-400">{vuln.description}</p>
      {vuln.excerpt ? (
        <div className="mb-3 rounded border border-[#1b1b1b] bg-[#0d0d0d] px-3 py-2 font-mono text-xs text-gray-400">
          {vuln.excerpt}
        </div>
      ) : null}
      <div className="rounded border border-[#222] bg-[#0f0f0f] p-3 font-mono text-xs text-gray-500">
        <strong className="text-gray-400">Fix:</strong> {vuln.remediation}
      </div>
    </motion.div>
  );
}

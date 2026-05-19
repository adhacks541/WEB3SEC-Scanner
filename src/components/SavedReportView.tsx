import Link from 'next/link';
import { SavedReportRecord } from '@/lib/report-types';
import VulnerabilityCard from './VulnerabilityCard';

export default function SavedReportView({ savedReport }: { savedReport: SavedReportRecord }) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8">
      <div className="glass-panel p-8">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-[var(--neon-green)]">Saved scan report</p>
            <h1 className="mt-3 text-4xl font-bold text-white">{savedReport.contractName}</h1>
            <p className="mt-3 font-mono text-sm text-gray-500">{savedReport.fileName}</p>
            <p className="mt-3 text-sm text-gray-400">
              Saved {new Date(savedReport.createdAt).toLocaleString()} • {savedReport.report.mode} mode
            </p>
          </div>

          <div className="flex flex-col items-start gap-3">
            <div className="rounded-lg border border-[var(--panel-border)] bg-[#101010] px-5 py-4">
              <p className="text-xs uppercase tracking-[0.22em] text-gray-500">Security score</p>
              <p className="mt-2 text-4xl font-bold text-[var(--neon-green)]">{savedReport.score}/100</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/api/reports/${savedReport.id}`}
                className="rounded border border-[var(--panel-border)] px-4 py-2 text-sm font-bold text-gray-200 transition-colors hover:border-[var(--neon-green)] hover:text-white"
              >
                Export JSON
              </Link>
              <Link
                href="/"
                className="rounded border border-[var(--panel-border)] px-4 py-2 text-sm font-bold text-gray-200 transition-colors hover:border-[var(--neon-green)] hover:text-white"
              >
                Back to scanner
              </Link>
            </div>
          </div>
        </div>
      </div>

      {savedReport.report.warnings?.length ? (
        <div className="rounded-lg border border-[var(--warning-yellow)]/40 bg-[var(--warning-yellow-dim)] px-4 py-3 text-sm text-yellow-200">
          {savedReport.report.warnings.map((warning) => (
            <p key={warning}>{warning}</p>
          ))}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[1.2fr,0.8fr]">
        <div className="glass-panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Detected issues</h2>
            <p className="text-sm text-gray-400">{savedReport.report.vulnerabilities.length} findings</p>
          </div>

          {savedReport.report.vulnerabilities.length === 0 ? (
            <div className="rounded-lg border border-[var(--neon-green)]/20 bg-[var(--neon-green-dim)] px-4 py-6 text-sm text-gray-200">
              No obvious issues were detected in this saved scan. Review manually before treating the contract as safe.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {savedReport.report.vulnerabilities.map((vulnerability, index) => (
                <VulnerabilityCard key={`${vulnerability.id}-${vulnerability.line ?? index}`} vuln={vulnerability} index={index} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">Scan metadata</h2>
            <dl className="mt-5 grid gap-4 text-sm">
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">Report ID</dt>
                <dd className="mt-2 break-all text-gray-300">{savedReport.id}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">Engine mode</dt>
                <dd className="mt-2 text-gray-300">{savedReport.report.mode}</dd>
              </div>
              <div>
                <dt className="font-mono text-xs uppercase tracking-[0.2em] text-gray-500">Saved file</dt>
                <dd className="mt-2 text-gray-300">{savedReport.fileName}</dd>
              </div>
            </dl>
          </div>

          <div className="glass-panel p-6">
            <h2 className="text-2xl font-bold text-white">Source snapshot</h2>
            <pre className="mt-5 max-h-[520px] overflow-auto rounded-lg border border-[#1f1f1f] bg-[#0b0b0b] p-4 font-mono text-xs leading-6 text-gray-300">
              {savedReport.code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

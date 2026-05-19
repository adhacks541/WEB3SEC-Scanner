'use client';

import Link from 'next/link';
import React, { useEffect, useRef, useState } from 'react';
import CodeEditor from '@/components/CodeEditor';
import Results from '@/components/Results';
import { analyze, getRecentReports, saveAnalysisReport } from '@/app/actions';
import { AnalysisReport } from '@/lib/analyzer';
import type { SavedReportSummary } from '@/lib/report-types';
import { Download, FileUp, History, Link2, Play, Save } from 'lucide-react';

const DEFAULT_CODE = `pragma solidity ^0.8.0;

contract VulnerableBank {
    mapping(address => uint) public balances;

    function deposit() public payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() public {
        uint bal = balances[msg.sender];
        require(bal > 0);

        (bool sent, ) = msg.sender.call{value: bal}("");
        require(sent, "Failed to send Ether");

        balances[msg.sender] = 0;
    }
}`;

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [code, setCode] = useState(DEFAULT_CODE);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState('VulnerableBank.sol');
  const [recentReports, setRecentReports] = useState<SavedReportSummary[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReportId, setSavedReportId] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadRecentReports();
  }, []);

  const handleAnalyze = async () => {
    setErrorMessage(null);
    setSaveMessage(null);
    setSavedReportId(null);
    setIsScanning(true);

    try {
      const result = await analyze(code);
      setReport(result);
    } catch (error) {
      console.error('Analysis failed', error);
      setReport(null);
      setErrorMessage('The scan could not be completed. Please verify the Solidity input and try again.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0];

    if (!uploadedFile) {
      return;
    }

    try {
      const fileContents = await uploadedFile.text();
      setCode(fileContents);
      setFileName(uploadedFile.name);
      setReport(null);
      setErrorMessage(null);
    } catch (error) {
      console.error('File upload failed', error);
      setErrorMessage('The selected file could not be read. Please upload a valid Solidity source file.');
    } finally {
      event.target.value = '';
    }
  };

  const handleSaveReport = async () => {
    if (!report) {
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const savedReport = await saveAnalysisReport({
        code,
        fileName,
        report,
      });

      setSavedReportId(savedReport.id);
      setSaveMessage('Report saved. You can reopen it from history or share the saved route.');
      await loadRecentReports();
    } catch (error) {
      console.error('Save failed', error);
      setSaveMessage('The report could not be saved. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportJson = () => {
    if (!report) {
      return;
    }

    const payload = {
      fileName,
      exportedAt: new Date().toISOString(),
      report,
      sourceCode: code,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const objectUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    const baseName = fileName.replace(/\.sol$/i, '');

    anchor.href = objectUrl;
    anchor.download = `${baseName || 'scan-report'}.report.json`;
    anchor.click();

    URL.revokeObjectURL(objectUrl);
  };

  const handleCopyLink = async () => {
    if (!savedReportId) {
      return;
    }

    const shareUrl = `${window.location.origin}/reports/${savedReportId}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setSaveMessage('Saved report link copied to clipboard.');
    } catch (error) {
      console.error('Copy link failed', error);
      setSaveMessage(`Saved report URL: ${shareUrl}`);
    }
  };

  const loadRecentReports = async () => {
    try {
      const reports = await getRecentReports();
      setRecentReports(reports);
    } catch (error) {
      console.error('Could not load recent reports', error);
    }
  };

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 lg:max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-green)]">First-pass contract triage</p>
        <h2 className="text-3xl font-bold text-white">Scan Solidity contracts for common risk patterns before deeper review.</h2>
        <p className="text-sm leading-6 text-gray-400">
          0xSENTINEL now uses AST-backed analysis when parsing succeeds, with a regex fallback for broken or partial source. It
          surfaces likely issues and remediation guidance, but it still does not replace a full manual audit.
        </p>
      </div>

      <div className="grid h-auto grid-cols-1 gap-8 lg:h-[calc(100vh-220px)] lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--neon-green)] tracking-wide">SOURCE CODE</h2>
            <div className="flex flex-wrap items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept=".sol,text/plain"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded border border-[var(--panel-border)] px-4 py-2 font-bold text-gray-200 transition-colors hover:border-[var(--neon-green)] hover:text-white"
              >
                <span className="flex items-center gap-2">
                  <FileUp className="h-4 w-4" />
                  UPLOAD .SOL
                </span>
              </button>
              <button
                onClick={handleAnalyze}
                disabled={isScanning}
                className="rounded bg-[var(--neon-green)] px-6 py-2 font-bold text-black transition-colors hover:bg-[#00cc7d] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4 fill-current" />
                  ANALYZE
                </span>
              </button>
            </div>
          </div>
          <CodeEditor code={code} onChange={setCode} fileName={fileName} />
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-[var(--neon-green)] tracking-wide">ANALYSIS REPORT</h2>
            {report ? (
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleSaveReport}
                  disabled={isSaving}
                  className="rounded border border-[var(--panel-border)] px-4 py-2 font-bold text-gray-200 transition-colors hover:border-[var(--neon-green)] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isSaving ? 'SAVING...' : 'SAVE REPORT'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="rounded border border-[var(--panel-border)] px-4 py-2 font-bold text-gray-200 transition-colors hover:border-[var(--neon-green)] hover:text-white"
                >
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    EXPORT JSON
                  </span>
                </button>
                {savedReportId ? (
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="rounded border border-[var(--panel-border)] px-4 py-2 font-bold text-gray-200 transition-colors hover:border-[var(--neon-green)] hover:text-white"
                  >
                    <span className="flex items-center gap-2">
                      <Link2 className="h-4 w-4" />
                      COPY LINK
                    </span>
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          {saveMessage ? (
            <div className="rounded-lg border border-[var(--neon-green)]/30 bg-[var(--neon-green-dim)] px-4 py-3 text-sm text-gray-200">
              {saveMessage}
              {savedReportId ? (
                <Link href={`/reports/${savedReportId}`} className="ml-2 font-semibold text-[var(--neon-green)] hover:underline">
                  Open saved report
                </Link>
              ) : null}
            </div>
          ) : null}
          <div className="flex-1 min-h-0">
            <Results report={report} isScanning={isScanning} errorMessage={errorMessage} />
          </div>
        </div>
      </div>

      <section className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-green)]">Saved workflow</p>
            <h3 className="mt-2 text-2xl font-bold text-white">Recent reports</h3>
          </div>
          <Link href="/reports" className="text-sm font-semibold text-[var(--neon-green)] hover:underline">
            View all saved reports
          </Link>
        </div>

        {recentReports.length === 0 ? (
          <div className="glass-panel flex items-center gap-4 p-6 text-gray-400">
            <History className="h-8 w-8 text-[var(--neon-green)]" />
            <p>No reports saved yet. Save a scan to build a reusable review history.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recentReports.map((savedReport) => (
              <Link
                key={savedReport.id}
                href={`/reports/${savedReport.id}`}
                className="glass-panel block rounded-lg p-5 transition-transform hover:-translate-y-1 hover:border-[var(--neon-green)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{savedReport.contractName}</p>
                    <p className="mt-1 font-mono text-xs text-gray-500">{savedReport.fileName}</p>
                  </div>
                  <span className="rounded bg-[#101010] px-2 py-1 text-sm font-bold text-[var(--neon-green)]">
                    {savedReport.score}/100
                  </span>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  {savedReport.issueCount} issue{savedReport.issueCount === 1 ? '' : 's'} • {savedReport.mode} mode
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                  Saved {formatTimestamp(savedReport.createdAt)}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

function formatTimestamp(value: string): string {
  return new Date(value).toLocaleString();
}

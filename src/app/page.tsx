'use client';

import React, { useRef, useState } from 'react';
import Layout from '@/components/Layout';
import CodeEditor from '@/components/CodeEditor';
import Results from '@/components/Results';
import { analyze } from '@/app/actions';
import { AnalysisReport } from '@/lib/analyzer';
import { FileUp, Play } from 'lucide-react';

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

  const handleAnalyze = async () => {
    setErrorMessage(null);
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

  return (
    <Layout>
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
          <h2 className="text-lg font-bold text-[var(--neon-green)] tracking-wide">ANALYSIS REPORT</h2>
          <div className="flex-1 min-h-0">
            <Results report={report} isScanning={isScanning} errorMessage={errorMessage} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

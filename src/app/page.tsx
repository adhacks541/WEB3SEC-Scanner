'use client';

import React, { useState } from 'react';
import Layout from '@/components/Layout';
import CodeEditor from '@/components/CodeEditor';
import Results from '@/components/Results';
import { analyzeContract, AnalysisReport } from '@/lib/analyzer';
import { Play } from 'lucide-react';

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
  const [code, setCode] = useState(DEFAULT_CODE);
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleAnalyze = () => {
    setIsScanning(true);
    // Simulate scanning delay for effect
    setTimeout(() => {
      const result = analyzeContract(code);
      setReport(result);
      setIsScanning(false);
    }, 1500);
  };

  return (
    <Layout>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-140px)]">
        {/* Left Column: Editor */}
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-bold text-[var(--neon-green)] tracking-wide">SOURCE CODE</h2>
            <button
              onClick={handleAnalyze}
              disabled={isScanning}
              className="bg-[var(--neon-green)] text-black px-6 py-2 rounded font-bold flex items-center gap-2 hover:bg-[#00cc7d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 fill-current" />
              ANALYZE
            </button>
          </div>
          <CodeEditor code={code} onChange={setCode} />
        </div>

        {/* Right Column: Results */}
        <div className="flex flex-col gap-4 h-full overflow-hidden">
          <h2 className="text-lg font-bold text-[var(--neon-green)] tracking-wide">ANALYSIS REPORT</h2>
          <div className="flex-1 min-h-0">
            <Results report={report} isScanning={isScanning} />
          </div>
        </div>
      </div>
    </Layout>
  );
}

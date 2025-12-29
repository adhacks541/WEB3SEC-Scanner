

export interface Vulnerability {
    id: string;
    name: string;
    description: string;
    severity: 'High' | 'Medium' | 'Low';
    line?: number;
    remediation: string;
}

export interface AnalysisReport {
    vulnerabilities: Vulnerability[];
    timestamp: number;
    contractName?: string;
    mode: 'Solc' | 'Regex';
}

export const VULNERABILITY_PATTERNS = [
    {
        id: 'reentrancy',
        name: 'Reentrancy',
        regex: /\.call\s*\{.*value:.*\}\s*\(/,
        severity: 'High',
        description: 'External call with value transfer can lead to reentrancy attacks if state changes happen after the call.',
        remediation: 'Use the Checks-Effects-Interactions pattern. Move state changes before the external call or use a ReentrancyGuard.',
    },
    {
        id: 'tx-origin',
        name: 'Phishing with tx.origin',
        regex: /tx\.origin/,
        severity: 'High',
        description: 'Using tx.origin for authorization is insecure as it can be manipulated by a malicious intermediate contract.',
        remediation: 'Use msg.sender instead of tx.origin for authorization.',
    },
    {
        id: 'unchecked-low-level',
        name: 'Unchecked Low-Level Call',
        regex: /(\.call|\.delegatecall|\.staticcall)\s*\(/,
        severity: 'Medium',
        description: 'Low-level calls return a success boolean that should be checked.',
        remediation: 'Always check the return value of low-level calls: (bool success, ) = ...',
    },
    {
        id: 'floating-pragma',
        name: 'Floating Pragma',
        regex: /pragma\s+solidity\s+\^/,
        severity: 'Low',
        description: 'Floating pragmas can lead to unexpected behavior if the contract is deployed with a different compiler version than tested.',
        remediation: 'Lock the pragma version to a specific version (e.g., pragma solidity 0.8.19;).',
    },
    {
        id: 'weak-randomness',
        name: 'Weak Randomness',
        regex: /(block\.timestamp|block\.difficulty|now)/,
        severity: 'Medium',
        description: 'Using block attributes for randomness is insecure as miners can manipulate them.',
        remediation: 'Use Chainlink VRF for secure on-chain randomness.',
    }
] as const;

export function analyzeContract(code: string): AnalysisReport {
    // Fallback directly to regex for now, or this will be replaced by the worker caller
    return analyzeContractRegex(code);
}

export function analyzeContractRegex(code: string): AnalysisReport {
    const vulnerabilities: Vulnerability[] = [];
    const lines = code.split('\n');

    const nameMatch = code.match(/contract\s+(\w+)/);
    const contractName = nameMatch ? nameMatch[1] : 'Unknown Contract';

    lines.forEach((line, index) => {
        if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;

        VULNERABILITY_PATTERNS.forEach((pattern) => {
            if (pattern.regex.test(line)) {
                vulnerabilities.push({
                    id: pattern.id,
                    name: pattern.name,
                    description: pattern.description,
                    severity: pattern.severity,
                    line: index + 1,
                    remediation: pattern.remediation,
                });
            }
        });
    });

    return {
        vulnerabilities,
        timestamp: Date.now(),
        contractName,
        mode: 'Regex'
    };
}

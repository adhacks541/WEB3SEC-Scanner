import { describe, expect, it } from 'vitest';
import { analyzeContract, analyzeContractRegex, calculateSecurityScore } from './analyzer';

describe('analyzeContract', () => {
  it('uses AST mode for valid Solidity and ignores comments or strings', () => {
    const report = analyzeContract(`pragma solidity ^0.8.20;

contract SafeNotes {
  string internal note = "tx.origin should not trigger here";

  // tx.origin should not be reported from comments
  /*
    block.timestamp should also be ignored inside comments
  */
  function save() external pure returns (string memory) {
    return note;
  }
}`);

    expect(report.mode).toBe('AST');
    expect(report.contractName).toBe('SafeNotes');
    expect(report.vulnerabilities.map((vulnerability) => vulnerability.id)).toEqual(['floating-pragma']);
  });

  it('falls back to regex mode when parsing fails', () => {
    const report = analyzeContract(`contract Broken {
  function run( external {
    tx.origin;
  }
}`);

    expect(report.mode).toBe('Regex');
    expect(report.warnings?.[0]).toContain('fell back to regex');
    expect(report.vulnerabilities.map((vulnerability) => vulnerability.id)).toEqual(['tx-origin']);
  });

  it('detects delegatecall and selfdestruct from the AST', () => {
    const report = analyzeContract(`pragma solidity 0.8.20;

contract DangerousExecutor {
  function execute(address target) external {
    target.delegatecall("");
    selfdestruct(payable(target));
  }
}`);

    expect(report.mode).toBe('AST');
    expect(report.vulnerabilities.map((vulnerability) => vulnerability.id)).toEqual([
      'delegatecall-risk',
      'unchecked-low-level',
      'selfdestruct',
    ]);
  });

  it('flags a reentrancy pattern when state mutation happens after a value call', () => {
    const report = analyzeContract(`pragma solidity 0.8.20;

contract Vault {
  mapping(address => uint256) public balances;

  function withdraw(address recipient) external {
    recipient.call{value: balances[msg.sender]}("");
    balances[msg.sender] = 0;
  }
}`);

    expect(report.vulnerabilities.map((vulnerability) => vulnerability.id)).toEqual([
      'reentrancy',
      'unchecked-low-level',
    ]);
    expect(report.vulnerabilities[0].confidence).toBe('Medium');
  });

  it('does not flag assigned low-level calls as obviously unchecked', () => {
    const report = analyzeContract(`pragma solidity 0.8.20;

contract CheckedCall {
  function ping(address target) external returns (bool) {
    (bool success, ) = target.call("");
    return success;
  }
}`);

    expect(report.vulnerabilities).toHaveLength(0);
  });

  it('calculates the score from mixed AST findings', () => {
    const report = analyzeContract(`pragma solidity ^0.8.20;

contract VulnerableBank {
  mapping(address => uint256) public balances;

  function withdraw(address target) external {
    target.call{value: balances[msg.sender]}("");
    balances[msg.sender] = 0;
    if (tx.origin == msg.sender) {}
    uint256 seed = uint256(block.timestamp);
  }
}`);

    expect(calculateSecurityScore(report.vulnerabilities)).toBe(35);
  });
});

describe('analyzeContractRegex', () => {
  it('still detects delegatecall in fallback mode', () => {
    const report = analyzeContractRegex(`contract Broken {
  function run(address target) external {
    target.delegatecall("");
  }
}`);

    expect(report.mode).toBe('Regex');
    expect(report.vulnerabilities.map((vulnerability) => vulnerability.id)).toEqual([
      'delegatecall-risk',
      'unchecked-low-level',
    ]);
  });
});

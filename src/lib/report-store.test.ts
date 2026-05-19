import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { AnalysisReport } from '@/lib/analyzer';

vi.mock('../auth', () => ({ auth: () => Promise.resolve({ user: { id: 'test-user-id' } }) }));

vi.mock('server-only', () => ({}));

const originalReportStoreDir = process.env.REPORT_STORE_DIR;

let tempDir: string;

beforeEach(async () => {
  tempDir = await mkdtemp(path.join(tmpdir(), 'report-store-'));
  process.env.REPORT_STORE_DIR = path.join(tempDir, 'data');
  vi.resetModules();
});

afterEach(async () => {
  if (originalReportStoreDir === undefined) {
    delete process.env.REPORT_STORE_DIR;
  } else {
    process.env.REPORT_STORE_DIR = originalReportStoreDir;
  }
  await rm(tempDir, { recursive: true, force: true });
});

describe('report-store', () => {
  it('saves, lists, and fetches reports from persistent storage', async () => {
    const { getSavedReport, listSavedReports, saveReport } = await import('./report-store');
    const baseReport: AnalysisReport = {
      vulnerabilities: [],
      timestamp: 123,
      contractName: 'Vault',
      mode: 'AST',
    };

    const savedReport = await saveReport({
      code: 'contract Vault {}',
      fileName: 'Vault.sol',
      report: baseReport,
    });

    const fetchedReport = await getSavedReport(savedReport.id);
    const savedReports = await listSavedReports();

    expect(fetchedReport?.id).toBe(savedReport.id);
    expect(fetchedReport?.fileName).toBe('Vault.sol');
    expect(fetchedReport?.id).toBe(savedReport.id);
    expect(fetchedReport?.fileName).toBe('Vault.sol');
    
    const foundReport = savedReports.find(r => r.id === savedReport.id);
    expect(foundReport).toBeDefined();
    expect(foundReport).toMatchObject({
      id: savedReport.id,
      contractName: 'Vault',
      mode: 'AST',
      score: 100,
      issueCount: 0,
    });
  });
});

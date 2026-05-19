'use server';

import { analyzeContract, AnalysisReport } from '@/lib/analyzer';
import { SavedReportRecord, SavedReportSummary } from '@/lib/report-types';
import { listSavedReports, saveReport } from '@/lib/report-store';
import { auth } from '@/auth';

export async function analyze(code: string): Promise<AnalysisReport> {
  return analyzeContract(code);
}

export async function saveAnalysisReport(input: {
  code: string;
  fileName: string;
  report: AnalysisReport;
}): Promise<SavedReportRecord> {  const session = await auth();
  
  return saveReport({
    ...input,
    userId: session?.user?.id
  });
}

export async function getRecentReports(): Promise<SavedReportSummary[]> {
  const session = await auth();
  return listSavedReports(session?.user?.id);
}

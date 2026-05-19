import { AnalysisReport } from './analyzer';

export interface SavedReportRecord {
  id: string;
  fileName: string;
  contractName: string;
  createdAt: string;
  code: string;
  report: AnalysisReport;
  score: number;
}

export interface SavedReportSummary {
  id: string;
  fileName: string;
  contractName: string;
  createdAt: string;
  mode: AnalysisReport['mode'];
  score: number;
  issueCount: number;
}

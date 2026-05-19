import 'server-only';

import prisma from './db';
import { AnalysisReport, calculateSecurityScore, Vulnerability } from './analyzer';
import { SavedReportRecord, SavedReportSummary } from './report-types';
import { VULNERABILITY_METADATA } from './vulnerabilities';
import type { Report, Finding } from '@prisma/client';

type ReportWithFindings = Report & { findings: Finding[] };

export async function saveReport(input: {
  code: string;
  fileName: string;
  report: AnalysisReport;
  userId?: string;
}): Promise<SavedReportRecord> {
  const userId = input.userId;
  
  const score = calculateSecurityScore(input.report.vulnerabilities);
  
  const createdReport = await prisma.report.create({
    data: {
      userId,
      contractName: input.report.contractName ?? 'Unknown Contract',
      fileName: input.fileName,
      code: input.code,
      mode: input.report.mode,
      score: score,
      warnings: input.report.warnings ?? [],
      findings: {
        create: input.report.vulnerabilities.map(v => ({
          vulnId: v.id,
          severity: v.severity,
          line: v.line ?? null,
          excerpt: v.excerpt ?? null,
          confidence: v.confidence ?? null,
        }))
      }
    },
    include: {
      findings: true
    }
  });

  return toSavedReportRecord(createdReport);
}

export async function listSavedReports(userId?: string): Promise<SavedReportSummary[]> {

  const reports = await prisma.report.findMany({
    where: { userId: userId || null },
    orderBy: { createdAt: 'desc' },
    take: 100, // Limit to recent 100 for now
    include: {
      _count: {
        select: { findings: true }
      }
    }
  });

  return reports.map(r => ({
    id: r.id,
    fileName: r.fileName,
    contractName: r.contractName,
    createdAt: r.createdAt.toISOString(),
    mode: r.mode as AnalysisReport['mode'],
    score: r.score,
    issueCount: r._count.findings,
  }));
}

export async function getDashboardStats(userId?: string) {

  if (!userId) {
    return {
      totalScans: 0,
      averageScore: 0,
      totalIssues: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      lowSeverity: 0,
    };
  }

  const [reportAgg, findings] = await Promise.all([
    prisma.report.aggregate({
      where: { userId },
      _count: { id: true },
      _avg: { score: true },
    }),
    prisma.finding.groupBy({
      by: ['severity'],
      where: { report: { userId } },
      _count: true,
    })
  ]);

  let highSeverity = 0;
  let mediumSeverity = 0;
  let lowSeverity = 0;
  let totalIssues = 0;

  for (const f of findings) {
    totalIssues += f._count;
    if (f.severity === 'High') highSeverity += f._count;
    else if (f.severity === 'Medium') mediumSeverity += f._count;
    else if (f.severity === 'Low') lowSeverity += f._count;
  }

  return {
    totalScans: reportAgg._count.id,
    averageScore: Math.round(reportAgg._avg.score ?? 100),
    totalIssues,
    highSeverity,
    mediumSeverity,
    lowSeverity,
  };
}

export async function getSavedReport(id: string): Promise<SavedReportRecord | null> {
  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      findings: true
    }
  });

  if (!report) return null;
  return toSavedReportRecord(report);
}

// Helper to convert Prisma model back to the application's domain model
function toSavedReportRecord(report: ReportWithFindings): SavedReportRecord {
  // Map findings back to full Vulnerability objects using our metadata registry
  const vulnerabilities: Vulnerability[] = report.findings.map((f) => {
    const meta = VULNERABILITY_METADATA[f.vulnId];
    return {
      id: f.vulnId,
      name: meta?.name ?? 'Unknown Vulnerability',
      description: meta?.description ?? 'Unknown',
      severity: f.severity as Vulnerability['severity'],
      line: f.line ?? undefined,
      excerpt: f.excerpt ?? undefined,
      confidence: (f.confidence as Vulnerability['confidence']) ?? undefined,
      remediation: meta?.remediation ?? 'Manual review required.',
      explanation: meta?.explanation,
      whyDangerous: meta?.whyDangerous,
      secureAlternative: meta?.secureAlternative,
      secureExample: meta?.secureExample,
    };
  });

  // Sort vulnerabilities by line number, then severity
  vulnerabilities.sort((left, right) => {
    const leftLine = left.line ?? 0;
    const rightLine = right.line ?? 0;
    
    if (leftLine !== rightLine) {
      return leftLine - rightLine;
    }
    
    return severityWeight(right.severity) - severityWeight(left.severity);
  });

  return {
    id: report.id,
    fileName: report.fileName,
    contractName: report.contractName,
    createdAt: report.createdAt.toISOString(),
    code: report.code,
    score: report.score,
    report: {
      vulnerabilities,
      timestamp: report.createdAt.getTime(),
      contractName: report.contractName,
      mode: report.mode as AnalysisReport['mode'],
      warnings: report.warnings.length > 0 ? report.warnings : undefined,
    }
  };
}

function severityWeight(severity: Vulnerability['severity']): number {
  if (severity === 'High') return 3;
  if (severity === 'Medium') return 2;
  return 1;
}

'use server';

import { analyzeContract, AnalysisReport } from '@/lib/analyzer';

export async function analyze(code: string): Promise<AnalysisReport> {
    return analyzeContract(code);
}

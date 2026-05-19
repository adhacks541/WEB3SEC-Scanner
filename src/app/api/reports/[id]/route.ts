import { NextResponse } from 'next/server';
import { getSavedReport } from '@/lib/report-store';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const savedReport = await getSavedReport(id);

  if (!savedReport) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 });
  }

  return NextResponse.json(savedReport, {
    headers: {
      'Content-Disposition': `attachment; filename="${savedReport.fileName.replace(/\.sol$/i, '') || 'saved-report'}.json"`,
    },
  });
}

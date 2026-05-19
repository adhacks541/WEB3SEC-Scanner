import { notFound } from 'next/navigation';
import SavedReportView from '@/components/SavedReportView';
import { getSavedReport } from '@/lib/report-store';

export const dynamic = 'force-dynamic';

export default async function SavedReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const savedReport = await getSavedReport(id);

  if (!savedReport) {
    notFound();
  }

  return (
    <>
      <SavedReportView savedReport={savedReport} />
    </>
  );
}

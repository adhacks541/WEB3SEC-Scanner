import Link from 'next/link';
import { listSavedReports } from '@/lib/report-store';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
  const session = await auth();
  const reports = await listSavedReports(session?.user?.id);

  return (
    <>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-[var(--neon-green)]">Persistent history</p>
            <h1 className="mt-3 text-4xl font-bold text-white">Saved reports</h1>
            <p className="mt-3 max-w-2xl text-gray-400">
              Revisit previous scans, export stored results, and share stable report links with collaborators.
            </p>
          </div>
          <Link href="/" className="text-sm font-semibold text-[var(--neon-green)] hover:underline">
            Back to scanner
          </Link>
        </div>

        {reports.length === 0 ? (
          <div className="glass-panel p-8 text-gray-400">No reports have been saved yet. Run a scan and save it from the home page.</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {reports.map((report) => (
              <Link
                key={report.id}
                href={`/reports/${report.id}`}
                className="glass-panel block rounded-lg p-5 transition-transform hover:-translate-y-1 hover:border-[var(--neon-green)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-white">{report.contractName}</p>
                    <p className="mt-1 font-mono text-xs text-gray-500">{report.fileName}</p>
                  </div>
                  <span className="rounded bg-[#101010] px-2 py-1 text-sm font-bold text-[var(--neon-green)]">{report.score}/100</span>
                </div>
                <p className="mt-4 text-sm text-gray-400">
                  {report.issueCount} issue{report.issueCount === 1 ? '' : 's'} • {report.mode} mode
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-gray-500">
                  Saved {new Date(report.createdAt).toLocaleString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { getDashboardStats, listSavedReports } from '@/lib/report-store';
import { ShieldAlert, Activity, FileCode2, History } from 'lucide-react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Dashboard | 0xSentinel',
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect('/');
  }

  const [stats, recentScans] = await Promise.all([
    getDashboardStats(session.user.id),
    listSavedReports(session.user.id)
  ]);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {session.user.name ?? 'Security Researcher'}</h1>
        <p className="text-gray-400">Here is an overview of your smart contract scans and detected vulnerabilities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <StatCard 
          title="Total Scans" 
          value={stats.totalScans} 
          icon={<FileCode2 className="w-5 h-5 text-blue-400" />} 
          subtitle="All time"
        />
        <StatCard 
          title="Avg. Security Score" 
          value={`${stats.averageScore}/100`} 
          icon={<Activity className="w-5 h-5 text-[var(--neon-green)]" />} 
          subtitle={stats.averageScore > 80 ? 'Good standing' : 'Needs improvement'}
        />
        <StatCard 
          title="Total Issues Found" 
          value={stats.totalIssues} 
          icon={<ShieldAlert className="w-5 h-5 text-yellow-500" />} 
          subtitle="Across all contracts"
        />
        <div className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex flex-col justify-between relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Severity Trends</h3>
          </div>
          <div className="flex items-end justify-between gap-2 mt-auto">
            <div className="text-center">
              <span className="block text-xl font-bold text-[var(--alert-red)]">{stats.highSeverity}</span>
              <span className="text-[10px] uppercase text-gray-500 tracking-wider">High</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-yellow-500">{stats.mediumSeverity}</span>
              <span className="text-[10px] uppercase text-gray-500 tracking-wider">Med</span>
            </div>
            <div className="text-center">
              <span className="block text-xl font-bold text-blue-400">{stats.lowSeverity}</span>
              <span className="text-[10px] uppercase text-gray-500 tracking-wider">Low</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Scans */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <History className="w-5 h-5 text-[var(--neon-green)]" />
          Recent Scans
        </h2>
        <Link href="/" className="px-4 py-2 bg-[var(--neon-green)] text-black font-bold rounded hover:bg-[#00cc7d] transition-colors text-sm">
          NEW SCAN
        </Link>
      </div>

      {recentScans.length === 0 ? (
        <div className="glass-panel rounded-xl p-8 text-center text-gray-400 border border-[var(--panel-border)]">
          <p>You haven&apos;t scanned any contracts yet.</p>
          <Link href="/" className="inline-block mt-4 text-[var(--neon-green)] hover:underline font-semibold">
            Run your first scan
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recentScans.map((scan) => (
            <Link 
              key={scan.id} 
              href={`/reports/${scan.id}`}
              className="glass-panel block p-5 rounded-xl border border-[var(--panel-border)] hover:border-[var(--neon-green)] transition-all hover:-translate-y-1"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-white text-lg truncate" title={scan.contractName}>{scan.contractName}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-1">{scan.fileName}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-bold ${scan.score >= 80 ? 'bg-[var(--neon-green-dim)] text-[var(--neon-green)] border border-[var(--neon-green)]/20' : scan.score >= 50 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                  {scan.score} / 100
                </div>
              </div>
              <div className="flex justify-between items-end mt-6">
                <p className="text-sm text-gray-400">
                  <span className="font-bold text-white">{scan.issueCount}</span> issue{scan.issueCount !== 1 ? 's' : ''}
                </p>
                <p className="text-xs text-gray-600 uppercase tracking-wider">
                  {new Date(scan.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function StatCard({ title, value, icon, subtitle }: { title: string, value: string | number, icon: React.ReactNode, subtitle: string }) {
  return (
    <div className="glass-panel p-5 rounded-xl border border-[var(--panel-border)] flex flex-col relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{title}</h3>
        {icon}
      </div>
      <div className="mt-auto">
        <p className="text-3xl font-bold text-white">{value}</p>
        <p className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{subtitle}</p>
      </div>
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
    </div>
  );
}

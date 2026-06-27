import { Activity, Server, Users, Database, AlertCircle, PlayCircle } from "lucide-react";

export function OverviewTab({ stats }: { stats: any }) {
  if (!stats) return <div className="text-slate-400">Loading overview...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard title="Total Rooms Today" value={stats.totalRoomsToday ?? 0} icon={<Server className="w-5 h-5 text-emerald-400" />} />
        <StatCard title="Active Rooms" value={stats.activeRooms ?? 0} icon={<PlayCircle className="w-5 h-5 text-green-400" />} />
        <StatCard title="Players Today" value={stats.totalPlayersToday ?? 0} icon={<Users className="w-5 h-5 text-cyan-400" />} />
        <StatCard title="Quizzes Generated" value={stats.totalQuizzesGeneratedToday ?? 0} icon={<Database className="w-5 h-5 text-purple-400" />} />
        <StatCard title="Games Completed" value={stats.totalGamesCompletedToday ?? 0} icon={<Activity className="w-5 h-5 text-amber-400" />} />
        <StatCard title="Errors Today" value={stats.totalErrorsToday ?? 0} icon={<AlertCircle className="w-5 h-5 text-rose-400" />} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden p-4">
        <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
          <Activity className="w-5 h-5 text-slate-400" />
          Latest Activity
        </h3>
        <div className="divide-y divide-slate-800/50">
          {stats.latestActivities && stats.latestActivities.length > 0 ? (
            stats.latestActivities.map((log: any) => (
              <div key={log._id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-slate-300 text-sm block">{log.action.replace(/_/g, ' ')}</span>
                  <span className="text-slate-500 text-xs">{log.message}</span>
                </div>
                <span className="text-slate-500 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))
          ) : (
            <div className="text-slate-500 text-sm">No recent activity.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
        {icon}
        {title}
      </div>
      <div className="text-3xl font-black text-slate-100">{value}</div>
    </div>
  );
}

import { useState, useEffect, useCallback } from "react";
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../ui/Button";

export function LogsTab({ token, serverUrl }: { token: string, serverUrl: string }) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filterLevel, setFilterLevel] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: "50",
      });
      if (filterLevel) query.append("level", filterLevel);
      if (filterCategory) query.append("category", filterCategory);
      if (debouncedSearch) query.append("search", debouncedSearch);

      const res = await fetch(`${serverUrl}/api/admin/logs?${query.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
        setTotalPages(data.totalPages);
        setTotal(data.total);
      }
    } catch (err) {
      console.error("Failed to fetch logs", err);
    } finally {
      setLoading(false);
    }
  }, [page, filterLevel, filterCategory, debouncedSearch, token, serverUrl]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row flex-wrap gap-3 md:items-center bg-slate-900 p-4 rounded-xl border border-slate-800 shrink-0">
        <div className="flex-1 w-full md:w-auto relative min-w-0">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search logs message..." 
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <select 
            value={filterLevel}
            onChange={e => { setFilterLevel(e.target.value); setPage(1); }}
            className="flex-1 md:flex-none bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-3 py-2 text-sm text-slate-200 focus:outline-none"
          >
            <option value="">All Levels</option>
            <option value="info">Info</option>
            <option value="warning">Warning</option>
            <option value="error">Error</option>
            <option value="critical">Critical</option>
          </select>
          <select 
            value={filterCategory}
            onChange={e => { setFilterCategory(e.target.value); setPage(1); }}
            className="flex-1 md:flex-none bg-slate-950 border border-slate-800 rounded-lg px-2 sm:px-3 py-2 text-sm text-slate-200 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="auth">Auth</option>
            <option value="room">Room</option>
            <option value="player">Player</option>
            <option value="quiz">Quiz</option>
            <option value="game">Game</option>
            <option value="leaderboard">Leaderboard</option>
            <option value="ai">AI</option>
          </select>
        </div>
        <Button variant="outline" className="w-full md:w-auto" onClick={() => fetchLogs()}>Refresh</Button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto md:bg-slate-900 md:border md:border-slate-800 rounded-xl relative min-h-0 custom-scrollbar">
        {loading && (
           <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
             <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
           </div>
        )}

        {/* Mobile List View */}
        <div className="block md:hidden space-y-3 pb-2">
            {logs.map(log => (
                <div key={log._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 shadow-sm">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-400 font-medium">{new Date(log.createdAt).toLocaleString()}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                            ['error','critical'].includes(log.level) ? 'bg-rose-500/20 text-rose-400' :
                            log.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                        }`}>
                            {log.level}
                        </span>
                    </div>
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{log.category} • {log.action}</div>
                        <p className="text-sm text-slate-200 line-clamp-2 leading-relaxed">{log.message}</p>
                    </div>
                    <Button variant="outline" size="sm" className="w-full mt-2 border-slate-700 bg-slate-950 text-slate-300" onClick={() => setSelectedLog(log)}>View Details</Button>
                </div>
            ))}
            {logs.length === 0 && !loading && (
                <div className="p-8 text-center text-slate-500 bg-slate-900 border border-slate-800 rounded-xl">No logs found matching criteria.</div>
            )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block w-full">
            <table className="w-full text-left text-sm text-slate-300 table-fixed">
              <thead className="bg-slate-950/90 sticky top-0 uppercase text-xs font-bold text-slate-500 backdrop-blur-sm z-10">
                <tr>
                  <th className="px-4 py-3 w-36 sm:w-40">Time</th>
                  <th className="px-4 py-3 w-20 sm:w-24">Level</th>
                  <th className="px-4 py-3 w-28 sm:w-32">Category</th>
                  <th className="px-4 py-3 w-32 sm:w-48 truncate">Action</th>
                  <th className="px-4 py-3">Message</th>
                  <th className="px-4 py-3 w-24 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 truncate text-xs text-slate-400" title={new Date(log.createdAt).toLocaleString()}>{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        ['error','critical'].includes(log.level) ? 'bg-rose-500/20 text-rose-400' :
                        log.level === 'warning' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {log.level}
                      </span>
                    </td>
                    <td className="px-4 py-3">{log.category}</td>
                    <td className="px-4 py-3 font-mono text-xs truncate text-slate-400" title={log.action}>{log.action}</td>
                    <td className="px-4 py-3 truncate" title={log.message}>{log.message}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setSelectedLog(log)} className="bg-slate-950">View</Button>
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && !loading && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No logs found matching criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row gap-3 md:gap-0 items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800 shrink-0">
        <div className="text-sm text-slate-400 text-center md:text-left">
          Total: <span className="text-slate-200 font-bold">{total}</span> logs
        </div>
        <div className="flex gap-2 items-center w-full md:w-auto justify-between md:justify-end">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="flex-1 md:flex-none bg-slate-950">
            <ChevronLeft className="w-4 h-4 md:mr-0 mr-1" /> <span className="md:hidden">Prev</span>
          </Button>
          <span className="text-sm text-slate-400 whitespace-nowrap px-2">Page {page} of {totalPages || 1}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="flex-1 md:flex-none bg-slate-950">
             <span className="md:hidden">Next</span> <ChevronRight className="w-4 h-4 md:ml-0 ml-1" />
          </Button>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Log Details</h3>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 custom-scrollbar">
              <pre className="text-xs text-emerald-400 font-mono bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-auto whitespace-pre-wrap">
                {JSON.stringify(selectedLog, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

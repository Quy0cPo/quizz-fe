import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Activity, Server, Users, Database, AlertCircle, LogOut, FileText } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ScreenFrame } from "../components/ui/ScreenFrame";

import { OverviewTab } from "../components/admin/OverviewTab";
import { LogsTab } from "../components/admin/LogsTab";
import { LiveRoomsTab } from "../components/admin/LiveRoomsTab";

export function AdminDashboardScreen({ token, onLogout, onBack }: { token: string; onLogout: () => void; onBack: () => void }) {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "liverooms" | "logs">("overview");

  const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4001";

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const statsRes = await fetch(`${SERVER_URL}/api/admin/overview`, { headers: { Authorization: `Bearer ${token}` } });
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats(statsData);
        } else if (statsRes.status === 401) {
          onLogout();
        }
      } catch (err) {
        console.error("Failed to fetch admin data", err);
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === "overview") {
        fetchOverview();
        const interval = setInterval(fetchOverview, 10000);
        return () => clearInterval(interval);
    }
  }, [activeTab, token, SERVER_URL, onLogout]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-[1440px] flex flex-col flex-1 bg-slate-950 overflow-hidden"
      >
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900 z-10 w-full">
          <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
            <Button variant="outline" size="icon" onClick={onBack} className="shrink-0 bg-slate-950 border-slate-700">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center shrink-0">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-slate-50 tracking-tight leading-tight truncate">Admin CMS</h2>
              <p className="hidden sm:block text-xs font-bold text-slate-500 uppercase tracking-widest">Opic Quiz Battle</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="border-rose-500/30 text-rose-400 hover:bg-rose-500/10 bg-slate-950 shrink-0">
            <LogOut className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>

        {/* Mobile Tab Navigation */}
        <div className="flex md:hidden overflow-x-auto bg-slate-900 border-b border-slate-800 p-2 gap-2 hide-scrollbar shrink-0">
             <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity />} label="Overview" className="flex-1 whitespace-nowrap justify-center" />
             <TabButton active={activeTab === 'liverooms'} onClick={() => setActiveTab('liverooms')} icon={<Server />} label="Live Rooms" className="flex-1 whitespace-nowrap justify-center" />
             <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FileText />} label="System Logs" className="flex-1 whitespace-nowrap justify-center" />
        </div>

        {/* Main Layout */}
        <div className="flex flex-1 overflow-hidden w-full">
          {/* Sidebar Tabs (Desktop) */}
          <div className="hidden md:flex w-64 bg-slate-900 border-r border-slate-800 flex-col py-4 px-2 shrink-0">
             <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity />} label="Overview" />
             <TabButton active={activeTab === 'liverooms'} onClick={() => setActiveTab('liverooms')} icon={<Server />} label="Live Rooms" />
             <TabButton active={activeTab === 'logs'} onClick={() => setActiveTab('logs')} icon={<FileText />} label="System Logs" />
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-hidden bg-slate-950 relative flex flex-col min-w-0">
            <div className="flex-1 w-full overflow-y-auto p-3 md:p-6 min-w-0">
                {activeTab === "overview" && (
                    loading ? (
                        <div className="flex justify-center items-center h-40">
                            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    ) : (
                        <OverviewTab stats={stats} />
                    )
                )}
                {activeTab === "liverooms" && (
                    <LiveRoomsTab token={token} serverUrl={SERVER_URL} />
                )}
                {activeTab === "logs" && (
                    <LogsTab token={token} serverUrl={SERVER_URL} />
                )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, className = "" }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, className?: string }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl transition-all font-bold text-sm mb-0 md:mb-1 ${
                active 
                ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
            } ${className}`}
        >
            <div className={`[&>svg]:w-4 [&>svg]:h-4 sm:[&>svg]:w-5 sm:[&>svg]:h-5 ${active ? 'text-indigo-400' : 'text-slate-500'}`}>
                {icon}
            </div>
            {label}
        </button>
    );
}

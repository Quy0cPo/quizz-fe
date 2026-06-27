import { motion } from "framer-motion";
import { ArrowLeft, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../components/ui/Button";
import { ScreenFrame } from "../components/ui/ScreenFrame";

type GlobalPlayer = {
  name: string;
  score: number;
};

export function GlobalLeaderboardScreen({ onBack }: { onBack: () => void }) {
  const [leaderboard, setLeaderboard] = useState<GlobalPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4001";

  useEffect(() => {
    fetch(`${SERVER_URL}/api/leaderboard`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      })
      .catch((err) => console.error("Failed to load global leaderboard", err))
      .finally(() => setLoading(false));
  }, [SERVER_URL]);

  return (
    <ScreenFrame variant="centered" maxWidth="lg">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full h-full flex flex-col bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden"
      >
        <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900 z-10">
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" onClick={onBack} className="shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight">Global Leaderboard</h2>
              <p className="text-sm font-medium text-slate-400">Top 50 Players</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scroll-smooth">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center text-slate-400 py-10">
              <p>No players on the leaderboard yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {leaderboard.map((player, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  key={player.name}
                  className="flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-slate-500 w-6 text-center">
                      {index + 1}
                    </span>
                    <span className="text-lg font-bold text-slate-100">{player.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-black text-amber-400">{player.score}</span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">pts</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </ScreenFrame>
  );
}

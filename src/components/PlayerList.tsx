import { motion } from "framer-motion";
import { Player, AnswerResultPayload } from "../types";
import { cn } from "../lib/utils";
import { Crown, Flame } from "lucide-react";

export function PlayerList({ players, showScores = false, lastResult, renderExtra }: { players: Player[]; showScores?: boolean; lastResult?: AnswerResultPayload | null; renderExtra?: (player: Player) => React.ReactNode }) {
  if (players.length === 0) {
    return <p className="text-slate-400 text-center py-4 font-medium">No players yet.</p>;
  }

  return (
    <motion.ol className="flex flex-col gap-2 w-full" layout>
      {players.map((player, index) => {
        const submission = lastResult?.submissions.find((s) => s.playerId === player.id);
        const isCorrect = submission?.correct;
        const pointsGained = submission?.points ?? 0;
        
        return (
          <motion.li 
            key={player.id} 
            layout 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            transition={{ duration: 0.3 }} 
            className={cn(
              "flex items-center justify-between p-2.5 sm:p-3 rounded-xl border transition-all",
              submission ? (isCorrect ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "bg-rose-500/10 border-rose-500/30 opacity-80") : "bg-slate-900 border-slate-800 shadow-sm"
            )}
          >
            <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-800 text-slate-400 font-bold rounded-full text-xs">
                {index + 1}
              </span>
              
              <div className={cn("flex items-center gap-2 sm:gap-3 overflow-hidden", !player.connected && "opacity-50 grayscale")}>
                <span className="text-xl flex-shrink-0 bg-slate-950 w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-xl border border-slate-800">
                  {player.icon ?? "🐶"}
                </span>
                
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-50 text-sm sm:text-base truncate flex items-center gap-1.5">
                    {player.name}
                    {player.isHost && <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />}
                  </span>
                  
                  {(player.streak ?? 0) > 1 && (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md w-fit">
                      <Flame className="w-3 h-3 fill-orange-500" /> {player.streak} Streak
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 flex-shrink-0">
              {showScores && (
                <div className="flex flex-col items-end">
                  {pointsGained > 0 && <span className="text-sm font-bold text-emerald-500 animate-bounce">+{pointsGained}</span>}
                  <strong className="text-lg font-black text-slate-50">{player.score}</strong>
                </div>
              )}
              {renderExtra && renderExtra(player)}
            </div>
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

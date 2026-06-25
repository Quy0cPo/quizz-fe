import { Player, AnswerResultPayload } from "../types";
import { PlayerList } from "../components/PlayerList";
import { Socket } from "socket.io-client";
import { Trophy, Clock } from "lucide-react";
import { ScreenFrame } from "../components/ui/ScreenFrame";

export function LeaderboardScreen({ players, nextQuestionInSeconds, lastResult, socket, roomCode }: { players: Player[]; nextQuestionInSeconds: number; lastResult?: AnswerResultPayload | null; socket?: Socket | null; roomCode?: string }) {
  return (
    <ScreenFrame variant="results">
      <div className="flex flex-col h-full gap-6 pb-safe">
        
        {/* Header Section */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 shrink-0 px-1 mt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 text-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800">Leaderboard</h2>
              <p className="text-sm font-medium text-slate-500">Current standings</p>
            </div>
          </div>

          {nextQuestionInSeconds > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold border border-emerald-100 shadow-sm animate-pulse">
              <Clock className="w-4 h-4" />
              <span className="hidden sm:inline">Next in</span> {nextQuestionInSeconds}s
            </div>
          )}
        </div>

        {/* Players List Section */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-2 pb-6 min-h-0">
          <PlayerList players={players} showScores lastResult={lastResult} />
        </div>

      </div>
    </ScreenFrame>
  );
}

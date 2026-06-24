import { motion } from "framer-motion";
import { Player, AnswerResultPayload } from "../types";

export function PlayerList({ players, showScores = false, lastResult, renderExtra }: { players: Player[]; showScores?: boolean; lastResult?: AnswerResultPayload | null; renderExtra?: (player: Player) => React.ReactNode }) {
  if (players.length === 0) {
    return <p className="muted">No players yet.</p>;
  }

  return (
    <motion.ol className="player-list" layout>
      {players.map((player, index) => {
        const submission = lastResult?.submissions.find((s) => s.playerId === player.id);
        const isCorrect = submission?.correct;
        const pointsGained = submission?.points ?? 0;
        
        let rowClass = "";
        if (submission) {
           rowClass = isCorrect ? "correct-row" : "incorrect-row";
        }

        return (
          <motion.li key={player.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={`player-row ${rowClass}`}>
            <div className="player-row-left">
              <span className="rank">{index + 1}</span>
              <span className={!player.connected ? "offline" : ""}>
                <span className="player-icon">{player.icon ?? "🐶"}</span>
                <span className="player-name">{player.name}</span>
                {player.isHost && <span className="host-badge">Host</span>}
                {(player.streak ?? 0) > 1 && (
                  <span className="streak-badge">🔥 x{player.streak}</span>
                )}
              </span>
            </div>

            <div className="player-row-right">
              {showScores && (
                <div className="player-score-container">
                  {pointsGained > 0 && <span className="points-gained">+{pointsGained}</span>}
                  <strong className="player-score">{player.score}</strong>
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

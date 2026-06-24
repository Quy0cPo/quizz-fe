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
          <motion.li key={player.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className={rowClass}>
            <span className="rank">{index + 1}</span>
            <span className={!player.connected ? "offline" : ""}>
              <span style={{ marginRight: '0.25rem' }}>{player.icon ?? "🐶"}</span>
              {player.name}
              {player.isHost ? " (Host)" : ""}
            </span>
            {showScores ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {pointsGained > 0 && <span className="points-gained">+{pointsGained}</span>}
                <strong>{player.score}</strong>
              </div>
            ) : null}
            {renderExtra ? renderExtra(player) : null}
          </motion.li>
        );
      })}
    </motion.ol>
  );
}

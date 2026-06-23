import { Player, AnswerResultPayload } from "../types";
import { PlayerList } from "../components/PlayerList";

export function LeaderboardScreen({ players, nextQuestionInSeconds, lastResult }: { players: Player[]; nextQuestionInSeconds: number; lastResult?: AnswerResultPayload | null }) {
  return (
    <div className="screen-stack">
      <h2>Leaderboard</h2>
      <PlayerList players={players} showScores lastResult={lastResult} />
      {nextQuestionInSeconds > 0 ? <p className="muted">Next question starts in {nextQuestionInSeconds}...</p> : null}
    </div>
  );
}

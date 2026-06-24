import { Player, AnswerResultPayload } from "../types";
import { PlayerList } from "../components/PlayerList";
import { Socket } from "socket.io-client";

export function LeaderboardScreen({ players, nextQuestionInSeconds, lastResult, socket, roomCode }: { players: Player[]; nextQuestionInSeconds: number; lastResult?: AnswerResultPayload | null; socket?: Socket | null; roomCode?: string }) {
  return (
    <div className="screen-stack">
      <h2>Leaderboard</h2>
      <PlayerList players={players} showScores lastResult={lastResult} />
      {nextQuestionInSeconds > 0 ? <p className="muted">Next question starts in {nextQuestionInSeconds}...</p> : null}

      <div className="emote-bar">
        {["🔥", "💀", "🤡", "👏", "🎉", "😱"].map((emoji) => (
          <button 
            key={emoji} 
            className="emote-btn" 
            onClick={() => socket?.emit("send-emote", { roomCode, emote: emoji })}
            title="Send Emote"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
}

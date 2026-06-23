import { Player } from "../types";
import { PlayerList } from "../components/PlayerList";

export function LobbyScreen({
  roomCode,
  players,
  isHost,
  isStarting,
  copiedRoomCode,
  onCopyRoomCode,
  onStart
}: {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  isStarting: boolean;
  copiedRoomCode: boolean;
  onCopyRoomCode: () => void;
  onStart: () => void;
}) {
  return (
    <div className="screen-stack">
      <div className="room-code">
        <span>Room</span>
        <strong>{roomCode}</strong>
      </div>
      <button className="ghost-button" type="button" onClick={onCopyRoomCode}>
        {copiedRoomCode ? "Copied!" : "Copy Room Code"}
      </button>

      <PlayerList players={players} />

      {isHost ? (
        <button className="primary-button" disabled={isStarting} onClick={onStart}>
          {isStarting ? "Starting..." : "Start Game"}
        </button>
      ) : (
        <p className="muted">Waiting for host...</p>
      )}
    </div>
  );
}

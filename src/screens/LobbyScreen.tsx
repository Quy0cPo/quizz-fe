import { Player } from "../types";
import { PlayerList } from "../components/PlayerList";
import { Socket } from "socket.io-client";

export function LobbyScreen({
  roomCode,
  players,
  isHost,
  isStarting,
  copiedRoomCode,
  onCopyRoomCode,
  onStart,
  onLeaveRoom,
  socket
}: {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  isStarting: boolean;
  copiedRoomCode: boolean;
  onCopyRoomCode: () => void;
  onStart: () => void;
  onLeaveRoom: () => void;
  socket: Socket | null;
}) {

  const me = players.find(p => p.id === socket?.id);
  const allReady = players.every(p => p.isReady);

  return (
    <div className="screen-stack">
      <div className="room-code">
        <span>Room</span>
        <strong>{roomCode}</strong>
      </div>
      <button className="ghost-button" type="button" onClick={onCopyRoomCode}>
        {copiedRoomCode ? "Copied!" : "Copy Room Code"}
      </button>

      {!isHost && me && (
        <button 
          className={me.isReady ? "primary-button" : "secondary-button"} 
          onClick={() => socket?.emit("toggle-ready", { roomCode })}
        >
          {me.isReady ? "I'm Ready!" : "Click to Ready up"}
        </button>
      )}

      <PlayerList 
        players={players} 
        renderExtra={(player) => (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto' }}>
            {!player.isHost && (
              <span className={player.isReady ? "ready-badge" : "not-ready-badge"}>
                {player.isReady ? "Ready" : "Not Ready"}
              </span>
            )}
            {isHost && !player.isHost && (
              <button 
                className="kick-button" 
                onClick={() => socket?.emit("kick-player", { roomCode, targetId: player.id })}
                title="Kick Player"
              >
                ✕
              </button>
            )}
          </div>
        )}
      />

      {isHost ? (
        <button className="primary-button" disabled={isStarting || !allReady} onClick={onStart}>
          {isStarting ? "Starting..." : (!allReady ? "Waiting for players to ready..." : "Start Game")}
        </button>
      ) : (
        <p className="muted">Waiting for host...</p>
      )}

    </div>
  );
}

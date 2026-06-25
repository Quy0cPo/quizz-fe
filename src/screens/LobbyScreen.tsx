import { Player } from "../types";
import { PlayerList } from "../components/PlayerList";
import { Socket } from "socket.io-client";

export function LobbyScreen({
  roomCode,
  quizTitle,
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
  quizTitle?: string;
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
    <div className="screen-stack" style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, paddingBottom: '80px', gap: '16px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
        {quizTitle && (
          <h2 style={{ margin: 0, fontSize: '1.2rem', textAlign: 'center', color: '#2d3748' }}>
            {quizTitle}
          </h2>
        )}
        <div style={{ display: 'flex', width: '100%', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <div className="room-code" style={{ padding: '8px 24px', margin: 0, flex: 1, justifyContent: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.9rem' }}>Room</span>
          <strong style={{ fontSize: '2.2rem' }}>{roomCode}</strong>
        </div>
        <button 
          className="ghost-button" 
          type="button" 
          onClick={onCopyRoomCode}
          style={{ width: 'auto', padding: '0 16px', height: '100%', minHeight: '60px' }}
          title="Copy Room Code"
        >
          {copiedRoomCode ? "✅" : "📋"}
        </button>
      </div>

      <div className="player-list-container">
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
      </div>

      <div className="sticky-bottom-action">
        {!isHost && me && (
          <button 
            className={me.isReady ? "primary-button" : "secondary-button"} 
            onClick={() => socket?.emit("toggle-ready", { roomCode })}
          >
            {me.isReady ? "I'm Ready!" : "Click to Ready up"}
          </button>
        )}
        {isHost ? (
          <button className="primary-button" disabled={isStarting || !allReady} onClick={onStart}>
            {isStarting ? "Starting..." : (!allReady ? "Waiting for players to ready..." : "Start Game")}
          </button>
        ) : (
          !me && <p className="muted" style={{ textAlign: "center", margin: 0 }}>Waiting for host...</p>
        )}
      </div>
    </div>
  );
}

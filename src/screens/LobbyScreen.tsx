import { useState } from "react";
import { Player } from "../types";
import { Socket } from "socket.io-client";
import { motion } from "framer-motion";
import { Copy, Check, Users, Play, UserX, Crown, Link as LinkIcon } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ScreenFrame } from "../components/ui/ScreenFrame";
import { cn } from "../lib/utils";

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

  const [copiedLink, setCopiedLink] = useState(false);
  const me = players.find(p => p.id === socket?.id);
  const allReady = players.every(p => p.isReady);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/?code=${roomCode}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  };

  return (
    <ScreenFrame variant="form" maxWidth="3xl">
      <div className="flex flex-col h-full gap-6">
        
        {/* Top Info Block */}
        <div className="flex flex-col sm:flex-row gap-6 items-stretch">
          
          {/* Left Info */}
          <div className="flex-1 flex flex-col justify-center space-y-3">
            <div className="inline-flex items-center self-start justify-center px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-bold text-[10px] uppercase tracking-widest border border-emerald-500/20">
              Waiting Room
            </div>
            
            {quizTitle && (
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-50 leading-tight">
                {quizTitle}
              </h2>
            )}
            <p className="text-slate-400 font-medium text-sm">Ask your friends to join using this code or link:</p>
          </div>

          {/* Right Code Box */}
          <div className="shrink-0 w-full sm:w-80">
            <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 flex flex-col gap-2 h-full justify-center shadow-xl">
              <span className="text-slate-400 font-bold uppercase tracking-widest text-[10px] ml-1">Room Code</span>
              <div className="flex items-stretch gap-2">
                <div className="flex-1 flex items-center justify-center text-3xl font-black text-emerald-500 tracking-[0.2em] uppercase bg-slate-950 py-2.5 rounded-xl border-2 border-slate-800 shadow-sm">
                  {roomCode}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button 
                    variant="outline" 
                    className="w-12 h-10 px-0 bg-slate-950 border-2 border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all shadow-sm group"
                    onClick={onCopyRoomCode}
                    title="Copy Code"
                  >
                    {copiedRoomCode ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-12 h-10 px-0 bg-slate-950 border-2 border-slate-800 hover:bg-slate-800 hover:border-slate-700 transition-all shadow-sm group"
                    onClick={handleCopyLink}
                    title="Copy Invite Link"
                  >
                    {copiedLink ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <LinkIcon className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="shrink-0 w-full">
          {!isHost && me && (
            <Button 
              size="md"
              variant={me.isReady ? "outline" : "primary"}
              className={`w-full h-14 text-lg shadow-lg shadow-emerald-900/20 ${me.isReady ? "border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30 bg-slate-900" : "bg-emerald-600 hover:bg-emerald-500"}`}
              onClick={() => socket?.emit("toggle-ready", { roomCode })}
            >
              {me.isReady ? (
                <span className="flex items-center gap-2"><Check className="w-6 h-6" /> Ready!</span>
              ) : "Click to Ready up"}
            </Button>
          )}
          
          {isHost && (
            <Button 
              size="md" 
              className="w-full h-14 text-lg group shadow-lg shadow-indigo-900/20 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:shadow-none"
              disabled={isStarting || !allReady} 
              onClick={onStart}
            >
              {isStarting ? "Starting..." : (!allReady ? "Waiting for players to ready..." : (
                <span className="flex items-center gap-2">
                  Start Game
                  <Play className="w-6 h-6 fill-current group-hover:translate-x-1 transition-transform" />
                </span>
              ))}
            </Button>
          )}
          
          {!me && !isHost && (
            <div className="bg-slate-900 border border-slate-800 text-slate-400 font-bold p-4 text-base rounded-xl text-center">
              Waiting for host to start...
            </div>
          )}
        </div>

        {/* Players Panel */}
        <div className="flex-1 w-full flex flex-col min-h-0 bg-slate-900/50 rounded-3xl border border-slate-800 p-3 sm:p-5">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4 shrink-0 px-1">
            <h3 className="text-lg font-black text-slate-50 flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              Players Joined
              <span className="bg-slate-800 text-slate-300 text-xs px-2.5 py-0.5 rounded-full font-bold">{players.length}</span>
            </h3>
          </div>

          {/* Player Grid */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-1">
            {players.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3 py-8">
                <Users className="w-12 h-12 opacity-20" />
                <p className="font-bold text-base">Waiting for players...</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
                {players.map((player) => (
                  <motion.div 
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={cn(
                      "flex flex-col items-center p-3 rounded-2xl border-2 transition-all relative overflow-hidden group",
                      player.isReady ? "bg-emerald-500/10 border-emerald-500/30" : "bg-slate-900 border-slate-800 hover:border-slate-700 shadow-sm"
                    )}
                  >
                    <div className={cn("text-3xl mb-1.5 transition-transform group-hover:scale-110", !player.connected && "opacity-50 grayscale")}>
                      {player.icon ?? "🐶"}
                    </div>
                    
                    <div className="w-full text-center">
                      <span className="font-bold text-slate-50 text-sm truncate block w-full">
                        {player.name}
                      </span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-wider mt-0.5 block",
                        player.isReady ? "text-emerald-500" : "text-slate-500"
                      )}>
                        {player.isReady ? "Ready" : "Waiting"}
                      </span>
                    </div>

                    {player.isHost && (
                      <div className="absolute top-1.5 left-1.5 bg-amber-100 text-amber-600 p-1 rounded-full">
                        <Crown className="w-3 h-3 fill-amber-500" />
                      </div>
                    )}

                    {isHost && !player.isHost && (
                      <button 
                        className="absolute top-1.5 right-1.5 bg-red-50 text-red-500 p-1.5 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600 transition-all shadow-sm"
                        onClick={() => socket?.emit("kick-player", { roomCode, targetId: player.id })}
                        title="Kick Player"
                      >
                        <UserX className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </ScreenFrame>
  );
}

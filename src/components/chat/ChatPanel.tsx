import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { MessageList, ChatMessage } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ReactionBar } from "./ReactionBar";

export function ChatPanel({ socket, roomCode, playerId }: { socket: Socket | null; roomCode: string; playerId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat-message", handleMessage);
    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, [socket]);

  const handleSendMessage = (message: string) => {
    if (!socket) return;
    socket.emit("chat-message", { roomCode, message });
  };

  const handleSendReaction = (emote: string) => {
    if (!socket) return;
    socket.emit("send-emote", { roomCode, emote });
  };

  return (
    <div className="chat-panel">
      <div className="chat-panel-header">
        <h3>Lobby Chat</h3>
        <span className="online-count">🟢 Online</span>
      </div>
      
      <ReactionBar onSendReaction={handleSendReaction} />
      
      <MessageList messages={messages} currentPlayerId={playerId} />
      
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}

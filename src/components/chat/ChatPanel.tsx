import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { MessageList, ChatMessage } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ReactionBar } from "./ReactionBar";

export function ChatPanel({ socket, roomCode, playerId }: { socket: Socket | null; roomCode: string; playerId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      setMessages((prev) => {
        // If message is not from self and chat is not expanded, mark unread
        if (msg.playerId !== playerId) {
          setHasUnread(true);
        }
        return [...prev, msg];
      });
    };

    socket.on("chat-message", handleMessage);
    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, [socket, playerId]);

  const handleSendMessage = (message: string) => {
    if (!socket) return;
    socket.emit("chat-message", { roomCode, message });
  };

  const handleSendReaction = (emote: string) => {
    if (!socket) return;
    socket.emit("send-emote", { roomCode, emote });
  };

  const lastMessageObj = messages.length > 0 ? messages[messages.length - 1] : null;
  const lastMessagePreview = lastMessageObj 
    ? `${lastMessageObj.icon || "👤"} ${lastMessageObj.name}: ${lastMessageObj.message}` 
    : "No messages yet. Say hi!";

  return (
    <>
      {/* Backdrop for mobile */}
      {isExpanded && <div className="chat-backdrop" onClick={() => setIsExpanded(false)} />}
      
      <div className={`chat-panel ${isExpanded ? "expanded" : "collapsed"}`}>
        <div className="chat-panel-header" onClick={() => {
          setIsExpanded(!isExpanded);
          if (!isExpanded) setHasUnread(false);
        }} style={{ cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ display: 'flex', alignItems: 'center' }}>
              Lobby Chat
              {hasUnread && !isExpanded && <span className="unread-dot"></span>}
            </h3>
            <span className="online-count">🟢 Online</span>
          </div>
          {!isExpanded && (
            <div className="chat-preview">
              <span className="muted" style={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '200px', display: 'inline-block' }}>
                {lastMessagePreview}
              </span>
            </div>
          )}
          <button className="chat-toggle-btn" aria-label="Toggle Chat">
            {isExpanded ? "▼" : "▲"}
          </button>
        </div>
        
        <div className="chat-panel-content">
          <ReactionBar onSendReaction={handleSendReaction} />
          <MessageList messages={messages} currentPlayerId={playerId} />
          <MessageInput onSendMessage={handleSendMessage} />
        </div>
      </div>
    </>
  );
}

import { useEffect, useRef } from "react";

export type ChatMessage = {
  playerId: string;
  name: string;
  icon?: string;
  message: string;
  timestamp: number;
};

export function MessageList({ messages, currentPlayerId }: { messages: ChatMessage[]; currentPlayerId: string }) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-message-list">
      {messages.length === 0 && (
        <div className="chat-empty-state">
          <p className="muted">No messages yet. Say hi!</p>
        </div>
      )}
      {messages.map((msg, idx) => {
        const isSelf = msg.playerId === currentPlayerId;
        return (
          <div key={idx} className={`chat-message ${isSelf ? "self" : "other"}`}>
            <span className="chat-name">{msg.icon || "👤"} {msg.name}</span>
            <div className="chat-bubble">
              <span className="chat-text">{msg.message}</span>
              <span className="chat-time">
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

import { useEffect, useRef } from "react";
import { cn } from "../../lib/utils";
import { motion } from "framer-motion";

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
    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-900/50">
      {messages.length === 0 && (
        <div className="h-full flex items-center justify-center">
          <p className="text-slate-500 font-medium bg-slate-800 px-4 py-2 rounded-xl">No messages yet. Say hi!</p>
        </div>
      )}
      
      {messages.map((msg, idx) => {
        const isSelf = msg.playerId === currentPlayerId;
        return (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            key={idx} 
            className={cn("flex flex-col max-w-[85%]", isSelf ? "ml-auto items-end" : "mr-auto items-start")}
          >
            <span className="text-xs font-bold text-slate-400 mb-1 ml-1 flex items-center gap-1">
              {msg.icon || "👤"} {msg.name}
            </span>
            <div className={cn(
              "px-4 py-2 rounded-2xl relative shadow-sm",
              isSelf 
                ? "bg-emerald-500 text-white rounded-tr-sm" 
                : "bg-slate-950 border border-slate-800 text-slate-50 rounded-tl-sm"
            )}>
              <span className="text-[15px] leading-relaxed break-words">{msg.message}</span>
              <span className={cn(
                "text-[10px] ml-3 mt-1 inline-block",
                isSelf ? "text-emerald-200" : "text-slate-500"
              )}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </motion.div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
}

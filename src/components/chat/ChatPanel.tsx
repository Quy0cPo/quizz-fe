import { useState, useEffect } from "react";
import { Socket } from "socket.io-client";
import { MessageList, ChatMessage } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ReactionBar } from "./ReactionBar";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, ChevronDown, ChevronUp, Bell } from "lucide-react";
import { cn } from "../../lib/utils";

export function ChatPanel({ socket, roomCode, playerId }: { socket: Socket | null; roomCode: string; playerId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      if (msg.playerId !== playerId && !isExpanded) {
        setUnreadCount((count) => count + 1);
      }
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("chat-message", handleMessage);
    return () => {
      socket.off("chat-message", handleMessage);
    };
  }, [socket, playerId, isExpanded]);

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
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="md:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40" 
            onClick={() => setIsExpanded(false)} 
          />
        )}
      </AnimatePresence>
      
      <div className={cn(
        "flex flex-col bg-slate-900 border border-slate-800 shadow-xl transition-all duration-300 z-50",
        "fixed md:relative bottom-0 right-0 left-0 md:bottom-auto md:right-auto md:left-auto",
        "md:w-full md:h-full md:rounded-3xl md:overflow-hidden",
        isExpanded ? "h-[70vh] rounded-t-3xl" : "h-[52px]"
      )}>
        <button 
          onClick={() => {
            setIsExpanded(!isExpanded);
            setUnreadCount(0);
          }} 
          className={cn(
            "flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md transition-colors w-full text-left",
            !isExpanded && "hover:bg-slate-800",
            "md:cursor-default md:hover:bg-transparent"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 relative shrink-0">
              <MessageCircle className="w-5 h-5" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full"></span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <h3 className="font-semibold text-slate-50 text-sm flex items-center gap-2">
                Room Chat
              </h3>
              {!isExpanded && (
                <span className="text-xs font-medium text-slate-400 truncate max-w-[180px] md:max-w-[200px]">
                  {lastMessagePreview}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {unreadCount > 0 && !isExpanded && (
              <div className="flex items-center gap-1 bg-rose-500/10 text-rose-500 px-2 py-1 rounded-lg font-bold text-xs animate-bounce">
                <Bell className="w-3 h-3" />
                {unreadCount > 9 ? "9+" : unreadCount}
              </div>
            )}
            <div className="md:hidden w-8 h-8 flex items-center justify-center rounded-full bg-slate-800 text-slate-400">
              {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
            </div>
          </div>
        </button>
        
        <div className={cn(
          "flex-1 flex flex-col min-h-0 bg-slate-900/50",
          !isExpanded && "hidden md:flex"
        )}>
          <ReactionBar onSendReaction={handleSendReaction} />
          <MessageList messages={messages} currentPlayerId={playerId} />
          <div className="p-3 bg-slate-900 border-t border-slate-800">
            <MessageInput onSendMessage={handleSendMessage} />
          </div>
        </div>
      </div>
    </>
  );
}

import { useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";

type EmoteInstance = {
  id: string;
  emote: string;
  xOffset: number;
};

export function EmoteOverlay({ socket }: { socket: Socket | null }) {
  const [emotes, setEmotes] = useState<EmoteInstance[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleReceive = ({ emote }: { emote: string }) => {
      const id = Math.random().toString(36).substr(2, 9);
      const xOffset = Math.random() * 100 - 50; // Random horizontal offset

      setEmotes((prev) => [...prev, { id, emote, xOffset }]);

      // Remove after animation finishes
      setTimeout(() => {
        setEmotes((prev) => prev.filter((e) => e.id !== id));
      }, 3000);
    };

    socket.on("receive-emote", handleReceive);
    return () => {
      socket.off("receive-emote", handleReceive);
    };
  }, [socket]);

  return (
    <div style={{ position: "fixed", bottom: 0, left: "50%", pointerEvents: "none", zIndex: 9999 }}>
      <AnimatePresence>
        {emotes.map((e) => (
          <motion.div
            key={e.id}
            initial={{ y: 50, x: e.xOffset, opacity: 1, scale: 0.5 }}
            animate={{ y: -500, x: e.xOffset + (Math.random() * 40 - 20), opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2.5, ease: "easeOut" }}
            style={{
              position: "absolute",
              fontSize: "3rem",
              transform: "translate(-50%, 0)",
            }}
          >
            {e.emote}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

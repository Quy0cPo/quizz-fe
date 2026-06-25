export function ReactionBar({ onSendReaction }: { onSendReaction: (emote: string) => void }) {
  const emojis = ["🔥", "💀", "🤡", "👏", "🎉", "😱"];

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-800 bg-slate-900 overflow-x-auto custom-scrollbar shrink-0">
      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">React:</span>
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="w-9 h-9 rounded-lg bg-slate-950 border border-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:scale-110 transition-all text-lg flex flex-shrink-0 items-center justify-center"
          onClick={() => onSendReaction(emoji)}
          title={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

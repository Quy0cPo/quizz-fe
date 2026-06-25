export function ReactionBar({ onSendReaction }: { onSendReaction: (emote: string) => void }) {
  const emojis = ["🔥", "💀", "🤡", "👏", "🎉", "😱"];

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-slate-100 bg-white overflow-x-auto custom-scrollbar shrink-0">
      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">React:</span>
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 hover:bg-emerald-50 hover:border-emerald-200 hover:scale-110 transition-all text-lg flex flex-shrink-0 items-center justify-center"
          onClick={() => onSendReaction(emoji)}
          title={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

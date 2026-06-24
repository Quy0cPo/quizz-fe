export function ReactionBar({ onSendReaction }: { onSendReaction: (emote: string) => void }) {
  const emojis = ["🔥", "💀", "🤡", "👏", "🎉", "😱"];

  return (
    <div className="chat-reaction-bar">
      {emojis.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className="chat-reaction-btn"
          onClick={() => onSendReaction(emoji)}
          title={`Send ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

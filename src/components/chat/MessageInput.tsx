import { useState } from "react";

export function MessageInput({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
  };

  return (
    <form className="chat-input-area" onSubmit={handleSubmit}>
      <input
        type="text"
        className="chat-input-field"
        placeholder="Type a message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        maxLength={100}
      />
      <button type="submit" className="chat-send-btn">
        Send
      </button>
    </form>
  );
}

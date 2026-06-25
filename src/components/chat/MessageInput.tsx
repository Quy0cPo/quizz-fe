import { useState, useRef } from "react";
import { SendHorizonal } from "lucide-react";
import { Button } from "../ui/Button";

export function MessageInput({ onSendMessage }: { onSendMessage: (msg: string) => void }) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    onSendMessage(inputValue);
    setInputValue("");
    inputRef.current?.focus();
  };

  return (
    <form className="flex items-center gap-2 w-full relative" onSubmit={handleSubmit}>
      <input
        ref={inputRef}
        type="text"
        className="flex-1 h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 pr-11 text-base sm:text-sm text-slate-50 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
        placeholder="Type a message..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        maxLength={100}
        autoComplete="off"
      />
      <Button 
        type="submit" 
        size="icon" 
        disabled={!inputValue.trim()}
        className="absolute right-1 top-1 bottom-1 !h-8 !w-8 !min-h-0 !min-w-0 p-0 rounded-lg shrink-0 disabled:opacity-50 flex items-center justify-center"
      >
        <SendHorizonal className="w-4 h-4" />
      </Button>
    </form>
  );
}

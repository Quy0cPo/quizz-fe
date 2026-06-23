import { useState, FormEvent } from "react";
import { GeneratedQuiz } from "../types";

export function RoomsScreen({
  name,
  icon,
  joinCode,
  savedQuizzes,
  isCreating,
  isJoining,
  onNameChange,
  onIconChange,
  onJoinCodeChange,
  onCreateRoomWithQuiz,
  onJoin,
  onBack
}: {
  name: string;
  icon: string;
  joinCode: string;
  savedQuizzes: GeneratedQuiz[];
  isCreating: boolean;
  isJoining: boolean;
  onNameChange: (value: string) => void;
  onIconChange: (value: string) => void;
  onJoinCodeChange: (value: string) => void;
  onCreateRoomWithQuiz: (quiz: GeneratedQuiz | null) => void;
  onJoin: (event: FormEvent) => void;
  onBack: () => void;
}) {
  const [searchTopic, setSearchTopic] = useState("");
  const ICONS = ["🐶", "🐱", "🦊", "🐻", "🐼", "🐸", "🐰", "🐯", "🐍", "🐲", "🦁", "🐵", "🐧", "🦄", "🦉", "🐙"];

  const filteredQuizzes = savedQuizzes.filter((quiz) => {
    const query = searchTopic.toLowerCase();
    return quiz.title.toLowerCase().includes(query) || quiz.topic.toLowerCase().includes(query);
  });

  return (
    <div className="screen-stack">
      <label>
        Your Name
        <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="John" />
      </label>

      <label>
        Select your icon
        <div style={{ display: "flex", gap: "0.5rem", fontSize: "1.5rem", flexWrap: "wrap", marginTop: "0.25rem" }}>
          {ICONS.map((i) => (
            <button
              key={i}
              type="button"
              className={icon === i ? "primary-button" : "ghost-button"}
              style={{ padding: "0.25rem", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: icon === i ? "2px solid white" : "none" }}
              onClick={() => onIconChange(i)}
            >
              {i}
            </button>
          ))}
        </div>
      </label>

      <fieldset className="quiz-type-group" style={{ display: "flex", flexDirection: "column" }}>
        <legend>Create Room</legend>
        <input 
          type="text" 
          value={searchTopic} 
          onChange={(e) => setSearchTopic(e.target.value)} 
          placeholder="Search quizzes by topic..." 
          style={{ padding: "0.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)", marginBottom: "0.5rem", width: "100%" }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto", marginBottom: "1rem" }}>
          {filteredQuizzes.length === 0 ? (
            <p className="muted" style={{ margin: "0.5rem 0" }}>No matching quizzes.</p>
          ) : (
            filteredQuizzes.map((quiz) => (
              <div key={quiz._id || quiz.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "8px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <strong>{quiz.title}</strong>
                  <span className="muted" style={{ fontSize: "0.8rem" }}>{quiz.topic} - {quiz.difficulty} ({quiz.questions?.length ?? 0} Qs)</span>
                </div>
                <button className="primary-button" style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }} disabled={isCreating} onClick={() => onCreateRoomWithQuiz(quiz)}>
                  Play
                </button>
              </div>
            ))
          )}
        </div>
        <button className="ghost-button" type="button" disabled={isCreating} onClick={() => onCreateRoomWithQuiz(null)}>
          {isCreating ? "Creating..." : "Create with Sample Quiz"}
        </button>
      </fieldset>

      <fieldset className="quiz-type-group" style={{ display: "flex", flexDirection: "column" }}>
        <legend>Join Room</legend>
        <form className="join-form" onSubmit={onJoin} style={{ margin: 0, display: "flex", gap: "0.5rem" }}>
          <label style={{ flex: 1, marginBottom: 0 }}>
            <input
              type="text"
              inputMode="numeric"
              pattern="\d*"
              style={{ width: "100%" }}
              value={joinCode}
              onChange={(event) => onJoinCodeChange(event.target.value.replace(/\D/g, ''))}
              maxLength={5}
              placeholder="Room Code (e.g. 12345)"
            />
          </label>
          <button className="secondary-button" type="submit" disabled={isJoining} style={{ width: "auto", minWidth: "100px", flexShrink: 0 }}>
            {isJoining ? "Joining..." : "Join"}
          </button>
        </form>
      </fieldset>

      <button className="ghost-button" type="button" onClick={onBack}>
        Back to Home
      </button>
    </div>
  );
}

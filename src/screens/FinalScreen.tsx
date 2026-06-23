import { useState } from "react";
import { Player, GeneratedQuiz } from "../types";
import { PlayerList } from "../components/PlayerList";

export function FinalScreen({
  winner,
  players,
  isHost,
  me,
  savedQuizzes,
  onPlayAgain,
  onChangeQuiz,
  onLeaveRoom
}: {
  winner?: Player;
  players: Player[];
  isHost: boolean;
  me?: Player;
  savedQuizzes: GeneratedQuiz[];
  onPlayAgain: () => void;
  onChangeQuiz: (quiz: GeneratedQuiz) => void;
  onLeaveRoom: () => void;
}) {
  const [showQuizSelector, setShowQuizSelector] = useState(false);

  return (
    <div className="screen-stack">
      <div className="winner-panel">
        <p>Game Over</p>
        <h2>{winner?.name ?? "No winner"}</h2>
        <strong>{winner?.score ?? 0} points</strong>
      </div>

      {me ? <p className="muted">Your final score: {me.score}</p> : null}
      <PlayerList players={players} showScores />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', marginTop: '1rem' }}>
        {isHost ? (
          <>
            <button className="primary-button" onClick={onPlayAgain}>
              Play Again (Same Quiz)
            </button>
            <button className="secondary-button" onClick={() => setShowQuizSelector(!showQuizSelector)}>
              Play New Quiz (Keep Room)
            </button>
            
            {showQuizSelector && (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto", marginTop: "0.5rem", border: "1px solid rgba(255,255,255,0.1)", padding: "0.5rem", borderRadius: "8px" }}>
                {savedQuizzes.length === 0 ? (
                  <p className="muted" style={{ margin: "0.5rem 0", textAlign: 'center' }}>No saved quizzes.</p>
                ) : (
                  savedQuizzes.map((quiz) => (
                    <div key={quiz._id || quiz.title} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(255,255,255,0.05)", padding: "0.5rem", borderRadius: "8px" }}>
                      <div style={{ display: "flex", flexDirection: "column", textAlign: 'left' }}>
                        <strong>{quiz.title}</strong>
                        <span className="muted" style={{ fontSize: "0.8rem" }}>{quiz.topic} - {quiz.difficulty} ({quiz.questions?.length ?? 0} Qs)</span>
                      </div>
                      <button className="primary-button" style={{ padding: "0.4rem 0.8rem", fontSize: "0.9rem" }} onClick={() => onChangeQuiz(quiz)}>
                        Select
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        ) : (
          <p className="muted" style={{ textAlign: 'center', marginBottom: '1rem' }}>Waiting for host to start a new game...</p>
        )}
        
        <button className="ghost-button" onClick={onLeaveRoom}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

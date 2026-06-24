import { useState, useEffect } from "react";
import { QuestionPayload } from "../types";

export function QuestionScreen({
  payload,
  answer,
  submitted,
  onAnswerChange,
  onSubmit
}: {
  payload: QuestionPayload;
  answer: string;
  submitted: boolean;
  onAnswerChange: (value: string) => void;
  onSubmit: (answer: string) => void;
}) {
  const [remaining, setRemaining] = useState(payload.durationSeconds);

  useEffect(() => {
    const interval = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - payload.startedAt) / 1000);
      setRemaining(Math.max(payload.durationSeconds - elapsed, 0));
    }, 250);

    return () => window.clearInterval(interval);
  }, [payload.durationSeconds, payload.startedAt]);

  const progress = `${(remaining / payload.durationSeconds) * 100}%`;

  return (
    <div className="screen-stack">
      {payload.quizTitle && (
        <h3 className="quiz-title-badge">{payload.quizTitle}</h3>
      )}
      <div className="question-meta">
        <span>
          Question {payload.questionNumber} / {payload.totalQuestions}
        </span>
        <strong>{remaining}s</strong>
      </div>
      <div className="timer-track">
        <div className="timer-bar" style={{ width: progress }} />
      </div>

      {payload.question.type === "mcq" ? (
        <>
          <h2>{payload.question.question}</h2>
          <div className="answer-grid">
            {payload.question.options.map((option, index) => (
              <button
                className="answer-card"
                disabled={submitted}
                key={option}
                onClick={() => onSubmit(option)}
              >
                <span>{String.fromCharCode(65 + index)}</span>
                {option}
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <p className="muted">Rearrange letters</p>
          <h2 className="scramble-word">{payload.question.question}</h2>
          <form
            className="screen-stack compact"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(answer);
            }}
          >
            <input value={answer} disabled={submitted} onChange={(event) => onAnswerChange(event.target.value)} placeholder="Your answer" />
            <button className="primary-button" type="submit" disabled={submitted}>
              {submitted ? "Submitted" : "Submit"}
            </button>
          </form>
        </>
      )}

      {submitted ? <p className="muted">Answer submitted. Waiting for the round result...</p> : null}
    </div>
  );
}

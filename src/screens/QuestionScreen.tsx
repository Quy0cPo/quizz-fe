import { useState, useEffect, useRef } from "react";
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
  const barRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLElement>(null);

  useEffect(() => {
    let animationFrameId: number;

    const updateTimer = () => {
      const elapsed = (Date.now() - payload.startedAt) / 1000;
      const timeLeft = Math.max(payload.durationSeconds - elapsed, 0);
      const progress = (timeLeft / payload.durationSeconds) * 100;

      if (barRef.current) {
        barRef.current.style.width = `${progress}%`;
        
        // Add urgency classes in final 5 seconds
        if (timeLeft <= 5 && timeLeft > 0) {
          barRef.current.classList.add("urgent");
        } else {
          barRef.current.classList.remove("urgent");
        }
      }

      if (textRef.current) {
        // Only show ceiling whole seconds to match traditional timers
        textRef.current.innerText = `${Math.ceil(timeLeft)}s`;
      }

      if (timeLeft > 0) {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(animationFrameId);
  }, [payload.durationSeconds, payload.startedAt]);

  return (
    <div className="screen-stack">
      {payload.quizTitle && (
        <h3 className="quiz-title-badge">{payload.quizTitle}</h3>
      )}
      <div className="question-meta">
        <span>
          Question {payload.questionNumber} / {payload.totalQuestions}
        </span>
        <strong ref={textRef}>{payload.durationSeconds}s</strong>
      </div>
      <div className="timer-track">
        <div ref={barRef} className="timer-bar" />
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

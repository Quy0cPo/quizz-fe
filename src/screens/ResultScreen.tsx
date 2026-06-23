import { AnswerResultPayload } from "../types";

export function ResultScreen({ submission, correctAnswer, rank }: { submission?: AnswerResultPayload["submissions"][number]; correctAnswer: string; rank: number }) {
  const isCorrect = Boolean(submission?.correct);

  return (
    <div className="result-panel">
      <p className={isCorrect ? "result-correct" : "result-wrong"}>{isCorrect ? "Correct!" : "Wrong!"}</p>
      <h2>{isCorrect ? `+${submission?.points ?? 0} points` : `Correct Answer: ${correctAnswer}`}</h2>
      <p className="muted">Current Rank #{rank || "-"}</p>
    </div>
  );
}

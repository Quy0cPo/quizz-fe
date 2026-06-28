export type Screen = "home" | "generate" | "rooms" | "lobby" | "countdown" | "question" | "result" | "leaderboard" | "global-leaderboard" | "final" | "admin-login" | "admin-dashboard" | "admin";

export type PublicQuestion =
  | {
      type: "mcq";
      question: string;
      options: string[];
      imageUrl?: string;
    }
  | {
      type: "unscramble";
      question: string;
      imageUrl?: string;
    };

export type Player = {
  id: string;
  name: string;
  icon?: string;
  score: number;
  connected: boolean;
  isHost: boolean;
  isReady?: boolean;
  streak?: number;
};

export type QuestionPayload = {
  roomCode: string;
  quizTitle?: string;
  questionNumber: number;
  totalQuestions: number;
  durationSeconds: number;
  startedAt: number;
  question: PublicQuestion;
};

export type AnswerResultPayload = {
  roomCode: string;
  correctAnswer: string;
  submissions: {
    playerId: string;
    answer: string;
    correct: boolean;
    points: number;
    streak?: number;
    previousStreak?: number;
    submittedAt: number;
  }[];
  leaderboard: Player[];
};

export type QuizSettings = {
  topic: string;
  difficulty: string;
  questions: number | string;
  types: Array<"mcq" | "unscramble">;
  additionalPrompt: string;
  includeImages?: boolean;
};

export type GeneratedQuiz = {
  _id?: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: PublicQuestion[];
};

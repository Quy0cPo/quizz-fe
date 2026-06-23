import { FormEvent, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";

type Screen = "home" | "generate" | "rooms" | "lobby" | "question" | "result" | "leaderboard" | "final";

type PublicQuestion =
  | {
      type: "mcq";
      question: string;
      options: string[];
    }
  | {
      type: "unscramble";
      question: string;
    };

type Player = {
  id: string;
  name: string;
  score: number;
  connected: boolean;
  isHost: boolean;
};

type QuestionPayload = {
  roomCode: string;
  questionNumber: number;
  totalQuestions: number;
  durationSeconds: number;
  startedAt: number;
  question: PublicQuestion;
};

type AnswerResultPayload = {
  roomCode: string;
  correctAnswer: string;
  submissions: {
    playerId: string;
    answer: string;
    correct: boolean;
    points: number;
    submittedAt: number;
  }[];
  leaderboard: Player[];
};

type QuizSettings = {
  topic: string;
  difficulty: string;
  questions: number | string;
  types: Array<"mcq" | "unscramble">;
  additionalPrompt: string;
};

type GeneratedQuiz = {
  _id?: string;
  title: string;
  topic: string;
  difficulty: string;
  questions: PublicQuestion[];
};

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4001";

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [screen, setScreen] = useState<Screen>("home");
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [roomCode, setRoomCode] = useState("");
  const [playerId, setPlayerId] = useState("");
  const [isHost, setIsHost] = useState(false);
  const [players, setPlayers] = useState<Player[]>([]);
  const [question, setQuestion] = useState<QuestionPayload | null>(null);
  const [answer, setAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [lastResult, setLastResult] = useState<AnswerResultPayload | null>(null);
  const [leaderboard, setLeaderboard] = useState<Player[]>([]);
  const [nextQuestionInSeconds, setNextQuestionInSeconds] = useState(0);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState<"creating" | "joining" | "starting" | null>(null);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizSettings, setQuizSettings] = useState<QuizSettings>({
    topic: "Travel",
    difficulty: "Easy",
    questions: 5,
    types: ["mcq", "unscramble"],
    additionalPrompt: ""
  });
  const [generatedQuiz, setGeneratedQuiz] = useState<GeneratedQuiz | null>(null);
  const [savedQuizzes, setSavedQuizzes] = useState<GeneratedQuiz[]>([]);
  const [copiedRoomCode, setCopiedRoomCode] = useState(false);

  function loadSavedQuizzes() {
    fetch(`${SERVER_URL}/api/quizzes`)
      .then((res) => res.json())
      .then((data) => {
        if (data && data.quizzes) {
          setSavedQuizzes(data.quizzes);
        }
      })
      .catch((err) => console.error("Failed to load quizzes", err));
  }

  useEffect(() => {
    loadSavedQuizzes();
  }, []);

  useEffect(() => {
    const nextSocket = io(SERVER_URL);
    setSocket(nextSocket);

    nextSocket.on("connect", () => {
      setError("");
    });

    nextSocket.on("connect_error", () => {
      setError("Cannot connect to the backend. Is it running on port 4001?");
    });

    nextSocket.on("app-error", ({ message }: { message: string }) => {
      setError(message);
      setPendingAction(null);
    });

    nextSocket.on("room-created", ({ roomCode: createdCode, playerId: id }: { roomCode: string; playerId: string }) => {
      setRoomCode(createdCode);
      setPlayerId(id);
      setIsHost(true);
      setPendingAction(null);
      setScreen("lobby");
      setError("");
    });

    nextSocket.on("room-joined", ({ roomCode: joinedCode, playerId: id, isHost: host }: { roomCode: string; playerId: string; isHost: boolean }) => {
      setRoomCode(joinedCode);
      setPlayerId(id);
      setIsHost(host);
      setPendingAction(null);
      setScreen("lobby");
      setError("");
    });

    nextSocket.on("player-list", ({ players: nextPlayers, hostSocketId }: { players: Player[]; hostSocketId: string }) => {
      setPlayers(nextPlayers);
      setLeaderboard(nextPlayers);
      setIsHost(nextSocket.id === hostSocketId);
    });

    nextSocket.on("question-start", (payload: QuestionPayload) => {
      setQuestion(payload);
      setAnswer("");
      setSubmitted(false);
      setLastResult(null);
      setPendingAction(null);
      setScreen("question");
    });

    nextSocket.on("answer-submitted", () => {
      setSubmitted(true);
    });

    nextSocket.on("answer-result", (payload: AnswerResultPayload) => {
      setLastResult(payload);
      setLeaderboard(payload.leaderboard);
      setScreen("result");
    });

    nextSocket.on(
      "leaderboard-update",
      ({ leaderboard: nextLeaderboard, nextQuestionInSeconds: seconds }: { leaderboard: Player[]; nextQuestionInSeconds: number }) => {
        setLeaderboard(nextLeaderboard);
        setNextQuestionInSeconds(seconds);
        setScreen("leaderboard");
      }
    );

    nextSocket.on("game-over", ({ leaderboard: finalLeaderboard }: { leaderboard: Player[] }) => {
      setLeaderboard(finalLeaderboard);
      setScreen("final");
    });

    nextSocket.on("room-reset", () => {
      setQuestion(null);
      setAnswer("");
      setSubmitted(false);
      setLastResult(null);
      setScreen("lobby");
    });

    return () => {
      nextSocket.disconnect();
    };
  }, []);

  const me = useMemo(() => players.find((player) => player.id === playerId), [playerId, players]);
  const mySubmission = lastResult?.submissions.find((submission) => submission.playerId === playerId);
  const winner = leaderboard[0];

  function requireName() {
    if (!name.trim()) {
      setError("Enter your name first.");
      return false;
    }

    return true;
  }

  function createRoom(quizPayload: GeneratedQuiz | null) {
    if (!socket || !requireName()) return;
    setPendingAction("creating");
    socket.emit("create-room", { name, quiz: quizPayload });
  }

  function joinRoom(event: FormEvent) {
    event.preventDefault();
    if (!socket || !requireName()) return;

    if (!joinCode.trim()) {
      setError("Enter a room code.");
      return;
    }

    setPendingAction("joining");
    socket.emit("join-room", { name, roomCode: joinCode });
  }

  function startGame() {
    setPendingAction("starting");
    socket?.emit("start-game", { roomCode });
  }

  async function generateQuiz() {
    setIsGeneratingQuiz(true);
    setError("");
    setGeneratedQuiz(null);

    try {
      const response = await fetch(`${SERVER_URL}/api/quizzes/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(quizSettings)
      });
      const data = (await response.json()) as { quiz?: GeneratedQuiz; message?: string };

      if (!response.ok || !data.quiz) {
        throw new Error(data.message ?? "Unable to generate quiz.");
      }

      setGeneratedQuiz(data.quiz);
      loadSavedQuizzes(); // Refresh the list of quizzes
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : "Unable to generate quiz.";
      setError(message);
    } finally {
      setIsGeneratingQuiz(false);
    }
  }

  function submitAnswer(selectedAnswer: string) {
    if (!socket || submitted) return;

    const finalAnswer = selectedAnswer.trim();
    if (!finalAnswer) {
      setError("Enter an answer first.");
      return;
    }

    socket.emit("submit-answer", { roomCode, answer: finalAnswer });
    setSubmitted(true);
  }

  async function copyRoomCode() {
    if (!roomCode) return;

    await navigator.clipboard.writeText(roomCode);
    setCopiedRoomCode(true);
    window.setTimeout(() => setCopiedRoomCode(false), 1600);
  }

  function playAgain() {
    socket?.emit("play-again", { roomCode });
  }

  function leaveRoom() {
    socket?.emit("leave-room");
    setRoomCode("");
    setPlayerId("");
    setIsHost(false);
    setPlayers([]);
    setLeaderboard([]);
    setQuestion(null);
    setLastResult(null);
    setScreen("home");
  }

  function changeQuiz(quiz: GeneratedQuiz) {
    socket?.emit("change-quiz", { roomCode, quiz });
  }

  return (
    <main className="app-shell">
      <section className="game-frame">
        <header className="topbar">
          <div>
            <p className="eyebrow">OPIC Practice</p>
            <h1>OPIC Quiz Battle</h1>
          </div>
          {roomCode ? <span className="room-pill">{roomCode}</span> : null}
        </header>

        {error ? <div className="alert">{error}</div> : null}

        {screen === "home" ? (
          <HomeScreen
            onNavigateGenerate={() => {
              setError("");
              setScreen("generate");
            }}
            onNavigateRooms={() => {
              setError("");
              loadSavedQuizzes();
              setScreen("rooms");
            }}
          />
        ) : null}

        {screen === "generate" ? (
          <GenerateScreen
            isGeneratingQuiz={isGeneratingQuiz}
            settings={quizSettings}
            generatedQuiz={generatedQuiz}
            onSettingsChange={(settings) => {
              setQuizSettings(settings);
              setGeneratedQuiz(null);
            }}
            onBack={() => setScreen("home")}
            onGenerateQuiz={generateQuiz}
            onGoToRooms={() => {
              setError("");
              loadSavedQuizzes();
              setScreen("rooms");
            }}
          />
        ) : null}

        {screen === "rooms" ? (
          <RoomsScreen
            name={name}
            joinCode={joinCode}
            savedQuizzes={savedQuizzes}
            isCreating={pendingAction === "creating"}
            isJoining={pendingAction === "joining"}
            onNameChange={setName}
            onJoinCodeChange={setJoinCode}
            onCreateRoomWithQuiz={createRoom}
            onJoin={joinRoom}
            onBack={() => setScreen("home")}
          />
        ) : null}

        {screen === "lobby" ? (
          <LobbyScreen
            roomCode={roomCode}
            players={players}
            isHost={isHost}
            isStarting={pendingAction === "starting"}
            copiedRoomCode={copiedRoomCode}
            onCopyRoomCode={copyRoomCode}
            onStart={startGame}
          />
        ) : null}

        {screen === "question" && question ? (
          <QuestionScreen
            payload={question}
            answer={answer}
            submitted={submitted}
            onAnswerChange={setAnswer}
            onSubmit={submitAnswer}
          />
        ) : null}

        {screen === "result" ? (
          <ResultScreen
            submission={mySubmission}
            correctAnswer={lastResult?.correctAnswer ?? ""}
            rank={leaderboard.findIndex((player) => player.id === playerId) + 1}
          />
        ) : null}

        {screen === "leaderboard" ? (
          <LeaderboardScreen
            players={leaderboard}
            nextQuestionInSeconds={nextQuestionInSeconds}
          />
        ) : null}

        {screen === "final" ? (
          <FinalScreen
            winner={winner}
            players={leaderboard}
            isHost={isHost}
            me={me}
            savedQuizzes={savedQuizzes}
            onPlayAgain={playAgain}
            onChangeQuiz={changeQuiz}
            onLeaveRoom={leaveRoom}
          />
        ) : null}
      </section>
    </main>
  );
}

function HomeScreen({ onNavigateGenerate, onNavigateRooms }: { onNavigateGenerate: () => void; onNavigateRooms: () => void }) {
  return (
    <div className="screen-stack">
      <p className="muted">Welcome! Choose an option to start.</p>
      <button className="primary-button" onClick={onNavigateGenerate}>
        Generate New Quiz
      </button>
      <button className="secondary-button" onClick={onNavigateRooms}>
        Rooms (Create / Join)
      </button>
    </div>
  );
}

function GenerateScreen({
  isGeneratingQuiz,
  settings,
  generatedQuiz,
  onSettingsChange,
  onBack,
  onGenerateQuiz,
  onGoToRooms
}: {
  isGeneratingQuiz: boolean;
  settings: QuizSettings;
  generatedQuiz: GeneratedQuiz | null;
  onSettingsChange: (settings: QuizSettings) => void;
  onBack: () => void;
  onGenerateQuiz: () => void;
  onGoToRooms: () => void;
}) {
  function updateSettings(nextSettings: Partial<QuizSettings>) {
    onSettingsChange({ ...settings, ...nextSettings });
  }

  function updateQuizType(type: "mcq" | "unscramble", checked: boolean) {
    const nextTypes = checked ? [...settings.types, type] : settings.types.filter((nextType) => nextType !== type);
    updateSettings({ types: nextTypes.length ? nextTypes : [type] });
  }

  const topicSuggestions = [
    "IELTS Speaking Part 1",
    "Job interview questions",
    "Daily Life conversations",
    "Phrasal verbs for travel",
    "Business Email Vocabulary",
    "Technology and AI slang"
  ];

  return (
    <div className="screen-stack">
      <div className="settings-grid">
        <label style={{ gridColumn: "1 / -1" }}>
          What should the quiz be about? (Topic or Prompt)
          <textarea
            value={settings.topic}
            onChange={(event) => updateSettings({ topic: event.target.value })}
            placeholder="Describe your desired topic or enter a specific prompt here..."
            rows={2}
            style={{ width: "100%", resize: "vertical", marginTop: "0.25rem", padding: "0.5rem", borderRadius: "8px" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {topicSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="ghost-button"
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}
                onClick={() => updateSettings({ topic: suggestion })}
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </label>
        <label>
          Difficulty
          <select value={settings.difficulty} onChange={(event) => updateSettings({ difficulty: event.target.value })}>
            <option>Beginner</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
            <option>IELTS 7.0+</option>
          </select>
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Any specific focus or additional instructions?
          <textarea
            value={settings.additionalPrompt}
            onChange={(event) => updateSettings({ additionalPrompt: event.target.value })}
            placeholder="E.g., Focus on grammar, use only past tense, make it funny..."
            rows={2}
            style={{ width: "100%", resize: "vertical", marginTop: "0.25rem", padding: "0.5rem", borderRadius: "8px" }}
          />
        </label>
        <label>
          Questions
          <input 
             type="number" 
             value={settings.questions} 
             onChange={(event) => updateSettings({ questions: event.target.value })}
             min="1" max="50"
             style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)" }}
          />
        </label>
      </div>

      <fieldset className="quiz-type-group">
        <legend>Quiz Type</legend>
        <label>
          <input
            checked={settings.types.includes("mcq")}
            type="checkbox"
            onChange={(event) => updateQuizType("mcq", event.target.checked)}
          />
          Multiple Choice
        </label>
        <label>
          <input
            checked={settings.types.includes("unscramble")}
            type="checkbox"
            onChange={(event) => updateQuizType("unscramble", event.target.checked)}
          />
          Unscramble
        </label>
      </fieldset>

      {generatedQuiz ? (
        <div className="quiz-summary">
          <strong>{generatedQuiz.title}</strong>
          <span>{generatedQuiz.questions.length} questions generated & saved to DB!</span>
          <button className="primary-button" style={{ marginTop: '0.5rem' }} onClick={onGoToRooms}>
            Go to Rooms
          </button>
        </div>
      ) : null}

      <button className="primary-button" type="button" disabled={isGeneratingQuiz} onClick={onGenerateQuiz}>
        {isGeneratingQuiz ? "Generating..." : "Generate Quiz"}
      </button>
      <button className="ghost-button" type="button" onClick={onBack}>
        Back to Home
      </button>
    </div>
  );
}

function RoomsScreen({
  name,
  joinCode,
  savedQuizzes,
  isCreating,
  isJoining,
  onNameChange,
  onJoinCodeChange,
  onCreateRoomWithQuiz,
  onJoin,
  onBack
}: {
  name: string;
  joinCode: string;
  savedQuizzes: GeneratedQuiz[];
  isCreating: boolean;
  isJoining: boolean;
  onNameChange: (value: string) => void;
  onJoinCodeChange: (value: string) => void;
  onCreateRoomWithQuiz: (quiz: GeneratedQuiz | null) => void;
  onJoin: (event: FormEvent) => void;
  onBack: () => void;
}) {
  return (
    <div className="screen-stack">
      <label>
        Your Name
        <input value={name} onChange={(event) => onNameChange(event.target.value)} placeholder="John" />
      </label>

      <fieldset className="quiz-type-group" style={{ display: "flex", flexDirection: "column" }}>
        <legend>Create Room</legend>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "200px", overflowY: "auto", marginBottom: "1rem" }}>
          {savedQuizzes.length === 0 ? (
            <p className="muted" style={{ margin: "0.5rem 0" }}>No saved quizzes. Go generate some!</p>
          ) : (
            savedQuizzes.map((quiz) => (
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
          <button className="secondary-button" type="submit" disabled={isJoining}>
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

function LobbyScreen({
  roomCode,
  players,
  isHost,
  isStarting,
  copiedRoomCode,
  onCopyRoomCode,
  onStart
}: {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  isStarting: boolean;
  copiedRoomCode: boolean;
  onCopyRoomCode: () => void;
  onStart: () => void;
}) {
  return (
    <div className="screen-stack">
      <div className="room-code">
        <span>Room</span>
        <strong>{roomCode}</strong>
      </div>
      <button className="ghost-button" type="button" onClick={onCopyRoomCode}>
        {copiedRoomCode ? "Copied!" : "Copy Room Code"}
      </button>

      <PlayerList players={players} />

      {isHost ? (
        <button className="primary-button" disabled={isStarting} onClick={onStart}>
          {isStarting ? "Starting..." : "Start Game"}
        </button>
      ) : (
        <p className="muted">Waiting for host...</p>
      )}
    </div>
  );
}

function QuestionScreen({
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

function ResultScreen({ submission, correctAnswer, rank }: { submission?: AnswerResultPayload["submissions"][number]; correctAnswer: string; rank: number }) {
  const isCorrect = Boolean(submission?.correct);

  return (
    <div className="result-panel">
      <p className={isCorrect ? "result-correct" : "result-wrong"}>{isCorrect ? "Correct!" : "Wrong!"}</p>
      <h2>{isCorrect ? `+${submission?.points ?? 0} points` : `Correct Answer: ${correctAnswer}`}</h2>
      <p className="muted">Current Rank #{rank || "-"}</p>
    </div>
  );
}

function LeaderboardScreen({ players, nextQuestionInSeconds }: { players: Player[]; nextQuestionInSeconds: number }) {
  return (
    <div className="screen-stack">
      <h2>Leaderboard</h2>
      <PlayerList players={players} showScores />
      {nextQuestionInSeconds > 0 ? <p className="muted">Next question starts in {nextQuestionInSeconds}...</p> : null}
    </div>
  );
}

function FinalScreen({
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

function PlayerList({ players, showScores = false }: { players: Player[]; showScores?: boolean }) {
  if (players.length === 0) {
    return <p className="muted">No players yet.</p>;
  }

  return (
    <ol className="player-list">
      {players.map((player, index) => (
        <li key={player.id}>
          <span className="rank">{index + 1}</span>
          <span className={!player.connected ? "offline" : ""}>
            {player.name}
            {player.isHost ? " (Host)" : ""}
          </span>
          {showScores ? <strong>{player.score}</strong> : null}
        </li>
      ))}
    </ol>
  );
}

export default App;

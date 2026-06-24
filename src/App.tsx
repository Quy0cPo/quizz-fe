import { FormEvent, useEffect, useMemo, useState } from "react";
import { io, Socket } from "socket.io-client";
import { Screen, Player, QuestionPayload, AnswerResultPayload, QuizSettings, GeneratedQuiz } from "./types";
import { HomeScreen } from "./screens/HomeScreen";
import { GenerateScreen } from "./screens/GenerateScreen";
import { RoomsScreen } from "./screens/RoomsScreen";
import { LobbyScreen } from "./screens/LobbyScreen";
import { QuestionScreen } from "./screens/QuestionScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { LeaderboardScreen } from "./screens/LeaderboardScreen";
import { FinalScreen } from "./screens/FinalScreen";
import { CountdownScreen } from "./screens/CountdownScreen";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4001";

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const getInitialScreen = (): Screen => {
    const hash = window.location.hash.replace("#", "") as Screen;
    const validScreens: Screen[] = ["home", "generate", "rooms", "lobby", "countdown", "question", "result", "leaderboard", "final"];
    return validScreens.includes(hash) ? hash : "home";
  };
  const [screenState, setScreenState] = useState<Screen>(getInitialScreen);

  const screen = screenState;
  const setScreen = (newScreen: Screen) => {
    setScreenState(newScreen);
    window.location.hash = newScreen;
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "") as Screen;
      const validScreens: Screen[] = ["home", "generate", "rooms", "lobby", "countdown", "question", "result", "leaderboard", "final"];
      if (validScreens.includes(hash)) {
        setScreenState(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const [name, setName] = useState(() => localStorage.getItem("playerName") || "");
  const [icon, setIcon] = useState(() => localStorage.getItem("playerIcon") || "🐶");
  const [sessionId] = useState(() => {
    const stored = localStorage.getItem("playerSessionId");
    if (stored) return stored;
    const newSession = generateSessionId();
    localStorage.setItem("playerSessionId", newSession);
    return newSession;
  });

  useEffect(() => { localStorage.setItem("playerName", name); }, [name]);
  useEffect(() => { localStorage.setItem("playerIcon", icon); }, [icon]);

  const [countdownSeconds, setCountdownSeconds] = useState(0);

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

  useEffect(() => {
    const requiresRoom = ["lobby", "countdown", "question", "result", "leaderboard", "final"].includes(screenState);
    if (requiresRoom && !roomCode) {
      setScreen("home");
    }
  }, [screenState, roomCode]);

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

    nextSocket.on("countdown-start", ({ seconds }: { seconds: number }) => {
      setCountdownSeconds(seconds);
      setScreen("countdown");
    });

    nextSocket.on("answer-wrong", ({ message }: { message: string }) => {
      setError(message);
      setSubmitted(false);
    });

    nextSocket.on("kicked", () => {
      setRoomCode("");
      setPlayerId("");
      setIsHost(false);
      setPlayers([]);
      setLeaderboard([]);
      setQuestion(null);
      setLastResult(null);
      setError("You were kicked from the room by the host.");
      setScreen("home");
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
    socket.emit("create-room", { name, icon, sessionId, quiz: quizPayload });
  }

  function joinRoom(event: FormEvent) {
    event.preventDefault();
    if (!socket || !requireName()) return;

    if (!joinCode.trim()) {
      setError("Enter a room code.");
      return;
    }

    setPendingAction("joining");
    socket.emit("join-room", { name, icon, sessionId, roomCode: joinCode });
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
          {roomCode ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="room-pill">{roomCode}</span>
              <button 
                className="ghost-button" 
                style={{ padding: '4px 12px', height: 'auto', minHeight: '32px' }} 
                onClick={() => {
                  if (confirm("Are you sure you want to quit the game?")) {
                    leaveRoom();
                  }
                }}
              >
                Quit
              </button>
            </div>
          ) : null}
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
            icon={icon}
            joinCode={joinCode}
            savedQuizzes={savedQuizzes}
            isCreating={pendingAction === "creating"}
            isJoining={pendingAction === "joining"}
            onNameChange={setName}
            onIconChange={setIcon}
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
            onLeaveRoom={leaveRoom}
            socket={socket}
          />
        ) : null}

        {screen === "countdown" ? (
          <CountdownScreen initialSeconds={countdownSeconds} />
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
            lastResult={lastResult}
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

export default App;

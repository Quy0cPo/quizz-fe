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
import { GlobalLeaderboardScreen } from "./screens/GlobalLeaderboardScreen";
import { AdminLoginScreen } from "./screens/AdminLoginScreen";
import { AdminDashboardScreen } from "./screens/AdminDashboardScreen";
import { FinalScreen } from "./screens/FinalScreen";
import { CountdownScreen } from "./screens/CountdownScreen";
import { ChatPanel } from "./components/chat/ChatPanel";
import { EmoteOverlay } from "./components/EmoteOverlay";
import { AnimatePresence, motion } from "framer-motion";

const SERVER_URL = import.meta.env.VITE_SERVER_URL ?? "http://localhost:4001";

function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  
  const [adminToken, setAdminToken] = useState<string>(() => localStorage.getItem("adminToken") || "");

  const getInitialScreen = (): Screen => {
    const hash = window.location.hash.replace("#", "") as Screen;
    const validScreens: Screen[] = ["home", "generate", "rooms", "lobby", "countdown", "question", "result", "leaderboard", "global-leaderboard", "final", "admin-login", "admin-dashboard", "admin"];
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
      const validScreens: Screen[] = ["home", "generate", "rooms", "lobby", "countdown", "question", "result", "leaderboard", "global-leaderboard", "final", "admin-login", "admin-dashboard", "admin"];
      if (validScreens.includes(hash)) {
        setScreenState(hash);
      }
    };
    window.addEventListener("hashchange", handleHashChange);

    // Auto-fill room code from URL params
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setJoinCode(code.toUpperCase());
      if (getInitialScreen() === "home") {
        setScreen("rooms");
      }
    }

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
  const [quizTitle, setQuizTitle] = useState("");
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

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);
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
  const [nextImageUrl, setNextImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const requiresRoom = ["lobby", "countdown", "question", "result", "leaderboard", "final"].includes(screenState);
    if (requiresRoom && !roomCode) {
      const timeout = setTimeout(() => {
        setScreen("home");
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [screenState, roomCode]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (roomCode && screenState !== "final") {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [roomCode, screenState]);

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
      // Auto-rejoin if we already have a room code and sessionId
      if (roomCode && name && sessionId) {
        nextSocket.emit("join-room", { name, icon, roomCode, sessionId });
      }
    });

    nextSocket.on("connect_error", () => {
      setError("Unable to connect to the server. Please check your internet connection or try again later.");
    });

    nextSocket.on("app-error", ({ message }: { message: string }) => {
      setError(message);
      setPendingAction(null);
    });

    nextSocket.on("room-created", ({ roomCode: createdCode, playerId: id, quizTitle: title }: { roomCode: string; playerId: string; quizTitle?: string }) => {
      setRoomCode(createdCode);
      setPlayerId(id);
      if (title) setQuizTitle(title);
      setIsHost(true);
      setPendingAction(null);
      setScreen("lobby");
      setError("");
    });

    nextSocket.on("room-joined", ({ roomCode: joinedCode, playerId: id, isHost: host, quizTitle: title }: { roomCode: string; playerId: string; isHost: boolean; quizTitle?: string }) => {
      setRoomCode(joinedCode);
      setPlayerId(id);
      setIsHost(host);
      if (title) setQuizTitle(title);
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
      setError("");
      setScreen("question");
    });

    nextSocket.on("countdown-start", ({ seconds, nextImageUrl: url }: { seconds: number; nextImageUrl?: string }) => {
      setCountdownSeconds(seconds);
      setNextImageUrl(url || null);
      setError("");
      setScreen("countdown");
    });

    nextSocket.on("answer-wrong", ({ message }: { message: string }) => {
      setError(message);
      setSubmitted(false);
    });

    nextSocket.on("kicked", () => {
      setRoomCode("");
      setQuizTitle("");
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
      setError("");
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

    nextSocket.on("room-reset", ({ quizTitle }: { quizTitle?: string }) => {
      setQuestion(null);
      setAnswer("");
      setSubmitted(false);
      setLastResult(null);
      if (quizTitle) setQuizTitle(quizTitle);
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
    <main className="h-screen w-full bg-slate-950 text-slate-50 flex flex-col overflow-hidden">
      {/* Global Application Header */}
      <header className="px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950 z-40 shrink-0">
        <div className="min-w-0 pr-4">
          <p className="text-[10px] sm:text-xs font-bold text-emerald-500 uppercase tracking-wider mb-0.5">OPIC Practice</p>
          <h1 className="text-lg sm:text-xl md:text-2xl font-black text-slate-50 tracking-tight leading-tight truncate">OPIC Quiz Battle</h1>
        </div>
        {roomCode ? (
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {screen !== "lobby" && (
              <span className="hidden sm:inline-block bg-slate-900 text-slate-300 font-bold px-3 py-1.5 rounded-lg text-sm border border-slate-800">
                {roomCode}
              </span>
            )}
            {isHost && screen !== "lobby" && screen !== "final" && (
              <button 
                className="bg-rose-500/10 text-rose-500 px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-rose-500/20 transition-colors"
                onClick={() => {
                  if (confirm("Are you sure you want to end the game early?")) {
                    socket?.emit("end-game-early", { roomCode });
                  }
                }}
              >
                End Game
              </button>
            )}
            <button 
              className="text-slate-400 px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
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

      {/* Main App Container */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 w-full bg-slate-950 relative">
        
        {/* Dynamic Screen Content (Container for ScreenFrame) */}
        <div className="flex-1 flex flex-col overflow-hidden relative min-h-0 w-full">
          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="w-full px-4 py-2.5 bg-rose-500/10 border-b border-rose-500/20 text-rose-500 text-sm font-medium text-center shadow-sm shrink-0 z-10"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

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
              onNavigateGlobalLeaderboard={() => {
                setError("");
                setScreen("global-leaderboard");
              }}
            />
          ) : null}

          {screen === "global-leaderboard" ? (
            <GlobalLeaderboardScreen onBack={() => setScreen("home")} />
          ) : null}

          {screen === "admin-login" ? (
            <AdminLoginScreen
              onBack={() => setScreen("home")}
              onLoginSuccess={(token) => {
                localStorage.setItem("adminToken", token);
                setAdminToken(token);
                setScreen("admin-dashboard");
              }}
            />
          ) : null}

          {(screen === "admin-dashboard" || screen === "admin") ? (
            adminToken ? (
              <AdminDashboardScreen
                token={adminToken}
                onLogout={() => {
                  localStorage.removeItem("adminToken");
                  setAdminToken("");
                  setScreen("admin-login");
                }}
                onBack={() => setScreen("home")}
              />
            ) : (
              <AdminLoginScreen
                onBack={() => setScreen("home")}
                onLoginSuccess={(token) => {
                  localStorage.setItem("adminToken", token);
                  setAdminToken(token);
                  setScreen("admin-dashboard");
                }}
              />
            )
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

          {screen === "lobby" && (
            <LobbyScreen 
              roomCode={roomCode}
              quizTitle={quizTitle}
              players={players}
              isHost={isHost}
              isStarting={pendingAction === "starting"}
              copiedRoomCode={copiedRoomCode}
              onCopyRoomCode={copyRoomCode}
              onStart={startGame}
              onLeaveRoom={leaveRoom}
              socket={socket}
            />
          )}

          {screen === "countdown" ? (
            <CountdownScreen initialSeconds={countdownSeconds} nextImageUrl={nextImageUrl} />
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
              socket={socket}
              roomCode={roomCode}
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
        </div>
        
        {/* Chat Sidebar (Responsive: Drawer on mobile, Sidebar on desktop) */}
        {roomCode && (
          <div className="w-full lg:w-[340px] lg:max-w-[340px] flex shrink-0 lg:border-l border-slate-800 bg-slate-950/50">
            <ChatPanel socket={socket} roomCode={roomCode} playerId={playerId} />
          </div>
        )}

      </div>
      {roomCode && <EmoteOverlay socket={socket} />}
    </main>
  );
}

export default App;

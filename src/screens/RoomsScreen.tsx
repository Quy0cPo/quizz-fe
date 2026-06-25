import { useState, FormEvent } from "react";
import { GeneratedQuiz } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ArrowLeft, Play, Search, X } from "lucide-react";
import { ScreenFrame } from "../components/ui/ScreenFrame";
import { cn } from "../lib/utils";

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
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState<GeneratedQuiz | null>(null);
  const [activeTab, setActiveTab] = useState<"join" | "host">("join");

  const ICONS = ["🐶", "🐱", "🦊", "🐻", "🐼", "🐸", "🐰", "🐯", "🐍", "🐲", "🦁", "🐵", "🐧", "🦄", "🦉", "🐙"];

  const filteredQuizzes = savedQuizzes.filter((quiz) => {
    const query = searchTopic.toLowerCase();
    return quiz.title.toLowerCase().includes(query) || quiz.topic.toLowerCase().includes(query);
  });

  const handleHostClick = () => {
    onCreateRoomWithQuiz(selectedQuiz);
  };

  return (
    <ScreenFrame variant="form" maxWidth="6xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col w-full py-1 relative gap-4"
      >
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-400 hover:text-slate-100 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl sm:text-2xl font-black text-slate-50 tracking-tight">Multiplayer</h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 items-start w-full lg:justify-center">
          
          {/* Left Column: Profile Section */}
          <section className="w-full lg:w-[360px] shrink-0 bg-slate-900/90 border border-slate-800 backdrop-blur-xl p-4 rounded-2xl shadow-xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Profile</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nickname <span className="text-slate-500 font-normal">(Shown to others)</span></label>
                <Input 
                  value={name} 
                  onChange={(event) => onNameChange(event.target.value)} 
                  placeholder="Enter your name" 
                  className="w-full text-base sm:text-sm h-11 bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-2 focus:ring-slate-700 transition-all font-bold text-slate-50 placeholder:text-slate-600"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2.5">Avatar</label>
                <div className="grid grid-cols-8 gap-1.5 sm:gap-2 w-full">
                  {ICONS.map((i) => (
                    <button
                      key={i}
                      type="button"
                      className={cn(
                        "w-full aspect-square flex items-center justify-center rounded-lg sm:rounded-xl text-xl sm:text-2xl transition-all",
                        icon === i 
                          ? "bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-900" 
                          : "bg-slate-950 hover:bg-slate-800 active:scale-95 border border-slate-800/50"
                      )}
                      onClick={() => onIconChange(i)}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Right Column: Action Panels */}
          <div className="flex-1 w-full lg:max-w-[440px] flex flex-col gap-5">
            
            {/* Tabs */}
            <div className="flex bg-slate-900/80 p-1.5 rounded-2xl w-full border border-slate-800">
              <button
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
                  activeTab === "join" ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
                onClick={() => setActiveTab("join")}
              >
                Join Game
              </button>
              <button
                className={cn(
                  "flex-1 py-3 text-sm font-bold rounded-xl transition-all",
                  activeTab === "host" ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/20" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                )}
                onClick={() => setActiveTab("host")}
              >
                Host Game
              </button>
            </div>

            <div className="w-full relative">
              <AnimatePresence mode="wait">
                {activeTab === "join" && (
                  <motion.div
                    key="join"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <section className="w-full bg-slate-900/90 rounded-2xl p-5 border border-slate-800 shadow-xl flex flex-col gap-4">
                      <p className="text-slate-400 text-sm text-center font-medium">Enter a room code to jump right in.</p>
                      <form onSubmit={onJoin} className="flex flex-col gap-3">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="\d*"
                          value={joinCode}
                          onChange={(event) => onJoinCodeChange(event.target.value.replace(/\D/g, ''))}
                          maxLength={5}
                          placeholder="5-digit code"
                          className="w-full h-14 text-2xl font-black tracking-[0.2em] text-center bg-slate-950 border-2 border-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 transition-all uppercase placeholder:normal-case placeholder:tracking-normal placeholder:font-medium placeholder:text-lg text-slate-50 placeholder:text-slate-600"
                        />
                        <Button type="submit" size="md" disabled={isJoining || joinCode.length < 5 || !name.trim()} className="h-14 w-full text-lg font-bold bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-600/20">
                          {isJoining ? "Joining..." : "Join Game"}
                        </Button>
                      </form>
                    </section>
                  </motion.div>
                )}

                {activeTab === "host" && (
                  <motion.div
                    key="host"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                  >
                    <section className="w-full bg-indigo-950/20 rounded-2xl p-5 border border-indigo-900/40 shadow-xl flex flex-col gap-4">
                      <p className="text-indigo-400/80 text-sm text-center font-medium">Create a room and invite others to play.</p>
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col p-3 rounded-xl bg-slate-900/60 border border-indigo-900/30 gap-2 shadow-sm">
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider mb-0.5">Selected Quiz</span>
                            <span className="font-bold text-slate-50 text-sm truncate">
                              {selectedQuiz ? selectedQuiz.title : "Sample Quiz (Default)"}
                            </span>
                          </div>
                          <Button variant="secondary" size="sm" onClick={() => setIsQuizModalOpen(true)} className="w-full bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 h-9 text-xs font-bold border-0 shadow-none">
                            Change Quiz
                          </Button>
                        </div>

                        <Button 
                          size="md" 
                          disabled={isCreating || !name.trim()} 
                          onClick={handleHostClick}
                          className="w-full h-14 text-lg font-bold bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20"
                        >
                          {isCreating ? "Creating..." : "Host Game"}
                        </Button>
                      </div>
                    </section>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Quiz Picker Modal (Bottom Sheet on Mobile, Centered on Desktop) */}
        <AnimatePresence>
          {isQuizModalOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                onClick={() => setIsQuizModalOpen(false)}
              />
              <motion.div 
                initial={{ opacity: 0, y: "100%" }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="relative w-full sm:max-w-lg bg-slate-900 border border-slate-800 sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[85vh] z-10"
              >
                {/* Mobile drag handle */}
                <div className="w-full flex justify-center pt-3 pb-1 sm:hidden">
                  <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
                </div>
                
                <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800">
                  <h3 className="text-xl font-black text-slate-50">Select a Quiz</h3>
                  <button 
                    onClick={() => setIsQuizModalOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="p-4 border-b border-slate-800">
                  <div className="relative">
                    <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <Input 
                      type="text" 
                      value={searchTopic} 
                      onChange={(e) => setSearchTopic(e.target.value)} 
                      placeholder="Search your quizzes..." 
                      className="pl-12 bg-slate-950 border-slate-800 focus:bg-slate-900 focus:ring-slate-700 h-12 text-base text-slate-50 placeholder:text-slate-600"
                    />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar pb-safe">
                  {filteredQuizzes.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                      <p className="font-medium text-base">No matching quizzes found.</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {filteredQuizzes.map((quiz) => (
                        <button 
                          key={quiz._id || quiz.title} 
                          className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-800 active:bg-slate-800/80 border border-transparent hover:border-slate-700 transition-all text-left group"
                          onClick={() => {
                            setSelectedQuiz(quiz);
                            setIsQuizModalOpen(false);
                          }}
                        >
                          <div className="flex flex-col min-w-0 pr-4">
                            <strong className="text-slate-50 font-bold text-base md:text-lg truncate mb-1">{quiz.title}</strong>
                            <span className="text-slate-400 text-sm font-medium truncate">
                              {quiz.topic} • {quiz.difficulty} • {quiz.questions?.length ?? 0} Qs
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:border-indigo-400 group-hover:text-white transition-colors shrink-0 shadow-sm">
                            <Play className="w-4 h-4 ml-1" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </motion.div>
    </ScreenFrame>
  );
}

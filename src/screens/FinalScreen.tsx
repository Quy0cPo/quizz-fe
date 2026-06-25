import { useState } from "react";
import Confetti from "react-confetti";
import { Player, GeneratedQuiz } from "../types";
import { PlayerList } from "../components/PlayerList";
import { motion } from "framer-motion";
import { Trophy, RotateCcw, PlusCircle, Home, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Card, CardContent } from "../components/ui/Card";
import { ScreenFrame } from "../components/ui/ScreenFrame";

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
    <ScreenFrame variant="results">
      <div className="flex flex-col h-full gap-6 pb-safe relative">
        <div className="absolute inset-0 pointer-events-none z-50">
          <Confetti recycle={false} numberOfPieces={500} gravity={0.15} colors={['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']} width={window.innerWidth} height={window.innerHeight} />
        </div>
        
        {/* Podium Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="flex flex-col items-center justify-center pt-2 pb-1 text-center shrink-0"
        >
          <span className="bg-amber-100 text-amber-700 font-black uppercase tracking-widest text-[10px] px-3 py-1 rounded-full mb-2 border border-amber-200">Game Over</span>
          
          <div className="relative mb-2">
            <div className="absolute -inset-4 bg-amber-200/50 rounded-full blur-xl animate-pulse"></div>
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-tr from-amber-400 to-amber-200 rounded-full flex items-center justify-center relative z-10 shadow-2xl border-[3px] border-white">
              <Trophy className="w-8 h-8 sm:w-10 sm:h-10 text-amber-600 drop-shadow-md" />
            </div>
            
            {/* Winner Icon Badge */}
            <div className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center text-lg sm:text-xl shadow-lg border-2 border-slate-100 z-20">
              {winner?.icon ?? "👑"}
            </div>
          </div>
          
          <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-800 tracking-tight px-4">
            {winner?.name ?? "No winner"}
          </h2>
          <p className="text-base md:text-lg font-bold text-slate-500">
            <span className="text-emerald-500 font-black">{winner?.score ?? 0}</span> points
          </p>
        </motion.div>

        {/* Players List */}
        <div className="px-2">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Final Standings</h3>
            <PlayerList players={players} showScores />
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex flex-col gap-2 pt-2 shrink-0 px-1">
          {isHost ? (
            <div className="bg-white border border-slate-100 p-3 sm:p-4 rounded-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button size="lg" className="flex-1 h-12 text-base bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20" onClick={onPlayAgain}>
                  <RotateCcw className="w-5 h-5 mr-2" /> Play Again
                </Button>
                <Button size="lg" variant="outline" className="flex-1 h-12 text-sm border-2 border-slate-200" onClick={() => setShowQuizSelector(!showQuizSelector)}>
                  <PlusCircle className="w-5 h-5 mr-2" /> New Quiz
                </Button>
              </div>
              
              {showQuizSelector && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-4"
                >
                  <Card className="border-indigo-100 shadow-sm overflow-hidden bg-indigo-50/50">
                    <div className="bg-white border-b border-indigo-100 px-4 py-3">
                      <h3 className="font-bold text-indigo-900 text-sm uppercase tracking-wider">Select a Quiz to Play Next</h3>
                    </div>
                    <CardContent className="p-0 max-h-[250px] overflow-y-auto custom-scrollbar bg-white">
                      {savedQuizzes.length === 0 ? (
                        <p className="text-slate-400 font-medium p-6 text-center">No saved quizzes available.</p>
                      ) : (
                        <div className="flex flex-col divide-y divide-slate-100">
                          {savedQuizzes.map((quiz) => (
                            <div key={quiz._id || quiz.title} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                              <div className="flex flex-col pr-4">
                                <strong className="text-slate-800 font-bold truncate">{quiz.title}</strong>
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-1">
                                  <span className="bg-slate-100 px-2 py-0.5 rounded-md">{quiz.difficulty}</span>
                                  <span>•</span>
                                  <span>{quiz.questions?.length ?? 0} Qs</span>
                                </div>
                              </div>
                              <Button size="sm" onClick={() => onChangeQuiz(quiz)} className="shrink-0 bg-indigo-100 text-indigo-700 hover:bg-indigo-200">
                                Select <CheckCircle2 className="w-4 h-4 ml-1" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 rounded-3xl p-6 text-center border border-slate-100 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
              <p className="text-slate-600 font-bold text-lg">Waiting for host to start a new game...</p>
            </div>
          )}
          
          <Button variant="ghost" className="text-slate-500 hover:text-slate-700 w-full h-10 text-sm" onClick={onLeaveRoom}>
            <Home className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </div>
      </div>
    </ScreenFrame>
  );
}

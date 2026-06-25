import { AnswerResultPayload } from "../types";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "../lib/utils";

export function ResultScreen({ submission, correctAnswer, rank }: { submission?: AnswerResultPayload["submissions"][number]; correctAnswer: string; rank: number }) {
  const isCorrect = Boolean(submission?.correct);

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto text-center gap-6 p-4 md:p-6"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: isCorrect ? [0, 15, -10, 0] : [0, -10, 10, 0] }}
          transition={{ type: "spring", stiffness: 300, damping: 15 }}
          className={cn(
            "w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-2xl",
            isCorrect ? "bg-emerald-500 shadow-emerald-500/40" : "bg-rose-500 shadow-rose-500/40"
          )}
        >
          {isCorrect ? (
            <CheckCircle2 className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 text-white" />
          ) : (
            <XCircle className="w-14 h-14 sm:w-18 sm:h-18 md:w-20 md:h-20 text-white" />
          )}
        </motion.div>
        
        <div className="space-y-2">
          <h2 className={cn(
            "text-3xl sm:text-4xl md:text-5xl font-black tracking-tight",
            isCorrect ? "text-emerald-500" : "text-rose-500"
          )}>
            {isCorrect ? "Correct!" : "Wrong!"}
          </h2>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-300 mt-2">
            {isCorrect ? `+${submission?.points ?? 0} points` : `Answer: ${correctAnswer}`}
          </p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-4 bg-slate-900 border border-slate-800 shadow-sm rounded-2xl px-6 py-3 flex flex-col items-center gap-1"
      >
        <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Current Rank</span>
        <span className="text-2xl font-black text-indigo-400">#{rank || "-"}</span>
      </motion.div>
    </motion.div>
  );
}

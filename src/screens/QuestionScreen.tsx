import { useState, useEffect, useRef } from "react";
import { QuestionPayload } from "../types";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { ScreenFrame } from "../components/ui/ScreenFrame";
import { cn } from "../lib/utils";

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
  const [timeLeft, setTimeLeft] = useState(payload.durationSeconds);

  useEffect(() => {
    let animationFrameId: number;

    const updateTimer = () => {
      const elapsed = (Date.now() - payload.startedAt) / 1000;
      const newTimeLeft = Math.max(payload.durationSeconds - elapsed, 0);
      const progress = (newTimeLeft / payload.durationSeconds) * 100;
      
      setTimeLeft(newTimeLeft);

      if (barRef.current) {
        barRef.current.style.transform = `scaleX(${progress / 100})`;
        
        if (newTimeLeft <= 5 && newTimeLeft > 0) {
          barRef.current.classList.add("bg-rose-500", "shadow-[0_0_15px_rgba(244,63,94,0.6)]");
          barRef.current.classList.remove("bg-emerald-500");
        } else {
          barRef.current.classList.add("bg-emerald-500");
          barRef.current.classList.remove("bg-rose-500", "shadow-[0_0_15px_rgba(244,63,94,0.6)]");
        }
      }

      if (textRef.current) {
        textRef.current.innerText = `${Math.ceil(newTimeLeft)}s`;
      }

      if (newTimeLeft > 0) {
        animationFrameId = requestAnimationFrame(updateTimer);
      }
    };

    animationFrameId = requestAnimationFrame(updateTimer);

    return () => cancelAnimationFrame(animationFrameId);
  }, [payload.durationSeconds, payload.startedAt]);

  const isUrgent = timeLeft <= 5 && timeLeft > 0;
  const isLongQuestion = payload.question.question.length > 80;

  return (
    <ScreenFrame variant="game" className="px-3 py-3 sm:px-6 sm:py-4 relative z-10 flex flex-col">
      
      {/* Top Section (Timer & Info) */}
      <div className="flex flex-col gap-3 shrink-0">
        <div className="flex justify-between items-start">
          {payload.quizTitle ? (
            <div className="bg-emerald-500/10 text-emerald-400 font-bold px-3 py-1 text-[10px] md:text-xs uppercase tracking-wider border border-emerald-500/20 rounded-lg line-clamp-1 max-w-[60%] sm:max-w-full">
              {payload.quizTitle}
            </div>
          ) : <div />}
          <div className="sm:hidden bg-indigo-500/10 text-indigo-400 font-bold px-3 py-1 text-[10px] uppercase tracking-wider border border-indigo-500/20 rounded-lg shrink-0">
            Room: {payload.roomCode}
          </div>
        </div>

        <div className="flex items-center justify-between font-bold text-slate-300">
          <span className="text-sm md:text-base">
            Question {payload.questionNumber} of {payload.totalQuestions}
          </span>
          <div className={cn(
            "flex items-center",
            isUrgent ? "text-rose-500 animate-pulse font-black" : ""
          )}>
            <strong ref={textRef} className="text-xl md:text-2xl">{payload.durationSeconds}s</strong>
          </div>
        </div>

        {/* Smooth Progress Bar via CSS Transform */}
        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shrink-0">
          <div 
            ref={barRef} 
            className="h-full bg-amber-500 origin-left" 
            style={{ transform: 'scaleX(1)' }}
          />
        </div>
      </div>

      {/* Question and Answers Container */}
      <div className="flex-1 flex flex-col py-2 min-h-0 overflow-y-auto custom-scrollbar">
        
        <div className="flex flex-col gap-4 md:gap-6 w-full my-auto pb-4">
          {/* Middle Section (Question) */}
          <div className="flex flex-col items-center justify-center w-full">
            {payload.question.imageUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="w-full max-w-md mb-3 sm:mb-4 rounded-2xl overflow-hidden shadow-lg border-2 border-slate-800 bg-slate-900 shrink-0"
              >
                <img 
                  src={payload.question.imageUrl} 
                  alt="AI Generated Visual" 
                  className="w-full h-28 sm:h-32 md:h-40 object-cover"
                  loading="eager"
                />
              </motion.div>
            )}

        {payload.question.type === "mcq" ? (
          <h2 className={cn(
            "font-black text-slate-50 text-center leading-tight transition-all px-2",
            isLongQuestion ? "text-lg md:text-2xl lg:text-3xl" : "text-xl md:text-3xl lg:text-4xl"
          )}>
            {payload.question.question}
          </h2>
        ) : (
          <div className="flex flex-col items-center text-center space-y-2 md:space-y-3">
            <span className="inline-block uppercase tracking-widest text-[10px] md:text-xs font-bold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg">
              Unscramble the letters
            </span>
            <h2 className={cn(
              "font-black text-indigo-400 tracking-[0.1em] uppercase break-all transition-all",
              isLongQuestion ? "text-xl md:text-3xl" : "text-2xl md:text-4xl"
            )}>
              {payload.question.question}
            </h2>
          </div>
        )}
      </div>

        {/* Bottom Section (Answers) */}
        <div className="w-full max-w-4xl mx-auto flex flex-col">
        {payload.question.type === "mcq" ? (
          <div className="flex flex-col md:grid md:grid-cols-2 gap-2 md:gap-3 w-full pb-safe">
            {payload.question.options.map((option, index) => {
              const letters = ["A", "B", "C", "D"];
              return (
                <button
                  key={option}
                  disabled={submitted}
                  onClick={() => onSubmit(option)}
                  className={cn(
                    "group flex items-center p-2.5 sm:p-3 rounded-xl border-2 text-left transition-all min-h-[52px]",
                    submitted 
                      ? "opacity-50 border-slate-800 bg-slate-900 cursor-not-allowed" 
                      : "border-slate-800 bg-slate-950 hover:border-emerald-500/50 hover:bg-emerald-500/10 active:scale-[0.98] cursor-pointer shadow-sm"
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-slate-400 font-bold text-sm mr-3 shrink-0 transition-colors",
                    !submitted && "group-hover:bg-emerald-500 group-hover:text-white"
                  )}>
                    {letters[index]}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-slate-50 leading-snug line-clamp-3">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <form
            className="flex flex-col gap-3 w-full pb-safe"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit(answer);
            }}
          >
            <Input 
              value={answer} 
              disabled={submitted} 
              onChange={(event) => onAnswerChange(event.target.value)} 
              placeholder="Type your answer..." 
              className="text-lg md:text-xl font-bold h-14 uppercase tracking-wider text-center border-2 border-slate-800 bg-slate-950 text-slate-50 shadow-sm rounded-2xl"
              autoFocus
            />
            <Button 
              type="submit" 
              disabled={submitted} 
              size="lg" 
              className="h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-900/20"
            >
              {submitted ? "Sent" : "Submit"}
            </Button>
          </form>
        )}

          {/* Status Indicator */}
          <div className="h-8 mt-2 flex items-center justify-center shrink-0">
            <AnimatePresence>
              {submitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-slate-900 border border-slate-800 text-slate-400 font-bold px-4 py-2 rounded-xl text-center flex items-center justify-center gap-3 text-xs md:text-sm shadow-sm"
                >
                  <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
                  Waiting for other players...
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        </div>

      </div>
    </ScreenFrame>
  );
}

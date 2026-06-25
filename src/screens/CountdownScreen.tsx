import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function CountdownScreen({ initialSeconds }: { initialSeconds: number }) {
  const [seconds, setSeconds] = useState(initialSeconds);

  useEffect(() => {
    if (seconds <= 0) return;

    const timer = setTimeout(() => {
      setSeconds((s) => s - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [seconds]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={seconds}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="flex flex-col items-center"
        >
          <h2 className={`text-8xl md:text-[150px] font-black tracking-tighter ${seconds > 0 ? "text-emerald-500" : "text-indigo-600"} drop-shadow-xl`}>
            {seconds > 0 ? seconds : "GO!"}
          </h2>
        </motion.div>
      </AnimatePresence>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl font-bold text-slate-400 mt-8"
      >
        Get ready!
      </motion.p>
    </div>
  );
}

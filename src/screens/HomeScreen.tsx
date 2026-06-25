import { motion } from "framer-motion";
import { Wand2, Gamepad2, Sparkles } from "lucide-react";
import { Button } from "../components/ui/Button";
import { ScreenFrame } from "../components/ui/ScreenFrame";

export function HomeScreen({ onNavigateGenerate, onNavigateRooms }: { onNavigateGenerate: () => void; onNavigateRooms: () => void }) {
  return (
    <ScreenFrame variant="centered" maxWidth="lg">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="flex flex-col items-center w-full text-center space-y-6"
      >
        <div className="space-y-4">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl mx-auto flex items-center justify-center border border-emerald-500/20 shadow-sm">
            <Sparkles className="w-7 h-7 text-emerald-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-50 tracking-tight">OPIC Practice</h2>
          <p className="text-slate-400 font-medium text-base max-w-sm mx-auto">
            Master your English speaking with AI-generated quizzes and multiplayer battles.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          {/* Primary Action */}
          <Button size="lg" onClick={onNavigateRooms} className="w-full text-lg h-14 shadow-lg shadow-emerald-900/20 group">
            <Gamepad2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Play Multiplayer
          </Button>
          
          {/* Secondary Action */}
          <Button variant="outline" size="lg" onClick={onNavigateGenerate} className="w-full text-base h-12 bg-slate-900 hover:bg-slate-800 text-slate-300 border-2 border-slate-800 group">
            <Wand2 className="w-5 h-5 mr-2 text-cyan-500 group-hover:rotate-12 transition-transform" />
            Generate Quiz with AI
          </Button>
        </div>
      </motion.div>
    </ScreenFrame>
  );
}

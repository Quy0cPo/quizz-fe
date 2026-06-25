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
          <div className="w-14 h-14 bg-emerald-100 rounded-2xl mx-auto flex items-center justify-center shadow-sm">
            <Sparkles className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight">OPIC Practice</h2>
          <p className="text-slate-500 font-medium text-base max-w-sm mx-auto">
            Master your English speaking with AI-generated quizzes and multiplayer battles.
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
          {/* Primary Action */}
          <Button size="lg" onClick={onNavigateRooms} className="w-full text-lg h-14 shadow-lg shadow-slate-900/10 group">
            <Gamepad2 className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
            Play Multiplayer
          </Button>
          
          {/* Secondary Action */}
          <Button variant="outline" size="lg" onClick={onNavigateGenerate} className="w-full text-base h-12 bg-white hover:bg-slate-50 text-slate-600 border-2 border-slate-200 group">
            <Wand2 className="w-5 h-5 mr-2 text-emerald-600 group-hover:rotate-12 transition-transform" />
            Generate Quiz with AI
          </Button>
        </div>
      </motion.div>
    </ScreenFrame>
  );
}

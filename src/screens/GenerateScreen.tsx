import { QuizSettings, GeneratedQuiz } from "../types";
import { motion } from "framer-motion";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { ScreenFrame } from "../components/ui/ScreenFrame";

export function GenerateScreen({
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
    const nextTypes = checked ? Array.from(new Set([...settings.types, type])) : settings.types.filter((nextType) => nextType !== type);
    updateSettings({ types: nextTypes });
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
    <ScreenFrame variant="form" maxWidth="3xl">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 h-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <Sparkles className="text-emerald-500 w-6 h-6 sm:w-8 sm:h-8" /> 
              Generate with AI
            </h2>
            <p className="text-slate-500 font-medium mt-1 text-sm sm:text-base">Create custom English quizzes instantly.</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack} className="text-slate-500 hover:text-slate-800 hidden sm:flex">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        <div className="flex flex-col gap-4 flex-1 min-h-0">
          
          {/* Topic Section */}
          <section className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Topic</label>
            <textarea
              value={settings.topic}
              onChange={(event) => updateSettings({ topic: event.target.value })}
              placeholder="E.g., Business Email Vocabulary, IELTS Speaking Part 1..."
              rows={2}
              className="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-800 text-base focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none shadow-sm font-bold"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {topicSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  className="px-3 py-1.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-500 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                  onClick={() => updateSettings({ topic: suggestion })}
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </section>

          {/* Settings Grid - Wrap nicely on mobile */}
          <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Difficulty</label>
              <select 
                value={settings.difficulty} 
                onChange={(event) => updateSettings({ difficulty: event.target.value })}
                className="w-full rounded-xl border-2 border-slate-100 bg-white px-3 h-12 text-slate-800 focus:outline-none focus:border-emerald-500 appearance-none font-bold text-sm shadow-sm cursor-pointer"
              >
                <option>Beginner</option>
                <option>Easy</option>
                <option>Medium</option>
                <option>Hard</option>
                <option>IELTS 7.0+</option>
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Questions</label>
              <Input 
                type="number" 
                value={settings.questions} 
                onChange={(event) => updateSettings({ questions: parseInt(event.target.value) || 1 })}
                min="1" max="50"
                className="w-full h-12 text-sm font-bold bg-white border-2 border-slate-100 shadow-sm rounded-xl"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2 md:col-span-1">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Quiz Types</label>
              <div className="flex gap-3 h-12 w-full">
                <button 
                  type="button"
                  onClick={() => updateQuizType("mcq", !settings.types.includes("mcq"))}
                  className={`flex-1 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${settings.types.includes("mcq") ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  MCQ
                </button>
                <button 
                  type="button"
                  onClick={() => updateQuizType("unscramble", !settings.types.includes("unscramble"))}
                  className={`flex-1 rounded-xl border-2 flex items-center justify-center font-bold text-sm transition-all ${settings.types.includes("unscramble") ? 'bg-emerald-500 border-emerald-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}
                >
                  Unscramble
                </button>
              </div>
            </div>
          </section>

          {/* Additional Prompt */}
          <section className="space-y-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Additional Instructions</label>
            <textarea
              value={settings.additionalPrompt}
              onChange={(event) => updateSettings({ additionalPrompt: event.target.value })}
              placeholder="Focus on grammar, use only past tense, make it tricky but fair..."
              rows={2}
              className="w-full rounded-2xl border-2 border-slate-100 bg-white px-4 py-3 text-slate-800 text-sm focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 transition-all resize-none shadow-sm font-medium"
            />
          </section>

        {generatedQuiz && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0"
          >
            <div>
              <p className="font-bold text-emerald-800">{generatedQuiz.title}</p>
              <p className="text-sm text-emerald-600 font-medium">{generatedQuiz.questions.length} questions generated successfully!</p>
            </div>
            <Button onClick={onGoToRooms} size="sm" className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700">Play Now</Button>
          </motion.div>
        )}

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-3 shrink-0">
          <Button 
            className="w-full h-12 text-base bg-slate-900 hover:bg-black shadow-xl shadow-slate-900/10 disabled:opacity-50" 
            disabled={isGeneratingQuiz || settings.types.length === 0} 
            onClick={onGenerateQuiz}
          >
            {isGeneratingQuiz ? (
              <span className="flex items-center gap-2">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, ease: "linear", duration: 1 }}>
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </motion.div>
                Generating Magic...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" /> Generate Quiz
              </span>
            )}
          </Button>
          <Button variant="ghost" onClick={onBack} className="sm:hidden text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>

        </div>

      </motion.div>
    </ScreenFrame>
  );
}

import { QuizSettings, GeneratedQuiz } from "../types";

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
    const nextTypes = checked ? [...settings.types, type] : settings.types.filter((nextType) => nextType !== type);
    updateSettings({ types: nextTypes.length ? nextTypes : [type] });
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
    <div className="screen-stack">
      <div className="settings-grid">
        <label style={{ gridColumn: "1 / -1" }}>
          What should the quiz be about? (Topic or Prompt)
          <textarea
            value={settings.topic}
            onChange={(event) => updateSettings({ topic: event.target.value })}
            placeholder="Describe your desired topic or enter a specific prompt here..."
            rows={2}
            style={{ width: "100%", resize: "vertical", marginTop: "0.25rem", padding: "0.5rem", borderRadius: "8px" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
            {topicSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="ghost-button"
                style={{ padding: "0.3rem 0.6rem", fontSize: "0.8rem", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)" }}
                onClick={() => updateSettings({ topic: suggestion })}
              >
                + {suggestion}
              </button>
            ))}
          </div>
        </label>
        <label>
          Difficulty
          <select value={settings.difficulty} onChange={(event) => updateSettings({ difficulty: event.target.value })}>
            <option>Beginner</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
            <option>IELTS 7.0+</option>
          </select>
        </label>
        <label style={{ gridColumn: "1 / -1" }}>
          Any specific focus or additional instructions?
          <textarea
            value={settings.additionalPrompt}
            onChange={(event) => updateSettings({ additionalPrompt: event.target.value })}
            placeholder="E.g., Focus on grammar, use only past tense, make it funny..."
            rows={2}
            style={{ width: "100%", resize: "vertical", marginTop: "0.25rem", padding: "0.5rem", borderRadius: "8px" }}
          />
        </label>
        <label>
          Questions
          <input 
             type="number" 
             value={settings.questions} 
             onChange={(event) => updateSettings({ questions: event.target.value })}
             min="1" max="50"
             style={{ width: "100%", padding: "0.5rem", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.2)" }}
          />
        </label>
      </div>

      <fieldset className="quiz-type-group">
        <legend>Quiz Type</legend>
        <label>
          <input
            checked={settings.types.includes("mcq")}
            type="checkbox"
            onChange={(event) => updateQuizType("mcq", event.target.checked)}
          />
          Multiple Choice
        </label>
        <label>
          <input
            checked={settings.types.includes("unscramble")}
            type="checkbox"
            onChange={(event) => updateQuizType("unscramble", event.target.checked)}
          />
          Unscramble
        </label>
      </fieldset>

      {generatedQuiz ? (
        <div className="quiz-summary">
          <strong>{generatedQuiz.title}</strong>
          <span>{generatedQuiz.questions.length} questions generated & saved to DB!</span>
          <button className="primary-button" style={{ marginTop: '0.5rem' }} onClick={onGoToRooms}>
            Go to Rooms
          </button>
        </div>
      ) : null}

      <button className="primary-button" type="button" disabled={isGeneratingQuiz} onClick={onGenerateQuiz}>
        {isGeneratingQuiz ? "Generating..." : "Generate Quiz"}
      </button>
      <button className="ghost-button" type="button" onClick={onBack}>
        Back to Home
      </button>
    </div>
  );
}

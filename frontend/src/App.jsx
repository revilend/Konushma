import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import QuestionCard from "./components/QuestionCard";
import RecorderBar from "./components/RecorderBar";
import ResultPanel from "./components/ResultPanel";
import CallScreen from "./components/CallScreen";
import VocabularyPage from "./components/VocabularyPage";
import { useRecorder } from "./lib/useRecorder";
import { useVocabulary } from "./lib/useVocabulary";
import { api } from "./lib/api";

export default function App() {
  const [view, setView] = useState("sim"); // sim | call | vocab
  const [mode, setMode] = useState("practice");
  const [dark, setDark] = useState(() => localStorage.getItem("tp-theme") !== "light");
  const [cfg, setCfg] = useState(null);
  const [question, setQuestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [phase, setPhase] = useState("ready"); // ready | analyzing | result
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);

  const rec = useRecorder("tr-TR");
  const audioRef = useRef(null);
  const vocab = useVocabulary();

  useEffect(() => {
    const root = document.documentElement;
    dark ? root.classList.add("dark") : root.classList.remove("dark");
    localStorage.setItem("tp-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    api.config().then(setCfg).catch(() => setCfg({ ai_provider: "unknown", setup_needed: true }));
  }, []);

  const loadQuestion = useCallback(async (excludeId) => {
    try {
      const q = await api.question(excludeId);
      setQuestion(q);
    } catch (e) {
      setError(`Savol yuklanmadi: ${e.message}`);
    }
  }, []);

  useEffect(() => {
    if (!cfg) return;
    loadQuestion(null);
  }, [cfg, loadQuestion]);

  // edge-tts (tr-TR-EmelNeural) — brauzer SpeechSynthesis ISHLATILMAYDI.
  const playTTS = useCallback((text) => {
    if (!text) return Promise.resolve();
    audioRef.current?.pause();
    const a = new Audio(api.ttsUrl(text));
    audioRef.current = a;
    setSpeaking(true);
    const finish = () => setSpeaking(false);
    return new Promise((resolve) => {
      a.onended = () => {
        finish();
        resolve();
      };
      a.onerror = () => {
        finish();
        setError("Ovoz yuklanmadi — TTS xizmati band yoki tarmoq cheklovi.");
        resolve();
      };
      a.play().catch(() => {
        finish();
        resolve();
      });
    });
  }, []);

  const stopTTS = useCallback(() => {
    audioRef.current?.pause();
    setSpeaking(false);
  }, []);

  const submit = useCallback(
    async (manualOverride) => {
      setError("");
      let text = manualOverride !== undefined ? manualOverride : await rec.stop();
      if (!text) text = manualText.trim();
      if (!text) {
        setError("Javob topilmadi — mikrofon bilan gapir yoki matn yozib yubor.");
        return;
      }
      setManualText("");
      setShowManual(false);
      setPhase("analyzing");
      try {
        const result = await api.analyze(text, question, mode);
        setAnalysis(result);
        setPhase("result");
        if (result.model_answer_tr) playTTS(result.model_answer_tr);
      } catch (e) {
        setPhase("ready");
        setError(`Tahlil qilinmadi: ${e.message}`);
      }
    },
    [rec, manualText, question, mode, playTTS]
  );

  const next = useCallback(async () => {
    setPhase("ready");
    setAnalysis(null);
    await loadQuestion(question?.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [loadQuestion, question]);

  const toggleRecord = useCallback(async () => {
    if (rec.recording) {
      await submit();
    } else {
      setError("");
      setAnalysis(null);
      await rec.start();
      if (!rec.supported) setShowManual(true);
    }
  }, [rec, submit]);

  const busy = phase === "analyzing";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-24 -left-16 h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-fuchsia-500/15 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <Header
        view={view}
        onView={setView}
        mode={mode}
        setMode={setMode}
        dark={dark}
        toggleDark={() => setDark(!dark)}
        vocabCount={vocab.count}
      />

      <main className="relative mx-auto max-w-3xl space-y-5 px-3 py-5 pb-24 sm:px-4">
        {cfg?.setup_needed && view === "sim" && (
          <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            ⚙️ <b>AI kalit sozlanmagan.</b> Backend fayli{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">backend/.env</code> ichida{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">GEMINI_API_KEY</code> yoki{" "}
            <code className="rounded bg-amber-100 px-1 dark:bg-amber-900/60">OPENAI_API_KEY</code> kiriting, keyin
            backendni qaytadan ishga tushiring.
          </div>
        )}

        {view === "vocab" && (
          <VocabularyPage vocab={vocab} playTTS={playTTS} onBack={() => setView("sim")} />
        )}

        {view === "call" && (
          <CallScreen
            onExit={() => setView("sim")}
            onVocab={() => setView("vocab")}
            playTTS={playTTS}
            stopTTS={stopTTS}
            vocab={vocab}
          />
        )}

        {view === "sim" && (
          <>
            {error && (
              <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
                ⚠️ {error}
              </div>
            )}

            {busy && (
              <div className="flex items-center gap-3 rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-900 dark:border-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-200">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                Aylin Hoca javobingni tahlil qilyapti…
              </div>
            )}

            {phase !== "result" && (
              <>
                <QuestionCard question={question} speaking={speaking} onPlay={() => playTTS(question?.tr)} />
                <RecorderBar
                  supported={rec.supported}
                  recording={rec.recording}
                  interim={rec.interim}
                  seconds={rec.seconds}
                  disabled={busy}
                  getAnalyser={rec.getAnalyser}
                  onToggle={toggleRecord}
                  onSubmit={() => submit()}
                  manualText={manualText}
                  setManualText={setManualText}
                  showManual={showManual}
                  setShowManual={setShowManual}
                />
              </>
            )}

            {phase === "result" && (
              <ResultPanel
                analysis={analysis}
                speaking={speaking}
                onPlayAnswer={() => playTTS(analysis?.model_answer_tr)}
                onNext={next}
                busy={busy}
                vocab={vocab}
                playTTS={playTTS}
              />
            )}
          </>
        )}

        <p className="pt-2 text-center text-xs text-slate-400 dark:text-slate-600">
          TürkçePrep AI · STT: Web Speech API (tr-TR) · TTS: edge-tts <code>tr-TR-EmelNeural</code> · AI: Gemini
        </p>
      </main>
    </div>
  );
}

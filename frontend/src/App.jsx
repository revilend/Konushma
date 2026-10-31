import { useCallback, useEffect, useRef, useState } from "react";
import Header from "./components/Header";
import QuestionCard from "./components/QuestionCard";
import RecorderBar from "./components/RecorderBar";
import ResultPanel from "./components/ResultPanel";
import CallScreen from "./components/CallScreen";
import VocabularyPage from "./components/VocabularyPage";
import StreakCard from "./components/StreakCard";
import SpeedControl from "./components/SpeedControl";
import ApiKeyModal from "./components/ApiKeyModal";
import { useRecorder } from "./lib/useRecorder";
import { useVocabulary } from "./lib/useVocabulary";
import { useStreak } from "./lib/useStreak";
import { useApiKey } from "./lib/useApiKey";
import { api } from "./lib/api";

const SPEEDS = [0.8, 1.0, 1.2];

export default function App() {
  const [view, setView] = useState("sim"); // sim | call | vocab
  const [mode, setMode] = useState("practice");
  const [cfg, setCfg] = useState(null);
  const [question, setQuestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [phase, setPhase] = useState("ready"); // ready | analyzing | result
  const [error, setError] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [speed, setSpeed] = useState(() => {
    const saved = Number(localStorage.getItem("tp-speed"));
    return SPEEDS.includes(saved) ? saved : 1.0;
  });

  const rec = useRecorder("tr-TR");
  const audioRef = useRef(null);
  const vocab = useVocabulary();
  const streak = useStreak();
  const apiKey = useApiKey();
  const { addSeconds } = streak;
  const speedRef = useRef(speed);

  // Premium dark — yagona vizual rejim.
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    speedRef.current = speed;
    localStorage.setItem("tp-speed", String(speed));
  }, [speed]);

  useEffect(() => {
    if (!notice) return;
    const id = setTimeout(() => setNotice(""), 4000);
    return () => clearTimeout(id);
  }, [notice]);

  const refreshConfig = useCallback(async () => {
    try {
      setCfg(await api.config());
    } catch {
      setCfg({ ai_provider: "unknown", setup_needed: true });
    }
  }, []);

  useEffect(() => {
    refreshConfig();
  }, [refreshConfig, apiKey.key]);

  const handleKeySaved = useCallback(
    (clean) => {
      refreshConfig();
      if (clean) {
        setView("call");
        setNotice("API kalit saqlandi — Aylin Hoca tayyor");
      }
    },
    [refreshConfig]
  );

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
    const a = new Audio(api.ttsUrl(text, speedRef.current));
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
      const wasRecording = rec.recording;
      const elapsed = wasRecording ? rec.seconds : 0;
      let text = manualOverride !== undefined ? manualOverride : await rec.stop();
      if (!text) text = manualText.trim();
      if (!text) {
        setError("Javob topilmadi — mikrofon bilan gapir yoki matn yozib yubor.");
        return;
      }
      if (elapsed > 0) addSeconds(elapsed);
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
    [rec, manualText, question, mode, playTTS, addSeconds]
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
    <div className="relative min-h-dvh overflow-hidden bg-[#090A10] text-white">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-48 left-1/2 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-fuchsia-600/[0.10] blur-[130px]" />
        <div className="absolute top-1/3 -right-40 h-[420px] w-[420px] rounded-full bg-violet-600/[0.10] blur-[130px]" />
        <div className="absolute -bottom-40 -left-32 h-[380px] w-[380px] rounded-full bg-sky-500/[0.07] blur-[130px]" />
        <div className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(rgba(255,255,255,.16)_0.5px,transparent_0.5px)] [background-size:26px_26px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="relative z-10">
        <Header
          view={view}
          onView={setView}
          mode={mode}
          setMode={setMode}
          vocabCount={vocab.count}
          streakCount={streak.streak}
          onApiKey={() => setKeyOpen(true)}
          hasApiKey={apiKey.hasKey}
        />
      </div>

      {notice && (
        <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-full border border-emerald-300/20 bg-[#0c1411]/90 px-4 py-2 text-[11px] font-bold text-emerald-200 shadow-[0_20px_60px_-20px_rgba(16,185,129,.6)] backdrop-blur-2xl">
          {notice}
        </div>
      )}

      <main
        className={`relative z-10 mx-auto w-full px-3 py-4 pb-20 sm:px-4 ${
          view === "call" ? "max-w-3xl" : "max-w-4xl"
        }`}
      >
        {view === "sim" && <StreakCard streak={streak} />}

        {cfg?.setup_needed && !apiKey.hasKey && view !== "vocab" && (
          <div className="relative mb-4 overflow-hidden rounded-[24px] border border-fuchsia-300/15 bg-gradient-to-r from-fuchsia-500/[0.09] via-violet-500/[0.06] to-transparent p-4 backdrop-blur-xl">
            <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex-1">
                <p className="text-sm font-bold text-white/85">Aylin Hoca hali uxlayapti</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-white/40">
                  Gemini API kalitini kiriting — <code className="text-white/55">.env</code> shart emas.
                  Kalit faqat brauzeringizda saqlanadi.
                </p>
              </div>
              <button
                onClick={() => setKeyOpen(true)}
                className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500 px-4 py-2 text-[11px] font-extrabold text-white shadow-[0_10px_30px_-10px_rgba(217,70,239,.8)] transition hover:brightness-110"
              >
                API kalit kiritish
              </button>
            </div>
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
            speed={speed}
            setSpeed={setSpeed}
            onSessionSeconds={addSeconds}
          />
        )}

        {view === "sim" && (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-[20px] border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 backdrop-blur-xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                Aylin Hocaning ovoz tezligi
              </p>
              <SpeedControl value={speed} onChange={setSpeed} />
            </div>

            {error && (
              <div className="mb-4 rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] p-4 text-sm text-rose-200">
                {error}
              </div>
            )}

            {busy && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-fuchsia-300/15 bg-fuchsia-500/[0.06] p-4 text-sm text-fuchsia-100/80">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-fuchsia-400 border-t-transparent" />
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

        <p className="pt-4 text-center text-[10px] leading-relaxed text-white/20">
          TürkçePrep AI · STT: Web Speech API (tr-TR) · TTS: edge-tts{" "}
          <code className="text-white/30">tr-TR-EmelNeural</code> · AI: Gemini
        </p>
      </main>

      <ApiKeyModal
        open={keyOpen}
        onClose={() => setKeyOpen(false)}
        apiKey={apiKey}
        onSaved={handleKeySaved}
      />
    </div>
  );
}

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
import ToastHost from "./components/ToastHost";
import Icon from "./components/Icons";
import { useRecorder } from "./lib/useRecorder";
import { useVocabulary } from "./lib/useVocabulary";
import { useStreak } from "./lib/useStreak";
import { useApiKey } from "./lib/useApiKey";
import { api } from "./lib/api";
import { toast } from "./lib/toast";

const SPEEDS = [0.8, 1.0, 1.2];

export default function App() {
  const [view, setView] = useState("sim"); // sim | call | vocab
  const [callStage, setCallStage] = useState("setup");
  const [mode, setMode] = useState("practice");
  const [cfg, setCfg] = useState(null);
  const [question, setQuestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [phase, setPhase] = useState("ready");
  const [speaking, setSpeaking] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
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
  const immersive = view === "call" && callStage === "call";

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    speedRef.current = speed;
    localStorage.setItem("tp-speed", String(speed));
  }, [speed]);

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
        toast("API kalit saqlandi. Aylin Hoca tayyor.", "success");
      } else {
        toast("API kalit o'chirildi.");
      }
    },
    [refreshConfig]
  );

  const loadQuestion = useCallback(async (excludeId) => {
    try {
      setQuestion(await api.question(excludeId));
    } catch (e) {
      toast(`Savol yuklanmadi: ${e.message}`, "error");
    }
  }, []);

  useEffect(() => {
    if (!cfg) return;
    loadQuestion(null);
  }, [cfg, loadQuestion]);

  const playTTS = useCallback((text) => {
    if (!text) return Promise.resolve();
    audioRef.current?.pause();
    const audio = new Audio(api.ttsUrl(text, speedRef.current));
    audioRef.current = audio;
    setSpeaking(true);
    const finish = () => setSpeaking(false);
    return new Promise((resolve) => {
      audio.onended = () => {
        finish();
        resolve();
      };
      audio.onerror = () => {
        finish();
        toast("Ovoz yuklanmadi. TTS xizmati band bo'lishi mumkin.", "error");
        resolve();
      };
      audio.play().catch(() => {
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
      const wasRecording = rec.recording;
      const elapsed = wasRecording ? rec.seconds : 0;
      let text = manualOverride !== undefined ? manualOverride : await rec.stop();
      if (!text) text = manualText.trim();
      if (!text) {
        toast("Javob topilmadi. Gapiring yoki matn yozib yuboring.", "error");
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
        toast(`Tahlil qilinmadi: ${e.message}`, "error");
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
      setAnalysis(null);
      await rec.start();
      if (!rec.supported) setShowManual(true);
    }
  }, [rec, submit]);

  const busy = phase === "analyzing";

  return (
    <div className="app-canvas relative min-h-dvh text-zinc-50">
      {!immersive && (
        <Header
          view={view}
          onView={setView}
          vocabCount={vocab.count}
          streakCount={streak.streak}
          onApiKey={() => setKeyOpen(true)}
          hasApiKey={apiKey.hasKey}
        />
      )}

      <main
        className={`relative z-10 mx-auto w-full ${
          immersive
            ? "p-0"
            : view === "call"
              ? "max-w-3xl px-3 pb-20 pt-5 sm:px-5 sm:pt-6"
              : "max-w-4xl px-3 pb-16 pt-6 sm:px-5 sm:pt-8"
        }`}
      >
        {view === "sim" && (
          <div className="fade-up">
            <section className="mb-6 flex flex-col gap-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="eyebrow">Speaking studio</p>
                <h1 className="mt-2 max-w-xl text-[26px] font-semibold leading-[1.15] tracking-[-0.035em] text-zinc-50 sm:text-[32px]">
                  Har kuni bir oz
                  <span className="text-zinc-500"> ko&apos;proq gapiring.</span>
                </h1>
                <p className="mt-2 max-w-lg text-[13px] leading-relaxed text-zinc-500">
                  Aylin Hoca bilan turkcha suhbat. Javobingizni tahlil qiladi va keyingi qadamni ko&apos;rsatadi.
                </p>
              </div>
              <div className="segmented shrink-0 self-start sm:self-auto" role="group" aria-label="Mashq rejimi">
                <button aria-pressed={mode === "practice"} onClick={() => setMode("practice")}>
                  Mashq
                </button>
                <button aria-pressed={mode === "exam"} onClick={() => setMode("exam")}>
                  Imtihon
                </button>
              </div>
            </section>

            <StreakCard streak={streak} />

            {cfg?.setup_needed && !apiKey.hasKey && (
              <div className="surface mt-4 flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-400">
                  <Icon name="key" size={15} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-medium text-zinc-200">Aylin Hocani yoqing</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                    Gemini API kalitini kiriting. Kalit faqat brauzeringizda saqlanadi.
                  </p>
                </div>
                <button
                  onClick={() => setKeyOpen(true)}
                  className="shrink-0 rounded-lg border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
                >
                  Kalit kiritish
                </button>
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 px-1">
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                Aylin Hocaning ovoz tezligi
              </p>
              <SpeedControl value={speed} onChange={setSpeed} compact />
            </div>

            <div className="mt-3">
              {phase !== "result" ? (
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
                  {busy && (
                    <div className="surface mt-3 flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[12px] text-zinc-400">
                      <span className="h-3.5 w-3.5 animate-spin rounded-full border border-zinc-500 border-t-zinc-100" />
                      Aylin Hoca javobingizni tahlil qilyapti
                    </div>
                  )}
                </>
              ) : (
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
            onStageChange={setCallStage}
          />
        )}

        {!immersive && view !== "call" && (
          <p className="pt-6 text-center text-[10px] leading-relaxed text-zinc-600">
            TürkçePrep AI · STT Web Speech API · TTS edge-tts{" "}
            <span className="text-zinc-500">tr-TR-EmelNeural</span> · AI Gemini
          </p>
        )}
      </main>

      <ApiKeyModal
        open={keyOpen}
        onClose={() => setKeyOpen(false)}
        apiKey={apiKey}
        onSaved={handleKeySaved}
      />
      <ToastHost elevated={immersive} />
    </div>
  );
}

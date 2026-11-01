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
import LevelCard from "./components/LevelCard";
import MissionsCard from "./components/MissionsCard";
import LevelTest from "./components/LevelTest";
import ModePicker from "./components/ModePicker";
import VocabularyNotebook from "./components/VocabularyNotebook";
import ExamPage from "./components/ExamPage";
import Icon from "./components/Icons";
import { useRecorder } from "./lib/useRecorder";
import { useVocabulary } from "./lib/useVocabulary";
import { useStreak } from "./lib/useStreak";
import { useApiKey } from "./lib/useApiKey";
import { useLevel } from "./lib/useLevel";
import { trackMission } from "./lib/missions";
import { api } from "./lib/api";
import { getPersona } from "./lib/personas";
import { toast } from "./lib/toast";

const SPEEDS = [0.8, 1.0, 1.2];

export default function App() {
  const [view, setView] = useState("sim"); // sim | call | vocab | exam
  const [callStage, setCallStage] = useState("setup");
  const [cfg, setCfg] = useState(null);
  const [question, setQuestion] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [phase, setPhase] = useState("ready");
  const [speaking, setSpeaking] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [levelTestOpen, setLevelTestOpen] = useState(false);
  const [speed, setSpeed] = useState(() => {
    const saved = Number(localStorage.getItem("tp-speed"));
    return SPEEDS.includes(saved) ? saved : 1.0;
  });

  const rec = useRecorder("tr-TR");
  const audioRef = useRef(null);
  const vocab = useVocabulary();
  const streak = useStreak();
  const apiKey = useApiKey();
  const levelState = useLevel();
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

  useEffect(() => {
    if (!levelState.level) return;
    setSpeed(levelState.level === "A1" ? 0.8 : 1.0);
  }, [levelState.level]);

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
      setQuestion(await api.question(excludeId, levelState.level || ""));
    } catch (e) {
      toast(`Savol yuklanmadi: ${e.message}`, "error");
    }
  }, [levelState.level]);

  useEffect(() => {
    if (!cfg) return;
    loadQuestion(null);
  }, [cfg, loadQuestion]);

  const playTTS = useCallback((text, persona = "aylin") => {
    if (!text) return Promise.resolve();
    const profile = typeof persona === "string" ? getPersona(persona) : persona || getPersona("aylin");
    audioRef.current?.pause();
    audioRef.current = null;
    const audio = new Audio(api.ttsUrl(text, profile, speedRef.current));
    audio.preload = "auto";
    audioRef.current = audio;
    setSpeaking(true);
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        audioRef.current = null;
        setSpeaking(false);
        resolve();
      };
      const fail = () => {
        finish();
        toast("Neural ovoz yuklanmadi. Internet aloqasini tekshirib qayta urinib ko'ring.", "error");
      };
      audio.onended = finish;
      audio.onerror = fail;
      audio.play().catch(fail);
    });
  }, []);

  const stopTTS = useCallback(() => {
    audioRef.current?.pause();
    audioRef.current = null;
    setSpeaking(false);
  }, []);

  const handleSessionSeconds = useCallback(
    (seconds) => {
      addSeconds(seconds);
      trackMission("speak", seconds);
    },
    [addSeconds]
  );

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
      if (elapsed > 0) {
        addSeconds(elapsed);
        trackMission("speak", elapsed);
      }
      setManualText("");
      setShowManual(false);
      setPhase("analyzing");
      try {
        const result = await api.analyze(text, question, "practice", "", "aylin", levelState.level || "");
        setAnalysis(result);
        setPhase("result");
        trackMission("grammar");
        let added = 0;
        (result.key_words || []).forEach((word) => {
          if (vocab.add({ tr: word.tr, uz: word.uz, type: "word", source: "Serbest sohbet" })) added += 1;
        });
        if (added > 0) trackMission("words");
        if (result.model_answer_tr) playTTS(result.model_answer_tr);
      } catch (e) {
        setPhase("ready");
        toast(`Tahlil qilinmadi: ${e.message}`, "error");
      }
    },
    [rec, manualText, question, playTTS, addSeconds, levelState.level, vocab]
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

  const handleLevelComplete = useCallback(
    (nextLevel, score) => {
      levelState.save(nextLevel, score);
      setAnalysis(null);
      setPhase("ready");
      toast(`Darajangiz aniqlandi: ${nextLevel}. Mashqlar shunga moslashadi.`, "success");
    },
    [levelState]
  );

  const handleLevelSelect = useCallback(
    (nextLevel) => {
      if (!nextLevel) return;
      levelState.save(nextLevel, levelState.score);
      setAnalysis(null);
      setPhase("ready");
      toast(`Daraja ${nextLevel} tanlandi. Savollar va suhbat shunga moslashadi.`, "success");
    },
    [levelState]
  );

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
          level={levelState.level}
        />
      )}

      <main
        className={`relative z-10 mx-auto w-full ${
          immersive
            ? "p-0"
            : view === "call"
              ? "max-w-3xl px-3 pb-20 pt-5 sm:px-5 sm:pt-6"
              : view === "exam"
                ? "max-w-4xl px-3 pb-16 pt-5 sm:px-5 sm:pt-7"
                : "max-w-6xl px-3 pb-16 pt-6 sm:px-5 sm:pt-8"
        }`}
      >
        {view === "sim" && (
          <div className="fade-up">
            <section className="studio-hero relative mb-5 overflow-hidden rounded-[28px] p-5 sm:mb-6 sm:p-7">
              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="hero-pill"><span className="h-1.5 w-1.5 rounded-full bg-mint-300" /> Speaking studio</span>
                    <span className="hero-pill">3 personaj</span>
                    <span className="hero-pill">A1–C1</span>
                  </div>
                  <h1 className="mt-3 text-[28px] font-semibold leading-[1.08] tracking-[-0.045em] text-zinc-50 sm:text-[36px]">
                    Har kuni bir oz
                    <br />
                    <span className="text-aurora">ko&apos;proq gapiring.</span>
                  </h1>
                  <p className="mt-2 max-w-lg text-[12px] leading-relaxed text-zinc-400 sm:text-[13px]">
                    Jonli personajlar, grammatika tahlilchisi va talaffuz bahosi — barchasi bitta suhbatda.
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-start sm:self-auto">
                  <span className="hero-pill"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> 3 rejim</span>
                  <span className="hero-pill">Daraja bo&apos;yicha</span>
                </div>
              </div>
            </section>

            <ModePicker
              active="free"
              onFree={() => setView("sim")}
              onRoleplay={() => setView("call")}
              onExam={() => setView("exam")}
            />

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
              <div className="min-w-0 space-y-3">
                <LevelCard
                  level={levelState.level}
                  score={levelState.score}
                  onSelect={handleLevelSelect}
                  onOpen={() => setLevelTestOpen(true)}
                />
                <StreakCard streak={streak} />

                {cfg?.setup_needed && !apiKey.hasKey && (
                  <div className="api-banner flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-300/15 text-amber-200">
                      <Icon name="key" size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-medium text-zinc-100">Aylin Hocani yoqing</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">
                        Gemini API kalitini kiriting. Kalit faqat brauzeringizda saqlanadi.
                      </p>
                    </div>
                    <button
                      onClick={() => setKeyOpen(true)}
                      className="shrink-0 rounded-xl border border-white/10 bg-white/[0.06] px-3.5 py-2 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.1]"
                    >
                      Kalit kiritish
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-2 px-1 pt-1">
                  <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
                    Aylin Hocaning ovoz tezligi
                  </p>
                  <SpeedControl value={speed} onChange={setSpeed} compact />
                </div>

                <div>
                  {phase !== "result" ? (
                    <>
                      <QuestionCard
                        question={question}
                        level={levelState.level}
                        speaking={speaking}
                        onPlay={() => playTTS(question?.tr)}
                        vocab={vocab}
                        playTTS={playTTS}
                      />
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
                        <div className="surface mt-3 flex items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-[12px] text-zinc-400">
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-zinc-500 border-t-mint-300" />
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

              <aside className="space-y-3">
                <MissionsCard />
                <VocabularyNotebook vocab={vocab} onOpen={() => setView("vocab")} playTTS={playTTS} />
                <section className="smart-card surface rounded-3xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-sky-300/10 text-sky-200">
                      <Icon name="languages" size={13} />
                    </span>
                    <h3 className="text-[12px] font-semibold text-zinc-100">Smart lug&apos;at</h3>
                  </div>
                  <p className="mt-2 text-[10px] leading-relaxed text-zinc-500">
                    Suhbatdagi har qanday turkcha so&apos;zni bosing — tarjimasi, misoli va talaffuzi darhol chiqadi.
                  </p>
                  <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[11px] text-zinc-400">
                    <span className="word-tap-example">Merhaba</span>, bugün nasılsın?
                  </div>
                </section>
              </aside>
            </div>
          </div>
        )}

        {view === "vocab" && <VocabularyPage vocab={vocab} playTTS={playTTS} onBack={() => setView("sim")} />}

        {view === "exam" && (
          <ExamPage
            level={levelState.level || "A2"}
            vocab={vocab}
            playTTS={playTTS}
            stopTTS={stopTTS}
            onExit={() => setView("sim")}
            onVocab={() => setView("vocab")}
          />
        )}

        {view === "call" && (
          <CallScreen
            onExit={() => {
              setCallStage("setup");
              setView("sim");
            }}
            onVocab={() => setView("vocab")}
            playTTS={playTTS}
            stopTTS={stopTTS}
            vocab={vocab}
            speed={speed}
            setSpeed={setSpeed}
            onSessionSeconds={handleSessionSeconds}
            onStageChange={setCallStage}
            level={levelState.level}
          />
        )}

        {!immersive && view !== "call" && (
          <p className="pt-6 text-center text-[10px] leading-relaxed text-zinc-600">
            TürkçePrep AI · STT Web Speech API · TTS edge-tts{" "}
            <span className="text-zinc-500">personaj Neural ovozi</span> · AI Gemini
          </p>
        )}
      </main>

      <ApiKeyModal
        open={keyOpen}
        onClose={() => setKeyOpen(false)}
        apiKey={apiKey}
        onSaved={handleKeySaved}
      />
      <LevelTest
        open={levelTestOpen}
        onClose={() => setLevelTestOpen(false)}
        onComplete={handleLevelComplete}
      />
      <ToastHost elevated={immersive} />
    </div>
  );
}

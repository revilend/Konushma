import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useCall } from "../lib/useCall";
import Waveform from "./Waveform";
import ScenarioPicker from "./ScenarioPicker";
import PostCallReport from "./PostCallReport";
import SaveButton from "./SaveButton";
import SpeedControl from "./SpeedControl";
import GlowingOrb from "./GlowingOrb";
import Captions from "./Captions";
import CallDock from "./CallDock";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const TYPE_META = {
  grammar: { icon: "🧩", label: "Grammatika" },
  vocabulary: { icon: "📚", label: "Lug'at" },
  false_friend: { icon: "⚠️", label: "Soxta do'st!" },
};

const STATUS = {
  listening: { label: "Tinglayapti", dot: "bg-emerald-400" },
  speaking: { label: "Gapirmoqda", dot: "bg-fuchsia-400" },
  thinking: { label: "O'ylayapti", dot: "bg-indigo-400" },
  muted: { label: "Mikrofon o'chirilgan", dot: "bg-rose-400" },
  idle: { label: "Tayyor", dot: "bg-white/40" },
};

export default function CallScreen({
  onExit,
  onVocab,
  playTTS,
  stopTTS,
  vocab,
  speed,
  setSpeed,
  onSessionSeconds,
}) {
  const [scenarios, setScenarios] = useState([]);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [scenarioId, setScenarioId] = useState("free");
  const [stage, setStage] = useState("setup");
  const [history, setHistory] = useState([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [showUz, setShowUz] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const turnsRef = useRef([]);
  const questionRef = useRef("");
  const callRef = useRef(null);
  const scenarioRef = useRef(null);
  const sessionRef = useRef(0);
  const secondsRef = useRef(0);
  const creditedRef = useRef(false);
  const onSessionSecondsRef = useRef(onSessionSeconds);
  const creditRef = useRef(() => {});

  const selected = scenarios.find((s) => s.id === scenarioId) || null;

  useEffect(() => {
    onSessionSecondsRef.current = onSessionSeconds;
  }, [onSessionSeconds]);

  const loadScenarios = useCallback(async () => {
    setLoadingScenarios(true);
    setError("");
    try {
      const d = await api.scenarios();
      const list = d.scenarios || [];
      setScenarios(list);
      setScenarioId((prev) =>
        list.some((s) => s.id === prev) ? prev : list.find((s) => s.id === "free")?.id || list[0]?.id || ""
      );
    } catch (e) {
      setError(`Stsenariylar yuklanmadi: ${e.message}`);
    } finally {
      setLoadingScenarios(false);
    }
  }, []);

  useEffect(() => {
    loadScenarios();
  }, [loadScenarios]);

  const onTurn = useCallback(async (text) => {
    const sc = scenarioRef.current;
    try {
      const a = await api.analyze(
        text,
        { tr: questionRef.current || "Jonli suhbat", uz: "" },
        "call",
        sc?.id || ""
      );
      const turn = {
        user: a.transcription || text,
        aylin: a.next_question_tr || "",
        aylin_uz: a.next_question_uz || "",
        hints: a.answer_hints || [],
        reply: a.model_answer_tr || "",
        note: a.positive_note_uz || "",
        level_score: a.level_score || "A1",
        mistakes: a.mistakes || [],
        phrases: a.useful_phrases || [],
      };
      turnsRef.current = [...turnsRef.current, turn];
      setHistory([...turnsRef.current].reverse());
      questionRef.current = turn.aylin || questionRef.current;
      setShowUz(false);
      setShowHints(false);
      return turn;
    } catch (e) {
      setError(`Javob tahlil qilinmadi: ${e.message}`);
      return null;
    }
  }, []);

  const onTurnWithSpeech = useCallback(
    async (text) => {
      const turn = await onTurn(text);
      const speech = turn ? [turn.reply, turn.aylin].filter(Boolean).join(" ") : "";
      if (speech && playTTS) {
        callRef.current?.aiSpeakingChanged(true);
        try {
          await playTTS(speech);
        } finally {
          callRef.current?.aiSpeakingChanged(false);
        }
      }
    },
    [onTurn, playTTS]
  );

  const call = useCall({ onTurn: onTurnWithSpeech });
  callRef.current = call;
  secondsRef.current = call.seconds;

  const creditTime = useCallback(() => {
    if (creditedRef.current) return;
    const seconds = secondsRef.current;
    if (seconds > 0) {
      creditedRef.current = true;
      onSessionSecondsRef.current?.(seconds);
    }
  }, []);
  creditRef.current = creditTime;

  useEffect(() => {
    return () => creditRef.current();
  }, []);

  const startCall = async () => {
    if (!selected) return;
    const token = ++sessionRef.current;
    scenarioRef.current = selected;
    turnsRef.current = [];
    setHistory([]);
    setReport(null);
    setReportError("");
    setError("");
    setShowUz(false);
    setShowHints(false);
    setShowHistory(false);
    setStarting(true);
    setStage("call");
    questionRef.current = selected.opening_tr;
    secondsRef.current = 0;
    creditedRef.current = false;
    try {
      if (playTTS) {
        callRef.current?.aiSpeakingChanged(true);
        await playTTS(selected.opening_tr);
        if (sessionRef.current !== token) return;
        callRef.current?.aiSpeakingChanged(false);
      }
      await call.start();
    } catch (e) {
      call.end();
      if (sessionRef.current === token) {
        setStage("setup");
        setError(`Mikrofon ochilmadi: ${e.message}. Brauzerda mikrofon ruxsatini bering.`);
      }
    } finally {
      setStarting(false);
    }
  };

  const runReport = useCallback(async () => {
    setStage("report");
    setReportLoading(true);
    setReportError("");
    try {
      const data = await api.report({
        turns: turnsRef.current,
        mistakes: turnsRef.current.flatMap((t) => t.mistakes || []),
        scenario: scenarioRef.current?.id || "",
      });
      setReport(data);
    } catch (e) {
      setReportError(e.message || "Hisobot yaratilmadi");
    } finally {
      setReportLoading(false);
    }
  }, []);

  const finish = () => {
    creditTime();
    sessionRef.current += 1;
    call.end();
    stopTTS?.();
    runReport();
  };

  const restart = () => {
    creditTime();
    sessionRef.current += 1;
    call.end();
    stopTTS?.();
    setStage("setup");
    setReport(null);
    setReportError("");
    setHistory([]);
    turnsRef.current = [];
    setError("");
    setShowUz(false);
    setShowHints(false);
    setShowHistory(false);
  };

  const leave = () => {
    creditTime();
    sessionRef.current += 1;
    call.end();
    stopTTS?.();
    onExit();
  };

  if (stage === "setup") {
    return (
      <ScenarioPicker
        scenarios={scenarios}
        selected={scenarioId}
        onSelect={setScenarioId}
        onStart={startCall}
        onBack={leave}
        loading={loadingScenarios}
        starting={starting}
        error={error}
        speed={speed}
        setSpeed={setSpeed}
      />
    );
  }

  if (stage === "report") {
    return (
      <PostCallReport
        report={report}
        loading={reportLoading}
        error={reportError}
        onRetry={runReport}
        onRestart={restart}
        onExit={leave}
        onVocab={onVocab}
        playTTS={playTTS}
        vocab={vocab}
      />
    );
  }

  const latest = history[0] || null;
  const currentTr = latest?.aylin || selected?.opening_tr || "";
  const currentUz = latest?.aylin_uz || selected?.opening_uz || "";
  const currentHints = latest?.hints?.length ? latest.hints : selected?.hints || [];
  const currentSpeech = latest
    ? [latest.reply, latest.aylin].filter(Boolean).join(" ")
    : selected?.opening_tr || "";
  const isSpeaking = call.callState === "speaking";
  const captionText = isSpeaking
    ? currentSpeech
    : call.callState === "listening"
      ? call.interim
      : "";
  const placeholder =
    call.callState === "listening"
      ? "Gapiring — Aylin Hoca tinglaydi"
      : call.callState === "thinking"
        ? "Aylin Hoca o'ylayapti…"
        : call.muted
          ? "Mikrofon o'chirilgan"
          : isSpeaking
            ? ""
            : "Suhbat tayyor";
  const meta = STATUS[call.callState] || STATUS.idle;
  const waveMode = isSpeaking ? "speaking" : call.callState === "listening" ? "listening" : "idle";

  return (
    <div className="relative flex min-h-[calc(100dvh-158px)] flex-col overflow-hidden rounded-[36px] border border-white/10 bg-[#090B12]/85 shadow-[0_40px_120px_-35px_rgba(124,58,237,.55)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-fuchsia-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -right-20 top-1/3 h-72 w-72 rounded-full bg-violet-600/15 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-[100px]" />

      <div className="relative z-10 flex flex-1 flex-col overflow-y-auto px-4 pb-2 pt-4 sm:px-6">
        <div className="flex items-center gap-2">
          <span className="glass-chip inline-flex min-w-0 items-center gap-1.5 truncate rounded-full px-3 py-1.5 text-[11px] font-bold text-white/75">
            <span className="shrink-0">{selected?.emoji}</span>
            <span className="truncate">{selected?.title_uz}</span>
          </span>
          <span className="rounded-full border border-white/10 bg-black/20 px-2 py-1 text-[9px] font-bold text-white/40">
            {selected?.level}
          </span>
          <span className="ml-auto shrink-0 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 text-[11px] font-bold tabular-nums text-white/50">
            {fmt(call.seconds)}
          </span>
        </div>

        <div className="mt-2 flex justify-center">
          <SpeedControl value={speed} onChange={setSpeed} compact />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center py-3 text-center">
          <GlowingOrb mode={call.muted ? "muted" : call.callState} />

          <div className="mt-1 flex items-center gap-2">
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${call.callState !== "idle" ? "animate-pulse" : ""}`} />
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-white/40">{meta.label}</p>
          </div>

          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">Aylin Hoca</h2>
          <p className="mt-0.5 text-[11px] tracking-wide text-white/30">Turk tili · AI voice tutor</p>

          <Captions text={captionText} placeholder={placeholder} speaking={isSpeaking} className="mt-4" />

          <div className="mt-1 w-full max-w-sm opacity-60">
            <Waveform getAnalyser={call.getAnalyser} active={call.callState !== "thinking"} mode={waveMode} />
          </div>

          <div className="mt-2 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowUz((v) => !v)}
              className={`glass-chip rounded-full px-4 py-2 text-[11px] font-bold transition ${
                showUz ? "border-sky-300/30 text-sky-200" : "text-white/55 hover:text-white/85"
              }`}
            >
              O&apos;zbekcha ma&apos;nosi
            </button>
            <button
              type="button"
              onClick={() => setShowHints((v) => !v)}
              className={`glass-chip rounded-full px-4 py-2 text-[11px] font-bold transition ${
                showHints ? "border-amber-300/30 text-amber-200" : "text-white/55 hover:text-white/85"
              }`}
            >
              Maslahat olish
            </button>
          </div>

          {showUz && (
            <div className="mt-3 w-full max-w-xl rounded-2xl border border-sky-300/15 bg-sky-400/[0.06] p-4 text-left backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-sky-300/70">
                Aylin so&apos;ragan savol
              </p>
              <p className="mt-1.5 text-sm font-semibold text-white/85">{currentTr}</p>
              <p className="mt-1 text-sm text-sky-200/75">{currentUz || "Tarjima tayyorlanmoqda…"}</p>
            </div>
          )}

          {showHints && (
            <div className="mt-3 w-full max-w-xl rounded-2xl border border-amber-300/15 bg-amber-400/[0.06] p-4 text-left backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-200/70">
                Shunday javob berishingiz mumkin
              </p>
              {currentHints.length === 0 ? (
                <p className="mt-1.5 text-xs text-amber-100/60">
                  Maslahat tayyorlanmoqda — savolni tinglab, o&apos;z so&apos;zlaringiz bilan javob bering.
                </p>
              ) : (
                <ul className="mt-2 space-y-2.5">
                  {currentHints.map((h, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white/85">{h.tr}</p>
                        <p className="text-[11px] text-white/40">{h.uz}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playTTS?.(h.tr)}
                        className="rounded-full border border-white/10 bg-white/[0.06] px-2.5 py-1 text-[10px] font-bold text-white/60 hover:text-white"
                      >
                        Tinglash
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowHistory((v) => !v)}
            className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-white/25 transition hover:text-white/50"
          >
            Suhbat tafsilotlari
            {history.length > 0 && <span className="text-white/40">· {history.length}</span>}
            <span className="text-[8px]">{showHistory ? "▲" : "▼"}</span>
          </button>

          {showHistory && (
            <div className="mt-2 w-full max-w-xl space-y-3 text-left">
              {history.map((t, i) => (
                <div key={i} className="space-y-2">
                  {t.mistakes?.length > 0 && (
                    <div className="rounded-2xl border border-amber-300/15 bg-amber-400/[0.05] p-3 backdrop-blur-xl">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-amber-200/60">
                        Tahlil · daraja {t.level_score}
                      </p>
                      {t.mistakes.map((m, j) => (
                        <div key={j} className="mt-2 text-sm">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-rose-300/80 line-through">
                              {(TYPE_META[m.type] || TYPE_META.grammar).icon} {m.wrong}
                            </p>
                            <p className="font-bold text-emerald-300">✓ {m.correct}</p>
                            <span className="ml-auto">
                              <SaveButton
                                item={{
                                  tr: m.correct,
                                  uz: m.explanation_uz,
                                  wrong: m.wrong,
                                  type: m.type,
                                  source: scenarioRef.current?.title_uz,
                                }}
                                vocab={vocab}
                                compact
                              />
                            </span>
                          </div>
                          <p className="text-white/40">{m.explanation_uz}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {t.phrases?.length > 0 && (
                    <div className="rounded-2xl border border-indigo-300/15 bg-indigo-400/[0.05] p-3 backdrop-blur-xl">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-indigo-200/60">Yangi iboralar</p>
                      {t.phrases.map((p, j) => (
                        <div key={j} className="mt-1.5 flex flex-wrap items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-semibold text-white/85">{p.tr}</p>
                            <p className="text-[11px] text-white/40">{p.uz}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => playTTS?.(p.tr)}
                            className="rounded-full border border-white/10 bg-white/[0.06] px-2 py-1 text-[10px] font-bold text-white/60 hover:text-white"
                          >
                            Tinglash
                          </button>
                          <SaveButton
                            item={{ tr: p.tr, uz: p.uz, type: "phrase", source: scenarioRef.current?.title_uz }}
                            vocab={vocab}
                            compact
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="ml-auto max-w-[88%] rounded-2xl rounded-br-sm border border-fuchsia-300/15 bg-fuchsia-500/10 px-3.5 py-2 text-sm text-white/85 backdrop-blur-xl">
                    {t.user}
                  </div>
                  {t.note && <p className="text-center text-[10px] text-emerald-300/70">{t.note}</p>}
                  {t.aylin && (
                    <div className="max-w-[88%] rounded-2xl rounded-bl-sm border border-white/10 bg-white/[0.05] px-3.5 py-2 text-sm text-white/70 backdrop-blur-xl">
                      {t.aylin}
                    </div>
                  )}
                </div>
              ))}
              {history.length === 0 && (
                <p className="py-2 text-center text-xs text-white/25">Suhbat hali boshlanmadi.</p>
              )}
            </div>
          )}

          {error && (
            <div className="mt-3 w-full max-w-xl rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-left text-xs leading-relaxed text-rose-200">
              {error}
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 border-t border-white/[0.05] px-3 pb-4 pt-3 sm:px-5">
        <CallDock
          muted={call.muted}
          onToggleMute={call.toggleMute}
          onEnd={finish}
          showTranslation={showUz}
          onToggleTranslation={() => setShowUz((v) => !v)}
        />
      </div>
    </div>
  );
}

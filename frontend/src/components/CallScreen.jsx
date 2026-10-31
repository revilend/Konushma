import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { useCall } from "../lib/useCall";
import Waveform from "./Waveform";
import ScenarioPicker from "./ScenarioPicker";
import PostCallReport from "./PostCallReport";
import SaveButton from "./SaveButton";
import SpeedControl from "./SpeedControl";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const TYPE_META = {
  grammar: { icon: "🧩", label: "Grammatika" },
  vocabulary: { icon: "📚", label: "Lug'at" },
  false_friend: { icon: "⚠️", label: "Soxta do'st!" },
};

const STATUS_TEXT = {
  listening: "🎙️ Aylin Hoca tinglaydi — gapiring",
  thinking: "🧠 Aylin Hoca tahlil qilyapti…",
  speaking: "🔊 Aylin Hoca gapirmoqda…",
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

  const turnsRef = useRef([]);
  const questionRef = useRef("");
  const callRef = useRef(null);
  const scenarioRef = useRef(null);
  const sessionRef = useRef(0);
  const scrollRef = useRef(null);
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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [history]);

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

  const status = STATUS_TEXT[call.callState] || "";
  const stateColors = {
    speaking: "text-emerald-500",
    thinking: "text-indigo-500",
    listening: "text-amber-500",
  };
  const latest = history[0] || null;
  const currentTr = latest?.aylin || selected?.opening_tr || "";
  const currentUz = latest?.aylin_uz || selected?.opening_uz || "";
  const currentHints = latest?.hints?.length ? latest.hints : selected?.hints || [];
  const waveMode =
    call.callState === "speaking" ? "speaking" : call.callState === "listening" ? "listening" : "idle";

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-[11px] font-bold text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-300">
            {selected?.emoji} {selected?.title_uz}
          </span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {selected?.level}
          </span>
          <span className="ml-auto text-xs font-bold tabular-nums text-slate-400">⏱ {fmt(call.seconds)}</span>
        </div>

        <div className="mt-2 flex justify-center">
          <SpeedControl value={speed} onChange={setSpeed} compact />
        </div>

        <div className="mt-3 flex flex-col items-center">
          <div className="relative">
            {call.callState === "speaking" && (
              <>
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400/30" />
                <span
                  className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20"
                  style={{ animationDelay: "0.4s" }}
                />
              </>
            )}
            <div
              className={`grid h-24 w-24 place-items-center rounded-full text-4xl shadow-2xl transition ${
                call.callState === "speaking"
                  ? "animate-pulse bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/40"
                  : call.callState === "thinking"
                    ? "bg-gradient-to-br from-indigo-500 to-fuchsia-600 shadow-indigo-500/30"
                    : "bg-gradient-to-br from-rose-500 to-red-600 shadow-rose-500/30"
              }`}
            >
              👩‍🏫
            </div>
          </div>
          <h2 className="mt-3 text-xl font-extrabold text-slate-900 dark:text-white">Aylin Hoca 🇹🇷</h2>
          <p className={`mt-1 text-sm font-semibold ${stateColors[call.callState] || "text-slate-400"}`}>
            {status}
          </p>

          <Waveform getAnalyser={call.getAnalyser} active={call.callState !== "thinking"} mode={waveMode} />

          {call.callState === "listening" && call.interim && (
            <p className="max-w-lg text-center text-sm italic text-indigo-500 dark:text-indigo-300">
              &quot;{call.interim}…&quot;
            </p>
          )}

          <div className="mt-1 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => setShowUz((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                showUz
                  ? "bg-sky-600 text-white"
                  : "border border-sky-200 text-sky-600 hover:bg-sky-50 dark:border-sky-900 dark:text-sky-300 dark:hover:bg-sky-950/40"
              }`}
            >
              🇺🇿 O&apos;zbekcha ma&apos;nosi
            </button>
            <button
              type="button"
              onClick={() => setShowHints((v) => !v)}
              className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                showHints
                  ? "bg-amber-500 text-white"
                  : "border border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
              }`}
            >
              💡 Maslahat olish
            </button>
          </div>

          {showUz && (
            <div className="mt-2 w-full max-w-xl rounded-2xl border border-sky-200 bg-sky-50 p-3 text-left dark:border-sky-900/60 dark:bg-sky-950/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-sky-500">Aylin so&apos;ragan savol</p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{currentTr}</p>
              <p className="mt-1 text-sm text-sky-700 dark:text-sky-300">
                🇺🇿 {currentUz || "Tarjima tayyorlanmoqda…"}
              </p>
            </div>
          )}

          {showHints && (
            <div className="mt-2 w-full max-w-xl rounded-2xl border border-amber-200 bg-amber-50 p-3 text-left dark:border-amber-900/60 dark:bg-amber-950/30">
              <p className="text-[10px] font-bold uppercase tracking-wide text-amber-600 dark:text-amber-400">
                💡 Shunday javob berishingiz mumkin
              </p>
              {currentHints.length === 0 ? (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                  Maslahat tayyorlanmoqda — savolni tinglab, o&apos;z so&apos;zlaringiz bilan javob bering.
                </p>
              ) : (
                <ul className="mt-1.5 space-y-2">
                  {currentHints.map((h, i) => (
                    <li key={i} className="flex flex-wrap items-center gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{h.tr}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">🇺🇿 {h.uz}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => playTTS?.(h.tr)}
                        className="rounded-full bg-amber-500 px-2 py-1 text-[10px] font-bold text-white hover:bg-amber-400"
                      >
                        🔊
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          <button
            onClick={finish}
            className="mt-4 rounded-full bg-rose-600 px-9 py-3.5 text-base font-bold text-white shadow-xl shadow-rose-500/30 transition hover:bg-rose-500"
          >
            ⏹ Qo&apos;ng&apos;iroqni tugatish
          </button>
          <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
            Tugatgach CEFR darajangiz va 3 mezon bo&apos;yicha hisobot ochiladi
          </p>
        </div>

        {error && (
          <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
            ⚠️ {error}
          </p>
        )}
      </div>

      <div ref={scrollRef} className="max-h-[42vh] space-y-4 overflow-y-auto pr-1">
        {history.map((t, i) => (
          <div key={i} className="space-y-2">
            {t.mistakes.length > 0 && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Tahlil · daraja {t.level_score}
                </p>
                {t.mistakes.map((m, j) => (
                  <div key={j} className="mt-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-rose-500 line-through">
                        {(TYPE_META[m.type] || TYPE_META.grammar).icon} {m.wrong}
                      </p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">✅ {m.correct}</p>
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
                    <p className="text-slate-600 dark:text-slate-300">💡 {m.explanation_uz}</p>
                  </div>
                ))}
              </div>
            )}

            {t.phrases?.length > 0 && (
              <div className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-3 dark:border-indigo-900/60 dark:bg-indigo-950/30">
                <p className="text-[11px] font-bold uppercase tracking-wide text-indigo-600 dark:text-indigo-300">
                  ✨ Yangi iboralar
                </p>
                {t.phrases.map((p, j) => (
                  <div key={j} className="mt-1.5 flex flex-wrap items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{p.tr}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">🇺🇿 {p.uz}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => playTTS?.(p.tr)}
                      className="rounded-full bg-indigo-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-indigo-500"
                    >
                      🔊
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

            <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2 text-sm text-white">
              🧑 {t.user}
            </div>
            {t.note && (
              <p className="text-center text-xs text-emerald-600 dark:text-emerald-400">👩‍🏫 {t.note}</p>
            )}
            <div className="max-w-[85%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              👩‍🏫 {t.aylin}
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-600">
            Suhbat hali boshlanmadi — Aylin Hocaning savoliga javob bering 🎙️
          </p>
        )}
      </div>
    </div>
  );
}

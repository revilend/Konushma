import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../lib/api";
import { toast } from "../lib/toast";
import { useCall } from "../lib/useCall";
import { getPersona, PERSONAS } from "../lib/personas";
import { trackMission } from "../lib/missions";
import ScenarioPicker from "./ScenarioPicker";
import PostCallReport from "./PostCallReport";
import GlowingOrb from "./GlowingOrb";
import Captions from "./Captions";
import CallDock from "./CallDock";
import Waveform from "./Waveform";
import GrammarPanel from "./GrammarPanel";
import PronunciationRing from "./PronunciationRing";
import ClickableText from "./ClickableText";
import Icon from "./Icons";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

const STATUS = {
  listening: { label: "Tinglayapti", dot: "bg-mint-300", text: "text-mint-100" },
  speaking: { label: "Gapirmoqda", dot: "bg-amber-300", text: "text-amber-100" },
  thinking: { label: "O'ylayapti", dot: "bg-sky-300", text: "text-sky-100" },
  muted: { label: "Mikrofon o'chirilgan", dot: "bg-rose-300", text: "text-rose-100" },
  idle: { label: "Tayyor", dot: "bg-zinc-600", text: "text-zinc-500" },
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
  onStageChange,
  level,
}) {
  const [scenarios, setScenarios] = useState([]);
  const [personas, setPersonas] = useState(PERSONAS);
  const [loadingScenarios, setLoadingScenarios] = useState(true);
  const [scenarioId, setScenarioId] = useState("free");
  const [personaId, setPersonaId] = useState("aylin");
  const [stage, setStage] = useState("setup");
  const [history, setHistory] = useState([]);
  const [starting, setStarting] = useState(false);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");
  const [showUz, setShowUz] = useState(false);

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
  const selectedPersona = personas.find((persona) => persona.id === personaId) || getPersona(personaId);
  const speakAsPersona = useCallback(
    (text) => playTTS?.(text, selectedPersona),
    [playTTS, selectedPersona]
  );

  useEffect(() => {
    onStageChange?.(stage);
  }, [stage, onStageChange]);

  useEffect(() => {
    onSessionSecondsRef.current = onSessionSeconds;
  }, [onSessionSeconds]);

  const loadScenarios = useCallback(async () => {
    setLoadingScenarios(true);
    try {
      const [data, personaData] = await Promise.all([
        api.scenarios("roleplay"),
        api.personas().catch(() => ({ personas: PERSONAS })),
      ]);
      const list = data.scenarios || [];
      const personaList = personaData.personas?.length ? personaData.personas : PERSONAS;
      setPersonas(personaList);
      setScenarios(list);
      setScenarioId((prev) => (list.some((s) => s.id === prev) ? prev : list[0]?.id || ""));
      const initial = list[0];
      if (initial?.persona) setPersonaId(initial.persona);
    } catch (e) {
      toast(`Stsenariylar yuklanmadi: ${e.message}`, "error");
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
      const data = await api.analyze(
        text,
        { tr: questionRef.current || "Jonli suhbat", uz: "" },
        "call",
        sc?.id || "",
        personaId,
        level || ""
      );
      const turn = {
        user: data.transcription || text,
        aylin: data.next_question_tr || "",
        aylin_uz: data.next_question_uz || "",
        hints: data.answer_hints || [],
        reply: data.model_answer_tr || "",
        note: data.positive_note_uz || "",
        level_score: data.level_score || "A1",
        mistakes: data.mistakes || [],
        phrases: data.useful_phrases || [],
        pronunciation_score: data.pronunciation_score,
        keyWords: data.key_words || [],
      };
      turnsRef.current = [...turnsRef.current, turn];
      setHistory([...turnsRef.current].reverse());
      questionRef.current = turn.aylin || questionRef.current;
      trackMission("grammar");
      let added = 0;
      turn.keyWords.forEach((word) => {
        if (vocab.add({ tr: word.tr, uz: word.uz, type: "word", source: "Rol o'yini" })) added += 1;
      });
      if (added > 0) trackMission("words");
      return turn;
    } catch (e) {
      toast(`Javob tahlil qilinmadi: ${e.message}`, "error");
      return null;
    }
  }, [level, personaId, vocab]);

  const onTurnWithSpeech = useCallback(
    async (text) => {
      const turn = await onTurn(text);
      const speech = turn ? [turn.reply, turn.aylin].filter(Boolean).join(" ") : "";
      if (speech && speakAsPersona) {
        callRef.current?.aiSpeakingChanged(true);
        try {
          await speakAsPersona(speech);
        } finally {
          callRef.current?.aiSpeakingChanged(false);
        }
      }
    },
    [onTurn, speakAsPersona]
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
    setShowUz(false);
    setStarting(true);
    setStage("call");
    questionRef.current = selected.opening_tr;
    secondsRef.current = 0;
    creditedRef.current = false;
    try {
      if (speakAsPersona) {
        callRef.current?.aiSpeakingChanged(true);
        await speakAsPersona(selected.opening_tr);
        if (sessionRef.current !== token) return;
        callRef.current?.aiSpeakingChanged(false);
      }
      await call.start();
    } catch (e) {
      call.end();
      if (sessionRef.current === token) {
        setStage("setup");
        toast(`Mikrofon ochilmadi: ${e.message}. Brauzerda ruxsat bering.`, "error");
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
      const message = e.message || "Hisobot yaratilmadi";
      setReportError(message);
      toast(message, "error");
    } finally {
      setReportLoading(false);
    }
  }, []);

  const finish = () => {
    creditTime();
    if (turnsRef.current.length) trackMission("call");
    sessionRef.current += 1;
    call.end();
    stopTTS?.();
    setShowUz(false);
    runReport();
  };

  const chooseScenario = (id) => {
    setScenarioId(id);
    const scenario = scenarios.find((item) => item.id === id);
    if (scenario?.persona) setPersonaId(scenario.persona);
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
    setShowUz(false);
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
        personas={personas}
        selected={scenarioId}
        personaId={personaId}
        onSelect={chooseScenario}
        onPersona={setPersonaId}
        onStart={startCall}
        onBack={leave}
        loading={loadingScenarios}
        starting={starting}
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
        playTTS={speakAsPersona}
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
      ? `Gapiring — ${selectedPersona.name} tinglaydi`
      : call.callState === "thinking"
        ? `${selectedPersona.name} o'ylayapti`
        : call.muted
          ? "Mikrofon o'chirilgan"
          : isSpeaking
            ? ""
            : starting
              ? "Ulanmoqda"
              : "Suhbat tayyor";
  const meta = STATUS[call.callState] || STATUS.idle;
  const orbMode = call.muted ? "muted" : call.callState === "idle" && starting ? "thinking" : call.callState;
  const waveMode = isSpeaking ? "speaking" : call.callState === "listening" ? "listening" : "idle";
  const latestPron = latest?.pronunciation_score;

  return (
    <div className="call-screen fixed inset-0 z-[80] flex flex-col overflow-hidden">
      <header className="relative z-20 flex items-center justify-between px-4 pb-2 pt-[max(14px,env(safe-area-inset-top))] sm:px-6">
        <button
          onClick={finish}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-100"
          aria-label="Qo'ng'iroqni tugatish"
        >
          <Icon name="x" size={16} />
        </button>

        <div className="pointer-events-none absolute left-1/2 top-[max(14px,env(safe-area-inset-top))] -translate-x-1/2 text-center">
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-zinc-600">Ovozli suhbat</p>
          <p className="mt-1 text-[11px] font-medium tabular-nums text-zinc-400">{fmt(call.seconds)}</p>
        </div>

        <div className={`flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 text-[10px] font-medium backdrop-blur-xl ${meta.text || "text-zinc-500"}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${meta.dot} ${call.callState !== "idle" ? "animate-pulse" : ""}`} />
          {meta.label}
        </div>
      </header>

      <div className="relative z-10 flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-5 py-4 text-center sm:px-8">
        <GlowingOrb mode={orbMode} />

        <h1 className="mt-6 text-[22px] font-semibold tracking-[-0.03em] text-zinc-50 sm:text-[24px]">
          {selectedPersona.name}
        </h1>
        <p className="mt-1 flex items-center gap-1.5 text-[11px] text-zinc-500">
          <span>{selectedPersona.role}</span>
          <span className="text-zinc-700">·</span>
          <span>{selected?.title_uz}</span>
          <span className="text-zinc-700">·</span>
          <span className="tabular-nums">{level || selected?.level}</span>
        </p>

        <Captions
          text={captionText}
          placeholder={placeholder}
          speaking={isSpeaking}
          className="mt-5 max-w-2xl"
          vocab={vocab}
          playTTS={speakAsPersona}
        />

        <div className="wave-shell mt-2 h-10 w-full max-w-md opacity-80">
          <Waveform getAnalyser={call.getAnalyser} active={call.callState === "listening" || isSpeaking} mode={waveMode} />
        </div>

        {latest && (
          <button
            type="button"
            onClick={() => setShowUz(true)}
            className="feedback-inline mt-2 flex w-full max-w-xl items-center gap-2.5 rounded-2xl border border-white/10 p-2.5 text-left backdrop-blur-xl transition hover:border-mint-300/20"
          >
            {latestPron != null && (
              <PronunciationRing score={latestPron} size={38} label="Talaffuz" showLabel={false} />
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-[8px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Grammatika tahlili
              </span>
              <span className="mt-0.5 block truncate text-[10px] font-medium text-zinc-200">
                {latest.mistakes?.[0]
                  ? `${latest.mistakes[0].wrong} → ${latest.mistakes[0].correct}`
                  : "Xato topilmadi"}
              </span>
              {latest.reply && (
                <span className="mt-0.5 block truncate text-[9px] text-zinc-500">Tabiiy: {latest.reply}</span>
              )}
            </span>
            <Icon name="chevronRight" size={12} className="shrink-0 text-zinc-600" />
          </button>
        )}

        <div className="mt-2 flex items-center gap-2 text-[10px] text-zinc-600">
          <Icon name="volume" size={12} />
          <span>{selectedPersona.voice_label || "Neural"} · tr-TR</span>
        </div>
      </div>

      {showUz && (
        <div className="fixed inset-x-3 bottom-[112px] z-30 mx-auto max-h-[52dvh] max-w-lg overflow-y-auto rounded-2xl call-sheet p-4 sm:inset-x-auto sm:left-1/2 sm:w-[440px] sm:-translate-x-1/2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-zinc-500">Tarjima va grammatika</p>
            <button
              onClick={() => setShowUz(false)}
              className="rounded-md p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
              aria-label="Yopish"
            >
              <Icon name="x" size={14} />
            </button>
          </div>

          <div className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
            <p className="text-[13px] font-medium leading-relaxed text-zinc-100">
              <ClickableText text={currentTr} context={currentUz} vocab={vocab} playTTS={speakAsPersona} />
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-500">{currentUz || "Tarjima tayyorlanmoqda"}</p>
          </div>

          {latest && (
            <div className="mt-3">
              <GrammarPanel
                mistakes={latest.mistakes || []}
                pronunciation={latest.pronunciation_score}
                transcription={latest.user}
                natural={latest.reply}
                keyWords={latest.keyWords || []}
                vocab={vocab}
                playTTS={speakAsPersona}
                compact
              />
            </div>
          )}

          <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">
            Shunday javob berishingiz mumkin
          </p>
          {currentHints.length === 0 ? (
            <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">
              Savolni tinglab, o&apos;z so&apos;zlaringiz bilan javob bering.
            </p>
          ) : (
            <ul className="mt-2 space-y-1.5">
              {currentHints.map((hint, index) => (
                <li
                  key={index}
                  className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
                >
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-[12px] font-medium leading-snug text-zinc-200">
                      <ClickableText text={hint.tr} context={hint.uz} vocab={vocab} playTTS={speakAsPersona} />
                    </p>
                    <p className="mt-0.5 text-[10px] leading-snug text-zinc-500">{hint.uz}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => speakAsPersona?.(hint.tr)}
                    className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
                    aria-label="Tinglash"
                  >
                    <Icon name="volume" size={13} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          {history.length > 0 && (
            <>
              <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Suhbat tarixi</p>
              <div className="mt-2 space-y-2">
                {history.slice(0, 3).map((turn, index) => (
                  <div key={index} className="space-y-1.5">
                    <p className="ml-auto max-w-[88%] rounded-lg rounded-br-sm border border-white/[0.07] bg-white/[0.05] px-2.5 py-1.5 text-left text-[11px] leading-relaxed text-zinc-300">
                      {turn.user}
                    </p>
                    {turn.aylin && (
                      <p className="mr-auto max-w-[88%] rounded-lg rounded-bl-sm border border-white/[0.05] bg-white/[0.02] px-2.5 py-1.5 text-left text-[11px] leading-relaxed text-zinc-500">
                        {turn.aylin}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      <div className="relative z-20 shrink-0">
        <CallDock
          muted={call.muted}
          onToggleMute={call.toggleMute}
          onEnd={finish}
          showTranslation={showUz}
          onToggleTranslation={() => setShowUz((value) => !value)}
        />
      </div>
    </div>
  );
}

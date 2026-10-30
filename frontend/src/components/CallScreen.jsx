import { useCallback, useEffect, useRef, useState } from "react";
import { useCall } from "../lib/useCall";
import { api } from "../lib/api";
import Waveform from "./Waveform";

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

export default function CallScreen({ onExit, playTTS, stopTTS }) {
  const [history, setHistory] = useState([]);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);
  const questionRef = useRef("");
  const callRef = useRef(null);

  
  const onTurn = useCallback(
    async (text) => {
      try {
        const a = await api.analyze(text, { tr: questionRef.current || "Jonli suhbat", uz: "" }, "call");
        setHistory((h) =>
          [
            {
              user: a.transcription || text,
              level_score: a.level_score,
              aylin: a.next_question_tr,
              reply: a.model_answer_tr,
              note: a.positive_note_uz,
              mistakes: a.mistakes || [],
            },
            ...h,
          ].slice(0, 12)
        );
      } catch (e) {
        setError(`Tahlilni bajara olmadi: ${e.message}`);
      }
    },
    []
  );

  const onTurnWithSpeech = useCallback(
    async (text) => {
      await onTurn(text);
      const last = historyRef.current[0];
      const speech = last ? [last.aylin, last.reply].filter(Boolean).join(" ") : "";
      questionRef.current = last?.aylin || questionRef.current;
      if (speech && playTTS) {
        callRef.current?.aiSpeakingChanged(true);
        await playTTS(speech);
        callRef.current?.aiSpeakingChanged(false);
      }
    },
    [onTurn, playTTS]
  );

  const historyRef = useRef([]);
  useEffect(() => {
    historyRef.current = history;
  }, [history]);

  const call = useCall({ onTurn: onTurnWithSpeech });
  callRef.current = call;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [history]);

  const begin = async () => {
    setError("");
    setStarted(true);
    try {
      await call.start();
      const firstQ = await api.question();
      questionRef.current = firstQ.tr;
      if (playTTS) {
        callRef.current?.aiSpeakingChanged(true);
        await playTTS(firstQ.tr);
        callRef.current?.aiSpeakingChanged(false);
      }
    } catch (e) {
      console.warn("start", e);
    }
  };

  const finish = () => {
    call.end();
    stopTTS?.();
    setStarted(false);
    onExit();
  };

  const status = STATUS_TEXT[call.callState] || "";
  const stateColors = {
    speaking: "text-emerald-500",
    thinking: "text-indigo-500",
    listening: "text-amber-500",
  };

  if (!started) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
        <div className="mb-6 grid h-28 w-28 place-items-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-5xl shadow-2xl shadow-emerald-500/30">
          📞
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
          Aylin Hoca bilan Jonli Qo'ng'iroq
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
          📞 Hands-free rejim: mikrofon uzluksiz eshitadi. Gapirib bo'lib{" "}
          <b>1.5 soniya</b> jim tursangiz — javobingiz avtomatik AI'ga yuboriladi. Xuddi telefon
          qilgandek suhbatni qo'ymasdan davom estiring!
        </p>
        <button
          onClick={begin}
          className="mt-8 rounded-full bg-gradient-to-r from-emerald-500 to-teal-600 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-emerald-500/30 transition hover:from-emerald-400 hover:to-teal-500"
        >
          📞 Qo'ng'iroqni boshlash
        </button>
        <button
          onClick={onExit}
          className="mt-4 text-sm font-medium text-slate-500 hover:underline dark:text-slate-400"
        >
          ← Simulyatorga qaytish
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-center">
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
        <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">Aylin Hoca 🇹🇷</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Jonli qo'ng'iroq · {fmt(call.seconds)}</p>
        <p className={`mt-2 text-sm font-semibold ${stateColors[call.callState] || ""}`}>{status}</p>
        <Waveform getAnalyser={call.getAnalyser} active={call.callState !== "thinking"} />
        {call.callState === "listening" && call.interim && (
          <p className="max-w-lg text-center text-sm italic text-indigo-500 dark:text-indigo-300">
            "{call.interim}…"
          </p>
        )}
        <button
          onClick={finish}
          className="mt-4 rounded-full bg-rose-600 px-10 py-3.5 text-base font-bold text-white shadow-xl shadow-rose-500/30 transition hover:bg-rose-500"
        >
          ⏹ Qo'ng'iroqni tugatish
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          ⚠️ {error}
        </p>
      )}

      <div ref={scrollRef} className="mt-6 max-h-[42vh] space-y-4 overflow-y-auto pr-1">
        {history.map((t, i) => (
          <div key={i} className="space-y-2">
            {t.mistakes.length > 0 && (
              <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 dark:border-amber-900/60 dark:bg-amber-950/30">
                <p className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                  Tahlil · daraja {t.level_score}
                </p>
                {t.mistakes.map((m, j) => {
                  const meta = TYPE_META[m.type] || TYPE_META.grammar;
                  return (
                    <div key={j} className="mt-2 text-sm">
                      <p className="text-rose-500 line-through">{meta.icon} {m.wrong}</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">✅ {m.correct}</p>
                      <p className="text-slate-600 dark:text-slate-300">💡 {m.explanation_uz}</p>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-indigo-600 px-4 py-2 text-sm text-white">
              🧑 {t.user}
            </div>
            {t.note && (
              <p className="text-center text-xs text-emerald-600 dark:text-emerald-400">👩‍🏫 {t.note}</p>
            )}
            <div className="max-w-[80%] rounded-2xl rounded-bl-sm border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              👩‍🏫 {t.aylin}
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-slate-600">
            Suhbat hali boshlanmadi — ozgina gapirib ko'ring 🎙️
          </p>
        )}
      </div>
    </div>
  );
}

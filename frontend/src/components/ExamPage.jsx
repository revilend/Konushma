import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api";
import { toast } from "../lib/toast";
import { useRecorder } from "../lib/useRecorder";
import { trackMission } from "../lib/missions";
import { getExamStages } from "../lib/exam";
import RecorderBar from "./RecorderBar";
import GrammarPanel from "./GrammarPanel";
import SaveButton from "./SaveButton";
import Icon from "./Icons";

const METRICS = [
  { key: "fluency", tr: "Akıcılık", uz: "Ravonlik", icon: "message", bar: "from-sky-400 to-cyan-200" },
  { key: "vocabulary", tr: "Kelime bilgisi", uz: "Lug'at boyligi", icon: "book", bar: "from-amber-400 to-yellow-200" },
  { key: "grammar", tr: "Dilbilgisi", uz: "Grammatika", icon: "sparkles", bar: "from-violet-400 to-fuchsia-200" },
];

const clampScore = (value) => Math.max(0, Math.min(100, Number(value) || 0));

function ScoreCard({ metric, value }) {
  return (
    <div className="surface rounded-2xl p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-[11px] font-semibold text-zinc-100">{metric.tr}</p>
          <p className="mt-0.5 text-[9px] text-zinc-600">{metric.uz}</p>
        </div>
        <span className="text-[24px] font-semibold tabular-nums tracking-[-0.04em] text-zinc-50">{value}</span>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${metric.bar} transition-all duration-700`}
          style={{ width: `${Math.max(4, value)}%` }}
        />
      </div>
      <p className="mt-1.5 text-[9px] text-zinc-600">100 ballik mezon</p>
    </div>
  );
}

export default function ExamPage({
  level = "A2",
  vocab,
  playTTS,
  stopTTS,
  onExit,
  onVocab,
}) {
  const stages = getExamStages(level);
  const [index, setIndex] = useState(0);
  const [turns, setTurns] = useState([]);
  const [analysis, setAnalysis] = useState(null);
  const [busy, setBusy] = useState(false);
  const [manualText, setManualText] = useState("");
  const [showManual, setShowManual] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const rec = useRecorder("tr-TR");
  const stage = stages[Math.min(index, stages.length - 1)];

  useEffect(() => {
    return () => stopTTS?.();
  }, [stopTTS]);

  const handleAnswer = useCallback(
    async (raw) => {
      const text = (raw || "").trim();
      if (!text) {
        toast("Javob topilmadi. Gapiring yoki matn yozib yuboring.", "error");
        return;
      }
      setBusy(true);
      try {
        const data = await api.analyze(
          text,
          { tr: stage.prompt_tr, uz: stage.prompt_uz },
          "exam",
          "tomer",
          "aylin",
          level
        );
        const turn = {
          user: data.transcription || text,
          aylin: "",
          reply: data.model_answer_tr || "",
          mistakes: data.mistakes || [],
          pronunciation_score: data.pronunciation_score,
          key_words: data.key_words || [],
        };
        setTurns((prev) => [...prev, turn]);
        setAnalysis(data);
        trackMission("grammar");
        let added = 0;
        (data.key_words || []).forEach((word) => {
          if (vocab.add({ tr: word.tr, uz: word.uz, type: "word", source: "TÖMER" })) added += 1;
        });
        if (added > 0) trackMission("words");
        if (data.model_answer_tr) playTTS?.(data.model_answer_tr);
      } catch (e) {
        toast(`Tahlil qilinmadi: ${e.message}`, "error");
      } finally {
        setBusy(false);
      }
    },
    [stage, level, vocab, playTTS]
  );

  const toggleRecord = useCallback(async () => {
    if (rec.recording) {
      const text = await rec.stop();
      if (text) await handleAnswer(text);
      else toast("Ovoz aniqlanmadi. Mikrofon ruxsatini tekshirib qayta urinib ko'ring.", "error");
    } else {
      setAnalysis(null);
      setShowManual(false);
      await rec.start();
      if (!rec.supported) setShowManual(true);
    }
  }, [rec, handleAnswer]);

  const submitManual = useCallback(async () => {
    const text = manualText.trim();
    if (!text) return;
    setManualText("");
    setShowManual(false);
    await handleAnswer(text);
  }, [manualText, handleAnswer]);

  const buildReport = useCallback(async () => {
    if (!turns.length) return;
    setReportOpen(true);
    setReportLoading(true);
    setReportError("");
    try {
      const data = await api.report({
        turns,
        mistakes: turns.flatMap((turn) => turn.mistakes || []),
        scenario: "tomer",
      });
      setReport(data);
    } catch (e) {
      setReportError(e.message || "Natija yaratilmadi");
      toast(`Natija yaratilmadi: ${e.message}`, "error");
    } finally {
      setReportLoading(false);
    }
  }, [turns]);

  const next = useCallback(async () => {
    if (!analysis) return;
    if (index < stages.length - 1) {
      stopTTS?.();
      rec.cleanup();
      setIndex((value) => value + 1);
      setAnalysis(null);
      setManualText("");
      setShowManual(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    await buildReport();
  }, [analysis, index, stages.length, rec, buildReport, stopTTS]);

  const restart = () => {
    stopTTS?.();
    rec.cleanup();
    setIndex(0);
    setTurns([]);
    setAnalysis(null);
    setBusy(false);
    setManualText("");
    setShowManual(false);
    setReportOpen(false);
    setReport(null);
    setReportError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const leave = () => {
    stopTTS?.();
    rec.cleanup();
    onExit?.();
  };

  if (reportOpen) {
    const scores = report?.scores || {};
    const fluency = clampScore(scores.fluency);
    const vocabulary = clampScore(scores.vocabulary);
    const grammar = clampScore(scores.grammar);
    const total = Math.round((fluency + vocabulary + grammar) / 3);

    if (reportLoading) {
      return (
        <div className="fade-up mx-auto max-w-3xl space-y-3">
          <div className="surface flex flex-col items-center rounded-3xl px-6 py-14 text-center">
            <span className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-600 border-t-mint-300" />
            <h1 className="mt-4 text-[17px] font-semibold text-zinc-100">TÖMER natijasi hisoblanmoqda</h1>
            <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-zinc-500">
              Uch bosqichdagi javoblaringiz ravonlik, lug&apos;at va grammatika bo&apos;yicha baholanmoqda.
            </p>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-3">
            {[0, 1, 2].map((item) => (
              <div key={item} className="h-24 animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />
            ))}
          </div>
        </div>
      );
    }

    if (reportError) {
      return (
        <div className="fade-up mx-auto max-w-lg">
          <div className="surface rounded-3xl px-6 py-10 text-center">
            <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400">
              <Icon name="alert" size={17} />
            </span>
            <h1 className="mt-4 text-[17px] font-semibold text-zinc-100">Natija yaratilmadi</h1>
            <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-zinc-500">{reportError}</p>
            <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
              <button onClick={buildReport} className="btn-primary inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-[11px] font-semibold">
                <Icon name="refresh" size={12} />
                Qayta urinish
              </button>
              <button onClick={leave} className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200">
                Studio
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (!report) return null;

    return (
      <div className="fade-up mx-auto max-w-3xl space-y-3">
        <section className="exam-hero relative overflow-hidden rounded-[28px] p-5 sm:p-6">
          <div className="relative flex flex-wrap items-center justify-between gap-5">
            <div className="min-w-0">
              <p className="eyebrow">TÖMER · Konuşma sınavı</p>
              <h1 className="mt-2 text-[25px] font-semibold tracking-[-0.04em] text-zinc-50">Sinov natijasi</h1>
              <p className="mt-1 text-[11px] text-zinc-500">3 bosqich · {level} darajasi</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="hero-pill">{report.cefr || level} CEFR</span>
                <span className="hero-pill">{report.source === "ai" ? "AI baholash" : "Lokal hisob"}</span>
              </div>
            </div>
            <div className="exam-score-ring">
              <strong>{total}</strong>
              <span>/ 100</span>
            </div>
          </div>
          {report.summary_uz && (
            <p className="relative mt-4 border-t border-white/[0.07] pt-3 text-[11px] leading-relaxed text-zinc-400">
              {report.summary_uz}
            </p>
          )}
        </section>

        <div className="grid gap-2.5 sm:grid-cols-3">
          {METRICS.map((metric) => (
            <ScoreCard
              key={metric.key}
              metric={metric}
              value={metric.key === "fluency" ? fluency : metric.key === "vocabulary" ? vocabulary : grammar}
            />
          ))}
        </div>

        {report.strengths_uz?.length > 0 && (
          <section className="surface rounded-2xl p-5">
            <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
              <Icon name="checkCircle" size={12} />
              Kuchli tomonlar
            </div>
            <ul className="mt-3 space-y-1.5">
              {report.strengths_uz.map((item, itemIndex) => (
                <li key={itemIndex} className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-400">
                  <Icon name="check" size={12} className="mt-0.5 shrink-0 text-mint-300" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="surface rounded-2xl p-5">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-[13px] font-medium text-zinc-200">Tuzatishlar</h2>
            <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] tabular-nums text-zinc-500">
              {report.mistakes?.length || 0}
            </span>
          </div>
          {!report.mistakes?.length ? (
            <p className="mt-3 rounded-xl border border-mint-300/15 bg-mint-300/[0.06] px-3 py-2.5 text-[11px] text-mint-100">
              Jiddiy xato topilmadi. Javoblaringiz aniq va tabiiy.
            </p>
          ) : (
            <ul className="mt-3 space-y-2">
              {report.mistakes.map((mistake, mistakeIndex) => (
                <li key={mistakeIndex} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] text-zinc-600 line-through">{mistake.wrong}</span>
                    <Icon name="arrowRight" size={10} className="text-zinc-600" />
                    <span className="text-[11px] font-medium text-mint-100">{mistake.correct}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => playTTS?.(mistake.correct)}
                        className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
                        title="To'g'ri gapni tinglash"
                        aria-label="To'g'ri gapni tinglash"
                      >
                        <Icon name="volume" size={12} />
                      </button>
                      <SaveButton
                        item={{
                          tr: mistake.correct,
                          uz: mistake.explanation_uz,
                          wrong: mistake.wrong,
                          type: mistake.type,
                          source: "TÖMER",
                        }}
                        vocab={vocab}
                        compact
                      />
                    </span>
                  </div>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">{mistake.explanation_uz}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="grid gap-2 sm:grid-cols-3">
          <button onClick={restart} className="btn-primary inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-[12px] font-semibold">
            <Icon name="rotate" size={13} />
            Yana imtihon
          </button>
          <button
            onClick={onVocab}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] font-medium text-zinc-300 transition hover:bg-white/[0.08]"
          >
            <Icon name="book" size={13} />
            Lug&apos;at daftari
          </button>
          <button
            onClick={leave}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] font-medium text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
          >
            Studio
          </button>
        </div>
      </div>
    );
  }

  const progress = ((index + 1) / stages.length) * 100;

  return (
    <div className="fade-up mx-auto max-w-4xl space-y-3">
      <button onClick={leave} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 transition hover:text-zinc-200">
        <Icon name="arrowLeft" size={14} />
        Studio
      </button>

      <section className="exam-hero relative overflow-hidden rounded-[28px] p-5 sm:p-6">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="hero-pill"><span className="h-1.5 w-1.5 rounded-full bg-sky-300" /> TÖMER</span>
              <span className="hero-pill">{level} CEFR</span>
              <span className="hero-pill">100 ballik</span>
            </div>
            <h1 className="mt-3 text-[26px] font-semibold tracking-[-0.04em] text-zinc-50 sm:text-[31px]">
              Konuşma sınavı <span className="text-aurora">simulyatsiyasi</span>
            </h1>
            <p className="mt-1.5 max-w-xl text-[11px] leading-relaxed text-zinc-400">
              Uch bosqichda savollarga jonli javob bering. Yakunda ravonlik, lug&apos;at va grammatika bo&apos;yicha 100 ballik natija olasiz.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-center">
            <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-600">Bosqich</p>
            <p className="mt-1 text-[24px] font-semibold leading-none tracking-[-0.04em] text-zinc-50">{index + 1}<span className="text-[12px] text-zinc-500">/{stages.length}</span></p>
          </div>
        </div>
        <div className="relative mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.08]">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-300 via-mint-300 to-amber-200 transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-[10px] tabular-nums text-zinc-500">{Math.round(progress)}%</span>
        </div>
        <div className="relative mt-3 grid grid-cols-3 gap-1.5">
          {stages.map((item, itemIndex) => (
            <div key={item.id} className={`rounded-lg border px-2 py-1.5 text-center text-[9px] font-medium ${
              itemIndex === index
                ? "border-sky-300/25 bg-sky-300/[0.08] text-sky-100"
                : itemIndex < index
                  ? "border-mint-300/15 bg-mint-300/[0.05] text-mint-200"
                  : "border-white/[0.06] bg-white/[0.02] text-zinc-600"
            }`}>
              {itemIndex + 1}. {item.label}
            </div>
          ))}
        </div>
      </section>

      <section className="surface relative overflow-hidden rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-sky-300/10 text-sky-200">
              <Icon name="graduation" size={14} />
            </span>
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-600">Aylin Hoca · imtihonchi</p>
              <p className="text-[11px] font-medium text-zinc-200">Savol {index + 1} / {stages.length}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => playTTS?.(stage.prompt_tr)}
            className="inline-flex items-center gap-1.5 rounded-xl border border-sky-300/15 bg-sky-300/[0.07] px-2.5 py-2 text-[10px] font-semibold text-sky-100 transition hover:bg-sky-300/[0.12]"
          >
            <Icon name="volume" size={13} />
            Tinglash
          </button>
        </div>
        <h2 className="mt-4 text-[20px] font-medium leading-[1.4] tracking-[-0.02em] text-zinc-50 sm:text-[24px]">
          {stage.prompt_tr}
        </h2>
        <p className="mt-2 text-[12px] leading-relaxed text-zinc-500">{stage.prompt_uz}</p>
        <p className="mt-3 flex items-center gap-1.5 text-[9px] leading-relaxed text-zinc-600">
          <Icon name="info" size={10} />
          Imtihon rejimi: javobni mikrofon orqali bering yoki matn sifatida yozib yuboring. Maslahat ko&apos;rsatilmaydi.
        </p>
      </section>

      {!analysis ? (
        <RecorderBar
          supported={rec.supported}
          recording={rec.recording}
          interim={rec.interim}
          seconds={rec.seconds}
          disabled={busy}
          getAnalyser={rec.getAnalyser}
          onToggle={toggleRecord}
          onSubmit={submitManual}
          manualText={manualText}
          setManualText={setManualText}
          showManual={showManual}
          setShowManual={setShowManual}
        />
      ) : (
        <div className="space-y-3">
          <GrammarPanel
            title="Javob tahlili"
            mistakes={analysis.mistakes || []}
            pronunciation={null}
            transcription={analysis.transcription}
            natural={analysis.model_answer_tr}
            keyWords={analysis.key_words || []}
            vocab={vocab}
            playTTS={playTTS}
          />
          <button
            onClick={next}
            disabled={busy}
            className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[13px] font-semibold disabled:opacity-40"
          >
            {index === stages.length - 1 ? "Natijani ko'rish" : "Keyingi bosqich"}
            <Icon name="arrowRight" size={14} />
          </button>
        </div>
      )}

      {busy && (
        <div className="surface flex items-center gap-2.5 rounded-2xl px-4 py-3 text-[11px] text-zinc-400">
          <span className="h-3.5 w-3.5 animate-spin rounded-full border border-zinc-500 border-t-sky-300" />
          Aylin Hoca javobingizni baholayapti
        </div>
      )}
    </div>
  );
}

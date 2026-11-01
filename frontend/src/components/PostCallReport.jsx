import SaveButton from "./SaveButton";
import Icon from "./Icons";

const METRICS = [
  { key: "fluency", label: "Ravonlik", icon: "message", bar: "from-sky-400 to-cyan-200" },
  { key: "vocabulary", label: "Lug'at boyligi", icon: "book", bar: "from-amber-400 to-yellow-200" },
  { key: "grammar", label: "Grammatika", icon: "sparkles", bar: "from-violet-400 to-fuchsia-200" },
  { key: "pronunciation", label: "Talaffuz", icon: "mic", bar: "from-mint-400 to-mint-200" },
];

const TYPE_LABEL = {
  grammar: "Grammatika",
  vocabulary: "Lug'at",
  false_friend: "Soxta do'st",
  pronunciation: "Talaffuz",
};

function ScoreBar({ metric, value }) {
  return (
    <div className="surface rounded-xl p-4">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-500">
          <Icon name={metric.icon} size={11} />
          {metric.label}
        </span>
        <span className="text-[15px] font-semibold tabular-nums text-zinc-100">{value}</span>
      </div>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${metric.bar} transition-all duration-700`}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
      <p className="mt-1.5 text-[9px] text-zinc-600">100 ballik tizim</p>
    </div>
  );
}

export default function PostCallReport({
  report,
  loading,
  error,
  onRetry,
  onRestart,
  onExit,
  onVocab,
  playTTS,
  vocab,
}) {
  if (loading) {
    return (
      <div className="fade-up mx-auto max-w-3xl space-y-3">
        <div className="surface flex flex-col items-center rounded-2xl px-6 py-14 text-center">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-600 border-t-zinc-100" />
          <h2 className="mt-4 text-[15px] font-medium text-zinc-200">Hisobot tayyorlanmoqda</h2>
          <p className="mt-1 max-w-sm text-[11px] leading-relaxed text-zinc-500">
            Suhbat tahlil qilinmoqda: ravonlik, lug&apos;at va grammatika baholanmoqda.
          </p>
        </div>
        <div className="grid gap-2.5 sm:grid-cols-4">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-24 animate-pulse rounded-xl border border-white/[0.05] bg-white/[0.02]" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="fade-up mx-auto max-w-lg">
        <div className="surface rounded-2xl px-6 py-10 text-center">
          <span className="mx-auto grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400">
            <Icon name="alert" size={17} />
          </span>
          <h2 className="mt-4 text-[15px] font-medium text-zinc-200">Hisobot yaratilmadi</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-zinc-500">{error}</p>
          <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
            <button
              onClick={onRetry}
              className="btn-primary inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-[11px] font-semibold"
            >
              <Icon name="refresh" size={12} />
              Qayta urinish
            </button>
            <button
              onClick={onExit}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2.5 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
            >
              Studio
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;
  const scores = report.scores || {};

  return (
    <div className="fade-up mx-auto max-w-3xl space-y-3">
      <section className="voice-hero rounded-[28px] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="eyebrow">Session report</p>
            <h1 className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-zinc-50">Suhbat natijasi</h1>
            <p className="mt-1 text-[11px] text-zinc-500">{report.scenario || "Aylin Hoca bilan suhbat"}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
            <p className="text-[9px] font-medium uppercase tracking-[0.14em] text-zinc-600">CEFR</p>
            <p className="mt-1 text-[30px] font-semibold leading-none tracking-[-0.04em] text-zinc-50">{report.cefr}</p>
            <p className="mt-1.5 text-[9px] text-zinc-600">
              {report.source === "ai" ? "AI tahlili" : "Lokal hisob"}
            </p>
          </div>
        </div>
        {report.summary_uz && (
          <p className="mt-4 border-t border-white/[0.06] pt-3 text-[12px] leading-relaxed text-zinc-400">
            {report.summary_uz}
          </p>
        )}
      </section>

      <div className="grid gap-2.5 sm:grid-cols-4">
        {METRICS.map((metric) => (
          <ScoreBar key={metric.key} metric={metric} value={scores[metric.key] ?? 0} />
        ))}
      </div>

      {report.strengths_uz?.length > 0 && (
        <section className="surface rounded-2xl p-5">
          <h3 className="text-[13px] font-medium text-zinc-200">Kuchli tomonlar</h3>
          <ul className="mt-2.5 space-y-1.5">
            {report.strengths_uz.map((strength, index) => (
              <li key={index} className="flex items-start gap-2 text-[11px] leading-relaxed text-zinc-400">
                <Icon name="check" size={12} className="mt-0.5 shrink-0 text-zinc-300" />
                {strength}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-medium text-zinc-200">Tuzatish kerak bo&apos;lgan xatolar</h3>
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] tabular-nums text-zinc-500">
            {report.mistakes?.length || 0}
          </span>
        </div>
        {!report.mistakes?.length ? (
          <div className="mt-3 flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[11px] text-zinc-400">
            <Icon name="checkCircle" size={13} className="text-zinc-300" />
            Jiddiy xato topilmadi — javob aniq va tabiiy.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {report.mistakes.map((mistake, index) => (
              <li key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">
                    {TYPE_LABEL[mistake.type] || "Grammatika"}
                  </span>
                  <span className="text-[12px] text-zinc-600 line-through">{mistake.wrong}</span>
                  <Icon name="arrowRight" size={10} className="text-zinc-700" />
                  <span className="text-[12px] font-medium text-zinc-100">{mistake.correct}</span>
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
                        source: report.scenario,
                      }}
                      vocab={vocab}
                      compact
                    />
                  </span>
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{mistake.explanation_uz}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {(report.phrases || []).length > 0 && (
        <section className="surface rounded-2xl p-5">
          <h3 className="text-[13px] font-medium text-zinc-200">Foydali iboralar</h3>
          <p className="mt-0.5 text-[10px] text-zinc-600">Suhbatda ishlatish mumkin bo&apos;lgan tabiiy iboralar</p>
          <ul className="mt-3 space-y-1.5">
            {report.phrases.map((phrase, index) => (
              <li
                key={index}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-zinc-200">{phrase.tr}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{phrase.uz}</p>
                </div>
                <button
                  type="button"
                  onClick={() => playTTS?.(phrase.tr)}
                  className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
                  title="Tinglash"
                  aria-label="Tinglash"
                >
                  <Icon name="volume" size={13} />
                </button>
                <SaveButton
                  item={{ tr: phrase.tr, uz: phrase.uz, type: "phrase", source: report.scenario }}
                  vocab={vocab}
                  compact
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          onClick={onRestart}
          className="btn-primary inline-flex items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-[12px] font-semibold"
        >
          <Icon name="rotate" size={13} />
          Yana qo&apos;ng&apos;iroq
        </button>
        <button
          onClick={onVocab}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 text-[12px] font-medium text-zinc-300 transition hover:bg-white/[0.08]"
        >
          <Icon name="book" size={13} />
          Lug&apos;atni ochish
        </button>
        <button
          onClick={onExit}
          className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-[12px] font-medium text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-300"
        >
          Studio
        </button>
      </div>
    </div>
  );
}

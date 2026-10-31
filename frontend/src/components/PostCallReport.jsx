import SaveButton from "./SaveButton";

const METRICS = [
  { key: "fluency", label: "Ravonlik", icon: "💬", bar: "from-emerald-500 to-teal-500" },
  { key: "vocabulary", label: "Lug'at boyligi", icon: "📚", bar: "from-sky-500 to-indigo-500" },
  { key: "grammar", label: "Grammatika", icon: "🧩", bar: "from-amber-500 to-orange-500" },
];

const TYPE_LABEL = {
  grammar: "Grammatika",
  vocabulary: "Lug'at",
  false_friend: "Soxta do'st",
};

function ScoreBar({ metric, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
          {metric.icon} {metric.label}
        </span>
        <span className="text-lg font-extrabold text-slate-900 dark:text-white">{value}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${metric.bar} transition-all duration-700`}
          style={{ width: `${Math.max(4, Math.min(100, value))}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">100 ballik tizim</p>
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
      <div className="space-y-4">
        <div className="flex flex-col items-center rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <span className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <h2 className="mt-4 text-lg font-extrabold text-slate-900 dark:text-white">
            Aylin Hoca hisobotni tayyorlayapti…
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Suhbat tahlil qilinmoqda: ravonlik, lug&apos;at va grammatika baholanmoqda.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      </div>
    );
  }

  if (error && !report) {
    return (
      <div className="rounded-3xl border border-rose-300 bg-rose-50 p-6 text-center dark:border-rose-900 dark:bg-rose-950/40">
        <p className="text-2xl">😕</p>
        <h2 className="mt-2 font-extrabold text-rose-900 dark:text-rose-200">Hisobot yaratilmadi</h2>
        <p className="mt-1 text-sm text-rose-800 dark:text-rose-300">{error}</p>
        <div className="mt-5 flex flex-col justify-center gap-2 sm:flex-row">
          <button
            onClick={onRetry}
            className="rounded-xl bg-rose-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-500"
          >
            🔄 Qayta urinish
          </button>
          <button
            onClick={onExit}
            className="rounded-xl border border-rose-300 px-5 py-2.5 text-sm font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            ← Simulyator
          </button>
        </div>
      </div>
    );
  }

  if (!report) return null;
  const scores = report.scores || {};

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 via-violet-600 to-fuchsia-600 p-6 text-white shadow-2xl shadow-indigo-500/25 sm:p-8">
        <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur">
              📊 Qo&apos;ng&apos;iroq hisoboti
            </span>
            <h2 className="mt-3 text-2xl font-extrabold">Natijalar va baholash</h2>
            <p className="mt-1 text-sm text-white/80">{report.scenario || "Aylin Hoca bilan suhbat"}</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur">
            <p className="text-[10px] font-bold uppercase tracking-wide text-white/70">CEFR daraja</p>
            <p className="text-4xl font-black leading-none">{report.cefr}</p>
            <p className="mt-1 text-[10px] text-white/70">
              {report.source === "ai" ? "AI tahlili" : "Lokal hisob"}
            </p>
          </div>
        </div>
        {report.summary_uz && (
          <p className="relative mt-4 max-w-2xl text-sm leading-relaxed text-white/90">{report.summary_uz}</p>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {METRICS.map((m) => (
          <ScoreBar key={m.key} metric={m} value={scores[m.key] ?? 0} />
        ))}
      </div>

      {report.strengths_uz?.length > 0 && (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <h3 className="font-extrabold text-emerald-900 dark:text-emerald-200">💪 Kuchli tomonlaringiz</h3>
          <ul className="mt-3 space-y-2">
            {report.strengths_uz.map((s, i) => (
              <li key={i} className="flex gap-2 text-sm text-emerald-900 dark:text-emerald-200">
                <span>✅</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white">
            ❌ Tuzatish kerak bo&apos;lgan xatolar
          </h3>
          <span className="rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold text-rose-600 dark:bg-rose-950/50 dark:text-rose-300">
            {report.mistakes?.length || 0} ta
          </span>
        </div>
        {!report.mistakes?.length ? (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
            🎉 Jiddiy xato topilmadi — ajoyib natija!
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {report.mistakes.map((m, i) => (
              <li key={i} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {TYPE_LABEL[m.type] || "Grammatika"}
                  </span>
                  <span className="text-sm text-rose-500 line-through">{m.wrong}</span>
                  <span className="text-slate-400">→</span>
                  <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{m.correct}</span>
                  <span className="ml-auto">
                    <SaveButton
                      item={{
                        tr: m.correct,
                        uz: m.explanation_uz,
                        wrong: m.wrong,
                        type: m.type,
                        source: report.scenario,
                      }}
                      vocab={vocab}
                      compact
                    />
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">💡 {m.explanation_uz}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-indigo-200 bg-indigo-50/70 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
        <h3 className="font-extrabold text-indigo-900 dark:text-indigo-200">✨ Foydali iboralar</h3>
        <p className="text-xs text-indigo-700/70 dark:text-indigo-300/70">
          Suhbatda ishlatish mumkin bo&apos;lgan tabiiy turkcha iboralar
        </p>
        <ul className="mt-3 space-y-2">
          {(report.phrases || []).map((p, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200/70 bg-white/70 p-3 dark:border-indigo-900/60 dark:bg-slate-900/60"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-slate-900 dark:text-white">{p.tr}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">🇺🇿 {p.uz}</p>
              </div>
              <button
                type="button"
                onClick={() => playTTS?.(p.tr)}
                className="rounded-full bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                title="Tinglash"
              >
                🔊
              </button>
              <SaveButton item={{ tr: p.tr, uz: p.uz, type: "phrase", source: report.scenario }} vocab={vocab} compact />
            </li>
          ))}
        </ul>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <button
          onClick={onRestart}
          className="rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500"
        >
          🔁 Yana qo&apos;ng&apos;iroq
        </button>
        <button
          onClick={onVocab}
          className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-amber-500/20 hover:from-amber-400 hover:to-orange-400"
        >
          📚 Lug&apos;atni ochish
        </button>
        <button
          onClick={onExit}
          className="rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Simulyator
        </button>
      </div>
    </div>
  );
}

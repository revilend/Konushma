import SaveButton from "./SaveButton";

const TYPE_META = {
  grammar: { icon: "🧩", label: "Grammatika", cls: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
  vocabulary: { icon: "📚", label: "Lug'at", cls: "bg-sky-500/10 text-sky-600 dark:text-sky-400" },
  false_friend: { icon: "⚠️", label: "Soxta do'st!", cls: "bg-rose-500/10 text-rose-600 dark:text-rose-400" },
};

function levelColor(level = "") {
  if (level.startsWith("B")) return "from-emerald-500 to-teal-500";
  if (level.startsWith("A2")) return "from-amber-500 to-orange-500";
  return "from-rose-500 to-red-500";
}

export default function ResultPanel({ analysis, speaking, onPlayAnswer, onNext, busy, vocab, playTTS }) {
  if (!analysis) return null;
  const { level_score, mistakes, model_answer_tr, positive_note_uz, useful_phrases } = analysis;

  return (
    <div className="animate-[fadeIn_.35s_ease] space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className={`rounded-3xl bg-gradient-to-br ${levelColor(level_score)} p-5 text-white shadow-lg`}>
          <p className="text-xs font-semibold uppercase tracking-wide opacity-80">Umumiy baho</p>
          <p className="mt-1 text-4xl font-extrabold">{level_score}</p>
          <p className="mt-1 text-xs opacity-80">CEFR daraja ko'rsatkichi</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:col-span-2 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            💬 Sen gapirgan javob
          </p>
          <p className="mt-1 text-sm text-slate-800 dark:text-slate-300">{analysis.transcription}</p>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="font-bold text-slate-900 dark:text-white">❌ Xatolaring tahlili ({mistakes.length})</h3>
        {mistakes.length === 0 ? (
          <p className="mt-3 text-sm text-emerald-600 dark:text-emerald-400">
            🎉 Xatoyam yo'q! Ajoyib javob, davom!
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {mistakes.map((m, i) => {
              const meta = TYPE_META[m.type] || TYPE_META.grammar;
              return (
                <li key={i} className="rounded-2xl border border-slate-200 p-4 dark:border-slate-800">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${meta.cls}`}>
                      {meta.icon} {meta.label}
                    </span>
                    <span className="text-sm text-rose-500 line-through">{m.wrong}</span>
                    <span className="text-sm text-slate-400">→</span>
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{m.correct}</span>
                    <span className="ml-auto">
                      <SaveButton
                        item={{ tr: m.correct, uz: m.explanation_uz, wrong: m.wrong, type: m.type, source: "Simulyator" }}
                        vocab={vocab}
                        compact
                      />
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">🇺🇿 {m.explanation_uz}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-5 sm:p-6 dark:border-emerald-900/60 dark:bg-emerald-950/30">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h3 className="font-bold text-emerald-800 dark:text-emerald-300">✅ Qanday aytish kerak edi</h3>
          <div className="flex flex-wrap items-center gap-2">
            <SaveButton
              item={{ tr: model_answer_tr, uz: "Namuna javob", type: "sentence", source: "Simulyator" }}
              vocab={vocab}
            />
            <button
              onClick={onPlayAnswer}
              disabled={speaking}
              className="rounded-full bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-500 disabled:opacity-50"
            >
              {speaking ? "🔊…" : "🔊 Tinglash"}
            </button>
          </div>
        </div>
        <p className="mt-2 text-lg font-medium leading-relaxed text-emerald-950 dark:text-emerald-200">
          {model_answer_tr}
        </p>
        {positive_note_uz && (
          <p className="mt-3 border-t border-emerald-200/70 pt-3 text-sm text-emerald-800 dark:border-emerald-900/60 dark:text-emerald-300">
            👩‍🏫 {positive_note_uz}
          </p>
        )}
      </div>

      {useful_phrases?.length > 0 && (
        <div className="rounded-3xl border border-indigo-200 bg-indigo-50/60 p-5 dark:border-indigo-900/60 dark:bg-indigo-950/30">
          <h3 className="font-bold text-indigo-900 dark:text-indigo-200">✨ Foydali iboralar</h3>
          <ul className="mt-3 space-y-2">
            {useful_phrases.map((p, i) => (
              <li
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-200/70 bg-white/70 p-3 dark:border-indigo-900/60 dark:bg-slate-900/60"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{p.tr}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">🇺🇿 {p.uz}</p>
                </div>
                <button
                  onClick={() => playTTS?.(p.tr)}
                  className="rounded-full bg-indigo-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-indigo-500"
                >
                  🔊
                </button>
                <SaveButton item={{ tr: p.tr, uz: p.uz, type: "phrase", source: "Simulyator" }} vocab={vocab} compact />
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={busy}
        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-fuchsia-500 disabled:opacity-40"
      >
        ⏭️ Keyingi savolga o'tish
      </button>
    </div>
  );
}

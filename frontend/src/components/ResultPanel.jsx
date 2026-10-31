import SaveButton from "./SaveButton";
import Icon from "./Icons";

const TYPE_META = {
  grammar: { icon: "sparkles", label: "Grammatika" },
  vocabulary: { icon: "book", label: "Lug'at" },
  false_friend: { icon: "alert", label: "Soxta do'st" },
};

export default function ResultPanel({ analysis, speaking, onPlayAnswer, onNext, busy, vocab, playTTS }) {
  if (!analysis) return null;
  const { level_score, mistakes, model_answer_tr, positive_note_uz, useful_phrases } = analysis;

  return (
    <div className="fade-up space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="surface rounded-2xl p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">Umumiy baho</p>
          <p className="mt-2 text-[36px] font-semibold leading-none tracking-[-0.04em] text-zinc-50">
            {level_score}
          </p>
          <p className="mt-2 text-[10px] text-zinc-600">CEFR daraja ko&apos;rsatkichi</p>
        </div>

        <div className="surface rounded-2xl p-5 sm:col-span-2">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            <Icon name="message" size={12} />
            Siz gapirgan javob
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-zinc-300">{analysis.transcription}</p>
        </div>
      </div>

      <div className="surface rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-[13px] font-medium text-zinc-200">Xatolar tahlili</h3>
          <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[10px] tabular-nums text-zinc-500">
            {mistakes.length}
          </span>
        </div>

        {mistakes.length === 0 ? (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5 text-[12px] text-zinc-400">
            <Icon name="checkCircle" size={14} className="shrink-0 text-zinc-300" />
            Xato topilmadi — javob aniq va tabiiy.
          </div>
        ) : (
          <ul className="mt-3 space-y-2">
            {mistakes.map((mistake, index) => {
              const meta = TYPE_META[mistake.type] || TYPE_META.grammar;
              return (
                <li key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-3.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.03] px-1.5 py-0.5 text-[9px] font-medium text-zinc-500">
                      <Icon name={meta.icon} size={10} />
                      {meta.label}
                    </span>
                    <span className="text-[12px] text-zinc-500 line-through">{mistake.wrong}</span>
                    <Icon name="arrowRight" size={11} className="text-zinc-600" />
                    <span className="text-[12px] font-medium text-zinc-100">{mistake.correct}</span>
                    <span className="ml-auto">
                      <SaveButton
                        item={{
                          tr: mistake.correct,
                          uz: mistake.explanation_uz,
                          wrong: mistake.wrong,
                          type: mistake.type,
                          source: "Simulyator",
                        }}
                        vocab={vocab}
                        compact
                      />
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-zinc-500">{mistake.explanation_uz}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="surface rounded-2xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            <Icon name="checkCircle" size={12} />
            Qanday aytish kerak edi
          </div>
          <div className="flex items-center gap-2">
            <SaveButton
              item={{ tr: model_answer_tr, uz: "Namuna javob", type: "sentence", source: "Simulyator" }}
              vocab={vocab}
              compact
            />
            <button
              onClick={onPlayAnswer}
              disabled={speaking}
              className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-medium text-zinc-400 transition hover:text-zinc-100 disabled:opacity-50"
            >
              <Icon name="volume" size={11} />
              {speaking ? "O'qilyapti" : "Tinglash"}
            </button>
          </div>
        </div>
        <p className="mt-3 text-[15px] font-medium leading-relaxed text-zinc-100">{model_answer_tr}</p>
        {positive_note_uz && (
          <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-zinc-500">
            {positive_note_uz}
          </p>
        )}
      </div>

      {useful_phrases?.length > 0 && (
        <div className="surface rounded-2xl p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            <Icon name="sparkles" size={12} />
            Foydali iboralar
          </div>
          <ul className="mt-3 space-y-1.5">
            {useful_phrases.map((phrase, index) => (
              <li
                key={index}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.02] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-zinc-200">{phrase.tr}</p>
                  <p className="mt-0.5 text-[10px] text-zinc-500">{phrase.uz}</p>
                </div>
                <button
                  onClick={() => playTTS?.(phrase.tr)}
                  className="rounded-md p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
                  aria-label="Tinglash"
                >
                  <Icon name="volume" size={13} />
                </button>
                <SaveButton item={{ tr: phrase.tr, uz: phrase.uz, type: "phrase", source: "Simulyator" }} vocab={vocab} compact />
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={onNext}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-[13px] font-semibold text-zinc-900 transition hover:bg-white disabled:opacity-40"
      >
        Keyingi savol
        <Icon name="arrowRight" size={14} />
      </button>
    </div>
  );
}

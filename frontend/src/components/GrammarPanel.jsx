import SaveButton from "./SaveButton";
import PronunciationRing from "./PronunciationRing";
import Icon from "./Icons";

const TYPE_META = {
  grammar: { icon: "sparkles", label: "Grammatika", accent: "sky" },
  vocabulary: { icon: "book", label: "Lug'at", accent: "amber" },
  false_friend: { icon: "alert", label: "Soxta do'st", accent: "rose" },
};

export default function GrammarPanel({
  mistakes = [],
  pronunciation = null,
  transcription = "",
  vocab,
  compact = false,
  title = "Grammatika tahlilchisi",
}) {
  const score = pronunciation == null ? null : Number(pronunciation);
  const count = mistakes.length;

  return (
    <section className={`surface overflow-hidden ${compact ? "rounded-2xl" : "rounded-3xl"}`}>
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] bg-white/[0.025] px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-mint-300/10 text-mint-200">
            <Icon name="sparkles" size={13} />
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-[12px] font-semibold text-zinc-100">{title}</h3>
            <p className="text-[9px] text-zinc-500">Har bir gap bo&apos;yicha aniq tuzatish</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] font-medium text-zinc-400">
          {count === 0 ? "Toza" : `${count} xato`}
        </span>
      </div>

      <div className={`grid gap-4 p-4 sm:p-5 ${compact ? "" : "sm:grid-cols-[auto_1fr]"}`}>
        {score != null && (
          <div className="flex items-center gap-3 sm:flex-col sm:gap-2">
            <PronunciationRing score={score} size={compact ? 68 : 82} />
            <p className="text-[9px] leading-relaxed text-zinc-600 sm:max-w-[92px] sm:text-center">
              Transkript asosida taxminiy baho
            </p>
          </div>
        )}

        <div className="min-w-0">
          {transcription && !compact && (
            <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2">
              <p className="text-[9px] uppercase tracking-[0.12em] text-zinc-600">Siz aytgan gap</p>
              <p className="mt-0.5 text-[12px] leading-relaxed text-zinc-300">{transcription}</p>
            </div>
          )}

          {count === 0 ? (
            <div className={`${transcription && !compact ? "mt-2" : ""} flex items-start gap-2 rounded-xl border border-mint-300/15 bg-mint-300/[0.06] px-3 py-2.5`}>
              <Icon name="checkCircle" size={14} className="mt-0.5 shrink-0 text-mint-300" />
              <div>
                <p className="text-[11px] font-medium text-mint-100">Grammatik xato topilmadi</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-zinc-500">
                  Jumlalar tabiiy. Keyingi javobda yangi iboralarni sinab ko&apos;ring.
                </p>
              </div>
            </div>
          ) : (
            <ul className={`${transcription && !compact ? "mt-2" : ""} space-y-2`}>
              {mistakes.slice(0, compact ? 2 : 8).map((mistake, index) => {
                const meta = TYPE_META[mistake.type] || TYPE_META.grammar;
                return (
                  <li key={index} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className={`type-chip type-chip-${meta.accent}`}>
                        <Icon name={meta.icon} size={9} />
                        {meta.label}
                      </span>
                      <span className="text-[11px] text-rose-200/70 line-through">{mistake.wrong}</span>
                      <Icon name="arrowRight" size={10} className="text-zinc-600" />
                      <span className="text-[11px] font-semibold text-mint-100">{mistake.correct}</span>
                      <span className="ml-auto">
                        <SaveButton
                          item={{
                            tr: mistake.correct,
                            uz: mistake.explanation_uz,
                            wrong: mistake.wrong,
                            type: mistake.type,
                            source: "Grammatika tahlilchisi",
                          }}
                          vocab={vocab}
                          compact
                        />
                      </span>
                    </div>
                    <p className="mt-1.5 text-[10px] leading-relaxed text-zinc-500">{mistake.explanation_uz}</p>
                  </li>
                );
              })}
            </ul>
          )}

          {count > 0 && (
            <p className="mt-2 flex items-center gap-1.5 text-[9px] text-zinc-600">
              <Icon name="info" size={10} />
              Tuzatishni bosing va lug&apos;atga saqlang.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

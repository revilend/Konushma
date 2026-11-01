import SaveButton from "./SaveButton";
import GrammarPanel from "./GrammarPanel";
import PronunciationRing from "./PronunciationRing";
import ClickableText from "./ClickableText";
import Icon from "./Icons";

export default function ResultPanel({ analysis, speaking, onPlayAnswer, onNext, busy, vocab, playTTS }) {
  if (!analysis) return null;
  const {
    level_score,
    mistakes = [],
    model_answer_tr,
    positive_note_uz,
    useful_phrases = [],
    transcription = "",
    pronunciation_score,
    key_words = [],
  } = analysis;
  const pronunciation = pronunciation_score ?? 0;

  return (
    <div className="fade-up space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="surface relative overflow-hidden rounded-3xl p-5">
          <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-mint-300/10 blur-2xl" />
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">Umumiy daraja</p>
          <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.05em] text-zinc-50">
            {level_score}
          </p>
          <p className="mt-2 text-[10px] text-zinc-500">CEFR ko&apos;rsatkichi</p>
        </div>

        <div className="surface flex items-center gap-3 rounded-3xl p-4">
          <PronunciationRing score={pronunciation} size={68} />
          <div>
            <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">Talaffuz</p>
            <p className="mt-1 text-[13px] font-medium text-zinc-100">
              {pronunciation >= 85 ? "Juda aniq" : pronunciation >= 70 ? "Yaxshi" : "Mashq kerak"}
            </p>
            <p className="mt-2 text-[9px] leading-relaxed text-zinc-600">Transkript asosida taxminiy</p>
          </div>
        </div>

        <div className="surface relative overflow-hidden rounded-3xl p-5">
          <div className="pointer-events-none absolute -right-8 -bottom-10 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl" />
          <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">Tuzatishlar</p>
          <p className="mt-2 text-[40px] font-semibold leading-none tracking-[-0.05em] text-zinc-50">
            {mistakes.length}
          </p>
          <p className="mt-2 text-[10px] text-zinc-500">
            {mistakes.length === 0 ? "Xatosiz javob" : "Grammatika tahlilida"}
          </p>
        </div>
      </div>

      <GrammarPanel
        mistakes={mistakes}
        pronunciation={pronunciation}
        transcription={transcription}
        keyWords={key_words}
        vocab={vocab}
        playTTS={playTTS}
      />

      <div className="surface rounded-3xl p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-mint-200/80">
            <Icon name="checkCircle" size={12} />
            Tabiiy jaranglashi
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
              className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.045] px-2.5 py-1.5 text-[10px] font-medium text-zinc-300 transition hover:bg-white/[0.08] disabled:opacity-50"
            >
              <Icon name="volume" size={11} />
              {speaking ? "O'qilyapti" : "Tinglash"}
            </button>
          </div>
        </div>
        <p className="mt-1 text-[10px] text-zinc-600">Turklar buni shunday aytadi</p>
        <p className="mt-2 text-[16px] font-medium leading-relaxed text-zinc-100">
          <ClickableText text={model_answer_tr} vocab={vocab} playTTS={playTTS} />
        </p>
        {positive_note_uz && (
          <p className="mt-3 flex items-start gap-2 border-t border-white/[0.06] pt-3 text-[11px] leading-relaxed text-zinc-500">
            <Icon name="sparkles" size={12} className="mt-0.5 shrink-0 text-amber-200/70" />
            {positive_note_uz}
          </p>
        )}
      </div>

      {useful_phrases.length > 0 && (
        <div className="surface rounded-3xl p-5">
          <div className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
            <Icon name="sparkles" size={12} />
            Foydali iboralar
          </div>
          <ul className="mt-3 space-y-1.5">
            {useful_phrases.map((phrase, index) => (
              <li
                key={index}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium text-zinc-200">
                    <ClickableText text={phrase.tr} context={phrase.uz} vocab={vocab} playTTS={playTTS} />
                  </p>
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
        className="btn-primary flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[13px] font-semibold disabled:opacity-40"
      >
        Keyingi savol
        <Icon name="arrowRight" size={14} />
      </button>
    </div>
  );
}

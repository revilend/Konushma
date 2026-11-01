import Icon, { LogoMark } from "./Icons";
import ClickableText from "./ClickableText";

export default function QuestionCard({ question, speaking, onPlay, vocab, playTTS }) {
  if (!question) {
    return (
      <div className="surface animate-pulse rounded-3xl p-6 sm:p-7">
        <div className="h-3 w-28 rounded bg-white/[0.06]" />
        <div className="mt-5 h-6 w-4/5 rounded bg-white/[0.05]" />
        <div className="mt-2 h-4 w-3/5 rounded bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <section className="question-card surface relative overflow-hidden rounded-3xl p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full bg-mint-300/[0.08] blur-3xl" />
      <div className="relative flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-lime-200 via-mint-300 to-teal-300 text-emerald-950 shadow-[0_8px_22px_-10px_rgba(110,231,183,.7)]">
          <LogoMark className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-semibold tracking-tight text-zinc-100">Aylin Hoca</p>
          <p className="text-[10px] text-zinc-500">Konuşma sınavı · savol</p>
        </div>
        <span className="ml-auto hidden rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[9px] font-medium text-zinc-500 sm:inline-flex">
          Turkchani bosib tarjima
        </span>
        <button
          onClick={onPlay}
          disabled={speaking}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-mint-300/15 bg-mint-300/[0.07] px-2.5 py-2 text-[10px] font-semibold text-mint-100 transition hover:bg-mint-300/[0.12] disabled:opacity-50"
        >
          <Icon name="volume" size={13} />
          <span className="hidden sm:inline">{speaking ? "O'qilyapti" : "Tinglash"}</span>
        </button>
      </div>

      <p className="relative mt-5 text-balance text-[21px] font-medium leading-[1.38] tracking-[-0.02em] text-zinc-50 sm:text-[25px]">
        <ClickableText text={question.tr} context={question.uz} vocab={vocab} playTTS={playTTS} />
      </p>
      <p className="relative mt-2 text-[13px] leading-relaxed text-zinc-500">{question.uz}</p>

      <div className="relative mt-4 flex items-center gap-1.5 border-t border-white/[0.055] pt-3 text-[9px] text-zinc-600">
        <Icon name="languages" size={11} />
        Turkcha so&apos;zni bosing — tarjima, misol va talaffuz darhol chiqadi.
      </div>
    </section>
  );
}

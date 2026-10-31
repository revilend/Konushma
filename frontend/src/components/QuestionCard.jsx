import Icon, { LogoMark } from "./Icons";

export default function QuestionCard({ question, speaking, onPlay }) {
  if (!question) {
    return (
      <div className="surface animate-pulse rounded-2xl p-6 sm:p-7">
        <div className="h-3 w-28 rounded bg-white/[0.06]" />
        <div className="mt-5 h-6 w-4/5 rounded bg-white/[0.05]" />
        <div className="mt-2 h-4 w-3/5 rounded bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <section className="surface rounded-2xl p-5 sm:p-7">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300">
          <LogoMark className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-[12px] font-medium tracking-tight text-zinc-200">Aylin Hoca</p>
          <p className="text-[10px] text-zinc-500">Konuşma sınavı · savol</p>
        </div>
        <button
          onClick={onPlay}
          disabled={speaking}
          className="ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-100 disabled:opacity-50"
        >
          <Icon name="volume" size={13} />
          <span className="hidden sm:inline">{speaking ? "O'qilyapti" : "Tinglash"}</span>
        </button>
      </div>

      <p className="mt-5 text-balance text-[21px] font-medium leading-[1.35] tracking-[-0.02em] text-zinc-50 sm:text-[24px]">
        {question.tr}
      </p>
      <p className="mt-2 text-[13px] leading-relaxed text-zinc-500">{question.uz}</p>
    </section>
  );
}

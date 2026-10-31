import Waveform from "./Waveform";
import Icon from "./Icons";

const fmt = (s) =>
  `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function RecorderBar({
  supported,
  recording,
  interim,
  seconds,
  disabled,
  getAnalyser,
  onToggle,
  onSubmit,
  manualText,
  setManualText,
  showManual,
  setShowManual,
}) {
  return (
    <section className="surface mt-3 rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <button
          onClick={onToggle}
          disabled={disabled}
          title={recording ? "To'xtatish" : "Gapirishni boshlash"}
          aria-label={recording ? "Yozishni to'xtatish" : "Gapirishni boshlash"}
          className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-full text-zinc-900 transition disabled:cursor-not-allowed disabled:opacity-40 ${
            recording ? "mic-pulse bg-white" : "bg-zinc-100 hover:bg-white"
          }`}
        >
          <Icon name={recording ? "square" : "mic"} size={recording ? 18 : 22} strokeWidth={recording ? 2 : 1.8} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2.5">
            <span className="text-[20px] font-semibold tabular-nums tracking-tight text-zinc-100">
              {fmt(seconds)}
            </span>
            <span className="truncate text-[11px] text-zinc-500">
              {recording
                ? "Yozib olinmoqda"
                : supported
                  ? "Mikrofon tayyor"
                  : "Ovoz aniqlanmaydi — matn kiriting"}
            </span>
          </div>
          <div className="mt-1 h-12 opacity-70">
            <Waveform getAnalyser={getAnalyser} active={recording} mode={recording ? "listening" : "idle"} />
          </div>
          {recording && interim && (
            <p className="mt-1 line-clamp-2 text-[12px] italic text-zinc-400">{interim}…</p>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={disabled || recording}
          className="w-full shrink-0 rounded-lg border border-white/10 bg-white/[0.06] px-4 py-2.5 text-[12px] font-medium text-zinc-200 transition hover:bg-white/[0.1] disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
        >
          Javobni yuborish
        </button>
      </div>

      {showManual ? (
        <div className="mt-4 border-t border-white/[0.06] pt-4">
          <label className="mb-2 block text-[11px] font-medium text-zinc-500">
            Mikrofon ishlamasa, javobingizni turkchada yozing
          </label>
          <textarea
            value={manualText}
            onChange={(event) => setManualText(event.target.value)}
            rows={2}
            placeholder="Ben daha yeni Türkçe öğrenmeye başladım ama çok istiyorum..."
            className="w-full resize-none rounded-lg border border-white/10 bg-zinc-950/50 px-3 py-2.5 text-[13px] text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-white/20"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => onSubmit()}
              disabled={!manualText.trim() || disabled}
              className="rounded-lg bg-zinc-100 px-3.5 py-2 text-[11px] font-semibold text-zinc-900 transition hover:bg-white disabled:opacity-40"
            >
              Yuborish
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowManual(true)}
          className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 transition hover:text-zinc-300"
        >
          <Icon name="file" size={12} />
          Yozib yuborish
        </button>
      )}
    </section>
  );
}

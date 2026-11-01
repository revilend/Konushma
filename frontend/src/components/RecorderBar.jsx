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
    <section className="surface mt-3 overflow-hidden rounded-3xl">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <button
          onClick={onToggle}
          disabled={disabled}
          title={recording ? "To'xtatish" : "Gapirishni boshlash"}
          aria-label={recording ? "Yozishni to'xtatish" : "Gapirishni boshlash"}
          className={`relative grid h-16 w-16 shrink-0 place-items-center rounded-full text-emerald-950 transition disabled:cursor-not-allowed disabled:opacity-40 ${
            recording
              ? "mic-pulse bg-gradient-to-br from-rose-300 to-orange-300 shadow-[0_12px_34px_-12px_rgba(251,113,133,.65)]"
              : "bg-gradient-to-br from-lime-200 via-mint-300 to-teal-300 shadow-[0_12px_34px_-12px_rgba(110,231,183,.65)] hover:brightness-105"
          }`}
        >
          <Icon name={recording ? "square" : "mic"} size={recording ? 18 : 22} strokeWidth={recording ? 2 : 1.8} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2.5">
            <span className={`text-[21px] font-semibold tabular-nums tracking-tight ${recording ? "text-rose-100" : "text-zinc-100"}`}>
              {fmt(seconds)}
            </span>
            <span className="truncate text-[11px] text-zinc-500">
              {recording
                ? "Jonli yozib olinmoqda"
                : supported
                  ? "Mikrofon tayyor · gapirishni boshlang"
                  : "Ovoz aniqlanmaydi — matn kiriting"}
            </span>
            {recording && <span className="ml-auto h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-rose-300" />}
          </div>
          <div className="mt-1 h-12">
            <Waveform getAnalyser={getAnalyser} active={recording} mode={recording ? "listening" : "idle"} />
          </div>
          {recording && interim && (
            <p className="mt-1 line-clamp-2 text-[12px] italic text-mint-100/80">{interim}…</p>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={disabled || recording}
          className="btn-primary w-full shrink-0 rounded-xl px-4 py-2.5 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-35 sm:w-auto"
        >
          Javobni yuborish
        </button>
      </div>

      {showManual ? (
        <div className="border-t border-white/[0.06] bg-white/[0.015] px-5 pb-5 pt-4 sm:px-6">
          <label className="mb-2 block text-[11px] font-medium text-zinc-500">
            Mikrofon ishlamasa, javobingizni turkchada yozing
          </label>
          <textarea
            value={manualText}
            onChange={(event) => setManualText(event.target.value)}
            rows={2}
            placeholder="Ben daha yeni Türkçe öğrenmeye başladım ama çok istiyorum..."
            className="w-full resize-none rounded-xl border border-white/10 bg-zinc-950/45 px-3 py-2.5 text-[13px] text-zinc-100 outline-none transition placeholder:text-zinc-600 focus:border-mint-300/35"
          />
          <div className="mt-2 flex justify-end">
            <button
              onClick={() => onSubmit()}
              disabled={!manualText.trim() || disabled}
              className="btn-primary rounded-lg px-3.5 py-2 text-[11px] font-semibold disabled:opacity-40"
            >
              Yuborish
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowManual(true)}
          className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.05] py-2.5 text-[10px] font-medium text-zinc-600 transition hover:bg-white/[0.02] hover:text-zinc-300"
        >
          <Icon name="file" size={11} />
          Yozib yuborish
        </button>
      )}
    </section>
  );
}

import Waveform from "./Waveform";

const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

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
  const hasText = Boolean(manualText.trim());

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-emerald-500/5 sm:p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col items-center gap-5 sm:flex-row">
        <button
          onClick={onToggle}
          disabled={disabled}
          title={recording ? "To'xtatish" : "Gapirishni boshlash"}
          className={`relative grid h-20 w-20 shrink-0 place-items-center rounded-full text-3xl text-white transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
            recording
              ? "mic-pulse bg-gradient-to-br from-rose-500 to-red-600"
              : "bg-gradient-to-br from-indigo-500 to-fuchsia-600 hover:scale-105"
          }`}
        >
          {recording ? "⏹" : "🎙️"}
        </button>

        <div className="flex-1">
          <div className="flex items-baseline gap-3">
            <span className={`text-2xl font-extrabold tabular-nums ${recording ? "text-rose-500" : "text-slate-300 dark:text-slate-600"}`}>
              {fmt(seconds)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {recording ? "Yozib olinmoqda…" : supported ? "Mikrofon tayyor" : "Brauzer ovozni tanimaydi — matn kiriting"}
            </span>
          </div>
          <Waveform getAnalyser={getAnalyser} active={recording} mode={recording ? "listening" : "idle"} />
          {recording && interim && (
            <p className="italic text-sm text-indigo-500 dark:text-indigo-300">{interim}…</p>
          )}
        </div>

        <button
          onClick={onSubmit}
          disabled={disabled || recording}
          className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:from-indigo-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
        >
          ✅ Gapirishni tugatish
        </button>
      </div>

      {showManual ? (
        <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
          <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
            Mikrofon ishlamasa javobingni yozib yubor — turkchada:
          </label>
          <textarea
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
            rows={2}
            placeholder="Ben daha yeni turkce ogrenmeye basladim ama cok istiyorum..."
            className="w-full resize-none rounded-xl border border-slate-300 bg-transparent px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 dark:border-slate-700 dark:text-white"
          />
        </div>
      ) : (
        <button
          onClick={() => setShowManual(true)}
          className="mt-3 block text-xs font-medium text-indigo-500 hover:underline dark:text-indigo-400"
        >
          📝 Yozib yuborish (mikrofon ishlamasa)
        </button>
      )}
    </div>
  );
}

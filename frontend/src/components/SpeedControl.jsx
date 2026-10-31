const SPEEDS = [
  { value: 0.8, label: "0.8x", hint: "Sekin" },
  { value: 1.0, label: "1.0x", hint: "Normal" },
  { value: 1.2, label: "1.2x", hint: "Tez" },
];

export default function SpeedControl({ value = 1, onChange, compact = false }) {
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/80 p-0.5 dark:border-slate-700 dark:bg-slate-900/80 ${
        compact ? "text-[10px]" : "text-[11px]"
      }`}
      title="Aylin Hocaning gapirish tezligi"
    >
      <span className="pl-2 pr-1 font-semibold text-slate-400">🐢</span>
      {SPEEDS.map((s) => (
        <button
          key={s.value}
          type="button"
          onClick={() => onChange?.(s.value)}
          title={s.hint}
          className={`rounded-full px-2 py-1 font-bold transition ${
            Number(value) === s.value
              ? "bg-indigo-600 text-white shadow"
              : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
          }`}
        >
          {s.label}
        </button>
      ))}
      <span className="pl-1 pr-2 font-semibold text-slate-400">🐇</span>
    </div>
  );
}

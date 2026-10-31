const SPEEDS = [
  { value: 0.8, label: "0.8×", hint: "Sekin" },
  { value: 1.0, label: "1.0×", hint: "Normal" },
  { value: 1.2, label: "1.2×", hint: "Tez" },
];

export default function SpeedControl({ value = 1, onChange, compact = false }) {
  return (
    <div
      className={`inline-flex items-center gap-0.5 rounded-lg border border-white/10 bg-white/[0.03] p-0.5 ${
        compact ? "text-[10px]" : "text-[11px]"
      }`}
      title="Aylin Hocaning gapirish tezligi"
      role="group"
      aria-label="Ovoz tezligi"
    >
      {SPEEDS.map((speed) => (
        <button
          key={speed.value}
          type="button"
          onClick={() => onChange?.(speed.value)}
          title={speed.hint}
          aria-pressed={Number(value) === speed.value}
          className={`rounded-md px-2 py-1 font-medium tabular-nums transition ${
            Number(value) === speed.value
              ? "bg-zinc-100 text-zinc-900"
              : "text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300"
          }`}
        >
          {speed.label}
        </button>
      ))}
    </div>
  );
}

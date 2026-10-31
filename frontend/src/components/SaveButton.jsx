export default function SaveButton({ item, vocab, compact = false }) {
  if (!vocab) return null;
  const saved = vocab.has(item.tr);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        if (!saved) vocab.add(item);
      }}
      title={saved ? "Lug'atda bor" : "Lug'atga saqlash"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-full font-bold transition ${
        compact ? "px-2 py-1 text-[10px]" : "px-2.5 py-1.5 text-xs"
      } ${
        saved
          ? "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300"
          : "border border-amber-300 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400 dark:hover:bg-amber-950/40"
      }`}
    >
      {saved ? "⭐ Saqlangan" : "⭐ Saqlash"}
    </button>
  );
}

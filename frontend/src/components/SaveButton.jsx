import Icon from "./Icons";

export default function SaveButton({ item, vocab, compact = false }) {
  if (!vocab) return null;
  const saved = vocab.has(item.tr);
  return (
    <button
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (!saved) vocab.add(item);
      }}
      title={saved ? "Lug'atda bor" : "Lug'atga saqlash"}
      className={`inline-flex shrink-0 items-center gap-1 rounded-md border font-medium transition ${
        compact ? "px-1.5 py-1 text-[9px]" : "px-2.5 py-1.5 text-[10px]"
      } ${
        saved
          ? "border-zinc-100 bg-zinc-100 text-zinc-900"
          : "border-white/10 bg-white/[0.03] text-zinc-500 hover:border-white/20 hover:text-zinc-200"
      }`}
    >
      <Icon name={saved ? "bookmarkCheck" : "bookmark"} size={compact ? 10 : 12} />
      {saved ? "Saqlangan" : "Saqlash"}
    </button>
  );
}

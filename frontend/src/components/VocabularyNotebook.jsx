import Icon from "./Icons";

const TYPE_LABEL = {
  word: "So'z",
  phrase: "Ibora",
  sentence: "Gap",
  grammar: "Tuzatish",
  vocabulary: "Lug'at",
  false_friend: "Soxta do'st",
};

export default function VocabularyNotebook({ vocab, onOpen }) {
  const items = vocab.items.slice(0, 4);

  return (
    <section className="notebook-card surface overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-amber-300/10 text-amber-200">
            <Icon name="book" size={13} />
          </span>
          <div>
            <h3 className="text-[12px] font-semibold text-zinc-100">Lug&apos;at daftari</h3>
            <p className="text-[9px] text-zinc-500">Suhbatdan saqlangan so&apos;zlar</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[9px] tabular-nums text-zinc-400">
          {vocab.count}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="px-4 py-4">
          <p className="text-[10px] leading-relaxed text-zinc-500">
            Suhbatdagi turkcha so&apos;zni bosing yoki tahlil kartasidagi yangi so&apos;zni saqlang — u shu daftarda qoladi.
          </p>
        </div>
      ) : (
        <ul className="divide-y divide-white/[0.045]">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2.5 px-4 py-2.5">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-200/70" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium text-zinc-200">{item.tr}</p>
                <p className="truncate text-[9px] text-zinc-500">{item.uz || TYPE_LABEL[item.type] || "Ma'no saqlanmagan"}</p>
              </div>
              <span className="shrink-0 text-[8px] uppercase tracking-[0.1em] text-zinc-600">
                {TYPE_LABEL[item.type] || "So'z"}
              </span>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onOpen}
        className="flex w-full items-center justify-center gap-1.5 border-t border-white/[0.055] py-2.5 text-[10px] font-medium text-zinc-500 transition hover:bg-white/[0.025] hover:text-zinc-200"
      >
        <Icon name="book" size={11} />
        Butun daftarni ochish
        <Icon name="arrowRight" size={10} />
      </button>
    </section>
  );
}

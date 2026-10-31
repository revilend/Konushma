import { useMemo, useState } from "react";
import Icon from "./Icons";

const TYPE_META = {
  grammar: { icon: "sparkles", label: "Grammatika" },
  vocabulary: { icon: "book", label: "Lug'at" },
  false_friend: { icon: "alert", label: "Soxta do'st" },
  phrase: { icon: "message", label: "Ibora" },
  sentence: { icon: "file", label: "Gap" },
};

export default function VocabularyPage({ vocab, playTTS, onBack }) {
  const [query, setQuery] = useState("");
  const [review, setReview] = useState(false);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const items = vocab.items;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.tr.toLowerCase().includes(q) || (item.uz || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const current = items[index] || items[0] || null;

  if (!items.length) {
    return (
      <div className="fade-up mx-auto max-w-2xl">
        <div className="surface rounded-2xl px-6 py-14 text-center sm:px-10">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-xl border border-white/10 bg-white/[0.04] text-zinc-400">
            <Icon name="book" size={20} />
          </span>
          <h1 className="mt-4 text-[18px] font-semibold tracking-tight text-zinc-100">Lug&apos;at hali bo&apos;sh</h1>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-zinc-500">
            Qo&apos;ng&apos;iroq yoki simulyator davomida Aylin Hoca tuzatgan so&apos;zlar va yangi iboralar
            yonidagi <span className="text-zinc-300">Saqlash</span> tugmasini bosing — ular shu yerda to&apos;planadi.
          </p>
          <button
            onClick={onBack}
            className="mt-6 rounded-lg bg-zinc-100 px-4 py-2.5 text-[12px] font-semibold text-zinc-900 transition hover:bg-white"
          >
            Mashqni boshlash
          </button>
        </div>
      </div>
    );
  }

  if (review && current) {
    const meta = TYPE_META[current.type] || TYPE_META.phrase;
    return (
      <div className="fade-up mx-auto max-w-2xl space-y-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setReview(false);
              setRevealed(false);
            }}
            className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 transition hover:text-zinc-200"
          >
            <Icon name="arrowLeft" size={14} />
            Ro&apos;yxat
          </button>
          <span className="text-[10px] tabular-nums text-zinc-600">
            {Math.min(index + 1, items.length)} / {items.length}
          </span>
        </div>

        <div className="surface flex min-h-[340px] flex-col items-center justify-center rounded-2xl px-6 py-10 text-center sm:px-10">
          <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 text-[9px] font-medium text-zinc-500">
            <Icon name={meta.icon} size={10} />
            {meta.label}
          </span>
          <p className="mt-6 max-w-lg text-balance text-[23px] font-medium leading-snug tracking-[-0.025em] text-zinc-50">
            {current.tr}
          </p>
          {current.wrong && (
            <p className="mt-2 text-[12px] text-zinc-600 line-through">{current.wrong}</p>
          )}

          <div className="mt-5 flex min-h-[48px] w-full max-w-md items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.02] px-4 py-3">
            {revealed ? (
              <p className="text-[13px] leading-relaxed text-zinc-300">
                {current.uz || "Tarjima kiritilmagan"}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-600">Tarjimani ko&apos;rish uchun tugmani bosing</p>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setRevealed((value) => !value)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.09]"
            >
              <Icon name={revealed ? "eyeOff" : "eye"} size={13} />
              {revealed ? "Yashirish" : "Javobni ko'rsatish"}
            </button>
            <button
              onClick={() => playTTS?.(current.tr)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.05] px-3.5 py-2 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.09]"
            >
              <Icon name="volume" size={13} />
              Tinglash
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              setIndex((value) => (value - 1 + items.length) % items.length);
              setRevealed(false);
            }}
            className="rounded-lg border border-white/10 bg-white/[0.03] py-3 text-[12px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            Oldingi
          </button>
          <button
            onClick={() => {
              setIndex((value) => (value + 1) % items.length);
              setRevealed(false);
            }}
            className="rounded-lg bg-zinc-100 py-3 text-[12px] font-semibold text-zinc-900 transition hover:bg-white"
          >
            Keyingi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-up space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="eyebrow">Vocabulary</p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.035em] text-zinc-50">Lug&apos;at</h1>
          <p className="mt-1 text-[11px] text-zinc-500">{items.length} ta yozuv · takrorlashga tayyor</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[11px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            Studio
          </button>
          <button
            onClick={() => {
              setReview(true);
              setIndex(0);
              setRevealed(false);
            }}
            className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-100 px-3.5 py-2 text-[11px] font-semibold text-zinc-900 transition hover:bg-white"
          >
            <Icon name="rotate" size={12} />
            Takrorlash
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 focus-within:border-white/20">
          <Icon name="search" size={14} className="shrink-0 text-zinc-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Turkcha yoki o'zbekcha qidirish"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded p-0.5 text-zinc-600 transition hover:text-zinc-300"
              aria-label="Qidiruvni tozalash"
            >
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="surface rounded-2xl px-6 py-10 text-center">
          <Icon name="search" size={20} className="mx-auto text-zinc-600" />
          <p className="mt-3 text-[12px] text-zinc-500">“{query}” bo&apos;yicha hech narsa topilmadi.</p>
        </div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.phrase;
            return (
              <li key={item.id} className="surface flex flex-wrap items-center gap-2 rounded-xl px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-zinc-100">{item.tr}</p>
                    <span className="inline-flex items-center gap-1 rounded border border-white/[0.08] bg-white/[0.02] px-1.5 py-0.5 text-[9px] text-zinc-600">
                      <Icon name={meta.icon} size={9} />
                      {meta.label}
                    </span>
                    {item.source && <span className="truncate text-[9px] text-zinc-600">· {item.source}</span>}
                  </div>
                  {item.uz && <p className="mt-1 text-[11px] text-zinc-500">{item.uz}</p>}
                  {item.wrong && <p className="mt-0.5 text-[10px] text-zinc-600 line-through">{item.wrong}</p>}
                </div>
                <button
                  onClick={() => playTTS?.(item.tr)}
                  className="rounded-md border border-white/[0.08] p-2 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200"
                  title="Tinglash"
                  aria-label="Tinglash"
                >
                  <Icon name="volume" size={13} />
                </button>
                <button
                  onClick={() => vocab.remove(item.id)}
                  className="rounded-md border border-white/[0.08] p-2 text-zinc-600 transition hover:border-white/15 hover:bg-white/[0.05] hover:text-zinc-300"
                  title="O'chirish"
                  aria-label="O'chirish"
                >
                  <Icon name="trash" size={13} />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex justify-center pt-2">
        <button
          onClick={() => {
            if (window.confirm("Barcha saqlangan so'zlarni o'chirishni xohlaysizmi?")) vocab.clear();
          }}
          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-600 transition hover:text-zinc-400"
        >
          <Icon name="trash" size={11} />
          Hammasini tozalash
        </button>
      </div>
    </div>
  );
}

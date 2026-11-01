import { useMemo, useState } from "react";
import Icon from "./Icons";
import { trackMission } from "../lib/missions";

const TYPE_META = {
  grammar: { icon: "sparkles", label: "Grammatika", accent: "sky" },
  vocabulary: { icon: "book", label: "Lug'at", accent: "amber" },
  false_friend: { icon: "alert", label: "Soxta do'st", accent: "rose" },
  phrase: { icon: "message", label: "Ibora", accent: "mint" },
  sentence: { icon: "file", label: "Gap", accent: "sky" },
  word: { icon: "languages", label: "So'z", accent: "mint" },
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
        <div className="surface rounded-3xl px-6 py-14 text-center sm:px-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-200/20 to-mint-300/10 text-amber-100">
            <Icon name="book" size={22} />
          </span>
          <h1 className="mt-4 text-[20px] font-semibold tracking-tight text-zinc-100">Lug&apos;at hali bo&apos;sh</h1>
          <p className="mx-auto mt-2 max-w-md text-[12px] leading-relaxed text-zinc-500">
            Suhbatdagi turkcha so&apos;zni bosing yoki tuzatish yonidagi saqlash tugmasini bosing. So&apos;zlar
            shu yerda to&apos;planadi va flashcardlarda takrorlanadi.
          </p>
          <button onClick={onBack} className="btn-primary mt-6 rounded-xl px-4 py-2.5 text-[12px] font-semibold">
            Mashqni boshlash
          </button>
        </div>
      </div>
    );
  }

  if (review && current) {
    const meta = TYPE_META[current.type] || TYPE_META.phrase;
    const go = (direction) => {
      setIndex((value) => (value + direction + items.length) % items.length);
      setRevealed(false);
      trackMission("review");
    };

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
            Lug&apos;at
          </button>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-amber-300/15 bg-amber-300/[0.07] px-2.5 py-1 text-[9px] font-semibold text-amber-100">
              Flashcard
            </span>
            <span className="text-[10px] tabular-nums text-zinc-600">
              {Math.min(index + 1, items.length)} / {items.length}
            </span>
          </div>
        </div>

        <div className="flashcard-shell rounded-[28px] p-1">
          <div className="surface flex min-h-[350px] flex-col items-center justify-center rounded-[24px] px-6 py-10 text-center sm:px-10">
            <span className={`type-chip type-chip-${meta.accent}`}>
              <Icon name={meta.icon} size={10} />
              {meta.label}
            </span>
            <p className="mt-6 max-w-lg text-balance text-[28px] font-semibold leading-snug tracking-[-0.035em] text-zinc-50">
              {current.tr}
            </p>
            {current.wrong && (
              <p className="mt-2 text-[12px] text-rose-200/50 line-through">{current.wrong}</p>
            )}

            <div className="mt-6 flex min-h-[64px] w-full max-w-md items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025] px-4 py-3">
              {revealed ? (
                <p className="text-[14px] leading-relaxed text-mint-100">{current.uz || "Tarjima kiritilmagan"}</p>
              ) : (
                <p className="text-[11px] text-zinc-600">Tarjimani ko&apos;rish uchun kartani oching</p>
              )}
            </div>

            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => {
                  if (!revealed) trackMission("review");
                  setRevealed((value) => !value);
                }}
                className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-[11px] font-semibold"
              >
                <Icon name={revealed ? "eyeOff" : "eye"} size={13} />
                {revealed ? "Yashirish" : "Kartani ochish"}
              </button>
              <button
                onClick={() => playTTS?.(current.tr)}
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.045] px-3.5 py-2 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.08]"
              >
                <Icon name="volume" size={13} />
                Tinglash
              </button>
            </div>
            <div className="mt-4 flex items-center gap-1">
              {items.slice(0, 12).map((item, itemIndex) => (
                <span
                  key={item.id}
                  className={`h-1 rounded-full transition-all ${
                    itemIndex === Math.min(index, 11) ? "w-5 bg-mint-300" : "w-1 bg-white/15"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => go(-1)}
            className="rounded-xl border border-white/10 bg-white/[0.03] py-3 text-[12px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
          >
            Oldingi
          </button>
          <button onClick={() => go(1)} className="btn-primary rounded-xl py-3 text-[12px] font-semibold">
            Keyingi karta
          </button>
        </div>
      </div>
    );
  }

  const startReview = () => {
    setReview(true);
    setIndex(0);
    setRevealed(false);
    trackMission("review");
  };

  return (
    <div className="fade-up mx-auto max-w-4xl space-y-4">
      <section className="vocab-hero relative overflow-hidden rounded-[28px] p-5 sm:p-6">
        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="hero-pill"><span className="h-1.5 w-1.5 rounded-full bg-amber-300" /> Smart lug&apos;at</span>
              <span className="hero-pill">{items.length} ta yozuv</span>
            </div>
            <h1 className="mt-3 text-[27px] font-semibold tracking-[-0.04em] text-zinc-50">So&apos;z boyligingiz</h1>
            <p className="mt-1 max-w-md text-[11px] leading-relaxed text-zinc-400">
              Saqlangan so&apos;zlar, tuzatishlar va iboralar. Flashcard bilan takrorlab, xotirada mustahkamlang.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2.5 text-[11px] font-medium text-zinc-300 transition hover:bg-white/[0.08]"
            >
              Studio
            </button>
            <button onClick={startReview} className="btn-primary inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2.5 text-[11px] font-semibold">
              <Icon name="rotate" size={12} />
              Flashcard
            </button>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 focus-within:border-mint-300/30">
          <Icon name="search" size={14} className="shrink-0 text-zinc-600" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Turkcha yoki o'zbekcha qidirish"
            className="min-w-0 flex-1 bg-transparent text-[12px] text-zinc-200 outline-none placeholder:text-zinc-600"
          />
          {query && (
            <button onClick={() => setQuery("")} className="rounded p-0.5 text-zinc-600 transition hover:text-zinc-300" aria-label="Qidiruvni tozalash">
              <Icon name="x" size={12} />
            </button>
          )}
        </div>
        <p className="px-1 text-[10px] text-zinc-600">{filtered.length} ta natija</p>
      </div>

      {filtered.length === 0 ? (
        <div className="surface rounded-3xl px-6 py-10 text-center">
          <Icon name="search" size={20} className="mx-auto text-zinc-600" />
          <p className="mt-3 text-[12px] text-zinc-500">“{query}” bo&apos;yicha hech narsa topilmadi.</p>
        </div>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {filtered.map((item) => {
            const meta = TYPE_META[item.type] || TYPE_META.phrase;
            return (
              <li key={item.id} className="surface flex flex-wrap items-center gap-2 rounded-2xl px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[13px] font-medium text-zinc-100">{item.tr}</p>
                    <span className={`type-chip type-chip-${meta.accent}`}>
                      <Icon name={meta.icon} size={9} />
                      {meta.label}
                    </span>
                  </div>
                  {item.uz && <p className="mt-1 text-[11px] text-zinc-500">{item.uz}</p>}
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    {item.wrong && <p className="text-[10px] text-rose-200/45 line-through">{item.wrong}</p>}
                    {item.source && <span className="truncate text-[9px] text-zinc-600">· {item.source}</span>}
                  </div>
                </div>
                <button
                  onClick={() => playTTS?.(item.tr)}
                  className="rounded-lg border border-white/[0.08] p-2 text-zinc-500 transition hover:bg-mint-300/[0.08] hover:text-mint-100"
                  title="Tinglash"
                  aria-label="Tinglash"
                >
                  <Icon name="volume" size={13} />
                </button>
                <button
                  onClick={() => vocab.remove(item.id)}
                  className="rounded-lg border border-white/[0.08] p-2 text-zinc-600 transition hover:border-rose-300/20 hover:bg-rose-300/[0.06] hover:text-rose-200"
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
          className="inline-flex items-center gap-1.5 text-[10px] font-medium text-zinc-600 transition hover:text-rose-200"
        >
          <Icon name="trash" size={11} />
          Hammasini tozalash
        </button>
      </div>
    </div>
  );
}

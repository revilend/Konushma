import { useMemo, useState } from "react";

const TYPE_META = {
  grammar: { icon: "🧩", label: "Grammatika" },
  vocabulary: { icon: "📚", label: "Lug'at" },
  false_friend: { icon: "⚠️", label: "Soxta do'st" },
  phrase: { icon: "✨", label: "Ibora" },
  sentence: { icon: "💬", label: "Gap" },
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
      (x) => x.tr.toLowerCase().includes(q) || (x.uz || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const current = items[index] || items[0] || null;

  if (!items.length) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <p className="text-5xl">📚</p>
          <h2 className="mt-4 text-xl font-extrabold text-slate-900 dark:text-white">
            Lug&apos;atingiz hali bo&apos;sh
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
            Qo&apos;ng&apos;iroq yoki simulyator davomida Aylin Hoca tuzatgan so&apos;zlar va yangi
            iboralar yonidagi <b>⭐ Saqlash</b> tugmasini bosing — ular shu yerda to&apos;planadi.
          </p>
          <button
            onClick={onBack}
            className="mt-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/25"
          >
            💬 Mashqni boshlash
          </button>
        </div>
      </div>
    );
  }

  if (review && current) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              setReview(false);
              setRevealed(false);
            }}
            className="text-sm font-bold text-slate-500 hover:underline dark:text-slate-400"
          >
            ← Ro&apos;yxatga qaytish
          </button>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300">
            {Math.min(index + 1, items.length)} / {items.length}
          </span>
        </div>

        <div className="rounded-3xl bg-gradient-to-br from-amber-400 via-orange-500 to-rose-500 p-1 shadow-2xl shadow-orange-500/20">
          <div className="flex min-h-[300px] flex-col items-center justify-center rounded-[22px] bg-white p-8 text-center dark:bg-slate-950">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {TYPE_META[current.type]?.icon || "✨"} {TYPE_META[current.type]?.label || "Ibora"}
            </span>
            <p className="mt-6 text-2xl font-extrabold leading-snug text-slate-900 dark:text-white">
              {current.tr}
            </p>
            {current.wrong && (
              <p className="mt-2 text-sm text-rose-400 line-through">{current.wrong}</p>
            )}
            {revealed ? (
              <p className="mt-5 rounded-2xl bg-emerald-50 px-4 py-3 text-base text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                🇺🇿 {current.uz || "Tarjima kiritilmagan"}
              </p>
            ) : (
              <p className="mt-5 text-sm text-slate-400 dark:text-slate-500">
                Tarjimani ko&apos;rish uchun tugmani bosing
              </p>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              <button
                onClick={() => playTTS?.(current.tr)}
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-bold text-white hover:bg-indigo-500"
              >
                🔊 Tinglash
              </button>
              <button
                onClick={() => setRevealed((v) => !v)}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                {revealed ? "🙈 Yashirish" : "👁️ Javobni ko'rsatish"}
              </button>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => {
              setIndex((i) => (i - 1 + items.length) % items.length);
              setRevealed(false);
            }}
            className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            ← Oldingi
          </button>
          <button
            onClick={() => {
              setIndex((i) => (i + 1) % items.length);
              setRevealed(false);
            }}
            className="flex-1 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20"
          >
            Keyingi →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 p-6 text-white shadow-2xl shadow-orange-500/20">
        <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur">
              Mening lug&apos;atim
            </span>
            <h2 className="mt-3 text-2xl font-extrabold">Saqlangan so&apos;z va iboralar</h2>
            <p className="mt-1 text-sm text-white/85">{items.length} ta yozuv · takrorlashga tayyor</p>
          </div>
          <div className="rounded-2xl bg-white/15 px-4 py-3 text-center backdrop-blur">
            <p className="text-3xl font-black leading-none">{items.length}</p>
            <p className="text-[10px] uppercase tracking-wide text-white/70">ta saqlangan</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="🔍 Qidirish: turkcha yoki o'zbekcha…"
          className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-amber-400 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button
          onClick={() => {
            setReview(true);
            setIndex(0);
            setRevealed(false);
          }}
          className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20"
        >
          🔁 Takrorlash
        </button>
        <button
          onClick={onBack}
          className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-500 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Orqaga
        </button>
      </div>

      {filtered.length === 0 ? (
        <p className="rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          🔍 “{query}” bo&apos;yicha hech narsa topilmadi.
        </p>
      ) : (
        <ul className="space-y-2">
          {filtered.map((item) => (
            <li
              key={item.id}
              className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-bold text-slate-900 dark:text-white">{item.tr}</p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                    {TYPE_META[item.type]?.icon || "✨"} {TYPE_META[item.type]?.label || "Ibora"}
                  </span>
                  {item.source && (
                    <span className="truncate text-[10px] text-slate-400">· {item.source}</span>
                  )}
                </div>
                {item.uz && (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">🇺🇿 {item.uz}</p>
                )}
                {item.wrong && (
                  <p className="mt-0.5 text-xs text-rose-400 line-through">❌ {item.wrong}</p>
                )}
              </div>
              <button
                onClick={() => playTTS?.(item.tr)}
                className="rounded-full bg-indigo-600 px-3 py-2 text-xs font-bold text-white hover:bg-indigo-500"
                title="Tinglash"
              >
                🔊
              </button>
              <button
                onClick={() => vocab.remove(item.id)}
                className="rounded-full border border-rose-200 px-3 py-2 text-xs font-bold text-rose-500 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/40"
                title="O'chirish"
              >
                🗑️
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => {
          if (window.confirm("Barcha saqlangan so'zlarni o'chirishni xohlaysizmi?")) vocab.clear();
        }}
        className="mx-auto block text-xs font-medium text-slate-400 hover:text-rose-500"
      >
        Hammasini tozalash
      </button>
    </div>
  );
}

import { LEVELS, LEVEL_META } from "../lib/useLevel";
import Icon from "./Icons";

export default function LevelCard({ level, score, onSelect, onOpen }) {
  const meta = level ? LEVEL_META[level] : null;

  return (
    <section className="level-card surface overflow-hidden rounded-3xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow">CEFR darajasi</p>
          <div className="mt-1.5 flex flex-wrap items-end gap-2">
            <span className="text-[28px] font-semibold leading-none tracking-[-0.04em] text-zinc-50">
              {level || "Tanlang"}
            </span>
            {level && (
              <span className="mb-0.5 rounded-full bg-amber-300/10 px-2 py-0.5 text-[9px] font-medium text-amber-200">
                {meta?.label}
              </span>
            )}
          </div>
        </div>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-200/20 to-rose-300/10 text-amber-200">
          <Icon name="graduation" size={16} />
        </span>
      </div>

      <div className="mt-3 grid grid-cols-5 gap-1.5" role="group" aria-label="CEFR darajasini tanlash">
        {LEVELS.map((item) => {
          const active = level === item;
          return (
            <button
              key={item}
              type="button"
              onClick={() => onSelect?.(item)}
              aria-pressed={active}
              className={`level-btn ${active ? "level-btn-active" : ""}`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <p className="mt-2.5 min-h-[30px] text-[10px] leading-relaxed text-zinc-500">
        {level
          ? meta?.note
          : "A1 dan C1 gacha darajani tanlang — Aylin savollari, tushuntirishlari va ovoz tezligi shunga moslashadi."}
      </p>

      <button
        onClick={onOpen}
        className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-[11px] font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
      >
        <Icon name="chart" size={12} />
        {level ? "Darajani qayta aniqlash" : "8 savollik mini-test"}
      </button>
      {score != null && <p className="mt-1.5 text-center text-[9px] text-zinc-600">Test natijasi: {score}/8</p>}
    </section>
  );
}

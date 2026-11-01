import { LEVEL_META } from "../lib/useLevel";
import Icon from "./Icons";

export default function LevelCard({ level, score, onOpen }) {
  const meta = level ? LEVEL_META[level] : null;

  return (
    <section className="level-card surface overflow-hidden rounded-3xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Türkçe daraja</p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-[30px] font-semibold leading-none tracking-[-0.04em] text-zinc-50">
              {level || "—"}
            </span>
            {level && (
              <span className="mb-0.5 rounded-full bg-amber-300/10 px-2 py-0.5 text-[9px] font-medium text-amber-200">
                {meta?.label}
              </span>
            )}
          </div>
          <p className="mt-2 max-w-[210px] text-[10px] leading-relaxed text-zinc-500">
            {level ? meta?.note : "8 savollik mini-test bilan darajangizni aniqlang."}
          </p>
        </div>
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-amber-200/20 to-rose-300/10 text-amber-200">
          <Icon name="graduation" size={18} />
        </span>
      </div>
      <button
        onClick={onOpen}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-[11px] font-semibold text-zinc-200 transition hover:bg-white/[0.08]"
      >
        <Icon name="chart" size={12} />
        {level ? "Darajani qayta aniqlash" : "Mini-testni boshlash"}
      </button>
      {score != null && <p className="mt-1.5 text-center text-[9px] text-zinc-600">Test natijasi: {score}/8</p>}
    </section>
  );
}

import Icon from "./Icons";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function StreakCard({ streak }) {
  if (!streak) return null;
  const done = streak.goalReached;

  return (
    <section className="surface rounded-2xl p-4">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-zinc-300">
          <Icon name="flame" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] font-medium text-zinc-200">
              {streak.streak > 0 ? `${streak.streak} kunlik seriya` : "Bugun seriyani boshlang"}
            </p>
            <span className="text-[10px] tabular-nums text-zinc-600">
              {fmt(streak.todaySeconds)} / 5:00
            </span>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[9px] font-medium text-zinc-400">
                <Icon name="check" size={9} />
                Maqsad bajarildi
              </span>
            )}
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full rounded-full bg-zinc-300 transition-all duration-700"
              style={{ width: `${Math.max(2, streak.progress)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-600">
            {done
              ? "Ajoyib. Ertaga ham 5 daqiqa gapirib seriyani davom ettiring."
              : "Kunlik maqsad — 5 daqiqa turkcha suhbat."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[15px] font-semibold tabular-nums text-zinc-200">{streak.progress}%</p>
          <p className="text-[9px] text-zinc-600">bugun</p>
        </div>
      </div>
    </section>
  );
}

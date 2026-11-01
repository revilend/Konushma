import Icon from "./Icons";

const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function StreakCard({ streak }) {
  if (!streak) return null;
  const done = streak.goalReached;

  return (
    <section className="streak-card relative overflow-hidden rounded-2xl border border-amber-300/15 bg-gradient-to-r from-amber-300/[0.09] via-orange-300/[0.04] to-transparent p-4 backdrop-blur-xl">
      <div className="pointer-events-none absolute -right-8 -top-10 h-28 w-28 rounded-full bg-amber-300/10 blur-2xl" />
      <div className="relative flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-200/25 to-orange-300/10 text-amber-200">
          <Icon name="flame" size={16} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-[12px] font-medium text-zinc-100">
              {streak.streak > 0 ? `${streak.streak} kunlik seriya` : "Bugun seriyani boshlang"}
            </p>
            <span className="text-[10px] tabular-nums text-zinc-500">
              {fmt(streak.todaySeconds)} / 5:00
            </span>
            {done && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-300/10 px-2 py-0.5 text-[9px] font-semibold text-mint-200">
                <Icon name="check" size={9} />
                Maqsad bajarildi
              </span>
            )}
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-mint-300 transition-all duration-700"
              style={{ width: `${Math.max(2, streak.progress)}%` }}
            />
          </div>
          <p className="mt-1.5 text-[10px] text-zinc-500">
            {done
              ? "Ajoyib. Ertaga ham 5 daqiqa gapirib seriyani davom ettiring."
              : "Kunlik maqsad — 5 daqiqa turkcha suhbat. Qo'ng'iroq ham hisoblanadi."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[15px] font-semibold tabular-nums text-amber-100">{streak.progress}%</p>
          <p className="text-[9px] text-zinc-600">bugun</p>
        </div>
      </div>
    </section>
  );
}

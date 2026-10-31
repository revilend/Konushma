const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

export default function StreakCard({ streak }) {
  if (!streak) return null;
  const done = streak.goalReached;
  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        done
          ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800/60 dark:from-amber-950/30 dark:to-orange-950/20"
          : "border-slate-200 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80"
      }`}
    >
      <div className="flex flex-wrap items-center gap-3">
        <span className={`text-2xl ${done ? "animate-bounce" : ""}`} aria-hidden="true">
          🔥
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-2">
            <p className="text-sm font-extrabold text-slate-900 dark:text-white">
              {streak.streak > 0 ? `${streak.streak} kunlik streak` : "Bugun streakni boshlang"}
            </p>
            <span className="text-[11px] font-semibold text-slate-400">
              {fmt(streak.todaySeconds)} / 5:00 daqiqa
            </span>
            {done && (
              <span className="rounded-full bg-amber-500 px-2 py-0.5 text-[10px] font-black text-white">
                ✓ Maqsad bajarildi
              </span>
            )}
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                done ? "bg-gradient-to-r from-amber-400 to-orange-500" : "bg-gradient-to-r from-rose-400 to-orange-400"
              }`}
              style={{ width: `${Math.max(2, streak.progress)}%` }}
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
            {done
              ? "Ajoyib! Ertaga ham 5 daqiqa gapirib streakni davom ettiring."
              : "Kunlik maqsad: 5 daqiqa turkcha suhbat. Qo'ng'iroq yoki simulyator vaqti hisoblanadi."}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-black text-orange-500">{streak.progress}%</p>
          <p className="text-[10px] text-slate-400">bugun</p>
        </div>
      </div>
    </div>
  );
}

import SpeedControl from "./SpeedControl";

export default function ScenarioPicker({
  scenarios,
  selected,
  onSelect,
  onStart,
  onBack,
  loading,
  starting,
  error,
  speed = 1,
  setSpeed,
}) {
  return (
    <div className="space-y-5">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-500 via-fuchsia-600 to-indigo-600 p-6 text-white shadow-2xl shadow-fuchsia-500/25 sm:p-8">
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-16 -left-10 h-44 w-44 rounded-full bg-indigo-300/20 blur-2xl" />
        <span className="relative inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wide backdrop-blur">
          📞 Hands-free qo&apos;ng&apos;iroq
        </span>
        <h2 className="relative mt-3 text-2xl font-extrabold leading-tight sm:text-3xl">
          Aylin Hoca bilan jonli suhbat
        </h2>
        <p className="relative mt-2 max-w-xl text-sm text-white/90">
          Mavzuni tanlang — Aylin Hoca shu vaziyatga mos rol o&apos;ynaydi. Mikrofon uzluksiz
          tinglaydi: gapirib bo&apos;lib <b>1.5 soniya</b> jim tursangiz javob avtomatik yuboriladi.
        </p>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">Mavzuni tanlang</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Har bir stsenariy o&apos;z darajasi va roliga ega
          </p>
        </div>
        <span className="rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {scenarios.length || 5} ta
        </span>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-200">
          ⚠️ {error}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {scenarios.map((s) => {
            const active = selected === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onSelect(s.id)}
                className={`group relative overflow-hidden rounded-3xl border p-4 text-left transition ${
                  active
                    ? "border-indigo-500 bg-indigo-50 shadow-lg shadow-indigo-500/10 dark:border-indigo-400 dark:bg-indigo-950/40"
                    : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-slate-100 text-2xl dark:bg-slate-800">
                    {s.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold text-slate-900 dark:text-white">{s.title_uz}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                        {s.level}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-slate-400 dark:text-slate-500">{s.title_tr}</p>
                  </div>
                  {active && (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-600 text-xs text-white">
                      ✓
                    </span>
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {s.desc_uz}
                </p>
                <p className="mt-2 truncate text-[11px] italic text-indigo-500 dark:text-indigo-300">
                  “{s.opening_tr}”
                </p>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white/80 p-3 dark:border-slate-800 dark:bg-slate-900/80">
        <div>
          <p className="text-xs font-extrabold text-slate-700 dark:text-slate-200">🐢 Aylin Hocaning tezligi</p>
          <p className="text-[10px] text-slate-400">Yangi boshlovchilar uchun 0.8x tavsiya etiladi</p>
        </div>
        <SpeedControl value={speed} onChange={setSpeed} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onStart}
          disabled={!selected || loading || starting}
          className="flex-1 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4 text-base font-extrabold text-white shadow-xl shadow-emerald-500/25 transition hover:from-emerald-400 hover:to-teal-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting ? "Boshlanmoqda…" : "📞 Qo'ng'iroqni boshlash"}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          ← Simulyator
        </button>
      </div>
      <p className="text-center text-[11px] leading-relaxed text-slate-400 dark:text-slate-500">
        🎙️ Mikrofon ruxsatini bering · Chrome yoki Edge tavsiya etiladi · Aylin faqat Emel Neural
        ovozida gapiradi
      </p>
    </div>
  );
}

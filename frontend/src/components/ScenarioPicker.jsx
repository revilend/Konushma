import GlowingOrb from "./GlowingOrb";
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
      <section className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.035] p-6 shadow-[0_30px_100px_-40px_rgba(124,58,237,.5)] backdrop-blur-2xl sm:p-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-[90px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-sky-500/15 blur-[90px]" />
        <div className="relative flex flex-col items-center gap-5 sm:flex-row sm:gap-8">
          <GlowingOrb size="sm" mode="idle" />
          <div className="flex-1 text-center sm:text-left">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 shadow-[0_0_10px_rgba(232,121,249,.9)]" />
              AI voice call · premium
            </span>
            <h2 className="mt-3 text-3xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-4xl">
              Aylin Hoca bilan
              <br />
              <span className="bg-gradient-to-r from-fuchsia-300 via-violet-300 to-sky-300 bg-clip-text text-transparent">
                jonli suhbat
              </span>
            </h2>
            <p className="mt-3 max-w-md text-[13px] leading-relaxed text-white/45">
              Mavzuni tanlang — Aylin shu vaziyatga mos rol o&apos;ynaydi. Mikrofon uzluksiz
              tinglaydi: gapirib bo&apos;lib <b className="text-white/70">1.5 soniya</b> jim
              tursangiz javob avtomatik yuboriladi.
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[10px] font-semibold text-white/40 sm:justify-start">
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">5 stsenariy</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">Hands-free</span>
              <span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1">Emel Neural</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h3 className="text-lg font-extrabold tracking-tight text-white">Mavzuni tanlang</h3>
          <p className="text-xs text-white/35">Har bir stsenariy o&apos;z darajasi va roliga ega</p>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1 text-[10px] font-bold text-white/40">
          {scenarios.length || 5} ta
        </span>
      </div>

      {loading ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-36 animate-pulse rounded-[26px] border border-white/[0.06] bg-white/[0.035]" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-500/[0.08] p-4 text-sm text-rose-200">
          {error}
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
                className={`group relative overflow-hidden rounded-[26px] border p-4 text-left backdrop-blur-xl transition duration-300 ${
                  active
                    ? "border-fuchsia-400/40 bg-fuchsia-500/[0.08] shadow-[0_20px_60px_-30px_rgba(217,70,239,.9)]"
                    : "border-white/[0.07] bg-white/[0.035] hover:border-white/20 hover:bg-white/[0.06]"
                }`}
              >
                {active && (
                  <span className="pointer-events-none absolute -right-10 -top-12 h-32 w-32 rounded-full bg-fuchsia-500/25 blur-3xl" />
                )}
                <div className="relative flex items-start gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-2xl">
                    {s.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-bold tracking-tight text-white">{s.title_uz}</p>
                      <span className="rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[9px] font-bold text-white/40">
                        {s.level}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[11px] text-white/30">{s.title_tr}</p>
                  </div>
                  {active && (
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-fuchsia-400 to-violet-500 text-[11px] text-white shadow-[0_0_20px_rgba(217,70,239,.6)]">
                      ✓
                    </span>
                  )}
                </div>
                <p className="relative mt-2.5 line-clamp-2 text-xs leading-relaxed text-white/45">{s.desc_uz}</p>
                <p className="relative mt-2 truncate text-[11px] italic text-fuchsia-200/60">“{s.opening_tr}”</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
        <div>
          <p className="text-xs font-extrabold text-white/80">Aylin Hocaning tezligi</p>
          <p className="text-[10px] text-white/30">Yangi boshlovchilar uchun 0.8x tavsiya etiladi</p>
        </div>
        <SpeedControl value={speed} onChange={setSpeed} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onStart}
          disabled={!selected || loading || starting}
          className="group relative flex-1 overflow-hidden rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-6 py-4 text-base font-extrabold text-white shadow-[0_20px_60px_-20px_rgba(217,70,239,.8)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/20 to-transparent opacity-40" />
          <span className="relative">{starting ? "Ulanyapti…" : "Qo'ng'iroqni boshlash"}</span>
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm font-bold text-white/50 transition hover:bg-white/[0.08] hover:text-white/80"
        >
          ← Studio
        </button>
      </div>
      <p className="text-center text-[10px] leading-relaxed text-white/25">
        Mikrofon ruxsatini bering · Chrome yoki Edge tavsiya etiladi · Aylin faqat Emel Neural ovozida gapiradi
      </p>
    </div>
  );
}

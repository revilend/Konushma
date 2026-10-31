import GlowingOrb from "./GlowingOrb";
import SpeedControl from "./SpeedControl";
import Icon from "./Icons";

const SCENARIO_ICONS = {
  cafe: "coffee",
  bazaar: "bag",
  airport: "plane",
  tomer: "graduation",
  free: "message",
};

export default function ScenarioPicker({
  scenarios,
  selected,
  onSelect,
  onStart,
  onBack,
  loading,
  starting,
  speed = 1,
  setSpeed,
}) {
  return (
    <div className="fade-up space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 transition hover:text-zinc-200"
      >
        <Icon name="arrowLeft" size={14} />
        Studio
      </button>

      <section className="surface relative overflow-hidden rounded-2xl p-5 sm:p-7">
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
          <div className="shrink-0">
            <GlowingOrb size="sm" mode="idle" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="eyebrow">Voice session</p>
            <h2 className="mt-2 text-[26px] font-semibold leading-[1.1] tracking-[-0.035em] text-zinc-50 sm:text-[30px]">
              Aylin Hoca bilan
              <br className="hidden sm:block" />
              <span className="text-zinc-500"> jonli suhbat</span>
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-[12px] leading-relaxed text-zinc-500 sm:mx-0">
              Mavzuni tanlang — Aylin shu vaziyatga mos rol o&apos;ynaydi. Gapirib bo&apos;lib 1.5 soniya
              jim tursangiz, javob avtomatik yuboriladi.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[10px] text-zinc-600 sm:justify-start">
              <span>5 stsenariy</span>
              <span className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
              <span>Hands-free</span>
              <span className="h-0.5 w-0.5 rounded-full bg-zinc-700" />
              <span>Emel Neural</span>
            </div>
          </div>
        </div>
      </section>

      <div className="flex items-end justify-between gap-3 px-1">
        <div>
          <h3 className="text-[14px] font-medium tracking-tight text-zinc-100">Mavzuni tanlang</h3>
          <p className="mt-0.5 text-[11px] text-zinc-500">Har bir stsenariyning o&apos;z darajasi va roli bor</p>
        </div>
        <span className="text-[10px] tabular-nums text-zinc-600">{scenarios.length || 5} ta</span>
      </div>

      {loading ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-[126px] animate-pulse rounded-2xl border border-white/[0.05] bg-white/[0.02]" />
          ))}
        </div>
      ) : (
        <div className="grid gap-2.5 sm:grid-cols-2">
          {scenarios.map((scenario) => {
            const active = selected === scenario.id;
            const icon = SCENARIO_ICONS[scenario.id] || "message";
            return (
              <button
                key={scenario.id}
                type="button"
                onClick={() => onSelect(scenario.id)}
                aria-pressed={active}
                className={`group relative rounded-2xl border p-4 text-left transition duration-200 ${
                  active
                    ? "border-white/25 bg-white/[0.07]"
                    : "border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.045]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition ${
                      active
                        ? "border-white/20 bg-white/[0.1] text-zinc-100"
                        : "border-white/[0.08] bg-white/[0.03] text-zinc-500 group-hover:text-zinc-300"
                    }`}
                  >
                    <Icon name={icon} size={17} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-[13px] font-medium tracking-tight text-zinc-100">
                        {scenario.title_uz}
                      </p>
                      <span className="shrink-0 text-[9px] font-medium tabular-nums text-zinc-600">
                        {scenario.level}
                      </span>
                    </div>
                    <p className="mt-0.5 truncate text-[10px] text-zinc-600">{scenario.title_tr}</p>
                  </div>
                  <span
                    className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                      active
                        ? "border-zinc-100 bg-zinc-100 text-zinc-900"
                        : "border-white/10 text-transparent"
                    }`}
                  >
                    <Icon name="check" size={11} strokeWidth={2.2} />
                  </span>
                </div>
                <p className="mt-2.5 line-clamp-2 text-[11px] leading-relaxed text-zinc-500">{scenario.desc_uz}</p>
                <p className="mt-2 truncate text-[10px] italic text-zinc-600">“{scenario.opening_tr}”</p>
              </button>
            );
          })}
        </div>
      )}

      <div className="surface flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3">
        <div>
          <p className="text-[12px] font-medium text-zinc-300">Ovoz tezligi</p>
          <p className="mt-0.5 text-[10px] text-zinc-600">Yangi boshlovchilar uchun 0.8x</p>
        </div>
        <SpeedControl value={speed} onChange={setSpeed} />
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={onStart}
          disabled={!selected || loading || starting}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-zinc-100 px-5 py-3.5 text-[13px] font-semibold text-zinc-900 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-zinc-400 border-t-zinc-900" />
              Ulanmoqda
            </>
          ) : (
            <>
              <Icon name="phone" size={15} />
              Qo&apos;ng&apos;iroqni boshlash
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
        >
          Bekor qilish
        </button>
      </div>
      <p className="pb-2 text-center text-[10px] leading-relaxed text-zinc-600">
        Mikrofon ruxsatini bering · Chrome yoki Edge tavsiya etiladi · Aylin faqat Emel Neural ovozida gapiradi
      </p>
    </div>
  );
}

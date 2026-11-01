import GlowingOrb from "./GlowingOrb";
import SpeedControl from "./SpeedControl";
import Icon from "./Icons";
import { getPersona, PERSONAS } from "../lib/personas";

const SCENARIO_ICONS = {
  cafe: "coffee",
  bazaar: "bag",
  airport: "plane",
  hotel: "hotel",
  tomer: "graduation",
  free: "message",
};

const ACCENTS = {
  mint: "from-emerald-300/25 via-teal-300/10 to-transparent text-emerald-100",
  amber: "from-amber-300/25 via-orange-300/10 to-transparent text-amber-100",
  sky: "from-sky-300/25 via-cyan-300/10 to-transparent text-sky-100",
};

export default function ScenarioPicker({
  scenarios,
  personas = PERSONAS,
  selected,
  personaId = "aylin",
  onSelect,
  onPersona,
  onStart,
  onBack,
  loading,
  starting,
  speed = 1,
  setSpeed,
}) {
  const persona = getPersona(personaId);
  const list = personas?.length ? personas : PERSONAS;

  return (
    <div className="fade-up space-y-5">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-500 transition hover:text-zinc-200"
      >
        <Icon name="arrowLeft" size={14} />
        Studio
      </button>

      <section className="voice-hero relative overflow-hidden rounded-[28px] p-5 sm:p-7">
        <div className="relative flex flex-col items-center gap-5 text-center sm:flex-row sm:gap-6 sm:text-left">
          <div className="shrink-0">
            <GlowingOrb size="sm" mode="idle" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <span className="hero-pill"><span className="h-1.5 w-1.5 rounded-full bg-mint-300" /> Rol o&apos;yini</span>
              <span className="hero-pill">{list.length} personaj</span>
              <span className="hero-pill">{persona.voice_label || "Neural ovoz"}</span>
            </div>
            <h2 className="mt-3 text-[27px] font-semibold leading-[1.08] tracking-[-0.04em] text-zinc-50 sm:text-[32px]">
              {persona.name} bilan
              <br className="hidden sm:block" />
              <span className="text-aurora"> jonli suhbat</span>
            </h2>
            <p className="mx-auto mt-2.5 max-w-md text-[12px] leading-relaxed text-zinc-400 sm:mx-0">
              {persona.desc_uz} Gapirib bo&apos;lib 1.5 soniya jim tursangiz, javob avtomatik yuboriladi.
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
          <div>
            <h3 className="text-[14px] font-semibold tracking-tight text-zinc-100">Suhbatdoshni tanlang</h3>
            <p className="mt-0.5 text-[11px] text-zinc-500">Har bir personajning o&apos;z ovozi va ohangi bor</p>
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-3">
          {list.map((item) => {
            const active = item.id === personaId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPersona?.(item.id)}
                aria-pressed={active}
                className={`persona-card group relative overflow-hidden rounded-2xl border p-3 text-left transition ${
                  active
                    ? "border-mint-300/30 bg-white/[0.07] shadow-[0_18px_45px_-28px_rgba(110,231,183,.45)]"
                    : "border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.045]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${ACCENTS[item.accent] || ACCENTS.mint} text-[11px] font-semibold`}>
                    {item.initials}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-semibold text-zinc-100">{item.name}</p>
                    <p className="truncate text-[9px] text-zinc-500">{item.role}</p>
                    <p className="truncate text-[8px] text-zinc-600">{item.voice_label || "Neural ovoz"}</p>
                  </div>
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${active ? "border-mint-300 bg-mint-300 text-emerald-950" : "border-white/10 text-transparent"}`}>
                    <Icon name="check" size={9} strokeWidth={2.4} />
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-[10px] leading-relaxed text-zinc-500">{item.desc_uz}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <div className="mb-2.5 flex items-end justify-between gap-3 px-1">
          <div>
            <h3 className="text-[14px] font-semibold tracking-tight text-zinc-100">Mavzuni tanlang</h3>
            <p className="mt-0.5 text-[11px] text-zinc-500">Har bir stsenariyning o&apos;z darajasi va roli bor</p>
          </div>
          <span className="text-[10px] tabular-nums text-zinc-600">{scenarios.length || 4} ta</span>
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
                  className={`group relative overflow-hidden rounded-2xl border p-4 text-left transition duration-200 ${
                    active
                      ? "border-mint-300/25 bg-gradient-to-br from-white/[0.09] to-mint-300/[0.035]"
                      : "border-white/[0.07] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.045]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl border transition ${
                        active
                          ? "border-mint-300/20 bg-mint-300/10 text-mint-200"
                          : "border-white/[0.08] bg-white/[0.03] text-zinc-500 group-hover:text-zinc-300"
                      }`}
                    >
                      <Icon name={icon} size={17} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-[13px] font-medium tracking-tight text-zinc-100">{scenario.title_uz}</p>
                        <span className="shrink-0 rounded bg-white/[0.05] px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-zinc-500">
                          {scenario.level}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-[10px] text-zinc-600">{scenario.title_tr}</p>
                    </div>
                    <span
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded-full border transition ${
                        active ? "border-mint-300 bg-mint-300 text-emerald-950" : "border-white/10 text-transparent"
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
      </section>

      <div className="surface flex flex-wrap items-center justify-between gap-3 rounded-2xl px-4 py-3">
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
          className="btn-primary flex flex-1 items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-[13px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
        >
          {starting ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-emerald-900/30 border-t-emerald-950" />
              Ulanmoqda
            </>
          ) : (
            <>
              <Icon name="phone" size={15} />
              {persona.name} bilan boshlash
            </>
          )}
        </button>
        <button
          type="button"
          onClick={onBack}
          className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3.5 text-[13px] font-medium text-zinc-400 transition hover:bg-white/[0.06] hover:text-zinc-200"
        >
          Bekor qilish
        </button>
      </div>
      <p className="pb-2 text-center text-[10px] leading-relaxed text-zinc-600">
        Mikrofon ruxsatini bering · Chrome yoki Edge tavsiya etiladi · har bir personaj o&apos;z Neural ovozida gapiradi
      </p>
    </div>
  );
}

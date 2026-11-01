import Icon, { LogoMark } from "./Icons";

const TABS = [
  { id: "sim", icon: "sparkles", label: "Studio" },
  { id: "call", icon: "phone", label: "Qo'ng'iroq" },
  { id: "vocab", icon: "book", label: "Lug'at" },
];

export default function Header({
  view,
  onView,
  vocabCount = 0,
  streakCount = 0,
  onApiKey,
  hasApiKey = false,
  level = null,
}) {
  return (
    <header className="sticky top-0 z-40 h-14 border-b border-white/[0.07] bg-[#070b09]/78 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-2 px-3 sm:px-5">
        <button
          onClick={() => onView("sim")}
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-lime-200 via-mint-300 to-teal-300 text-emerald-950 shadow-[0_6px_18px_-8px_rgba(110,231,183,.7)] transition hover:brightness-105"
          aria-label="TürkçePrep bosh sahifa"
        >
          <LogoMark className="h-4 w-4" />
        </button>
        <span className="hidden text-[13px] font-semibold tracking-tight text-zinc-100 md:block">
          TürkçePrep
        </span>

        <nav className="ml-0.5 flex items-center gap-0.5 sm:ml-3" aria-label="Asosiy navigatsiya">
          {TABS.map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onView(tab.id)}
                aria-current={active ? "page" : undefined}
                className={`flex h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium transition ${
                  active
                    ? "bg-gradient-to-br from-mint-300/15 to-amber-200/5 text-mint-100 shadow-[inset_0_0_0_1px_rgba(167,243,208,.12)]"
                    : "text-zinc-500 hover:bg-white/[0.04] hover:text-zinc-300"
                }`}
              >
                <Icon name={tab.icon} size={15} />
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.id === "vocab" && vocabCount > 0 && (
                  <span className="hidden text-[10px] tabular-nums text-zinc-500 sm:inline">{vocabCount}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          {level && (
            <span className="hidden h-8 items-center gap-1 rounded-lg border border-amber-300/15 bg-amber-300/[0.07] px-2 text-[10px] font-semibold text-amber-100 md:flex">
              <Icon name="graduation" size={12} />
              {level}
            </span>
          )}
          <div
            title="Kunlik streak"
            className="hidden h-8 items-center gap-1.5 rounded-lg px-2 text-[12px] font-medium text-zinc-500 sm:flex"
          >
            <Icon name="flame" size={14} className="text-amber-200/80" />
            <span className="tabular-nums">{streakCount}</span>
          </div>
          <button
            onClick={onApiKey}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 text-[12px] font-medium text-zinc-400 transition hover:border-mint-300/25 hover:bg-white/[0.06] hover:text-zinc-100"
            aria-label="API kalit sozlamalari"
          >
            <Icon name="key" size={14} />
            <span className="hidden sm:inline">API kalit</span>
            <span
              className={`h-1.5 w-1.5 rounded-full ${hasApiKey ? "bg-mint-300 shadow-[0_0_8px_rgba(110,231,183,.8)]" : "bg-zinc-600"}`}
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </header>
  );
}

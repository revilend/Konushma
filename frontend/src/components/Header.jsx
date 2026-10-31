const TABS = [
  { id: "sim", icon: "✦", label: "Studio" },
  { id: "call", icon: "◉", label: "Qo'ng'iroq" },
  { id: "vocab", icon: "◇", label: "Lug'atim" },
];

export default function Header({
  view,
  onView,
  mode,
  setMode,
  vocabCount = 0,
  streakCount = 0,
  onApiKey,
  hasApiKey = false,
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#090A10]/65 backdrop-blur-2xl">
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div className="flex items-center gap-3 py-3">
          <div className="relative grid h-10 w-10 shrink-0 place-items-center rounded-[14px] border border-white/10 bg-white/[0.04]">
            <span className="absolute inset-1 rounded-[11px] bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-400 opacity-80 blur-[6px]" />
            <span className="relative text-[11px] font-black tracking-widest text-white">TR</span>
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-[15px] font-bold tracking-tight text-white">
              TürkçePrep <span className="bg-gradient-to-r from-fuchsia-300 to-sky-300 bg-clip-text text-transparent">AI</span>
            </h1>
            <p className="truncate text-[10px] tracking-[0.18em] text-white/35">AYLIN · VOICE TUTOR</p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span
              title="Kunlik streak"
              className={`hidden rounded-full border px-2.5 py-1 text-[10px] font-black sm:inline-flex ${
                streakCount > 0
                  ? "border-amber-300/20 bg-amber-400/10 text-amber-200"
                  : "border-white/10 bg-white/[0.04] text-white/35"
              }`}
            >
              🔥 {streakCount}
            </span>
            <button
              onClick={onApiKey}
              className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.05] px-2.5 py-1.5 text-[11px] font-bold text-white/70 transition hover:border-fuchsia-300/30 hover:bg-white/[0.09] hover:text-white sm:px-3"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  hasApiKey ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,.9)]" : "bg-amber-400"
                }`}
              />
              <span className="hidden sm:inline">⚙️ API Kalit</span>
              <span className="sm:hidden">⚙️</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-2.5">
          {TABS.map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onView(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold tracking-wide transition ${
                  active
                    ? "border border-white/10 bg-white/[0.09] text-white shadow-[0_4px_20px_-6px_rgba(255,255,255,.25)]"
                    : "text-white/35 hover:bg-white/[0.04] hover:text-white/70"
                }`}
              >
                <span className={active ? "text-fuchsia-300" : ""}>{tab.icon}</span>
                {tab.label}
                {tab.id === "vocab" && vocabCount > 0 && (
                  <span className="rounded-full bg-amber-400/15 px-1.5 py-0.5 text-[9px] font-black text-amber-200">
                    {vocabCount}
                  </span>
                )}
              </button>
            );
          })}

          {view === "sim" && (
            <div className="ml-auto hidden shrink-0 rounded-full border border-white/10 bg-black/30 p-0.5 text-[10px] font-semibold sm:flex">
              {[
                ["exam", "Imtihon"],
                ["practice", "Pratik"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`rounded-full px-2.5 py-1 transition ${
                    mode === id ? "bg-white/[0.12] text-white" : "text-white/35 hover:text-white/70"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

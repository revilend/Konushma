const TABS = [
  { id: "sim", icon: "💬", label: "Simulyator" },
  { id: "call", icon: "📞", label: "Qo'ng'iroq" },
  { id: "vocab", icon: "📚", label: "Lug'atim" },
];

export default function Header({ view, onView, mode, setMode, dark, toggleDark, vocabCount = 0 }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto max-w-5xl px-3 sm:px-4">
        <div className="flex items-center gap-2.5 py-2.5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 text-lg shadow-lg shadow-fuchsia-500/25">
            🇹🇷
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
              TürkçePrep <span className="text-indigo-500">AI</span>
            </h1>
            <p className="truncate text-[10px] text-slate-500 dark:text-slate-400">
              Aylin Hoca · Speaking Simulator
            </p>
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 sm:inline">
              100% bepul
            </span>
            <button
              onClick={toggleDark}
              title={dark ? "Yorug rejim" : "Tungi rejim"}
              className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              {dark ? "🌙" : "☀️"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-2">
          {TABS.map((tab) => {
            const active = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onView(tab.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition ${
                  active
                    ? "bg-gradient-to-r from-indigo-600 to-fuchsia-600 text-white shadow-md shadow-indigo-500/20"
                    : "text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
                {tab.id === "vocab" && vocabCount > 0 && (
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[10px] font-black ${
                      active ? "bg-white/25" : "bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300"
                    }`}
                  >
                    {vocabCount}
                  </span>
                )}
              </button>
            );
          })}

          {view === "sim" && (
            <div className="ml-auto hidden shrink-0 rounded-full border border-slate-200 bg-slate-100 p-0.5 text-[11px] font-semibold dark:border-slate-700 dark:bg-slate-900 sm:flex">
              {[
                ["exam", "Konuşma Sınavı"],
                ["practice", "Pratik"],
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setMode(id)}
                  className={`rounded-full px-2.5 py-1 transition ${
                    mode === id
                      ? "bg-white text-indigo-600 shadow dark:bg-slate-700 dark:text-indigo-300"
                      : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {view === "sim" && (
          <div className="flex pb-2 text-[11px] font-semibold sm:hidden">
            {[
              ["exam", "Konuşma Sınavı"],
              ["practice", "Pratik"],
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setMode(id)}
                className={`flex-1 rounded-full px-2 py-1.5 transition ${
                  mode === id
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-400"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}

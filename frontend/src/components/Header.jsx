export default function Header({ mode, setMode, dark, toggleDark, onCall, inCall }) {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/70 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3">
        <button
          onClick={onCall}
          title={inCall ? "Jonli qo'ng'iroq ochiq" : "Aylin Hoca bilan jonli qo'ng'iroq"}
          className={`mr-auto flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold transition ${
            inCall
              ? "bg-emerald-600 text-white"
              : "border border-emerald-300 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          }`}
        >
          📞 Jonli Qo'ng'iroq
        </button>

        <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500 via-fuchsia-500 to-rose-500 text-xl shadow-lg shadow-fuchsia-500/25">
          🇹🇷
        </div>
        <div>
          <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white">
            TürkçePrep <span className="text-indigo-500">AI</span>
          </h1>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Aylin Hoca · Speaking Simulator
          </p>
        </div>

        <div className="ml-auto flex rounded-full border border-slate-200 bg-slate-100 p-1 text-xs font-semibold dark:border-slate-700 dark:bg-slate-900">
          {[
            ["exam", "Konuşma Sınavı"],
            ["practice", "Pratik"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`rounded-full px-3 py-1.5 transition ${
                mode === id
                  ? "bg-white text-indigo-600 shadow dark:bg-slate-700 dark:text-indigo-300"
                  : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <button
          onClick={toggleDark}
          title={dark ? "Yorug rejim" : "Tungi rejim"}
          className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-sm transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {dark ? "🌙" : "☀️"}
        </button>
      </div>
    </header>
  );
}

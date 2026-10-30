export default function QuestionCard({ question, speaking, onPlay }) {
  if (!question) {
    return (
      <div className="animate-pulse rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
        <div className="h-4 w-1/3 rounded bg-slate-200 dark:bg-slate-800" />
        <div className="mt-4 h-8 w-3/4 rounded bg-slate-200 dark:bg-slate-800" />
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-500/5 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-2">
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-2xl shadow-md shadow-rose-500/30">
          👩‍🏫
        </div>
        <div>
          <p className="font-bold text-slate-900 dark:text-white">Aylin Hoca 🇹🇷</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Konuşma Sınavı · Soru</p>
        </div>
        <button
          onClick={onPlay}
          disabled={speaking}
          className="ml-auto flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-50"
        >
          {speaking ? "🔊 O'qilyapti..." : "🔊 Tinglash"}
        </button>
      </div>

      <p className="mt-5 text-2xl font-semibold leading-snug text-slate-900 dark:text-white">
        {question.tr}
      </p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">🇺🇿 {question.uz}</p>
    </div>
  );
}

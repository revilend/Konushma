import { useEffect, useState } from "react";

export default function ApiKeyModal({ open, onClose, apiKey, onSaved }) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setValue(apiKey.key || "");
      setShow(false);
      setError("");
    }
  }, [open, apiKey.key]);

  if (!open) return null;

  const save = () => {
    const clean = value.trim();
    if (clean.length < 20) {
      setError("Kalit juda qisqa. Gemini API kaliti odatda AIza... bilan boshlanadi va ~39 belgidan iborat.");
      return;
    }
    apiKey.save(clean);
    onSaved?.(clean);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        aria-label="Yopish"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-[30px] border border-white/10 bg-[#0C0E16]/95 p-6 shadow-[0_40px_120px_-20px_rgba(124,58,237,.55)] backdrop-blur-2xl">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-64 -translate-x-1/2 rounded-full bg-fuchsia-500/25 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.06] text-xl">
              ⚙️
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-white">Gemini API kaliti</h2>
              <p className="text-[11px] text-white/45">Aylin Hocani jonlantirish uchun</p>
            </div>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Kalitni{" "}
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-fuchsia-300 underline decoration-fuchsia-400/40 underline-offset-2 hover:text-fuchsia-200"
            >
              Google AI Studio
            </a>{" "}
            dan bepul oling. Kalit faqat shu brauzerda saqlanadi va har bir AI so‘rovida backendga
            yuboriladi — serverda saqlanmaydi, `.env` tahrirlash shart emas.
          </p>

          <label className="mt-5 block text-[11px] font-bold uppercase tracking-wider text-white/40">
            API kalit
          </label>
          <div className="mt-1.5 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 focus-within:border-fuchsia-400/50">
            <input
              type={show ? "text" : "password"}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
              }}
              placeholder="AIzaSy..."
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="text-xs font-bold text-white/40 hover:text-white/80"
            >
              {show ? "Yashirish" : "Ko‘rsatish"}
            </button>
          </div>

          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}

          <button
            onClick={save}
            className="mt-5 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 via-violet-500 to-indigo-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_10px_40px_-10px_rgba(217,70,239,.7)] transition hover:brightness-110"
          >
            Saqlash va boshlash
          </button>

          <div className="mt-3 flex items-center justify-between">
            <a
              href="https://aistudio.google.com/app/apikey"
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-white/40 hover:text-white/70"
            >
              Kalit olish →
            </a>
            {apiKey.hasKey && (
              <button
                onClick={() => {
                  apiKey.clear();
                  onSaved?.("");
                  onClose?.();
                }}
                className="text-[11px] font-semibold text-rose-300/80 hover:text-rose-200"
              >
                Kalitni o‘chirish
              </button>
            )}
          </div>

          <p className="mt-4 border-t border-white/5 pt-3 text-[10px] leading-relaxed text-white/30">
            🔒 Kalit hech qanday serverda saqlanmaydi. Umumiy kompyuterda ishlatmang.
          </p>
        </div>
      </div>
    </div>
  );
}

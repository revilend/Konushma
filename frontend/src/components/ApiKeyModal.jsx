import { useEffect, useState } from "react";
import Icon from "./Icons";

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
      setError("Kalit juda qisqa. Gemini kaliti odatda AIza... bilan boshlanadi.");
      return;
    }
    apiKey.save(clean);
    onSaved?.(clean);
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button aria-label="Yopish" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-mint-300/15 bg-gradient-to-b from-[#16231b] to-[#0b120e] p-5 shadow-[0_40px_120px_-30px_rgba(16,185,129,.35)] sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-lime-200/30 to-mint-300/10 text-mint-200">
              <Icon name="key" size={16} />
            </span>
            <div>
              <h2 className="text-[15px] font-semibold tracking-tight text-zinc-100">API kalit</h2>
              <p className="text-[11px] text-zinc-500">Gemini orqali Aylinni yoqing</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-md p-1 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200" aria-label="Yopish">
            <Icon name="x" size={16} />
          </button>
        </div>

        <p className="mt-4 text-[12px] leading-relaxed text-zinc-400">
          Kalitni{" "}
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-mint-200 underline decoration-mint-300/40 underline-offset-2 hover:decoration-mint-200"
          >
            Google AI Studio
          </a>{" "}
          dan oling. U faqat shu brauzerda saqlanadi va AI so‘rovlarida yuboriladi. Serverda saqlanmaydi.
        </p>

        <label className="mt-5 block text-[10px] font-medium uppercase tracking-[0.14em] text-zinc-500">
          Gemini API key
        </label>
        <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/60 px-3 py-2.5 transition focus-within:border-mint-300/40 focus-within:shadow-[0_0_0_3px_rgba(110,231,183,.06)]">
          <input
            type={show ? "text" : "password"}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setError("");
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") save();
            }}
            placeholder="AIzaSy..."
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[13px] text-zinc-100 outline-none placeholder:text-zinc-600"
          />
          <button
            type="button"
            onClick={() => setShow((current) => !current)}
            className="rounded p-1 text-zinc-500 transition hover:text-zinc-200"
            aria-label={show ? "Yashirish" : "Ko‘rsatish"}
          >
            <Icon name={show ? "eyeOff" : "eye"} size={15} />
          </button>
        </div>
        {error && <p className="mt-2 text-[11px] text-zinc-400">{error}</p>}

        <button
          onClick={save}
          className="btn-primary mt-5 w-full rounded-xl px-4 py-3 text-[13px] font-semibold"
        >
          Saqlash
        </button>

        <div className="mt-3 flex items-center justify-between">
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-zinc-500 transition hover:text-zinc-300"
          >
            Kalit olish <Icon name="external" size={11} />
          </a>
          {apiKey.hasKey && (
            <button
              onClick={() => {
                apiKey.clear();
                onSaved?.("");
                onClose?.();
              }}
              className="text-[11px] text-zinc-500 transition hover:text-rose-200"
            >
              Kalitni o‘chirish
            </button>
          )}
        </div>

        <p className="mt-4 flex items-start gap-1.5 border-t border-white/[0.06] pt-3 text-[10px] leading-relaxed text-zinc-600">
          <Icon name="lock" size={11} className="mt-0.5 shrink-0" />
          Umumiy kompyuterda kalitni saqlamang.
        </p>
      </div>
    </div>
  );
}

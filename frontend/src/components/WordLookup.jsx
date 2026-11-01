import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../lib/api";
import { toast } from "../lib/toast";
import { trackMission } from "../lib/missions";
import Icon from "./Icons";

export default function WordLookup({ word, context = "", vocab, playTTS, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setData(null);
    setError("");
    api
      .translateWord(word, context)
      .then((result) => {
        if (alive) setData(result);
      })
      .catch((err) => {
        if (alive) setError(err.message || "Tarjima olinmadi");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [word, context]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  const translation = data?.translation_uz || "";
  const saved = translation && vocab?.has(data?.word || word);

  const save = () => {
    if (!translation) return;
    if (vocab?.add({ tr: data?.word || word, uz: translation, type: "word", source: "Smart lug'at" })) {
      trackMission("words");
      toast("So'z lug'atga saqlandi", "success");
    }
  };

  if (typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[150] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Yopish"
        onClick={onClose}
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
      />
      <div className="relative w-full max-w-md rounded-t-3xl border border-white/10 bg-[#121814]/95 p-5 shadow-[0_40px_120px_-30px_rgba(0,0,0,.95)] backdrop-blur-2xl sm:rounded-3xl sm:p-6">
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/15 sm:hidden" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Smart lug'at</p>
            <h2 className="mt-1.5 text-[24px] font-semibold tracking-[-0.03em] text-zinc-50">{word}</h2>
            {data?.part_of_speech && <p className="mt-0.5 text-[10px] text-zinc-500">{data.part_of_speech}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.07] hover:text-zinc-200"
            aria-label="Yopish"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        <div className="mt-4 min-h-[76px] rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 w-1/3 animate-pulse rounded bg-white/[0.08]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-white/[0.06]" />
            </div>
          ) : error ? (
            <p className="text-[12px] leading-relaxed text-rose-200">{error}</p>
          ) : translation ? (
            <>
              <p className="text-[10px] uppercase tracking-[0.14em] text-zinc-600">O&apos;zbekcha</p>
              <p className="mt-1 text-[18px] font-medium leading-snug text-mint-100">{translation}</p>
            </>
          ) : (
            <div>
              <p className="text-[12px] leading-relaxed text-zinc-400">
                Bu so&apos;z lokal lug&apos;atda topilmadi. To&apos;liq tarjima uchun API kalitini ulang.
              </p>
              <button
                onClick={() => playTTS?.(word)}
                className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-medium text-zinc-500 hover:text-zinc-200"
              >
                <Icon name="volume" size={12} />
                Talaffuzni eshitish
              </button>
            </div>
          )}
        </div>

        {data?.example_tr && data?.source === "ai" && (
          <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] px-3 py-2.5">
            <p className="text-[10px] uppercase tracking-[0.12em] text-zinc-600">Misolda</p>
            <p className="mt-1 text-[12px] leading-relaxed text-zinc-300">{data.example_tr}</p>
            {data.example_uz && <p className="mt-0.5 text-[11px] leading-relaxed text-zinc-500">{data.example_uz}</p>}
          </div>
        )}

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={() => playTTS?.(data?.word || word)}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2.5 text-[12px] font-medium text-zinc-300 transition hover:bg-white/[0.08]"
          >
            <Icon name="volume" size={13} />
            Tinglash
          </button>
          <button
            type="button"
            onClick={save}
            disabled={!translation || saved}
            className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-[12px] font-semibold transition ${
              saved
                ? "border border-mint-300/25 bg-mint-300/10 text-mint-100"
                : "btn-primary"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <Icon name={saved ? "bookmarkCheck" : "bookmark"} size={13} />
            {saved ? "Saqlangan" : "Lug'atga saqlash"}
          </button>
        </div>
        <p className="mt-2.5 text-center text-[9px] text-zinc-600">
          {data?.source === "ai" ? "AI tarjimasi · kontekst asosida" : "Lokal lug'at · asosiy so'zlar"}
        </p>
      </div>
    </div>,
    document.body
  );
}

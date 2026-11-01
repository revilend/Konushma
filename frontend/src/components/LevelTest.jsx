import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { LEVEL_TEST, scoreToLevel } from "../lib/levelTest";
import { LEVEL_META } from "../lib/useLevel";
import Icon from "./Icons";

export default function LevelTest({ open, onClose, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    setAnswers([]);
    setResult(null);
  }, [open]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  const question = LEVEL_TEST[index];
  const selected = answers[index];
  const isLast = index === LEVEL_TEST.length - 1;

  const next = () => {
    if (selected == null) return;
    if (!isLast) {
      setIndex((value) => value + 1);
      return;
    }
    const score = answers.filter((answer, i) => answer === LEVEL_TEST[i].answer).length;
    const level = scoreToLevel(score);
    const payload = { level, score };
    setResult(payload);
    onComplete?.(level, score);
  };

  const choose = (optionIndex) => {
    setAnswers((prev) => {
      const nextAnswers = [...prev];
      nextAnswers[index] = optionIndex;
      return nextAnswers;
    });
  };

  return createPortal(
    <div className="fixed inset-0 z-[160] flex items-center justify-center p-3 sm:p-6">
      <button aria-label="Yopish" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-md" />
      <div className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-3xl border border-white/10 bg-[#111713]/95 p-5 shadow-[0_50px_140px_-30px_rgba(0,0,0,.95)] backdrop-blur-2xl sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow">Daraja testi</p>
            <h2 className="mt-1.5 text-[20px] font-semibold tracking-[-0.03em] text-zinc-50">
              {result ? "Natijangiz tayyor" : "Turkchangizni aniqlaymiz"}
            </h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-500 transition hover:bg-white/[0.06] hover:text-zinc-200" aria-label="Yopish">
            <Icon name="x" size={16} />
          </button>
        </div>

        {result ? (
          <div className="mt-5 text-center">
            <div className="level-result-ring">
              <span>{result.level}</span>
              <small>{LEVEL_META[result.level]?.label}</small>
            </div>
            <p className="mt-4 text-[14px] font-medium text-zinc-100">{result.score}/8 savol to&apos;g&apos;ri</p>
            <p className="mx-auto mt-1.5 max-w-sm text-[11px] leading-relaxed text-zinc-500">
              {LEVEL_META[result.level]?.note}. Suhbatlar va mashqlar shu darajaga moslashadi.
            </p>
            <button onClick={onClose} className="btn-primary mt-5 w-full rounded-xl px-4 py-3 text-[12px] font-semibold">
              Mashqni boshlash
            </button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex items-center gap-3">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <div className="h-full rounded-full bg-gradient-to-r from-mint-300 to-amber-200 transition-all duration-300" style={{ width: `${((index + 1) / LEVEL_TEST.length) * 100}%` }} />
              </div>
              <span className="text-[10px] tabular-nums text-zinc-500">
                {index + 1}/{LEVEL_TEST.length}
              </span>
            </div>

            <div className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="text-[9px] uppercase tracking-[0.14em] text-zinc-600">Bo&apos;sh joyni to&apos;ldiring</p>
              <p className="mt-2 text-[17px] font-medium leading-relaxed text-zinc-100">{question.prompt}</p>
            </div>

            <div className="mt-3 space-y-2">
              {question.options.map((option, optionIndex) => {
                const active = selected === optionIndex;
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => choose(optionIndex)}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3.5 py-3 text-left text-[12px] transition ${
                      active
                        ? "border-mint-300/35 bg-mint-300/[0.09] text-mint-50"
                        : "border-white/[0.07] bg-white/[0.02] text-zinc-300 hover:border-white/15 hover:bg-white/[0.05]"
                    }`}
                  >
                    <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg text-[10px] font-semibold ${active ? "bg-mint-300 text-emerald-950" : "bg-white/[0.05] text-zinc-500"}`}>
                      {String.fromCharCode(65 + optionIndex)}
                    </span>
                    {option}
                  </button>
                );
              })}
            </div>

            <button
              onClick={next}
              disabled={selected == null}
              className="btn-primary mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-[12px] font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isLast ? "Natijani ko'rish" : "Keyingi savol"}
              <Icon name="arrowRight" size={13} />
            </button>
            <p className="mt-2 text-center text-[9px] text-zinc-600">Test mahalliy ishlaydi · natija brauzerda saqlanadi</p>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

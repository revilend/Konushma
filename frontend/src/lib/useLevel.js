import { useCallback, useState } from "react";

const KEY = "tp-level-v1";
export const LEVELS = ["A1", "A2", "B1", "B2", "C1"];

export const LEVEL_META = {
  A1: { label: "Boshlang'ich", note: "Juda oddiy so'zlar, qisqa gaplar va sekin nutq" },
  A2: { label: "Asosiy", note: "Kundalik suhbat va qisqa jumlalar" },
  B1: { label: "O'rta", note: "Fikr bildirish va sabab tushuntirish" },
  B2: { label: "Yuqori o'rta", note: "Erkin suhbat va murakkab mavzular" },
  C1: { label: "Ilg'or", note: "Akademik til, tanqidiy tahlil va nozik ma'nolar" },
};

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw || !LEVELS.includes(raw.level)) return null;
    return raw;
  } catch {
    return null;
  }
}

export function useLevel() {
  const [state, setState] = useState(load);
  const save = useCallback((level, score = null) => {
    if (!LEVELS.includes(level)) return;
    const next = { level, score, updatedAt: Date.now() };
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    setState(next);
  }, []);
  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
    setState(null);
  }, []);
  return {
    level: state?.level || null,
    score: state?.score ?? null,
    save,
    clear,
    hasLevel: Boolean(state?.level),
  };
}

import { useEffect, useState } from "react";

const KEY = "tp-missions-v1";
const EVENT = "tp-missions-change";

export const MISSIONS = [
  {
    key: "speak",
    title: "5 daqiqa gapiring",
    note: "Qo'ng'iroq yoki simulyator vaqti",
    target: 300,
    unit: "seconds",
    icon: "mic",
    accent: "mint",
  },
  {
    key: "grammar",
    title: "2 ta tahlil oling",
    note: "Grammatika tahlilchisidan foydalaning",
    target: 2,
    unit: "count",
    icon: "sparkles",
    accent: "sky",
  },
  {
    key: "words",
    title: "3 ta so'z saqlang",
    note: "Smart lug'atdan yangi so'zlar",
    target: 3,
    unit: "count",
    icon: "book",
    accent: "amber",
  },
  {
    key: "review",
    title: "5 ta flashcard",
    note: "Saqlangan so'zlarni takrorlang",
    target: 5,
    unit: "count",
    icon: "rotate",
    accent: "rose",
  },
  {
    key: "call",
    title: "1 ta jonli suhbat",
    note: "Personaj bilan qo'ng'iroq qiling",
    target: 1,
    unit: "count",
    icon: "phone",
    accent: "violet",
  },
];

function todayKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function blank() {
  return {
    date: todayKey(),
    values: { speak: 0, grammar: 0, words: 0, review: 0, call: 0 },
  };
}

export function loadMissions() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw || raw.date !== todayKey()) return blank();
    return {
      date: raw.date,
      values: { ...blank().values, ...(raw.values || {}) },
    };
  } catch {
    return blank();
  }
}

export function trackMission(key, amount = 1) {
  if (typeof window === "undefined") return;
  const current = loadMissions();
  const increment = Math.max(0, Number(amount) || 0);
  if (!increment || !(key in current.values)) return;
  const next = {
    ...current,
    values: { ...current.values, [key]: current.values[key] + increment },
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: next }));
}

export function useMissions() {
  const [state, setState] = useState(loadMissions);

  useEffect(() => {
    const refresh = () => setState(loadMissions());
    window.addEventListener(EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  const missions = MISSIONS.map((mission) => {
    const value = state.values[mission.key] || 0;
    return {
      ...mission,
      value,
      progress: Math.min(100, Math.round((value / mission.target) * 100)),
      done: value >= mission.target,
    };
  });

  return {
    missions,
    values: state.values,
    completed: missions.filter((mission) => mission.done).length,
    total: missions.length,
  };
}

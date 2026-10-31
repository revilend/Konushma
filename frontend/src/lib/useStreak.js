import { useCallback, useEffect, useMemo, useState } from "react";

const KEY = "tp-streak-v1";
const GOAL_SECONDS = 300; // 5 daqiqa

function dateKey(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return dateKey(d);
}

function load() {
  let raw = {};
  try {
    raw = JSON.parse(localStorage.getItem(KEY) || "{}") || {};
  } catch {
    raw = {};
  }
  const today = dateKey();
  let streak = Number(raw.streak) || 0;
  let lastActiveDate = raw.lastActiveDate || "";
  if (lastActiveDate && lastActiveDate !== today && lastActiveDate !== offsetDate(-1)) {
    streak = 0; // bir kun o'tkazib yuborilgan — streak uzildi
  }
  const sameDay = raw.todayDate === today;
  return {
    streak,
    bestStreak: Math.max(Number(raw.bestStreak) || 0, streak),
    lastActiveDate,
    todayDate: today,
    todaySeconds: sameDay ? Number(raw.todaySeconds) || 0 : 0,
    totalSeconds: Number(raw.totalSeconds) || 0,
    goal: GOAL_SECONDS,
  };
}

export function useStreak() {
  const [state, setState] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* ignore */
    }
  }, [state]);

  const addSeconds = useCallback((seconds) => {
    const amount = Math.max(0, Math.round(Number(seconds) || 0));
    if (!amount) return;
    setState((prev) => {
      const today = dateKey();
      const yesterday = offsetDate(-1);
      const todaySeconds = (prev.todayDate === today ? prev.todaySeconds : 0) + amount;
      let streak = prev.streak;
      let lastActiveDate = prev.lastActiveDate;
      const justReachedGoal = todaySeconds >= GOAL_SECONDS && prev.lastActiveDate !== today;
      if (justReachedGoal) {
        streak = prev.lastActiveDate === yesterday ? prev.streak + 1 : 1;
        lastActiveDate = today;
      }
      return {
        ...prev,
        todayDate: today,
        todaySeconds,
        totalSeconds: prev.totalSeconds + amount,
        streak,
        lastActiveDate,
        bestStreak: Math.max(prev.bestStreak, streak),
        goal: GOAL_SECONDS,
      };
    });
  }, []);

  const displayStreak = useMemo(() => {
    if (!state.lastActiveDate) return 0;
    if (state.lastActiveDate === dateKey() || state.lastActiveDate === offsetDate(-1)) return state.streak;
    return 0;
  }, [state.lastActiveDate, state.streak]);

  return {
    ...state,
    streak: displayStreak,
    goalReached: state.todaySeconds >= state.goal,
    progress: Math.min(100, Math.round((state.todaySeconds / state.goal) * 100)),
    addSeconds,
  };
}

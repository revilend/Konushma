import { useCallback, useEffect, useState } from "react";

const KEY = "tp-vocab-v1";

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function useVocabulary() {
  const [items, setItems] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* localStorage to'la bo'lsa jim o'tiladi */
    }
  }, [items]);

  const add = useCallback((entry) => {
    const tr = (entry?.tr || "").trim();
    if (!tr) return false;
    setItems((prev) => {
      if (prev.some((x) => x.tr.toLowerCase() === tr.toLowerCase())) return prev;
      return [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          tr,
          uz: (entry.uz || "").trim(),
          wrong: (entry.wrong || "").trim(),
          type: entry.type || "phrase",
          source: entry.source || "",
          savedAt: Date.now(),
        },
        ...prev,
      ];
    });
    return true;
  }, []);

  const remove = useCallback((id) => setItems((prev) => prev.filter((x) => x.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const has = useCallback(
    (tr) => Boolean(tr) && items.some((x) => x.tr.toLowerCase() === tr.trim().toLowerCase()),
    [items]
  );

  return { items, add, remove, clear, has, count: items.length };
}

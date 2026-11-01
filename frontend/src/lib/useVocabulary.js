import { useCallback, useEffect, useRef, useState } from "react";

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
  const itemsRef = useRef(items);

  useEffect(() => {
    itemsRef.current = items;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* localStorage to'la bo'lsa jim o'tiladi */
    }
  }, [items]);

  const add = useCallback((entry) => {
    const tr = (entry?.tr || "").trim();
    if (!tr) return false;
    if (itemsRef.current.some((item) => item.tr.toLowerCase() === tr.toLowerCase())) return false;
    const next = [
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        tr,
        uz: (entry.uz || "").trim(),
        wrong: (entry.wrong || "").trim(),
        type: entry.type || "phrase",
        source: entry.source || "",
        savedAt: Date.now(),
      },
      ...itemsRef.current,
    ];
    itemsRef.current = next;
    setItems(next);
    return true;
  }, []);

  const remove = useCallback((id) => {
    const next = itemsRef.current.filter((item) => item.id !== id);
    itemsRef.current = next;
    setItems(next);
  }, []);

  const clear = useCallback(() => {
    itemsRef.current = [];
    setItems([]);
  }, []);

  const has = useCallback(
    (tr) => Boolean(tr) && items.some((item) => item.tr.toLowerCase() === tr.trim().toLowerCase()),
    [items]
  );

  return { items, add, remove, clear, has, count: items.length };
}

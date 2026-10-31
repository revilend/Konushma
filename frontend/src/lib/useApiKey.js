import { useCallback, useState } from "react";
import { API_KEY_STORAGE, readStoredKey } from "./api";

export function useApiKey() {
  const [key, setKey] = useState(readStoredKey);

  const save = useCallback((value) => {
    const clean = (value || "").trim();
    try {
      localStorage.setItem(API_KEY_STORAGE, clean);
    } catch {
      /* private mode */
    }
    setKey(clean);
    return clean;
  }, []);

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
    } catch {
      /* ignore */
    }
    setKey("");
  }, []);

  return { key, hasKey: key.trim().length >= 20, save, clear };
}

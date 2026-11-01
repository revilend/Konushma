import { getPersona } from "./personas";

const BASE = import.meta.env.VITE_API_URL || ""; // bo'sh -> same-origin (vite proxy)

export const API_KEY_STORAGE = "tp-gemini-key";

export function readStoredKey() {
  try {
    return localStorage.getItem(API_KEY_STORAGE) || "";
  } catch {
    return "";
  }
}

// Kalit faqat brauzerda; har bir AI so'rovida header orqali yuboriladi.
function withKey(headers = {}) {
  const key = readStoredKey();
  return key ? { ...headers, "X-Gemini-Key": key } : headers;
}

async function handle(res) {
  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      if (data?.detail) detail = data.detail;
    } catch {}
    throw new Error(detail);
  }
  return res.json();
}

export const api = {
  config: () => fetch(`${BASE}/api/config`, { headers: withKey() }).then(handle),

  personas: () => fetch(`${BASE}/api/personas`).then(handle),

  scenarios: (kind = "") =>
    fetch(`${BASE}/api/scenarios${kind ? `?kind=${encodeURIComponent(kind)}` : ""}`).then(handle),

  question: (excludeId, level = "") => {
    const params = new URLSearchParams();
    if (excludeId) params.set("exclude", String(excludeId));
    if (level) params.set("level", level);
    const query = params.toString();
    return fetch(`${BASE}/api/question${query ? `?${query}` : ""}`).then(handle);
  },

  analyze: (transcription, question, mode, scenario = "", persona = "aylin", level = "") =>
    fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: withKey({ "Content-Type": "application/json" }),
      body: JSON.stringify({
        transcription,
        question_tr: question.tr,
        question_uz: question.uz || "",
        mode,
        scenario,
        persona,
        level,
      }),
    }).then(handle),

  translateWord: (word, context = "") =>
    fetch(`${BASE}/api/translate-word`, {
      method: "POST",
      headers: withKey({ "Content-Type": "application/json" }),
      body: JSON.stringify({ word, context }),
    }).then(handle),

  report: (payload) =>
    fetch(`${BASE}/api/report`, {
      method: "POST",
      headers: withKey({ "Content-Type": "application/json" }),
      body: JSON.stringify(payload),
    }).then(handle),

  // Matnni tanlangan personaj ovoziga aylantiradi. Persona profili voice/rate/pitch yuboradi.
  // speed: 0.8 | 1.0 | 1.2. Bepul xizmat, API kalit talab qilmaydi.
  ttsUrl: (text, persona = "aylin", speed = 1) => {
    const profile = typeof persona === "string" ? getPersona(persona) : persona || getPersona("aylin");
    const params = new URLSearchParams({
      text,
      speed: String(speed),
      persona: profile.id || "aylin",
      voice: profile.voice || getPersona("aylin").voice,
      rate: profile.rate || "+0%",
      pitch: profile.pitch || "+0Hz",
    });
    return `${BASE}/api/tts?${params.toString()}`;
  },
};

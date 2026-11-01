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

  scenarios: () => fetch(`${BASE}/api/scenarios`).then(handle),

  question: (excludeId) =>
    fetch(`${BASE}/api/question${excludeId ? `?exclude=${excludeId}` : ""}`).then(handle),

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

  // Matnli javobni mp3 ovozga aylantiradi — faqat Microsoft Emel Neural (tr-TR).
  // speed: 0.8 | 1.0 | 1.2 (balandlik doim 1.0). Bepul xizmat, API kalit talab qilmaydi.
  ttsUrl: (text, speed = 1) =>
    `${BASE}/api/tts?${new URLSearchParams({ text, speed: String(speed) }).toString()}`,
};

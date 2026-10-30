const BASE = import.meta.env.VITE_API_URL || ""; // bo'sh -> same-origin (vite proxy)

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
  config: () => fetch(`${BASE}/api/config`).then(handle),

  question: (excludeId) =>
    fetch(`${BASE}/api/question${excludeId ? `?exclude=${excludeId}` : ""}`).then(handle),

  analyze: (transcription, question, mode) =>
    fetch(`${BASE}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        transcription,
        question_tr: question.tr,
        question_uz: question.uz || "",
        mode,
      }),
    }).then(handle),

  // Matnlik javobni mp3 ogziga aylantiring (Audio elementiga URL sifatida)
  ttsUrl: (text, voice) => {
    const params = new URLSearchParams({ text, ...(voice ? { voice } : {}) });
    return `${BASE}/api/tts?${params.toString()}`;
  },
};

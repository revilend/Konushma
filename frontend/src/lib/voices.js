const MALE_HINTS = ["ahmet", "tolga", "male", "erkek", "murat", "cem", "burak"];
const FEMALE_HINTS = ["emel", "filiz", "female", "kadın", "kadin", "aylin", "seda", "merve", "zeynep"];

const clamp = (value, low, high) => Math.max(low, Math.min(high, value));

function parseRate(value) {
  const match = /^([+-]?)(\d{1,3})%$/.exec(String(value || "").trim());
  if (!match) return 0;
  return (match[1] === "-" ? -1 : 1) * Number(match[2]);
}

export function pickBrowserVoice(persona) {
  if (typeof window === "undefined" || !window.speechSynthesis) return null;
  const voices = window.speechSynthesis
    .getVoices()
    .filter((voice) => String(voice.lang || "").toLowerCase().startsWith("tr"));
  if (!voices.length) return null;
  const hints = persona?.gender === "male" ? MALE_HINTS : FEMALE_HINTS;
  return (
    voices.find((voice) => hints.some((hint) => voice.name.toLowerCase().includes(hint))) ||
    voices[0]
  );
}

export function speakWithBrowser(text, persona = {}, speed = 1) {
  return new Promise((resolve, reject) => {
    if (
      typeof window === "undefined" ||
      !window.speechSynthesis ||
      typeof window.SpeechSynthesisUtterance === "undefined"
    ) {
      reject(new Error("Brauzer ovoz sintezini qo'llamaydi."));
      return;
    }
    if (!text) {
      resolve();
      return;
    }

    const synth = window.speechSynthesis;
    synth.cancel();
    const utterance = new window.SpeechSynthesisUtterance(String(text));
    utterance.lang = "tr-TR";
    utterance.rate = clamp(1 + parseRate(persona.rate) / 100 + (Number(speed) - 1), 0.5, 2);
    utterance.pitch =
      persona.id === "mehmet" ? 0.82 : persona.id === "emre" ? 0.93 : 1.04;
    utterance.volume = 1;

    const voice = pickBrowserVoice(persona);
    if (voice) utterance.voice = voice;

    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };
    utterance.onend = finish;
    utterance.onerror = (event) => {
      if (settled) return;
      settled = true;
      reject(new Error(event.error || "Brauzer ovozi ishlamadi."));
    };
    synth.speak(utterance);
  });
}

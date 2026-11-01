export const LEVEL_TEST = [
  {
    id: 1,
    prompt: "Merhaba, ben Ali. ___ adım Ali.",
    options: ["Benim", "Bana", "Beni"],
    answer: 0,
  },
  {
    id: 2,
    prompt: "Her gün okula ___.",
    options: ["gidiyorum", "gidiyorsun", "gidiyor"],
    answer: 0,
  },
  {
    id: 3,
    prompt: "Dün sinemaya ___.",
    options: ["gidiyorum", "gittim", "gideceğim"],
    answer: 1,
  },
  {
    id: 4,
    prompt: "Eğer hava güzel olursa, parka ___.",
    options: ["gittik", "gidiyorduk", "gideriz"],
    answer: 2,
  },
  {
    id: 5,
    prompt: "Türkçe öğrenmek ___ kolay değil.",
    options: ["beni", "benim için", "bana"],
    answer: 1,
  },
  {
    id: 6,
    prompt: "Kitap masanın ___ duruyor.",
    options: ["üstünde", "üstüne", "üstünden"],
    answer: 0,
  },
  {
    id: 7,
    prompt: "O, her sabah erken ___.",
    options: ["kalktım", "kalkıyorum", "kalkar"],
    answer: 2,
  },
  {
    id: 8,
    prompt: "Bu konuyu daha önce hiç ___.",
    options: ["duymadım", "duymuyorum", "duymayacağım"],
    answer: 0,
  },
];

export function scoreToLevel(score) {
  if (score >= 7) return "B2";
  if (score >= 5) return "B1";
  if (score >= 3) return "A2";
  return "A1";
}

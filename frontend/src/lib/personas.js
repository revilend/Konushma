export const PERSONAS = [
  {
    id: "aylin",
    name: "Aylin Hoca",
    role: "Do'stona o'qituvchi",
    initials: "AH",
    accent: "mint",
    desc_uz: "Xatolarni yumshoq tuzatadi va har javobdan keyin davom etishga undaydi.",
  },
  {
    id: "mehmet",
    name: "Mehmet Usta",
    role: "Bozor sotuvchisi",
    initials: "MU",
    accent: "amber",
    desc_uz: "Narx, sifat va savdolashish haqida tabiiy, jonli suhbat quradi.",
  },
  {
    id: "emre",
    name: "Doktor Emre",
    role: "Shifokor",
    initials: "DE",
    accent: "sky",
    desc_uz: "Salomatlik va kun tartibi haqida xotirjam, sodda savollar beradi.",
  },
];

export function getPersona(id) {
  return PERSONAS.find((persona) => persona.id === id) || PERSONAS[0];
}

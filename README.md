# 🇹🇷 TürkçePrep AI (Aylin Hoca)

Turkchadagi **og'zaki nutq (Konuşma / Speaking) simulatori** — o'zbek tilidan turkchaga o'tmoqchi bo'lganlar uchun GoPrep.gg 😀 uslubida interaktiv "Speaking Challenge" platforma.

Foydalanuvchi **mikrofonda turkcha gapiradi** → Aylin Hoca (AI) eshitadi → necha soniyada:

- 🎯 **Umumiy baho**: CEFR daraja (A1 … C1, `level_score`)
- ❌ **Xatolaring tahlili** — grammatika, lug'at, **soxta do'st so'zlar (false friends)** bilan
- 🇺🇿 **Har bir xato o'zbekcha tushuntiriladi** — nega xato va qaysi turkcha qoida buzilgan
- ✅ **Model javob** — tabiiy turkcha "qanday aytish kerak edi" + jonli ovoz
- ⏭️ **Keyingi savol** — suhbat davom etadi (AI yaratilgan ochiq savol)

## 🏗️ Arxitektura

```
[Interaktiv UI: Vite + React + TailwindCSS + Dark mode]
       |
       |  /api/* (Vite dev proxy → :8000)
       v
[FastAPI backend]
   ├─ /api/question  → savol qutisi (12 ta interview savoli)
   ├─ /api/analyze   → Gemini (asosiy) yoki OpenAI mos API (zaxira)
   │                    qat'iy JSON: transcription + level_score + mistakes +
   │                    model_answer_tr + next_question_tr + positive_note_uz
   ├─ /api/tts       → personajga mos Neural ovoz: Emel (ayol) / Ahmet (erkak)
   └─ /api/config    → AI kaliti sozlanganmi (setup tekshiruvi)
```

- STT: brauzerning **Web Speech SpeechRecognition** API (lang `tr-TR`, bu Chrome va Edge'da ishlaydi). Ishlamasa — qo'lda matn kiriting.
- TTS: Python `edge-tts` → **Aylin uchun Emel**, **Mehmet va Emre uchun Ahmet** Neural ovozi. Har bir personaj o‘z `voice`, `rate` va `pitch` profili bilan gapiradi. Brauzer robot ovozi ishlatilmaydi. Tezlik **0.8x / 1.0x / 1.2x** (UI’dan sozlanadi). Bir marta yaratilgan MP3 `backend/audio/` da keshlanadi; takroriy tinglash darhol ochiladi. Hech qanday API kalit yoki to'lov kerak emas.
- AI tahlil: Google **Gemini** (`gemini-2.5-flash`) qat'iy JSON-sxemasi bilan instruksiyasi — [backend/app/services/instruction.py](backend/app/services/instruction.py). Zaxira variant: OpenAI-mos kalit (`OPENAI_API_KEY`).
- Kalitlama frontend yoki brauzerga YUKLANMAYDI — ular faqat backenddagi `.env` faylida.

## ⚙️ O'rnatish (bir qadamda)

Asosiy shart: **Python 3.10+, Node.js 18+**.

```bash
# Ikki alohida terminal oching
# 1) Backend
cd backend
python -m venv .venv
.venv/bin/pip install -r requirements.txt    # Windows: .venv\Scripts\pip install ...
cp .env.example .env                          # Windows: copy .env.example .env
GEMINI_API_KEY ni aistudio.google.com'dan ol. (.env ichiga yozing)
.venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

# 2) Frontend
cd frontend
npm install
npm run dev   # → http://localhost:3000
```

### AI kalit variantlari

| Variant  | Kalit | Qayerdan olinadi |
|----------|-------|------------------|
| (asos)   | `GEMINI_API_KEY` | aistudio.google.com → "Get API key" |
| (zaxira) | `OPENAI_API_KEY` (+ `OPENAI_BASE_URL`, `OPENAI_MODEL`) | OpenAI mos har qanday provayder |

Bulardan bittasi ham bo'lmasa tahlil ishlamaydi: sayt tepasida sariq `AI kalit sozlanmagan` xabari chiqadi.

### TTS testi (ixtiyoriy)

```bash
cd backend && .venv/bin/python -c "
import asyncio, edge_tts
async def main():
    c = edge_tts.Communicate('Merhaba ben Aylin Hoca!', 'tr-TR-EmelNeural')
    await c.save('/tmp/test.mp3')
asyncio.run(main())"
```

Izoh: edge-tts Microsoft bulutiga tayanadi. `/api/tts` birinchi so'rovda MP3 yaratib `backend/audio/` ga saqlaydi, keyingi so'rovlarda keshdan qaytaradi (`X-TTS-Cache: HIT`). Tarmoq bloklansa brauzer robot ovozi ishga tushmaydi — foydalanuvchiga xato xabari ko'rsatiladi.

## 📞 Jonli Qo'ng'iroq (Hands-free Call)

Asosiy sahifadagi chap yuqoridagi "Jonli Qo'ng'iroq" tugmasi orqali ochiladi:

- "Qo'ng'iroqni boshlash" bosilgach mikrofon uzluksiz tinglaydi (Web Speech API, tr-TR).
- **Sukunat deteksiyasi**: gapirib bo'lib 1.5 soniya jim tursa, javob avtomatik `/api/analyze`ga yuboriladi (`mode: "call"`).
- Tanlangan personajning javobi uning Neural ovozi bilan o'qiladi: Aylin — Emel, Mehmet — Ahmet (+10%, -20Hz), Emre — Ahmet (-5%, +0Hz). Ovoz har doim backenddagi Edge TTS orqali keladi; brauzer robot ovozi ishlatilmaydi.
- Aylin gapirayotganda mikrofon to'liq o'chiriladi; gapirib bitgach avtomatik qayta ochiladi.
- Har javobda xato kartochkalari: ❌ xato, 💡 o'zbekcha qoida, ✅ to'g'risi.
- "Qo'ng'iroqni tugatish" barcha resurslarni tozlaydi.

Texnik: sukunat analizi `AnalyserNode` RMS (chegara 8/255) bilan; TTS ijro paytida mic bloklanadi (echo oldini olish uchun). TTS personaj profili `voice`, `rate` va `pitch` parametrlari bilan yuboriladi; tezlik `speed=0.8|1.0|1.2` personaj rate qiymatiga qo'shiladi. Barcha ovozlar `/api/tts` dan MP3 sifatida olinadi va serverda keshlanadi.

## 📡 API endpoints

| Metod | Yo'l | Vazifa |
|-------|------|--------|
| GET  | `/api/health` | Servis holati |
| GET  | `/api/config` | AI provider holati |
| GET  | `/api/question?exclude=<id>` | Yangi savol |
| POST | `/api/analyze` | `{transcription, question_tr, question_uz, mode}` → tahlil JSON |
| GET  | `/api/tts?text=...&persona=...&voice=...&rate=...&pitch=...` | Turkcha matn → keshlangan `audio/mpeg` |

Swagger: <http://localhost:8000/docs>

### `/api/analyze` JSON shakli

```json
{
  "transcription": "Foydalanuvchi gapirgan matn",
  "level_score": "A1+",
  "mistakes": [
    { "wrong": "katta park", "correct": "büyük park",
      "type": "false_friend", "explanation_uz": "..." }
  ],
  "model_answer_tr": "Ben boş zamanlarımı şehirde ki parkta geçirmek severim.",
  "next_question_tr": "Öyle mi? Peki, parkta bir gün ne yapıyorsun?",
  "positive_note_uz": "..."
}
```

## 🚀 Deploy va davom o'lchovi

- Backend: `uvicorn app.main:app --host 0.0.0.0 --port 8000` (Docker'da ham shu buyruq, requirements.txt bilan).
- Frontend: `npm run build` → `dist/` statik papkasi — istalgan hostinga qo'ysangiz bo'ladi; haqiqiy tarmoqda `VITE_API_URL=https://server-manzilingiz` muhitini belgilab API'ga bog'lang.

## 🩺 FAQ (muammolar)

- **Mikrofon ishlamaydimi?** SpeechRecognition faqat HTTPS (yoki localhost) da ishlaydi — saytni https bilan oching.
- **Turkcha tanilmasa?** "📝 Yozib yuborish" maydoniga matn yozing — tahlil shunday ham ishlaydi.
- **TTS ovoz chiqmasa?** edge-tts Microsoft bulutiga tayanadi. Internetni tekshirib qayta urinib ko'ring; `backend/audio/` yozish huquqini tekshiring. Brauzer robot ovozi ataylab ishlatilmaydi.
- **Deploy paytida?** `.env` faylni repoga tashlamang: `.gitignore` uni himoylaydi.

## 📁 Struktura

```
├── backend/
│   ├── requirements.txt
│   ├── .env.example
│   └── app/
│       ├── main.py                # FastAPI routes
│       ├── config.py              # .env / kalitlar
│       └── services/
│           ├── instruction.py     # Aylin Hoca — imtihonchi instruksiyasi
│           ├── questions.py       # Suhbat savollari bazasi
│           ├── analysis.py        # Gemini + OpenAI zaxira yo'nalish
│           └── tts_service.py     # edge-tts + backend/audio MP3 kesh
└── frontend/
    ├── index.html · vite.config.js
    └── src/
        ├── App.jsx                # asosiy holat + oqim
        ├── main.jsx · index.css
        ├── lib/ api.js, useRecorder.js   # STT + timer + analyser
        └── components/ Header, QuestionCard, RecorderBar, Waveform, ResultPanel

## 🆕 4.0 — CEFR A1–C1, uch rejim va TÖMER

- **Daraja tanlash**: bosh sahifada A1, A2, B1, B2 va C1 tugmalari. Savollar, tushuntirishlar va Aylin Hocaning nutq murakkabligi tanlangan darajaga moslashadi. A1 uchun ovoz 0.8x tezlikda boshlanadi.
- **Serbest Sohbet**: istalgan mavzuda darajaga mos erkin mashq.
- **Rol Oyunu**: Kafede sipariş, Kapalıçarşı'da pazarlık, havalimanında check-in va otelde rezervasyon.
- **TÖMER Konuşma Sınavı**: uch bosqichli imtihon va Akıcılık, Kelime bilgisi, Dilbilgisi bo‘yicha 100 ballik natija kartasi.
- **Feedback kartasi**: har javobdan keyin tuzatish va “Tabiiy jaranglashi” varianti. `key_words` avtomatik lug‘at daftariga qo‘shiladi.
- **Lug‘at daftari**: bosh sahifada suhbatdan saqlangan so‘zlar va ma’nolarining qisqa ro‘yxati; to‘liq daftar va flashcardlar alohida sahifada.
- AI model: `gemini-2.5-flash`.

## 🆕 3.0 — Jonli vizual, tarjima, tezlik va streak

- **🎧 Jonli ovoz to‘lqini**: Aylin gapirganda mayin sintetik to‘lqin, foydalanuvchi gapirganda mikrofon kuchiga qarab balandlik va rang o‘zgaradi (indigo → amber → rose).
- **🇺🇿 O‘zbekcha ma’nosi**: Aylin savolini bir tugma bilan o‘zbekchaga tarjima qilib ko‘rish.
- **💡 Maslahat olish**: javob bera olmasangiz, 2–3 ta namunaviy turkcha javob (o‘zbekcha tarjimasi va 🔊 tinglash bilan).
- **🐢 Ovoz tezligi**: 0.8x (sekin), 1.0x (normal), 1.2x (tez) — qo‘ng‘iroq va simulyatorda, tanlov `localStorage`da saqlanadi.
- **🔥 Streak va kunlik maqsad**: kuniga 5 daqiqa gapirish maqsadi, progress bar, streak header va bosh sahifada; barchasi `localStorage`da (`tp-streak-v1`), server talab qilinmaydi.

## 🆕 2.0 — Hisobot, stsenariylar va lug'at

### 📊 Qo'ng'iroq yakuni hisoboti
End Call bosilgach `/api/report` ishlaydi va ekranda:
- **CEFR daraja** (A1–C1) va umumiy xulosa;
- **3 mezon bo'yicha ball**: Ravonlik (fluency), Lug'at boyligi (vocabulary), Grammatika (grammar);
- **Kuchli tomonlaringiz**;
- **Tuzatish kerak bo'lgan xatolar** (❌ xato → ✅ to'g'risi, 💡 o'zbekcha izoh);
- **Foydali turkcha iboralar** o'zbekcha tarjimasi bilan.

AI kaliti bo'lmasa ham hisobot **lokal statistika** asosida yaratiladi (`source: "local"`); kalit qo'yilganda Gemini to'liq tahlil qiladi (`source: "ai"`).

### 🎭 Mavzuli stsenariylar (`GET /api/scenarios`)
| Stsenariy | Daraja |
|---|---|
| ☕ Kafeda buyurtma berish | A1–A2 |
| 🛍️ Kapalıçarşı'da savdolashish | B1 |
| ✈️ Aeroportda pasport nazorati | A2–B1 |
| 🎓 TÖMER / Yunus Emre og'zaki imtihoni | B2–C1 |
| 💬 Erkin do'stona suhbat | A2–B2 |

Tanlangan stsenariy Aylin Hocaning roli va savollariga uzatiladi (`/api/analyze` dagi `scenario` maydoni).

### 📚 Mening lug'atim
- Har bir xato va yangi ibora yonida **⭐ Saqlash** tugmasi.
- Lug'at `localStorage`da saqlanadi (server/baza talab qilinmaydi).
- Alohida **Lug'atim** sahifasida qidirish, tinglash, o'chirish va **🔁 Takrorlash** (flashcard) rejimi.

## Vercel'ga deploy (bepul)

Loyiha bitta Vercel loyihasida **Vercel Services** orqali ishlaydi: Vite frontend va
FastAPI backend alohida build qilinadi, lekin bitta domenda ochiladi. `/api/*` so'rovlari
backendga, qolgan barcha so'rovlar frontendga yo'naltiriladi — alohida backend URL yoki
`VITE_API_URL` kerak emas.

1. [vercel.com/new](https://vercel.com/new) → GitHub repo (`revilend/Konushma`) ni import qiling.
2. `vercel.json` avtomatik o'qiladi; Framework sozlamasini qo'lda o'zgartirmang.
3. **Environment Variables** bo'limida (ixtiyoriy) qo'shing:
   - `GEMINI_API_KEY` yoki `OPENAI_API_KEY` — brauzerdagi API kalit ishlatilmasa
   - `OPENAI_BASE_URL` / `OPENAI_MODEL` — faqat OpenAI-mos variant uchun
4. **Deploy** bosing.

Services konfiguratsiyasi:

| Fayl | Vazifasi |
|------|----------|
| `frontend/` | Vite service — statik build va SPA |
| `backend/` | FastAPI service — `app.main:app` entrypoint |
| `backend/requirements.txt` | Backend Python bog'liqliklari |
| `vercel.json` | `services` ta'rifi va `/api/(.*)` → `backend` rewritelari |
| `.vercelignore` | `.venv`, `node_modules`, `.env` va boshqa keraksiz fayllarni yuklamaydi |

Eslatmalar:

- TTS (`edge-tts` → personajga mos Emel/Ahmet Neural) Vercel'da ham bepul ishlaydi; API kalit talab qilmaydi. Vercel fayl tizimi vaqtinchalik bo'lsa disk keshi saqlanmasligi mumkin, lekin brauzer keshi va `Cache-Control` ishlaydi.
- Birinchi so'rov "cold start" tufayli 1–3 soniya sekinroq bo'lishi mumkin.
- Hobby tarifi shaxsiy/demo loyihalar uchun; homiy reklama bilan tijoriy foydalanish uchun Pro kerak.
- Agar Microsoft tomonidan `edge-tts` WebSocket'i bloklansa, backendni Render'ga ko'chirish mumkin —
  frontend Vercel'da qoladi, faqat `VITE_API_URL` ni Render manziliga o'zgartirib qayta build qilinadi.

### 3.1. API kalitni brauzerdan kiritish

Endi `backend/.env` ni qo'lda tahrirlash shart emas:

1. Yuqori o'ng burchakdagi **⚙️ API Kalit** tugmasini bosing.
2. [Google AI Studio](https://aistudio.google.com/app/apikey) dan bepul Gemini kalitini oling.
3. Kalitni oynaga kiriting va **Saqlash va boshlash** ni bosing.

Kalit `localStorage` da (`tp-gemini-key`) saqlanadi va har bir `/api/analyze`, `/api/report`, `/api/config` so'rovida `X-Gemini-Key` header'i orqali yuboriladi. Backend uni **saqlamaydi**; `.env` dagi `GEMINI_API_KEY` zaxira variant bo'lib qoladi. Kalit saqlangach ogohlantirish yo'qoladi va qo'ng'iroq darhol ishlaydi. Umumiy kompyuterda kalitni saqlamang.

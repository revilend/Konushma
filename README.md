# 🇹🇷 TürkçePrep AI (Aylin Hoca)

Turkchadagi **og'zaki nutq (Konuşma / Speaking) simulatori** — o'zbek tilidan turkchaga o'tmoqchi bo'lganlar uchun GoPrep.gg 😀 uslubida interaktiv "Speaking Challenge" platforma.

Foydalanuvchi **mikrofonda turkcha gapiradi** → Aylin Hoca (AI) eshitadi → necha soniyada:

- 🎯 **Umumiy baho**: CEFR daraja (A1 … B2, `level_score`)
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
   ├─ /api/tts       → Microsoft Emel Neural · tr-TR (100% bepul, tabiiy ayol ovoz)
   └─ /api/config    → AI kaliti sozlanganmi (setup tekshiruvi)
```

- STT: brauzerning **Web Speech SpeechRecognition** API (lang `tr-TR`, bu Chrome va Edge'da ishlaydi). Ishlamasa — qo'lda matn kiriting.
- TTS: Python `edge-tts` → `tr-TR-EmelNeural` (bepul, natural). Ovoz qat'iy Emel; tezlik **1.0** (`+0%`), balandlik **1.0** (`+0Hz`). Hech qanday API kalit yoki to'lov kerak emas.
- AI tahlil: Google **Gemini** (`gemini-1.5-flash`) qat'iy JSON-sxemasi bilan instruksiyasi — [backend/app/services/instruction.py](backend/app/services/instruction.py). Zaxira variant: OpenAI-mos kalit (`OPENAI_API_KEY`).
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

Izoh: edge-tts Microsoft bulutiga tayanadi — tarmoq uni bloklayotgan bo'lsa TTS xato qaytaradi (tahlil baribir ishlaydi).

## 📞 Jonli Qo'ng'iroq (Hands-free Call)

Asosiy sahifadagi chap yuqoridagi "Jonli Qo'ng'iroq" tugmasi orqali ochiladi:

- "Qo'ng'iroqni boshlash" bosilgach mikrofon uzluksiz tinglaydi (Web Speech API, tr-TR).
- **Sukunat deteksiyasi**: gapirib bo'lib 1.5 soniya jim tursa, javob avtomatik `/api/analyze`ga yuboriladi (`mode: "call"`).
- Aylin Hocaning javobi **tr-TR-EmelNeural** ovozi bilan o'qiladi (brauzer SpeechSynthesis ishlatilmaydi — Google robot ovozi butunlay o'chirilgan).
- Aylin gapirayotganda mikrofon to'liq o'chiriladi; gapirib bitgach avtomatik qayta ochiladi.
- Har javobda xato kartochkalari: ❌ xato, 💡 o'zbekcha qoida, ✅ to'g'risi.
- "Qo'ng'iroqni tugatish" barcha resurslarni tozlaydi.

Texnik: sukunat analizi `AnalyserNode` RMS (chegara 8/255) bilan; TTS ijro paytida mic bloklanadi (echo oldini olish uchun). TTS parametrlari backendda qat'iy: `rate=+0%` (1.0), `pitch=+0Hz` (1.0) — tashqaridan o'zgartirib bo'lmaydi. Brauzer `speechSynthesis` umuman ishlatilmaydi.

## 📡 API endpoints

| Metod | Yo'l | Vazifa |
|-------|------|--------|
| GET  | `/api/health` | Servis holati |
| GET  | `/api/config` | AI provider holati |
| GET  | `/api/question?exclude=<id>` | Yangi savol |
| POST | `/api/analyze` | `{transcription, question_tr, question_uz, mode}` → tahlil JSON |
| GET  | `/api/tts?text=...&voice=...` | Turkcha matn → `audio/mpeg` |

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
- **TTS ovoz chiqmasa?** edge-tts Microsoft bulutiga tayanadi — tarmoq cheklovi bo'lsa qayta urinib tengda, TTS xato qaytarsa tahlil bo'lis yoki.
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
│           └── tts_service.py     # edge-tts (tr-TR-EmelNeural)
└── frontend/
    ├── index.html · vite.config.js
    └── src/
        ├── App.jsx                # asosiy holat + oqim
        ├── main.jsx · index.css
        ├── lib/ api.js, useRecorder.js   # STT + timer + analyser
        └── components/ Header, QuestionCard, RecorderBar, Waveform, ResultPanel

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

## 🚀 Vercel'ga deploy (bepul)

Loyiha bitta Vercel loyihasida ishlaydi: React statik fayllar CDN'dan, `/api/*` esa
FastAPI serverless funksiyasidan beriladi. Alohida backend URL yoki `VITE_API_URL` kerak emas.

1. [vercel.com/new](https://vercel.com/new) → GitHub repo (`revilend/Konushma`) ni import qiling.
2. Framework avtomatik aniqlanadi (FastAPI + `index.py`); sozlamalarni o'zgartirmang.
3. **Environment Variables** bo'limida qo'shing:
   - `GEMINI_API_KEY` (tavsiya) yoki `OPENAI_API_KEY`
   - `OPENAI_BASE_URL` / `OPENAI_MODEL` — faqat OpenAI-mos variant uchun
4. **Deploy** bosing.

Deploy fayllari:

| Fayl | Vazifasi |
|------|----------|
| `index.py` | Vercel entrypoint — `backend/app` dagi FastAPI `app` ni import qiladi |
| `requirements.txt` | Python bog'liqliklar (Vercel Python runtime o'rnatadi) |
| `vercel.json` | Frontend build (`frontend/dist` → `public/`) va funksiya (`maxDuration: 60`) |
| `.vercelignore` | `.venv`, `node_modules`, `.env` va boshqa keraksiz fayllarni yuklamaydi |

Eslatmalar:

- TTS (`edge-tts` → `tr-TR-EmelNeural`) Vercel'da ham bepul ishlaydi; API kalit talab qilmaydi.
- Birinchi so'rov "cold start" tufayli 1–3 soniya sekinroq bo'lishi mumkin.
- Hobby tarifi shaxsiy/demo loyihalar uchun; homiy reklama bilan tijoriy foydalanish uchun Pro kerak.
- Agar Microsoft tomonidan `edge-tts` WebSocket'i bloklansa, backendni Render'ga ko'chirish mumkin —
  frontend Vercel'da qoladi, faqat `VITE_API_URL` ni Render manziliga o'zgartirib qayta build qilinadi.

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
   ├─ /api/tts       → edge-tts · tr-TR-EmelNeural (natural turkcha ayol ovoz)
   └─ /api/config    → AI kaliti sozlanganmi (setup tekshiruvi)
```

- STT: brauzerning **Web Speech SpeechRecognition** API (lang `tr-TR`, bu Chrome va Edge'da ishlaydi). Ishlamasa — qo'lda matn kiriting.
- TTS: Python `edge-tts` → `tr-TR-EmelNeural` (bepul, natural).
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

Texnik: sukunat analizi `AnalyserNode` RMS (chegara 8/255) bilan; TTS ijro paytida mic bloklanadi (echo oldini olish uchun). TTS parametrlari: `rate=+0%`, `pitch=+0Hz` (tabiiy, mayin).

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

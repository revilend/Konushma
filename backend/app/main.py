"""TürkçePrep AI (Aylin Hoca) — FastAPI backend.

BUYRUQLAR:
  POST /api/analyze    -> javob tahlili (transcription + savol konteksti)
  POST /api/report     -> qo'ng'iroq yakuni bo'yicha hisobot (CEFR + 4 mezon)
  GET  /api/tts        -> matnni personajga mos Neural ovozga aylantiradi
  GET  /api/question   -> tasodifiy suhbat savoli
  GET  /api/scenarios  -> mavzuli muloqot stsenariylari
  GET  /api/personas   -> Aylin, Mehmet va Emre personajlari
  POST /api/translate-word -> kontekstli so'z tarjimasi
  GET  /api/config     -> AI provider holati (setup tekshiruvi)
"""
import logging

from fastapi import FastAPI, Header, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from .config import TTS_PITCH, TTS_RATE, TTS_VOICE, ai_provider
from .services.analysis import analyze
from .services.personas import get_persona, list_personas
from .services.questions import random_question
from .services.report import build_report
from .services.scenarios import list_scenarios
from .services.tts_service import synth
from .services.wordbook import translate_word

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="TürkçePrep AI — Aylin Hoca API",
    description="Turk tilidagi og'zaki nutq (speaking) simulatori uchun backend.",
    version="1.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # dev uchun; prod da frontend originesini ko'rsatish
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    transcription: str = Field(min_length=1, max_length=2000)
    question_tr: str = Field(min_length=1, max_length=1000)
    question_uz: str = Field(default="", max_length=1500)
    mode: str = Field(default="practice", pattern="^(practice|exam|call)$")
    scenario: str = Field(default="", max_length=40)
    persona: str = Field(default="aylin", max_length=40)
    level: str = Field(default="", max_length=8)


class TranslateRequest(BaseModel):
    word: str = Field(min_length=1, max_length=80)
    context: str = Field(default="", max_length=600)


class ReportTurn(BaseModel):
    user: str = Field(min_length=1, max_length=2000)
    aylin: str = Field(default="", max_length=2000)
    pronunciation_score: int | None = Field(default=None, ge=0, le=100)


class ReportMistake(BaseModel):
    wrong: str = Field(default="", max_length=500)
    correct: str = Field(default="", max_length=500)
    type: str = Field(default="grammar", max_length=32)
    explanation_uz: str = Field(default="", max_length=1000)


class ReportRequest(BaseModel):
    turns: list[ReportTurn] = Field(default_factory=list, max_length=40)
    mistakes: list[ReportMistake] = Field(default_factory=list, max_length=100)
    scenario: str = Field(default="", max_length=40)


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "turkceprep-ai"}


@app.get("/api/config")
async def config(x_gemini_key: str | None = Header(default=None, alias="X-Gemini-Key")):
    provider = ai_provider(x_gemini_key)
    return {
        "ai_provider": provider,
        "tts_voice": TTS_VOICE,
        "tts_rate": TTS_RATE,
        "tts_pitch": TTS_PITCH,
        "tts_free": True,
        "setup_needed": provider == "none",
    }


@app.get("/api/personas")
async def personas():
    return {"personas": list_personas()}


@app.get("/api/scenarios")
async def scenarios(
    kind: str | None = Query(default=None, pattern="^(free|roleplay|exam)$"),
):
    return {"scenarios": list_scenarios(kind)}


@app.post("/api/translate-word")
async def translate_word_route(
    req: TranslateRequest,
    x_gemini_key: str | None = Header(default=None, alias="X-Gemini-Key"),
):
    return await translate_word(req.word, req.context, x_gemini_key)


@app.get("/api/question")
async def question(
    exclude: int | None = Query(default=None, ge=0),
    level: str | None = Query(default=None, pattern="^(A1|A2|B1|B2|C1)$"),
):
    return random_question(exclude, level)


@app.post("/api/analyze")
async def analyze_route(
    req: AnalyzeRequest,
    x_gemini_key: str | None = Header(default=None, alias="X-Gemini-Key"),
):
    if ai_provider(x_gemini_key) == "none":
        raise HTTPException(
            status_code=503,
            detail=(
                "AI kaliti sozlanmagan. backend/.env faylida GEMINI_API_KEY "
                "yoki OPENAI_API_KEY kalitini kiriting."
            ),
        )
    try:
        result = await analyze(
            req.transcription,
            req.question_tr,
            req.question_uz,
            req.mode,
            req.scenario,
            x_gemini_key,
            req.persona,
            req.level,
        )
    except Exception as exc:
        logging.exception("Tahlil xatosi")
        return JSONResponse(status_code=502, content={"detail": f"Tahlil xatosi: {exc}"})
    return result


@app.post("/api/report")
async def report_route(
    req: ReportRequest,
    x_gemini_key: str | None = Header(default=None, alias="X-Gemini-Key"),
):
    turns = [t.model_dump() for t in req.turns]
    mistakes = [m.model_dump() for m in req.mistakes]
    try:
        return await build_report(turns, mistakes, req.scenario, x_gemini_key)
    except Exception as exc:
        logging.exception("Hisobot xatosi")
        return JSONResponse(status_code=502, content={"detail": f"Hisobot xatosi: {exc}"})


@app.get("/api/tts")
async def tts_route(
    text: str = Query(min_length=1, max_length=600),
    speed: float = Query(default=1.0, ge=0.5, le=1.5),
    persona: str = Query(default="aylin", max_length=40),
    voice: str | None = Query(default=None, max_length=64),
    rate: str | None = Query(default=None, max_length=16),
    pitch: str | None = Query(default=None, max_length=16),
):
    """Matnni tanlangan personaj ovozida mp3 qilib qaytaradi.

    Personaj profili voice, rate va pitch beradi; frontend ularni yuborishi mumkin.
    Tezlik 0.5–1.5, personaj rate qiymatiga qo'shiladi. Bepul, kalitsiz.
    """
    profile = get_persona(persona)
    try:
        audio = await synth(
            text,
            speed,
            voice or profile["voice"],
            rate or profile["rate"],
            pitch or profile["pitch"],
        )
    except Exception as exc:
        logging.exception("TTS xatosi")
        raise HTTPException(status_code=502, detail=f"Ovoz yaratish xato qildi: {exc}")
    return Response(content=audio, media_type="audio/mpeg")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)

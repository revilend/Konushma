"""TürkçePrep AI (Aylin Hoca) — FastAPI backend.

BUYRUQLAR:
  POST /api/analyze   -> javob tahlili (transcription + savol konteksti)
  GET  /api/tts       -> matnni mp3 ovozga aylanta (edge-tts, tr-TR-EmelNeural)
  GET  /api/question  -> tasodifiy suhbat savoli
  GET  /api/config    -> AI provider holati (setup tekshiruvi)
"""
import logging

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import BaseModel, Field

from .config import TTS_VOICE, ai_provider
from .services.analysis import analyze
from .services.questions import random_question
from .services.tts_service import synth

logging.basicConfig(level=logging.INFO)

app = FastAPI(
    title="TürkçePrep AI — Aylin Hoca API",
    description="Turk tilidagi og'zaki nutq (speaking) simulatori uchun backend.",
    version="1.0.0",
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


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "turkceprep-ai"}


@app.get("/api/config")
async def config():
    provider = ai_provider()
    return {
        "ai_provider": provider,
        "tts_voice": TTS_VOICE,
        "setup_needed": provider == "none",
    }


@app.get("/api/question")
async def question(exclude: int | None = Query(default=None, ge=0)):
    return random_question(exclude)


@app.post("/api/analyze")
async def analyze_route(req: AnalyzeRequest):
    if ai_provider() == "none":
        raise HTTPException(
            status_code=503,
            detail=(
                "AI kaliti sozlanmagan. backend/.env faylida GEMINI_API_KEY "
                "yoki OPENAI_API_KEY kalitini kiriting."
            ),
        )
    try:
        result = await analyze(req.transcription, req.question_tr, req.question_uz, req.mode)
    except Exception as exc:
        logging.exception("Tahlil xatosi")
        return JSONResponse(status_code=502, content={"detail": f"Tahllil xato: {exc}"})
    return result


@app.get("/api/tts")
async def tts_route(
        text: str = Query(min_length=1, max_length=600),
        voice: str | None = None,
        rate: str = Query(default="+0%"),
        pitch: str = Query(default="+0Hz"),
):
    try:
        audio = await synth(text, voice, rate, pitch)
    except Exception as exc:
        logging.exception("TTS xatosi")
        raise HTTPException(status_code=502, detail=f"Ovoz yaratish xato qildi: {exc}")
    return Response(content=audio, media_type="audio/mpeg")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)

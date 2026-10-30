"""AI tahlil servisi: Gemini (asosiy) + OpenAI-mos API (zaxira)."""
import json
import logging

import httpx

from ..config import (
    GEMINI_API_KEY,
    GEMINI_MODEL,
    OPENAI_API_KEY,
    OPENAI_BASE_URL,
    OPENAI_MODEL,
    ai_provider,
)
from .instruction import SYSTEM_PROMPT

log = logging.getLogger("aylin.ai")

RESULT_KEYS = [
    "transcription",
    "level_score",
    "mistakes",
    "model_answer_tr",
    "next_question_tr",
    "positive_note_uz",
]

# Gemini uchun qat'iy JSON sxemasi
GEMINI_RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "transcription": {"type": "STRING"},
        "level_score": {"type": "STRING", "description": "A1..B2 daraja"},
        "mistakes": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "wrong": {"type": "STRING"},
                    "correct": {"type": "STRING"},
                    "type": {"type": "STRING", "description": "grammar | vocabulary | false_friend"},
                    "explanation_uz": {"type": "STRING"},
                },
                "required": ["wrong", "correct", "type", "explanation_uz"],
            },
        },
        "model_answer_tr": {"type": "STRING"},
        "next_question_tr": {"type": "STRING"},
        "positive_note_uz": {"type": "STRING"},
    },
    "required": RESULT_KEYS,
}


def _user_prompt(transcription: str, question_tr: str, question_uz: str, mode: str) -> str:
    if mode == "exam":
        rejim = "IMTIHON (qat'iy sinov) rejimi"
    elif mode == "call":
        rejim = "JONLI QO'NG'IROQ (telefon suhbati) rejimi — Aylin javobi qisqa (1-2 jumla), suhbatkor va telefonovaz bo'lsin"
    else:
        rejim = "PRATIK (murabbiy) rejimi"
    return (
        f"REJIM: {rejim}.\n"
        f"AYLIN SAVOL berdi (question_tr): {question_tr}\n"
        f"Savolning o'zbekcha tarjimasi: {question_uz}\n"
        f"FOYDALANUVCHI gapirgan javob (STT transkript): {transcription!r}\n\n"
        "Vazifa: yuqoridagi instruksiya bo'yicha to'liq tahlil qil va FAQAT JSON qaytar."
        " next_question_tr — savolga ulangan yangi tabiiy ochiq savol bo'lsin."
    )


async def _call_gemini(payload: str) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    body = {
        "system_instruction": {"parts": [{"text": SYSTEM_PROMPT}]},
        "contents": [{"role": "user", "parts": [{"text": payload}]}],
        "generationConfig": {
            "temperature": 0.35,
            "responseMimeType": "application/json",
            "responseSchema": GEMINI_RESPONSE_SCHEMA,
        },
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, json=body, headers={"x-goog-api-key": GEMINI_API_KEY})
        r.raise_for_status()
        data = r.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    return _parse_json(text)


async def _call_openai(payload: str) -> dict:
    url = f"{OPENAI_BASE_URL}/chat/completions"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            url,
            json={
                "model": OPENAI_MODEL,
                "temperature": 0.35,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": payload},
                ],
            },
            headers={"Authorization": f"Bearer {OPENAI_API_KEY}"},
        )
        r.raise_for_status()
        data = r.json()
        text = data["choices"][0]["message"]["content"]
    return _parse_json(text)


def _parse_json(text: str) -> dict:
    # Ponme: model ba'zan ```json ... ``` bilan qaytishi mumkin
    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`\n")
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


def _normalize(result: dict, transcription: str) -> dict:
    out = {k: result.get(k) for k in RESULT_KEYS}
    out["transcription"] = out.get("transcription") or transcription
    out["mistakes"] = (out.get("mistakes") or [])[:10]
    for m in out["mistakes"]:
        m["wrong"] = str(m.get("wrong", ""))
        m["correct"] = str(m.get("correct", ""))
        m["type"] = str(m.get("type", "grammar"))[:32]
        m["explanation_uz"] = str(m.get("explanation_uz", ""))
    out["level_score"] = out.get("level_score") or "A1+"
    out["model_answer_tr"] = out.get("model_answer_tr") or ""
    out["next_question_tr"] = out.get("next_question_tr") or ""
    out["positive_note_uz"] = out.get("positive_note_uz") or ""
    return out


async def analyze(transcription: str, question_tr: str, question_uz: str, mode: str = "practice") -> dict:
    provider = ai_provider()
    if provider == "none":
        raise RuntimeError("AI kaliti yo'q: GEMINI_API_KEY yoki OPENAI_API_KEY sozlanmagan.")
    payload = _user_prompt(transcription, question_tr, question_uz, mode)
    try:
        result = await _call_gemini(payload) if provider == "gemini" else await _call_openai(payload)
    except Exception as exc:  # zaxira yo'nalishiga soq typalist
        log.warning("Asosiy provider xato berdi: %s", exc)
        if ai_provider() == "gemini" and OPENAI_API_KEY:
            result = await _call_openai(payload)
        else:
            raise
    return _normalize(result, transcription)

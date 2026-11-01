"""AI tahlil servisi: Gemini (asosiy) + OpenAI-mos API (zaxira)."""
import json
import logging
import re

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
from .personas import get_persona
from .scenarios import get_scenario

log = logging.getLogger("aylin.ai")

RESULT_KEYS = [
    "transcription",
    "level_score",
    "mistakes",
    "model_answer_tr",
    "next_question_tr",
    "positive_note_uz",
    "useful_phrases",
    "next_question_uz",
    "answer_hints",
    "pronunciation_score",
]

# Gemini uchun qat'iy JSON sxemasi
GEMINI_RESPONSE_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "transcription": {"type": "STRING"},
        "level_score": {"type": "STRING", "description": "A1..B2 daraja"},
        "pronunciation_score": {
            "type": "INTEGER",
            "description": "55-98 oralig'ida taxminiy talaffuz bahosi (transkript asosida)",
        },
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
        "next_question_uz": {"type": "STRING", "description": "next_question_tr ning o'zbekcha tarjimasi"},
        "positive_note_uz": {"type": "STRING"},
        "answer_hints": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {"tr": {"type": "STRING"}, "uz": {"type": "STRING"}},
                "required": ["tr", "uz"],
            },
        },
        "useful_phrases": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {"tr": {"type": "STRING"}, "uz": {"type": "STRING"}},
                "required": ["tr", "uz"],
            },
        },
    },
    "required": RESULT_KEYS,
}


def _user_prompt(
    transcription: str,
    question_tr: str,
    question_uz: str,
    mode: str,
    scenario_id: str = "",
    persona_id: str = "aylin",
    level: str = "",
) -> str:
    if mode == "exam":
        rejim = "IMTIHON (qat'iy sinov) rejimi"
    elif mode == "call":
        rejim = "JONLI QO'NG'IROQ (telefon suhbati) rejimi — suhbatdosh javobi qisqa (1-2 jumla), suhbatkor va telefonovoz bo'lsin"
    else:
        rejim = "PRATIK (murabbiy) rejimi"
    sc = get_scenario(scenario_id)
    persona = get_persona(persona_id)
    scenario_line = (
        f"STENARIY: {sc['title_uz']} ({sc['level']}) — {sc['context']}\n" if sc else ""
    )
    persona_line = (
        f"SUHBATDOSH: {persona['name']} — {persona['role']}. "
        f"Ohang: {persona['tone']}. O'zingni shu personaj sifatida tut; ismingni shu nom bilan ayt.\n"
    )
    level_line = f"FOYDALANUVCHI DARAJASI: {level}. Tushuntirish va savollarni shu darajaga moslashtir.\n" if level else ""
    return (
        f"REJIM: {rejim}.\n"
        f"{scenario_line}"
        f"{persona_line}"
        f"{level_line}"
        f"SAVOL (question_tr): {question_tr}\n"
        f"Savolning o'zbekcha tarjimasi: {question_uz}\n"
        f"FOYDALANUVCHI gapirgan javob (STT transkript): {transcription!r}\n\n"
        "Vazifa: yuqoridagi instruksiya bo'yicha to'liq tahlil qil va FAQAT JSON qaytar."
        " next_question_tr — savolga ulangan, stsenariy va personajga mos yangi tabiiy ochiq savol bo'lsin."
        " useful_phrases — shu javobda ishlatilishi mumkin bo'lgan 1-3 ta foydali turkcha ibora (o'zbekcha tarjimasi bilan)."
        " next_question_uz — next_question_tr ning tabiiy o'zbekcha tarjimasi."
        " answer_hints — foydalanuvchi javob bera olmay qolsa ishlatadigan 2-3 ta qisqa namunaviy turkcha javob (tr + uz)."
        " pronunciation_score — transkript ravonligi, so'z aniqligi va xatolar soniga qarab 55-98 oralig'ida taxminiy talaffuz foizi."
    )


def _estimate_pronunciation(transcription: str, mistakes: list, level: str = "") -> int:
    words = re.findall(r"[\wçğıöşüâîû]+", transcription or "", flags=re.UNICODE)
    score = 90 - len(mistakes or []) * 4.5 + min(len(words), 24) * 0.45
    if len(words) < 4:
        score -= 8
    if (level or "").upper().startswith("B"):
        score += 1
    return max(55, min(98, int(round(score))))


async def _call_gemini(
    payload: str,
    system_prompt: str = SYSTEM_PROMPT,
    schema: dict | None = None,
    api_key: str | None = None,
) -> dict:
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent"
    body = {
        "system_instruction": {"parts": [{"text": system_prompt}]},
        "contents": [{"role": "user", "parts": [{"text": payload}]}],
        "generationConfig": {
            "temperature": 0.35,
            "responseMimeType": "application/json",
            "responseSchema": schema or GEMINI_RESPONSE_SCHEMA,
        },
    }
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(url, json=body, headers={"x-goog-api-key": api_key or GEMINI_API_KEY})
        r.raise_for_status()
        data = r.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
    return _parse_json(text)


async def _call_openai(payload: str, system_prompt: str = SYSTEM_PROMPT) -> dict:
    url = f"{OPENAI_BASE_URL}/chat/completions"
    async with httpx.AsyncClient(timeout=60) as client:
        r = await client.post(
            url,
            json={
                "model": OPENAI_MODEL,
                "temperature": 0.35,
                "response_format": {"type": "json_object"},
                "messages": [
                    {"role": "system", "content": system_prompt},
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
    raw = text.strip()
    if raw.startswith("```"):
        raw = raw.strip("`\n")
        if raw.startswith("json"):
            raw = raw[4:]
    return json.loads(raw)


async def call_llm(
    payload: str,
    system_prompt: str = SYSTEM_PROMPT,
    schema: dict | None = None,
    api_key: str | None = None,
) -> dict:
    """Provider tanlab, JSON javob qaytaradi (Gemini -> OpenAI zaxira)."""
    provider = ai_provider(api_key)
    if provider == "none":
        raise RuntimeError("AI kaliti yo'q: API kalit kiriting yoki GEMINI_API_KEY sozlang.")
    try:
        return (
            await _call_gemini(payload, system_prompt, schema, api_key)
            if provider == "gemini"
            else await _call_openai(payload, system_prompt)
        )
    except Exception as exc:
        log.warning("Asosiy provider xato berdi: %s", exc)
        if provider == "gemini" and OPENAI_API_KEY:
            return await _call_openai(payload, system_prompt)
        raise


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
    try:
        pronunciation = int(round(float(out.get("pronunciation_score"))))
    except (TypeError, ValueError):
        pronunciation = 0
    if not 40 <= pronunciation <= 100:
        pronunciation = _estimate_pronunciation(transcription, out["mistakes"], out["level_score"])
    out["pronunciation_score"] = max(55, min(98, pronunciation))
    out["model_answer_tr"] = out.get("model_answer_tr") or ""
    out["next_question_tr"] = out.get("next_question_tr") or ""
    out["next_question_uz"] = out.get("next_question_uz") or ""
    out["positive_note_uz"] = out.get("positive_note_uz") or ""
    out["answer_hints"] = [
        {"tr": str(h.get("tr", ""))[:300], "uz": str(h.get("uz", ""))[:300]}
        for h in (out.get("answer_hints") or [])
        if h.get("tr")
    ][:3]
    out["useful_phrases"] = [
        {"tr": str(p.get("tr", ""))[:300], "uz": str(p.get("uz", ""))[:300]}
        for p in (out.get("useful_phrases") or [])
        if p.get("tr")
    ][:4]
    return out


async def analyze(
    transcription: str,
    question_tr: str,
    question_uz: str,
    mode: str = "practice",
    scenario: str = "",
    api_key: str | None = None,
    persona: str = "aylin",
    level: str = "",
) -> dict:
    payload = _user_prompt(
        transcription, question_tr, question_uz, mode, scenario, persona, level
    )
    result = await call_llm(payload, api_key=api_key)
    return _normalize(result, transcription)

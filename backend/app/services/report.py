"""Qo'ng'iroq yakuni bo'yicha natijalar hisoboti."""
import logging
import re

from ..config import ai_provider
from .analysis import call_llm
from .scenarios import get_scenario, local_phrases

log = logging.getLogger("aylin.report")

REPORT_PROMPT = """Sen Aylin Hoca — tajribali turk tili o'qituvchisi. Senga jonli telefon suhbati transkripti beriladi.
Faqat JSON qaytar, izoh yozma. Baholash mezonlari:
- cefr: A1, A2, B1, B2 yoki C1.
- scores: fluency (ravonlik), vocabulary (lug'at boyligi), grammar (grammatika) — har biri 0-100 butun son.
- strengths_uz: 2-4 ta qisqa o'zbekcha xulosa, foydalanuvchining kuchli tomonlari.
- mistakes: 1-6 ta asosiy xato; wrong, correct, type (grammar|vocabulary|false_friend), explanation_uz.
- phrases: 3-6 ta suhbatda ishlatilgan yoki aytilishi kerak bo'lgan foydali turkcha ibora; tr va o'zbekcha uz tarjimasi.
- summary_uz: 2-3 jumlalik umumiy xulosa va tavsiya.
Baholashda javoblarning uzunligi, xilma-xilligi va xatolar sonini hisobga ol."""

REPORT_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "cefr": {"type": "STRING"},
        "scores": {
            "type": "OBJECT",
            "properties": {
                "fluency": {"type": "INTEGER"},
                "vocabulary": {"type": "INTEGER"},
                "grammar": {"type": "INTEGER"},
            },
            "required": ["fluency", "vocabulary", "grammar"],
        },
        "strengths_uz": {"type": "ARRAY", "items": {"type": "STRING"}},
        "mistakes": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {
                    "wrong": {"type": "STRING"},
                    "correct": {"type": "STRING"},
                    "type": {"type": "STRING"},
                    "explanation_uz": {"type": "STRING"},
                },
                "required": ["wrong", "correct", "type", "explanation_uz"],
            },
        },
        "phrases": {
            "type": "ARRAY",
            "items": {
                "type": "OBJECT",
                "properties": {"tr": {"type": "STRING"}, "uz": {"type": "STRING"}},
                "required": ["tr", "uz"],
            },
        },
        "summary_uz": {"type": "STRING"},
    },
    "required": ["cefr", "scores", "strengths_uz", "mistakes", "phrases", "summary_uz"],
}


def _clamp(value: float, low: int = 20, high: int = 98) -> int:
    return max(low, min(high, int(round(value))))


def _cefr(score: float) -> str:
    if score >= 85:
        return "C1"
    if score >= 75:
        return "B2"
    if score >= 63:
        return "B1"
    if score >= 50:
        return "A2"
    return "A1"


def _dedupe_mistakes(mistakes: list[dict]) -> list[dict]:
    seen, out = set(), []
    for m in mistakes:
        key = (str(m.get("wrong", "")).strip().lower(), str(m.get("correct", "")).strip().lower())
        if not key[0] or key in seen:
            continue
        seen.add(key)
        out.append(
            {
                "wrong": str(m.get("wrong", ""))[:200],
                "correct": str(m.get("correct", ""))[:200],
                "type": str(m.get("type", "grammar"))[:32],
                "explanation_uz": str(m.get("explanation_uz", ""))[:500],
            }
        )
        if len(out) >= 8:
            break
    return out


def _local_report(turns: list[dict], mistakes: list[dict], scenario_id: str) -> dict:
    users = [str(t.get("user", "")).strip() for t in turns if str(t.get("user", "")).strip()]
    sc = get_scenario(scenario_id)
    if not users:
        return {
            "cefr": "A1",
            "scores": {"fluency": 20, "vocabulary": 20, "grammar": 20},
            "strengths_uz": ["Suhbatga vaqt ajratdingiz — keyingi qo'ng'iroqda kamida 2-3 jumla gapirib ko'ring."],
            "mistakes": [],
            "phrases": local_phrases(scenario_id)[:5],
            "summary_uz": "Bu qo'ng'iroqda javob qayd etilmadi. Mikrofon ruxsatini tekshirib, qaytadan urinib ko'ring.",
            "scenario": sc["title_uz"] if sc else "Erkin suhbat",
            "source": "local",
        }
    words = [w for u in users for w in re.findall(r"\w+", u, flags=re.UNICODE)]
    avg_words = len(words) / max(1, len(users))
    unique = len({w.lower() for w in words})
    unique_ratio = unique / max(1, len(words))
    deduped = _dedupe_mistakes(mistakes)

    fluency = _clamp(38 + avg_words * 3.2 + min(len(users), 8) * 1.6)
    vocabulary = _clamp(40 + min(unique, 90) * 0.5 + unique_ratio * 28)
    grammar = _clamp(94 - len(deduped) * 5.5 - (8 if avg_words < 4 else 0))
    overall = (fluency + vocabulary + grammar) / 3

    strengths = []
    if fluency >= 65:
        strengths.append("Ravon va uzluksiz gapirdingiz — suhbatni davom ettirishda dadil bo'ldingiz.")
    if vocabulary >= 60:
        strengths.append("Turli so'z va iboralardan foydalandingiz, lug'at boyligingiz yaxshi.")
    if grammar >= 65:
        strengths.append("Gap tuzilmalari aniq; qo'shimchalarni to'g'ri qo'lladingiz.")
    if not strengths:
        strengths.append("Suhbatni boshladingiz va fikringizni turkcha ifodalashga harakat qildingiz.")
        strengths.append("Davomiy mashq bilan ravonlik tez oshadi — har kuni 5 daqiqa gapiring.")

    phrases = local_phrases(scenario_id)
    summary = (
        f"Qo'ng'iroqda {len(users)} ta javob berdingiz va o'rtacha {avg_words:.1f} so'z ishlatdingiz. "
        f"Umumiy darajangiz {_cefr(overall)}. "
        + ("Keyingi safar xatolarni takrorlamaslik uchun saqlangan iboralarni mashq qiling."
           if deduped else "Xatolar kam — murakkabroq mavzularni sinab ko'ring.")
    )
    return {
        "cefr": _cefr(overall),
        "scores": {"fluency": fluency, "vocabulary": vocabulary, "grammar": grammar},
        "strengths_uz": strengths[:4],
        "mistakes": deduped,
        "phrases": phrases[:5],
        "summary_uz": summary,
        "scenario": sc["title_uz"] if sc else "Erkin suhbat",
        "source": "local",
    }


def _normalize(raw: dict, turns: list[dict], mistakes: list[dict], scenario_id: str) -> dict:
    scores = raw.get("scores") or {}
    result = {
        "cefr": str(raw.get("cefr") or "A2").upper()[:3],
        "scores": {
            "fluency": _clamp(float(scores.get("fluency", 60))),
            "vocabulary": _clamp(float(scores.get("vocabulary", 60))),
            "grammar": _clamp(float(scores.get("grammar", 60))),
        },
        "strengths_uz": [str(s)[:400] for s in (raw.get("strengths_uz") or [])][:5],
        "mistakes": _dedupe_mistakes(raw.get("mistakes") or mistakes),
        "phrases": [
            {"tr": str(p.get("tr", ""))[:300], "uz": str(p.get("uz", ""))[:300]}
            for p in (raw.get("phrases") or [])
            if p.get("tr")
        ][:6],
        "summary_uz": str(raw.get("summary_uz") or "")[:800],
        "source": "ai",
    }
    if not result["phrases"]:
        result["phrases"] = local_phrases(scenario_id)[:5]
    if not result["strengths_uz"]:
        result["strengths_uz"] = ["Suhbatni yakunladingiz — davom etish eng muhim qadam."]
    if not result["summary_uz"]:
        result["summary_uz"] = "Suhbat yakunlandi. Natijalarni tahlil qilib, keyingi qo'ng'iroqda mashqni davom ettiring."
    sc = get_scenario(scenario_id)
    result["scenario"] = sc["title_uz"] if sc else "Erkin suhbat"
    return result


async def build_report(turns: list[dict], mistakes: list[dict], scenario_id: str = "") -> dict:
    if ai_provider() == "none" or not turns:
        return _local_report(turns, mistakes, scenario_id)
    sc = get_scenario(scenario_id)
    scenario_line = f"STENARIY: {sc['title_uz']} ({sc['level']}). {sc['context']}" if sc else "STENARIY: erkin suhbat."
    lines = [f"STENARIY: {scenario_line}", "SUHBAT TRANSKRIPTI:"]
    for i, t in enumerate(turns, 1):
        lines.append(f"{i}. Foydalanuvchi: {t.get('user', '')}")
        if t.get("aylin"):
            lines.append(f"   Aylin Hoca: {t.get('aylin', '')}")
    if mistakes:
        lines.append("\nSUHBATDA ANIQLANGAN XATOLAR:")
        for m in _dedupe_mistakes(mistakes)[:10]:
            lines.append(f"- {m['wrong']} -> {m['correct']} ({m['explanation_uz']})")
    payload = "\n".join(lines) + "\n\nYuqoridagi suhbat bo'yicha hisobotni FAQAT JSON qilib qaytar."
    try:
        raw = await call_llm(payload, REPORT_PROMPT, REPORT_SCHEMA)
        return _normalize(raw, turns, mistakes, scenario_id)
    except Exception as exc:
        log.warning("AI hisobot xatosi, lokal hisob ishlatiladi: %s", exc)
        return _local_report(turns, mistakes, scenario_id)

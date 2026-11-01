"""Turkcha Neural ovozlar — personajga mos voice, rate va pitch.

Aylin: Emel (ayol). Mehmet va Emre: Ahmet (erkak). Foydalanuvchi tezligi
personajning asosiy rate qiymatiga qo'shiladi: 0.8x -> -20%, 1.2x -> +20%.
"""
import re

import edge_tts

from ..config import TTS_PITCH, TTS_RATE, TTS_VOICE

MAX_CHARS = 600
ALLOWED_VOICES = {"tr-TR-EmelNeural", "tr-TR-AhmetNeural"}
RATE_RE = re.compile(r"^([+-]?)(\d{1,3})%$")
PITCH_RE = re.compile(r"^([+-]?)(\d{1,3})Hz$", re.IGNORECASE)


def _clamp(value: int, low: int, high: int) -> int:
    return max(low, min(high, value))


def normalize_rate(value: str | None, fallback: str = TTS_RATE) -> str:
    match = RATE_RE.fullmatch((value or "").strip())
    if not match:
        match = RATE_RE.fullmatch(fallback.strip())
    if not match:
        return "+0%"
    sign = -1 if match.group(1) == "-" else 1
    percent = _clamp(sign * int(match.group(2)), -60, 60)
    return f"{percent:+d}%"


def normalize_pitch(value: str | None, fallback: str = TTS_PITCH) -> str:
    match = PITCH_RE.fullmatch((value or "").strip())
    if not match:
        match = PITCH_RE.fullmatch(fallback.strip())
    if not match:
        return "+0Hz"
    sign = -1 if match.group(1) == "-" else 1
    hz = _clamp(sign * int(match.group(2)), -50, 50)
    return f"{hz:+d}Hz"


def resolve_voice(value: str | None) -> str:
    return value if value in ALLOWED_VOICES else TTS_VOICE


def rate_for_speed(speed: float = 1.0, base_rate: str | None = None) -> str:
    """Personaj rate qiymatiga foydalanuvchi tezligini qo'shadi."""
    base_match = RATE_RE.fullmatch(normalize_rate(base_rate))
    base = int(base_match.group(1) + base_match.group(2)) if base_match else 0
    speed_pct = int(round((float(speed) - 1.0) * 100))
    return f"{_clamp(base + speed_pct, -60, 60):+d}%"


async def synth(
    text: str,
    speed: float = 1.0,
    voice: str | None = None,
    rate: str | None = None,
    pitch: str | None = None,
) -> bytes:
    """Matnni tanlangan personaj ovozida mp3 ga aylantiradi."""
    clean = " ".join(text.strip().split())[:MAX_CHARS]
    if not clean:
        return b""
    communicate = edge_tts.Communicate(
        clean,
        resolve_voice(voice),
        rate=rate_for_speed(speed, rate),
        pitch=normalize_pitch(pitch),
    )
    chunks: list[bytes] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    if not chunks:
        raise RuntimeError("edge-tts audio qaytarmadi (tarmoq cheklovi bo'lishi mumkin).")
    return b"".join(chunks)

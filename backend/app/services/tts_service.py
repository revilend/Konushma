"""Turkcha Neural ovozlar — personajga mos voice, rate va pitch.

Aylin: Emel (ayol). Mehmet va Emre: Ahmet (erkak). Foydalanuvchi tezligi
personajning asosiy rate qiymatiga qo'shiladi: 0.8x -> -20%, 1.2x -> +20%.
"""
import hashlib
import logging
import os
import re
import uuid
from pathlib import Path

import edge_tts

from ..config import TTS_PITCH, TTS_RATE, TTS_VOICE

MAX_CHARS = 600
ALLOWED_VOICES = {"tr-TR-EmelNeural", "tr-TR-AhmetNeural"}
RATE_RE = re.compile(r"^([+-]?)(\d{1,3})%$")
PITCH_RE = re.compile(r"^([+-]?)(\d{1,3})Hz$", re.IGNORECASE)
AUDIO_DIR = Path(__file__).resolve().parents[2] / "audio"
CACHE_VERSION = "edge-tts-v1"


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


def build_profile(
    text: str,
    speed: float = 1.0,
    voice: str | None = None,
    rate: str | None = None,
    pitch: str | None = None,
) -> tuple[str, str, str, str]:
    """Matn va TTS parametrlarini bitta normallashtirilgan profilga yig'adi."""
    clean = " ".join(text.strip().split())[:MAX_CHARS]
    return (
        clean,
        resolve_voice(voice),
        rate_for_speed(speed, rate),
        normalize_pitch(pitch),
    )


def cache_path(clean: str, voice: str, rate: str, pitch: str) -> Path:
    """Bir xil matn va ovoz profili uchun barqaror MP3 fayl nomi."""
    payload = "\x1f".join((CACHE_VERSION, clean, voice, rate, pitch))
    digest = hashlib.sha256(payload.encode("utf-8")).hexdigest()[:32]
    return AUDIO_DIR / f"{digest}.mp3"


def read_cached(path: Path) -> bytes | None:
    try:
        if path.is_file() and path.stat().st_size > 0:
            return path.read_bytes()
    except OSError:
        logging.warning("TTS keshini o'qib bo'lmadi: %s", path, exc_info=True)
    return None


def write_cached(path: Path, audio: bytes) -> None:
    """MP3 ni atomar yozadi; bir vaqtda kelgan so'rovlar faylni buzmaydi."""
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        temp = path.with_name(f".{path.name}.{os.getpid()}.{uuid.uuid4().hex}.tmp")
        temp.write_bytes(audio)
        os.replace(temp, path)
    except OSError:
        logging.warning("TTS keshini yozib bo'lmadi: %s", path, exc_info=True)


async def synth(
    text: str,
    speed: float = 1.0,
    voice: str | None = None,
    rate: str | None = None,
    pitch: str | None = None,
) -> bytes:
    """Matnni tanlangan personaj ovozida mp3 ga aylantiradi."""
    clean, actual_voice, actual_rate, actual_pitch = build_profile(text, speed, voice, rate, pitch)
    if not clean:
        return b""
    communicate = edge_tts.Communicate(
        clean,
        actual_voice,
        rate=actual_rate,
        pitch=actual_pitch,
    )
    chunks: list[bytes] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    if not chunks:
        raise RuntimeError("edge-tts audio qaytarmadi (tarmoq cheklovi bo'lishi mumkin).")
    return b"".join(chunks)


async def synth_cached(
    text: str,
    speed: float = 1.0,
    voice: str | None = None,
    rate: str | None = None,
    pitch: str | None = None,
) -> tuple[bytes, bool]:
    """Avval `backend/audio` dan MP3 qidiradi, bo'lmasa yaratib keshlaydi."""
    clean, actual_voice, actual_rate, actual_pitch = build_profile(text, speed, voice, rate, pitch)
    if not clean:
        return b"", False
    path = cache_path(clean, actual_voice, actual_rate, actual_pitch)
    cached = read_cached(path)
    if cached is not None:
        return cached, True
    audio = await synth(clean, 1.0, actual_voice, actual_rate, actual_pitch)
    write_cached(path, audio)
    return audio, False

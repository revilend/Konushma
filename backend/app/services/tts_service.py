"""Microsoft Emel Neural (tr-TR-EmelNeural) — bepul, tabiiy turkcha ovoz.

Ovoz va balandlik qat'iy (Emel / 1.0 pitch). Tezlik faqat 0.8x, 1.0x, 1.2x
oralig'ida o'zgartiriladi — yangi boshlovchilar uchun sekinlashtirish mumkin.
"""
import edge_tts

from ..config import TTS_PITCH, TTS_VOICE

MAX_CHARS = 600


def rate_for_speed(speed: float) -> str:
    """0.8 -> -20%, 1.0 -> +0%, 1.2 -> +20%."""
    pct = int(round((float(speed) - 1.0) * 100))
    pct = max(-50, min(50, pct))
    return f"{pct:+d}%"


async def synth(text: str, speed: float = 1.0) -> bytes:
    """Matnni mp3 ga aylantiradi (bytes qaytadi)."""
    clean = " ".join(text.strip().split())[:MAX_CHARS]
    if not clean:
        return b""
    communicate = edge_tts.Communicate(clean, TTS_VOICE, rate=rate_for_speed(speed), pitch=TTS_PITCH)
    chunks: list[bytes] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    if not chunks:
        raise RuntimeError("edge-tts audio qaytarmadi (tarmoq cheklovi bo'lishi mumkin).")
    return b"".join(chunks)

"""Microsoft Emel Neural (tr-TR-EmelNeural) — bepul, tabiiy turkcha ovoz.

Ovoz, tezlik (1.0) va balandlik (1.0) qat'iy belgilangan; tashqi parametr bilan
almashtirib bo'lmaydi. edge-tts Microsoftning bepul ovozi — API kalit talab qilmaydi.
"""
import edge_tts

from ..config import TTS_PITCH, TTS_RATE, TTS_VOICE

MAX_CHARS = 600


async def synth(text: str) -> bytes:
    """Matnni mp3 ga aylandira (bytes qaytadi)."""
    clean = " ".join(text.strip().split())[:MAX_CHARS]
    if not clean:
        return b""
    communicate = edge_tts.Communicate(clean, TTS_VOICE, rate=TTS_RATE, pitch=TTS_PITCH)
    chunks: list[bytes] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    if not chunks:
        raise RuntimeError("edge-tts audio qaytarmadi (tarmoq cheklovi bo'lishi mumkin).")
    return b"".join(chunks)

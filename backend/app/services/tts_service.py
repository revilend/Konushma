"""edge-tts orqali natural ovoz chiqarish (tr-TR-EmelNeural)."""
import edge_tts

from ..config import TTS_VOICE

MAX_CHARS = 600


async def synth(text: str, voice: str | None = None, rate: str = "+0%", pitch: str = "+0Hz") -> bytes:
    """Matnni mp3 ga aylandira (bytes qaytadi)."""
    clean = " ".join(text.strip().split())[:MAX_CHARS]
    if not clean:
        return b""
    communicate = edge_tts.Communicate(clean, voice or TTS_VOICE, rate=rate, pitch=pitch)
    chunks: list[bytes] = []
    async for chunk in communicate.stream():
        if chunk["type"] == "audio":
            chunks.append(chunk["data"])
    if not chunks:
        raise RuntimeError("edge-tts audio qaytarmadi (tarmoq cheklovi bo'lishi mumkin).")
    return b"".join(chunks)

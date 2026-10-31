"""Konfiguratsiya — kalitlar faqat .env / tizim muhitidan o'qiladi."""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://freebuff.com/api/v1/paid").rstrip("/")
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

# edge-tts ovozi — Microsoft Emel Neural (tr-TR), 100% bepul, API kalit kerak emas.
# Bu qiymatlar .env orqali o'zgartirilmaydi: ovoz doim Emel, tezlik/balandlik 1.0.
TTS_VOICE: str = "tr-TR-EmelNeural"
TTS_RATE: str = "+0%"   # 1.0 tezlik (tabiiy)
TTS_PITCH: str = "+0Hz"  # 1.0 balandlik (tabiiy)


def clean_api_key(value: str | None) -> str:
    return (value or "").strip()


def ai_provider(api_key: str | None = None) -> str:
    """Mijoz yuborgan kalit ustuvor; u bo'lmasa .env kalitlari ishlatiladi."""
    if clean_api_key(api_key):
        return "gemini"
    if GEMINI_API_KEY:
        return "gemini"
    if OPENAI_API_KEY:
        return "openai"
    return "none"

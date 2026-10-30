"""Konfiguratsiya — kalitlar faqat .env / tizim muhitidan o'qiladi."""
import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "").strip()

OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_BASE_URL: str = os.getenv("OPENAI_BASE_URL", "https://freebuff.com/api/v1/paid").rstrip("/")
OPENAI_MODEL: str = os.getenv("OPENAI_MODEL", "gpt-4o-mini").strip()

GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash").strip()

# edge-tts ovozi
TTS_VOICE: str = os.getenv("TTS_VOICE", "tr-TR-EmelNeural").strip()


def ai_provider() -> str:
    if GEMINI_API_KEY:
        return "gemini"
    if OPENAI_API_KEY:
        return "openai"
    return "none"

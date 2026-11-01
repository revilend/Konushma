"""Smart lug'at: AI bilan so'z tarjimasi va kalitsiz lokal zaxira."""
import logging
import re

from ..config import ai_provider
from .analysis import call_llm

log = logging.getLogger("aylin.wordbook")

WORD_PROMPT = """Sen turkcha-o'zbekcha lug'at yordamchisisan. Berilgan turkcha so'zni kontekstda tahlil qil.
Faqat JSON qaytar: word, translation_uz, part_of_speech, example_tr, example_uz.
translation_uz — qisqa va tabiiy o'zbekcha tarjima. example_tr — so'z ishtirok etgan bitta qisqa turkcha gap.
example_uz — o'sha gapning o'zbekcha tarjimasi. Kontekst bo'lsa, so'zning o'sha ma'nosini tanla."""

WORD_SCHEMA = {
    "type": "OBJECT",
    "properties": {
        "word": {"type": "STRING"},
        "translation_uz": {"type": "STRING"},
        "part_of_speech": {"type": "STRING"},
        "example_tr": {"type": "STRING"},
        "example_uz": {"type": "STRING"},
    },
    "required": ["word", "translation_uz", "part_of_speech", "example_tr", "example_uz"],
}

# AI kaliti bo'lmaganda ham asosiy suhbat so'zlarini ko'rsatish uchun lokal zaxira.
LOCAL_WORDS: dict[str, str] = {
    "merhaba": "salom", "selam": "salom", "günaydın": "xayrli tong", "iyi": "yaxshi",
    "günler": "kunlar", "hoş": "xush", "geldiniz": "keldingiz", "nasılsın": "qalaysan",
    "nasıl": "qanday", "günün": "kuning", "geçiyor": "o'tyapti", "bugün": "bugun",
    "ben": "men", "sen": "sen", "o": "u", "biz": "biz", "siz": "siz", "onlar": "ular",
    "benim": "mening", "senin": "sening", "adım": "ismim", "adın": "isming",
    "ne": "nima", "neden": "nega", "nerede": "qayerda", "nereye": "qayerga",
    "kim": "kim", "kaç": "nechta", "hangi": "qaysi", "zaman": "vaqt", "bugünkü": "bugungi",
    "bir": "bir", "iki": "ikki", "üç": "uch", "dört": "to'rt", "beş": "besh",
    "evet": "ha", "hayır": "yo'q", "lütfen": "iltimos", "teşekkürler": "rahmat",
    "kahve": "kofe", "çay": "choy", "su": "suv", "süt": "sut", "şeker": "shakar",
    "menü": "menyu", "hesap": "hisob", "fiyat": "narx", "para": "pul", "lira": "lira",
    "ne kadar": "qancha", "pahalı": "qimmat", "ucuz": "arzon", "indirim": "chegirma",
    "almak": "olmoq", "istiyorum": "xohlayman", "istiyor": "xohlaydi", "bakmak": "qaramoq",
    "kitap": "kitob", "defter": "daftar", "kalem": "qalam", "masa": "stol",
    "okul": "maktab", "öğretmen": "o'qituvchi", "öğrenci": "o'quvchi", "ders": "dars",
    "türkçe": "turk tili", "türk": "turk", "dil": "til", "kelime": "so'z",
    "öğrenmek": "o'rganmoq", "konuşmak": "gapirmoq", "anlamak": "tushunmoq",
    "gitmek": "bormoq", "gelmek": "kelmoq", "yapmak": "qilmoq", "etmek": "qilmoq",
    "gidiyorum": "boryapman", "geliyorum": "kelyapman", "yapıyorum": "qilyapman",
    "gittim": "bordim", "geldim": "keldim", "yaptım": "qildim", "okudum": "o'qidim",
    "güzel": "chiroyli", "kötü": "yomon", "büyük": "katta", "küçük": "kichik",
    "yeni": "yangi", "eski": "eski", "sıcak": "issiq", "soğuk": "sovuq",
    "kolay": "oson", "zor": "qiyin", "hızlı": "tez", "yavaş": "sekin",
    "ve": "va", "ama": "lekin", "çünkü": "chunki", "için": "uchun", "ile": "bilan",
    "bugün": "bugun", "yarın": "ertaga", "dün": "kecha", "şimdi": "hozir",
    "sabah": "ertalab", "akşam": "kechqurun", "gece": "kecha", "hafta": "hafta",
    "ay": "oy", "yıl": "yil", "saat": "soat", "dakika": "daqiqa",
    "anne": "ona", "baba": "ota", "kardeş": "aka-uka", "aile": "oila",
    "arkadaş": "do'st", "insan": "inson", "çocuk": "bola", "kadın": "ayol", "erkek": "erkak",
    "şehir": "shahar", "ülke": "mamlakat", "yol": "yo'l", "otobüs": "avtobus",
    "uçak": "samolyot", "otel": "mehmonxona", "pasaport": "pasport", "bilet": "chipta",
    "doktor": "shifokor", "hastane": "kasalxona", "ilaç": "dori", "baş": "bosh",
    "ağrı": "og'riq", "iyileşmek": "tuzalmoq", "sağlık": "salomatlik", "yardım": "yordam",
    "yemek": "ovqat", "ekmek": "non", "peynir": "pishloq", "elma": "olma",
    "portakal": "apelsin", "tavuk": "tovuq", "balık": "baliq", "çorba": "sho'rva",
    "tatlı": "shirin", "tuzlu": "sho'r", "sipariş": "buyurtma", "garson": "ofitsiant",
    "mağaza": "do'kon", "alışveriş": "xarid", "beden": "o'lcham", "renk": "rang",
    "siyah": "qora", "beyaz": "oq", "kırmızı": "qizil", "mavi": "ko'k", "yeşil": "yashil",
}

SUFFIXES = sorted(
    {
        "lar", "ler", "dan", "den", "tan", "ten", "da", "de", "ta", "te",
        "ın", "in", "un", "ün", "ı", "i", "u", "ü", "a", "e",
        "ım", "im", "um", "üm", "sın", "sin", "sun", "sün",
        "dır", "dir", "dur", "dür", "yor", "di", "dı", "du", "dü",
        "mış", "miş", "muş", "müş", "ken", "ki", "la", "le",
    },
    key=len,
    reverse=True,
)


def normalize_word(word: str) -> str:
    clean = re.sub(r"[^\wçğıöşüâîû]", "", (word or "").lower(), flags=re.UNICODE)
    return clean


def lookup_local(word: str) -> dict | None:
    clean = normalize_word(word)
    if not clean:
        return None
    if clean in LOCAL_WORDS:
        return {"translation_uz": LOCAL_WORDS[clean], "part_of_speech": ""}
    for suffix in SUFFIXES:
        if len(clean) - len(suffix) >= 3 and clean.endswith(suffix):
            stem = clean[: -len(suffix)]
            if stem in LOCAL_WORDS:
                return {"translation_uz": LOCAL_WORDS[stem], "part_of_speech": ""}
    return None


def _local_result(word: str, context: str = "") -> dict:
    local = lookup_local(word)
    return {
        "word": word,
        "translation_uz": (local or {}).get("translation_uz", ""),
        "part_of_speech": (local or {}).get("part_of_speech", ""),
        "example_tr": context[:180] if context else "",
        "example_uz": "",
        "source": "local",
        "found": bool(local),
    }


async def translate_word(word: str, context: str = "", api_key: str | None = None) -> dict:
    word = (word or "").strip()[:80]
    if not word:
        return _local_result(word, context)
    if ai_provider(api_key) == "none":
        return _local_result(word, context)
    payload = f"SO'Z: {word}\nKONTEKST: {context[:500] or 'yo`q'}\nFaqat JSON qaytar."
    try:
        raw = await call_llm(payload, WORD_PROMPT, WORD_SCHEMA, api_key=api_key)
        return {
            "word": str(raw.get("word") or word)[:80],
            "translation_uz": str(raw.get("translation_uz") or "")[:300],
            "part_of_speech": str(raw.get("part_of_speech") or "")[:40],
            "example_tr": str(raw.get("example_tr") or "")[:400],
            "example_uz": str(raw.get("example_uz") or "")[:400],
            "source": "ai",
            "found": bool(raw.get("translation_uz")),
        }
    except Exception as exc:
        log.warning("So'z tarjimasi xatosi, lokal lug'at: %s", exc)
        return _local_result(word, context)

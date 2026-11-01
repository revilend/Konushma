"""Savol qutisi — Aylin Hocaning CEFR darajalari bo'yicha suhbat savollari."""
import random

QUESTIONS: list[dict] = [
    {
        "id": 1,
        "level": "A1",
        "topic": "Tanishuv",
        "tr": "Merhaba! Kendini tanıtır mısın? Adın ne ve nerede yaşıyorsun?",
        "uz": "Salom! O'zingizni tanishtirasizmi? Ismingiz nima va qayerda yashaysiz?",
    },
    {
        "id": 2,
        "level": "A1",
        "topic": "Bo'sh vaqt",
        "tr": "Boş zamanında ne yapmayı seversin? Kısaca anlatır mısın?",
        "uz": "Bo'sh vaqtingizda nima qilishni sevasiz? Qisqacha aytib bering.",
    },
    {
        "id": 3,
        "level": "A1",
        "topic": "Oila",
        "tr": "Ailenle ne yapmayı seversin? Biraz anlatır mısın?",
        "uz": "Oilangiz bilan nima qilishni sevasiz? Biroz aytib bering.",
    },
    {
        "id": 4,
        "level": "A2",
        "topic": "Taom",
        "tr": "En sevdiğin yemek nedir? Neden onu seviyorsun?",
        "uz": "Eng sevimli taomingiz nima? Nega uni sevasiz?",
    },
    {
        "id": 5,
        "level": "A2",
        "topic": "Hava",
        "tr": "Yaşadığın şehirde hava nasıl? Hangi mevsimi daha çok seviyorsun?",
        "uz": "Yashayotgan shahringizda havo qanday? Qaysi faslni ko'proq sevasiz?",
    },
    {
        "id": 6,
        "level": "A2",
        "topic": "Sayohat",
        "tr": "Son gezindiğin yeri anlatır mısın? Orada ne yaptın?",
        "uz": "Oxirgi borgan joyingizni aytib bering. U yerda nima qildingiz?",
    },
    {
        "id": 7,
        "level": "B1",
        "topic": "Ish / O'qish",
        "tr": "Şu an okuyor musun, çalışıyor musun? Bu durumdan memnun musun, neden?",
        "uz": "Hozir o'qiysizmi, ishlaysizmi? Bu holatdan qoniqasizmi, nega?",
    },
    {
        "id": 8,
        "level": "B1",
        "topic": "Turkcha o'rganish",
        "tr": "Türkçeyi neden öğreniyorsun? Öğrenirken seni en çok ne zorluyor?",
        "uz": "Turk tilini nega o'rganyapsiz? O'rganishda sizni eng ko'p nima qiyinlashtiradi?",
    },
    {
        "id": 9,
        "level": "B1",
        "topic": "Musiqa / Film",
        "tr": "Hangi tür müzikleri veya dizileri seversin? Türkçe bir dizi izledin mi?",
        "uz": "Qanday musiqa yoki seriallarni sevasiz? Turk seriali ko'rganmisiz?",
    },
    {
        "id": 10,
        "level": "B2",
        "topic": "Kelajak",
        "tr": "Beş yıl sonra kendini nerede görüyorsun? Bu hedefe ulaşmak için neler yapıyorsun?",
        "uz": "Besh yildan keyin o'zingizni qayerda ko'rasiz? Bu maqsadga erishish uchun nima qilyapsiz?",
    },
    {
        "id": 11,
        "level": "B2",
        "topic": "Shahar",
        "tr": "Şehrine bir turist gelse, ona nereleri gösterirdin? Neden?",
        "uz": "Shahringizga sayyoh kelsa, unga qayerlarni ko'rsatardingiz? Nega?",
    },
    {
        "id": 12,
        "level": "B2",
        "topic": "Sport / Odat",
        "tr": "Düzenli bir alışkanlığın var mı? Bu alışkanlık hayatını nasıl etkiliyor?",
        "uz": "Muntazam bir odatingiz bormi? Bu odat hayotingizga qanday ta'sir qiladi?",
    },
    {
        "id": 13,
        "level": "C1",
        "topic": "Texnologiya",
        "tr": "Teknolojinin dil öğrenmeye etkisini nasıl değerlendirirsin? Olumlu ve olumsuz yönlerini tartışır mısın?",
        "uz": "Texnologiyaning til o'rganishga ta'sirini qanday baholaysiz? Ijobiy va salbiy tomonlarini muhokama qilasizmi?",
    },
    {
        "id": 14,
        "level": "C1",
        "topic": "Madaniyat",
        "tr": "Kültürel kimlik ile küreselleşme arasındaki ilişkiyi nasıl yorumlarsın? Somut bir örnek verir misin?",
        "uz": "Madaniy o'zlik va globallashuv o'rtasidagi munosabatni qanday izohlaysiz? Aniq misol keltirasizmi?",
    },
    {
        "id": 15,
        "level": "C1",
        "topic": "Ta'lim",
        "tr": "Eğitim sistemi insanları geleceğe ne ölçüde hazırlıyor? Eleştirel bir değerlendirme yapar mısın?",
        "uz": "Ta'lim tizimi insonlarni kelajakka qanchalik tayyorlaydi? Tanqidiy baho berasizmi?",
    },
]


def random_question(exclude_id: int | None = None, level: str | None = None) -> dict:
    normalized = (level or "").strip().upper()
    pool = [q for q in QUESTIONS if q.get("level") == normalized] if normalized else QUESTIONS
    if not pool:
        pool = QUESTIONS
    pool = [q for q in pool if q["id"] != exclude_id] or pool
    return random.choice(pool)

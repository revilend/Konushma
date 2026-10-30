"""Savol qutisi — Aylin Hocaning suhbat savollar bazasi (interview uslubida)."""
import random

QUESTIONS: list[dict] = [
    {
        "id": 1,
        "topic": "Tanishuv",
        "tr": "Merhaba! Önce kendini tanıtır mısın? Adın ne, yaşadığın şehir nerede?",
        "uz": "Salom! Avval o'zingizni tanishtirasizmi? Ismingiz nima, qaysi shaharda yashaysiz?",
    },
    {
        "id": 2,
        "topic": "Bo'sh vaqt",
        "tr": "Boş zamanlarında neler yapmaktan hoşlanıyorsun? Neden?",
        "uz": "Bo'sh vaqtingizda nima qilishni yaxshi ko'rasiz? Nega?",
    },
    {
        "id": 3,
        "topic": "Oila",
        "tr": "Aileni anlatır mısın? Aile bireyleriyle nasıl vakit geçirirsin?",
        "uz": "Oila naringizni aytib bering. Oilangiz bilan qanday vaqt o'tkazasiz?",
    },
    {
        "id": 4,
        "topic": "Taom",
        "tr": "En sevdiğin yemek nedir? Ondan nasıl yapılır, tarif bilir misin?",
        "uz": "Eng sevimli taomingiz nima? Undan qanday tayyorlanadi, retseptni bilasizmi?",
    },
    {
        "id": 5,
        "topic": "Hava",
        "tr": "Senede bulunduğun şehirde hava nasıl değişir? Hangi mevsimi daha çok seviyorsun?",
        "uz": "Yashayotgan shahringizda hava qanday o'zgaradi? Qaysi faslni ko'proq sevasiz?",
    },
    {
        "id": 6,
        "topic": "Sayohat",
        "tr": "Son seyahatin ne zamandı? O şehirde en çok neyi sevdiğini anlatır mısın?",
        "uz": "Oxirgi sayohatingiz qachon edi? O'sha shaharda nimani ko'proq sevganingizni aytib bering.",
    },
    {
        "id": 7,
        "topic": "Ish / O'qish",
        "tr": "Şu an okuyor musun, çalışıyor musun? Bulunduğun durumdan memnun musun?",
        "uz": "Hoziroq o'qiysizmi, ishlaysizmi? Holatingizdan qoniqasizmi?",
    },
    {
        "id": 8,
        "topic": "Turkcha o'rganish",
        "tr": "Türkçeyi neden öğreniyorsun? Türkçeyi öğrenmek senin için kolay mı, zor mu?",
        "uz": "Turk tilini nega o'rganyapsiz? Turkchani o'rganish sizga osonmi, qiyinmi?",
    },
    {
        "id": 9,
        "topic": "Musiqa / Film",
        "tr": "Hangi tür müzikleri veya dizileri seversin? Türkçe bir dizi izledin mi?",
        "uz": "Qanday musiqa yoki seriallarni sevasiz? Turk seriali ko'rganmisiz?",
    },
    {
        "id": 10,
        "topic": "Kelajak",
        "tr": "Beş yıl sonra kendini nerede hayal ediyorsun? Neler yapmak istiyorsun?",
        "uz": "Besh yildan keyin o'zingni qayerda tasavvur qilasiz? Nima qilmoqchisiz?",
    },
    {
        "id": 11,
        "topic": "Shahar",
        "tr": "Ziyaretçi senin şehrine gelse, önce neresini gezmek istersin?",
        "uz": "Sayyoh sizning shahringizni kezishni istasa, avval nimani ko'rsatardingiz?",
    },
    {
        "id": 12,
        "topic": "Sport",
        "tr": "Spor yapar mısın? Haftada kaç gün sporculuk yaparsın?",
        "uz": "Sport bilan shug'ullanasizmi? Haftada nechchi kuni sport qilasiz?",
    },
]


def random_question(exclude_id: int | None = None) -> dict:
    pool = [q for q in QUESTIONS if q["id"] != exclude_id] or QUESTIONS
    return random.choice(pool)

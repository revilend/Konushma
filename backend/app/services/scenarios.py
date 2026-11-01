"""Mavzuli muloqot stsenariylari (call rejimi uchun)."""

SCENARIOS: list[dict] = [
    {
        "id": "cafe",
        "kind": "roleplay",
        "title_uz": "Kafede sipariş verme",
        "title_tr": "Kafede sipariş vermek",
        "level": "A1-A2",
        "desc_uz": "Ofitsiant bilan salomlashish, menyu so'rash, ichimlik va taom buyurtma qilish.",
        "context": "Sen Istanbuldagi kafeda ofitsiant rolini o'ynaysan. Foydalanuvchi mijoz. Qisqa, oddiy va samimiy savollar ber; buyurtmani aniqlashtir.",
        "opening_tr": "Merhaba, hoş geldiniz! Ne almak istersiniz?",
        "opening_uz": "Salom, xush kelibsiz! Nima olmoqchisiz?",
        "phrases": [
            {"tr": "Bir kahve alabilir miyim?", "uz": "Bir kofe olsam bo'ladimi?"},
            {"tr": "Hesabı ödeyebilir miyim?", "uz": "Hisobni to'lasam bo'ladimi?"},
            {"tr": "Menüyü görebilir miyim?", "uz": "Menyuni ko'rsam bo'ladimi?"},
        ],
    },
    {
        "id": "bazaar",
        "kind": "roleplay",
        "title_uz": "Kapalıçarşı'da pazarlık yapma",
        "title_tr": "Kapalıçarşı'da pazarlık",
        "level": "B1",
        "desc_uz": "Katta Bozorda narx so'rash, savdolashish va xarid qilishni mashq qilish.",
        "context": "Sen Kapalıçarşı'dagi do'kon sotuvchisisan. Foydalanuvchi xaridor. Narxlarni ayt, savdolashishga undovchi savollar ber.",
        "opening_tr": "Buyurun, hoş geldiniz! Ne arıyorsunuz, size nasıl yardımcı olabilirim?",
        "opening_uz": "Marhamat, xush kelibsiz! Nima qidiryapsiz, qanday yordam bera olaman?",
        "phrases": [
            {"tr": "Bu ne kadar?", "uz": "Bu qancha turadi?"},
            {"tr": "Biraz indirim yapabilir misiniz?", "uz": "Biroz chegirma qila olasizmi?"},
            {"tr": "Çok pahalı, başka bir şey bakayım.", "uz": "Juda qimmat, boshqa narsani ko'ray."},
        ],
    },
    {
        "id": "airport",
        "kind": "roleplay",
        "title_uz": "Havalimanında check-in",
        "title_tr": "İstanbul Havalimanı'nda pasaport kontrolü",
        "level": "A2-B1",
        "desc_uz": "Pasport nazorati, safar maqsadi va qolish muddati haqida rasmiy suhbat.",
        "context": "Sen İstanbul Havalimanı'ndagi pasport nazorati xodimisan. Rasmiy, lekin xushmuomala ohangda savollar ber: safar maqsadi, qolish muddati, mehmonxona.",
        "opening_tr": "İyi günler. Pasaportunuzu verir misiniz? Türkiye'ye geliş amacınız nedir?",
        "opening_uz": "Xayrli kun. Pasportingizni bering. Turkiyaga kelish maqsadingiz nima?",
        "phrases": [
            {"tr": "Turist olarak geliyorum.", "uz": "Turist sifatida kelyapman."},
            {"tr": "Bir hafta kalacağım.", "uz": "Bir hafta qolaman."},
            {"tr": "Otel rezervasyonum var.", "uz": "Mehmonxona rezervatsiyam bor."},
        ],
    },
    {
        "id": "hotel",
        "kind": "roleplay",
        "title_uz": "Otelde rezervasyon",
        "title_tr": "Otelde rezervasyon yapmak",
        "level": "A2-B1",
        "desc_uz": "Mehmonxonaga kelish, rezervatsiyani tekshirish, xona va nonushta haqida so'rash.",
        "context": "Sen Istanbuldagi mehmonxona resepsiyonistisan. Foydalanuvchi mehmon. Rezervatsiya, xona turi, tunlar soni va nonushta haqida savollar ber; samimiy va aniq bo'l.",
        "opening_tr": "İyi akşamlar, hoş geldiniz! Rezervasyonunuz var mı?",
        "opening_uz": "Xayrli kech, xush kelibsiz! Rezervatsiyangiz bormi?",
        "phrases": [
            {"tr": "Rezervasyonum var.", "uz": "Rezervatsiyam bor."},
            {"tr": "İki geceliğine kalacağım.", "uz": "Ikki kecha qolaman."},
            {"tr": "Kahvaltı dahil mi?", "uz": "Nonushta narxga kirmi?"},
        ],
    },
    {
        "id": "tomer",
        "kind": "exam",
        "title_uz": "TÖMER / Yunus Emre og'zaki imtihoni",
        "title_tr": "TÖMER / Yunus Emre konuşma sınavı",
        "level": "B2-C1",
        "desc_uz": "Rasmiy imtihon simulyatsiyasi: fikr bildirish, sabab keltirish, mavzuni rivojlantirish.",
        "context": "Sen TÖMER og'zaki imtihon imtihonchisisan. Rasmiy va qat'iy bo'l; murakkab mavzularda fikr bildirishni, sabab keltirishni talab qil.",
        "opening_tr": "Sınavımıza hoş geldiniz. Günümüzde teknolojinin dil öğrenmeye etkisi hakkında ne düşünüyorsunuz?",
        "opening_uz": "Imtihonimizga xush kelibsiz. Bugungi kunda texnologiyaning til o'rganishga ta'siri haqida nima deb o'ylaysiz?",
        "phrases": [
            {"tr": "Bence bu konunun iki yönü var.", "uz": "Menimcha, bu masalaning ikki tomoni bor."},
            {"tr": "Örneğin, kendi deneyimimden yola çıkarsam...", "uz": "Masalan, o'z tajribamdan kelib chiqsam..."},
            {"tr": "Bu görüşe kısmen katılıyorum.", "uz": "Bu fikrga qisman qo'shilaman."},
        ],
    },
    {
        "id": "free",
        "kind": "free",
        "title_uz": "Erkin do'stona suhbat",
        "title_tr": "Serbest sohbet",
        "level": "A2-B2",
        "desc_uz": "Aylin Hoca bilan kundalik mavzularda erkin, iliq va tabiiy suhbat.",
        "context": "Sen Aylin Hoca, do'stona suhbatdoshlik. Erkin, iliq va qiziqarli mavzularda savollar ber; foydalanuvchini ko'proq gapirishga undov.",
        "opening_tr": "Merhaba! Bugün nasılsın? Günün nasıl geçiyor?",
        "opening_uz": "Salom! Bugun qalaysan? Kuning qanday o'tyapti?",
        "phrases": [
            {"tr": "Bugün kendimi çok iyi hissediyorum.", "uz": "Bugun o'zimni juda yaxshi his qilyapman."},
            {"tr": "Senin günün nasıl geçti?", "uz": "Sening kuning qanday o'tdi?"},
            {"tr": "Bu konuda ne düşünüyorsun?", "uz": "Bu haqda nima o'ylaysan?"},
        ],
    },
]


SCENARIO_PERSONAS = {
    "cafe": "aylin",
    "bazaar": "mehmet",
    "airport": "aylin",
    "hotel": "aylin",
    "tomer": "aylin",
    "free": "aylin",
}


HINTS: dict[str, list[dict]] = {
    "cafe": [
        {"tr": "Bir kahve alabilir miyim?", "uz": "Bir kofe olsam bo'ladimi?"},
        {"tr": "Menüyü görebilir miyim?", "uz": "Menyuni ko'rsam bo'ladimi?"},
        {"tr": "Sütlü ve şekersiz olsun, lütfen.", "uz": "Sutli va shakarsiz bo'lsin, iltimos."},
    ],
    "bazaar": [
        {"tr": "Bu ne kadar?", "uz": "Bu qancha turadi?"},
        {"tr": "Biraz indirim yapabilir misiniz?", "uz": "Biroz chegirma qila olasizmi?"},
        {"tr": "Bunu almak istiyorum.", "uz": "Buni olmoqchiman."},
    ],
    "airport": [
        {"tr": "Turist olarak geliyorum.", "uz": "Turist sifatida kelyapman."},
        {"tr": "Bir hafta kalacağım.", "uz": "Bir hafta qolaman."},
        {"tr": "Otel rezervasyonum var.", "uz": "Mehmonxona rezervatsiyam bor."},
    ],
    "hotel": [
        {"tr": "Rezervasyonum var.", "uz": "Rezervatsiyam bor."},
        {"tr": "İki geceliğine kalacağım.", "uz": "Ikki kecha qolaman."},
        {"tr": "Kahvaltı dahil mi?", "uz": "Nonushta narxga kirmi?"},
    ],
    "tomer": [
        {"tr": "Bence bu konunun iki yönü var.", "uz": "Menimcha, bu masalaning ikki tomoni bor."},
        {"tr": "Örneğin, kendi deneyimimden yola çıkarsam...", "uz": "Masalan, o'z tajribamdan kelib chiqsam..."},
        {"tr": "Bu görüşe kısmen katılıyorum.", "uz": "Bu fikrga qisman qo'shilaman."},
    ],
    "free": [
        {"tr": "Bugün kendimi çok iyi hissediyorum.", "uz": "Bugun o'zimni juda yaxshi his qilyapman."},
        {"tr": "Senin günün nasıl geçti?", "uz": "Sening kuning qanday o'tdi?"},
        {"tr": "Bu konuda ne düşünüyorsun?", "uz": "Bu haqda nima o'ylaysan?"},
    ],
}


def list_scenarios(kind: str | None = None) -> list[dict]:
    selected = [s for s in SCENARIOS if not kind or s.get("kind") == kind]
    return [
        {
            **{k: v for k, v in s.items() if k not in ("context", "phrases")},
            "hints": HINTS.get(s["id"], []),
            "persona": SCENARIO_PERSONAS.get(s["id"], "aylin"),
        }
        for s in selected
    ]


def get_scenario(scenario_id: str | None) -> dict | None:
    if not scenario_id:
        return None
    sc = next((s for s in SCENARIOS if s["id"] == scenario_id), None)
    if not sc:
        return None
    return {**sc, "hints": HINTS.get(sc["id"], [])}


def local_phrases(scenario_id: str | None) -> list[dict]:
    sc = get_scenario(scenario_id)
    if sc:
        return list(sc["phrases"])
    return list(SCENARIOS[-1]["phrases"])

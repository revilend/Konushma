export const EXAM_STAGES = {
  A1: [
    {
      id: 1,
      label: "Tanışma",
      prompt_tr: "Merhaba! Kendinizi kısaca tanıtır mısınız? Adınız, nereden geldiğiniz ve ne yaptığınızı söyleyin.",
      prompt_uz: "Salom! O'zingizni qisqacha tanishtirasizmi? Ismingiz, qayerdan kelganingiz va nima ish qilganingizni ayting.",
    },
    {
      id: 2,
      label: "Günlük hayat",
      prompt_tr: "Bugün neler yaptınız? Sabah kahvaltıda ne yediniz?",
      prompt_uz: "Bugun nima qildingiz? Ertalab nonushtada nima yedingiz?",
    },
    {
      id: 3,
      label: "Tercihler",
      prompt_tr: "En sevdiğiniz yer neresi? Neden orayı seviyorsunuz?",
      prompt_uz: "Eng sevimli joyingiz qayer? Nega o yerni sevasiz?",
    },
  ],
  A2: [
    {
      id: 1,
      label: "Boş zaman",
      prompt_tr: "Boş zamanlarınızda neler yapıyorsunuz? Biraz anlatır mısınız?",
      prompt_uz: "Bo'sh vaqtlaringizda nima qilasiz? Biroz aytib bering.",
    },
    {
      id: 2,
      label: "Seyahat",
      prompt_tr: "Son tatilinizi anlatır mısınız? Nereye gittiniz ve neler yaptınız?",
      prompt_uz: "Oxirgi sayohatingizni aytib bering. Qayerga bordingiz va nima qildingiz?",
    },
    {
      id: 3,
      label: "Hedefler",
      prompt_tr: "Türkçe öğrenmek sizin için neden önemli? Gelecekte Türkçeyi nerede kullanmak istersiniz?",
      prompt_uz: "Turk tilini o'rganish siz uchun nega muhim? Kelajakda turkchani qayerda ishlatmoqchisiz?",
    },
  ],
  B1: [
    {
      id: 1,
      label: "Deneyim",
      prompt_tr: "Eğitim ve iş hayatınızdan kısaca bahsedebilir misiniz? Hangi deneyimler size en çok şey kattı?",
      prompt_uz: "Ta'lim va ish hayotingiz haqida qisqacha gapirib bering. Qaysi tajribalar sizga eng ko'p narsa qo'shdi?",
    },
    {
      id: 2,
      label: "Değişim",
      prompt_tr: "Son yıllarda Türkiye'de veya ülkenizde değişen bir alışkanlığı anlatır mısınız? Bu değişimin nedenlerini açıklayın.",
      prompt_uz: "So'nggi yillarda Turkiyada yoki mamlakatingizda o'zgargan bir odatni aytib bering. Bu o'zgarish sabablarini tushuntiring.",
    },
    {
      id: 3,
      label: "Teknoloji",
      prompt_tr: "Teknoloji dil öğrenmeyi nasıl etkiliyor? Artıları ve eksileri hakkında ne düşünüyorsunuz?",
      prompt_uz: "Texnologiya til o'rganishga qanday ta'sir qiladi? Ijobiy va salbiy tomonlari haqida nima deb o'ylaysiz?",
    },
  ],
  B2: [
    {
      id: 1,
      label: "Kariyer",
      prompt_tr: "Kariyer hedeflerinizden ve bu hedeflere ulaşmak için neler yaptığınızdan bahseder misiniz?",
      prompt_uz: "Karyera maqsadlaringiz va ularga erishish uchun nima qilayotganingiz haqida gapirib bering.",
    },
    {
      id: 2,
      label: "Şehir ve toplum",
      prompt_tr: "Şehirlerde yaşam kalitesini artırmak için hangi önlemler alınmalı? Önerilerinizi gerekçeleriyle açıklayın.",
      prompt_uz: "Shaharlarda hayot sifatini oshirish uchun qanday choralar ko'rish kerak? Takliflaringizni asoslab bering.",
    },
    {
      id: 3,
      label: "Medya",
      prompt_tr: "Medyanın toplum üzerindeki etkisini nasıl değerlendiriyorsunuz? Örneklerle anlatır mısınız?",
      prompt_uz: "Ommaviy axborot vositalarining jamiyatga ta'sirini qanday baholaysiz? Misollar bilan tushuntirib bering.",
    },
  ],
  C1: [
    {
      id: 1,
      label: "Kritik deneyim",
      prompt_tr: "Sizi mesleki veya kişisel açıdan en çok zorlayan deneyim neydi? Bu deneyim bakış açınızı nasıl değiştirdi?",
      prompt_uz: "Sizni kasbiy yoki shaxsiy jihatdan eng ko'p qiyinlagan tajriba qanday edi? Bu tajriba dunyoqarashingizni qanday o'zgartirdi?",
    },
    {
      id: 2,
      label: "Eğitim",
      prompt_tr: "Eğitim sistemleri öğrencileri geleceğin iş dünyasına ne ölçüde hazırlıyor? Eleştirel bir değerlendirme yapar mısınız?",
      prompt_uz: "Ta'lim tizimlari o'quvchilarni kelajakdagi ish dunyosiga qanchalik tayyorlaydi? Tanqidiy baho bering.",
    },
    {
      id: 3,
      label: "Kimlik ve dünya",
      prompt_tr: "Kültürel kimlik ile küreselleşme arasındaki gerilimi nasıl yorumluyorsunuz? Somut örneklerle tartışır mısınız?",
      prompt_uz: "Madaniy o'zlik va globallashuv o'rtasidagi ziddiyatni qanday izohlaysiz? Aniq misollar bilan muhokama qiling.",
    },
  ],
};

export function getExamStages(level) {
  return EXAM_STAGES[String(level || "A2").toUpperCase()] || EXAM_STAGES.A2;
}

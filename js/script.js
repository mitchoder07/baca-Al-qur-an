// ============================================================
// AL FURQAN — script.js
// DATA SOURCES (all static CDN, zero live API servers):
//   Surah list + verses + transliteration:
//     cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/…
//   Tafsir (Ibn Kathir):
//     cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/{surah}/{ayah}.json
//   Audio (EveryAyah):
//     everyayah.com/data/{reciterFolder}/{padded3}.mp3
// ============================================================

// ============================================================
// STATIC DATA — surah list (no fetch needed at all)
// Generated from quran-json index. Includes: id, name (Arabic),
// transliteration, translation (meaning), type, total_verses.
// ============================================================

const SURAH_LIST = [
    { id: 1, revelationOrder: 5, name: "الفاتحة", transliteration: "Al-Fatihah", translation: "The Opener", type: "meccan", total_verses: 7 },
    { id: 2, revelationOrder: 87, name: "البقرة", transliteration: "Al-Baqarah", translation: "The Cow", type: "medinan", total_verses: 286 },
    { id: 3, revelationOrder: 89, name: "آل عمران", transliteration: "Ali 'Imran", translation: "Family of Imran", type: "medinan", total_verses: 200 },
    { id: 4, revelationOrder: 92, name: "النساء", transliteration: "An-Nisa", translation: "The Women", type: "medinan", total_verses: 176 },
    { id: 5, revelationOrder: 112, name: "المائدة", transliteration: "Al-Ma'idah", translation: "The Table Spread", type: "medinan", total_verses: 120 },
    { id: 6, revelationOrder: 55, name: "الأنعام", transliteration: "Al-An'am", translation: "The Cattle", type: "meccan", total_verses: 165 },
    { id: 7, revelationOrder: 39, name: "الأعراف", transliteration: "Al-A'raf", translation: "The Heights", type: "meccan", total_verses: 206 },
    { id: 8, revelationOrder: 88, name: "الأنفال", transliteration: "Al-Anfal", translation: "The Spoils of War", type: "medinan", total_verses: 75 },
    { id: 9, revelationOrder: 113, name: "التوبة", transliteration: "At-Tawbah", translation: "The Repentance", type: "medinan", total_verses: 129 },
    { id: 10, revelationOrder: 51, name: "يونس", transliteration: "Yunus", translation: "Jonah", type: "meccan", total_verses: 109 },
    { id: 11, revelationOrder: 52, name: "هود", transliteration: "Hud", translation: "Hud", type: "meccan", total_verses: 123 },
    { id: 12, revelationOrder: 53, name: "يوسف", transliteration: "Yusuf", translation: "Joseph", type: "meccan", total_verses: 111 },
    { id: 13, revelationOrder: 96, name: "الرعد", transliteration: "Ar-Ra'd", translation: "The Thunder", type: "medinan", total_verses: 43 },
    { id: 14, revelationOrder: 72, name: "إبراهيم", transliteration: "Ibrahim", translation: "Abraham", type: "meccan", total_verses: 52 },
    { id: 15, revelationOrder: 54, name: "الحجر", transliteration: "Al-Hijr", translation: "The Rocky Tract", type: "meccan", total_verses: 99 },
    { id: 16, revelationOrder: 70, name: "النحل", transliteration: "An-Nahl", translation: "The Bee", type: "meccan", total_verses: 128 },
    { id: 17, revelationOrder: 50, name: "الإسراء", transliteration: "Al-Isra", translation: "The Night Journey", type: "meccan", total_verses: 111 },
    { id: 18, revelationOrder: 69, name: "الكهف", transliteration: "Al-Kahf", translation: "The Cave", type: "meccan", total_verses: 110 },
    { id: 19, revelationOrder: 44, name: "مريم", transliteration: "Maryam", translation: "Mary", type: "meccan", total_verses: 98 },
    { id: 20, revelationOrder: 45, name: "طه", transliteration: "Ta-Ha", translation: "Ta-Ha", type: "meccan", total_verses: 135 },
    { id: 21, revelationOrder: 73, name: "الأنبياء", transliteration: "Al-Anbiya", translation: "The Prophets", type: "meccan", total_verses: 112 },
    { id: 22, revelationOrder: 103, name: "الحج", transliteration: "Al-Hajj", translation: "The Pilgrimage", type: "medinan", total_verses: 78 },
    { id: 23, revelationOrder: 74, name: "المؤمنون", transliteration: "Al-Mu'minun", translation: "The Believers", type: "meccan", total_verses: 118 },
    { id: 24, revelationOrder: 102, name: "النور", transliteration: "An-Nur", translation: "The Light", type: "medinan", total_verses: 64 },
    { id: 25, revelationOrder: 42, name: "الفرقان", transliteration: "Al-Furqan", translation: "The Criterion", type: "meccan", total_verses: 77 },
    { id: 26, revelationOrder: 47, name: "الشعراء", transliteration: "Ash-Shu'ara", translation: "The Poets", type: "meccan", total_verses: 227 },
    { id: 27, revelationOrder: 48, name: "النمل", transliteration: "An-Naml", translation: "The Ant", type: "meccan", total_verses: 93 },
    { id: 28, revelationOrder: 49, name: "القصص", transliteration: "Al-Qasas", translation: "The Stories", type: "meccan", total_verses: 88 },
    { id: 29, revelationOrder: 85, name: "العنكبوت", transliteration: "Al-'Ankabut", translation: "The Spider", type: "meccan", total_verses: 69 },
    { id: 30, revelationOrder: 84, name: "الروم", transliteration: "Ar-Rum", translation: "The Romans", type: "meccan", total_verses: 60 },
    { id: 31, revelationOrder: 57, name: "لقمان", transliteration: "Luqman", translation: "Luqman", type: "meccan", total_verses: 34 },
    { id: 32, revelationOrder: 75, name: "السجدة", transliteration: "As-Sajdah", translation: "The Prostration", type: "meccan", total_verses: 30 },
    { id: 33, revelationOrder: 90, name: "الأحزاب", transliteration: "Al-Ahzab", translation: "The Combined Forces", type: "medinan", total_verses: 73 },
    { id: 34, revelationOrder: 58, name: "سبإ", transliteration: "Saba", translation: "Sheba", type: "meccan", total_verses: 54 },
    { id: 35, revelationOrder: 43, name: "فاطر", transliteration: "Fatir", translation: "Originator", type: "meccan", total_verses: 45 },
    { id: 36, revelationOrder: 41, name: "يس", transliteration: "Ya-Sin", translation: "Ya Sin", type: "meccan", total_verses: 83 },
    { id: 37, revelationOrder: 56, name: "الصافات", transliteration: "As-Saffat", translation: "Those who set the Ranks", type: "meccan", total_verses: 182 },
    { id: 38, revelationOrder: 38, name: "ص", transliteration: "Sad", translation: "The Letter Sad", type: "meccan", total_verses: 88 },
    { id: 39, revelationOrder: 59, name: "الزمر", transliteration: "Az-Zumar", translation: "The Troops", type: "meccan", total_verses: 75 },
    { id: 40, revelationOrder: 60, name: "غافر", transliteration: "Ghafir", translation: "The Forgiver", type: "meccan", total_verses: 85 },
    { id: 41, revelationOrder: 62, name: "فصلت", transliteration: "Fussilat", translation: "Explained in Detail", type: "meccan", total_verses: 54 },
    { id: 42, revelationOrder: 61, name: "الشورى", transliteration: "Ash-Shuraa", translation: "The Consultation", type: "meccan", total_verses: 53 },
    { id: 43, revelationOrder: 63, name: "الزخرف", transliteration: "Az-Zukhruf", translation: "The Ornaments of Gold", type: "meccan", total_verses: 89 },
    { id: 44, revelationOrder: 64, name: "الدخان", transliteration: "Ad-Dukhan", translation: "The Smoke", type: "meccan", total_verses: 59 },
    { id: 45, revelationOrder: 65, name: "الجاثية", transliteration: "Al-Jathiyah", translation: "The Crouching", type: "meccan", total_verses: 37 },
    { id: 46, revelationOrder: 66, name: "الأحقاف", transliteration: "Al-Ahqaf", translation: "The Wind-curved Sandhills", type: "meccan", total_verses: 35 },
    { id: 47, revelationOrder: 95, name: "محمد", transliteration: "Muhammad", translation: "Muhammad", type: "medinan", total_verses: 38 },
    { id: 48, revelationOrder: 111, name: "الفتح", transliteration: "Al-Fath", translation: "The Victory", type: "medinan", total_verses: 29 },
    { id: 49, revelationOrder: 106, name: "الحجرات", transliteration: "Al-Hujurat", translation: "The Rooms", type: "medinan", total_verses: 18 },
    { id: 50, revelationOrder: 34, name: "ق", transliteration: "Qaf", translation: "The Letter Qaf", type: "meccan", total_verses: 45 },
    { id: 51, revelationOrder: 67, name: "الذاريات", transliteration: "Adh-Dhariyat", translation: "The Winnowing Winds", type: "meccan", total_verses: 60 },
    { id: 52, revelationOrder: 76, name: "الطور", transliteration: "At-Tur", translation: "The Mount", type: "meccan", total_verses: 49 },
    { id: 53, revelationOrder: 23, name: "النجم", transliteration: "An-Najm", translation: "The Star", type: "meccan", total_verses: 62 },
    { id: 54, revelationOrder: 37, name: "القمر", transliteration: "Al-Qamar", translation: "The Moon", type: "meccan", total_verses: 55 },
    { id: 55, revelationOrder: 97, name: "الرحمن", transliteration: "Ar-Rahman", translation: "The Beneficent", type: "medinan", total_verses: 78 },
    { id: 56, revelationOrder: 46, name: "الواقعة", transliteration: "Al-Waqi'ah", translation: "The Inevitable", type: "meccan", total_verses: 96 },
    { id: 57, revelationOrder: 94, name: "الحديد", transliteration: "Al-Hadid", translation: "The Iron", type: "medinan", total_verses: 29 },
    { id: 58, revelationOrder: 105, name: "المجادلة", transliteration: "Al-Mujadila", translation: "The Pleading Woman", type: "medinan", total_verses: 22 },
    { id: 59, revelationOrder: 101, name: "الحشر", transliteration: "Al-Hashr", translation: "The Exile", type: "medinan", total_verses: 24 },
    { id: 60, revelationOrder: 91, name: "الممتحنة", transliteration: "Al-Mumtahanah", translation: "She that is to be examined", type: "medinan", total_verses: 13 },
    { id: 61, revelationOrder: 109, name: "الصف", transliteration: "As-Saf", translation: "The Ranks", type: "medinan", total_verses: 14 },
    { id: 62, revelationOrder: 110, name: "الجمعة", transliteration: "Al-Jumu'ah", translation: "The Congregation", type: "medinan", total_verses: 11 },
    { id: 63, revelationOrder: 104, name: "المنافقون", transliteration: "Al-Munafiqun", translation: "The Hypocrites", type: "medinan", total_verses: 11 },
    { id: 64, revelationOrder: 108, name: "التغابن", transliteration: "At-Taghabun", translation: "The Mutual Disillusion", type: "medinan", total_verses: 18 },
    { id: 65, revelationOrder: 99, name: "الطلاق", transliteration: "At-Talaq", translation: "The Divorce", type: "medinan", total_verses: 12 },
    { id: 66, revelationOrder: 107, name: "التحريم", transliteration: "At-Tahrim", translation: "The Prohibition", type: "medinan", total_verses: 12 },
    { id: 67, revelationOrder: 77, name: "الملك", transliteration: "Al-Mulk", translation: "The Sovereignty", type: "meccan", total_verses: 30 },
    { id: 68, revelationOrder: 2, name: "القلم", transliteration: "Al-Qalam", translation: "The Pen", type: "meccan", total_verses: 52 },
    { id: 69, revelationOrder: 78, name: "الحاقة", transliteration: "Al-Haqqah", translation: "The Reality", type: "meccan", total_verses: 52 },
    { id: 70, revelationOrder: 79, name: "المعارج", transliteration: "Al-Ma'arij", translation: "The Ascending Stairways", type: "meccan", total_verses: 44 },
    { id: 71, revelationOrder: 71, name: "نوح", transliteration: "Nuh", translation: "Noah", type: "meccan", total_verses: 28 },
    { id: 72, revelationOrder: 40, name: "الجن", transliteration: "Al-Jinn", translation: "The Jinn", type: "meccan", total_verses: 28 },
    { id: 73, revelationOrder: 3, name: "المزمل", transliteration: "Al-Muzzammil", translation: "The Enshrouded One", type: "meccan", total_verses: 20 },
    { id: 74, revelationOrder: 4, name: "المدثر", transliteration: "Al-Muddaththir", translation: "The Cloaked One", type: "meccan", total_verses: 56 },
    { id: 75, revelationOrder: 31, name: "القيامة", transliteration: "Al-Qiyamah", translation: "The Resurrection", type: "meccan", total_verses: 40 },
    { id: 76, revelationOrder: 98, name: "الإنسان", transliteration: "Al-Insan", translation: "The Man", type: "medinan", total_verses: 31 },
    { id: 77, revelationOrder: 33, name: "المرسلات", transliteration: "Al-Mursalat", translation: "The Emissaries", type: "meccan", total_verses: 50 },
    { id: 78, revelationOrder: 80, name: "النبإ", transliteration: "An-Naba", translation: "The Tidings", type: "meccan", total_verses: 40 },
    { id: 79, revelationOrder: 81, name: "النازعات", transliteration: "An-Nazi'at", translation: "Those who drag forth", type: "meccan", total_verses: 46 },
    { id: 80, revelationOrder: 24, name: "عبس", transliteration: "'Abasa", translation: "He Frowned", type: "meccan", total_verses: 42 },
    { id: 81, revelationOrder: 7, name: "التكوير", transliteration: "At-Takwir", translation: "The Overthrowing", type: "meccan", total_verses: 29 },
    { id: 82, revelationOrder: 82, name: "الإنفطار", transliteration: "Al-Infitar", translation: "The Cleaving", type: "meccan", total_verses: 19 },
    { id: 83, revelationOrder: 86, name: "المطففين", transliteration: "Al-Mutaffifin", translation: "The Defrauding", type: "meccan", total_verses: 36 },
    { id: 84, revelationOrder: 83, name: "الإنشقاق", transliteration: "Al-Inshiqaq", translation: "The Splitting Open", type: "meccan", total_verses: 25 },
    { id: 85, revelationOrder: 27, name: "البروج", transliteration: "Al-Buruj", translation: "The Mansions of the Stars", type: "meccan", total_verses: 22 },
    { id: 86, revelationOrder: 36, name: "الطارق", transliteration: "At-Tariq", translation: "The Nightcommer", type: "meccan", total_verses: 17 },
    { id: 87, revelationOrder: 8, name: "الأعلى", transliteration: "Al-A'la", translation: "The Most High", type: "meccan", total_verses: 19 },
    { id: 88, revelationOrder: 68, name: "الغاشية", transliteration: "Al-Ghashiyah", translation: "The Overwhelming", type: "meccan", total_verses: 26 },
    { id: 89, revelationOrder: 10, name: "الفجر", transliteration: "Al-Fajr", translation: "The Dawn", type: "meccan", total_verses: 30 },
    { id: 90, revelationOrder: 35, name: "البلد", transliteration: "Al-Balad", translation: "The City", type: "meccan", total_verses: 20 },
    { id: 91, revelationOrder: 26, name: "الشمس", transliteration: "Ash-Shams", translation: "The Sun", type: "meccan", total_verses: 15 },
    { id: 92, revelationOrder: 9, name: "الليل", transliteration: "Al-Layl", translation: "The Night", type: "meccan", total_verses: 21 },
    { id: 93, revelationOrder: 11, name: "الضحى", transliteration: "Ad-Duha", translation: "The Morning Hours", type: "meccan", total_verses: 11 },
    { id: 94, revelationOrder: 12, name: "الشرح", transliteration: "Ash-Sharh", translation: "The Relief", type: "meccan", total_verses: 8 },
    { id: 95, revelationOrder: 28, name: "التين", transliteration: "At-Tin", translation: "The Fig", type: "meccan", total_verses: 8 },
    { id: 96, revelationOrder: 1, name: "العلق", transliteration: "Al-'Alaq", translation: "The Clot", type: "meccan", total_verses: 19 },
    { id: 97, revelationOrder: 25, name: "القدر", transliteration: "Al-Qadr", translation: "The Power", type: "meccan", total_verses: 5 },
    { id: 98, revelationOrder: 100, name: "البينة", transliteration: "Al-Bayyinah", translation: "The Clear Proof", type: "medinan", total_verses: 8 },
    { id: 99, revelationOrder: 93, name: "الزلزلة", transliteration: "Az-Zalzalah", translation: "The Earthquake", type: "medinan", total_verses: 8 },
    { id: 100, revelationOrder: 14, name: "العاديات", transliteration: "Al-'Adiyat", translation: "The Courser", type: "meccan", total_verses: 11 },
    { id: 101, revelationOrder: 30, name: "القارعة", transliteration: "Al-Qari'ah", translation: "The Calamity", type: "meccan", total_verses: 11 },
    { id: 102, revelationOrder: 16, name: "التكاثر", transliteration: "At-Takathur", translation: "The Rivalry in World Increase", type: "meccan", total_verses: 8 },
    { id: 103, revelationOrder: 13, name: "العصر", transliteration: "Al-'Asr", translation: "The Declining Day", type: "meccan", total_verses: 3 },
    { id: 104, revelationOrder: 32, name: "الهمزة", transliteration: "Al-Humazah", translation: "The Traducer", type: "meccan", total_verses: 9 },
    { id: 105, revelationOrder: 19, name: "الفيل", transliteration: "Al-Fil", translation: "The Elephant", type: "meccan", total_verses: 5 },
    { id: 106, revelationOrder: 29, name: "قريش", transliteration: "Quraysh", translation: "Quraysh", type: "meccan", total_verses: 4 },
    { id: 107, revelationOrder: 17, name: "الماعون", transliteration: "Al-Ma'un", translation: "The Small Kindnesses", type: "meccan", total_verses: 7 },
    { id: 108, revelationOrder: 15, name: "الكوثر", transliteration: "Al-Kawthar", translation: "The Abundance", type: "meccan", total_verses: 3 },
    { id: 109, revelationOrder: 18, name: "الكافرون", transliteration: "Al-Kafirun", translation: "The Disbelievers", type: "meccan", total_verses: 6 },
    { id: 110, revelationOrder: 114, name: "النصر", transliteration: "An-Nasr", translation: "The Divine Support", type: "medinan", total_verses: 3 },
    { id: 111, revelationOrder: 6, name: "المسد", transliteration: "Al-Masad", translation: "The Palm Fibre", type: "meccan", total_verses: 5 },
    { id: 112, revelationOrder: 22, name: "الإخلاص", transliteration: "Al-Ikhlas", translation: "The Sincerity", type: "meccan", total_verses: 4 },
    { id: 113, revelationOrder: 20, name: "الفلق", transliteration: "Al-Falaq", translation: "The Daybreak", type: "meccan", total_verses: 5 },
    { id: 114, revelationOrder: 21, name: "الناس", transliteration: "An-Nas", translation: "The Mankind", type: "meccan", total_verses: 6 }
];



// HIZB STARTS — first ayah of each of the 60 Hizbs
const HIZB_STARTS = [
    [1,1],[2,75],[2,142],[2,203],[2,253],[3,15],[3,93],[3,171],[4,24],[4,88],
    [4,148],[5,27],[5,82],[6,36],[6,111],[7,1],[7,88],[7,171],[8,41],[9,34],
    [9,93],[10,26],[11,6],[11,84],[12,53],[13,19],[15,1],[16,51],[17,1],[17,99],
    [18,75],[20,1],[21,1],[22,1],[23,1],[24,21],[25,21],[26,111],[27,56],[28,51],
    [29,46],[31,22],[33,31],[34,24],[36,28],[37,145],[39,32],[40,41],[41,47],[43,24],
    [46,1],[48,18],[51,31],[55,1],[58,1],[62,1],[67,1],[72,1],[78,1],[87,1]
];

// ============================================================
// STATIC CDN ENDPOINTS (no live API — all jsDelivr / EveryAyah)
// ============================================================

const CDN = {
    // Full surah with Arabic text + transliteration + English translation
    surah: (n) => `https://cdn.jsdelivr.net/npm/quran-json@3.1.2/dist/chapters/en/${n}.json`,
    // Tafsir per ayah (Ibn Kathir — reliable, complete English tafsir)
    tafsir: (surah, ayah) =>
        `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/${surah}/${ayah}.json`,
};

// ============================================================
// EVERYAYAH RECITERS — folder names on everyayah.com
// Audio URL: https://everyayah.com/data/{folder}/{surah_padded}{ayah_padded}.mp3
// ============================================================

const RECITERS = [
    { id: "mishari", name: "Mishary Rashid Alafasy", folder: "Alafasy_128kbps" },
    { id: "sudais", name: "Abdul Rahman As-Sudais", folder: "Abdurrahmaan_As-Sudais_192kbps" },
    { id: "ali_jaber", name: "Ali Abdullah Jabir (رحمه الله)", folder: "Ali_Jaber_64kbps" },
    { id: "abdulbasit", name: "Abdul Basit Abdul Samad (Murattal)", folder: "Abdul_Basit_Murattal_192kbps" },
    { id: "abdulbasit_mj", name: "Abdul Basit Abdul Samad (Mujawwad)", folder: "Abdul_Basit_Mujawwad_128kbps" },
    { id: "husary", name: "Mahmoud Khalil Al-Husary", folder: "Husary_128kbps" },
    { id: "husary_muj", name: "Al-Husary (Mujawwad)", folder: "Husary_128kbps_Mujawwad" },
    { id: "minshawi", name: "Muhammad Siddiq Al-Minshawi", folder: "Minshawy_Murattal_128kbps" },
    { id: "shaatree", name: "Abu Bakr Ash-Shaatree", folder: "Abu_Bakr_Ash-Shaatree_128kbps" },
    { id: "muaiqly", name: "Maher Al-Muaiqly", folder: "Maher_AlMuaiqly_64kbps" },
    { id: "shuraym", name: "Saud Al-Shuraim", folder: "Saood_ash-Shuraym_128kbps" },
    { id: "hudhaify", name: "Ali Al-Hudhaify", folder: "Hudhaify_128kbps" },
    { id: "ajamy", name: "Ahmed Ibn Ali Al-Ajamy", folder: "ahmed_ibn_ali_al_ajamy_128kbps" },
    { id: "jibreel", name: "Muhammad Jibreel", folder: "Muhammad_Jibreel_128kbps" },
    { id: "ayyoub", name: "Muhammad Ayyoub", folder: "Muhammad_Ayyoub_128kbps" },
    { id: "ghamdi", name: "Saad Al-Ghamdi", folder: "Ghamadi_40kbps" },
    { id: "basfar", name: "Abdullah Basfar", folder: "Abdullah_Basfar_192kbps" },
    { id: "matroud", name: "Abdullah Matroud", folder: "Abdullah_Matroud_128kbps" },
    { id: "juhaynee", name: "Abdullah Al-Juhaynee", folder: "Abdullaah_3awwaad_Al-Juhaynee_128kbps" },
    { id: "johany", name: "Abdullah Al-Johany", folder: "Abdullah_Al-Johany_128kbps" },
    { id: "tablawi", name: "Mohamed Al-Tablawi", folder: "Mohammad_al_Tablaway_128kbps" },
    { id: "rifai", name: "Hani Ar-Rifai", folder: "Hani_Rifai_192kbps" },
    { id: "qasim", name: "Abdul Muhsin Al-Qasim", folder: "Muhsin_Al_Qasim_192kbps" },
    { id: "neana", name: "Ahmed Neana", folder: "Ahmed_Neana_128kbps" },
    { id: "ayman_swed", name: "Ayman Swed", folder: "Ayman_Sowaid_64kbps" },
    { id: "okasha", name: "Okasha Kameny", folder: "Okasha_Kameny_64kbps", fullSurahOnly: true },
];

function getAyahAudioUrl(surahNum, ayahNum, reciterId) {
    const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    // Reciters not on everyayah.com (e.g. Okasha Kameny) use full-surah MP3s
    if (reciter.fullSurahOnly) {
        return getFullSurahAudioUrl(surahNum, reciterId);
    }
    const s = String(surahNum).padStart(3, "0");
    const a = String(ayahNum).padStart(3, "0");
    return `https://everyayah.com/data/${reciter.folder}/${s}${a}.mp3`;
}



// ============================================================
// FULL SURAH AUDIO — plays the entire surah as one continuous track
// Uses mp3quran.net which provides full surah MP3 files
// ============================================================

const FULL_SURAH_SERVERS = {
    'mishari':    'https://server8.mp3quran.net/afs/',
    'sudais':     'https://server11.mp3quran.net/sds/',
    'abdulbasit': 'https://server7.mp3quran.net/basit/',
    'husary':     'https://server13.mp3quran.net/husr/',
    'minshawi':   'https://server10.mp3quran.net/minsh/',
    'shaatree':   'https://server11.mp3quran.net/shatri/',
    'muaiqly':    'https://server12.mp3quran.net/maher/',
    'shuraym':    'https://server7.mp3quran.net/shur/',
    'hudhaify':   'https://server8.mp3quran.net/bna/',
    'ajamy':      'https://server10.mp3quran.net/ajm/',
    'jibreel':    'https://server8.mp3quran.net/jbrl/',
    'ayyoub':     'https://server16.mp3quran.net/ayyoub2/',
    'ghamdi':     'https://server7.mp3quran.net/s_gmd/',
    'basfar':     'https://server6.mp3quran.net/bsfr/',
    'matroud':    'https://server8.mp3quran.net/mtrod/',
    'rifai':      'https://server8.mp3quran.net/hani/',
    'tablawi':    'https://server12.mp3quran.net/tblawi/',
};

function getFullSurahAudioUrl(surahNum, reciterId) {
    const server = FULL_SURAH_SERVERS[reciterId] || FULL_SURAH_SERVERS['mishari'];
    const padded = String(surahNum).padStart(3, '0');
    return `${server}${padded}.mp3`;
}

// ============================================================
// TOAST
// ============================================================

function showToast(msg) {
    const t = document.getElementById("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1900);
}

// ============================================================
// ELEMENT REFS
// ============================================================

const grid = document.getElementById("surah-grid");
const searchInput = document.getElementById("surah-search");
const readerModal = document.querySelector(".reader-modal");
const readerClose = document.querySelector(".reader-close");
const surahModal = document.querySelector(".surah-modal");
const modalClose = document.querySelector(".surah-modal-close");
const readBtn = document.getElementById("read-surah-btn");
const modeBoth = document.getElementById("mode-both");
const modeArabic = document.getElementById("mode-arabic");
const modeTranslation = document.getElementById("mode-translation");
const audioPlayer = document.getElementById("surah-audio");
const playButton = document.getElementById("audio-play-bton");
const progressBar2 = document.getElementById("audio-progress2");
const currentTimeEl2 = document.getElementById("current-time2");
const durationTimeEl = document.getElementById("duration-time");
const miniPlay = document.getElementById("mini-play");
const miniNext = document.getElementById("mini-next");
const miniPrev = document.getElementById("mini-prev");
const floatingPlayer = document.getElementById("floating-player");
const floatingSurah = document.getElementById("floating-surah");
const floatingAyah = document.getElementById("floating-ayah");
const ayahPlayer = document.getElementById("ayah-player");
const quranAudio = document.getElementById("quran-audio");

// ============================================================
// STATE
// ============================================================

let allSurahs = [];       // populated from SURAH_LIST
let activeFilter = "all";
let selectedSurah = null;
let readerMode = "both";
let arabicFontSize = 3;
let translationFontSize = 1.05;
let currentReciterId = localStorage.getItem("reciterId") || "mishari";
let activePlayButton = null;
let currentAyahPlaying = 1;
let totalAyahsInSurah = 0;
let activeAudioMode = "surah";
let repeatMode = "off";
let siteTheme = "dark";
let readerThemeKey = localStorage.getItem("readerTheme") || "dark";
let dailyAyahData = null;
let currentSurahVerses = [];   // cached for the open surah
let playbackRate = 1;

// Juz boundary data (static — no fetch needed)
// First ayah of each Juz [surah, ayah]
const JUZ_STARTS = [
    [1, 1], [2, 142], [2, 253], [3, 92], [4, 24], [4, 147], [5, 82], [6, 111], [7, 87], [8, 41],
    [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
    [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]
];

// ============================================================
// READER THEMES
// ============================================================

const readerThemes = {
    dark: {
        bg: "linear-gradient(180deg,#0f172a,#111827)",
        card: "rgba(255,255,255,0.04)", cardBorder: "rgba(255,255,255,0.08)",
        text: "#ffffff", subtext: "#cbd5e1", arabic: "#ffffff",
        accent: "#10b981", accentRgb: "16,185,129",
        toolBg: "rgba(255,255,255,0.05)", drawerBg: "#111827",
        numBg: "linear-gradient(135deg,#34d399,#10b981)", numColor: "#111827",
        bismillah: "#10b981",
        themeBtn: { bg: "rgba(255,255,255,0.06)", color: "#fff" },
        panel: { bg: "#111827", border: "rgba(255,255,255,0.1)", label: "#64748b" },
    },
    warm: {
        bg: "linear-gradient(180deg,#1a1208,#231a0c)",
        card: "rgba(255,220,120,0.05)", cardBorder: "rgba(255,200,80,0.1)",
        text: "#f5e6c8", subtext: "#c4a97a", arabic: "#f5e6c8",
        accent: "#d4a94e", accentRgb: "212,169,78",
        toolBg: "rgba(255,220,120,0.08)", drawerBg: "#231a0c",
        numBg: "linear-gradient(135deg,#d4a94e,#b8892c)", numColor: "#1a1208",
        bismillah: "#d4a94e",
        themeBtn: { bg: "rgba(255,220,120,0.1)", color: "#d4a94e" },
        panel: { bg: "#231a0c", border: "rgba(212,169,78,0.2)", label: "#c4a97a" },
    },
    olive: {
        bg: "linear-gradient(180deg,#0a1918,#0d1f1e)",
        card: "rgba(45,212,191,0.04)", cardBorder: "rgba(45,212,191,0.1)",
        text: "#e8f5f4", subtext: "#8fb5b2", arabic: "#f0faf9",
        accent: "#2dd4bf", accentRgb: "45,212,191",
        toolBg: "rgba(45,212,191,0.07)", drawerBg: "#0d1f1e",
        numBg: "linear-gradient(135deg,#2dd4bf,#0d9488)", numColor: "#0a1918",
        bismillah: "#2dd4bf",
        themeBtn: { bg: "rgba(45,212,191,0.1)", color: "#2dd4bf" },
        panel: { bg: "#0d1f1e", border: "rgba(45,212,191,0.2)", label: "#8fb5b2" },
    },
    sapphire: {
        bg: "linear-gradient(180deg,#080c1a,#0e1225)",
        card: "rgba(129,140,248,0.05)", cardBorder: "rgba(129,140,248,0.12)",
        text: "#e0e7ff", subtext: "#7c86b5", arabic: "#f0f4ff",
        accent: "#818cf8", accentRgb: "129,140,248",
        toolBg: "rgba(129,140,248,0.08)", drawerBg: "#0e1225",
        numBg: "linear-gradient(135deg,#818cf8,#6366f1)", numColor: "#080c1a",
        bismillah: "#818cf8",
        themeBtn: { bg: "rgba(129,140,248,0.1)", color: "#818cf8" },
        panel: { bg: "#0e1225", border: "rgba(129,140,248,0.2)", label: "#7c86b5" },
    },
    light: {
        bg: "linear-gradient(180deg,#f8fafc,#f1f5f9)",
        card: "#ffffff", cardBorder: "rgba(0,0,0,0.07)",
        text: "#0f172a", subtext: "#475569", arabic: "#0f172a",
        accent: "#059669", accentRgb: "5,150,105",
        toolBg: "rgba(0,0,0,0.05)", drawerBg: "#f1f5f9",
        numBg: "linear-gradient(135deg,#34d399,#10b981)", numColor: "#ffffff",
        bismillah: "#059669",
        themeBtn: { bg: "rgba(0,0,0,0.06)", color: "#0f172a" },
        panel: { bg: "#ffffff", border: "rgba(0,0,0,0.1)", label: "#64748b" },
    },
};

// ============================================================
// HELPERS
// ============================================================

function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const m = Math.floor(sec / 60), s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function showFloatingPlayer(surahName, ayahLabel) {
    if (floatingSurah) floatingSurah.textContent = surahName;
    if (floatingAyah) floatingAyah.textContent = ayahLabel;
    if (floatingPlayer) floatingPlayer.classList.add("active");
}

function hideFloatingPlayer() {
    if (floatingPlayer) floatingPlayer.classList.remove("active");
}

function syncMiniPlayIcon(playing) {
    if (!miniPlay) return;
    miniPlay.innerHTML = playing
        ? `<i data-lucide="pause"></i>`
        : `<i data-lucide="play"></i>`;
    lucide.createIcons();
}

function getActiveAudio() {
    return activeAudioMode === "surah" ? audioPlayer : ayahPlayer;
}

function escapeHtml(s) {
    return String(s)
        .replace(/&/g, "&amp;").replace(/</g, "&lt;")
        .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function capitalizeType(t) {
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1);
}

// ============================================================
// POPULATE RECITER SELECTS (from static RECITERS array)
// ============================================================

function populateReciterSelects() {
    const selects = [
        document.getElementById("reciter-select"),
        document.getElementById("reciter-select2"),
    ].filter(Boolean);

    // Exclude reciters that don't have per-ayah audio (fullSurahOnly).
    // These reciters (e.g. Okasha Kameny) are only available as full-surah
    // MP3s on mp3quran.net, not on everyayah.com. They can't play individual
    // ayahs, so they shouldn't appear in the daily ayah or reading modal
    // dropdowns. They ARE available in the Reciters section (reciters/index.html)
    // where full-surah playback works.
    const dropdownReciters = RECITERS.filter(r => !r.fullSurahOnly);

    // Safeguard: if the user previously selected a fullSurahOnly reciter
    // (e.g. Okasha), reset to the default (Mishary) so the dropdown shows
    // a valid selection.
    const currentIsExcluded = RECITERS.find(r => r.id === currentReciterId)?.fullSurahOnly;
    if (currentIsExcluded) {
        currentReciterId = "mishari";
        localStorage.setItem("reciterId", currentReciterId);
    }

    const html = dropdownReciters.map(r =>
        `<option value="${r.id}" ${r.id === currentReciterId ? "selected" : ""}>${r.name}</option>`
    ).join("");

    selects.forEach(sel => { sel.innerHTML = html; sel.value = currentReciterId; });
    updateReciterBadge();
}

function updateReciterBadge() {
    const badge = document.getElementById("current-reciter-badge");
    if (!badge) return;
    const r = RECITERS.find(r => r.id === currentReciterId) || RECITERS[0];
    badge.textContent = r.name;
}

// ============================================================
// VERSE SCROLL + HIGHLIGHT
// ============================================================

function scrollToActiveVerse(ayahNumber) {
    const readerContent = document.querySelector(".reader-content");
    const card = document.querySelector(`.verse-card[data-ayah="${ayahNumber}"]`);
    if (!card || !readerContent) return;
    const target = card.offsetTop - readerContent.clientHeight / 2 + card.clientHeight / 2;
    readerContent.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    card.classList.remove("verse-active");
    void card.offsetWidth;
    card.classList.add("verse-active");
    setTimeout(() => card.classList.remove("verse-active"), 1800);
}

// ============================================================
// APPLY READER THEME
// ============================================================

function applyReaderTheme(key) {
    if (!readerThemes[key]) key = "dark";
    readerThemeKey = key;
    localStorage.setItem("readerTheme", key);
    const t = readerThemes[key];
    const reader = document.querySelector(".reader-content");
    if (!reader) return;

    reader.dataset.theme = key;
    reader.style.background = t.bg;
    reader.style.color = t.text;

    const props = {
        "--reader-accent": t.accent,
        "--reader-accent-rgb": t.accentRgb,
        "--reader-text": t.text,
        "--reader-subtext": t.subtext,
        "--reader-arabic": t.arabic,
        "--reader-card-bg": t.card,
        "--reader-card-border": t.cardBorder,
        "--reader-header-border": t.cardBorder,
        "--reader-tool-bg": t.toolBg,
        "--reader-drawer-bg": t.drawerBg,
    };
    // Set variables on BOTH .reader-content AND .reader-modal
    // so the floating player (which is outside .reader-content but inside .reader-modal) inherits them
    Object.entries(props).forEach(([k, v]) => {
        reader.style.setProperty(k, v);
        const modal = document.querySelector(".reader-modal");
        if (modal) modal.style.setProperty(k, v);
    });

    const themeBtn = document.getElementById("reader-theme-btn");
    if (themeBtn) {
        themeBtn.style.background = t.themeBtn.bg;
        themeBtn.style.color = t.themeBtn.color;
    }

    const panel = document.getElementById("reader-theme-panel");
    if (panel) {
        panel.style.background = t.panel.bg;
        panel.style.borderColor = t.panel.border;
        panel.querySelectorAll(".theme-panel-label,.swatch-label")
            .forEach(el => el.style.color = t.panel.label);
    }

    document.querySelectorAll(".verse-number").forEach(el => {
        el.style.background = t.numBg;
        el.style.color = t.numColor;
        el.style.boxShadow = "none";
    });

    const isLight = key === "light";
    const closeBtn = document.querySelector(".reader-close");
    if (closeBtn) {
        closeBtn.style.background = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
        closeBtn.style.color = isLight ? "#0f172a" : "#fff";
    }

    const miniSettingsBtn = document.getElementById("mini-settings-btn");
    if (miniSettingsBtn) {
        miniSettingsBtn.style.background = isLight ? "#e2e8f0" : "#1e293b";
        miniSettingsBtn.style.color = isLight ? "#0f172a" : "#fff";
    }

    document.querySelectorAll(".theme-swatch")
        .forEach(s => s.classList.toggle("active", s.dataset.theme === key));
    refreshBookmarkButtonStates();
}

// ============================================================
// READER THEME PANEL
// ============================================================

function initReaderThemePanel() {
    const btn = document.getElementById("reader-theme-btn");
    const panel = document.getElementById("reader-theme-panel");
    if (!btn || !panel) return;

    btn.addEventListener("click", e => { e.stopPropagation(); panel.classList.toggle("open"); });
    document.addEventListener("click", e => {
        if (!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove("open");
    });
    panel.querySelectorAll(".theme-swatch").forEach(sw => {
        sw.addEventListener("click", () => { applyReaderTheme(sw.dataset.theme); panel.classList.remove("open"); });
    });
    applyReaderTheme(readerThemeKey);
}

// ============================================================
// MINI SETTINGS DRAWER
// ============================================================

function initMiniSettingsDrawer() {
    const btn = document.getElementById("mini-settings-btn");
    const drawer = document.getElementById("mini-settings-drawer");
    if (!btn || !drawer) return;

    btn.addEventListener("click", e => { e.stopPropagation(); drawer.classList.toggle("open"); });
    document.addEventListener("click", e => {
        if (!drawer.contains(e.target) && e.target !== btn) drawer.classList.remove("open");
    });

    drawer.querySelector("#mini-font-increase")?.addEventListener("click", () => {
        arabicFontSize += 0.2; translationFontSize += 0.05; applyFontSizes();
    });
    drawer.querySelector("#mini-font-decrease")?.addEventListener("click", () => {
        arabicFontSize = Math.max(1.5, arabicFontSize - 0.2);
        translationFontSize = Math.max(0.8, translationFontSize - 0.05);
        applyFontSizes();
    });
    drawer.querySelector("#mini-font-reset")?.addEventListener("click", () => {
        arabicFontSize = 3; translationFontSize = 1.05; applyFontSizes();
    });

    drawer.querySelectorAll(".mini-mode-btn").forEach(mbtn => {
        mbtn.addEventListener("click", () => {
            readerMode = mbtn.dataset.mode;
            updateReaderModeUI();
            drawer.querySelectorAll(".mini-mode-btn")
                .forEach(b => b.classList.toggle("active", b.dataset.mode === readerMode));
        });
    });
}

// ============================================================
// SITE-WIDE THEME TOGGLE
// ============================================================

function initThemeToggle() {
    const themeBtn = document.querySelector(".theme-btn");
    if (!themeBtn) return;
    const saved = localStorage.getItem("siteTheme") || "dark";
    if (saved === "light") {
        document.body.classList.add("light-mode"); siteTheme = "light";
        themeBtn.innerHTML = `<i data-lucide="sun"></i>`; lucide.createIcons();
    }
    themeBtn.addEventListener("click", () => {
        siteTheme = siteTheme === "dark" ? "light" : "dark";
        document.body.classList.toggle("light-mode", siteTheme === "light");
        themeBtn.innerHTML = siteTheme === "light"
            ? `<i data-lucide="sun"></i>` : `<i data-lucide="moon"></i>`;
        localStorage.setItem("siteTheme", siteTheme);
        lucide.createIcons();
    });
}

// ============================================================
// ANIMATED SEARCH PLACEHOLDER
// ============================================================

function initAnimatedPlaceholder() {
    if (!searchInput) return;
    const hints = [
        "Search surah name…",
        "e.g. 'Al-Baqarah' or '2'…",
        "Search by number…",
        "e.g. 'Yasin' or '36'…",
    ];
    let idx = 0;
    searchInput.placeholder = hints[0];
    setInterval(() => {
        idx = (idx + 1) % hints.length;
        searchInput.classList.remove("ph-anim");
        void searchInput.offsetWidth;
        searchInput.placeholder = hints[idx];
        searchInput.classList.add("ph-anim");
    }, 3200);
}

// ============================================================
// FILTER BAR
// ============================================================

function initFilterBar() {
    const filterBtn = document.getElementById("explorer-filter-btn");
    const dropdown = document.getElementById("filter-dropdown");
    if (!filterBtn || !dropdown) return;

    filterBtn.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
        filterBtn.classList.toggle("filter-active");
    });

    document.addEventListener("click", e => {
        if (!dropdown.contains(e.target) && e.target !== filterBtn) {
            dropdown.classList.remove("open");
            filterBtn.classList.remove("filter-active");
        }
    });

    dropdown.addEventListener("click", e => {
        const pill = e.target.closest(".fpill");
        if (!pill) return;
        if (pill.classList.contains("active")) {
            pill.classList.remove("active"); activeFilter = "all";
        } else {
            dropdown.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active"); activeFilter = pill.dataset.filter;
        }
        renderSurahs(getFilteredSurahs());
        dropdown.classList.remove("open");
        filterBtn.classList.remove("filter-active");
        filterBtn.style.background = activeFilter === "all"
            ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.3)";
    });

    document.addEventListener("click", e => {
        if (!e.target.closest("#filter-clear-btn")) return;
        dropdown.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
        activeFilter = "all"; renderSurahs(getFilteredSurahs());
        filterBtn.style.background = "rgba(16,185,129,0.12)";
        dropdown.classList.remove("open");
        filterBtn.classList.remove("filter-active");
    });

    // Build Juz pills statically
    const juzCon = document.getElementById("juz-pills");
    const hizbCon = document.getElementById("hizb-pills");
    if (juzCon) juzCon.innerHTML = Array.from({ length: 30 }, (_, i) => i + 1).map(n => `<button type="button" class="fpill" data-filter="juz-${n}">Juz ${n}</button>`).join("");
    if (hizbCon) hizbCon.innerHTML = Array.from({ length: 60 }, (_, i) => i + 1).map(n => `<button type="button" class="fpill" data-filter="hizb-${n}">Hizb ${n}</button>`).join("");
}

// ============================================================
// JUZ / HIZB FILTER LOGIC (static — no API)
// ============================================================

function surahInJuz(surahId, juzNum) {
    const juzIdx = juzNum - 1;
    const [startS, startA] = JUZ_STARTS[juzIdx];
    const [endS, endA] = JUZ_STARTS[juzIdx + 1] || [115, 1];
    // Fix: when juz starts and ends in the SAME surah (e.g. juz 2 = 2:142 to 2:253),
    // the old code surahId >= startS && surahId < endS would fail (2 >= 2 && 2 < 2 = false).
    // Now we correctly include the surah if any part of it falls in the juz range.
    if (surahId < startS) return false;
    if (surahId > endS) return false;
    if (surahId === endS && endA === 1) return false;
    return true;
}

function surahInHizb(surahId, hizbNum) {
    // Each Hizb = exactly half a Juz. Hizb 1 = first half of Juz 1, Hizb 2 = second half, etc.
    // Use HIZB_STARTS data for accurate filtering.
    if (typeof HIZB_STARTS === 'undefined') return false;
    const hizbIdx = hizbNum - 1;
    const [startS, startA] = HIZB_STARTS[hizbIdx];
    const [endS, endA] = HIZB_STARTS[hizbIdx + 1] || [115, 1];
    // A surah is in this hizb if any part of it falls within the hizb's range
    if (surahId < startS) return false;
    if (surahId > endS) return false;
    if (surahId === endS && endA === 1) return false;
    return true;
}

// ============================================================
// FILTER LOGIC
// ============================================================

function getFilteredSurahs() {
    const val = searchInput ? searchInput.value.trim().toLowerCase() : "";
    let base = allSurahs;

    if (activeFilter === "makkah" || activeFilter === "meccan") {
        base = allSurahs.filter(s => s.type === "meccan");
    } else if (activeFilter === "madinah" || activeFilter === "medinan") {
        base = allSurahs.filter(s => s.type === "medinan");
    } else if (activeFilter === "revelation-meccan") {
        base = allSurahs.filter(s => s.type === "meccan").sort((a, b) => (a.revelationOrder || 999) - (b.revelationOrder || 999));
    } else if (activeFilter === "revelation-medinan") {
        base = allSurahs.filter(s => s.type === "medinan").sort((a, b) => (a.revelationOrder || 999) - (b.revelationOrder || 999));
    } else if (activeFilter === "revelation-order") {
        base = [...allSurahs].sort((a, b) => (a.revelationOrder || 999) - (b.revelationOrder || 999));
    } else if (activeFilter.startsWith("juz-")) {
        const n = Number(activeFilter.split("-")[1]);
        base = allSurahs.filter(s => surahInJuz(s.id, n));
    } else if (activeFilter.startsWith("hizb-")) {
        const n = Number(activeFilter.split("-")[1]);
        base = allSurahs.filter(s => surahInHizb(s.id, n));
    }

    if (!val) return base;
    return base.filter(s =>
        s.transliteration.toLowerCase().includes(val) ||
        s.name.includes(val) ||
        s.translation.toLowerCase().includes(val) ||
        String(s.id) === val
    );
}

if (searchInput) searchInput.addEventListener("input", () => renderSurahs(getFilteredSurahs()));

// ============================================================
// BOOKMARKS
// ============================================================

function getBookmarks() { try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; } }
function saveBookmarks(list) { localStorage.setItem("bookmarks", JSON.stringify(list)); }
function isBookmarked(surah, ayah) { return getBookmarks().some(b => b.surah === surah && b.ayah === ayah); }

function toggleBookmark(entry) {
    let list = getBookmarks();
    const idx = list.findIndex(b => b.surah === entry.surah && b.ayah === entry.ayah);
    if (idx >= 0) { list.splice(idx, 1); showToast("Bookmark removed"); }
    else { list.unshift({ ...entry, savedAt: Date.now() }); showToast("Verse bookmarked ✓"); }
    saveBookmarks(list); renderBookmarks(); refreshBookmarkButtonStates();
}

function renderBookmarks() {
    const listEl = document.getElementById("bookmarks-list");
    const countEl = document.getElementById("bookmarks-count");
    if (!listEl) return;
    const bks = getBookmarks();
    if (countEl) countEl.textContent = `${bks.length} saved`;
    if (!bks.length) {
        listEl.innerHTML = `<div class="bookmarks-empty" id="bookmarks-empty"><i data-lucide="bookmark"></i><p>No bookmarks yet. Save verses from the reader.</p></div>`;
        lucide.createIcons(); return;
    }
    listEl.innerHTML = bks.map(b => `
    <article class="bookmark-card">
      <div class="bookmark-card-main">
        <div class="bookmark-card-meta">
          <span class="bookmark-tag">${escapeHtml(b.surahName)} · Ayah ${b.ayah}</span>
          <span class="bookmark-date">${new Date(b.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
        </div>
        <div class="bookmark-arabic">${escapeHtml(b.arabic)}</div>
        <div class="bookmark-translation">${escapeHtml(b.translation)}</div>
      </div>
      <div class="bookmark-actions">
        <button type="button" class="open-bookmark" data-surah="${b.surah}" data-ayah="${b.ayah}" title="Open in reader"><i data-lucide="book-open"></i></button>
        <button type="button" class="remove-bookmark" data-surah="${b.surah}" data-ayah="${b.ayah}" title="Remove"><i data-lucide="trash-2"></i></button>
      </div>
    </article>`).join("");
    lucide.createIcons();

    document.querySelectorAll(".open-bookmark").forEach(btn => {
        btn.addEventListener("click", () => {
            selectedSurah = Number(btn.dataset.surah);
            openReader(selectedSurah, Number(btn.dataset.ayah));
        });
    });
    document.querySelectorAll(".remove-bookmark").forEach(btn => {
        btn.addEventListener("click", () => {
            saveBookmarks(getBookmarks().filter(b =>
                !(b.surah === Number(btn.dataset.surah) && b.ayah === Number(btn.dataset.ayah))
            ));
            renderBookmarks(); refreshBookmarkButtonStates(); showToast("Bookmark removed");
        });
    });
}

function refreshBookmarkButtonStates() {
    document.querySelectorAll(".bookmark-btn").forEach(btn => {
        const saved = isBookmarked(Number(btn.dataset.surah), Number(btn.dataset.ayah));
        btn.classList.toggle("bookmarked", saved);
        btn.innerHTML = saved ? `<i data-lucide="bookmark-check"></i>` : `<i data-lucide="bookmark"></i>`;
        btn.title = saved ? "Remove bookmark" : "Bookmark verse";
    });
    const dailyBtn = document.getElementById("daily-bookmark-btn");
    if (dailyBtn && dailyAyahData) {
        const saved = isBookmarked(dailyAyahData.surah, dailyAyahData.ayah);
        dailyBtn.classList.toggle("bookmarked", saved);
        dailyBtn.innerHTML = saved ? `<i data-lucide="bookmark-check"></i>` : `<i data-lucide="bookmark"></i>`;
        dailyBtn.title = saved ? "Remove bookmark" : "Bookmark this ayah";
    }
    lucide.createIcons();
}

function initBookmarks() {
    renderBookmarks();
    document.getElementById("bookmarks-clear-btn")?.addEventListener("click", () => {
        if (!getBookmarks().length || !confirm("Remove all bookmarks?")) return;
        saveBookmarks([]); renderBookmarks(); refreshBookmarkButtonStates(); showToast("All bookmarks cleared");
    });
    document.getElementById("daily-bookmark-btn")?.addEventListener("click", () => {
        if (dailyAyahData) toggleBookmark(dailyAyahData);
    });
}

// ============================================================
// DAILY AYAH — picks a verse by date, uses static CDN
// ============================================================

async function loadDailyAyah() {
    try {
        const now = new Date();
        const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        const surahNum = (seed % 114) + 1;
        const surahMeta = SURAH_LIST[surahNum - 1];
        const ayahNum = (seed % surahMeta.total_verses) + 1;

        // Fetch Uthmani text from alquran.cloud (same as mushaf page)
        let uthmaniText = "";
        try {
            const uthRes = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/quran-uthmani`);
            const uthData = await uthRes.json();
            uthmaniText = uthData?.data?.text || "";
        } catch (e) {
            console.warn("Uthmani fetch failed, falling back to quran-json");
        }

        // Fetch translation from quran-json
        const res = await fetch(CDN.surah(surahNum));
        const data = await res.json();
        const verse = data.verses[ayahNum - 1];

        // Use Uthmani text if available, otherwise fall back to quran-json text
        const arabicText = uthmaniText || verse.text;

        const arabicEl = document.querySelector(".ayah-arabic");
        const transEl = document.querySelector(".ayah-translation");
        if (arabicEl) arabicEl.textContent = arabicText;
        if (transEl) transEl.textContent = verse.translation;

        const infoH3 = document.querySelector(".audio-info h3");
        const infoSpan = document.querySelector(".audio-info span");
        if (infoH3) infoH3.textContent = surahMeta.transliteration;
        if (infoSpan) infoSpan.textContent = `Verse ${ayahNum}`;

        dailyAyahData = {
            surah: surahNum, ayah: ayahNum,
            totalAyahs: surahMeta.total_verses,
            surahName: surahMeta.transliteration,
            arabic: arabicText, translation: verse.translation,
        };
        refreshBookmarkButtonStates();

        if (quranAudio) {
            quranAudio.src = getAyahAudioUrl(surahNum, ayahNum, currentReciterId);
            quranAudio.volume = 0.8;
            quranAudio.load();
        }

        wireHomepageAudioPlayer();
    } catch (err) {
        console.error("Daily ayah failed:", err);
    }
}

function initDailyAyahActions() {

    // ── COPY ──
    document.getElementById("daily-copy-btn")?.addEventListener("click", async () => {
        if (!dailyAyahData) return;
        const text = `${dailyAyahData.arabic}\n\n${dailyAyahData.translation}\n\n— ${dailyAyahData.surahName}, Ayah ${dailyAyahData.ayah}`;
        try {
            await navigator.clipboard.writeText(text);
            showToast("Verse copied ✓");
        } catch {
            showToast("Copy failed");
        }
    });

    // ── SHARE ──
    document.getElementById("daily-share-btn")?.addEventListener("click", async () => {
        if (!dailyAyahData) return;
        if (window.BacaShare && typeof window.BacaShare.previewVerseImage === 'function') {
            const siteTheme = document.body.classList.contains("light-mode") ? "light" : "dark";
            await window.BacaShare.previewVerseImage({
                arabic: dailyAyahData.arabic,
                translation: dailyAyahData.translation,
                reference: `${dailyAyahData.surahName} verse ${dailyAyahData.ayah}`,
                surahName: dailyAyahData.surahName,
                theme: siteTheme
            });
        } else {
            const text = `${dailyAyahData.arabic}\n\n${dailyAyahData.translation}\n\n— ${dailyAyahData.surahName}, verse ${dailyAyahData.ayah}`;
            try {
                if (navigator.share) { await navigator.share({ title: "Daily Ayah — Baca", text }); showToast("Shared ✓"); }
                else { await navigator.clipboard.writeText(text); showToast("Copied to clipboard"); }
            } catch { showToast("Share cancelled"); }
        }
    });

    // ── TAFSIR ──
    const tafsirBtn = document.getElementById("daily-tafsir-btn");
    const tafsirPanel = createDailyTafsirPanel();

    tafsirBtn?.addEventListener("click", async () => {
        if (!dailyAyahData) return;

        // Toggle
        if (tafsirPanel.classList.contains("active")) {
            tafsirPanel.classList.remove("active");
            tafsirBtn.title = "View Tafsir";
            return;
        }

        tafsirPanel.classList.add("active");
        tafsirBtn.title = "Close Tafsir";
        tafsirPanel.innerHTML = `<div class="daily-tafsir-loading"><i data-lucide="loader-2" class="spin"></i> Loading tafsir…</div>`;
        lucide.createIcons();

        try {
            const CDN_TAFSIR = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/${dailyAyahData.surah}/${dailyAyahData.ayah}.json`;
            const res = await fetch(CDN_TAFSIR);
            const data = await res.json();
            const text = data.text || data.tafsir || "No tafsir available for this verse.";
            tafsirPanel.innerHTML = `
        <div class="daily-tafsir-header">
          <span class="daily-tafsir-badge">Ibn Kathir — ${dailyAyahData.surahName} · Ayah ${dailyAyahData.ayah}</span>
          <button class="daily-tafsir-close" title="Close"><i data-lucide="x"></i></button>
        </div>
        <p class="daily-tafsir-body">${text}</p>`;
            lucide.createIcons();
            tafsirPanel.querySelector(".daily-tafsir-close")?.addEventListener("click", () => {
                tafsirPanel.classList.remove("active");
                tafsirBtn.title = "View Tafsir";
            });
        } catch {
            tafsirPanel.innerHTML = `<p class="daily-tafsir-error">Could not load tafsir. Please try again.</p>`;
        }
    });
}

function createDailyTafsirPanel() {
    const existing = document.getElementById("daily-tafsir-panel");
    if (existing) return existing;
    const panel = document.createElement("div");
    panel.id = "daily-tafsir-panel";
    panel.className = "daily-tafsir-panel";
    // Insert after .ayah-card
    const card = document.querySelector(".ayah-card");
    card?.parentNode?.insertBefore(panel, card.nextSibling);
    return panel;
}

function wireHomepageAudioPlayer() {
    const playBtn = document.getElementById("play-btn");
    const progressEl = document.getElementById("audio-progress");
    const progressFill = progressEl?.querySelector(".audio-progress-fill");
    const currentTimeEl = document.getElementById("current-time");
    const durationEl = document.getElementById("duration");
    const muteBtn = document.getElementById("mute-btn");
    const volumeSlider = document.getElementById("volume-slider");
    const speedBton = document.getElementById("speed-bton");
    const skipBack = document.getElementById("skip-back-btn");
    const skipFwd = document.getElementById("skip-forward-btn");
    const reciterSel = document.getElementById("reciter-select");
    if (!quranAudio || !playBtn) return;

    let homeSpeed = 1;

    playBtn.onclick = () => {
        if (quranAudio.paused) { quranAudio.play(); playBtn.innerHTML = `<i data-lucide="pause"></i>`; }
        else { quranAudio.pause(); playBtn.innerHTML = `<i data-lucide="play"></i>`; }
        lucide.createIcons();
    };

    quranAudio.addEventListener("timeupdate", () => {
        if (!quranAudio.duration) return;
        const pct = (quranAudio.currentTime / quranAudio.duration) * 100;
        if (progressFill) progressFill.style.width = pct + "%";
        if (currentTimeEl) currentTimeEl.textContent = formatTime(quranAudio.currentTime);
        if (durationEl) durationEl.textContent = formatTime(quranAudio.duration);
    });

    progressEl?.addEventListener("click", e => {
        const rect = progressEl.getBoundingClientRect();
        quranAudio.currentTime = ((e.clientX - rect.left) / rect.width) * quranAudio.duration;
    });

    volumeSlider?.addEventListener("input", () => { quranAudio.volume = volumeSlider.value / 100; });

    if (muteBtn) muteBtn.onclick = () => {
        quranAudio.muted = !quranAudio.muted;
        muteBtn.innerHTML = quranAudio.muted
            ? `<i data-lucide="volume-x"></i>` : `<i data-lucide="volume-2"></i>`;
        lucide.createIcons();
    };

    if (speedBton) speedBton.onclick = () => {
        homeSpeed = homeSpeed >= 2 ? 1 : homeSpeed + 0.25;
        quranAudio.playbackRate = homeSpeed;
        speedBton.textContent = `${homeSpeed}x`;
    };

    if (skipBack) skipBack.onclick = () => { quranAudio.currentTime = Math.max(0, quranAudio.currentTime - 10); };
    if (skipFwd) skipFwd.onclick = () => { quranAudio.currentTime = Math.min(quranAudio.duration || 0, quranAudio.currentTime + 10); };

    if (reciterSel) {
        reciterSel.addEventListener("change", () => {
            currentReciterId = reciterSel.value;
            localStorage.setItem("reciterId", currentReciterId);
            syncAllReciterSelects(reciterSel);
            if (dailyAyahData) {
                const wasPlaying = !quranAudio.paused;
                quranAudio.src = getAyahAudioUrl(dailyAyahData.surah, dailyAyahData.ayah, currentReciterId);
                quranAudio.load();
                if (wasPlaying) quranAudio.addEventListener("canplay", () => quranAudio.play(), { once: true });
            }
            playBtn.innerHTML = quranAudio.paused ? `<i data-lucide="play"></i>` : `<i data-lucide="pause"></i>`;
            lucide.createIcons();
        });
    }

    quranAudio.addEventListener("ended", () => {
        playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    });
}

function syncAllReciterSelects(sourceSelect) {
    ["reciter-select", "reciter-select2"].forEach(id => {
        const el = document.getElementById(id);
        if (el && el !== sourceSelect) el.value = currentReciterId;
    });
    updateReciterBadge();
}

// ============================================================
// REPEAT BUTTON
// ============================================================

function initRepeatButton() {
    const btn = document.getElementById("repeat-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
        if (repeatMode === "off") { repeatMode = "surah"; btn.innerHTML = `<i data-lucide="repeat-1"></i> Surah`; showToast("Repeat: Surah"); }
        else if (repeatMode === "surah") { repeatMode = "quran"; btn.innerHTML = `<i data-lucide="repeat"></i> Qur'an`; showToast("Repeat: Qur'an"); }
        else { repeatMode = "off"; btn.innerHTML = `<i data-lucide="repeat"></i> Off`; showToast("Repeat: off"); }
        lucide.createIcons();
    });
}

// ============================================================
// READER MODE
// ============================================================

function updateReaderModeUI() {
    document.querySelectorAll(".verse-arabic").forEach(el => {
        el.style.display = readerMode === "translation" ? "none" : "block";
    });
    document.querySelectorAll(".verse-transliteration").forEach(el => {
        el.style.display = readerMode === "translation" ? "none" : "block";
    });
    document.querySelectorAll(".verse-translation").forEach(el => {
        el.style.display = readerMode === "arabic" ? "none" : "block";
    });
    [modeBoth, modeArabic, modeTranslation].forEach(b => b && b.classList.remove("active"));
    if (readerMode === "both") modeBoth?.classList.add("active");
    if (readerMode === "arabic") modeArabic?.classList.add("active");
    if (readerMode === "translation") modeTranslation?.classList.add("active");
    document.querySelectorAll(".mini-mode-btn")
        .forEach(b => b.classList.toggle("active", b.dataset.mode === readerMode));
}

modeBoth?.addEventListener("click", () => { readerMode = "both"; updateReaderModeUI(); });
modeArabic?.addEventListener("click", () => { readerMode = "arabic"; updateReaderModeUI(); });
modeTranslation?.addEventListener("click", () => { readerMode = "translation"; updateReaderModeUI(); });

// ============================================================
// FONT SIZES
// ============================================================

function applyFontSizes() {
    document.querySelectorAll(".verse-arabic").forEach(el => el.style.fontSize = arabicFontSize + "rem");
    document.querySelectorAll(".verse-translation").forEach(el => el.style.fontSize = translationFontSize + "rem");
    document.querySelectorAll(".verse-transliteration").forEach(el =>
        el.style.fontSize = (translationFontSize * 0.92) + "rem"
    );
    // Also affect tafsir panels
    document.querySelectorAll(".tafsir-body, .tafsir-body p").forEach(el =>
        el.style.fontSize = translationFontSize + "rem"
    );
    // Mini settings drawer font changes
    document.querySelectorAll(".verse-arabic").forEach(el => el.style.fontSize = arabicFontSize + "rem");
    document.querySelectorAll(".verse-reader-translation").forEach(el => el.style.fontSize = translationFontSize + "rem");
}

document.getElementById("font-increase")?.addEventListener("click", () => { arabicFontSize += 0.2; translationFontSize += 0.05; applyFontSizes(); });
document.getElementById("font-decrease")?.addEventListener("click", () => { arabicFontSize = Math.max(1.5, arabicFontSize - 0.2); translationFontSize = Math.max(0.8, translationFontSize - 0.05); applyFontSizes(); });
document.getElementById("font-reset")?.addEventListener("click", () => { arabicFontSize = 3; translationFontSize = 1.05; applyFontSizes(); });

// ============================================================
// CONTINUE READING
// ============================================================

function updateContinueReading() {
    const saved = (() => { try { return JSON.parse(localStorage.getItem("lastRead")); } catch { return null; } })();
    if (!saved) return;
    const el = id => document.getElementById(id);
    if (el("continue-surah")) el("continue-surah").textContent = saved.surahName;
    if (el("continue-ayah")) el("continue-ayah").textContent = `Ayah ${saved.ayah} of ${saved.totalAyahs}`;
    if (el("continue-meta")) el("continue-meta").textContent = `${saved.totalAyahs - saved.ayah} Ayahs Remaining`;
    const pct = saved.totalAyahs ? Math.round((saved.ayah / saved.totalAyahs) * 100) : 0;
    if (el("reading-status")) el("reading-status").textContent = pct >= 100 ? "Completed" : "In Progress";
    if (el("continue-progress")) el("continue-progress").textContent = `${pct}% Completed`;
    const fill = document.querySelector(".progress-fill");
    if (fill) fill.style.width = pct + "%";
}

document.getElementById("resume-reading-btn")?.addEventListener("click", () => {
    const saved = (() => { try { return JSON.parse(localStorage.getItem("lastRead")); } catch { return null; } })();
    if (!saved?.totalAyahs) return;
    openReader(Number(saved.surah), saved.ayah);
});

// ============================================================
// LOAD SURAHS (from static SURAH_LIST — instant, no fetch)
// ============================================================

function loadSurahs() {
    allSurahs = SURAH_LIST.map(s => ({
        ...s,
        // normalise type to Meccan/Medinan for display
        revelationType: capitalizeType(s.type),
        // alias for compatibility with filter logic
        number: s.id, englishName: s.transliteration,
        name_arabic: s.name, numberOfAyahs: s.total_verses,
    }));
    renderSurahs(allSurahs);
}

// ============================================================
// RENDER SURAH GRID
// ============================================================

function renderSurahs(data) {
    if (!grid) return;
    const favorites = (() => { try { return JSON.parse(localStorage.getItem("favorites")) || []; } catch { return []; } })();
    if (!data.length) {
        grid.innerHTML = `<p style="color:#94a3b8;grid-column:1/-1;text-align:center;padding:2rem">No surahs found.</p>`;
        return;
    }
    grid.innerHTML = data.map(s => {
        const isFav = favorites.includes(s.id);
        return `
    <div class="surah-card" data-number="${s.id}" data-name="${escapeHtml(s.transliteration)}"
      data-arabic="${escapeHtml(s.name)}" data-ayahs="${s.total_verses}"
      data-type="${capitalizeType(s.type)}" data-meaning="${escapeHtml(s.translation)}">
      <button class="favorite-btn ${isFav ? "active" : ""}" data-id="${s.id}" title="Favourite">★</button>
      <div class="surah-number">${s.id}</div>
      <h3>${s.transliteration}</h3>
      <div class="surah-arabic-name">${s.name}</div>
      <div class="surah-meaning">${s.translation}</div>
      <div class="surah-meta"><span>${s.total_verses} Ayahs</span><span>${capitalizeType(s.type)}</span></div>
    </div>`;
    }).join("");
    activateFavorites();
    activateCards();
}

function activateFavorites() {
    document.querySelectorAll(".favorite-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            let favs = (() => { try { return JSON.parse(localStorage.getItem("favorites")) || []; } catch { return []; } })();
            favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
            localStorage.setItem("favorites", JSON.stringify(favs));
            renderSurahs(getFilteredSurahs());
        });
    });
}

function activateCards() {
    document.querySelectorAll(".surah-card").forEach(card => {
        card.addEventListener("click", e => {
            if (e.target.closest(".favorite-btn")) return;
            selectedSurah = Number(card.dataset.number);
            document.getElementById("modal-surah-number").textContent = card.dataset.number;
            document.getElementById("modal-surah-name").textContent = card.dataset.name;
            document.getElementById("modal-surah-arabic").textContent = card.dataset.arabic;
            document.getElementById("modal-surah-ayahs").textContent = card.dataset.ayahs + " Ayahs";
            document.getElementById("modal-surah-type").textContent = card.dataset.type;
            surahModal.classList.add("active");
            lucide.createIcons();
        });
    });
}

modalClose?.addEventListener("click", () => surahModal.classList.remove("active"));
document.querySelector(".surah-modal-overlay")?.addEventListener("click", () => surahModal.classList.remove("active"));

// ============================================================
// BISMILLAH STRIP
// ============================================================

function cleanAyah(text, surahNumber, ayahNumber) {
    // Surah 9 (At-Tawbah) has no Bismillah; Surah 1's verse 1 IS the Bismillah
    if (surahNumber === 9 || surahNumber === 1) return text;
    if (ayahNumber === 1) {
        // Remove leading Bismillah words (first 4 words) from verse text
        const words = text.split(" ");
        if (words.length > 4 && words.slice(0, 4).join(" ").includes("بِسْمِ")) {
            return words.slice(4).join(" ").trim();
        }
    }
    return text;
}

// ============================================================
// TAFSIR PANEL — loads on demand from static CDN
// ============================================================

async function loadTafsir(surahNum, ayahNum) {
    const panelId = `tafsir-panel-${surahNum}-${ayahNum}`;
    const existing = document.getElementById(panelId);
    if (existing) { existing.remove(); return; } // toggle off

    const card = document.querySelector(`.verse-card[data-surah="${surahNum}"][data-ayah="${ayahNum}"]`);
    if (!card) return;

    // Use the user's selected tafsir source (from reader settings)
    const source = readerTafsirSource || "ibnkathir";
    const sourceName = source === "ibnkathir" ? "Ibn Kathir" :
                       source === "maarif" ? "Ma'arif-ul-Quran" :
                       source === "jalalayn" ? "Jalalayn" : "Ibn Kathir";
    const isAr = source === "jalalayn";

    const panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "tafsir-panel";
    if (isAr) panel.setAttribute("dir", "rtl");
    panel.innerHTML = `<div class="tafsir-loading"><i data-lucide="loader-2" class="spin"></i> Loading ${sourceName} tafsir…</div>`;
    card.appendChild(panel);
    lucide.createIcons();

    try {
        const text = await fetchReaderTafsir(surahNum, ayahNum, source);
        if (!text) {
            panel.innerHTML = `<p class="tafsir-error">No tafsir available for this verse.</p>`;
            return;
        }
        const isArabic = source === "jalalayn";
        panel.innerHTML = `
      <div class="tafsir-header">
        <span class="tafsir-badge">${sourceName}${isArabic ? " (Arabic)" : ""}</span>
        <button class="tafsir-close" data-ayah="${ayahNum}"><i data-lucide="x"></i></button>
      </div>
      <p class="tafsir-body${isArabic ? " tafsir-arabic" : ""}">${escapeHtml(text).replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>")}</p>`;
        lucide.createIcons();
        panel.querySelector(".tafsir-close")?.addEventListener("click", () => panel.remove());
    } catch (err) {
        panel.innerHTML = `<p class="tafsir-error">Could not load tafsir. Please try again.</p>`;
    }
}

// ============================================================
// OPEN READER — fetches surah from static CDN and renders
// ============================================================

async function openReader(surahNum, scrollToAyah = null) {
    if (!surahNum) return;
    selectedSurah = surahNum;
    const meta = SURAH_LIST[surahNum - 1];

    try {
        const res = await fetch(CDN.surah(surahNum));
        const data = await res.json();
        const verses = data.verses;
        currentSurahVerses = verses;
        totalAyahsInSurah = verses.length;

        document.getElementById("reader-title").textContent = meta.transliteration;
        document.getElementById("reader-arabic-name").textContent = meta.name;
        document.getElementById("reader-meaning").textContent = meta.translation;
        document.getElementById("reader-meta").textContent =
            `${verses.length} Ayahs · ${capitalizeType(meta.type)}`;

        const bism = document.getElementById("bismillah-container");
        if (bism) {
            bism.innerHTML = (surahNum !== 1 && surahNum !== 9)
                ? `<div class="bismillah-header">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>` : "";
        }

        const versesHtml = verses.map((v, i) => {
            // Use Uthmani text from alquran.cloud if available (v.uthmaniText is set by fetchUthmaniForReader)
            const arabicText = v.uthmaniText || v.text;
            const arabicCleaned = cleanAyah(arabicText, surahNum, v.id);
            return `
      <div class="verse-card" data-surah="${surahNum}" data-ayah="${v.id}">
        <div class="verse-number">${v.id}</div>
        <div class="verse-arabic">${arabicCleaned}</div>
        <div class="verse-transliteration">${escapeHtml(v.transliteration || "")}</div>
        <div class="verse-translation" data-ayah="${v.id}">${escapeHtml(v.translation)}</div>
        <div class="verse-actions">
          <button class="ayah-action play-btn"     data-surah="${surahNum}" data-ayah="${v.id}" title="Play verse"><i data-lucide="play"></i></button>
          <button class="ayah-action bookmark-btn" data-surah="${surahNum}" data-ayah="${v.id}" title="Bookmark"><i data-lucide="bookmark"></i></button>
          <button class="ayah-action tafsir-btn"   data-surah="${surahNum}" data-ayah="${v.id}" title="Tafsir"><i data-lucide="book-open-text"></i></button>
          <button class="ayah-action copy-btn"     title="Copy verse"><i data-lucide="copy"></i></button>
          <button class="ayah-action share-btn"    title="Share verse"><i data-lucide="share-2"></i></button>
        </div>
      </div>`;
        }).join("");

        document.getElementById("reader-verses").innerHTML = versesHtml;

        // Track reading position
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    const ayah = Number(entry.target.dataset.ayah);
                    localStorage.setItem("lastRead", JSON.stringify({
                        surah: surahNum, surahName: meta.transliteration,
                        surahArabic: meta.name, totalAyahs: verses.length, ayah,
                        savedAt: Date.now()
                    }));
                    updateContinueReading();
                }
            });
        }, { threshold: 0.5 });
        document.querySelectorAll(".verse-card").forEach(c => observer.observe(c));

        applyFontSizes();
        updateReaderModeUI();
        loadSurahAudio();
        applyReaderTheme(readerThemeKey);
        refreshBookmarkButtonStates();

        readerModal.classList.add("active");
        document.body.style.overflow = "hidden";
        document.body.classList.add("reader-open"); // hides chat-widget FAB
        requestAnimationFrame(() => {
            document.querySelector(".reader-content").scrollTop = 0;
        });
        lucide.createIcons();
        surahModal.classList.remove("active");

        if (scrollToAyah) {
            setTimeout(() => scrollToActiveVerse(scrollToAyah), 600);
        }

    } catch (err) {
        console.error("Failed to open surah:", err);
        showToast("Could not load surah. Check your internet connection.");
    }
}

// Read Surah button from modal
readBtn?.addEventListener("click", () => {
    if (selectedSurah) openReader(selectedSurah);
});

// ============================================================
// READER CLOSE
// ============================================================

function closeReader() {
    readerModal.classList.remove("active");
    document.body.style.overflow = "auto";
    document.body.classList.remove("reader-open"); // restores chat-widget FAB
    audioPlayer.pause();
    if (ayahPlayer) ayahPlayer.pause();
    if (activePlayButton) {
        activePlayButton.innerHTML = `<i data-lucide="play"></i>`;
        lucide.createIcons();
        activePlayButton = null;
    }
    if (playButton) { playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
    syncMiniPlayIcon(false);
    hideFloatingPlayer();
    document.getElementById("reader-theme-panel")?.classList.remove("open");
    document.getElementById("mini-settings-drawer")?.classList.remove("open");
}

readerClose?.addEventListener("click", closeReader);
document.querySelector(".reader-overlay")?.addEventListener("click", closeReader);

// ============================================================
// SETTINGS / AUDIO DRAWER (reader toolbar)
// ============================================================

document.getElementById("reader-settings-btn")?.addEventListener("click", () => {
    document.getElementById("audio-drawer")?.classList.remove("active");
    document.getElementById("settings-drawer")?.classList.toggle("active");
});
document.getElementById("reader-audio-btn")?.addEventListener("click", () => {
    document.getElementById("settings-drawer")?.classList.remove("active");
    document.getElementById("audio-drawer")?.classList.toggle("active");
});

// ============================================================
// FULL-SURAH AUDIO (EveryAyah — full surah mp3 not available,
// so we stream ayah-by-ayah auto-advancing as full-surah mode)
// ============================================================

function loadSurahAudio({ autoplay = false } = {}) {
    if (!selectedSurah || !currentSurahVerses.length) return;
    // Ayah-by-ayah audio (auto-advances to next ayah, scrolls to active verse)
    const url = getAyahAudioUrl(selectedSurah, 1, currentReciterId);
    audioPlayer.src = url;
    audioPlayer.load();
    surahAyahCursor = 1;
    if (autoplay) audioPlayer.play().catch(() => { });
}

// Full-surah player auto-advances ayah by ayah
let surahAyahCursor = 1;

function playSurahFromAyah(ayahNum) {
    surahAyahCursor = ayahNum;
    // Ayah-by-ayah audio — plays one ayah, auto-advances to next, scrolls to active verse
    const url = getAyahAudioUrl(selectedSurah, ayahNum, currentReciterId);
    audioPlayer.src = url;
    audioPlayer.load();
    audioPlayer.play().catch(() => { });
    if (playButton) { playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons(); }
    syncMiniPlayIcon(true);
    showFloatingPlayer(
        SURAH_LIST[selectedSurah - 1]?.transliteration || "Surah",
        `Ayah ${ayahNum}`
    );
    scrollToActiveVerse(ayahNum);
}

playButton?.addEventListener("click", () => {
    if (!audioPlayer.src) {
        // If no audio loaded, load the surah audio starting from ayah 1
        loadSurahAudio({ autoplay: true });
        if (playButton) playButton.innerHTML = `<i data-lucide="pause"></i>`;
        activeAudioMode = "surah";
        surahAyahCursor = 1;
        syncMiniPlayIcon(true);
        showFloatingPlayer(SURAH_LIST[selectedSurah - 1]?.transliteration || "Surah", `Ayah 1`);
        scrollToActiveVerse(1);
        lucide.createIcons();
        return;
    }
    // Pause per-ayah player if running — the two modes must not play simultaneously
    if (!ayahPlayer.paused) {
        ayahPlayer.pause();
        if (activePlayButton) { activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); activePlayButton = null; }
    }
    activeAudioMode = "surah";
    if (audioPlayer.paused) {
        audioPlayer.play().catch(() => { });
        if (playButton) playButton.innerHTML = `<i data-lucide="pause"></i>`;
        syncMiniPlayIcon(true);
        showFloatingPlayer(SURAH_LIST[selectedSurah - 1]?.transliteration || "Surah", `Ayah ${surahAyahCursor}`);
        scrollToActiveVerse(surahAyahCursor);
    } else {
        audioPlayer.pause();
        if (playButton) playButton.innerHTML = `<i data-lucide="play"></i>`;
        syncMiniPlayIcon(false);
    }
    lucide.createIcons();
});

audioPlayer.addEventListener("timeupdate", () => {
    if (progressBar2) {
        progressBar2.max = audioPlayer.duration || 0;
        progressBar2.value = audioPlayer.currentTime;
    }
    if (currentTimeEl2) currentTimeEl2.textContent = formatTime(audioPlayer.currentTime);
    if (durationTimeEl) durationTimeEl.textContent = formatTime(audioPlayer.duration);
});
progressBar2?.addEventListener("input", () => { audioPlayer.currentTime = progressBar2.value; });

audioPlayer.addEventListener("ended", () => {
    if (repeatMode === "surah") {
        audioPlayer.currentTime = 0; audioPlayer.play().catch(() => { });
        showToast("Repeating…"); return;
    }
    // Auto-advance to next ayah (ayah-by-ayah playback)
    const nextAyah = surahAyahCursor + 1;
    if (nextAyah <= totalAyahsInSurah) {
        surahAyahCursor = nextAyah;
        audioPlayer.src = getAyahAudioUrl(selectedSurah, nextAyah, currentReciterId);
        audioPlayer.load();
        audioPlayer.play().catch(() => { });
        showFloatingPlayer(SURAH_LIST[selectedSurah - 1]?.transliteration || "Surah", `Ayah ${nextAyah}`);
        scrollToActiveVerse(nextAyah);
    } else {
        // Surah done
        if (repeatMode === "quran") {
            selectedSurah = selectedSurah < 114 ? selectedSurah + 1 : 1;
            openReader(selectedSurah).then(() => { playSurahFromAyah(1); });
        } else {
            if (playButton) { playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
            syncMiniPlayIcon(false);
            surahAyahCursor = 1;
        }
    }
});

// Speed button
const speedBtn = document.getElementById("speed-btn");
speedBtn?.addEventListener("click", () => {
    playbackRate = playbackRate >= 2 ? 1 : playbackRate + 0.25;
    audioPlayer.playbackRate = playbackRate;
    speedBtn.textContent = `${playbackRate}x`;
});

document.getElementById("next-surah-audio")?.addEventListener("click", () => {
    if (selectedSurah < 114) { selectedSurah++; openReader(selectedSurah).then(() => { playSurahFromAyah(1); }); }
});
document.getElementById("prev-surah-audio")?.addEventListener("click", () => {
    if (selectedSurah > 1) { selectedSurah--; openReader(selectedSurah).then(() => { playSurahFromAyah(1); }); }
});

// ============================================================
// RECITER CHANGE (reader dropdown)
// ============================================================

document.addEventListener("change", e => {
    if (e.target.id !== "reciter-select2") return;
    currentReciterId = e.target.value;
    localStorage.setItem("reciterId", currentReciterId);
    syncAllReciterSelects(e.target);
    // Reload current audio with new reciter
    if (activeAudioMode === "ayah" && activePlayButton) {
        const surah = Number(activePlayButton.dataset.surah);
        const ayah = Number(activePlayButton.dataset.ayah);
        const wasPlaying = !ayahPlayer.paused;
        ayahPlayer.src = getAyahAudioUrl(surah, ayah, currentReciterId);
        ayahPlayer.load();
        if (wasPlaying) ayahPlayer.play().catch(() => { });
    } else {
        const wasPlaying = !audioPlayer.paused;
        audioPlayer.src = getAyahAudioUrl(selectedSurah, surahAyahCursor, currentReciterId);
        audioPlayer.load();
        if (wasPlaying) audioPlayer.play().catch(() => { });
    }
});

// ============================================================
// FAVOURITE RECITER
// ============================================================

// FAVOURITE RECITER — toggle heart icon, save to localStorage
function isFavoriteReciter(reciterId) {
    return localStorage.getItem("favoriteReciter") === reciterId;
}

function updateFavoriteReciterButton() {
    const btn = document.getElementById("favorite-reciter");
    if (!btn) return;
    const isFav = isFavoriteReciter(currentReciterId);
    // Use Font Awesome for filled vs outline heart
    btn.innerHTML = isFav
        ? '<i class="fa-solid fa-heart" style="color: var(--reader-accent); font-size: 1.1rem;"></i>'
        : '<i class="fa-regular fa-heart" style="color: var(--reader-subtext); font-size: 1.1rem;"></i>';
    btn.style.background = isFav ? "rgba(var(--reader-accent-rgb), 0.18)" : "var(--reader-tool-bg)";
    btn.title = isFav ? "Remove from favourites" : "Add to favourites";
}

document.getElementById("favorite-reciter")?.addEventListener("click", function () {
    const isFav = isFavoriteReciter(currentReciterId);
    if (isFav) {
        // Unfavorite
        localStorage.removeItem("favoriteReciter");
        showToast("Removed from favourites");
    } else {
        // Favorite
        localStorage.setItem("favoriteReciter", currentReciterId);
        localStorage.setItem("reciterId", currentReciterId);
        showToast("Reciter saved as favourite ✓");
    }
    updateFavoriteReciterButton();
});

// Update favorite button when reciter changes
document.addEventListener("change", e => {
    if (e.target.id === "reciter-select2") {
        setTimeout(updateFavoriteReciterButton, 100);
    }
});

// ============================================================
// PER-AYAH PLAY (individual verse audio buttons)
// ============================================================

document.addEventListener("click", async e => {
    const playBtn = e.target.closest(".play-btn");
    if (!playBtn) return;

    // Pause full-surah player if running
    if (!audioPlayer.paused) {
        audioPlayer.pause();
        if (playButton) { playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
    }

    activeAudioMode = "ayah";

    // Toggle off same button
    if (activePlayButton === playBtn && !ayahPlayer.paused) {
        ayahPlayer.pause();
        playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
        syncMiniPlayIcon(false); return;
    }

    // Reset previous button
    if (activePlayButton && activePlayButton !== playBtn) {
        activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    }

    const surah = Number(playBtn.dataset.surah);
    const ayah = Number(playBtn.dataset.ayah);

    try {
        ayahPlayer.src = getAyahAudioUrl(surah, ayah, currentReciterId);
        await ayahPlayer.play();
        activePlayButton = playBtn;
        currentAyahPlaying = ayah;
        playBtn.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();
        scrollToActiveVerse(ayah);
        showFloatingPlayer(
            document.getElementById("reader-title")?.textContent || "Surah",
            `Ayah ${ayah}`
        );
        syncMiniPlayIcon(true);

        ayahPlayer.onended = () => {
            playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
            activePlayButton = null;
            // Keep currentAyahPlaying set so mini player next/prev still works
            syncMiniPlayIcon(false);
            // NO auto-advance — only the clicked verse plays, then stops.
            // Users can click the next verse manually, or use the mini player
            // next/prev buttons, or use the audio drawer to play the whole surah.
        };
    } catch (err) {
        console.error("Ayah play failed:", err);
        showToast("Could not play audio. Try another reciter.");
    }
});

// ============================================================
// TAFSIR BUTTON
// ============================================================

document.addEventListener("click", e => {
    const btn = e.target.closest(".tafsir-btn");
    if (!btn) return;
    loadTafsir(Number(btn.dataset.surah), Number(btn.dataset.ayah));
});

// ============================================================
// FLOATING MINI PLAYER
// ============================================================

miniPlay?.addEventListener("click", () => {
    const audio = getActiveAudio();
    if (audio.paused) {
        audio.play().catch(() => { }); syncMiniPlayIcon(true);
        if (activeAudioMode === "surah" && playButton) { playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons(); }
    } else {
        audio.pause(); syncMiniPlayIcon(false);
        if (activeAudioMode === "surah" && playButton) { playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
    }
});

miniNext?.addEventListener("click", () => {
    if (activeAudioMode === "ayah" && currentAyahPlaying) {
        // Play the next ayah directly
        const nextAyah = currentAyahPlaying + 1;
        const nextBtn = document.querySelector(`.verse-card[data-ayah="${nextAyah}"] .play-btn`);
        if (nextBtn) {
            nextBtn.click();
        } else if (nextAyah <= totalAyahsInSurah) {
            // Button not found but ayah exists — play it directly
            playSingleAyah(selectedSurah, nextAyah);
        }
    } else if (activeAudioMode === "surah" && selectedSurah < 114) {
        // Surah mode — go to next surah
        selectedSurah++;
        openReader(selectedSurah).then(() => playSurahFromAyah(1));
    }
});

miniPrev?.addEventListener("click", () => {
    if (activeAudioMode === "ayah" && currentAyahPlaying) {
        // Play the previous ayah directly
        const prevAyah = currentAyahPlaying - 1;
        if (prevAyah >= 1) {
            const prevBtn = document.querySelector(`.verse-card[data-ayah="${prevAyah}"] .play-btn`);
            if (prevBtn) {
                prevBtn.click();
            } else {
                playSingleAyah(selectedSurah, prevAyah);
            }
        }
    } else if (activeAudioMode === "surah" && selectedSurah > 1) {
        // Surah mode — go to previous surah
        selectedSurah--;
        openReader(selectedSurah).then(() => playSurahFromAyah(1));
    }
});

// Play a single ayah without needing a verse card button (for mini player next/prev)
async function playSingleAyah(surah, ayah) {
    try {
        // Stop any current audio
        if (!audioPlayer.paused) audioPlayer.pause();
        if (!ayahPlayer.paused) ayahPlayer.pause();
        if (activePlayButton) {
            activePlayButton.innerHTML = `<i data-lucide="play"></i>`;
            lucide.createIcons();
        }

        ayahPlayer.src = getAyahAudioUrl(surah, ayah, currentReciterId);
        await ayahPlayer.play();
        activeAudioMode = "ayah";
        currentAyahPlaying = ayah;
        syncMiniPlayIcon(true);
        scrollToActiveVerse(ayah);
        showFloatingPlayer(
            document.getElementById("reader-title")?.textContent || "Surah",
            `Ayah ${ayah}`
        );

        ayahPlayer.onended = () => {
            syncMiniPlayIcon(false);
            // Keep currentAyahPlaying so next/prev still works
        };
    } catch (err) {
        console.error("Single ayah play failed:", err);
        showToast("Could not play audio. Try another reciter.");
    }
}

// ============================================================
// BOOKMARK VERSE (reader)
// ============================================================

document.addEventListener("click", e => {
    const btn = e.target.closest(".bookmark-btn"); if (!btn) return;
    const card = btn.closest(".verse-card"); if (!card) return;
    toggleBookmark({
        surah: Number(btn.dataset.surah),
        ayah: Number(btn.dataset.ayah),
        surahName: document.getElementById("reader-title")?.textContent || "Surah",
        arabic: card.querySelector(".verse-arabic")?.innerText || "",
        translation: card.querySelector(".verse-translation")?.innerText || "",
    });
});

// ============================================================
// COPY
// ============================================================

document.addEventListener("click", async e => {
    const btn = e.target.closest(".copy-btn"); if (!btn) return;
    const card = btn.closest(".verse-card");
    const arabic = card.querySelector(".verse-arabic")?.innerText || "";
    const translit = card.querySelector(".verse-transliteration")?.innerText || "";
    const trans = card.querySelector(".verse-translation")?.innerText || "";
    const text = `${arabic}\n${translit}\n\n${trans}`;
    try {
        await navigator.clipboard.writeText(text);
        btn.classList.add("copied"); showToast("Verse copied ✓");
        setTimeout(() => btn.classList.remove("copied"), 800);
    } catch { showToast("Copy failed"); }
});

// ============================================================
// SHARE
// ============================================================

document.addEventListener("click", async e => {
    const btn = e.target.closest(".share-btn"); if (!btn) return;
    const card = btn.closest(".verse-card");
    const arabic = card.querySelector(".verse-arabic")?.innerText || "";
    const trans = card.querySelector(".verse-translation")?.innerText || "";
    const surahName = document.getElementById("reader-title")?.textContent || "Surah";
    const ayah = card.dataset?.ayah || "";
    const translit = card.querySelector(".verse-transliteration")?.innerText || "";

    if (window.BacaShare && typeof window.BacaShare.previewVerseImage === 'function') {
        const readerTheme = document.querySelector(".reader-content")?.dataset?.theme || "dark";
        await window.BacaShare.previewVerseImage({
            arabic: arabic,
            transliteration: translit,
            translation: trans,
            reference: `${surahName} verse ${ayah}`,
            surahName: surahName,
            theme: readerTheme === "light" ? "light" : "dark"
        });
    } else {
        const text = `${arabic}

${trans}`;
        try {
            if (navigator.share) { await navigator.share({ title: "Qur'an Verse", text }); showToast("Shared ✓"); }
            else { await navigator.clipboard.writeText(text); showToast("Copied to clipboard"); }
        } catch { showToast("Share cancelled"); }
    }
});

// ============================================================
// SEARCH MODAL
// ============================================================

document.querySelector(".search-btn")?.addEventListener("click", () => {
    document.querySelector(".search-modal")?.classList.add("active");
    document.getElementById("searchInput")?.focus();
});
document.querySelector(".close-search")?.addEventListener("click", () => {
    document.querySelector(".search-modal")?.classList.remove("active");
});
document.querySelector(".search-overlay")?.addEventListener("click", () => {
    document.querySelector(".search-modal")?.classList.remove("active");
});

document.getElementById("searchInput")?.addEventListener("input", e => {
    const val = e.target.value.trim().toLowerCase();
    const results = document.querySelector(".search-results");
    if (!results || !val) return;
    const matches = SURAH_LIST.filter(s =>
        s.transliteration.toLowerCase().includes(val) ||
        s.translation.toLowerCase().includes(val) ||
        String(s.id) === val
    ).slice(0, 8);
    results.innerHTML = matches.map(s => `
    <div class="search-item" data-surah="${s.id}" style="cursor:pointer">
      <i data-lucide="book-open"></i>
      <span>${s.transliteration} <small style="opacity:.6">${s.translation}</small></span>
    </div>`).join("") || `<div class="search-item"><i data-lucide="search"></i><span>No results for "${escapeHtml(val)}"</span></div>`;
    lucide.createIcons();
    results.querySelectorAll(".search-item[data-surah]").forEach(item => {
        item.addEventListener("click", () => {
            document.querySelector(".search-modal")?.classList.remove("active");
            openReader(Number(item.dataset.surah));
        });
    });
});

// ================= KEYBOARD SHORTCUTS =================
document.addEventListener("keydown", (e) => {
    const searchModal = document.querySelector(".search-modal");
    if (!searchModal) return;

    if (e.key === "/" && document.activeElement.tagName !== "INPUT") {
        e.preventDefault();
        searchModal.classList.add("active");
        document.getElementById("searchInput")?.focus();
    }

    if (e.key === "Escape") {
        searchModal.classList.remove("active");
        // Also close reader theme panel and mini drawer if open
        document.getElementById("reader-theme-panel")?.classList.remove("open");
        document.getElementById("mini-settings-drawer")?.classList.remove("open");
    }
});

// ============================================================
// FLOATING PLAYER ICONS (fix on init)
// ============================================================

function fixFloatingPlayerIcons() {
    if (miniPlay) miniPlay.innerHTML = `<i data-lucide="play"></i>`;
    if (miniPrev) miniPrev.innerHTML = `<i data-lucide="skip-back"></i>`;
    if (miniNext) miniNext.innerHTML = `<i data-lucide="skip-forward"></i>`;
    lucide.createIcons();
}

// ============================================================
// RECITER PROFILES (for dropdown and search)
// ============================================================

const RECITER_PROFILES = [
    { id: "mishari", name: "Mishary Alafasy", country: "Kuwait", style: "Murattal", image: "images/reciters/mishary.png" },
    { id: "sudais", name: "Abdul Rahman As-Sudais", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/sudais.png" },
    { id: "ali_jaber", name: "Ali Abdullah Jabir", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/ali jabir.png" },
    { id: "abdulbasit", name: "Abdul Basit (Murattal)", country: "Egypt", style: "Murattal", image: "images/reciters/basit.png" },
    { id: "abdulbasit_mj", name: "Abdul Basit (Mujawwad)", country: "Egypt", style: "Mujawwad", image: "images/reciters/basit.png" },
    { id: "husary", name: "Mahmoud Al-Husary", country: "Egypt", style: "Murattal", image: "images/reciters/al-husary.png" },
    { id: "husary_muj", name: "Al-Husary (Mujawwad)", country: "Egypt", style: "Mujawwad", image: "images/reciters/al-husary.png" },
    { id: "minshawi", name: "Muhammad Al-Minshawi", country: "Egypt", style: "Murattal", image: "images/reciters/minshawi.png" },
    { id: "shaatree", name: "Abu Bakr Ash-Shaatree", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/as-shateree.png" },
    { id: "muaiqly", name: "Maher Al-Muaiqly", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/maher.png" },
    { id: "shuraym", name: "Saud Al-Shuraim", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/shuraim.png" },
    { id: "hudhaify", name: "Ali Al-Hudhaify", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/al-hudaify.png" },
    { id: "ajamy", name: "Ahmed Al-Ajamy", country: "Saudi Arabia", style: "Murattal", image: "images/reciters//al-ajmy.png" },
    { id: "jibreel", name: "Muhammad Jibreel", country: "Egypt", style: "Murattal", image: "images/reciters/jibreel.png" },
    { id: "ayyoub", name: "Muhammad Ayyoub", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/ayyub.png" },
    { id: "ghamdi", name: "Saad Al-Ghamdi", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/saad_al-ghamdi.png" },
    { id: "basfar", name: "Abdullah Basfar", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/basfar.png" },
    { id: "matroud", name: "Abdullah Matroud", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/al-matrood.png" },
    { id: "juhaynee", name: "Abdullah Al-Juhaynee", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/al-juhani.png" },
    { id: "johany", name: "Abdullah Al-Johany", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/al-johany.png" },
    { id: "tablawi", name: "Mohamed Al-Tablawi", country: "Egypt", style: "Murattal", image: "images/reciters/tablawi.png" },
    { id: "rifai", name: "Hani Ar-Rifai", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/Hani Ar-rifai.png" },
    { id: "qasim", name: "Abdul Muhsin Al-Qasim", country: "Saudi Arabia", style: "Murattal", image: "images/reciters/muhsin.png" },
    { id: "neana", name: "Ahmed Neana", country: "Egypt", style: "Murattal", image: "images/reciters/neana.png" },
    { id: "ayman_swed", name: "Ayman Swed", country: "Syria", style: "Murattal", image: "images/reciters/ayman.png" },
    { id: "okasha", name: "Okasha Kameny", country: "Ghana", style: "Murattal", image: "images/reciters/okasha.png" },
];

function initRecitersGrid() {
    // The full reciter grid now lives on reciters/index.html.
    // On the main page we just show a compact preview: a row of
    // avatar thumbnails (first 8 reciters) + a "Browse all" button.
    const previewEl = document.getElementById("reciters-preview-avatars");
    if (!previewEl) return;

    const previewList = RECITER_PROFILES.slice(0, 4);
    previewEl.innerHTML = previewList.map(r => `
      <a class="reciters-preview-avatar" href="reciters/reciter.html?r=${r.id}"
         title="${r.name} — ${r.country}" data-name="${r.name}">
        <img src="${r.image}" alt="${r.name}"
          onerror="this.style.display='none';this.parentElement.style.background='rgba(16,185,129,0.15)'">
      </a>`).join("");
}

// ==================== Reciter Picker for "Listen" Button ====================

const RECITER_PROFILES_FOR_PICKER = [
    { id: "mishari", name: "Mishary Rashid Alafasy", country: "Kuwait", image: "images/reciters/mishari.jpg" },
    { id: "sudais", name: "Abdul Rahman As-Sudais", country: "Saudi Arabia", image: "images/reciters/sudais.jpg" },
    { id: "ali_jaber", name: "Ali Abdullah Jabir (رحمه الله)", country: "Saudi Arabia", image: "images/reciters/ali_jaber.jpg" },
    { id: "abdulbasit", name: "Abdul Basit Abdul Samad (Murattal)", country: "Egypt", image: "images/reciters/abdulbasit.jpg" },
    { id: "abdulbasit_mj", name: "Abdul Basit Abdul Samad (Mujawwad)", country: "Egypt", image: "images/reciters/abdulbasit.jpg" },
    { id: "husary", name: "Mahmoud Khalil Al-Husary", country: "Egypt", image: "images/reciters/husary.jpg" },
    { id: "husary_muj", name: "Al-Husary (Mujawwad)", country: "Egypt", image: "images/reciters/husary.jpg" },
    { id: "minshawi", name: "Muhammad Siddiq Al-Minshawi", country: "Egypt", image: "images/reciters/minshawi.jpg" },
    { id: "shaatree", name: "Abu Bakr Ash-Shaatree", country: "Saudi Arabia", image: "images/reciters/shaatree.jpg" },
    { id: "muaiqly", name: "Maher Al-Muaiqly", country: "Saudi Arabia", image: "images/reciters/muaiqly.jpg" },
    { id: "shuraym", name: "Saud Al-Shuraim", country: "Saudi Arabia", image: "images/reciters/shuraym.jpg" },
    { id: "hudhaify", name: "Ali Al-Hudhaify", country: "Saudi Arabia", image: "images/reciters/hudhaify.jpg" },
    { id: "ajamy", name: "Ahmed Ibn Ali Al-Ajamy", country: "Saudi Arabia", image: "images/reciters/ajamy.jpg" },
    { id: "jibreel", name: "Muhammad Jibreel", country: "Egypt", image: "images/reciters/jibreel.jpg" },
    { id: "ayyoub", name: "Muhammad Ayyoub", country: "Saudi Arabia", image: "images/reciters/ayyoub.jpg" },
    { id: "ghamdi", name: "Saad Al-Ghamdi", country: "Saudi Arabia", image: "images/reciters/ghamdi.jpg" },
    { id: "basfar", name: "Abdullah Basfar", country: "Saudi Arabia", image: "images/reciters/basfar.jpg" },
    { id: "matroud", name: "Abdullah Matroud", country: "Saudi Arabia", image: "images/reciters/matroud.jpg" },
    { id: "juhaynee", name: "Abdullah Al-Juhaynee", country: "Saudi Arabia", image: "images/reciters/juhaynee.jpg" },
    { id: "johany", name: "Abdullah Al-Johany", country: "Saudi Arabia", image: "images/reciters/johany.jpg" },
    { id: "tablawi", name: "Mohamed Al-Tablawi", country: "Egypt", image: "images/reciters/tablawi.jpg" },
    { id: "rifai", name: "Hani Ar-Rifai", country: "Saudi Arabia", image: "images/reciters/rifai.jpg" },
    { id: "qasim", name: "Abdul Muhsin Al-Qasim", country: "Saudi Arabia", image: "images/reciters/qasim.jpg" },
    { id: "neana", name: "Ahmed Neana", country: "Egypt", image: "images/reciters/neana.jpg" },
    { id: "ayman_swed", name: "Ayman Swed", country: "Syria", image: "images/reciters/ayman_swed.jpg" },
    { id: "okasha", name: "Okasha Kameny", country: "Ghana", image: "images/reciters/okasha.png" },
];

function initReciterPicker() {
    const modal = document.getElementById("reciter-picker-modal");
    const overlay = document.getElementById("reciter-picker-overlay");
    const closeBtn = document.getElementById("picker-close");
    const search = document.getElementById("picker-search");
    const list = document.getElementById("picker-list");
    const listenBtn = document.getElementById("listen-surah-btn");
    if (!modal || !listenBtn) return;

    // "Listen" button in surah modal opens the picker
    listenBtn.addEventListener("click", () => {
        const surahName = document.getElementById("modal-surah-name")?.textContent || "this Surah";
        document.getElementById("picker-surah-label").textContent = `for Surah ${surahName}`;
        search.value = "";
        renderPickerList("");
        modal.classList.add("active");
        lucide.createIcons();
        setTimeout(() => search.focus(), 200);
    });

    function renderPickerList(query) {
        const q = query.toLowerCase();
        const filtered = q
            ? RECITER_PROFILES_FOR_PICKER.filter(r =>
                r.name.toLowerCase().includes(q) || r.country.toLowerCase().includes(q))
            : RECITER_PROFILES_FOR_PICKER;

        list.innerHTML = filtered.map(r => `
      <div class="picker-reciter-row" data-id="${r.id}">
        <div class="picker-reciter-avatar">
          <img src="${r.image}" alt="${r.name}"
            onerror="this.style.display='none';this.parentElement.innerHTML='🎙️'">
        </div>
        <div>
          <div class="picker-reciter-name">${r.name}</div>
          <div class="picker-reciter-country">${r.country}</div>
        </div>
        <span class="picker-reciter-arrow">›</span>
      </div>`).join("") ||
            `<p style="text-align:center;color:#64748b;padding:2rem">No reciters found</p>`;

        list.querySelectorAll(".picker-reciter-row").forEach(row => {
            row.addEventListener("click", () => {
                const reciterId = row.dataset.id;
                const surahNum = selectedSurah || 1;
                // Close modals
                modal.classList.remove("active");
                surahModal.classList.remove("active");
                // Navigate to reciter profile page, auto-playing the selected surah
                window.location.href = `reciters/reciter.html?r=${reciterId}&surah=${surahNum}`;
            });
        });
    }

    search.addEventListener("input", e => renderPickerList(e.target.value));

    function closePicker() {
        modal.classList.remove("active");
        search.value = "";
    }
    closeBtn?.addEventListener("click", closePicker);
    overlay?.addEventListener("click", closePicker);
    document.addEventListener("keydown", e => { if (e.key === "Escape") closePicker(); });
}

// NOTE: The old #hamburger-btn / #mobile-nav elements have been removed.
// Navigation is now handled by js/shared-nav.js (unified hamburger button
// injected into the navbar). No toggle code needed here.

// =========================== Continue Reading Hint =================================

function initContinueReadingHint() {
    const saved = (() => { try { return JSON.parse(localStorage.getItem("lastRead")); } catch { return null; } })();
    if (!saved?.surahName) return; // no history yet

    // Only show if they've been here before (more than 5 minutes ago)
    const fiveMin = 5 * 60 * 1000;
    if (saved.savedAt && Date.now() - saved.savedAt < fiveMin) return;

    // Create hint toast
    const hint = document.createElement("div");
    hint.id = "continue-hint";
    hint.innerHTML = `
      <div class="continue-hint-inner">
        <span class="continue-hint-icon">📖</span>
        <div class="continue-hint-text">
          <strong>Welcome back!</strong>
          <span>Continue from <em>${saved.surahName}</em>, Ayah ${saved.ayah}</span>
        </div>
        <button class="continue-hint-btn" id="continue-hint-btn">Resume</button>
        <button class="continue-hint-dismiss" id="continue-hint-dismiss">✕</button>
      </div>`;
    document.body.appendChild(hint);

    // Show after a short delay so page feels settled
    setTimeout(() => hint.classList.add("visible"), 1200);

    document.getElementById("continue-hint-btn").addEventListener("click", () => {
        hint.remove();
        openReader(Number(saved.surah), saved.ayah);
    });
    document.getElementById("continue-hint-dismiss").addEventListener("click", () => {
        hint.classList.remove("visible");
        setTimeout(() => hint.remove(), 400);
    });

    // Auto-dismiss after 8 seconds
    setTimeout(() => {
        hint.classList.remove("visible");
        setTimeout(() => hint.remove(), 400);
    }, 8000);
}

// ============================================================
// INIT
// ============================================================

populateReciterSelects();
loadSurahs();
loadDailyAyah();
initDailyAyahActions();
initAnimatedPlaceholder();
initThemeToggle();
initFilterBar();
initRepeatButton();
initReaderThemePanel();
initMiniSettingsDrawer();
initReciterPicker();
initBookmarks();
initRecitersGrid();
fixFloatingPlayerIcons();
updateContinueReading();
initContinueReadingHint();
// ============================================================
// GAMIFICATION — Reading Stats, Streaks, Challenges, Achievements
// ============================================================

const GAMIFICATION = {
    // Default daily goal (pages)
    dailyGoal: 5,

    // Achievement definitions
    achievements: [
        { id: "first-page",    icon: "book-open",       name: "First Steps",       desc: "Read your first page",          check: s => s.pagesRead >= 1 },
        { id: "first-surah",   icon: "book-check",      name: "Surah Complete",     desc: "Complete your first surah",     check: s => s.completedSurahs >= 1 },
        { id: "streak-3",      icon: "flame",            name: "On Fire",            desc: "3-day reading streak",          check: s => s.streak >= 3 },
        { id: "streak-7",      icon: "zap",              name: "Week Warrior",       desc: "7-day reading streak",          check: s => s.streak >= 7 },
        { id: "streak-30",     icon: "award",            name: "Monthly Master",     desc: "30-day reading streak",         check: s => s.streak >= 30 },
        { id: "pages-50",      icon: "layers",           name: "Half Century",       desc: "Read 50 pages",                 check: s => s.pagesRead >= 50 },
        { id: "pages-100",     icon: "library",          name: "Century Club",       desc: "Read 100 pages",                check: s => s.pagesRead >= 100 },
        { id: "juz-1",         icon: "bookmark",         name: "Juz Explorer",       desc: "Explore your first juz",        check: s => s.juzExplored >= 1 },
        { id: "surahs-10",     icon: "trophy",           name: "Dedicated Reader",   desc: "Complete 10 surahs",            check: s => s.completedSurahs >= 10 },
        { id: "time-1h",       icon: "clock",            name: "Hour Power",         desc: "Read for 1 hour total",         check: s => s.readingTime >= 3600 },
        { id: "challenges-5",  icon: "target",           name: "Challenge Chaser",   desc: "Complete 5 daily challenges",   check: s => s.challengesCompleted >= 5 },
        { id: "verses-100",    icon: "scroll",           name: "Verse Voyager",      desc: "Read 100 verses",               check: s => s.versesRead >= 100 },
    ],

    // Daily challenges (cycled by day)
    challenges: [
        { title: "Read 3 pages of the Qur'an",           desc: "Complete this challenge to earn 50 XP",  target: 3,  unit: "pages",  xp: 50 },
        { title: "Read 5 pages of the Qur'an",           desc: "Complete this challenge to earn 80 XP",  target: 5,  unit: "pages",  xp: 80 },
        { title: "Complete a full surah",                desc: "Complete this challenge to earn 100 XP", target: 1,  unit: "surah",  xp: 100 },
        { title: "Read for 10 minutes",                  desc: "Complete this challenge to earn 60 XP",  target: 10, unit: "minutes",xp: 60 },
        { title: "Read 10 verses",                       desc: "Complete this challenge to earn 40 XP",  target: 10, unit: "verses", xp: 40 },
    ],
};

// Load stats from localStorage
function loadStats() {
    try {
        return JSON.parse(localStorage.getItem("bacaStats")) || {
            streak: 0,
            lastReadDate: null,
            readingTime: 0,         // seconds
            pagesRead: 0,
            versesRead: 0,
            juzExplored: 0,
            completedSurahs: [],
            totalDays: 0,
            challengesCompleted: 0,
            todayPages: 0,
            todayDate: null,
            xp: 0,
            unlockedAchievements: [],
        };
    } catch {
        return { streak: 0, lastReadDate: null, readingTime: 0, pagesRead: 0, versesRead: 0, juzExplored: 0, completedSurahs: [], totalDays: 0, challengesCompleted: 0, todayPages: 0, todayDate: null, xp: 0, unlockedAchievements: [] };
    }
}

function saveStats(stats) {
    localStorage.setItem("bacaStats", JSON.stringify(stats));
}

function getTodayStr() {
    return new Date().toISOString().split("T")[0];
}

// Update streak when user reads
function updateStreak(stats) {
    const today = getTodayStr();
    if (stats.lastReadDate === today) return; // already updated today

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (stats.lastReadDate === yesterdayStr) {
        stats.streak = (stats.streak || 0) + 1;
    } else if (stats.lastReadDate === null) {
        stats.streak = 1;
    } else {
        stats.streak = 1; // reset
    }

    stats.lastReadDate = today;
    stats.totalDays = (stats.totalDays || 0) + 1;
}

// Track a page read
function trackPageRead(pageNum) {
    const stats = loadStats();
    const today = getTodayStr();

    // Reset daily counter if new day
    if (stats.todayDate !== today) {
        stats.todayDate = today;
        stats.todayPages = 0;
    }

    stats.pagesRead = (stats.pagesRead || 0) + 1;
    stats.todayPages = (stats.todayPages || 0) + 1;
    updateStreak(stats);

    // Track juz explored
    const juzNum = Math.ceil(pageNum / 20.13); // approx 20 pages per juz
    if (juzNum > (stats.juzExplored || 0)) {
        stats.juzExplored = juzNum;
    }

    saveStats(stats);
    checkAchievements(stats);
    updateStatsUI(stats);
    updateChallengeProgress(stats);
}

// Track reading time (called periodically)
function trackReadingTime(seconds) {
    const stats = loadStats();
    stats.readingTime = (stats.readingTime || 0) + seconds;
    saveStats(stats);
    checkAchievements(stats);
    updateStatsUI(stats);
    updateChallengeProgress(stats);
}

// Mark a surah as completed
function markSurahCompleted(surahNum) {
    const stats = loadStats();
    if (!stats.completedSurahs) stats.completedSurahs = [];
    if (!stats.completedSurahs.includes(surahNum)) {
        stats.completedSurahs.push(surahNum);
        saveStats(stats);
        showToast(`Surah ${SURAH_LIST[surahNum - 1]?.transliteration || surahNum} completed! ✓`);
        checkAchievements(stats);
        updateStatsUI(stats);
    }
}

// Check and unlock achievements
function checkAchievements(stats) {
    if (!stats.unlockedAchievements) stats.unlockedAchievements = [];
    let newUnlocks = [];

    GAMIFICATION.achievements.forEach(ach => {
        if (!stats.unlockedAchievements.includes(ach.id) && ach.check(stats)) {
            stats.unlockedAchievements.push(ach.id);
            stats.xp = (stats.xp || 0) + 20;
            newUnlocks.push(ach);
        }
    });

    if (newUnlocks.length) {
        saveStats(stats);
        newUnlocks.forEach(ach => {
            showToast(`Achievement Unlocked: ${ach.name}! 🏆`);
        });
        renderAchievements(stats);
    }
}

// Get today's challenge (based on day of year)
function getTodayChallenge() {
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return GAMIFICATION.challenges[dayOfYear % GAMIFICATION.challenges.length];
}

// Update challenge progress
function updateChallengeProgress(stats) {
    const challenge = getTodayChallenge();
    const challengeKey = `challenge_${getTodayStr()}`;
    let progress = JSON.parse(localStorage.getItem(challengeKey) || '{"count":0,"done":false}');

    if (challenge.unit === "pages") {
        progress.count = stats.todayPages || 0;
    } else if (challenge.unit === "minutes") {
        progress.count = Math.floor((stats.readingTime || 0) / 60);
    } else if (challenge.unit === "verses") {
        progress.count = stats.versesRead || 0;
    } else if (challenge.unit === "surah") {
        progress.count = (stats.completedSurahs || []).length;
    }

    if (progress.count >= challenge.target && !progress.done) {
        progress.done = true;
        stats.challengesCompleted = (stats.challengesCompleted || 0) + 1;
        stats.xp = (stats.xp || 0) + challenge.xp;
        saveStats(stats);
        showToast(`Daily Challenge Complete! +${challenge.xp} XP 🎉`);
    }

    localStorage.setItem(challengeKey, JSON.stringify(progress));

    // Update UI
    const fill = document.getElementById("challenge-progress-fill");
    const status = document.getElementById("challenge-status");
    const card = document.getElementById("challenge-card");
    if (fill) fill.style.width = Math.min(100, (progress.count / challenge.target) * 100) + "%";
    if (status) status.textContent = `${progress.count} / ${challenge.target} ${challenge.unit}`;
    if (card && progress.done) card.classList.add("completed");
}

// Update stats UI
function updateStatsUI(stats) {
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    setText("streak-count", stats.streak || 0);
    setText("reading-time", formatReadingTime(stats.readingTime || 0));
    setText("completed-surahs", (stats.completedSurahs || []).length);
    setText("daily-goal-text", `${stats.todayPages || 0} / ${GAMIFICATION.dailyGoal}`);

    const goalFill = document.getElementById("daily-goal-fill");
    if (goalFill) goalFill.style.width = Math.min(100, ((stats.todayPages || 0) / GAMIFICATION.dailyGoal) * 100) + "%";

    setText("stat-verses", stats.versesRead || 0);
    setText("stat-pages", stats.pagesRead || 0);
    setText("stat-juz", stats.juzExplored || 0);
    setText("stat-days", stats.totalDays || 0);
}

function formatReadingTime(seconds) {
    if (seconds < 60) return `${seconds}s`;
    const m = Math.floor(seconds / 60);
    if (m < 60) return `${m}m`;
    const h = Math.floor(m / 60);
    return `${h}h ${m % 60}m`;
}

// Render achievements grid
function renderAchievements(stats) {
    const grid = document.getElementById("achievements-grid");
    if (!grid) return;

    grid.innerHTML = GAMIFICATION.achievements.map(ach => {
        const unlocked = (stats.unlockedAchievements || []).includes(ach.id);
        return `
        <div class="achievement-badge ${unlocked ? "unlocked" : "locked"}">
            <div class="achievement-icon">
                <i data-lucide="${ach.icon}"></i>
            </div>
            <div class="achievement-name">${ach.name}</div>
            <div class="achievement-desc">${ach.desc}</div>
        </div>`;
    }).join("");

    if (window.lucide) lucide.createIcons();
}

// Render today's challenge
function renderChallenge() {
    const challenge = getTodayChallenge();
    const titleEl = document.getElementById("challenge-title");
    const descEl = document.getElementById("challenge-desc");
    const xpEl = document.querySelector(".challenge-xp");
    if (titleEl) titleEl.textContent = challenge.title;
    if (descEl) descEl.textContent = challenge.desc;
    if (xpEl) xpEl.textContent = `+${challenge.xp} XP`;
}

// Initialize gamification
function initGamification() {
    const stats = loadStats();

    // Reset daily counter if new day
    const today = getTodayStr();
    if (stats.todayDate !== today) {
        stats.todayDate = today;
        stats.todayPages = 0;
        saveStats(stats);
    }

    // Re-check achievements every time the homepage loads. This is what
    // actually unlocks badges earned while reading in the Mushaf (mushaf.html
    // writes straight to the same "bacaStats" record but can't show a toast
    // or renderAchievements() itself since it's a different page/script).
    checkAchievements(stats);

    updateStatsUI(stats);
    renderAchievements(stats);
    renderChallenge();
    updateChallengeProgress(stats);

    // Set footer year
    const yearEl = document.getElementById("footer-year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // Footer theme toggle
    document.getElementById("footer-theme-toggle")?.addEventListener("click", e => {
        e.preventDefault();
        document.querySelector(".theme-btn")?.click();
    });

    // Footer reset progress
    document.getElementById("footer-reset-progress")?.addEventListener("click", e => {
        e.preventDefault();
        if (confirm("Reset all your reading progress, streaks, and achievements? This cannot be undone.")) {
            localStorage.removeItem("bacaStats");
            // Also clear today's challenge
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith("challenge_")) localStorage.removeItem(key);
            });
            showToast("Progress reset");
            setTimeout(() => location.reload(), 800);
        }
    });

    // Footer meet developer — opens portfolio in new tab
    document.getElementById("footer-meet-developer")?.addEventListener("click", e => {
        e.preventDefault();
        window.open("https://up1n-portfolio.vercel.app/", "_blank", "noopener");
    });

    // Footer feedback form — opens email client with pre-filled message
    document.getElementById("feedback-form")?.addEventListener("submit", e => {
        e.preventDefault();
        const name = document.getElementById("feedback-name")?.value.trim() || "Anonymous";
        const type = document.getElementById("feedback-type")?.value || "improvement";
        const message = document.getElementById("feedback-message")?.value.trim();
        if (!message) return;

        const typeLabels = {
            improvement: "💡 Improvement Suggestion",
            bug: "🐛 Bug Report",
            remove: "🗑️ Removal Request",
            praise: "💚 Appreciation"
        };

        const subject = `[Baca Feedback] ${typeLabels[type] || "Feedback"}`;
        const body = `Name: ${name}\nType: ${typeLabels[type] || type}\n\nMessage:\n${message}\n\n— Sent from Baca (al-qur-an.onrender.com)`;

        const mailtoUrl = `mailto:olaniyiaremu2003@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
        showToast("Opening your email app… Jazak Allah Khayr for the feedback!");
        setTimeout(() => { document.getElementById("feedback-form")?.reset(); }, 1500);
    });

    // Track reading time — increment 30 seconds every 30 seconds while page is visible
    let timeAccumulator = 0;
    setInterval(() => {
        if (!document.hidden && document.hasFocus()) {
            timeAccumulator += 30;
            if (timeAccumulator >= 60) {
                trackReadingTime(timeAccumulator);
                timeAccumulator = 0;
            }
        }
    }, 30000);

    // Live-refresh the dashboard if reading stats change in another tab
    // (e.g. the Mushaf reader open alongside the homepage). The Mushaf
    // writes reading progress directly into the shared "bacaStats" record
    // itself, so here we only need to re-render — never re-increment.
    window.addEventListener("storage", e => {
        if (e.key === "bacaStats") {
            const fresh = loadStats();
            checkAchievements(fresh);
            updateStatsUI(fresh);
            updateChallengeProgress(fresh);
        }
    });

    // Also catch up immediately whenever the user comes back to this tab
    // (e.g. after reading in mushaf.html and returning via the Back button).
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) {
            const fresh = loadStats();
            checkAchievements(fresh);
            updateStatsUI(fresh);
            renderAchievements(fresh);
            updateChallengeProgress(fresh);
        }
    });
}

// Call init at the end (after other initializers)
setTimeout(initGamification, 500);

// ============================================================
// TOPICS — Click a topic card to find related verses
// ============================================================

const TOPIC_VERSES = {
    mercy: [
        { surah: 1, ayah: 1, ref: "Al-Fatihah 1:1" },
        { surah: 1, ayah: 3, ref: "Al-Fatihah 1:3" },
        { surah: 7, ayah: 156, ref: "Al-A'raf 7:156" },
        { surah: 39, ayah: 53, ref: "Az-Zumar 39:53" },
        { surah: 55, ayah: 1, ref: "Ar-Rahman 55:1" },
    ],
    prayer: [
        { surah: 2, ayah: 3, ref: "Al-Baqarah 2:3" },
        { surah: 2, ayah: 45, ref: "Al-Baqarah 2:45" },
        { surah: 2, ayah: 153, ref: "Al-Baqarah 2:153" },
        { surah: 4, ayah: 103, ref: "An-Nisa 4:103" },
        { surah: 17, ayah: 78, ref: "Al-Isra 17:78" },
        { surah: 20, ayah: 14, ref: "Ta-Ha 20:14" },
        { surah: 29, ayah: 45, ref: "Al-Ankabut 29:45" },
    ],
    knowledge: [
        { surah: 2, ayah: 269, ref: "Al-Baqarah 2:269" },
        { surah: 3, ayah: 7, ref: "Ali 'Imran 3:7" },
        { surah: 20, ayah: 114, ref: "Ta-Ha 20:114" },
        { surah: 39, ayah: 9, ref: "Az-Zumar 39:9" },
        { surah: 58, ayah: 11, ref: "Al-Mujadila 58:11" },
        { surah: 96, ayah: 1, ref: "Al-Alaq 96:1" },
    ],
    protection: [
        { surah: 1, ayah: 5, ref: "Al-Fatihah 1:5" },
        { surah: 2, ayah: 201, ref: "Al-Baqarah 2:201" },
        { surah: 3, ayah: 155, ref: "Ali 'Imran 3:155" },
        { surah: 7, ayah: 200, ref: "Al-A'raf 7:200" },
        { surah: 16, ayah: 98, ref: "An-Nahl 16:98" },
        { surah: 113, ayah: 1, ref: "Al-Falaq 113:1" },
        { surah: 114, ayah: 1, ref: "An-Nas 114:1" },
    ],
    charity: [
        { surah: 2, ayah: 43, ref: "Al-Baqarah 2:43" },
        { surah: 2, ayah: 177, ref: "Al-Baqarah 2:177" },
        { surah: 2, ayah: 261, ref: "Al-Baqarah 2:261" },
        { surah: 2, ayah: 274, ref: "Al-Baqarah 2:274" },
        { surah: 9, ayah: 103, ref: "At-Tawbah 9:103" },
        { surah: 107, ayah: 1, ref: "Al-Ma'un 107:1" },
    ],
    hope: [
        { surah: 2, ayah: 153, ref: "Al-Baqarah 2:153" },
        { surah: 3, ayah: 139, ref: "Ali 'Imran 3:139" },
        { surah: 13, ayah: 28, ref: "Ar-Ra'd 13:28" },
        { surah: 39, ayah: 53, ref: "Az-Zumar 39:53" },
        { surah: 65, ayah: 3, ref: "At-Talaq 65:3" },
        { surah: 94, ayah: 5, ref: "Ash-Sharh 94:5" },
        { surah: 94, ayah: 6, ref: "Ash-Sharh 94:6" },
    ],
};

const TOPIC_NAMES = {
    mercy: "Mercy",
    prayer: "Prayer",
    knowledge: "Knowledge",
    protection: "Protection",
    charity: "Charity",
    hope: "Hope",
};

function initTopics() {
    document.querySelectorAll(".topic-card").forEach(card => {
        card.addEventListener("click", () => {
            const topic = card.dataset.topic;
            if (!topic) return;
            showTopicResults(topic);
        });
    });
}

function showTopicResults(topic) {
    const verses = TOPIC_VERSES[topic] || [];
    if (!verses.length) return;

    const results = document.querySelector(".search-results");
    const searchInput = document.getElementById("searchInput");

    // Set search input to topic name
    if (searchInput) searchInput.value = TOPIC_NAMES[topic];

    // Build results HTML
    const header = `<div class="search-item" style="cursor:default;border-bottom:1px solid var(--border);margin-bottom:0.5rem;padding-bottom:0.8rem;">
        <i data-lucide="tag" style="color:var(--primary)"></i>
        <span style="font-weight:700;color:var(--primary)">${TOPIC_NAMES[topic]} — ${verses.length} verses</span>
    </div>`;

    const items = verses.map(v => {
        const meta = SURAH_LIST[v.surah - 1];
        return `<div class="search-item" data-surah="${v.surah}" data-ayah="${v.ayah}" style="cursor:pointer">
            <i data-lucide="book-open"></i>
            <span>${escapeHtml(meta?.transliteration || "Surah")} <small style="opacity:.6">${v.ref}</small></span>
        </div>`;
    }).join("");

    results.innerHTML = header + items;
    lucide.createIcons();

    // Wire click handlers
    results.querySelectorAll(".search-item[data-surah]").forEach(item => {
        item.addEventListener("click", () => {
            const surah = parseInt(item.dataset.surah);
            const ayah = parseInt(item.dataset.ayah);
            document.querySelector(".search-modal")?.classList.remove("active");
            openReader(surah, ayah);
        });
    });

    // Open search modal
    document.querySelector(".search-modal")?.classList.add("active");
}

// ============================================================
// GUIDED JOURNEYS — Click "Start Journey" to open reader at first verse
// ============================================================

function initJourneys() {
    document.querySelectorAll(".journey-card").forEach(card => {
        const btn = card.querySelector("button");
        if (!btn) return;
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const start = card.dataset.start;
            if (!start) return;
            const [surah, ayah] = start.split(":").map(Number);
            const journeyTitle = card.querySelector("h3")?.textContent?.trim() || "Journey";

            // Save journey progress
            const journeyData = {
                title: journeyTitle,
                verses: card.dataset.verses?.split(",") || [start],
                currentIndex: 0,
                startedAt: Date.now(),
            };
            localStorage.setItem("activeJourney", JSON.stringify(journeyData));

            showToast(`Starting: ${journeyTitle} 📖`);
            setTimeout(() => openReader(surah, ayah), 500);
        });
    });
}

// ============================================================
// SEARCH MODAL — Make it actually search surahs, topics, and verses
// ============================================================

function initSearchModal() {
    const searchInput = document.getElementById("searchInput");
    const results = document.querySelector(".search-results");
    if (!searchInput || !results) return;

    // Build searchable data
    const searchData = [
        // Surahs
        ...SURAH_LIST.map(s => ({
            type: "surah",
            icon: "book-open",
            title: s.transliteration,
            subtitle: `${s.translation} · ${s.total_verses} ayahs · ${capitalizeType(s.type)}`,
            surah: s.id,
            ayah: null,
            keywords: `${s.transliteration} ${s.translation} ${s.name} ${s.id}`.toLowerCase(),
        })),
        // Topics
        ...Object.entries(TOPIC_NAMES).map(([key, name]) => ({
            type: "topic",
            icon: "tag",
            title: `Topic: ${name}`,
            subtitle: `${(TOPIC_VERSES[key] || []).length} verses about ${name.toLowerCase()}`,
            surah: null,
            ayah: null,
            topic: key,
            keywords: `topic ${name} ${key}`.toLowerCase(),
        })),
        // Notable verses
        { type: "verse", icon: "bookmark", title: "Ayat al-Kursi", subtitle: "Al-Baqarah 2:255 — The Throne Verse", surah: 2, ayah: 255, keywords: "ayatul kursi throne verse 2:255" },
        { type: "verse", icon: "bookmark", title: "Verse of Light", subtitle: "An-Nur 24:35 — Nur", surah: 24, ayah: 35, keywords: "light nur 24:35" },
        { type: "verse", icon: "bookmark", title: "Bismillah", subtitle: "Al-Fatihah 1:1", surah: 1, ayah: 1, keywords: "bismillah opening 1:1" },
        { type: "verse", icon: "bookmark", title: "Last Verse", subtitle: "An-Nas 114:6", surah: 114, ayah: 6, keywords: "last verse 114:6 nas" },
    ];

    searchInput.addEventListener("input", () => {
        const q = searchInput.value.trim().toLowerCase();
        if (!q) {
            results.innerHTML = `
                <div class="search-item" style="cursor:default"><i data-lucide="search"></i><span>Search surahs, topics, or verses...</span></div>
                <div class="search-item" style="cursor:default"><i data-lucide="tag"></i><span>Try: "mercy", "prayer", "charity", "Ayat al-Kursi"</span></div>`;
            lucide.createIcons();
            return;
        }

        const matches = searchData.filter(item =>
            item.keywords.includes(q) ||
            item.title.toLowerCase().includes(q) ||
            item.subtitle.toLowerCase().includes(q)
        ).slice(0, 12);

        if (!matches.length) {
            results.innerHTML = `<div class="search-item" style="cursor:default"><i data-lucide="search-x"></i><span>No results for "${escapeHtml(q)}"</span></div>`;
            lucide.createIcons();
            return;
        }

        results.innerHTML = matches.map(item => `
            <div class="search-item ${item.type === "topic" ? "topic-result" : ""}" data-type="${item.type}" data-surah="${item.surah || ""}" data-ayah="${item.ayah || ""}" data-topic="${item.topic || ""}" style="cursor:pointer">
                <i data-lucide="${item.icon}"></i>
                <span>${escapeHtml(item.title)} <small style="opacity:.6;display:block;margin-top:2px">${escapeHtml(item.subtitle)}</small></span>
            </div>
        `).join("");

        lucide.createIcons();

        // Wire click handlers
        results.querySelectorAll(".search-item[data-type]").forEach(item => {
            item.addEventListener("click", () => {
                const type = item.dataset.type;
                if (type === "topic") {
                    showTopicResults(item.dataset.topic);
                } else {
                    const surah = parseInt(item.dataset.surah);
                    const ayah = item.dataset.ayah ? parseInt(item.dataset.ayah) : null;
                    document.querySelector(".search-modal")?.classList.remove("active");
                    openReader(surah, ayah);
                }
            });
        });
    });
}

// Initialize topics, journeys, and enhanced search
setTimeout(() => {
    initTopics();
    initJourneys();
    initSearchModal();
}, 600);

// ============================================================
// READER TRANSLATION & TAFSIR SELECTION
// ============================================================

const READER_TRANSLATIONS = {
    20:  { name: "Saheeh International", lang: "en" },
    95:  { name: "Maududi (Tafhim)", lang: "en" },
    84:  { name: "Mufti Taqi Usmani", lang: "en" },
    22:  { name: "Yusuf Ali", lang: "en" },
    19:  { name: "Pickthall", lang: "en" },
    85:  { name: "Abdul Haleem", lang: "en" },
    203: { name: "Hilali & Khan", lang: "en" },
    149: { name: "Bridges' Translation", lang: "en" },
    97:  { name: "Tafheem-ul-Quran", lang: "ur" },
    234: { name: "Fatah Muhammad Jalandhri", lang: "ur" },
    33:  { name: "Indonesian MoRA", lang: "id" },
    31:  { name: "Hamidullah", lang: "fr" },
    77:  { name: "Diyanet Isleri", lang: "tr" },
    45:  { name: "Kuliev", lang: "ru" },
    56:  { name: "Ma Jian", lang: "zh" },
    103: { name: "Helmi Nasr", lang: "pt" },
    54:  { name: "Maulana Junagarhi", lang: "hi" },
};

// Load saved preferences
let readerTranslationId = localStorage.getItem("readerTranslation") || "20";
let readerTafsirSource = localStorage.getItem("readerTafsir") || "ibnkathir";

// Cache for fetched translations per surah
const translationCache = {};

async function fetchReaderTranslation(surahNum) {
    if (readerTranslationId === "none") return {};
    const cacheKey = `${surahNum}_${readerTranslationId}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];

    try {
        const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?translations=${readerTranslationId}&per_page=300`;
        const res = await fetch(url);
        const data = await res.json();
        const verses = data?.verses || [];
        const byAyah = {};
        for (const v of verses) {
            const [, ayahStr] = (v.verse_key || "").split(":");
            const ayah = parseInt(ayahStr);
            const trList = v.translations || [];
            for (const t of trList) {
                if (t.resource_id == readerTranslationId) {
                    // Strip HTML tags from translation text
                    byAyah[ayah] = (t.text || "").replace(/<[^>]*>/g, "");
                }
            }
        }
        translationCache[cacheKey] = byAyah;
        return byAyah;
    } catch (e) {
        console.warn("Translation fetch failed:", e);
        return {};
    }
}

// Tafsir fetch
async function fetchReaderTafsir(surahNum, ayahNum, source) {
    if (source === "none") return null;
    try {
        if (source === "jalalayn") {
            const res = await fetch(`https://api.alquran.cloud/v1/ayah/${surahNum}:${ayahNum}/ar.jalalayn`);
            const data = await res.json();
            return data?.data?.text || null;
        }
        const paths = {
            ibnkathir: "en-tafisr-ibn-kathir",
            maarif: "en-tafsir-maarif-ul-quran",
        };
        const path = paths[source];
        if (!path) return null;
        const res = await fetch(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/${path}/${surahNum}/${ayahNum}.json`);
        const data = await res.json();
        return data?.text || data?.tafsir || null;
    } catch (e) {
        return null;
    }
}

// Initialize translation and tafsir selectors
function initReaderSelectors() {
    const trSelect = document.getElementById("reader-translation-select");
    const tafsirSelect = document.getElementById("reader-tafsir-select");

    if (trSelect) {
        trSelect.value = readerTranslationId;
        trSelect.addEventListener("change", async () => {
            readerTranslationId = trSelect.value;
            localStorage.setItem("readerTranslation", readerTranslationId);
            // Clear cache so new translation is fetched
            Object.keys(translationCache).forEach(k => delete translationCache[k]);
            // Inject the new translation into existing verse cards immediately
            // (no re-render needed — just update the .verse-translation divs)
            await injectTranslationsAndTafsir();
            showToast(`Translation: ${trSelect.options[trSelect.selectedIndex].text}`);
        });
    }

    if (tafsirSelect) {
        tafsirSelect.value = readerTafsirSource;
        tafsirSelect.addEventListener("change", () => {
            readerTafsirSource = tafsirSelect.value;
            localStorage.setItem("readerTafsir", readerTafsirSource);
            // Remove any existing tafsir panels (they'll reload with new source when clicked)
            document.querySelectorAll(".tafsir-panel").forEach(p => p.remove());
            showToast(`Tafsir: ${tafsirSelect.options[tafsirSelect.selectedIndex].text}`);
        });
    }
}

// Patch the existing openReader to also fetch translations
const originalOpenReader = openReader;
openReader = async function(surahNum, scrollToAyah = null) {
    await originalOpenReader(surahNum, scrollToAyah);
    // After verses are rendered, fetch and inject translations + tafsir
    if (currentSurahVerses.length) {
        await injectTranslationsAndTafsir();
    }
};

// Inject translations and tafsir into the existing verse cards
async function injectTranslationsAndTafsir() {
    const surahNum = selectedSurah;
    
    // If using the default quran-json translation (id "20" = Saheeh International, which
    // is close to the built-in), keep the built-in v.translation text — no API call needed.
    // Only fetch from API if a different translation is selected.
    if (readerTranslationId === "20" || readerTranslationId === "none") {
        // Use built-in translation (already rendered in .verse-translation div)
        document.querySelectorAll(".verse-translation").forEach(el => {
            el.style.display = readerTranslationId === "none" ? "none" : "";
        });
        return;
    }

    // Fetch the selected translation from quran.com API
    const translations = await fetchReaderTranslation(surahNum);

    const verseCards = document.querySelectorAll(".verse-card");
    for (const card of verseCards) {
        const ayah = parseInt(card.dataset.ayah);
        if (!ayah) continue;

        // Update the EXISTING .verse-translation div (don't create a new one)
        const trDiv = card.querySelector(".verse-translation");
        if (trDiv) {
            if (translations[ayah]) {
                trDiv.innerHTML = escapeHtml(translations[ayah]);
                trDiv.style.display = "";
            } else {
                trDiv.style.display = "none";
            }
        }
    }
}

// ============================================================
// REFLECTION OF THE DAY — functional with real Quranic reflections
// ============================================================

const DAILY_REFLECTIONS = [
    { text: "And whoever puts their trust in Allah, He is sufficient for them. Indeed, Allah will accomplish His purpose.", ref: "Surah At-Talaq 65:3" },
    { text: "So remember Me; I will remember you. And be grateful to Me and do not deny Me.", ref: "Surah Al-Baqarah 2:152" },
    { text: "Indeed, with hardship comes ease. Indeed, with hardship comes ease.", ref: "Surah Ash-Sharh 94:5-6" },
    { text: "And your Lord says: Call upon Me, I will respond to you.", ref: "Surah Ghafir 40:60" },
    { text: "Allah does not burden a soul beyond that it can bear.", ref: "Surah Al-Baqarah 2:286" },
    { text: "And He found you lost and guided you. And He found you in need and made you self-sufficient.", ref: "Surah Ad-Duha 93:7-8" },
    { text: "So do not weaken and do not grieve, and you will be superior if you are believers.", ref: "Surah Ali 'Imran 3:139" },
    { text: "Indeed, Allah is with those who are patient.", ref: "Surah Al-Anfal 8:46" },
    { text: "And whoever fears Allah, He will make for him a way out. And will provide for him from where he does not expect.", ref: "Surah At-Talaq 65:2-3" },
    { text: "Verily, in the remembrance of Allah do hearts find rest.", ref: "Surah Ar-Ra'd 13:28" },
    { text: "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?", ref: "Surah Al-Qamar 54:17" },
    { text: "Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah. Indeed, Allah forgives all sins.", ref: "Surah Az-Zumar 39:53" },
    { text: "And whoever relies upon Allah, then He is sufficient for him.", ref: "Surah At-Talaq 65:3" },
    { text: "Perhaps you hate a thing and it is good for you; and perhaps you love a thing and it is bad for you. And Allah knows, while you know not.", ref: "Surah Al-Baqarah 2:216" },
    { text: "And seek help through patience and prayer; and indeed, it is difficult except for the humbly submissive.", ref: "Surah Al-Baqarah 2:45" },
    { text: "And establish prayer at the two ends of the day and at the approach of the night. Indeed, good deeds do away with misdeeds.", ref: "Surah Hud 11:114" },
    { text: "And when My servants ask you concerning Me, indeed I am near. I respond to the invocation of the supplicant when he calls upon Me.", ref: "Surah Al-Baqarah 2:186" },
    { text: "And We test you with evil and with good as trial; and to Us you will be returned.", ref: "Surah Al-Anbiya 21:35" },
    { text: "Every soul will taste death. And We test you with evil and with good as trial; and to Us you will be returned.", ref: "Surah Al-Anbiya 21:35" },
    { text: "And let not worldly life deceive you, and let not the Deceiver deceive you concerning Allah.", ref: "Surah Luqman 31:33" },
    { text: "Race to forgiveness from your Lord and a Garden as wide as the heavens and the earth.", ref: "Surah Al-Hadid 57:21" },
    { text: "The believers are only those who, when Allah is mentioned, their hearts become fearful, and when His verses are recited to them, it increases them in faith.", ref: "Surah Al-Anfal 8:2" },
    { text: "And hold firmly to the rope of Allah all together and do not become divided.", ref: "Surah Ali 'Imran 3:103" },
    { text: "Indeed, Allah commands justice, good conduct, and giving to relatives; and forbids immorality, bad conduct, and oppression.", ref: "Surah An-Nahl 16:90" },
    { text: "And lower to them the wing of humility out of mercy and say: My Lord, have mercy upon them as they brought me up when I was small.", ref: "Surah Al-Isra 17:24" },
    { text: "And do not turn your cheek away from people in contempt, and do not walk through the earth exultantly. Indeed, Allah does not like everyone self-deluded and boastful.", ref: "Surah Luqman 31:18" },
    { text: "Kind speech and forgiveness are better than charity followed by injury.", ref: "Surah Al-Baqarah 2:263" },
    { text: "The most honorable of you in the sight of Allah is the most righteous of you.", ref: "Surah Al-Hujurat 49:13" },
    { text: "And establish prayer and give zakah, and whatever good you put forward for yourselves, you will find it with Allah.", ref: "Surah Al-Baqarah 2:110" },
    { text: "And whoever Allah guides, he is the guided one. And whoever He leaves astray, you will not find for them protectors besides Him.", ref: "Surah Al-Isra 17:97" },
];

function initDailyReflection() {
    const quoteEl = document.querySelector(".reflection-card blockquote");
    const refEl = document.querySelector(".reflection-card span");
    if (!quoteEl || !refEl) return;

    // Pick reflection based on day of year (rotates daily)
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    const reflection = DAILY_REFLECTIONS[dayOfYear % DAILY_REFLECTIONS.length];

    quoteEl.textContent = `"${reflection.text}"`;
    refEl.textContent = reflection.ref;
}

// Initialize
setTimeout(() => {
    initReaderSelectors();
    initDailyReflection();
}, 800);

// ============================================================
// ISLAMIC (HIJRI) DATE — calculated using the Umm al-Qura algorithm
// ============================================================

const HIJRI_MONTHS = [
    'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani",
    'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban",
    'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'
];

// Cache for the AlAdhan API Hijri date (fetch once per day)
let _aladhanHijriCache = null;
let _aladhanHijriCacheDate = null;

// HIJRI DATE ADJUSTMENT
// =====================
// The AlAdhan API uses the Umm al-Qura calendar (official Saudi calendar).
// Some regions follow local moon sighting which can differ by ±1 day.
const HIJRI_ADJUSTMENT = 0;

async function getIslamicDateFromAPI() {
    // Only fetch once per day (cache by Gregorian date string)
    const today = new Date();
    const todayKey = today.toLocaleDateString('en-CA'); // YYYY-MM-DD
    if (_aladhanHijriCache && _aladhanHijriCacheDate === todayKey) {
        return _aladhanHijriCache;
    }

    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();

    try {
        const res = await fetch(`https://api.aladhan.com/v1/gToH/${dd}-${mm}-${yyyy}`);
        const data = await res.json();
        const h = data?.data?.hijri;
        if (!h) throw new Error("No hijri data");
        let day = parseInt(h.day) + HIJRI_ADJUSTMENT;
        let monthNum = parseInt(h.month.number);
        let year = parseInt(h.year);

        // Handle day overflow/underflow from adjustment
        if (day < 1) {
            monthNum--;
            if (monthNum < 1) { monthNum = 12; year--; }
            day = 30; // approximate — previous month's last day
        } else if (day > 30) {
            monthNum++;
            if (monthNum > 12) { monthNum = 1; year++; }
            day = 1;
        }

        const monthName = HIJRI_MONTHS[monthNum - 1] || h.month.en || 'Muharram';
        const result = {
            date: `${monthName} ${day} ${year}`,
            day: h.weekday?.en || '',
            monthNum: monthNum,
            dayNum: day,
            year: year
        };
        _aladhanHijriCache = result;
        _aladhanHijriCacheDate = todayKey;
        return result;
    } catch (e) {
        console.warn("AlAdhan API failed, using Intl fallback:", e);
        return null;
    }
}

function getIslamicDate() {
    // Synchronous fallback using Intl.DateTimeFormat (umalqura calendar)
    // The async API version (getIslamicDateFromAPI) is preferred and is
    // used by updateIslamicDate() below.
    try {
        const now = new Date();
        const hijriFormatter = new Intl.DateTimeFormat('en-US-u-ca-islamic-umalqura', {
            day: 'numeric',
            month: 'numeric',
            year: 'numeric'
        });
        const hijriParts = hijriFormatter.formatToParts(now);
        let day = '', monthNum = 0, year = '';
        for (const part of hijriParts) {
            if (part.type === 'day') day = part.value;
            else if (part.type === 'month') monthNum = parseInt(part.value);
            else if (part.type === 'year') year = part.value;
        }

        const monthName = HIJRI_MONTHS[monthNum - 1] || 'Muharram';

        return {
            date: `${monthName} ${day} ${year}`,
            day: '',
            monthNum: monthNum,
            dayNum: parseInt(day),
            year: parseInt(year)
        };
    } catch (e) {
        return calculateHijriFallback();
    }
}

function calculateHijriFallback() {
    const now = new Date();
    // Approximate Hijri date calculation
    const julianDay = Math.floor((now.getTime() / 86400000) + 2440587.5);
    const l1 = julianDay - 1948440 + 10632;
    const n = Math.floor((l1 - 1) / 10631);
    const l2 = l1 - 10631 * n + 354;
    const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) + Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
    const monthNum = Math.floor((24 * l3) / 709);
    const day = l3 - Math.floor((709 * monthNum) / 24);
    const year = 30 * n + j - 30;
    
    const months = ['Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani", 'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', "Sha'ban", 'Ramadan', 'Shawwal', "Dhu al-Qi'dah", 'Dhu al-Hijjah'];
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    
    return {
        date: `${months[monthNum - 1] || 'Muharram'} ${day} ${year}`,
        day: dayOfWeek,
        monthNum: monthNum,
        dayNum: day,
        year: year
    };
}

function getWeekNumber() {
    // Calculate ISO week number (1-52/53)
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now - startOfYear) / 86400000);
    const dayOfWeek = startOfYear.getDay() || 7; // Monday = 1, Sunday = 7
    const weekNum = Math.ceil((dayOfYear + dayOfWeek) / 7);
    return weekNum;
}

function getHijriWeekNumber() {
    // Approximate Hijri week number based on day of Hijri year
    const hijri = getIslamicDate();
    const dayOfYear = (hijri.monthNum - 1) * 29.5 + hijri.dayNum;
    return Math.ceil(dayOfYear / 7);
}

function getGregorianDate() {
    const now = new Date();
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December'];
    return {
        date: `${months[now.getMonth()]} ${now.getDate()} ${now.getFullYear()}`,
        day: '',
        monthNum: now.getMonth() + 1,
        dayNum: now.getDate(),
        year: now.getFullYear()
    };
}

let calendarMode = 'hijri'; // 'hijri' or 'gregorian'

function updateCalendarCard() {
    const dateEl = document.getElementById("islamic-date-text");
    const weekEl = document.getElementById("week-number");
    const weekLabelEl = document.querySelector(".hcc-week-label");
    if (!dateEl) return;

    if (calendarMode === 'hijri') {
        // Show the Intl fallback immediately, then try the API for accuracy
        const hijri = getIslamicDate();
        dateEl.textContent = hijri.date;
        if (weekEl) weekEl.textContent = getHijriWeekNumber();
        if (weekLabelEl) weekLabelEl.textContent = "Hijri Week";
        // Upgrade to API date if available
        getIslamicDateFromAPI().then(apiHijri => {
            if (apiHijri && calendarMode === 'hijri') {
                dateEl.textContent = apiHijri.date;
            }
        });
    } else {
        const greg = getGregorianDate();
        dateEl.textContent = greg.date;
        if (weekEl) weekEl.textContent = getWeekNumber();
        if (weekLabelEl) weekLabelEl.textContent = "Week";
    }
}

function initIslamicDate() {
    updateCalendarCard();
    // Switch between Hijri and Gregorian every 7 seconds
    setInterval(() => {
        calendarMode = calendarMode === 'hijri' ? 'gregorian' : 'hijri';
        updateCalendarCard();
    }, 7000);
}

setTimeout(initIslamicDate, 300);

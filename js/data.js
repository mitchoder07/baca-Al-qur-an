/* ============================================================
   BACA — data.js  (shared by index.html + mushaf.html)
   Static data only — no fetches here.
   ============================================================ */

// ============================================================
// SURAH LIST (114 surahs)
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
    { id: 34, revelationOrder: 58, name: "سبأ", transliteration: "Saba", translation: "Sheba", type: "meccan", total_verses: 54 },
    { id: 35, revelationOrder: 43, name: "فاطر", transliteration: "Fatir", translation: "Originator", type: "meccan", total_verses: 45 },
    { id: 36, revelationOrder: 41, name: "يس", transliteration: "Ya-Sin", translation: "Ya Sin", type: "meccan", total_verses: 83 },
    { id: 37, revelationOrder: 56, name: "الصافات", transliteration: "As-Saffat", translation: "Those Who Set the Ranks", type: "meccan", total_verses: 182 },
    { id: 38, revelationOrder: 38, name: "ص", transliteration: "Sad", translation: "The Letter Saad", type: "meccan", total_verses: 88 },
    { id: 39, revelationOrder: 59, name: "الزمر", transliteration: "Az-Zumar", translation: "The Troops", type: "meccan", total_verses: 75 },
    { id: 40, revelationOrder: 60, name: "غافر", transliteration: "Ghafir", translation: "The Forgiver", type: "meccan", total_verses: 85 },
    { id: 41, revelationOrder: 62, name: "فصلت", transliteration: "Fussilat", translation: "Explained in Detail", type: "meccan", total_verses: 54 },
    { id: 42, revelationOrder: 61, name: "الشورى", transliteration: "Ash-Shura", translation: "The Consultation", type: "meccan", total_verses: 53 },
    { id: 43, revelationOrder: 63, name: "الزخرف", transliteration: "Az-Zukhruf", translation: "The Ornaments of Gold", type: "meccan", total_verses: 89 },
    { id: 44, revelationOrder: 64, name: "الدخان", transliteration: "Ad-Dukhan", translation: "The Smoke", type: "meccan", total_verses: 59 },
    { id: 45, revelationOrder: 65, name: "الجاثية", transliteration: "Al-Jathiyah", translation: "The Crouching", type: "meccan", total_verses: 37 },
    { id: 46, revelationOrder: 66, name: "الأحقاف", transliteration: "Al-Ahqaf", translation: "The Wind-Curved Sandhills", type: "meccan", total_verses: 35 },
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
    { id: 58, revelationOrder: 105, name: "المجادلة", transliteration: "Al-Mujadilah", translation: "The Pleading Woman", type: "medinan", total_verses: 22 },
    { id: 59, revelationOrder: 101, name: "الحشر", transliteration: "Al-Hashr", translation: "The Exile", type: "medinan", total_verses: 24 },
    { id: 60, revelationOrder: 91, name: "الممتحنة", transliteration: "Al-Mumtahanah", translation: "She That Is to Be Examined", type: "medinan", total_verses: 13 },
    { id: 61, revelationOrder: 109, name: "الصف", transliteration: "As-Saff", translation: "The Ranks", type: "medinan", total_verses: 14 },
    { id: 62, revelationOrder: 110, name: "الجمعة", transliteration: "Al-Jumu'ah", translation: "The Congregation, Friday", type: "medinan", total_verses: 11 },
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
    { id: 78, revelationOrder: 80, name: "النبأ", transliteration: "An-Naba", translation: "The Tidings", type: "meccan", total_verses: 40 },
    { id: 79, revelationOrder: 81, name: "النازعات", transliteration: "An-Nazi'at", translation: "Those Who Drag Forth", type: "meccan", total_verses: 46 },
    { id: 80, revelationOrder: 24, name: "عبس", transliteration: "Abasa", translation: "He Frowned", type: "meccan", total_verses: 42 },
    { id: 81, revelationOrder: 7, name: "التكوير", transliteration: "At-Takwir", translation: "The Overthrowing", type: "meccan", total_verses: 29 },
    { id: 82, revelationOrder: 82, name: "الانفطار", transliteration: "Al-Infitar", translation: "The Cleaving", type: "meccan", total_verses: 19 },
    { id: 83, revelationOrder: 86, name: "المطففين", transliteration: "Al-Mutaffifin", translation: "The Defrauding", type: "meccan", total_verses: 36 },
    { id: 84, revelationOrder: 83, name: "الانشقاق", transliteration: "Al-Inshiqaq", translation: "The Sundering", type: "meccan", total_verses: 25 },
    { id: 85, revelationOrder: 27, name: "البروج", transliteration: "Al-Buruj", translation: "The Mansions of the Stars", type: "meccan", total_verses: 22 },
    { id: 86, revelationOrder: 36, name: "الطارق", transliteration: "At-Tariq", translation: "The Morning Star", type: "meccan", total_verses: 17 },
    { id: 87, revelationOrder: 8, name: "الأعلى", transliteration: "Al-A'la", translation: "The Most High", type: "meccan", total_verses: 19 },
    { id: 88, revelationOrder: 68, name: "الغاشية", transliteration: "Al-Ghashiyah", translation: "The Overwhelming", type: "meccan", total_verses: 26 },
    { id: 89, revelationOrder: 10, name: "الفجر", transliteration: "Al-Fajr", translation: "The Dawn", type: "meccan", total_verses: 30 },
    { id: 90, revelationOrder: 35, name: "البلد", transliteration: "Al-Balad", translation: "The City", type: "meccan", total_verses: 20 },
    { id: 91, revelationOrder: 26, name: "الشمس", transliteration: "Ash-Shams", translation: "The Sun", type: "meccan", total_verses: 15 },
    { id: 92, revelationOrder: 9, name: "الليل", transliteration: "Al-Layl", translation: "The Night", type: "meccan", total_verses: 21 },
    { id: 93, revelationOrder: 11, name: "الضحى", transliteration: "Ad-Duhaa", translation: "The Morning Hours", type: "meccan", total_verses: 11 },
    { id: 94, revelationOrder: 12, name: "الشرح", transliteration: "Ash-Sharh", translation: "The Relief", type: "meccan", total_verses: 8 },
    { id: 95, revelationOrder: 28, name: "التين", transliteration: "At-Tin", translation: "The Fig", type: "meccan", total_verses: 8 },
    { id: 96, revelationOrder: 1, name: "العلق", transliteration: "Al-Alaq", translation: "The Clot", type: "meccan", total_verses: 19 },
    { id: 97, revelationOrder: 25, name: "القدر", transliteration: "Al-Qadr", translation: "The Power", type: "meccan", total_verses: 5 },
    { id: 98, revelationOrder: 100, name: "البينة", transliteration: "Al-Bayyinah", translation: "The Clear Proof", type: "medinan", total_verses: 8 },
    { id: 99, revelationOrder: 93, name: "الزلزلة", transliteration: "Az-Zalzalah", translation: "The Earthquake", type: "medinan", total_verses: 8 },
    { id: 100, revelationOrder: 14, name: "العاديات", transliteration: "Al-Adiyat", translation: "The Courser", type: "meccan", total_verses: 11 },
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

// ============================================================
// EVERYAYAH RECITERS — folder names on everyayah.com
// Audio URL: https://everyayah.com/data/{folder}/{surah_padded}{ayah_padded}.mp3
// ============================================================

const RECITERS = [
    { id: "mishari", name: "Mishary Rashid Alafasy", country: "Kuwait", folder: "Alafasy_128kbps" },
    { id: "sudais", name: "Abdul Rahman As-Sudais", country: "Saudi Arabia", folder: "Abdurrahmaan_As-Sudais_192kbps" },
    { id: "ali_jaber", name: "Ali Abdullah Jabir", country: "Saudi Arabia", folder: "Ali_Jaber_64kbps" },
    { id: "abdulbasit", name: "Abdul Basit (Murattal)", country: "Egypt", folder: "Abdul_Basit_Murattal_192kbps" },
    { id: "abdulbasit_mj", name: "Abdul Basit (Mujawwad)", country: "Egypt", folder: "Abdul_Basit_Mujawwad_128kbps" },
    { id: "husary", name: "Mahmoud Al-Husary", country: "Egypt", folder: "Husary_128kbps" },
    { id: "husary_muj", name: "Al-Husary (Mujawwad)", country: "Egypt", folder: "Husary_128kbps_Mujawwad" },
    { id: "minshawi", name: "Muhammad Al-Minshawi", country: "Egypt", folder: "Minshawy_Murattal_128kbps" },
    { id: "shaatree", name: "Abu Bakr Ash-Shaatree", country: "Saudi Arabia", folder: "Abu_Bakr_Ash-Shaatree_128kbps" },
    { id: "muaiqly", name: "Maher Al-Muaiqly", country: "Saudi Arabia", folder: "Maher_AlMuaiqly_64kbps" },
    { id: "shuraym", name: "Saud Al-Shuraim", country: "Saudi Arabia", folder: "Saood_ash-Shuraym_128kbps" },
    { id: "hudhaify", name: "Ali Al-Hudhaify", country: "Saudi Arabia", folder: "Hudhaify_128kbps" },
    { id: "ajamy", name: "Ahmed Al-Ajamy", country: "Saudi Arabia", folder: "ahmed_ibn_ali_al_ajamy_128kbps" },
    { id: "jibreel", name: "Muhammad Jibreel", country: "Egypt", folder: "Muhammad_Jibreel_128kbps" },
    { id: "ayyoub", name: "Muhammad Ayyoub", country: "Saudi Arabia", folder: "Muhammad_Ayyoub_128kbps" },
    { id: "ghamdi", name: "Saad Al-Ghamdi", country: "Saudi Arabia", folder: "Ghamadi_40kbps" },
    { id: "basfar", name: "Abdullah Basfar", country: "Saudi Arabia", folder: "Abdullah_Basfar_192kbps" },
    { id: "matroud", name: "Abdullah Matroud", country: "Saudi Arabia", folder: "Abdullah_Matroud_128kbps" },
    { id: "juhaynee", name: "Abdullah Al-Juhaynee", country: "Saudi Arabia", folder: "Abdullaah_3awwaad_Al-Juhaynee_128kbps" },
    { id: "johany", name: "Abdullah Al-Johany", country: "Saudi Arabia", folder: "Abdullah_Al-Johany_128kbps" },
    { id: "tablawi", name: "Mohamed Al-Tablawi", country: "Egypt", folder: "Mohammad_al_Tablaway_128kbps" },
    { id: "rifai", name: "Hani Ar-Rifai", country: "Saudi Arabia", folder: "Hani_Rifai_192kbps" },
    { id: "qasim", name: "Abdul Muhsin Al-Qasim", country: "Saudi Arabia", folder: "Muhsin_Al_Qasim_192kbps" },
    { id: "neana", name: "Ahmed Neana", country: "Egypt", folder: "Ahmed_Neana_128kbps" },
    { id: "ayman_swed", name: "Ayman Swed", country: "Syria", folder: "Ayman_Sowaid_64kbps" },
    { id: "okasha", name: "Okasha Kameny", country: "Ghana", folder: "Okasha_Kameny_64kbps", fullSurahOnly: true },
    { id: "yasser_dosari", name: "Yasser Al-Dosari", country: "Saudi Arabia", folder: "Yasser_Al_Dosari_128kbps", fullSurahOnly: true },
    { id: "mansour_salmi", name: "Mansour Al-Salmi", country: "Saudi Arabia", folder: "Mansour_Al_Salmi_128kbps", fullSurahOnly: true }
];

// ============================================================
// JUZ STARTS — [surah, ayah] of the first ayah in each Juz
// (Mushaf Madinah / Hafs standard, 30 Juz)
// ============================================================

const JUZ_STARTS = [
    [1, 1], [2, 142], [2, 253], [3, 92], [4, 24], [4, 148], [5, 82], [6, 111], [7, 88], [8, 41],
    [9, 93], [11, 6], [12, 53], [15, 1], [17, 1], [18, 75], [21, 1], [23, 1], [25, 21], [27, 56],
    [29, 46], [33, 31], [36, 28], [39, 32], [41, 47], [46, 1], [51, 31], [58, 1], [67, 1], [78, 1]
];


// HIZB STARTS — first ayah of each of the 60 Hizbs
// Each Hizb = exactly half a Juz. Hizb 1 = first half of Juz 1, Hizb 2 = second half of Juz 1, etc.
// Format: [surah, ayah] of the FIRST ayah that begins each Hizb
const HIZB_STARTS = [
    [1,1],[2,75],[2,142],[2,203],[2,253],[3,15],[3,93],[3,171],[4,24],[4,88],
    [4,148],[5,27],[5,82],[6,36],[6,111],[7,1],[7,88],[7,171],[8,41],[9,34],
    [9,93],[10,26],[11,6],[11,84],[12,53],[13,19],[15,1],[16,51],[17,1],[17,99],
    [18,75],[20,1],[21,1],[22,1],[23,1],[24,21],[25,21],[26,111],[27,56],[28,51],
    [29,46],[31,22],[33,31],[34,24],[36,28],[37,145],[39,32],[40,41],[41,47],[43,24],
    [46,1],[48,18],[51,31],[55,1],[58,1],[62,1],[67,1],[72,1],[78,1],[87,1]
];

// ============================================================
// PAGE STARTS — first ayah on each Mushaf Madinah page (604 pages)
// Format: [surah, ayah] of the FIRST ayah that begins on page N
// Pages 1-604, paginated Mushaf Madinah (Hafs, King Fahd Complex)
// ============================================================
// Compact form: each entry is "S.A". We expand at load time.

const PAGE_STARTS_RAW = ["1.1","2.1","2.6","2.17","2.25","2.30","2.38","2.49","2.58","2.62","2.70","2.77","2.84","2.89","2.94","2.102","2.106","2.113","2.120","2.127","2.135","2.142","2.146","2.154","2.164","2.170","2.177","2.182","2.187","2.191","2.197","2.203","2.211","2.216","2.220","2.225","2.231","2.234","2.238","2.246","2.249","2.253","2.257","2.260","2.265","2.270","2.275","2.282","2.283","3.1","3.10","3.16","3.23","3.30","3.38","3.46","3.53","3.62","3.71","3.78","3.84","3.92","3.101","3.109","3.116","3.122","3.133","3.141","3.149","3.154","3.158","3.166","3.174","3.181","3.187","3.195","4.1","4.7","4.12","4.15","4.20","4.24","4.27","4.34","4.38","4.45","4.52","4.60","4.66","4.75","4.80","4.87","4.92","4.95","4.102","4.106","4.114","4.122","4.128","4.135","4.141","4.148","4.155","4.163","4.171","4.176","5.3","5.6","5.10","5.14","5.18","5.24","5.32","5.37","5.42","5.46","5.51","5.58","5.65","5.71","5.77","5.83","5.90","5.96","5.104","5.109","5.114","6.1","6.9","6.19","6.28","6.36","6.45","6.53","6.60","6.69","6.74","6.82","6.91","6.95","6.102","6.111","6.119","6.125","6.132","6.138","6.143","6.147","6.152","6.158","7.1","7.12","7.23","7.31","7.38","7.44","7.52","7.58","7.68","7.74","7.82","7.88","7.96","7.105","7.121","7.131","7.138","7.144","7.150","7.156","7.160","7.164","7.171","7.179","7.188","7.196","8.1","8.9","8.17","8.26","8.34","8.41","8.46","8.53","8.62","8.70","9.1","9.7","9.14","9.21","9.27","9.32","9.37","9.41","9.48","9.55","9.62","9.69","9.73","9.80","9.87","9.94","9.100","9.107","9.112","9.118","9.123","10.1","10.7","10.15","10.21","10.26","10.34","10.43","10.54","10.62","10.71","10.79","10.89","10.98","10.107","11.6","11.13","11.20","11.29","11.38","11.46","11.54","11.63","11.72","11.82","11.89","11.98","11.109","11.118","12.5","12.15","12.23","12.31","12.38","12.44","12.53","12.64","12.70","12.79","12.87","12.96","12.104","13.1","13.6","13.14","13.19","13.29","13.35","13.43","14.6","14.11","14.19","14.25","14.34","14.43","15.1","15.16","15.32","15.52","15.71","15.91","16.7","16.15","16.27","16.35","16.43","16.55","16.65","16.73","16.80","16.88","16.94","16.103","16.111","16.119","17.1","17.8","17.18","17.28","17.39","17.50","17.59","17.67","17.76","17.87","17.97","17.105","18.5","18.16","18.21","18.28","18.35","18.46","18.54","18.62","18.75","18.84","18.98","19.1","19.12","19.26","19.39","19.52","19.65","19.77","19.96","20.13","20.38","20.52","20.65","20.77","20.88","20.99","20.114","20.126","21.1","21.11","21.25","21.36","21.45","21.58","21.73","21.82","21.91","21.102","22.1","22.6","22.16","22.24","22.31","22.39","22.47","22.56","22.65","22.73","23.1","23.18","23.28","23.43","23.60","23.75","23.90","23.105","24.1","24.11","24.21","24.28","24.32","24.37","24.44","24.54","24.59","24.62","25.3","25.12","25.21","25.33","25.44","25.56","25.68","26.1","26.20","26.40","26.61","26.84","26.112","26.137","26.160","26.184","26.207","27.1","27.14","27.23","27.36","27.45","27.56","27.64","27.77","27.89","28.6","28.14","28.22","28.29","28.36","28.44","28.51","28.60","28.71","28.78","28.85","29.7","29.15","29.24","29.31","29.39","29.46","29.53","29.64","30.6","30.16","30.25","30.33","30.42","30.51","31.1","31.12","31.20","31.29","32.1","32.12","32.21","33.1","33.7","33.16","33.23","33.31","33.36","33.44","33.51","33.55","33.63","34.1","34.8","34.15","34.23","34.32","34.40","34.49","35.4","35.12","35.19","35.31","35.39","35.45","36.13","36.28","36.41","36.55","36.71","37.1","37.25","37.52","37.77","37.103","37.127","37.154","38.1","38.17","38.27","38.43","38.62","38.84","39.6","39.11","39.22","39.32","39.41","39.48","39.57","39.68","39.75","40.8","40.17","40.26","40.34","40.41","40.50","40.59","40.67","40.78","41.1","41.12","41.21","41.30","41.39","41.47","42.1","42.11","42.16","42.23","42.32","42.45","42.52","43.11","43.23","43.34","43.48","43.61","43.74","44.1","44.19","44.40","45.1","45.14","45.23","45.33","46.6","46.15","46.21","46.29","47.1","47.12","47.20","47.30","48.1","48.10","48.16","48.24","48.29","49.5","49.12","50.1","50.16","50.36","51.7","51.31","51.52","52.15","52.32","53.1","53.27","53.45","54.7","54.28","54.50","55.17","55.41","55.68","56.17","56.51","56.77","57.4","57.12","57.19","57.25","58.1","58.7","58.12","58.22","59.4","59.10","59.17","60.1","60.6","60.12","61.6","62.1","62.9","63.5","64.1","64.10","65.1","65.6","66.1","66.8","67.1","67.13","67.27","68.16","68.43","69.9","69.35","70.11","70.40","71.11","72.1","72.14","73.1","73.20","74.18","74.48","75.20","76.6","76.26","77.20","78.1","78.31","79.16","80.1","81.1","82.1","83.7","83.35","85.1","86.1","87.16","89.1","89.24","91.1","92.15","95.1","97.1","98.8","100.10","103.1","106.1","109.1","112.1"];

// Pre-parsed [surah, ayah] for each page (index 0 = page 1)
const PAGE_STARTS = PAGE_STARTS_RAW.map(s => s.split(".").map(Number));



// ============================================================
// FULL SURAH AUDIO SERVERS — mp3quran.net
// URL pattern: {server}{surah_padded_3}.mp3 (e.g., 001.mp3, 002.mp3)
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
    'okasha':     'https://server16.mp3quran.net/okasha/Rewayat-Albizi-A-n-Ibn-Katheer/',
    'yasser_dosari': 'https://server11.mp3quran.net/yasser/',
    'mansour_salmi': 'https://server14.mp3quran.net/mansor/'
};

function getFullSurahAudioUrl(surahNum, reciterId) {
    const server = (FULL_SURAH_SERVERS[reciterId] || FULL_SURAH_SERVERS['mishari']);
    const padded = String(surahNum).padStart(3, '0');
    return server + padded + '.mp3';
}

// Last ayah of the entire Quran ends on page 604 — total page count = 604
const TOTAL_PAGES = 604;

// Helper: find Mushaf page number for a given (surah, ayah)
function findPageNumber(surah, ayah) {
    for (let i = PAGE_STARTS.length - 1; i >= 0; i--) {
        const [s, a] = PAGE_STARTS[i];
        if (surah > s || (surah === s && ayah >= a)) return i + 1;
    }
    return 1;
}

// Helper: get the next page's starting [surah, ayah] (for boundary detection)
function getPageEnd(pageNum) {
    if (pageNum >= TOTAL_PAGES) return [114, 6];
    const next = PAGE_STARTS[pageNum]; // pageNum is 1-indexed; array is 0-indexed
    // The last ayah on page N is the ayah immediately before page N+1's first ayah
    return next;
}

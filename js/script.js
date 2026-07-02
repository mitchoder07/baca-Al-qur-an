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
    { id: 1, name: "الفاتحة", transliteration: "Al-Fatihah", translation: "The Opener", type: "meccan", total_verses: 7 },
    { id: 2, name: "البقرة", transliteration: "Al-Baqarah", translation: "The Cow", type: "medinan", total_verses: 286 },
    { id: 3, name: "آل عمران", transliteration: "Ali 'Imran", translation: "Family of Imran", type: "medinan", total_verses: 200 },
    { id: 4, name: "النساء", transliteration: "An-Nisa", translation: "The Women", type: "medinan", total_verses: 176 },
    { id: 5, name: "المائدة", transliteration: "Al-Ma'idah", translation: "The Table Spread", type: "medinan", total_verses: 120 },
    { id: 6, name: "الأنعام", transliteration: "Al-An'am", translation: "The Cattle", type: "meccan", total_verses: 165 },
    { id: 7, name: "الأعراف", transliteration: "Al-A'raf", translation: "The Heights", type: "meccan", total_verses: 206 },
    { id: 8, name: "الأنفال", transliteration: "Al-Anfal", translation: "The Spoils of War", type: "medinan", total_verses: 75 },
    { id: 9, name: "التوبة", transliteration: "At-Tawbah", translation: "The Repentance", type: "medinan", total_verses: 129 },
    { id: 10, name: "يونس", transliteration: "Yunus", translation: "Jonah", type: "meccan", total_verses: 109 },
    { id: 11, name: "هود", transliteration: "Hud", translation: "Hud", type: "meccan", total_verses: 123 },
    { id: 12, name: "يوسف", transliteration: "Yusuf", translation: "Joseph", type: "meccan", total_verses: 111 },
    { id: 13, name: "الرعد", transliteration: "Ar-Ra'd", translation: "The Thunder", type: "medinan", total_verses: 43 },
    { id: 14, name: "إبراهيم", transliteration: "Ibrahim", translation: "Abraham", type: "meccan", total_verses: 52 },
    { id: 15, name: "الحجر", transliteration: "Al-Hijr", translation: "The Rocky Tract", type: "meccan", total_verses: 99 },
    { id: 16, name: "النحل", transliteration: "An-Nahl", translation: "The Bee", type: "meccan", total_verses: 128 },
    { id: 17, name: "الإسراء", transliteration: "Al-Isra", translation: "The Night Journey", type: "meccan", total_verses: 111 },
    { id: 18, name: "الكهف", transliteration: "Al-Kahf", translation: "The Cave", type: "meccan", total_verses: 110 },
    { id: 19, name: "مريم", transliteration: "Maryam", translation: "Mary", type: "meccan", total_verses: 98 },
    { id: 20, name: "طه", transliteration: "Ta-Ha", translation: "Ta-Ha", type: "meccan", total_verses: 135 },
    { id: 21, name: "الأنبياء", transliteration: "Al-Anbiya", translation: "The Prophets", type: "meccan", total_verses: 112 },
    { id: 22, name: "الحج", transliteration: "Al-Hajj", translation: "The Pilgrimage", type: "medinan", total_verses: 78 },
    { id: 23, name: "المؤمنون", transliteration: "Al-Mu'minun", translation: "The Believers", type: "meccan", total_verses: 118 },
    { id: 24, name: "النور", transliteration: "An-Nur", translation: "The Light", type: "medinan", total_verses: 64 },
    { id: 25, name: "الفرقان", transliteration: "Al-Furqan", translation: "The Criterion", type: "meccan", total_verses: 77 },
    { id: 26, name: "الشعراء", transliteration: "Ash-Shu'ara", translation: "The Poets", type: "meccan", total_verses: 227 },
    { id: 27, name: "النمل", transliteration: "An-Naml", translation: "The Ant", type: "meccan", total_verses: 93 },
    { id: 28, name: "القصص", transliteration: "Al-Qasas", translation: "The Stories", type: "meccan", total_verses: 88 },
    { id: 29, name: "العنكبوت", transliteration: "Al-'Ankabut", translation: "The Spider", type: "meccan", total_verses: 69 },
    { id: 30, name: "الروم", transliteration: "Ar-Rum", translation: "The Romans", type: "meccan", total_verses: 60 },
    { id: 31, name: "لقمان", transliteration: "Luqman", translation: "Luqman", type: "meccan", total_verses: 34 },
    { id: 32, name: "السجدة", transliteration: "As-Sajdah", translation: "The Prostration", type: "meccan", total_verses: 30 },
    { id: 33, name: "الأحزاب", transliteration: "Al-Ahzab", translation: "The Combined Forces", type: "medinan", total_verses: 73 },
    { id: 34, name: "سبإ", transliteration: "Saba", translation: "Sheba", type: "meccan", total_verses: 54 },
    { id: 35, name: "فاطر", transliteration: "Fatir", translation: "Originator", type: "meccan", total_verses: 45 },
    { id: 36, name: "يس", transliteration: "Ya-Sin", translation: "Ya Sin", type: "meccan", total_verses: 83 },
    { id: 37, name: "الصافات", transliteration: "As-Saffat", translation: "Those who set the Ranks", type: "meccan", total_verses: 182 },
    { id: 38, name: "ص", transliteration: "Sad", translation: "The Letter Sad", type: "meccan", total_verses: 88 },
    { id: 39, name: "الزمر", transliteration: "Az-Zumar", translation: "The Troops", type: "meccan", total_verses: 75 },
    { id: 40, name: "غافر", transliteration: "Ghafir", translation: "The Forgiver", type: "meccan", total_verses: 85 },
    { id: 41, name: "فصلت", transliteration: "Fussilat", translation: "Explained in Detail", type: "meccan", total_verses: 54 },
    { id: 42, name: "الشورى", transliteration: "Ash-Shuraa", translation: "The Consultation", type: "meccan", total_verses: 53 },
    { id: 43, name: "الزخرف", transliteration: "Az-Zukhruf", translation: "The Ornaments of Gold", type: "meccan", total_verses: 89 },
    { id: 44, name: "الدخان", transliteration: "Ad-Dukhan", translation: "The Smoke", type: "meccan", total_verses: 59 },
    { id: 45, name: "الجاثية", transliteration: "Al-Jathiyah", translation: "The Crouching", type: "meccan", total_verses: 37 },
    { id: 46, name: "الأحقاف", transliteration: "Al-Ahqaf", translation: "The Wind-curved Sandhills", type: "meccan", total_verses: 35 },
    { id: 47, name: "محمد", transliteration: "Muhammad", translation: "Muhammad", type: "medinan", total_verses: 38 },
    { id: 48, name: "الفتح", transliteration: "Al-Fath", translation: "The Victory", type: "medinan", total_verses: 29 },
    { id: 49, name: "الحجرات", transliteration: "Al-Hujurat", translation: "The Rooms", type: "medinan", total_verses: 18 },
    { id: 50, name: "ق", transliteration: "Qaf", translation: "The Letter Qaf", type: "meccan", total_verses: 45 },
    { id: 51, name: "الذاريات", transliteration: "Adh-Dhariyat", translation: "The Winnowing Winds", type: "meccan", total_verses: 60 },
    { id: 52, name: "الطور", transliteration: "At-Tur", translation: "The Mount", type: "meccan", total_verses: 49 },
    { id: 53, name: "النجم", transliteration: "An-Najm", translation: "The Star", type: "meccan", total_verses: 62 },
    { id: 54, name: "القمر", transliteration: "Al-Qamar", translation: "The Moon", type: "meccan", total_verses: 55 },
    { id: 55, name: "الرحمن", transliteration: "Ar-Rahman", translation: "The Beneficent", type: "medinan", total_verses: 78 },
    { id: 56, name: "الواقعة", transliteration: "Al-Waqi'ah", translation: "The Inevitable", type: "meccan", total_verses: 96 },
    { id: 57, name: "الحديد", transliteration: "Al-Hadid", translation: "The Iron", type: "medinan", total_verses: 29 },
    { id: 58, name: "المجادلة", transliteration: "Al-Mujadila", translation: "The Pleading Woman", type: "medinan", total_verses: 22 },
    { id: 59, name: "الحشر", transliteration: "Al-Hashr", translation: "The Exile", type: "medinan", total_verses: 24 },
    { id: 60, name: "الممتحنة", transliteration: "Al-Mumtahanah", translation: "She that is to be examined", type: "medinan", total_verses: 13 },
    { id: 61, name: "الصف", transliteration: "As-Saf", translation: "The Ranks", type: "medinan", total_verses: 14 },
    { id: 62, name: "الجمعة", transliteration: "Al-Jumu'ah", translation: "The Congregation", type: "medinan", total_verses: 11 },
    { id: 63, name: "المنافقون", transliteration: "Al-Munafiqun", translation: "The Hypocrites", type: "medinan", total_verses: 11 },
    { id: 64, name: "التغابن", transliteration: "At-Taghabun", translation: "The Mutual Disillusion", type: "medinan", total_verses: 18 },
    { id: 65, name: "الطلاق", transliteration: "At-Talaq", translation: "The Divorce", type: "medinan", total_verses: 12 },
    { id: 66, name: "التحريم", transliteration: "At-Tahrim", translation: "The Prohibition", type: "medinan", total_verses: 12 },
    { id: 67, name: "الملك", transliteration: "Al-Mulk", translation: "The Sovereignty", type: "meccan", total_verses: 30 },
    { id: 68, name: "القلم", transliteration: "Al-Qalam", translation: "The Pen", type: "meccan", total_verses: 52 },
    { id: 69, name: "الحاقة", transliteration: "Al-Haqqah", translation: "The Reality", type: "meccan", total_verses: 52 },
    { id: 70, name: "المعارج", transliteration: "Al-Ma'arij", translation: "The Ascending Stairways", type: "meccan", total_verses: 44 },
    { id: 71, name: "نوح", transliteration: "Nuh", translation: "Noah", type: "meccan", total_verses: 28 },
    { id: 72, name: "الجن", transliteration: "Al-Jinn", translation: "The Jinn", type: "meccan", total_verses: 28 },
    { id: 73, name: "المزمل", transliteration: "Al-Muzzammil", translation: "The Enshrouded One", type: "meccan", total_verses: 20 },
    { id: 74, name: "المدثر", transliteration: "Al-Muddaththir", translation: "The Cloaked One", type: "meccan", total_verses: 56 },
    { id: 75, name: "القيامة", transliteration: "Al-Qiyamah", translation: "The Resurrection", type: "meccan", total_verses: 40 },
    { id: 76, name: "الإنسان", transliteration: "Al-Insan", translation: "The Man", type: "medinan", total_verses: 31 },
    { id: 77, name: "المرسلات", transliteration: "Al-Mursalat", translation: "The Emissaries", type: "meccan", total_verses: 50 },
    { id: 78, name: "النبإ", transliteration: "An-Naba", translation: "The Tidings", type: "meccan", total_verses: 40 },
    { id: 79, name: "النازعات", transliteration: "An-Nazi'at", translation: "Those who drag forth", type: "meccan", total_verses: 46 },
    { id: 80, name: "عبس", transliteration: "'Abasa", translation: "He Frowned", type: "meccan", total_verses: 42 },
    { id: 81, name: "التكوير", transliteration: "At-Takwir", translation: "The Overthrowing", type: "meccan", total_verses: 29 },
    { id: 82, name: "الإنفطار", transliteration: "Al-Infitar", translation: "The Cleaving", type: "meccan", total_verses: 19 },
    { id: 83, name: "المطففين", transliteration: "Al-Mutaffifin", translation: "The Defrauding", type: "meccan", total_verses: 36 },
    { id: 84, name: "الإنشقاق", transliteration: "Al-Inshiqaq", translation: "The Splitting Open", type: "meccan", total_verses: 25 },
    { id: 85, name: "البروج", transliteration: "Al-Buruj", translation: "The Mansions of the Stars", type: "meccan", total_verses: 22 },
    { id: 86, name: "الطارق", transliteration: "At-Tariq", translation: "The Nightcommer", type: "meccan", total_verses: 17 },
    { id: 87, name: "الأعلى", transliteration: "Al-A'la", translation: "The Most High", type: "meccan", total_verses: 19 },
    { id: 88, name: "الغاشية", transliteration: "Al-Ghashiyah", translation: "The Overwhelming", type: "meccan", total_verses: 26 },
    { id: 89, name: "الفجر", transliteration: "Al-Fajr", translation: "The Dawn", type: "meccan", total_verses: 30 },
    { id: 90, name: "البلد", transliteration: "Al-Balad", translation: "The City", type: "meccan", total_verses: 20 },
    { id: 91, name: "الشمس", transliteration: "Ash-Shams", translation: "The Sun", type: "meccan", total_verses: 15 },
    { id: 92, name: "الليل", transliteration: "Al-Layl", translation: "The Night", type: "meccan", total_verses: 21 },
    { id: 93, name: "الضحى", transliteration: "Ad-Duha", translation: "The Morning Hours", type: "meccan", total_verses: 11 },
    { id: 94, name: "الشرح", transliteration: "Ash-Sharh", translation: "The Relief", type: "meccan", total_verses: 8 },
    { id: 95, name: "التين", transliteration: "At-Tin", translation: "The Fig", type: "meccan", total_verses: 8 },
    { id: 96, name: "العلق", transliteration: "Al-'Alaq", translation: "The Clot", type: "meccan", total_verses: 19 },
    { id: 97, name: "القدر", transliteration: "Al-Qadr", translation: "The Power", type: "meccan", total_verses: 5 },
    { id: 98, name: "البينة", transliteration: "Al-Bayyinah", translation: "The Clear Proof", type: "medinan", total_verses: 8 },
    { id: 99, name: "الزلزلة", transliteration: "Az-Zalzalah", translation: "The Earthquake", type: "medinan", total_verses: 8 },
    { id: 100, name: "العاديات", transliteration: "Al-'Adiyat", translation: "The Courser", type: "meccan", total_verses: 11 },
    { id: 101, name: "القارعة", transliteration: "Al-Qari'ah", translation: "The Calamity", type: "meccan", total_verses: 11 },
    { id: 102, name: "التكاثر", transliteration: "At-Takathur", translation: "The Rivalry in World Increase", type: "meccan", total_verses: 8 },
    { id: 103, name: "العصر", transliteration: "Al-'Asr", translation: "The Declining Day", type: "meccan", total_verses: 3 },
    { id: 104, name: "الهمزة", transliteration: "Al-Humazah", translation: "The Traducer", type: "meccan", total_verses: 9 },
    { id: 105, name: "الفيل", transliteration: "Al-Fil", translation: "The Elephant", type: "meccan", total_verses: 5 },
    { id: 106, name: "قريش", transliteration: "Quraysh", translation: "Quraysh", type: "meccan", total_verses: 4 },
    { id: 107, name: "الماعون", transliteration: "Al-Ma'un", translation: "The Small Kindnesses", type: "meccan", total_verses: 7 },
    { id: 108, name: "الكوثر", transliteration: "Al-Kawthar", translation: "The Abundance", type: "meccan", total_verses: 3 },
    { id: 109, name: "الكافرون", transliteration: "Al-Kafirun", translation: "The Disbelievers", type: "meccan", total_verses: 6 },
    { id: 110, name: "النصر", transliteration: "An-Nasr", translation: "The Divine Support", type: "medinan", total_verses: 3 },
    { id: 111, name: "المسد", transliteration: "Al-Masad", translation: "The Palm Fibre", type: "meccan", total_verses: 5 },
    { id: 112, name: "الإخلاص", transliteration: "Al-Ikhlas", translation: "The Sincerity", type: "meccan", total_verses: 4 },
    { id: 113, name: "الفلق", transliteration: "Al-Falaq", translation: "The Daybreak", type: "meccan", total_verses: 5 },
    { id: 114, name: "الناس", transliteration: "An-Nas", translation: "The Mankind", type: "meccan", total_verses: 6 }
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
];

function getAyahAudioUrl(surahNum, ayahNum, reciterId) {
    const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
    const s = String(surahNum).padStart(3, "0");
    const a = String(ayahNum).padStart(3, "0");
    return `https://everyayah.com/data/${reciter.folder}/${s}${a}.mp3`;
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

    const html = RECITERS.map(r =>
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
    Object.entries(props).forEach(([k, v]) => reader.style.setProperty(k, v));

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
    // Each Hizb = 2 Juz worth of quarters. Rough mapping: 2 hizbS per Juz
    const juzNum = Math.ceil(hizbNum / 2);
    return surahInJuz(surahId, Math.min(juzNum, 30));
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
        // Pick a surah (1-114) and then an ayah within it
        const surahNum = (seed % 114) + 1;
        const surahMeta = SURAH_LIST[surahNum - 1];
        const ayahNum = (seed % surahMeta.total_verses) + 1;

        const res = await fetch(CDN.surah(surahNum));
        const data = await res.json();
        const verse = data.verses[ayahNum - 1];

        const arabicEl = document.querySelector(".ayah-arabic");
        const transEl = document.querySelector(".ayah-translation");
        if (arabicEl) arabicEl.textContent = verse.text;
        if (transEl) transEl.textContent = verse.translation;

        const infoH3 = document.querySelector(".audio-info h3");
        const infoSpan = document.querySelector(".audio-info span");
        if (infoH3) infoH3.textContent = surahMeta.transliteration;
        if (infoSpan) infoSpan.textContent = `Verse ${ayahNum}`;

        dailyAyahData = {
            surah: surahNum, ayah: ayahNum,
            totalAyahs: surahMeta.total_verses,
            surahName: surahMeta.transliteration,
            arabic: verse.text, translation: verse.translation,
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
        const text = `${dailyAyahData.arabic}\n\n${dailyAyahData.translation}\n\n— ${dailyAyahData.surahName}, Ayah ${dailyAyahData.ayah}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: "Daily Ayah — Al Furqan", text });
                showToast("Shared ✓");
            } else {
                await navigator.clipboard.writeText(text);
                showToast("Copied to clipboard");
            }
        } catch {
            showToast("Share cancelled");
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
    const panelId = `tafsir-panel-${ayahNum}`;
    const existing = document.getElementById(panelId);
    if (existing) { existing.remove(); return; } // toggle off

    const card = document.querySelector(`.verse-card[data-ayah="${ayahNum}"]`);
    if (!card) return;

    const panel = document.createElement("div");
    panel.id = panelId;
    panel.className = "tafsir-panel";
    panel.innerHTML = `<div class="tafsir-loading"><i data-lucide="loader-2" class="spin"></i> Loading tafsir…</div>`;
    card.appendChild(panel);
    lucide.createIcons();

    try {
        const res = await fetch(CDN.tafsir(surahNum, ayahNum));
        const data = await res.json();
        const text = data.text || data.tafsir || "No tafsir available for this verse.";
        panel.innerHTML = `
      <div class="tafsir-header">
        <span class="tafsir-badge">Ibn Kathir</span>
        <button class="tafsir-close" data-ayah="${ayahNum}"><i data-lucide="x"></i></button>
      </div>
      <p class="tafsir-body">${escapeHtml(text)}</p>`;
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
            const arabicCleaned = cleanAyah(v.text, surahNum, v.id);
            return `
      <div class="verse-card" data-surah="${surahNum}" data-ayah="${v.id}">
        <div class="verse-number">${v.id}</div>
        <div class="verse-arabic">${arabicCleaned}</div>
        <div class="verse-transliteration">${escapeHtml(v.transliteration || "")}</div>
        <div class="verse-translation">${escapeHtml(v.translation)}</div>
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
    // Start at ayah 1
    const url = getAyahAudioUrl(selectedSurah, 1, currentReciterId);
    audioPlayer.src = url;
    audioPlayer.load();
    if (autoplay) audioPlayer.play().catch(() => { });
}

// Full-surah player auto-advances ayah by ayah
let surahAyahCursor = 1;

function playSurahFromAyah(ayahNum) {
    surahAyahCursor = ayahNum;
    audioPlayer.src = getAyahAudioUrl(selectedSurah, ayahNum, currentReciterId);
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
    if (!audioPlayer.src) return;
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
    // Auto-advance to next ayah
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

document.getElementById("favorite-reciter")?.addEventListener("click", function () {
    localStorage.setItem("reciterId", currentReciterId);
    this.innerHTML = `<i data-lucide="heart"></i>`;
    this.style.color = "var(--reader-accent)";
    lucide.createIcons();
    showToast("Reciter saved as favourite ✓");
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
            // Auto-advance
            const nextBtn = document.querySelector(`.verse-card[data-ayah="${currentAyahPlaying + 1}"] .play-btn`);
            if (nextBtn) { nextBtn.click(); }
            else { syncMiniPlayIcon(false); if (floatingAyah) floatingAyah.textContent = "Finished"; }
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
    if (activeAudioMode === "ayah") {
        document.querySelector(`.verse-card[data-ayah="${currentAyahPlaying + 1}"] .play-btn`)?.click();
    } else if (selectedSurah < 114) {
        selectedSurah++;
        openReader(selectedSurah).then(() => playSurahFromAyah(1));
    }
});

miniPrev?.addEventListener("click", () => {
    if (activeAudioMode === "ayah") {
        document.querySelector(`.verse-card[data-ayah="${currentAyahPlaying - 1}"] .play-btn`)?.click();
    } else if (selectedSurah > 1) {
        selectedSurah--;
        openReader(selectedSurah).then(() => playSurahFromAyah(1));
    }
});

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
    const text = `${arabic}\n\n${trans}`;
    try {
        if (navigator.share) { await navigator.share({ title: "Qur'an Verse", text }); showToast("Shared ✓"); }
        else { await navigator.clipboard.writeText(text); showToast("Copied to clipboard"); }
    } catch { showToast("Share cancelled"); }
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
];

function initRecitersGrid() {
    const gridEl = document.getElementById("reciters-grid");
    const searchEl = document.getElementById("reciters-search");
    if (!gridEl) return;

    function renderGrid(list) {
        if (!list.length) {
            gridEl.innerHTML = `<div class="reciters-empty">No reciters match your search.</div>`;
            return;
        }
        gridEl.innerHTML = list.map(r => `
      <a class="reciter-card" href="reciters/reciter.html?r=${r.id}" title="Open ${r.name}'s profile">
        <div class="reciter-avatar">
          <img src="${r.image}" alt="${r.name}"
            onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">
          <span style="display:none;width:100%;height:100%;align-items:center;justify-content:center">
            <i data-lucide="mic"></i>
          </span>
        </div>
        <h3>${r.name}</h3>
        <div class="rc-country">${r.country}</div>
        <span class="rc-style">${r.style}</span>
      </a>`).join("");
        lucide.createIcons();
    }

    renderGrid(RECITER_PROFILES);

    searchEl?.addEventListener("input", e => {
        const q = e.target.value.trim().toLowerCase();
        renderGrid(q
            ? RECITER_PROFILES.filter(r =>
                r.name.toLowerCase().includes(q) ||
                r.country.toLowerCase().includes(q) ||
                r.style.toLowerCase().includes(q))
            : RECITER_PROFILES
        );
    });
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

// Mobile nav toggle
document.getElementById("hamburger-btn")?.addEventListener("click", () => {
    document.getElementById("mobile-nav")?.classList.toggle("open");
});

// Close menu when any link inside it is clicked
document.querySelectorAll(".mobile-nav a").forEach(link => {
    link.addEventListener("click", () => {
        document.getElementById("mobile-nav")?.classList.remove("open");
    });
});

// Close menu when clicking outside it
document.addEventListener("click", e => {
    if (!e.target.closest(".navbar") && !e.target.closest(".mobile-nav")) {
        document.getElementById("mobile-nav")?.classList.remove("open");
    }
});

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

    // Listen for page reads from the mushaf reader
    window.addEventListener("storage", e => {
        if (e.key === "mushafPage") {
            const newPage = parseInt(e.newValue);
            if (newPage) {
                trackPageRead(newPage);
            }
        }
    });

    // Also track when surah is completed in the reader
    window.addEventListener("storage", e => {
        if (e.key === "surahCompleted") {
            const surahNum = parseInt(e.newValue);
            if (surahNum) markSurahCompleted(surahNum);
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

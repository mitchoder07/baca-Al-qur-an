/* ============================================================
   BACA — mushaf.js
   Full-featured Mushaf reader with:
   - Dual view (Mushaf page spread + continuous surah view)
   - Uthmani Arabic text (alquran.cloud quran-uthmani edition)
   - Word-by-word modal (quran.com API)
   - Tajweed colors (parsed from quran-tajweed edition markup)
   - Multi-language translations (quran.com API translations)
   - Tafsir drawer (Ibn Kathir + Jalalayn from spa5k CDN)
   - Bookmarks (localStorage)
   - Audio (EveryAyah per-ayah, multi-reciter)
   - Dark/light/warm/olive/sapphire themes
   - Search (surah name + page number)
   ============================================================ */

'use strict';

/* ============================================================
   CONFIG — API endpoints
   ============================================================ */

const API = {
    // Uthmani text + tajweed markup (alquran.cloud)
    surahUthmani: (n) => `https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`,
    surahTajweed: (n) => `https://api.alquran.cloud/v1/surah/${n}/quran-tajweed`,
    surahTranslit: (n) => `https://api.alquran.cloud/v1/surah/${n}/en.transliteration`,

    // Per-ayah word-by-word (quran.com)
    wordByWord: (surah, ayah) =>
        `https://api.quran.com/api/v4/verses/by_key/${surah}:${ayah}?words=true&word_fields=text_uthmani,transliteration,text&fields=text_uthmani`,

    // Translations (quran.com — resource IDs)
    translations: (resourceIds, surah) =>
        `https://api.quran.com/api/v4/quran/translations/${resourceIds}?verse_key=${surah}`,

    // Tafsir (English) — spa5k CDN
    tafsirIbnKathir: (s, a) => `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafisr-ibn-kathir/${s}/${a}.json`,
    tafsirMaarif: (s, a) => `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/en-tafsir-maarif-ul-quran/${s}/${a}.json`,
    // Arabic Jalalayn — alquran.cloud (per-ayah endpoint)
    tafsirJalalaynAr: (s, a) => `https://api.alquran.cloud/v1/ayah/${s}:${a}/ar.jalalayn`,

    // Audio (EveryAyah)
    ayahAudio: (surah, ayah, reciterId) => {
        const reciter = RECITERS.find(r => r.id === reciterId) || RECITERS[0];
        const s = String(surah).padStart(3, "0");
        const a = String(ayah).padStart(3, "0");
        return `https://everyayah.com/data/${reciter.folder}/${s}${a}.mp3`;
    }
};

// Translation resource IDs on quran.com API (verified against /resources/translations)
const TRANSLATIONS = [
    { id: 20, code: "en.sahih", name: "Saheeh International", lang: "English", author: "Saheeh International" },
    { id: 95, code: "en.maududi", name: "Maududi (Tafhim)", lang: "English", author: "Sayyid Abul Ala Maududi" },
    { id: 84, code: "en.usmani", name: "Mufti Taqi Usmani", lang: "English", author: "Mufti Taqi Usmani" },
    { id: 22, code: "en.yusufali", name: "Yusuf Ali", lang: "English", author: "Abdullah Yusuf Ali" },
    { id: 19, code: "en.pickthall", name: "Pickthall", lang: "English", author: "M. Pickthall" },
    { id: 85, code: "en.haleem", name: "Abdul Haleem", lang: "English", author: "M.A.S. Abdel Haleem" },
    { id: 203, code: "en.hilali", name: "Hilali & Khan", lang: "English", author: "Al-Hilali & Khan" },
    { id: 149, code: "en.bridges", name: "Bridges' Translation", lang: "English", author: "Fadel Soliman" },
    { id: 57, code: "en.translit", name: "Transliteration", lang: "Roman", author: "quran.com" },
    { id: 97, code: "ur.maududi", name: "Tafheem-ul-Quran (Maududi)", lang: "Urdu", author: "Syed Abu Ali Maududi" },
    { id: 234, code: "ur.jalandhri", name: "Fatah Muhammad Jalandhri", lang: "Urdu", author: "Fatah Muhammad Jalandhri" },
    { id: 819, code: "ur.wahiduddin", name: "Maulana Wahiduddin Khan", lang: "Urdu", author: "Maulana Wahiduddin Khan" },
    { id: 33, code: "id.indonesian", name: "Indonesian Islamic Affairs Ministry", lang: "Indonesian", author: "Indonesian Islamic Affairs Min." },
    { id: 134, code: "id.kfqc", name: "King Fahad Quran Complex", lang: "Indonesian", author: "KFQC" },
    { id: 31, code: "fr.hamidullah", name: "Hamidullah (French)", lang: "French", author: "Muhammad Hamidullah" },
    { id: 77, code: "tr.diyanet", name: "Diyanet Isleri (Turkish)", lang: "Turkish", author: "Diyanet Isleri" },
    { id: 45, code: "ru.kuliev", name: "Kuliev (Russian)", lang: "Russian", author: "Elmir Kuliev" },
    { id: 56, code: "zh.majian", name: "Ma Jian (Chinese)", lang: "Chinese", author: "Ma Jian" },
    { id: 103, code: "pt.nasr", name: "Helmi Nasr (Portuguese)", lang: "Portuguese", author: "Helmi Nasr" },
    { id: 54, code: "hi.junagarhi", name: "Maulana Junagarhi (Hindi)", lang: "Hindi", author: "Maulana Junagarhi" }
];

// Tajweed rules mapping for alquran.cloud's quran-tajweed edition.
// Format:  [letter[text]  |  [letter:number[text]  |  :number[text]
//
// CORRECTED mapping — verified by analyzing actual API data patterns
// and cross-referencing with quran.com's tajweed implementation:
//
//   n = Madd (superscript alef ـٰ prolongation) → MAD
//   m = Madd (alef madd لٓ)                     → MAD
//   o = Madd Wajib Muttasil (combined ـٰٓ)      → MAD
//   p = Qalqalah (echo on ق ب ج د ط with sukun) → QALQALAH
//   q = Qalqalah Sughra                         → QALQALAH
//   g = Ghunnah (meem/nun with shaddah مّ نّ)   → GHUNNAH
//   f = Ikhfa (nun sakinah hidden before 15 letters) → IKHFA
//   c = Ikhfa Shafawi (meem sakinah before ba)  → IKHFA
//   i = Ikhfa Shafawi (meem sakinah before ba)  → IKHFA
//   w = Idgham Shafawi (meem sakinah before meem) → IDGHAM
//   a = Idgham with Ghunnah (nun/tanwin before ي و م ن) → IDGHAM
//   u = Idgham without Ghunnah (nun/tanwin before ل ر) → IDGHAM
//   s = Sukun (silent, no color)                → null
//   l = Lam Shamsiyyah (silent, no color)       → null
//   h = Hamzat Wasl (connecting, no color)      → null
const TAJWEED_RULES = {
    // Madd (prolongation) — purple
    "n": "taj-madd",
    "m": "taj-madd",
    "o": "taj-madd",
    // Qalqalah (echo) — red
    "p": "taj-qalqalah",
    "q": "taj-qalqalah",
    // Ghunnah (nasalization) — orange
    "g": "taj-ghunnah",
    // Ikhfa (hiding) — gray
    "f": "taj-ikhfa",
    "c": "taj-ikhfa",
    "i": "taj-ikhfa",
    // Idgham (merging) — yellow
    "w": "taj-idgham",
    "a": "taj-idgham",
    "u": "taj-idgham",
    // No color (silent letters)
    "s": null,
    "l": null,
    "h": null,
};

/* ============================================================
   STATE
   ============================================================ */

const state = {
    view: "page",   // Always page view — Surah view toggle removed per user request
    page: parseInt(localStorage.getItem("mushafPage")) || 1,  // 1-604
    surah: parseInt(localStorage.getItem("mushafSurah")) || 1, // 1-114 (used for audio context)
    reciterId: localStorage.getItem("reciterId") || "mishari",
    // Theme: use saved mushaf theme, OR sync with siteTheme on first visit
    theme: (() => {
        const saved = localStorage.getItem("mushafTheme");
        if (saved) return saved;
        const siteTheme = localStorage.getItem("siteTheme") || "dark";
        return siteTheme === "light" ? "light" : "dark";
    })(),
    tajweedOn: localStorage.getItem("mushafTajweed") !== "false",
    displayMode: localStorage.getItem("mushafDisplayMode") || "both", // "both" | "arabic" | "translation"
    arabicFont: parseFloat(localStorage.getItem("mushafArabicFont")) || 2.2,
    translationFont: parseFloat(localStorage.getItem("mushafTranslationFont")) || 1.0,
    activeTranslations: JSON.parse(localStorage.getItem("mushafTranslations") || '["20"]'), // default: Saheeh International
    bookmarks: JSON.parse(localStorage.getItem("mushafBookmarks") || "[]"),
    tafsirSource: "ibnkathir",
    // Cached fetches
    surahCache: {},    // { surahNum: { uthmani, tajweed, translit, translations: {} } }
    pageCache: {},     // { pageNum: [ayahs...] }
    // Runtime
    currentAyahAudio: null,    // {surah, ayah}
    isPlaying: false,
    audioQueue: [],            // list of {surah, ayah} to play in order
    audioCursor: 0,
    wordModalContext: null,    // {surah, ayah, wordIndex, words:[]}
};

/* ============================================================
   ELEMENT REFS
   ============================================================ */

const el = {
    readArea: document.getElementById("mushaf-read-area"),
    loader: document.getElementById("mushaf-loader"),
    pageView: document.getElementById("page-view"),
    surahView: document.getElementById("surah-view"),
    pageContainer: document.getElementById("page-container"),
    pageCurrent: document.getElementById("page-current"),
    pageNumLabel: document.getElementById("page-num-label"),
    pageSlider: document.getElementById("page-slider"),
    surahBannerArabic: document.getElementById("surah-banner-arabic"),
    surahBannerTitle: document.getElementById("surah-banner-title"),
    surahBannerMeta: document.getElementById("surah-banner-meta"),
    surahBismillah: document.getElementById("surah-bismillah"),
    surahVerses: document.getElementById("surah-verses"),
    navPrev: document.getElementById("nav-prev-btn"),
    navNext: document.getElementById("nav-next-btn"),
    navSelectorBtn: document.getElementById("nav-selector-btn"),
    navSelectorLabel: document.getElementById("nav-selector-label"),
    navDropdown: document.getElementById("nav-dropdown"),
    navSearchInput: document.getElementById("nav-search-input"),
    navList: document.getElementById("nav-list"),
    translationsDrawer: document.getElementById("translations-drawer"),
    translationList: document.getElementById("translation-list"),
    displayModeButtons: document.getElementById("display-mode-buttons"),
    reciterDrawer: document.getElementById("reciter-drawer"),
    reciterList: document.getElementById("reciter-list"),
    reciterSearch: document.getElementById("reciter-search"),
    reciterIndicator: document.getElementById("reciter-indicator"),
    settingsDrawer: document.getElementById("settings-drawer"),
    bookmarksDrawer: document.getElementById("bookmarks-drawer"),
    bookmarksList: document.getElementById("bookmarks-list"),
    bookmarksCount: document.getElementById("bookmarks-count"),
    bookmarksClearBtn: document.getElementById("bookmarks-clear-btn"),
    bookmarksToolBtn: document.getElementById("bookmarks-tool"),
    bookmarkCount: document.getElementById("bookmark-count"),
    tafsirDrawer: document.getElementById("tafsir-drawer"),
    tafsirContent: document.getElementById("tafsir-content"),
    wordModalOverlay: document.getElementById("word-modal-overlay"),
    wordModalBody: document.getElementById("word-modal-body"),
    wordModalNav: document.getElementById("word-modal-nav"),
    wordModalClose: document.getElementById("word-modal-close"),
    wordPrev: document.getElementById("word-prev"),
    wordNext: document.getElementById("word-next"),
    searchModal: document.getElementById("search-modal"),
    searchModalInput: document.getElementById("mushaf-search-input"),
    searchModalResults: document.getElementById("search-modal-results"),
    searchModalClose: document.getElementById("search-modal-close"),
    searchModalOverlay: document.getElementById("search-modal-overlay"),
    floatingPlayer: document.getElementById("floating-player"),
    floatingSurah: document.getElementById("floating-surah"),
    floatingAyah: document.getElementById("floating-ayah"),
    miniPlay: document.getElementById("mini-play"),
    miniPrev: document.getElementById("mini-prev"),
    miniNext: document.getElementById("mini-next"),
    miniRepeat: document.getElementById("mini-repeat"),
    miniProgress: document.getElementById("mini-progress"),
    miniTime: document.getElementById("mini-time"),
    ayahAudio: document.getElementById("ayah-audio"),
    toast: document.getElementById("toast"),
    ayahPopover: document.getElementById("ayah-popover"),
    ayahPopoverRef: document.getElementById("ayah-popover-ref"),
    ayahPopoverBody: document.getElementById("ayah-popover-body"),
    ayahPopoverClose: document.getElementById("ayah-popover-close"),
    // Note: mushaf-theme-btn and mushaf-search-btn were removed from toolbar.
    // Theme is controlled via Settings drawer's theme swatches.
    // Search is accessible via the "/" keyboard shortcut.
    hamburgerBtn: document.getElementById("hamburger-btn"),
    mobileNav: document.getElementById("mobile-nav"),
    translationsTool: document.getElementById("translations-tool"),
    tajweedTool: document.getElementById("tajweed-tool"),
    tajweedIndicator: document.getElementById("tajweed-indicator"),
    reciterTool: document.getElementById("reciter-tool"),
    settingsTool: document.getElementById("settings-tool"),
};

/* ============================================================
   UTILITIES
   ============================================================ */

function showToast(msg) {
    el.toast.textContent = msg;
    el.toast.classList.add("show");
    setTimeout(() => el.toast.classList.remove("show"), 2000);
}

function escapeHtml(s) {
    if (s == null) return "";
    return String(s).replace(/[&<>"']/g, c => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[c]));
}

// Strip HTML tags from a string (e.g. quran.com translations have <sup> footnotes)
function stripHtml(s) {
    if (s == null) return "";
    return String(s).replace(/<[^>]*>/g, "");
}

// Strip HTML tags AND decode common entities, for clean display
function cleanText(s) {
    if (s == null) return "";
    let out = String(s).replace(/<[^>]*>/g, "");
    // Decode a few common entities
    out = out.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, " ");
    return out;
}

function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

function capitalizeType(t) {
    if (!t) return "";
    return t.charAt(0).toUpperCase() + t.slice(1);
}

function pad3(n) { return String(n).padStart(3, "0"); }

// Arabic-Indic digits for ayah markers (e.g. ١, ٢, ٣...)
function toArabicNum(n) {
    const map = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
    return String(n).split("").map(d => map[+d] ?? d).join("");
}

// Convert hex color to "r,g,b" string for use in rgba()
function hexToRgb(hex) {
    hex = hex.replace("#", "");
    if (hex.length === 3) hex = hex.split("").map(c => c + c).join("");
    const n = parseInt(hex, 16);
    return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
}

// Generic fetch with timeout + JSON
async function fetchJSON(url, { timeout = 12000 } = {}) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeout);
    try {
        const res = await fetch(url, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } finally {
        clearTimeout(t);
    }
}

/* ============================================================
   SAVE STATE
   ============================================================ */

function persistState() {
    localStorage.setItem("mushafView", state.view);
    localStorage.setItem("mushafPage", state.page);
    localStorage.setItem("mushafSurah", state.surah);
    localStorage.setItem("reciterId", state.reciterId);
    localStorage.setItem("mushafTheme", state.theme);
    localStorage.setItem("mushafTajweed", state.tajweedOn);
    localStorage.setItem("mushafDisplayMode", state.displayMode);
    localStorage.setItem("mushafArabicFont", state.arabicFont);
    localStorage.setItem("mushafTranslationFont", state.translationFont);
    localStorage.setItem("mushafTranslations", JSON.stringify(state.activeTranslations));
    localStorage.setItem("mushafBookmarks", JSON.stringify(state.bookmarks));
}

/* ============================================================
   THEME
   ============================================================ */

function applyTheme(theme) {
    state.theme = theme;
    // Set theme on BOTH body and .mushaf-read-area so all UI (modal, drawers,
    // floating player, read area) inherits the same theme variables.
    document.body.dataset.mushafTheme = theme;
    el.readArea.dataset.theme = theme;
    document.querySelectorAll(".theme-swatch").forEach(s => {
        s.classList.toggle("active", s.dataset.theme === theme);
    });
    // The reader theme controls BOTH the body background AND the read area.
    // The "light" reader theme makes the whole page light; other themes make it dark.
    if (theme === "light") {
        document.body.classList.add("light-mode");
    } else {
        document.body.classList.remove("light-mode");
    }
    persistState();
}

function toggleSiteTheme() {
    // Cycle: dark → warm → olive → sapphire → light → dark
    const order = ["dark", "warm", "olive", "sapphire", "light"];
    const next = order[(order.indexOf(state.theme) + 1) % order.length];
    applyTheme(next);
    showToast(`Theme: ${next.charAt(0).toUpperCase() + next.slice(1)}`);
}

// Sync body theme with siteTheme from index.html (localStorage "siteTheme")
// When the user navigates from index.html to mushaf.html, we respect the site theme
// they chose on the home page as the STARTING point, but the user can still switch
// reader themes using the settings drawer's theme swatches.
function syncWithSiteTheme() {
    const siteTheme = localStorage.getItem("siteTheme") || "dark";
    // If the user hasn't set a mushaf theme yet, use the site theme as default
    const savedMushafTheme = localStorage.getItem("mushafTheme");
    if (!savedMushafTheme) {
        // First visit: sync reader theme with site theme
        applyTheme(siteTheme === "light" ? "light" : "dark");
    }
}

/* ============================================================
   TAJWEED — parse quran-tajweed markup
   alquran.cloud returns text like:
     "إِنَّ <tajweed-rule=1>اللَّهَ</tajweed> ..."
   or some versions use unicode markers. We handle both.
   ============================================================ */

// Parse tajweed markup from alquran.cloud's quran-tajweed edition.
// Format:  [letter[text]  |  [letter:number[text]  |  :number[text]
// All wrapped text ends with ].
// Returns [{text, rule}] segments where rule is a CSS class name or null.
function parseTajweedSegments(text) {
    if (!text) return [{ text: "", rule: null }];

    const segments = [];
    // Regex matches all three formats:
    //   [letter[number[text]   → group 1=letter, group 2=number, group 3=text
    //   [letter[text]           → group 1=letter, group 2=undefined, group 3=text
    //   :number[text]           → group 1=undefined, group 2=number, group 3=text
    const re = /(?:\[([a-z])(?::(\d+))?\[|:(\d+)\[)([^\]]*)\]/g;
    let lastIdx = 0;
    let m;
    while ((m = re.exec(text)) !== null) {
        // Push any plain text before this match
        if (m.index > lastIdx) {
            segments.push({ text: text.slice(lastIdx, m.index), rule: null });
        }
        const letter = m[1];
        const number = m[2] || m[3];
        // Prefer letter for rule lookup; fall back to number
        const ruleKey = letter || number;
        const ruleClass = TAJWEED_RULES[ruleKey] || null;
        segments.push({ text: m[4], rule: ruleClass });
        lastIdx = m.index + m[0].length;
    }
    // Push any remaining plain text
    if (lastIdx < text.length) {
        segments.push({ text: text.slice(lastIdx), rule: null });
    }
    return segments.length ? segments : [{ text, rule: null }];
}

// Strip tajweed markup to get plain text
function stripTajweedMarkup(text) {
    if (!text) return "";
    return text
        .replace(/(?:\[([a-z])(?::(\d+))?\[|:(\d+)\[)([^\]]*)\]/g, "$3")
        .replace(/[\[\]:]/g, "");
}

// Render Arabic text as clickable words with optional tajweed colors.
// Returns HTML string.
// When tajweedMarkup is true, the text contains alquran.cloud's bracket notation
// ([letter[text] or :number[text]). We split into WORDS by spaces OUTSIDE brackets,
// then within each word, parse and color the tajweed segments.
function renderArabicWithWords(text, { tajweedMarkup = false } = {}) {
    if (!text) return "";

    // If no tajweed markup, just split by whitespace and wrap each word
    if (!tajweedMarkup) {
        const words = text.split(/\s+/).filter(w => w.length);
        let html = "";
        words.forEach((w, i) => {
            html += `<span class="word" data-w="${i}">${escapeHtml(w)}</span> `;
        });
        return html;
    }

    // Split by spaces that are OUTSIDE brackets.
    // Track bracket depth: [ increases depth, ] decreases.
    // Only split on spaces when depth == 0.
    const words = [];
    let current = "";
    let depth = 0;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === "[") depth++;
        else if (c === "]") depth = Math.max(0, depth - 1);

        if (c === " " && depth === 0) {
            if (current.length) {
                words.push(current);
                current = "";
            }
        } else {
            current += c;
        }
    }
    if (current.length) words.push(current);

    // For each word, parse tajweed segments and render them inside a single .word span
    let html = "";
    words.forEach((word, wordIdx) => {
        const segments = parseTajweedSegments(word);
        let innerHtml = "";
        for (const seg of segments) {
            if (!seg.text) continue;
            if (seg.rule) {
                innerHtml += `<span class="${seg.rule}">${escapeHtml(seg.text)}</span>`;
            } else {
                innerHtml += escapeHtml(seg.text);
            }
        }
        html += `<span class="word" data-w="${wordIdx}">${innerHtml}</span> `;
    });
    return html;
}

/* ============================================================
   DATA FETCHERS
   ============================================================ */

// Fetch full surah: Uthmani text + transliteration + tajweed markup
async function fetchSurahData(surahNum) {
    if (state.surahCache[surahNum]) return state.surahCache[surahNum];

    // 1. Uthmani text (alquran.cloud)
    const uthmaniRes = await fetchJSON(API.surahUthmani(surahNum));
    const uthmaniAyahs = uthmaniRes?.data?.ayahs || [];

    // 2. Tajweed text (parallel array)
    let tajweedAyahs = [];
    try {
        const tajRes = await fetchJSON(API.surahTajweed(surahNum));
        tajweedAyahs = tajRes?.data?.ayahs || [];
    } catch (e) {
        console.warn("Tajweed fetch failed:", e);
    }

    // 3. Transliteration (parallel)
    let translitAyahs = [];
    try {
        const trRes = await fetchJSON(API.surahTranslit(surahNum));
        translitAyahs = trRes?.data?.ayahs || [];
    } catch (e) {
        console.warn("Translit fetch failed:", e);
    }

    // 4. Merge by ayah index
    const verses = uthmaniAyahs.map((a, i) => ({
        surah: surahNum,
        ayah: a.numberInSurah,
        text: a.text,
        tajweedText: tajweedAyahs[i]?.text || "",
        translit: translitAyahs[i]?.text || ""
    }));

    // 5. Remove Bismillah prefix from ayah 1 of surahs (except Surah 1 where it IS ayah 1,
    //    and Surah 9 which has no Bismillah).
    //    The Bismillah is always exactly 4 words: بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
    //    We use a simple word-count approach: if the first word is "بِسْمِ", strip the first 4 words.
    //    This is much more robust than regex matching which fails on Unicode variations.
    if (surahNum !== 1 && surahNum !== 9 && verses[0]) {
        const v0 = verses[0];
        // Strip BOM if present
        v0.text = v0.text.replace(/^\uFEFF/, "");
        v0.tajweedText = (v0.tajweedText || "").replace(/^\uFEFF/, "");
        // Check if text starts with "بِسْمِ" (the first word of Bismillah)
        // Use startsWith with just the base letters to handle diacritic variations
        if (v0.text.startsWith("بِسْمِ")) {
            const words = v0.text.split(/\s+/);
            if (words.length > 4) {
                v0.text = words.slice(4).join(" ");
            }
        }
    }

    const cached = { verses, fetchedAt: Date.now() };
    state.surahCache[surahNum] = cached;
    return cached;
}

// Fetch translations for a full surah (quran.com API)
// Returns { [ayahNum]: { [resourceId]: translationText } }
async function fetchTranslationsForSurah(surahNum) {
    if (!state.activeTranslations.length) return {};
    const cacheKey = `tr_${surahNum}_${state.activeTranslations.join(",")}`;
    if (state.surahCache[cacheKey]) return state.surahCache[cacheKey];

    try {
        // quran.com: use /verses/by_chapter with translations= param
        // Note: we use verse_key filter to get translations for the entire surah
        // Each verse's translations array has the form: [{ resource_id, name, text }, ...]
        const resourceIds = state.activeTranslations.join(",");
        const url = `https://api.quran.com/api/v4/verses/by_chapter/${surahNum}?translations=${resourceIds}&per_page=300`;
        const res = await fetchJSON(url);
        const verses = res?.verses || [];

        // Group by ayah number
        const byAyah = {};
        for (const v of verses) {
            const verseKey = v.verse_key || "";
            const [, ayahStr] = verseKey.split(":");
            const ayah = parseInt(ayahStr);
            if (!byAyah[ayah]) byAyah[ayah] = {};
            // translations array
            const trList = v.translations || [];
            for (const t of trList) {
                const rid = t.resource_id;
                if (rid) byAyah[ayah][rid] = t.text;
            }
        }
        state.surahCache[cacheKey] = byAyah;
        return byAyah;
    } catch (e) {
        console.warn("Translations fetch failed:", e);
        return {};
    }
}

// Fetch word-by-word analysis for a single ayah
// Returns: [{ text_uthmani, transliteration, translation }] array of words
// NOTE: quran.com API returns transliteration and translation as OBJECTS:
//   { text: "bis'mi", language_name: "english" }
// We extract the .text property to get plain strings.
async function fetchWordByWord(surahNum, ayahNum) {
    try {
        const res = await fetchJSON(API.wordByWord(surahNum, ayahNum));
        const verse = res?.verse;
        if (!verse?.words) return [];
        return verse.words.map(w => {
            // text_uthmani and text are plain strings
            const text = w.text_uthmani || w.text || "";
            // transliteration can be: string, {text: "..."}, or null/undefined
            let transliteration = "";
            if (typeof w.transliteration === "string") {
                transliteration = w.transliteration;
            } else if (w.transliteration && typeof w.transliteration === "object") {
                transliteration = w.transliteration.text || "";
            }
            // translation can be: string, {text: "..."}, or null/undefined
            let translation = "";
            if (typeof w.translation === "string") {
                translation = w.translation;
            } else if (w.translation && typeof w.translation === "object") {
                translation = w.translation.text || "";
            }
            return { text, transliteration, translation };
        });
    } catch (e) {
        console.warn("Word-by-word fetch failed:", e);
        return [];
    }
}

// Fetch tafsir for an ayah
async function fetchTafsir(surahNum, ayahNum, source = "ibnkathir") {
    try {
        if (source === "jalalayn") {
            // Arabic Jalalayn from alquran.cloud
            const res = await fetchJSON(API.tafsirJalalaynAr(surahNum, ayahNum));
            return res?.data?.text || "No tafsir available for this verse.";
        }
        if (source === "maarif") {
            const res = await fetchJSON(API.tafsirMaarif(surahNum, ayahNum));
            return res?.text || res?.tafsir || "No tafsir available for this verse.";
        }
        // Default: Ibn Kathir (English)
        const res = await fetchJSON(API.tafsirIbnKathir(surahNum, ayahNum));
        return res?.text || res?.tafsir || "No tafsir available for this verse.";
    } catch (e) {
        return "Could not load tafsir. Please check your internet connection.";
    }
}

/* ============================================================
   INIT
   ============================================================ */

function init() {
    // Apply reader theme (controls page background + text colors in read area)
    applyTheme(state.theme);
    // Sync body chrome (navbar, toolbar, drawers) with siteTheme from index.html
    syncWithSiteTheme();

    // Apply tajweed state
    if (!state.tajweedOn) {
        el.readArea.classList.add("tajweed-off");
        el.tajweedIndicator.textContent = "Off";
        el.tajweedIndicator.classList.remove("active");
        el.tajweedTool.classList.remove("active");
    }

    // Apply display mode (set active button)
    document.querySelectorAll("#display-mode-buttons .toggle-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.mode === state.displayMode);
    });

    // Render translation list
    renderTranslationList();

    // Render reciter list
    renderReciterList("");
    const activeReciter = RECITERS.find(r => r.id === state.reciterId);
    if (activeReciter) {
        // Show full name, truncate if too long
        el.reciterIndicator.textContent = activeReciter.name.length > 20
            ? activeReciter.name.substring(0, 18) + "…"
            : activeReciter.name;
    }

    // Render bookmarks
    renderBookmarks();
    updateBookmarkCount();

    // Render navigator
    renderNavList("surah");

    // Wire events
    wireEvents();

    // Initial render
    render();

    // Auto-restore last position
    // (state.page and state.surah are already loaded from localStorage)
}

document.addEventListener("DOMContentLoaded", init);

/* ============================================================
   MAIN RENDER — dispatches to renderPageView or renderSurahView
   ============================================================ */

async function render() {
    // Show loader
    el.loader.style.display = "block";
    el.pageView.hidden = true;
    el.surahView.hidden = true;

    try {
        if (state.view === "page") {
            await renderPageView();
            el.pageView.hidden = false;
        } else {
            await renderSurahView();
            el.surahView.hidden = false;
        }
    } catch (err) {
        console.error("Render failed:", err);
        el.loader.innerHTML = `
            <div class="loader-circle" style="background:rgba(239,68,68,0.15);color:#f87171">
                <i data-lucide="wifi-off"></i>
            </div>
            <p style="color:#f87171;margin-top:1rem">Could not load Mushaf.</p>
            <p style="font-size:0.85rem;color:var(--mushaf-subtext);margin-top:0.4rem">
                Please check your internet connection and try again.
            </p>`;
        if (window.lucide) lucide.createIcons();
    } finally {
        el.loader.style.display = "none";
    }

    // Update UI badges
    updateNavLabel();
    if (window.lucide) lucide.createIcons();
}

/* ============================================================
   PAGE VIEW — Mushaf Madinah two-page spread
   ============================================================ */

// Determine which ayahs belong on a given page (1-604)
// We fetch surah data on demand and slice ayahs that fit on the page boundary.
async function getAyahsForPage(pageNum) {
    if (state.pageCache[pageNum]) return state.pageCache[pageNum];

    // Find page boundary: [startSurah, startAyah] and endSurah, endAyah
    const startSurah = PAGE_STARTS[pageNum - 1][0];
    const startAyah = PAGE_STARTS[pageNum - 1][1];
    let endSurah, endAyah;
    if (pageNum >= TOTAL_PAGES) {
        endSurah = 114; endAyah = 6;
    } else {
        // End is the ayah BEFORE the next page's first ayah
        const nextStart = PAGE_STARTS[pageNum];
        endSurah = nextStart[0];
        endAyah = nextStart[1] - 1;
        if (endAyah < 1) {
            // Move to end of previous surah
            const prevSurah = endSurah - 1;
            if (prevSurah >= 1) {
                endSurah = prevSurah;
                endAyah = SURAH_LIST[prevSurah - 1].total_verses;
            }
        }
    }

    // Fetch all surahs spanning [startSurah..endSurah]
    const surahsToFetch = [];
    for (let s = startSurah; s <= endSurah; s++) surahsToFetch.push(s);

    const allAyahs = [];
    for (const s of surahsToFetch) {
        const data = await fetchSurahData(s);
        for (const v of data.verses) {
            // Include ayah if it falls within [startSurah:startAyah .. endSurah:endAyah]
            const after = (v.surah > startSurah) || (v.surah === startSurah && v.ayah >= startAyah);
            const before = (v.surah < endSurah) || (v.surah === endSurah && v.ayah <= endAyah);
            if (after && before) {
                allAyahs.push(v);
            }
        }
    }

    state.pageCache[pageNum] = allAyahs;
    return allAyahs;
}

async function renderPageView() {
    const pageNum = state.page;
    const ayahs = await getAyahsForPage(pageNum);

    // Fetch translations for the surahs on this page
    const surahsOnPage = [...new Set(ayahs.map(a => a.surah))];
    const trPromises = surahsOnPage.map(s => fetchTranslationsForSurah(s));
    const trResults = await Promise.all(trPromises);
    const translations = Object.assign({}, ...trResults);

    // Page info: surah name, juz number
    const firstSurah = ayahs[0]?.surah || 1;
    const firstSurahMeta = SURAH_LIST[firstSurah - 1];
    const juzNum = JUZ_STARTS.findIndex(([s, a], i) => {
        const next = JUZ_STARTS[i + 1] || [115, 1];
        const cur = (firstSurah > s) || (firstSurah === s && ayahs[0]?.ayah >= a);
        const nxt = (firstSurah < next[0]) || (firstSurah === next[0] && ayahs[0]?.ayah < next[1]);
        return cur && nxt;
    }) + 1;

    // Group ayahs by surah
    const bySurah = {};
    for (const a of ayahs) {
        if (!bySurah[a.surah]) bySurah[a.surah] = [];
        bySurah[a.surah].push(a);
    }
    const surahNums = Object.keys(bySurah).map(Number).sort((a, b) => a - b);

    // Check if this page should be center-aligned (short surahs look better centered).
    // Rule: if ALL surahs on the page have ≤ 15 total ayahs, center-align the text.
    // This covers Al-Fatihah (1), the short surahs in Juz 30 (93-114), and pages
    // that contain multiple short surahs (like page 604 with 112, 113, 114).
    const isShortSurahPage = surahNums.every(sNum =>
        SURAH_LIST[sNum - 1].total_verses <= 15
    );

    // Build the page HTML with traditional Mushaf structure.
    // IMPORTANT: When a surah starts in the middle of a page (not at the top),
    // we insert a proper decorative surah banner + Bismillah BEFORE the new surah's
    // first ayah. This keeps the Bismillah separate from the ayah text.
    let html = "";

    // Top-of-page info bar: if this page does NOT start with a new surah,
    // show the surah name + juz at the top. If it DOES start with a new surah,
    // we'll show the decorative surah banner instead (handled in the loop below).
    const startsWithNewSurah = ayahs[0].ayah === 1;
    if (!startsWithNewSurah) {
        html += `<div class="page-info-bar">
            <span class="page-info-surah">${escapeHtml(firstSurahMeta?.transliteration || "")}</span>
            <span class="page-info-juz">Juz ${juzNum}</span>
        </div>`;
    }

    // Arabic text flow
    html += `<div class="ayah-text-flow">`;

    for (const sNum of surahNums) {
        const meta = SURAH_LIST[sNum - 1];
        const isFirstSurahOnPage = (sNum === surahNums[0]);

        // If this surah starts on this page (ayah 1) AND it's not Surah 1 or 9,
        // show the decorative surah banner + Bismillah BEFORE the ayah text.
        // This applies whether it's the first surah on the page OR a surah that
        // starts in the middle of the page.
        const showSurahBanner = (bySurah[sNum][0].ayah === 1) && (sNum !== 1) && (sNum !== 9);
        if (showSurahBanner) {
            html += `<div class="surah-banner-decorative">
                <div class="sbd-ornament"></div>
                <div class="sbd-content">
                    <span class="sbd-arabic">${escapeHtml(meta.name)}</span>
                    <span class="sbd-name">${escapeHtml(meta.transliteration)}</span>
                </div>
                <div class="sbd-ornament"></div>
            </div>`;
            html += `<div class="page-bismillah">بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ</div>`;
        } else if (!isFirstSurahOnPage) {
            // New surah on the page but it's Surah 1 or 9 (no Bismillah) — just show separator
            html += `<div class="surah-separator">
                <span class="sep-line"></span>
                <span class="sep-arabic">${escapeHtml(meta.name)}</span>
                <span class="sep-name">${escapeHtml(meta.transliteration)}</span>
                <span class="sep-line"></span>
            </div>`;
        }

        for (const v of bySurah[sNum]) {
            const useTajweed = state.tajweedOn && v.tajweedText;
            const arabicHtml = renderArabicWithWords(
                useTajweed ? v.tajweedText : v.text,
                { tajweedMarkup: useTajweed }
            );
            const ayahMarker = `<span class="ayah-marker" data-surah="${v.surah}" data-ayah="${v.ayah}" title="${meta?.transliteration} ${v.ayah}">${toArabicNum(v.ayah)}</span>`;
            html += `<span class="ayah-flow" data-surah="${v.surah}" data-ayah="${v.ayah}">${arabicHtml}${ayahMarker} </span>`;
        }
    }

    html += `</div>`;

    // Page number at the bottom center (traditional Mushaf style)
    html += `<div class="page-number-footer">
        <div class="page-number-circle">${toArabicNum(pageNum)}</div>
    </div>`;

    el.pageCurrent.innerHTML = html;

    // Apply center-alignment class for short surahs
    el.pageCurrent.classList.toggle("short-surah-page", isShortSurahPage);

    // Update page number label + slider
    el.pageNumLabel.textContent = `Page ${pageNum} of ${TOTAL_PAGES}`;
    el.pageSlider.value = pageNum;

    // Wire click handlers on words and ayah markers
    wireWordClicks(el.pageView);
    wireAyahMarkerClicks(el.pageView);

    if (window.lucide) lucide.createIcons();
}

/* ============================================================
   SURAH VIEW — continuous ayah-by-ayah cards
   ============================================================ */

async function renderSurahView() {
    const surahNum = state.surah;
    const meta = SURAH_LIST[surahNum - 1];

    // Render banner
    el.surahBannerArabic.textContent = meta.name;
    el.surahBannerTitle.textContent = meta.transliteration;
    el.surahBannerMeta.textContent = `${meta.translation} · ${meta.total_verses} Ayahs · ${capitalizeType(meta.type)}`;

    // Bismillah
    if (surahNum !== 1 && surahNum !== 9) {
        el.surahBismillah.hidden = false;
        el.surahBismillah.textContent = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";
    } else {
        el.surahBismillah.hidden = true;
    }

    // Fetch surah data + translations
    const data = await fetchSurahData(surahNum);
    const translations = await fetchTranslationsForSurah(surahNum);

    // Render verse cards
    const versesHtml = data.verses.map(v => {
        const useTajweed = state.tajweedOn && v.tajweedText;
        const arabicHtml = renderArabicWithWords(
            useTajweed ? v.tajweedText : v.text,
            { tajweedMarkup: useTajweed }
        );

        // Build translation blocks
        let translationsHtml = "";
        if (state.displayMode !== "arabic") {
            const ayahTr = translations[v.ayah] || {};
            translationsHtml = state.activeTranslations.map(rid => {
                const t = TRANSLATIONS.find(x => x.id === parseInt(rid));
                const text = ayahTr[rid];
                if (!text) return "";
                return `<div class="verse-translation-block">
                            <span class="vt-lang">${escapeHtml(t?.lang || "")}</span>
                            ${escapeHtml(cleanText(text))}
                        </div>`;
            }).join("");
        }

        const translitHtml = (state.displayMode !== "arabic" && v.translit)
            ? `<div class="verse-translit">${escapeHtml(v.translit)}</div>` : "";

        const arabicDisplay = state.displayMode === "translation" ? "display:none" : "";
        const transDisplay = state.displayMode === "arabic" ? "display:none" : "";

        const isBookmarked = state.bookmarks.some(b => b.surah === v.surah && b.ayah === v.ayah);

        return `
        <article class="verse-card" data-surah="${v.surah}" data-ayah="${v.ayah}">
            <div class="verse-header">
                <div class="verse-number">${v.ayah}</div>
                <div class="verse-actions">
                    <button class="verse-action play-btn" data-surah="${v.surah}" data-ayah="${v.ayah}" title="Play"><i data-lucide="play"></i></button>
                    <button class="verse-action bookmark-btn ${isBookmarked ? "active" : ""}" data-surah="${v.surah}" data-ayah="${v.ayah}" title="Bookmark">
                        <i data-lucide="${isBookmarked ? "bookmark-check" : "bookmark"}"></i>
                    </button>
                    <button class="verse-action tafsir-btn" data-surah="${v.surah}" data-ayah="${v.ayah}" title="Tafsir"><i data-lucide="book-open-text"></i></button>
                    <button class="verse-action translate-btn" data-surah="${v.surah}" data-ayah="${v.ayah}" title="Word-by-word"><i data-lucide="type"></i></button>
                    <button class="verse-action copy-btn" data-surah="${v.surah}" data-ayah="${v.ayah}" title="Copy"><i data-lucide="copy"></i></button>
                    <button class="verse-action share-btn" data-surah="${v.surah}" data-ayah="${v.ayah}" title="Share"><i data-lucide="share-2"></i></button>
                </div>
            </div>
            <div class="verse-arabic" style="${arabicDisplay};font-size:${state.arabicFont}rem">${arabicHtml}</div>
            ${translitHtml}
            <div class="verse-translations" style="${transDisplay}">${translationsHtml}</div>
        </article>`;
    }).join("");

    el.surahVerses.innerHTML = versesHtml;

    // Wire clicks
    wireWordClicks(el.surahView);
    wireVerseActions(el.surahView);

    if (window.lucide) lucide.createIcons();
}

/* ============================================================
   WIRE WORD CLICKS (word-by-word modal)
   ============================================================ */

function wireWordClicks(rootEl) {
    rootEl.querySelectorAll(".word").forEach(w => {
        w.addEventListener("click", async (e) => {
            e.stopPropagation();
            // Find the parent ayah-flow or verse-card
            const card = w.closest("[data-surah][data-ayah]");
            if (!card) return;
            const surah = parseInt(card.dataset.surah);
            const ayah = parseInt(card.dataset.ayah);
            const wordIdx = parseInt(w.dataset.w);
            await openWordModal(surah, ayah, wordIdx);
        });
    });
}

async function openWordModal(surah, ayah, wordIdx) {
    el.wordModalOverlay.hidden = false;
    // Loading state — use a CSS spinner (no dependency on lucide icons loading)
    el.wordModalBody.innerHTML = `
        <div style="margin: 1.5rem auto 1rem; width: 40px; height: 40px; border: 3px solid rgba(var(--mushaf-accent-rgb), 0.2); border-top-color: var(--mushaf-accent); border-radius: 50%; animation: spin 0.9s linear infinite;"></div>
        <p style="color: var(--mushaf-subtext); font-size: 0.9rem; margin: 0;">Loading word…</p>`;
    el.wordModalNav.hidden = true;

    try {
        const words = await fetchWordByWord(surah, ayah);
        if (!words.length) {
            el.wordModalBody.innerHTML = `
                <div class="wm-arabic" style="opacity:0.4">—</div>
                <p class="wm-translation" style="color:#f87171">Word-by-word data not available for this ayah.</p>
                <p style="color: var(--mushaf-subtext); font-size: 0.8rem; margin-top: 0.5rem;">
                    Surah ${surah} : ${ayah}
                </p>`;
            el.wordModalNav.hidden = true;
            return;
        }

        state.wordModalContext = { surah, ayah, words, wordIdx: Math.min(wordIdx, words.length - 1) };
        renderWordModalWord();
        el.wordModalNav.hidden = words.length <= 1;
    } catch (err) {
        console.error("openWordModal failed:", err);
        el.wordModalBody.innerHTML = `
            <div class="wm-arabic" style="opacity:0.4">—</div>
            <p class="wm-translation" style="color:#f87171">Could not load word data.</p>
            <p style="color: var(--mushaf-subtext); font-size: 0.8rem; margin-top: 0.5rem;">
                ${escapeHtml(err?.message || "Unknown error")}
            </p>`;
        el.wordModalNav.hidden = true;
    }
}

function renderWordModalWord() {
    const ctx = state.wordModalContext;
    if (!ctx) return;
    const word = ctx.words[ctx.wordIdx];
    if (!word) return;

    try {
        const meta = SURAH_LIST[ctx.surah - 1];
        const arabicText = word.text || "—";
        const translitText = word.transliteration || "";
        const translationText = word.translation || "—";

        el.wordModalBody.innerHTML = `
            <div class="wm-arabic">${escapeHtml(arabicText)}</div>
            ${translitText ? `<div class="wm-translit">${escapeHtml(translitText)}</div>` : ""}
            <div class="wm-translation">${escapeHtml(translationText)}</div>
            <div class="wm-meta">
                <span class="wm-chip">Word<strong>${ctx.wordIdx + 1}/${ctx.words.length}</strong></span>
                <span class="wm-chip">${escapeHtml(meta?.transliteration || "")}<strong>${ctx.ayah}</strong></span>
            </div>`;

        // Update nav button states
        el.wordPrev.disabled = ctx.wordIdx === 0;
        el.wordNext.disabled = ctx.wordIdx === ctx.words.length - 1;
        el.wordPrev.style.opacity = ctx.wordIdx === 0 ? 0.4 : 1;
        el.wordNext.style.opacity = ctx.wordIdx === ctx.words.length - 1 ? 0.4 : 1;
    } catch (err) {
        console.error("renderWordModalWord failed:", err);
        el.wordModalBody.innerHTML = `
            <div class="wm-arabic" style="opacity:0.4">—</div>
            <p class="wm-translation" style="color:#f87171">Error rendering word.</p>`;
    }
}

el.wordModalClose?.addEventListener("click", () => {
    el.wordModalOverlay.hidden = true;
    state.wordModalContext = null;
});
el.wordPrev?.addEventListener("click", () => {
    if (state.wordModalContext && state.wordModalContext.wordIdx > 0) {
        state.wordModalContext.wordIdx--;
        renderWordModalWord();
    }
});
el.wordNext?.addEventListener("click", () => {
    if (state.wordModalContext && state.wordModalContext.wordIdx < state.wordModalContext.words.length - 1) {
        state.wordModalContext.wordIdx++;
        renderWordModalWord();
    }
});
el.wordModalOverlay?.addEventListener("click", (e) => {
    if (e.target === el.wordModalOverlay) {
        el.wordModalOverlay.hidden = true;
        state.wordModalContext = null;
    }
});

/* ============================================================
   WIRE AYAH MARKER CLICKS (page view)
   ============================================================ */

function wireAyahMarkerClicks(rootEl) {
    rootEl.querySelectorAll(".ayah-marker").forEach(m => {
        m.addEventListener("click", (e) => {
            e.stopPropagation();
            const surah = parseInt(m.dataset.surah);
            const ayah = parseInt(m.dataset.ayah);
            showAyahPopover(surah, ayah, m);
        });
    });
}

/* ============================================================
   AYAH POPOVER (mobile-friendly actions)
   ============================================================ */

function showAyahPopover(surah, ayah, anchorEl) {
    const meta = SURAH_LIST[surah - 1];
    el.ayahPopoverRef.textContent = `${meta?.transliteration || "Surah"} : ${ayah}`;
    el.ayahPopover.hidden = false;
    el.ayahPopoverBody.innerHTML = `
        <button class="popover-action play-btn" data-surah="${surah}" data-ayah="${ayah}">
            <i data-lucide="play"></i> Play
        </button>
        <button class="popover-action bookmark-btn" data-surah="${surah}" data-ayah="${ayah}">
            <i data-lucide="bookmark"></i> Save
        </button>
        <button class="popover-action tafsir-btn" data-surah="${surah}" data-ayah="${ayah}">
            <i data-lucide="book-open-text"></i> Tafsir
        </button>
        <button class="popover-action translate-btn" data-surah="${surah}" data-ayah="${ayah}">
            <i data-lucide="type"></i> Words
        </button>
        <button class="popover-action copy-btn" data-surah="${surah}" data-ayah="${ayah}">
            <i data-lucide="copy"></i> Copy
        </button>
        <button class="popover-action share-btn" data-surah="${surah}" data-ayah="${ayah}">
            <i data-lucide="share-2"></i> Share
        </button>
        <div class="popover-translations" id="popover-translations">
            <div class="popover-translations-loading">Loading translations…</div>
        </div>`;
    if (window.lucide) lucide.createIcons();

    // Wire action buttons
    el.ayahPopoverBody.querySelectorAll(".popover-action").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();  // Prevent click-outside handler from closing drawers
            handleVerseAction(btn, surah, ayah);
            // Close the popover after any action (tafsir/words open their own panels)
            el.ayahPopover.hidden = true;
        });
    });

    // Load translations for this ayah and show them in the popover
    loadPopoverTranslations(surah, ayah);
}

// Load translations for the popover (used in page view since there's no surah view)
async function loadPopoverTranslations(surah, ayah) {
    const container = document.getElementById("popover-translations");
    if (!container) return;

    try {
        const translations = await fetchTranslationsForSurah(surah);
        const ayahTr = translations[ayah] || {};

        if (!state.activeTranslations.length) {
            container.innerHTML = `<div class="popover-translations-empty">No translations selected. Click "Translations" in toolbar to pick one.</div>`;
            return;
        }

        const html = state.activeTranslations.map(rid => {
            const t = TRANSLATIONS.find(x => x.id === parseInt(rid));
            const text = ayahTr[rid];
            if (!text) return "";
            return `<div class="popover-translation-block">
                        <span class="vt-lang">${escapeHtml(t?.lang || "")}</span>
                        ${escapeHtml(cleanText(text))}
                    </div>`;
        }).join("");

        container.innerHTML = html || `<div class="popover-translations-empty">No translation available for this ayah.</div>`;
    } catch (e) {
        container.innerHTML = `<div class="popover-translations-empty">Could not load translations.</div>`;
    }
}

el.ayahPopoverClose?.addEventListener("click", () => el.ayahPopover.hidden = true);

/* ============================================================
   WIRE VERSE ACTIONS (surah view)
   ============================================================ */

function wireVerseActions(rootEl) {
    rootEl.querySelectorAll(".verse-action").forEach(btn => {
        btn.addEventListener("click", () => {
            const surah = parseInt(btn.dataset.surah);
            const ayah = parseInt(btn.dataset.ayah);
            handleVerseAction(btn, surah, ayah);
        });
    });
}

async function handleVerseAction(btn, surah, ayah) {
    const meta = SURAH_LIST[surah - 1];
    const card = btn.closest("[data-surah][data-ayah]") || document.querySelector(`.verse-card[data-surah="${surah}"][data-ayah="${ayah}"]`);

    if (btn.classList.contains("play-btn")) {
        playAyah(surah, ayah);
    }
    else if (btn.classList.contains("bookmark-btn")) {
        toggleBookmark({
            surah, ayah,
            surahName: meta?.transliteration || "Surah",
            arabic: card?.querySelector(".verse-arabic")?.innerText || "",
            translation: card?.querySelector(".verse-translation-block")?.innerText || "",
            savedAt: Date.now()
        });
        const isNow = state.bookmarks.some(b => b.surah === surah && b.ayah === ayah);
        btn.classList.toggle("active", isNow);
        btn.innerHTML = `<i data-lucide="${isNow ? "bookmark-check" : "bookmark"}"></i>`;
        if (window.lucide) lucide.createIcons();
        showToast(isNow ? "Verse bookmarked ✓" : "Bookmark removed");
    }
    else if (btn.classList.contains("tafsir-btn")) {
        loadTafsirInDrawer(surah, ayah);
    }
    else if (btn.classList.contains("translate-btn")) {
        openWordModal(surah, ayah, 0);
    }
    else if (btn.classList.contains("copy-btn")) {
        const arabic = card?.querySelector(".verse-arabic")?.innerText || "";
        const translit = card?.querySelector(".verse-translit")?.innerText || "";
        const trans = card?.querySelector(".verse-translation-block")?.innerText || "";
        const text = `${arabic}\n${translit}\n\n${trans}\n\n— ${meta?.transliteration} ${ayah}`;
        try {
            await navigator.clipboard.writeText(text);
            showToast("Verse copied ✓");
        } catch { showToast("Copy failed"); }
    }
    else if (btn.classList.contains("share-btn")) {
        const arabic = card?.querySelector(".verse-arabic")?.innerText || "";
        const trans = card?.querySelector(".verse-translation-block")?.innerText || "";
        const text = `${arabic}\n\n${trans}\n\n— ${meta?.transliteration} ${ayah}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: "Qur'an Verse", text });
                showToast("Shared ✓");
            } else {
                await navigator.clipboard.writeText(text);
                showToast("Copied to clipboard");
            }
        } catch { showToast("Share cancelled"); }
    }
}

/* ============================================================
   BOOKMARKS
   ============================================================ */

function toggleBookmark(entry) {
    const idx = state.bookmarks.findIndex(b => b.surah === entry.surah && b.ayah === entry.ayah);
    if (idx >= 0) {
        state.bookmarks.splice(idx, 1);
    } else {
        state.bookmarks.unshift(entry);
    }
    persistState();
    renderBookmarks();
    updateBookmarkCount();
}

function renderBookmarks() {
    if (!state.bookmarks.length) {
        el.bookmarksList.innerHTML = `
            <div class="bookmarks-empty">
                <i data-lucide="bookmark"></i>
                <p>No bookmarks yet. Tap the bookmark icon on any verse to save it here.</p>
            </div>`;
        if (window.lucide) lucide.createIcons();
        return;
    }
    el.bookmarksList.innerHTML = state.bookmarks.map(b => `
        <div class="bookmark-item" data-surah="${b.surah}" data-ayah="${b.ayah}">
            <div class="bookmark-item-meta">
                <span class="bookmark-tag">${escapeHtml(b.surahName)} · Ayah ${b.ayah}</span>
                <span class="bookmark-date">${new Date(b.savedAt || Date.now()).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
            </div>
            <div class="bookmark-arabic">${escapeHtml(b.arabic || "")}</div>
            <div class="bookmark-translation">${escapeHtml((b.translation || "").slice(0, 150))}${(b.translation || "").length > 150 ? "…" : ""}</div>
        </div>`).join("");

    el.bookmarksList.querySelectorAll(".bookmark-item").forEach(item => {
        item.addEventListener("click", () => {
            const surah = parseInt(item.dataset.surah);
            const ayah = parseInt(item.dataset.ayah);
            // Switch to surah view and scroll to that ayah
            state.view = "surah";
            state.surah = surah;
            persistState();
            render().then(() => {
                setTimeout(() => {
                    const card = document.querySelector(`.verse-card[data-surah="${surah}"][data-ayah="${ayah}"]`);
                    if (card) {
                        card.scrollIntoView({ behavior: "smooth", block: "center" });
                        card.classList.add("active-ayah");
                        setTimeout(() => card.classList.remove("active-ayah"), 2000);
                    }
                    closeAllDrawers();
                }, 400);
            });
        });
    });
}

function updateBookmarkCount() {
    const n = state.bookmarks.length;
    el.bookmarkCount.textContent = String(n);
    el.bookmarksCount.textContent = `${n} saved`;
}

el.bookmarksClearBtn?.addEventListener("click", () => {
    if (!state.bookmarks.length || !confirm("Remove all bookmarks?")) return;
    state.bookmarks = [];
    persistState();
    renderBookmarks();
    updateBookmarkCount();
    showToast("All bookmarks cleared");
});

/* ============================================================
   TRANSLATIONS DRAWER
   ============================================================ */

function renderTranslationList() {
    el.translationList.innerHTML = TRANSLATIONS.map(t => {
        const active = state.activeTranslations.includes(String(t.id));
        return `
        <div class="translation-item ${active ? "active" : ""}" data-id="${t.id}">
            <div class="translation-checkbox">
                ${active ? '<i data-lucide="check" style="width:14px;height:14px"></i>' : ''}
            </div>
            <div class="translation-info">
                <div class="translation-name">${escapeHtml(t.name)}</div>
                <div class="translation-author">${escapeHtml(t.lang)} · ${escapeHtml(t.author)}</div>
            </div>
        </div>`;
    }).join("");
    if (window.lucide) lucide.createIcons();

    el.translationList.querySelectorAll(".translation-item").forEach(item => {
        item.addEventListener("click", () => {
            const id = String(item.dataset.id);
            const idx = state.activeTranslations.indexOf(id);
            if (idx >= 0) {
                if (state.activeTranslations.length <= 1) {
                    showToast("Keep at least one translation");
                    return;
                }
                state.activeTranslations.splice(idx, 1);
            } else {
                state.activeTranslations.push(id);
            }
            persistState();
            renderTranslationList();
            // Invalidate translation cache for current surah
            Object.keys(state.surahCache).forEach(k => {
                if (k.startsWith("tr_")) delete state.surahCache[k];
            });
            render();
        });
    });
}

/* ============================================================
   RECITER DRAWER
   ============================================================ */

function renderReciterList(query) {
    const q = (query || "").toLowerCase();
    const list = q
        ? RECITERS.filter(r => r.name.toLowerCase().includes(q) || (r.country || "").toLowerCase().includes(q))
        : RECITERS;

    el.reciterList.innerHTML = list.map(r => `
        <div class="reciter-item ${r.id === state.reciterId ? "active" : ""}" data-id="${r.id}">
            <div class="reciter-avatar"><i data-lucide="mic"></i></div>
            <div class="reciter-info">
                <div class="reciter-name">${escapeHtml(r.name)}</div>
                <div class="reciter-country">${escapeHtml(r.country || "")}</div>
            </div>
            <div class="reciter-check"><i data-lucide="check"></i></div>
        </div>`).join("") || `<p style="text-align:center;color:var(--mushaf-subtext);padding:2rem">No reciters found</p>`;
    if (window.lucide) lucide.createIcons();

    el.reciterList.querySelectorAll(".reciter-item").forEach(item => {
        item.addEventListener("click", () => {
            state.reciterId = item.dataset.id;
            const reciter = RECITERS.find(r => r.id === state.reciterId);
            // Show full reciter name (not just first word) so users can distinguish them
            el.reciterIndicator.textContent = reciter ? reciter.name : "—";
            // Truncate if too long for the toolbar
            if (reciter && reciter.name.length > 20) {
                el.reciterIndicator.textContent = reciter.name.substring(0, 18) + "…";
            }
            persistState();
            renderReciterList(el.reciterSearch.value);
            // If audio is currently playing, reload with new reciter
            if (state.currentAyahAudio && !el.ayahAudio.paused) {
                const wasPlaying = true;
                const { surah, ayah } = state.currentAyahAudio;
                el.ayahAudio.src = API.ayahAudio(surah, ayah, state.reciterId);
                el.ayahAudio.load();
                if (wasPlaying) el.ayahAudio.play().catch(() => { });
            }
            showToast(`Reciter: ${reciter?.name}`);
        });
    });
}

el.reciterSearch?.addEventListener("input", e => renderReciterList(e.target.value));

/* ============================================================
   TAFSIR DRAWER
   ============================================================ */

async function loadTafsirInDrawer(surah, ayah) {
    openDrawer("tafsir-drawer");
    const meta = SURAH_LIST[surah - 1];

    // Try to get the verse's Arabic text from cache
    let arabicText = "";
    if (state.surahCache[surah]) {
        const v = state.surahCache[surah].verses.find(x => x.ayah === ayah);
        if (v) arabicText = v.text;
    }
    if (!arabicText) {
        // Quick fetch
        try {
            const data = await fetchSurahData(surah);
            const v = data.verses.find(x => x.ayah === ayah);
            if (v) arabicText = v.text;
        } catch (e) { }
    }

    el.tafsirContent.innerHTML = `
        <div class="tafsir-verse-head">
            <div class="tv-arabic">${escapeHtml(arabicText || "")}</div>
            <div class="tv-ref">${escapeHtml(meta?.transliteration || "")} · Ayah ${ayah}</div>
        </div>
        <div class="tafsir-loading">
            <i data-lucide="loader-2" class="spin"></i> Loading ${state.tafsirSource === "jalalayn" ? "Jalalayn (Arabic)" :
            state.tafsirSource === "maarif" ? "Ma'arif-ul-Quran" :
                "Ibn Kathir"
        } tafsir…
        </div>`;
    if (window.lucide) lucide.createIcons();

    const text = await fetchTafsir(surah, ayah, state.tafsirSource);
    const isArabic = state.tafsirSource === "jalalayn";
    const textDir = isArabic ? 'dir="rtl"' : "";
    const textClass = isArabic ? 'tafsir-content-arabic' : 'tafsir-content-english';
    el.tafsirContent.innerHTML = `
        <div class="tafsir-verse-head">
            <div class="tv-arabic">${escapeHtml(arabicText || "")}</div>
            <div class="tv-ref">${escapeHtml(meta?.transliteration || "")} · Ayah ${ayah}</div>
        </div>
        <div class="${textClass}" ${textDir}>${escapeHtml(text).replace(/\n\n/g, "</p><p>").replace(/^/, "<p>").replace(/$/, "</p>")}</div>`;
}

// Tafsir source tabs
document.querySelectorAll(".tafsir-tab").forEach(tab => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".tafsir-tab").forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        state.tafsirSource = tab.dataset.source;
        // Re-load if a verse is currently shown
        const ref = el.tafsirContent.querySelector(".tv-ref")?.textContent || "";
        const match = ref.match(/Ayah\s+(\d+)/);
        if (match) {
            // Find surah from page/surah state
            const surah = state.view === "surah" ? state.surah : (state.pageCache[state.page]?.[0]?.surah || 1);
            loadTafsirInDrawer(surah, parseInt(match[1]));
        }
    });
});

/* ============================================================
   AUDIO
   ============================================================ */

function playAyah(surah, ayah) {
    // If the SAME ayah is currently playing, toggle pause/resume
    if (state.currentAyahAudio &&
        state.currentAyahAudio.surah === surah &&
        state.currentAyahAudio.ayah === ayah) {
        if (el.ayahAudio.paused) {
            el.ayahAudio.play().catch(() => { });
            state.isPlaying = true;
            updatePlayButtonIcon(surah, ayah, true);
        } else {
            el.ayahAudio.pause();
            state.isPlaying = false;
            updatePlayButtonIcon(surah, ayah, false);
        }
        return;
    }

    // Different ayah — stop current and start new one
    state.currentAyahAudio = { surah, ayah };
    const url = API.ayahAudio(surah, ayah, state.reciterId);
    el.ayahAudio.src = url;
    el.ayahAudio.play().then(() => {
        state.isPlaying = true;
        el.floatingPlayer.hidden = false;
        updateMiniPlayer(surah, ayah);
        el.miniPlay.innerHTML = `<i data-lucide="pause"></i>`;
        // Highlight verse card and update play button icon
        document.querySelectorAll(".verse-card").forEach(c => c.classList.remove("active-ayah"));
        const card = document.querySelector(`.verse-card[data-surah="${surah}"][data-ayah="${ayah}"]`);
        if (card) card.classList.add("active-ayah");
        updatePlayButtonIcon(surah, ayah, true);
        if (window.lucide) lucide.createIcons();
    }).catch(err => {
        console.error("Audio play failed:", err);
        showToast("Could not play audio. Try another reciter.");
    });
}

// Update the play/pause icon on a specific verse's play button
function updatePlayButtonIcon(surah, ayah, isPlaying) {
    // Update all play buttons — reset to play icon
    document.querySelectorAll(".verse-action.play-btn").forEach(btn => {
        const bSurah = parseInt(btn.dataset.surah);
        const bAyah = parseInt(btn.dataset.ayah);
        if (bSurah === surah && bAyah === ayah) {
            btn.innerHTML = `<i data-lucide="${isPlaying ? "pause" : "play"}"></i>`;
            btn.classList.toggle("active", isPlaying);
        } else {
            btn.innerHTML = `<i data-lucide="play"></i>`;
            btn.classList.remove("active");
        }
    });
    // Also update ayah markers in page view
    document.querySelectorAll(".ayah-marker").forEach(m => {
        const mSurah = parseInt(m.dataset.surah);
        const mAyah = parseInt(m.dataset.ayah);
        m.classList.toggle("playing", isPlaying && mSurah === surah && mAyah === ayah);
    });
    if (window.lucide) lucide.createIcons();
}

function updateMiniPlayer(surah, ayah) {
    const meta = SURAH_LIST[surah - 1];
    el.floatingSurah.textContent = meta?.transliteration || `Surah ${surah}`;
    el.floatingAyah.textContent = `Ayah ${ayah}`;
}

el.ayahAudio.addEventListener("timeupdate", () => {
    if (!el.ayahAudio.duration) return;
    const pct = (el.ayahAudio.currentTime / el.ayahAudio.duration) * 100;
    el.miniProgress.value = pct;
    el.miniTime.textContent = `${formatTime(el.ayahAudio.currentTime)} / ${formatTime(el.ayahAudio.duration)}`;
});

el.ayahAudio.addEventListener("ended", () => {
    // Play ONLY this verse — no auto-advance.
    // Reset state and UI to "stopped" so the user can click another verse.
    state.isPlaying = false;
    if (state.currentAyahAudio) {
        const { surah, ayah } = state.currentAyahAudio;
        updatePlayButtonIcon(surah, ayah, false);
    }
    el.miniPlay.innerHTML = `<i data-lucide="play"></i>`;
    // Keep floating player visible (so user can replay) but show play icon
    if (window.lucide) lucide.createIcons();
});

el.miniPlay?.addEventListener("click", () => {
    if (el.ayahAudio.paused) {
        el.ayahAudio.play().catch(() => { });
        el.miniPlay.innerHTML = `<i data-lucide="pause"></i>`;
        state.isPlaying = true;
    } else {
        el.ayahAudio.pause();
        el.miniPlay.innerHTML = `<i data-lucide="play"></i>`;
        state.isPlaying = false;
    }
    if (window.lucide) lucide.createIcons();
});

el.miniPrev?.addEventListener("click", () => {
    if (!state.currentAyahAudio) return;
    const { surah, ayah } = state.currentAyahAudio;
    let prevSurah = surah, prevAyah = ayah - 1;
    if (prevAyah < 1) {
        if (surah > 1) {
            prevSurah = surah - 1;
            prevAyah = SURAH_LIST[prevSurah - 1].total_verses;
        } else { return; }
    }
    playAyah(prevSurah, prevAyah);
});

el.miniNext?.addEventListener("click", () => {
    if (!state.currentAyahAudio) return;
    const { surah, ayah } = state.currentAyahAudio;
    const meta = SURAH_LIST[surah - 1];
    // Next ayah within same surah; don't cross surah boundaries
    if (ayah < meta.total_verses) {
        playAyah(surah, ayah + 1);
    } else if (surah < 114) {
        // Last ayah of surah — go to next surah ayah 1
        playAyah(surah + 1, 1);
    }
});

el.miniRepeat?.addEventListener("click", () => {
    if (!el.ayahAudio.src) return;
    el.ayahAudio.currentTime = 0;
    el.ayahAudio.play().catch(() => { });
});

el.miniProgress?.addEventListener("input", () => {
    if (el.ayahAudio.duration) {
        el.ayahAudio.currentTime = (el.miniProgress.value / 100) * el.ayahAudio.duration;
    }
});

/* ============================================================
   NAVIGATOR (surah/juz/page dropdown)
   ============================================================ */

let navTab = "surah";

function renderNavList(tab) {
    navTab = tab;
    document.querySelectorAll(".nav-tab").forEach(t => {
        t.classList.toggle("active", t.dataset.tab === tab);
    });

    let items = [];
    if (tab === "surah") {
        items = SURAH_LIST.map(s => ({
            id: s.id,
            num: s.id,
            name: s.transliteration,
            meta: `${s.total_verses} ayahs · ${capitalizeType(s.type)}`,
            arabic: s.name
        }));
        el.navSearchInput.placeholder = "Search surah name…";
    } else if (tab === "juz") {
        items = Array.from({ length: 30 }, (_, i) => {
            const j = i + 1;
            const [s, a] = JUZ_STARTS[i];
            const meta = SURAH_LIST[s - 1];
            return {
                id: j,
                num: j,
                name: `Juz ${j}`,
                meta: `Starts at ${meta?.transliteration} ${a}`,
                arabic: ""
            };
        });
        el.navSearchInput.placeholder = "Search juz…";
    } else { // page
        items = Array.from({ length: TOTAL_PAGES }, (_, i) => {
            const p = i + 1;
            const [s, a] = PAGE_STARTS[i];
            const meta = SURAH_LIST[s - 1];
            return {
                id: p,
                num: p,
                name: `Page ${p}`,
                meta: `${meta?.transliteration} ${a}`,
                arabic: ""
            };
        });
        el.navSearchInput.placeholder = "Search page…";
    }

    renderNavListItems(items);
}

function renderNavListItems(items) {
    if (!items.length) {
        el.navList.innerHTML = `<p style="text-align:center;color:var(--mushaf-subtext);padding:1rem">No matches</p>`;
        return;
    }
    el.navList.innerHTML = items.slice(0, 200).map(item => {
        let isActive = false;
        if (navTab === "surah") isActive = item.id === state.surah;
        else if (navTab === "juz") {
            const [s, a] = JUZ_STARTS[item.id - 1];
            isActive = state.surah === s;
        } else if (navTab === "page") isActive = item.id === state.page;
        return `
        <div class="nav-list-item ${isActive ? "active" : ""}" data-id="${item.id}">
            <div class="nav-list-num">${item.num}</div>
            <div class="nav-list-info">
                <div class="nav-list-name">${escapeHtml(item.name)}</div>
                <div class="nav-list-meta">${escapeHtml(item.meta)}</div>
            </div>
            ${item.arabic ? `<div class="nav-list-arabic">${escapeHtml(item.arabic)}</div>` : ""}
        </div>`;
    }).join("");

    el.navList.querySelectorAll(".nav-list-item").forEach(it => {
        it.addEventListener("click", () => {
            const id = parseInt(it.dataset.id);
            if (navTab === "surah") {
                // Sort by Surah → go to the PAGE where this surah starts
                state.view = "page";
                state.surah = id;
                state.page = findPageNumber(id, 1);
            } else if (navTab === "juz") {
                const [s, a] = JUZ_STARTS[id - 1];
                state.view = "page";
                state.page = findPageNumber(s, a);
            } else if (navTab === "page") {
                state.view = "page";
                state.page = id;
            }
            persistState();
            el.navDropdown.hidden = true;
            render();
        });
    });
}

el.navSearchInput?.addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    let items = [];
    if (navTab === "surah") {
        items = SURAH_LIST.filter(s =>
            s.transliteration.toLowerCase().includes(q) ||
            s.translation.toLowerCase().includes(q) ||
            s.name.includes(q) ||
            String(s.id) === q
        ).map(s => ({
            id: s.id, num: s.id, name: s.transliteration,
            meta: `${s.total_verses} ayahs · ${capitalizeType(s.type)}`, arabic: s.name
        }));
    } else if (navTab === "juz") {
        items = Array.from({ length: 30 }, (_, i) => {
            const j = i + 1;
            const [s, a] = JUZ_STARTS[i];
            const meta = SURAH_LIST[s - 1];
            return { id: j, num: j, name: `Juz ${j}`, meta: `Starts at ${meta?.transliteration} ${a}`, arabic: "" };
        }).filter(j => String(j.id) === q || j.name.toLowerCase().includes(q));
    } else {
        items = Array.from({ length: TOTAL_PAGES }, (_, i) => {
            const p = i + 1;
            const [s, a] = PAGE_STARTS[i];
            const meta = SURAH_LIST[s - 1];
            return { id: p, num: p, name: `Page ${p}`, meta: `${meta?.transliteration} ${a}`, arabic: "" };
        }).filter(p => String(p.id) === q || p.name.toLowerCase().includes(q) || p.meta.toLowerCase().includes(q));
    }
    renderNavListItems(items);
});

document.querySelectorAll(".nav-tab").forEach(t => {
    t.addEventListener("click", () => {
        renderNavList(t.dataset.tab);
        el.navSearchInput.value = "";
        el.navSearchInput.focus();
    });
});

el.navSelectorBtn?.addEventListener("click", e => {
    e.stopPropagation();
    el.navDropdown.hidden = !el.navDropdown.hidden;
    if (!el.navDropdown.hidden) {
        // Show the tab matching the current view
        renderNavList(state.view === "page" ? "page" : "surah");
        setTimeout(() => el.navSearchInput.focus(), 50);
    }
});

document.addEventListener("click", e => {
    if (!el.navDropdown.hidden && !el.navDropdown.contains(e.target) && e.target !== el.navSelectorBtn) {
        el.navDropdown.hidden = true;
    }
});

function updateNavLabel() {
    if (state.view === "page") {
        const [s] = PAGE_STARTS[state.page - 1];
        const meta = SURAH_LIST[s - 1];
        el.navSelectorLabel.textContent = `Page ${state.page} · ${meta?.transliteration || ""}`;
    } else {
        const meta = SURAH_LIST[state.surah - 1];
        el.navSelectorLabel.textContent = `${meta?.transliteration || "Surah"} · ${meta?.total_verses || ""} ayahs`;
    }
}

el.navPrev?.addEventListener("click", () => {
    if (state.view === "page") {
        if (state.page > 1) {
            state.page--;
            persistState();
            render();
        }
    } else {
        if (state.surah > 1) {
            state.surah--;
            persistState();
            render();
        }
    }
});

el.navNext?.addEventListener("click", () => {
    if (state.view === "page") {
        if (state.page < TOTAL_PAGES) {
            state.page++;
            persistState();
            render();
        }
    } else {
        if (state.surah < 114) {
            state.surah++;
            persistState();
            render();
        }
    }
});

el.pageSlider?.addEventListener("input", () => {
    // Throttle by only changing on commit (change event)
});
el.pageSlider?.addEventListener("change", () => {
    state.page = parseInt(el.pageSlider.value);
    state.view = "page";
    persistState();
    render();
});

/* ============================================================
   SWIPE NAVIGATION (touch gestures for page flipping)
   ============================================================ */

let touchStartX = 0;
let touchStartY = 0;
let touchEndX = 0;
let touchEndY = 0;

el.pageContainer?.addEventListener("touchstart", e => {
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

el.pageContainer?.addEventListener("touchend", e => {
    touchEndX = e.changedTouches[0].screenX;
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

function handleSwipe() {
    const deltaX = touchEndX - touchStartX;
    const deltaY = touchEndY - touchStartY;
    // Only trigger if horizontal swipe is dominant and > 50px
    if (Math.abs(deltaX) < 50 || Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX > 0) {
        // Swiped right → go to previous page (like flipping right in a book)
        // In RTL: previous page = higher page number? No — in the Mushaf, you flip
        // right-to-left, so swiping RIGHT goes to the PREVIOUS page.
        if (state.page > 1) {
            state.page--;
            persistState();
            render();
        }
    } else {
        // Swiped left → go to next page
        if (state.page < TOTAL_PAGES) {
            state.page++;
            persistState();
            render();
        }
    }
}

// Also add click-to-navigate on left/right halves of the page (desktop)
el.pageContainer?.addEventListener("click", e => {
    // Don't intercept clicks on words or ayah markers
    if (e.target.closest(".word") || e.target.closest(".ayah-marker")) return;
    const rect = el.pageContainer.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const halfWidth = rect.width / 2;
    // In RTL: clicking the RIGHT half → previous page; LEFT half → next page
    if (clickX > halfWidth && state.page > 1) {
        state.page--;
        persistState();
        render();
    } else if (clickX <= halfWidth && state.page < TOTAL_PAGES) {
        state.page++;
        persistState();
        render();
    }
});

/* ============================================================
   VIEW TOGGLE — removed per user request.
   Page view is the only mode. Surah view HTML element is kept
   hidden so existing JS refs don't error.
   ============================================================ */

/* ============================================================
   DRAWERS OPEN/CLOSE
   ============================================================ */

function openDrawer(id) {
    closeAllDrawers();
    document.getElementById(id).classList.add("open");
}

function closeAllDrawers() {
    document.querySelectorAll(".side-drawer").forEach(d => d.classList.remove("open"));
}

document.querySelectorAll(".drawer-close").forEach(btn => {
    btn.addEventListener("click", () => {
        const id = btn.dataset.drawer;
        if (id) document.getElementById(id).classList.remove("open");
    });
});

// Click outside any open drawer closes it
document.addEventListener("click", e => {
    const openDrawers = document.querySelectorAll(".side-drawer.open");
    if (!openDrawers.length) return;
    // If the click is NOT inside a drawer, NOT on a tool button, AND NOT inside
    // the ayah popover, close all drawers. The popover check is important because
    // clicking "Tafsir" or "Words" in the popover opens a drawer, and we don't
    // want the same click to immediately close it.
    const isInsideDrawer = e.target.closest(".side-drawer");
    const isToolButton = e.target.closest(".tool-btn");
    const isInsidePopover = e.target.closest(".ayah-popover");
    if (!isInsideDrawer && !isToolButton && !isInsidePopover) {
        closeAllDrawers();
    }
});

// Press Escape closes all drawers (in addition to other modals)
document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
        const openDrawers = document.querySelectorAll(".side-drawer.open");
        if (openDrawers.length) {
            closeAllDrawers();
        }
    }
});

el.translationsTool?.addEventListener("click", () => {
    if (el.translationsDrawer.classList.contains("open")) {
        el.translationsDrawer.classList.remove("open");
    } else {
        openDrawer("translations-drawer");
    }
});

el.reciterTool?.addEventListener("click", () => {
    if (el.reciterDrawer.classList.contains("open")) {
        el.reciterDrawer.classList.remove("open");
    } else {
        openDrawer("reciter-drawer");
    }
});

el.settingsTool?.addEventListener("click", () => {
    if (el.settingsDrawer.classList.contains("open")) {
        el.settingsDrawer.classList.remove("open");
    } else {
        openDrawer("settings-drawer");
    }
});

el.bookmarksToolBtn?.addEventListener("click", () => {
    if (el.bookmarksDrawer.classList.contains("open")) {
        el.bookmarksDrawer.classList.remove("open");
    } else {
        openDrawer("bookmarks-drawer");
    }
});

el.tajweedTool?.addEventListener("click", () => {
    state.tajweedOn = !state.tajweedOn;
    el.readArea.classList.toggle("tajweed-off", !state.tajweedOn);
    el.tajweedIndicator.textContent = state.tajweedOn ? "On" : "Off";
    el.tajweedIndicator.classList.toggle("active", state.tajweedOn);
    el.tajweedTool.classList.toggle("active", state.tajweedOn);
    document.getElementById("tajweed-on").classList.toggle("active", state.tajweedOn);
    document.getElementById("tajweed-off").classList.toggle("active", !state.tajweedOn);
    persistState();
    render();
    showToast(`Tajweed ${state.tajweedOn ? "on" : "off"}`);
});

/* ============================================================
   SETTINGS DRAWER interactions
   ============================================================ */

document.querySelectorAll(".theme-swatch").forEach(s => {
    s.addEventListener("click", () => applyTheme(s.dataset.theme));
});

document.getElementById("font-increase")?.addEventListener("click", () => {
    state.arabicFont = Math.min(4.5, state.arabicFont + 0.2);
    state.translationFont = Math.min(1.6, state.translationFont + 0.05);
    persistState();
    applyFontSizes();
});
document.getElementById("font-decrease")?.addEventListener("click", () => {
    state.arabicFont = Math.max(1.4, state.arabicFont - 0.2);
    state.translationFont = Math.max(0.8, state.translationFont - 0.05);
    persistState();
    applyFontSizes();
});
document.getElementById("font-reset")?.addEventListener("click", () => {
    state.arabicFont = 2.2;
    state.translationFont = 1.0;
    persistState();
    applyFontSizes();
});

function applyFontSizes() {
    document.querySelectorAll(".verse-arabic").forEach(elx => elx.style.fontSize = state.arabicFont + "rem");
    document.querySelectorAll(".verse-translation-block").forEach(elx => elx.style.fontSize = state.translationFont + "rem");
}

document.getElementById("tajweed-on")?.addEventListener("click", () => {
    state.tajweedOn = true;
    el.readArea.classList.remove("tajweed-off");
    el.tajweedIndicator.textContent = "On";
    el.tajweedIndicator.classList.add("active");
    el.tajweedTool.classList.add("active");
    document.getElementById("tajweed-on").classList.add("active");
    document.getElementById("tajweed-off").classList.remove("active");
    persistState();
    render();
});
document.getElementById("tajweed-off")?.addEventListener("click", () => {
    state.tajweedOn = false;
    el.readArea.classList.add("tajweed-off");
    el.tajweedIndicator.textContent = "Off";
    el.tajweedIndicator.classList.remove("active");
    el.tajweedTool.classList.remove("active");
    document.getElementById("tajweed-on").classList.remove("active");
    document.getElementById("tajweed-off").classList.add("active");
    persistState();
    render();
});

// Display mode buttons (in translations drawer + settings drawer)
function setDisplayMode(mode) {
    state.displayMode = mode;
    document.querySelectorAll("#display-mode-buttons .toggle-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.mode === mode);
    });
    document.querySelectorAll("#reading-both, #reading-arabic, #reading-translation").forEach(b => b.classList.remove("active"));
    if (mode === "both") document.getElementById("reading-both")?.classList.add("active");
    if (mode === "arabic") document.getElementById("reading-arabic")?.classList.add("active");
    if (mode === "translation") document.getElementById("reading-translation")?.classList.add("active");
    persistState();
    render();
}
document.querySelectorAll("#display-mode-buttons .toggle-btn").forEach(b => {
    b.addEventListener("click", () => setDisplayMode(b.dataset.mode));
});
document.getElementById("reading-both")?.addEventListener("click", () => setDisplayMode("both"));
document.getElementById("reading-arabic")?.addEventListener("click", () => setDisplayMode("arabic"));
document.getElementById("reading-translation")?.addEventListener("click", () => setDisplayMode("translation"));

/* ============================================================
   SEARCH MODAL
   ============================================================ */

function openSearchModal() {
    el.searchModal.classList.add("open");
    setTimeout(() => el.searchModalInput.focus(), 100);
}
function closeSearchModal() {
    el.searchModal.classList.remove("open");
    el.searchModalInput.value = "";
    el.searchModalResults.innerHTML = `<p class="search-hint">Start typing to search surahs by name or number.</p>`;
}

// Search modal is opened via the "/" keyboard shortcut (see KEYBOARD SHORTCUTS section)
// or programmatically via openSearchModal().
el.searchModalClose?.addEventListener("click", closeSearchModal);
el.searchModalOverlay?.addEventListener("click", closeSearchModal);

el.searchModalInput?.addEventListener("input", e => {
    const q = e.target.value.trim().toLowerCase();
    if (!q) {
        el.searchModalResults.innerHTML = `<p class="search-hint">Start typing to search surahs by name or number.</p>`;
        return;
    }

    // Detect "page N" pattern
    const pageMatch = q.match(/^page\s+(\d+)$/);
    if (pageMatch) {
        const p = Math.min(TOTAL_PAGES, Math.max(1, parseInt(pageMatch[1])));
        const [s, a] = PAGE_STARTS[p - 1];
        const meta = SURAH_LIST[s - 1];
        el.searchModalResults.innerHTML = `
            <div class="search-result-item" data-page="${p}">
                <div class="search-result-num">${p}</div>
                <div class="search-result-info">
                    <div class="search-result-name">Page ${p}</div>
                    <div class="search-result-meta">${meta?.transliteration} · starts at ayah ${a}</div>
                </div>
                <div class="search-result-arabic">${escapeHtml(meta?.name || "")}</div>
            </div>`;
        el.searchModalResults.querySelector(".search-result-item")?.addEventListener("click", () => {
            state.view = "page";
            state.page = p;
            persistState();
            closeSearchModal();
            render();
        });
        return;
    }

    // Surah search
    const matches = SURAH_LIST.filter(s =>
        s.transliteration.toLowerCase().includes(q) ||
        s.translation.toLowerCase().includes(q) ||
        s.name.includes(q) ||
        String(s.id) === q
    ).slice(0, 12);

    if (!matches.length) {
        el.searchModalResults.innerHTML = `<p class="search-hint">No surahs found for "${escapeHtml(q)}". Try "page 100" to jump to a page.</p>`;
        return;
    }

    el.searchModalResults.innerHTML = matches.map(s => `
        <div class="search-result-item" data-surah="${s.id}">
            <div class="search-result-num">${s.id}</div>
            <div class="search-result-info">
                <div class="search-result-name">${escapeHtml(s.transliteration)} <small style="opacity:0.6">— ${escapeHtml(s.translation)}</small></div>
                <div class="search-result-meta">${s.total_verses} ayahs · ${capitalizeType(s.type)}</div>
            </div>
            <div class="search-result-arabic">${escapeHtml(s.name)}</div>
        </div>`).join("");

    el.searchModalResults.querySelectorAll(".search-result-item").forEach(item => {
        item.addEventListener("click", () => {
            const surah = parseInt(item.dataset.surah);
            state.view = "surah";
            state.surah = surah;
            persistState();
            closeSearchModal();
            render();
        });
    });
});

/* ============================================================
   THEME — Theme is now controlled via Settings drawer's theme swatches.
   No toggle button in toolbar (removed per user request).
   ============================================================ */

// Listen for siteTheme changes from index.html (e.g. if user changes theme
// in another tab on the home page)
window.addEventListener("storage", e => {
    if (e.key === "siteTheme") {
        // Only sync if the user hasn't explicitly set a mushaf theme
        const savedMushafTheme = localStorage.getItem("mushafTheme");
        if (!savedMushafTheme) {
            syncWithSiteTheme();
        }
    }
});

/* ============================================================
   HAMBURGER / MOBILE NAV — removed (navbar replaced with Back button)
   ============================================================ */

/* ============================================================
   KEYBOARD SHORTCUTS
   ============================================================ */

document.addEventListener("keydown", e => {
    // "/" opens search (unless typing in an input)
    if (e.key === "/" && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        openSearchModal();
    }
    // Escape closes modals/drawers
    if (e.key === "Escape") {
        if (!el.searchModal.classList.contains("open")) { } else { closeSearchModal(); return; }
        if (!el.wordModalOverlay.hidden) { el.wordModalOverlay.hidden = true; state.wordModalContext = null; return; }
        if (!el.ayahPopover.hidden) { el.ayahPopover.hidden = true; return; }
        closeAllDrawers();
        el.navDropdown.hidden = true;
    }
    // Left/Right arrows navigate (when not typing)
    if (document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
        if (e.key === "ArrowLeft") { el.navNext?.click(); }
        if (e.key === "ArrowRight") { el.navPrev?.click(); }
        // Spacebar toggles audio
        if (e.key === " " && state.currentAyahAudio) {
            e.preventDefault();
            el.miniPlay?.click();
        }
    }
});

/* ============================================================
   WIRE EVENTS (called from init)
   ============================================================ */

function wireEvents() {
    // Most event handlers are wired above via direct addEventListener calls.
    // This function exists for any post-render wiring that's needed.
    // (No-op for now — handlers are attached at script load time.)
}

/* ============================================================
   END
   ============================================================ */

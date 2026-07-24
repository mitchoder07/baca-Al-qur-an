// ============================================================
// TOAST
// ============================================================

function showToast(msg) {
    const t = document.getElementById("toast");
    t.textContent = msg;
    t.classList.add("show");
    setTimeout(() => t.classList.remove("show"), 1800);
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

let allSurahs = [];
let activeFilter = "all";
let selectedSurah = null;
let readerMode = "both";
let arabicFontSize = 3;
let translationFontSize = 1.05;
let currentReciter = 7;
let reciterOptions = [];
let activePlayButton = null;
let currentAyahPlaying = 1;
let totalAyahsInSurah = 0;
let activeAudioMode = "surah";
let repeatMode = "off";
let siteTheme = "dark";
let readerThemeKey = localStorage.getItem("readerTheme") || "dark";
let dailyAyahData = null;

window._juzSurahMap = {};
window._hizbSurahMap = {};

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
        bg: "linear-gradient(180deg,#1a2010,#243018)",
        card: "rgba(180,220,100,0.05)", cardBorder: "rgba(140,190,60,0.12)",
        text: "#d4e8b0", subtext: "#8aad5a", arabic: "#e8f5d0",
        accent: "#8dc63f", accentRgb: "141,198,63",
        toolBg: "rgba(140,190,60,0.08)", drawerBg: "#1a2010",
        numBg: "linear-gradient(135deg,#7bbf3a,#5a9e20)", numColor: "#1a2010",
        bismillah: "#8dc63f",
        themeBtn: { bg: "rgba(140,190,60,0.1)", color: "#8dc63f" },
        panel: { bg: "#1a2010", border: "rgba(140,190,60,0.2)", label: "#8aad5a" },
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
    floatingSurah.textContent = surahName;
    floatingAyah.textContent = ayahLabel;
    floatingPlayer.classList.add("active");
}

function hideFloatingPlayer() { floatingPlayer.classList.remove("active"); }

function syncMiniPlayIcon(playing) {
    miniPlay.innerHTML = playing ? `<i data-lucide="pause"></i>` : `<i data-lucide="play"></i>`;
    lucide.createIcons();
}

function getActiveAudio() { return activeAudioMode === "surah" ? audioPlayer : ayahPlayer; }

// ============================================================
// RECITER HELPERS (quran.com numeric IDs)
// ============================================================

// NOTE: Reciters not available per-ayah on quran.com / alquran.cloud /
// everyayah.com (e.g. Okasha Kameny) are intentionally excluded from
// the daily ayah and reading modal dropdowns. They are only available
// in the Reciters section (reciters/index.html → reciters/reciter.html)
// where full-surah playback from mp3quran.net works.

function syncReciterSelection(reciterId, { updateSelects = true, updateBadge = true, sourceSelect = null } = {}) {
    const nextId = Number(reciterId ?? currentReciter ?? 7);
    currentReciter = nextId;

    const selects = [
        document.getElementById("reciter-select"),
        document.getElementById("reciter-select2")
    ].filter(Boolean);

    if (updateSelects) {
        selects.forEach(sel => { sel.value = String(nextId); });
    }

    if (updateBadge) {
        const badge = document.getElementById("current-reciter-badge");
        const activeSelect = sourceSelect || selects.find(s => String(s.value) === String(nextId)) || selects[0];
        const opt = activeSelect?.options[activeSelect.selectedIndex];
        if (badge && opt) badge.textContent = opt.textContent;
    }
}

async function getReciterChapterAudioUrl(surahNumber, reciterId = currentReciter) {
    try {
        const res = await fetch(`https://api.quran.com/api/v4/chapter_recitations/${reciterId}`);
        const data = await res.json();
        const file = (data.audio_files || []).find(f => Number(f.chapter_id) === Number(surahNumber));
        return file?.audio_url || null;
    } catch (err) {
        console.error("Failed to resolve chapter audio:", err);
        return null;
    }
}

// For individual ayah playback via quran.com
async function getAyahAudioUrl(surahNumber, ayahInSurah, reciterId = currentReciter) {
    try {
        const res = await fetch(`https://api.quran.com/api/v4/recitations/${reciterId}/by_ayah?chapter_number=${surahNumber}&verse_number=${ayahInSurah}`);
        const data = await res.json();
        const url = data.audio_files?.[0]?.url;
        if (url) return url.startsWith("http") ? url : `https://verses.quran.com/${url}`;
    } catch (err) {
        console.warn("Ayah audio fetch failed, using fallback:", err);
    }
    // Fallback: alquran.cloud CDN using global ayah number
    const globalNum = toGlobalAyahNumber(surahNumber, ayahInSurah);
    const legacyId = getLegacyReciterCode(reciterId);
    return `https://cdn.islamic.network/quran/audio/128/${legacyId}/${globalNum}.mp3`;
}

function getLegacyReciterCode(reciterId) {
    const id = String(reciterId ?? 7);
    const map = {
        "2": "ar.abdulsamad",
        "1": "ar.abdulsamad",
        "3": "ar.abdurrahmaansudais",
        "4": "ar.shaatree",
        "5": "ar.hanirifai",
        "6": "ar.husary",
        "7": "ar.alafasy",
        "8": "ar.minshawi",
        "9": "ar.minshawimujawwad",
        "10": "ar.saoodshuraym",
        "11": "ar.alafasy",
        "12": "ar.husary",
        "13": "ar.mahermuaiqly",
        "14": "ar.hudhaify",
        "15": "ar.ahmedajamy",
        "16": "ar.muhammadjibreel",
        "17": "ar.muhammadayyoub",
        "18": "ar.abdulsamad",
        "158": "ar.alafasy",   // Ali Jabir fallback
    };
    return map[id] || "ar.alafasy";
}

function toGlobalAyahNumber(surahNum, ayahInSurah) {
    let offset = 0;
    for (const s of allSurahs) {
        if (s.number === Number(surahNum)) return offset + Number(ayahInSurah);
        offset += s.numberOfAyahs;
    }
    return Number(ayahInSurah);
}

// ============================================================
// POPULATE RECITER SELECTS (quran.com + Ali Jabir fallback)
// ============================================================

const FALLBACK_RECITERS = [
    { id: 2, reciter_name: "AbdulBaset AbdulSamad (Murattal)", translated_name: { name: "Abdul Basit Abdul Samad (Murattal)" } },
    { id: 1, reciter_name: "AbdulBaset AbdulSamad (Mujawwad)", translated_name: { name: "Abdul Basit Abdul Samad (Mujawwad)" } },
    { id: 3, reciter_name: "Abdur-Rahman as-Sudais", translated_name: { name: "Abdur-Rahman As-Sudais" } },
    { id: 4, reciter_name: "Abu Bakr al-Shatri", translated_name: { name: "Abu Bakr Ash-Shaatree" } },
    { id: 5, reciter_name: "Hani ar-Rifai", translated_name: { name: "Hani Ar-Rifai" } },
    { id: 6, reciter_name: "Mahmoud Khalil Al-Husary (Murattal)", translated_name: { name: "Mahmoud Khalil Al-Husary (Murattal)" } },
    { id: 7, reciter_name: "Mishari Rashid al-Afasy", translated_name: { name: "Mishary Rashid Al-Afasy" } },
    { id: 8, reciter_name: "Mohamed Siddiq al-Minshawi (Murattal)", translated_name: { name: "Muhammad Siddiq Al-Minshawi (Murattal)" } },
    { id: 9, reciter_name: "Mohamed Siddiq al-Minshawi (Mujawwad)", translated_name: { name: "Muhammad Siddiq Al-Minshawi (Mujawwad)" } },
    { id: 10, reciter_name: "Saud ash-Shuraym", translated_name: { name: "Saud Al-Shuraim" } },
    { id: 11, reciter_name: "Mohamed al-Tablawi", translated_name: { name: "Mohamed Al-Tablawi" } },
    { id: 12, reciter_name: "Mahmoud Khalil Al-Husary (Mujawwad)", translated_name: { name: "Mahmoud Khalil Al-Husary (Mujawwad)" } },
    { id: 13, reciter_name: "Maher Al Muaiqly", translated_name: { name: "Maher Al-Muaiqly" } },
    { id: 14, reciter_name: "Ali Al-Hudhaify", translated_name: { name: "Ali Al-Hudhaify" } },
    { id: 15, reciter_name: "Ahmed Al-Ajamy", translated_name: { name: "Ahmed Al-Ajamy" } },
    { id: 16, reciter_name: "Muhammad Jibreel", translated_name: { name: "Muhammad Jibreel" } },
    { id: 17, reciter_name: "Muhammad Ayyoub", translated_name: { name: "Muhammad Ayyoub" } },
    { id: 18, reciter_name: "Abdullah Basfar", translated_name: { name: "Abdullah Basfar" } },
    { id: 158, reciter_name: "Abdullah Ali Jabir", translated_name: { name: "Abdullah Ali Jabir" } },
];

async function populateReciterSelects() {
    const selects = [
        document.getElementById("reciter-select"),
        document.getElementById("reciter-select2")
    ].filter(Boolean);
    if (!selects.length) return;

    try {
        const res = await fetch("https://api.quran.com/api/v4/resources/recitations");
        const data = await res.json();
        const apiList = Array.isArray(data.recitations) ? data.recitations : [];
        // Merge: keep API list and ensure Ali Jabir (158) is present.
        // NOTE: Okasha Kameny is intentionally NOT in these dropdowns because
        // his per-ayah audio is not available on any free API (quran.com,
        // alquran.cloud, everyayah.com). He's only available in the Reciters
        // section where full-surah playback from mp3quran.net works.
        reciterOptions = apiList.length ? apiList : FALLBACK_RECITERS;
        if (!reciterOptions.some(r => Number(r.id) === 158)) {
            reciterOptions.push(FALLBACK_RECITERS.find(r => r.id === 158));
        }
    } catch (err) {
        console.warn("Using fallback reciter list:", err);
        reciterOptions = FALLBACK_RECITERS;
    }

    const preferredId = Number(localStorage.getItem("favoriteReciter") || 7);
    // Safeguard: if the user previously selected Okasha (ID 159) as their
    // favourite, that reciter is no longer available in these dropdowns.
    // Reset to the default (Mishary, ID 7) to avoid a blank selection.
    if (preferredId === 159) {
        localStorage.removeItem("favoriteReciter");
    }
    const selected = reciterOptions.find(r => Number(r.id) === preferredId)
        || reciterOptions.find(r => Number(r.id) === 7)
        || reciterOptions[0];
    if (selected) currentReciter = Number(selected.id);

    const optionsHtml = reciterOptions.map(r => {
        const label = r.translated_name?.name || r.reciter_name || `Reciter ${r.id}`;
        return `<option value="${r.id}" ${Number(r.id) === currentReciter ? "selected" : ""}>${label}</option>`;
    }).join("");

    selects.forEach(sel => {
        sel.innerHTML = optionsHtml;
        sel.value = String(currentReciter);
    });

    const badge = document.getElementById("current-reciter-badge");
    if (badge && selected) {
        badge.textContent = selected.translated_name?.name || selected.reciter_name || "Reciter";
    }
}

// ============================================================
// VERSE SCROLL + HIGHLIGHT
// ============================================================

function scrollToActiveVerse(ayahNumber) {
    const readerContent = document.querySelector(".reader-content");
    const card = document.querySelector(`.verse-card[data-ayah="${ayahNumber}"]`);
    if (!card || !readerContent) return;

    const targetScroll = card.offsetTop - (readerContent.clientHeight / 2) + (card.clientHeight / 2);
    readerContent.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });

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
    if (themeBtn) { themeBtn.style.background = t.themeBtn.bg; themeBtn.style.color = t.themeBtn.color; }

    const panel = document.getElementById("reader-theme-panel");
    if (panel) {
        panel.style.background = t.panel.bg;
        panel.style.borderColor = t.panel.border;
        panel.querySelectorAll(".theme-panel-label,.swatch-label").forEach(el => el.style.color = t.panel.label);
    }

    document.querySelectorAll(".verse-number").forEach(el => {
        el.style.background = t.numBg; el.style.color = t.numColor; el.style.boxShadow = "none";
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

    document.querySelectorAll(".theme-swatch").forEach(s => s.classList.toggle("active", s.dataset.theme === key));
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
// FLOATING MINI SETTINGS DRAWER
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
        arabicFontSize -= 0.2; translationFontSize -= 0.05; applyFontSizes();
    });
    drawer.querySelector("#mini-font-reset")?.addEventListener("click", () => {
        arabicFontSize = 3; translationFontSize = 1.05; applyFontSizes();
    });

    drawer.querySelectorAll(".mini-mode-btn").forEach(mbtn => {
        mbtn.addEventListener("click", () => {
            readerMode = mbtn.dataset.mode;
            updateReaderModeUI();
            drawer.querySelectorAll(".mini-mode-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === readerMode));
        });
    });
}

// ============================================================
// SITE-WIDE DARK / LIGHT MODE
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
        themeBtn.innerHTML = siteTheme === "light" ? `<i data-lucide="sun"></i>` : `<i data-lucide="moon"></i>`;
        localStorage.setItem("siteTheme", siteTheme);
        lucide.createIcons();
    });
}

// ============================================================
// ANIMATED SEARCH PLACEHOLDER
// ============================================================

function initAnimatedPlaceholder() {
    const hints = ["Search surah name…", "Search by number…", "e.g. 'Al-Baqarah' or '2'…", "Search surah name…"];
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
            dropdown.classList.remove("open"); filterBtn.classList.remove("filter-active");
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
        dropdown.classList.remove("open"); filterBtn.classList.remove("filter-active");
        filterBtn.style.background = activeFilter === "all" ? "rgba(16,185,129,0.12)" : "rgba(16,185,129,0.3)";
    });

    document.addEventListener("click", e => {
        if (!e.target.closest("#filter-clear-btn")) return;
        dropdown.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
        activeFilter = "all"; renderSurahs(getFilteredSurahs());
        filterBtn.style.background = "rgba(16,185,129,0.12)";
        dropdown.classList.remove("open"); filterBtn.classList.remove("filter-active");
    });
}

// ============================================================
// JUZ / HIZB META
// ============================================================

function compareAyahRef(a, b) { return a.surah !== b.surah ? a.surah - b.surah : a.ayah - b.ayah; }

function surahOverlapsRange(surahNum, ayahCount, rangeStart, rangeEnd) {
    const sStart = { surah: surahNum, ayah: 1 };
    const sEnd = { surah: surahNum, ayah: ayahCount };
    return compareAyahRef(sEnd, rangeStart) >= 0 && compareAyahRef(sStart, rangeEnd) < 0;
}

function buildSurahSetForRange(rangeStart, rangeEnd, surahList) {
    const set = new Set();
    surahList.forEach(s => {
        if (surahOverlapsRange(s.number, s.numberOfAyahs, rangeStart, rangeEnd)) set.add(s.number);
    });
    return set;
}

async function loadJuzData() {
    const juzCon = document.getElementById("juz-pills");
    const hizbCon = document.getElementById("hizb-pills");
    if (juzCon) juzCon.innerHTML = `<span class="filter-loading">Loading…</span>`;
    if (hizbCon) hizbCon.innerHTML = `<span class="filter-loading">Loading…</span>`;

    try {
        const res = await fetch("https://api.alquran.cloud/v1/meta");
        const d = (await res.json()).data;
        const surahList = allSurahs.length ? allSurahs : (d.surahs?.references || []);

        const juzRefs = d.juzs?.references || [];
        const hizbRefs = d.hizbQuarters?.references || [];

        window._juzSurahMap = {};
        juzRefs.forEach((start, i) => {
            const end = juzRefs[i + 1] || { surah: 114, ayah: Number.MAX_SAFE_INTEGER };
            window._juzSurahMap[i + 1] = buildSurahSetForRange(start, end, surahList);
        });

        window._hizbSurahMap = {};
        for (let h = 1; h <= 60; h++) {
            const qIdx = (h - 1) * 4;
            const start = hizbRefs[qIdx];
            const end = hizbRefs[qIdx + 4] || { surah: 114, ayah: Number.MAX_SAFE_INTEGER };
            if (start) window._hizbSurahMap[h] = buildSurahSetForRange(start, end, surahList);
        }

        if (juzCon) juzCon.innerHTML = Array.from({ length: 30 }, (_, i) => i + 1).map(n => `<button type="button" class="fpill" data-filter="juz-${n}">Juz ${n}</button>`).join("");
        if (hizbCon) hizbCon.innerHTML = Array.from({ length: 60 }, (_, i) => i + 1).map(n => `<button type="button" class="fpill" data-filter="hizb-${n}">Hizb ${n}</button>`).join("");

    } catch (err) {
        console.error("Failed to load juz/hizb:", err);
        const errHtml = `<span class="filter-error">Could not load — try refreshing</span>`;
        if (juzCon) juzCon.innerHTML = errHtml;
        if (hizbCon) hizbCon.innerHTML = errHtml;
    }
}

// ============================================================
// FILTER LOGIC
// ============================================================

function getFilteredSurahs() {
    const val = searchInput.value.trim().toLowerCase();
    let base = allSurahs;
    if (activeFilter === "makkah") base = allSurahs.filter(s => s.revelationType === "Meccan");
    else if (activeFilter === "madinah") base = allSurahs.filter(s => s.revelationType === "Medinan");
    else if (activeFilter.startsWith("juz-")) {
        const n = Number(activeFilter.split("-")[1]);
        base = allSurahs.filter(s => (window._juzSurahMap[n] || new Set()).has(s.number));
    } else if (activeFilter.startsWith("hizb-")) {
        const n = Number(activeFilter.split("-")[1]);
        base = allSurahs.filter(s => (window._hizbSurahMap[n] || new Set()).has(s.number));
    }
    if (!val) return base;
    return base.filter(s =>
        s.englishName.toLowerCase().includes(val) ||
        s.name.toLowerCase().includes(val) ||
        String(s.number) === val
    );
}

searchInput.addEventListener("input", () => renderSurahs(getFilteredSurahs()));

// ============================================================
// BOOKMARKS
// ============================================================

function getBookmarks() { try { return JSON.parse(localStorage.getItem("bookmarks") || "[]"); } catch { return []; } }
function saveBookmarks(list) { localStorage.setItem("bookmarks", JSON.stringify(list)); }
function isBookmarked(surah, ayah) { return getBookmarks().some(b => b.surah === surah && b.ayah === ayah); }
function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

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
        listEl.innerHTML = `<div class="bookmarks-empty"><i data-lucide="bookmark"></i><p>No bookmarks yet. Save verses from the reader.</p></div>`;
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
            selectedSurah = Number(btn.dataset.surah); readBtn.click();
            setTimeout(() => scrollToActiveVerse(Number(btn.dataset.ayah)), 1200);
        });
    });
    document.querySelectorAll(".remove-bookmark").forEach(btn => {
        btn.addEventListener("click", () => {
            saveBookmarks(getBookmarks().filter(b => !(b.surah === Number(btn.dataset.surah) && b.ayah === Number(btn.dataset.ayah))));
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
// DAILY AYAH — loads ONLY that specific ayah's audio
// ============================================================

async function loadDailyAyah() {
    try {
        const now = new Date();
        const seed = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        const ayahNum = (seed % 6236) + 1;  // global 1-6236

        const ayahRes = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}/editions/quran-uthmani,en.sahih`);
        const ayahData = await ayahRes.json();
        const a0 = ayahData.data[0], a1 = ayahData.data[1];

        const arabicEl = document.querySelector(".ayah-arabic");
        const transEl = document.querySelector(".ayah-translation");
        if (arabicEl) arabicEl.textContent = a0.text;
        if (transEl) transEl.textContent = a1.text;

        const infoH3 = document.querySelector(".audio-info h3");
        const infoSpan = document.querySelector(".audio-info span");
        if (infoH3) infoH3.textContent = a0.surah.englishName;
        if (infoSpan) infoSpan.textContent = `Verse ${a0.numberInSurah}`;

        dailyAyahData = {
            surah: a0.surah.number, ayah: a0.numberInSurah,
            totalAyahs: a0.surah.numberOfAyahs, surahName: a0.surah.englishName,
            arabic: a0.text, translation: a1.text,
        };
        refreshBookmarkButtonStates();

        // Load just the specific ayah's audio (NOT the full surah)
        if (quranAudio) {
            const audioUrl = await getAyahAudioUrl(a0.surah.number, a0.numberInSurah, currentReciter);
            quranAudio.src = audioUrl;
            quranAudio.volume = 0.8;
            quranAudio.load();
        }

        wireHomepageAudioPlayer();

    } catch (err) {
        console.error("Daily ayah failed:", err);
    }
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

    async function reloadDailyAudio(reciterId) {
        if (!dailyAyahData) return;
        const url = await getAyahAudioUrl(dailyAyahData.surah, dailyAyahData.ayah, reciterId);
        const wasPlaying = !quranAudio.paused;
        quranAudio.src = url;
        quranAudio.volume = 0.8;
        quranAudio.load();
        if (wasPlaying) {
            quranAudio.addEventListener("canplay", () => quranAudio.play(), { once: true });
        }
    }

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
        muteBtn.innerHTML = quranAudio.muted ? `<i data-lucide="volume-x"></i>` : `<i data-lucide="volume-2"></i>`;
        lucide.createIcons();
    };

    if (speedBton) speedBton.onclick = () => {
        homeSpeed = homeSpeed >= 2 ? 1 : homeSpeed + 0.25;
        quranAudio.playbackRate = homeSpeed;
        speedBton.textContent = `${homeSpeed}x`;
    };

    if (skipBack) skipBack.onclick = () => { quranAudio.currentTime = Math.max(0, quranAudio.currentTime - 10); };
    if (skipFwd) skipFwd.onclick = () => { quranAudio.currentTime = Math.min(quranAudio.duration || 0, quranAudio.currentTime + 10); };

    // Homepage reciter change — reloads the daily ayah's audio for the new reciter
    if (reciterSel) {
        reciterSel.addEventListener("change", async () => {
            const nextId = Number(reciterSel.value);
            syncReciterSelection(nextId, { updateSelects: true, updateBadge: true, sourceSelect: reciterSel });
            await reloadDailyAudio(currentReciter);
            playBtn.innerHTML = quranAudio.paused ? `<i data-lucide="play"></i>` : `<i data-lucide="pause"></i>`;
            lucide.createIcons();
        });
    }

    quranAudio.addEventListener("ended", () => {
        playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    });
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
// FLOATING PLAYER ICONS
// ============================================================

function fixFloatingPlayerIcons() {
    miniPlay.innerHTML = `<i data-lucide="play"></i>`;
    miniPrev.innerHTML = `<i data-lucide="skip-back"></i>`;
    miniNext.innerHTML = `<i data-lucide="skip-forward"></i>`;
    lucide.createIcons();
}

// ============================================================
// READER MODE
// ============================================================

function updateReaderModeUI() {
    document.querySelectorAll(".verse-arabic").forEach(el => {
        el.style.display = readerMode === "translation" ? "none" : "block";
    });
    document.querySelectorAll(".verse-translation").forEach(el => {
        el.style.display = readerMode === "arabic" ? "none" : "block";
    });
    document.querySelectorAll(".toggle-btn").forEach(b => b.classList.remove("active"));
    if (readerMode === "both") modeBoth.classList.add("active");
    if (readerMode === "arabic") modeArabic.classList.add("active");
    if (readerMode === "translation") modeTranslation.classList.add("active");
    document.querySelectorAll(".mini-mode-btn").forEach(b => b.classList.toggle("active", b.dataset.mode === readerMode));
}

modeBoth.addEventListener("click", () => { readerMode = "both"; updateReaderModeUI(); });
modeArabic.addEventListener("click", () => { readerMode = "arabic"; updateReaderModeUI(); });
modeTranslation.addEventListener("click", () => { readerMode = "translation"; updateReaderModeUI(); });

// ============================================================
// FONT SIZES
// ============================================================

function applyFontSizes() {
    document.querySelectorAll(".verse-arabic").forEach(el => el.style.fontSize = arabicFontSize + "rem");
    document.querySelectorAll(".verse-translation").forEach(el => el.style.fontSize = translationFontSize + "rem");
}

document.getElementById("font-increase").addEventListener("click", () => { arabicFontSize += 0.2; translationFontSize += 0.05; applyFontSizes(); });
document.getElementById("font-decrease").addEventListener("click", () => { arabicFontSize -= 0.2; translationFontSize -= 0.05; applyFontSizes(); });
document.getElementById("font-reset").addEventListener("click", () => { arabicFontSize = 3; translationFontSize = 1.05; applyFontSizes(); });

// ============================================================
// CONTINUE READING
// ============================================================

function updateContinueReading() {
    const saved = JSON.parse(localStorage.getItem("lastRead"));
    if (!saved) return;
    document.getElementById("continue-surah").textContent = saved.surahName;
    document.getElementById("continue-ayah").textContent = `Ayah ${saved.ayah} of ${saved.totalAyahs}`;
    document.getElementById("continue-meta").textContent = `${saved.totalAyahs - saved.ayah} Ayahs Remaining`;
    const pct = saved.totalAyahs ? Math.round((saved.ayah / saved.totalAyahs) * 100) : 0;
    document.getElementById("reading-status").textContent = pct >= 100 ? "Completed" : "In Progress";
    document.getElementById("continue-progress").textContent = `${pct}% Completed`;
    document.querySelector(".progress-fill").style.width = pct + "%";
}

document.getElementById("resume-reading-btn").addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("lastRead"));
    if (!saved?.totalAyahs) return;
    selectedSurah = Number(saved.surah); readBtn.click();
    setTimeout(() => scrollToActiveVerse(saved.ayah), 1200);
});

// ============================================================
// FULL-SURAH AUDIO PLAYER (inside reader)
// ============================================================

async function loadSurahAudio({ autoplay = false } = {}) {
    if (!selectedSurah) return;
    try {
        const url = await getReciterChapterAudioUrl(selectedSurah, currentReciter);
        if (!url) throw new Error("No chapter audio URL");
        audioPlayer.src = url;
        audioPlayer.load();
        if (autoplay) {
            try { await audioPlayer.play(); } catch (e) { console.warn("Surah autoplay failed:", e); }
        }
    } catch (err) {
        console.error("loadSurahAudio failed:", err);
        const fallback = `https://cdn.islamic.network/quran/audio-surah/128/${getLegacyReciterCode(currentReciter)}/${selectedSurah}.mp3`;
        audioPlayer.src = fallback;
        audioPlayer.load();
        if (autoplay) {
            try { await audioPlayer.play(); } catch (e) { console.warn("Surah fallback autoplay failed:", e); }
        }
    }
}

playButton.addEventListener("click", () => {
    if (!audioPlayer.src) return;
    if (!ayahPlayer.paused) {
        ayahPlayer.pause();
        if (activePlayButton) { activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); activePlayButton = null; }
    }
    activeAudioMode = "surah";
    if (audioPlayer.paused) {
        audioPlayer.play(); playButton.innerHTML = `<i data-lucide="pause"></i>`;
        syncMiniPlayIcon(true);
        showFloatingPlayer(document.getElementById("reader-title").textContent, "Full Surah");
    } else {
        audioPlayer.pause(); playButton.innerHTML = `<i data-lucide="play"></i>`;
        syncMiniPlayIcon(false);
    }
    lucide.createIcons();
});

audioPlayer.addEventListener("timeupdate", () => {
    progressBar2.max = audioPlayer.duration || 0;
    progressBar2.value = audioPlayer.currentTime;
    currentTimeEl2.textContent = formatTime(audioPlayer.currentTime);
    durationTimeEl.textContent = formatTime(audioPlayer.duration);
});
progressBar2.addEventListener("input", () => { audioPlayer.currentTime = progressBar2.value; });

audioPlayer.addEventListener("ended", () => {
    playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    if (repeatMode === "surah") {
        audioPlayer.currentTime = 0; audioPlayer.play();
        playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();
        syncMiniPlayIcon(true); showToast("Repeating Surah…");
    } else if (repeatMode === "quran") {
        selectedSurah = selectedSurah < 114 ? selectedSurah + 1 : 1;
        readBtn.click();
        setTimeout(() => {
            audioPlayer.play(); playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();
            syncMiniPlayIcon(true);
            showFloatingPlayer(document.getElementById("reader-title").textContent, "Full Surah");
        }, 1800);
        showToast("Playing next Surah…");
    } else { syncMiniPlayIcon(false); }
});

const speedBtn = document.getElementById("speed-btn");
let playbackRate = 1;
speedBtn?.addEventListener("click", () => {
    playbackRate = playbackRate >= 2 ? 1 : playbackRate + 0.25;
    audioPlayer.playbackRate = playbackRate; speedBtn.textContent = `${playbackRate}x`;
});

document.getElementById("next-surah-audio")?.addEventListener("click", () => { if (selectedSurah < 114) { selectedSurah++; readBtn.click(); } });
document.getElementById("prev-surah-audio")?.addEventListener("click", () => { if (selectedSurah > 1) { selectedSurah--; readBtn.click(); } });

// ============================================================
// LOAD SURAHS
// ============================================================

async function loadSurahs() {
    try {
        const res = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await res.json();
        allSurahs = data.data;
        renderSurahs(allSurahs);
        await loadJuzData();
    } catch (err) { console.error("Failed to load Surahs:", err); }
}

// ============================================================
// RENDER SURAH GRID
// ============================================================

function renderSurahs(data) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    let html = "";
    data.forEach(surah => {
        const isFav = favorites.includes(surah.number);
        html += `
        <div class="surah-card" data-number="${surah.number}" data-name="${surah.englishName}"
            data-arabic="${surah.name}" data-ayahs="${surah.numberOfAyahs}" data-type="${surah.revelationType}">
            <button class="favorite-btn ${isFav ? "active" : ""}" data-id="${surah.number}">★</button>
            <div class="surah-number">${surah.number}</div>
            <h3>${surah.englishName}</h3>
            <div class="surah-english">${surah.name}</div>
            <div class="surah-meta"><span>${surah.numberOfAyahs} Ayahs</span><span>${surah.revelationType}</span></div>
        </div>`;
    });
    grid.innerHTML = html || `<p style="color:#94a3b8;grid-column:1/-1;text-align:center;padding:2rem">No surahs found.</p>`;
    activateFavorites(); activateCards();
}

function activateFavorites() {
    document.querySelectorAll(".favorite-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const id = Number(btn.dataset.id);
            let favs = JSON.parse(localStorage.getItem("favorites")) || [];
            favs = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
            localStorage.setItem("favorites", JSON.stringify(favs));
            renderSurahs(getFilteredSurahs());
        });
    });
}

function activateCards() {
    document.querySelectorAll(".surah-card").forEach(card => {
        card.addEventListener("click", () => {
            selectedSurah = Number(card.dataset.number);
            document.getElementById("modal-surah-number").textContent = card.dataset.number;
            document.getElementById("modal-surah-name").textContent = card.dataset.name;
            document.getElementById("modal-surah-arabic").textContent = card.dataset.arabic;
            document.getElementById("modal-surah-ayahs").textContent = card.dataset.ayahs + " Ayahs";
            document.getElementById("modal-surah-type").textContent = card.dataset.type;
            surahModal.classList.add("active"); lucide.createIcons();
        });
    });
}

modalClose.addEventListener("click", () => surahModal.classList.remove("active"));
document.querySelector(".surah-modal-overlay").addEventListener("click", () => surahModal.classList.remove("active"));

// ============================================================
// BISMILLAH CLEAN
// ============================================================

function cleanAyah(text, surahNumber, ayahNumber) {
    if (surahNumber === 9 || surahNumber === 1) return text;
    if (ayahNumber === 1) {
        const words = text.split(" ");
        if (words.slice(0, 4).join(" ").includes("بِسْمِ")) return words.slice(4).join(" ").trim();
    }
    return text;
}

// ============================================================
// READ SURAH
// ============================================================

readBtn.addEventListener("click", async () => {
    if (!selectedSurah) return;
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/editions/quran-uthmani,en.sahih`);
        const data = await res.json();
        const arabicAyahs = data.data[0].ayahs;
        const englishAyahs = data.data[1].ayahs;
        totalAyahsInSurah = arabicAyahs.length;

        document.getElementById("reader-title").textContent = data.data[0].englishName;
        document.getElementById("reader-arabic-name").textContent = data.data[0].name;
        document.getElementById("reader-meaning").textContent = data.data[0].englishNameTranslation;
        document.getElementById("reader-meta").textContent = `${arabicAyahs.length} Ayahs • ${data.data[0].revelationType}`;

        const bism = document.getElementById("bismillah-container");
        bism.innerHTML = (selectedSurah !== 1 && selectedSurah !== 9)
            ? `<div class="bismillah-header">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>` : "";

        let html = "";
        arabicAyahs.forEach((ayah, i) => {
            const cleaned = cleanAyah(ayah.text, selectedSurah, ayah.numberInSurah);
            html += `
            <div class="verse-card" data-surah="${selectedSurah}" data-ayah="${ayah.numberInSurah}">
                <div class="verse-number">${ayah.numberInSurah}</div>
                <div class="verse-arabic">${cleaned}</div>
                <div class="verse-translation">${englishAyahs[i].text}</div>
                <div class="verse-actions">
                    <button class="ayah-action play-btn" data-surah="${selectedSurah}" data-ayah="${ayah.numberInSurah}" title="Play ayah"><i data-lucide="play"></i></button>
                    <button class="ayah-action bookmark-btn" data-surah="${selectedSurah}" data-ayah="${ayah.numberInSurah}" title="Bookmark"><i data-lucide="bookmark"></i></button>
                    <button class="ayah-action copy-btn" title="Copy"><i data-lucide="copy"></i></button>
                    <button class="ayah-action share-btn" title="Share"><i data-lucide="share-2"></i></button>
                </div>
            </div>`;
        });

        document.getElementById("reader-verses").innerHTML = html;

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
                    const ayah = Number(entry.target.dataset.ayah);
                    localStorage.setItem("lastRead", JSON.stringify({
                        surah: selectedSurah, surahName: data.data[0].englishName,
                        surahArabic: data.data[0].name, totalAyahs: arabicAyahs.length, ayah
                    }));
                    updateContinueReading();
                }
            });
        }, { threshold: 0.6 });
        document.querySelectorAll(".verse-card").forEach(c => observer.observe(c));

        applyFontSizes(); updateReaderModeUI();
        await loadSurahAudio();
        applyReaderTheme(readerThemeKey);
        refreshBookmarkButtonStates();

        readerModal.classList.add("active");
        document.body.style.overflow = "hidden";
        document.body.classList.add("reader-open"); // hides chat-widget FAB
        requestAnimationFrame(() => { document.querySelector(".reader-content").scrollTop = 0; });
        lucide.createIcons();
    } catch (err) { console.error("Failed to load Surah:", err); }
});

// ============================================================
// READER CLOSE
// ============================================================

function closeReader() {
    readerModal.classList.remove("active");
    document.body.style.overflow = "auto";
    document.body.classList.remove("reader-open"); // restores chat-widget FAB
    audioPlayer.pause(); ayahPlayer.pause();
    if (activePlayButton) { activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); activePlayButton = null; }
    playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    syncMiniPlayIcon(false); hideFloatingPlayer();
    document.getElementById("reader-theme-panel")?.classList.remove("open");
    document.getElementById("mini-settings-drawer")?.classList.remove("open");
}

readerClose.addEventListener("click", closeReader);
document.querySelector(".reader-overlay").addEventListener("click", closeReader);

// ============================================================
// SETTINGS / AUDIO DRAWER
// ============================================================

const settingsBtn = document.getElementById("reader-settings-btn");
const audioBtn = document.getElementById("reader-audio-btn");
const settingsDrawer = document.getElementById("settings-drawer");
const audioDrawer = document.getElementById("audio-drawer");

settingsBtn.addEventListener("click", () => { audioDrawer.classList.remove("active"); settingsDrawer.classList.toggle("active"); });
audioBtn.addEventListener("click", () => { settingsDrawer.classList.remove("active"); audioDrawer.classList.toggle("active"); });

// ============================================================
// FAVOURITE RECITER
// ============================================================

document.getElementById("favorite-reciter")?.addEventListener("click", function () {
    localStorage.setItem("favoriteReciter", String(currentReciter));
    this.innerHTML = `<i data-lucide="heart"></i>`;
    this.style.color = "var(--reader-accent)";
    lucide.createIcons();
    showToast("Reciter saved as favourite ✓");
});

// ============================================================
// RECITER SWITCH (reader) — updates global state, reloads audio
// ============================================================

document.addEventListener("change", async e => {
    if (e.target.id !== "reciter-select2") return;
    const nextId = Number(e.target.value);
    syncReciterSelection(nextId, { updateSelects: true, updateBadge: true, sourceSelect: e.target });

    try {
        if (activeAudioMode === "ayah" && activePlayButton) {
            const surah = Number(activePlayButton.dataset.surah);
            const ayah = Number(activePlayButton.dataset.ayah);
            const wasPlaying = !ayahPlayer.paused;
            const url = await getAyahAudioUrl(surah, ayah, currentReciter);
            ayahPlayer.src = url;
            ayahPlayer.load();
            if (wasPlaying) ayahPlayer.play();
        } else {
            await loadSurahAudio({ autoplay: !audioPlayer.paused });
        }
    } catch (err) { console.error("Reciter switch failed:", err); }
});

// ============================================================
// PER-AYAH PLAY — fetches individual ayah mp3, then auto-scrolls
// ============================================================

document.addEventListener("click", async e => {
    const playBtn = e.target.closest(".play-btn");
    if (!playBtn) return;

    // Pause full-surah player if running
    if (!audioPlayer.paused) {
        audioPlayer.pause(); playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    }

    activeAudioMode = "ayah";

    // Toggle off if same button
    if (activePlayButton === playBtn && !ayahPlayer.paused) {
        ayahPlayer.pause(); playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
        syncMiniPlayIcon(false); return;
    }

    // Reset previous button
    if (activePlayButton && activePlayButton !== playBtn) {
        activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    }

    const surah = Number(playBtn.dataset.surah);
    const ayah = Number(playBtn.dataset.ayah);

    try {
        const url = await getAyahAudioUrl(surah, ayah, currentReciter);
        ayahPlayer.src = url;
        await ayahPlayer.play();

        activePlayButton = playBtn;
        currentAyahPlaying = ayah;

        playBtn.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();

        // AUTO-SCROLL to active verse
        scrollToActiveVerse(currentAyahPlaying);
        showFloatingPlayer(document.getElementById("reader-title").textContent, `Ayah ${ayah}`);
        syncMiniPlayIcon(true);

        ayahPlayer.onended = () => {
            playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
            activePlayButton = null;
            // Auto-advance to next ayah
            const nextBtn = document.querySelector(`.verse-card[data-ayah="${currentAyahPlaying + 1}"] .play-btn`);
            if (nextBtn) {
                nextBtn.click();
            } else {
                syncMiniPlayIcon(false); floatingAyah.textContent = "Finished";
            }
        };
    } catch (err) { console.error("Ayah play failed:", err); }
});

// ============================================================
// FLOATING MINI PLAYER
// ============================================================

miniPlay.addEventListener("click", () => {
    const audio = getActiveAudio();
    if (audio.paused) {
        audio.play(); syncMiniPlayIcon(true);
        if (activeAudioMode === "surah") { playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons(); }
    } else {
        audio.pause(); syncMiniPlayIcon(false);
        if (activeAudioMode === "surah") { playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
    }
});

miniNext.addEventListener("click", () => {
    if (activeAudioMode === "ayah") {
        document.querySelector(`.verse-card[data-ayah="${currentAyahPlaying + 1}"] .play-btn`)?.click();
    } else if (selectedSurah < 114) {
        selectedSurah++; readBtn.click();
        setTimeout(() => {
            audioPlayer.play(); playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();
            syncMiniPlayIcon(true); showFloatingPlayer(document.getElementById("reader-title").textContent, "Full Surah");
        }, 1800);
    }
});

miniPrev.addEventListener("click", () => {
    if (activeAudioMode === "ayah") {
        document.querySelector(`.verse-card[data-ayah="${currentAyahPlaying - 1}"] .play-btn`)?.click();
    } else if (selectedSurah > 1) {
        selectedSurah--; readBtn.click();
        setTimeout(() => {
            audioPlayer.play(); playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();
            syncMiniPlayIcon(true); showFloatingPlayer(document.getElementById("reader-title").textContent, "Full Surah");
        }, 1800);
    }
});

// ============================================================
// BOOKMARK VERSE (reader)
// ============================================================

document.addEventListener("click", e => {
    const btn = e.target.closest(".bookmark-btn"); if (!btn) return;
    const card = btn.closest(".verse-card"); if (!card) return;
    toggleBookmark({
        surah: Number(btn.dataset.surah), ayah: Number(btn.dataset.ayah),
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
    const text = `${card.querySelector(".verse-arabic")?.innerText || ""}\n\n${card.querySelector(".verse-translation")?.innerText || ""}`;
    try { await navigator.clipboard.writeText(text); btn.classList.add("copied"); showToast("Verse copied ✓"); setTimeout(() => btn.classList.remove("copied"), 800); }
    catch { showToast("Copy failed"); }
});

// ============================================================
// SHARE
// ============================================================

document.addEventListener("click", async e => {
    const btn = e.target.closest(".share-btn"); if (!btn) return;
    const card = btn.closest(".verse-card");
    const text = `${card.querySelector(".verse-arabic")?.innerText || ""}\n\n${card.querySelector(".verse-translation")?.innerText || ""}`;
    try {
        if (navigator.share) { await navigator.share({ title: "Qur'an Verse", text }); showToast("Shared ✓"); }
        else { await navigator.clipboard.writeText(text); showToast("Copied to clipboard"); }
    } catch { showToast("Share cancelled"); }
});

// ============================================================
// INIT
// ============================================================

populateReciterSelects();
loadSurahs();
loadDailyAyah();
initAnimatedPlaceholder();
initThemeToggle();
initFilterBar();
initRepeatButton();
initReaderThemePanel();
initMiniSettingsDrawer();
initBookmarks();
fixFloatingPlayerIcons();
updateContinueReading();
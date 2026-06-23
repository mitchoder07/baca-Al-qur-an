// ============================================================
// TOAST
// ============================================================

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1800);
}

// ============================================================
// ELEMENT REFS
// ============================================================

const grid           = document.getElementById("surah-grid");
const searchInput    = document.getElementById("surah-search");
const readerModal    = document.querySelector(".reader-modal");
const readerClose    = document.querySelector(".reader-close");
const surahModal     = document.querySelector(".surah-modal");
const modalClose     = document.querySelector(".surah-modal-close");
const readBtn        = document.getElementById("read-surah-btn");

const modeBoth        = document.getElementById("mode-both");
const modeArabic      = document.getElementById("mode-arabic");
const modeTranslation = document.getElementById("mode-translation");

const audioPlayer    = document.getElementById("surah-audio");
const playButton     = document.getElementById("audio-play-bton");
const progressBar2   = document.getElementById("audio-progress2");
const currentTimeEl2 = document.getElementById("current-time2");
const durationTimeEl  = document.getElementById("duration-time");

const miniPlay       = document.getElementById("mini-play");
const miniNext       = document.getElementById("mini-next");
const miniPrev       = document.getElementById("mini-prev");
const floatingPlayer = document.getElementById("floating-player");
const floatingSurah  = document.getElementById("floating-surah");
const floatingAyah   = document.getElementById("floating-ayah");

const ayahPlayer     = document.getElementById("ayah-player");
const quranAudio     = document.getElementById("quran-audio");

// ============================================================
// STATE
// ============================================================

let allSurahs           = [];
let activeFilter        = "all";
let selectedSurah       = null;
let readerMode          = "both";
let arabicFontSize      = 3;
let translationFontSize = 1.05;
let currentReciter      = "ar.alafasy";
let activePlayButton    = null;
let currentAyahPlaying  = 1;
let totalAyahsInSurah   = 0;
let activeAudioMode     = "surah";
let repeatMode          = "off";
let siteTheme           = "dark";
let readerThemeKey      = localStorage.getItem("readerTheme") || "dark";
let dailyAyahData       = null;

window._juzSurahMap  = {};
window._hizbSurahMap = {};

// ============================================================
// READER THEMES
// "number" grad uses the theme accent; bismillah matches too.
// --primary green is NOT used for warm/olive themes so it doesn't clash.
// ============================================================

const readerThemes = {
    dark: {
        bg:         "linear-gradient(180deg,#0f172a,#111827)",
        card:       "rgba(255,255,255,0.04)",
        cardBorder: "rgba(255,255,255,0.08)",
        text:       "#ffffff",
        subtext:    "#cbd5e1",
        arabic:     "#ffffff",
        accent:     "#10b981",
        accentRgb:  "16, 185, 129",
        toolBg:     "rgba(255,255,255,0.05)",
        drawerBg:   "#111827",
        numBg:      "linear-gradient(135deg,#34d399,#10b981)",
        numColor:   "#111827",
        bismillah:  "#10b981",
        themeBtn:   { bg: "rgba(255,255,255,0.06)", color: "#fff" },
        panel:      { bg: "#111827", border: "rgba(255,255,255,0.1)", label: "#64748b" },
    },
    warm: {
        bg:         "linear-gradient(180deg,#1a1208,#231a0c)",
        card:       "rgba(255,220,120,0.05)",
        cardBorder: "rgba(255,200,80,0.1)",
        text:       "#f5e6c8",
        subtext:    "#c4a97a",
        arabic:     "#f5e6c8",
        accent:     "#d4a94e",
        accentRgb:  "212, 169, 78",
        toolBg:     "rgba(255,220,120,0.08)",
        drawerBg:   "#231a0c",
        numBg:      "linear-gradient(135deg,#d4a94e,#b8892c)",
        numColor:   "#1a1208",
        bismillah:  "#d4a94e",
        themeBtn:   { bg: "rgba(255,220,120,0.1)", color: "#d4a94e" },
        panel:      { bg: "#231a0c", border: "rgba(212,169,78,0.2)", label: "#c4a97a" },
    },
    olive: {
        bg:         "linear-gradient(180deg,#1a2010,#243018)",
        card:       "rgba(180,220,100,0.05)",
        cardBorder: "rgba(140,190,60,0.12)",
        text:       "#d4e8b0",
        subtext:    "#8aad5a",
        arabic:     "#e8f5d0",
        accent:     "#8dc63f",
        accentRgb:  "141, 198, 63",
        toolBg:     "rgba(140,190,60,0.08)",
        drawerBg:   "#1a2010",
        numBg:      "linear-gradient(135deg,#7bbf3a,#5a9e20)",
        numColor:   "#1a2010",
        bismillah:  "#8dc63f",
        themeBtn:   { bg: "rgba(140,190,60,0.1)", color: "#8dc63f" },
        panel:      { bg: "#1a2010", border: "rgba(140,190,60,0.2)", label: "#8aad5a" },
    },
    light: {
        bg:         "linear-gradient(180deg,#f8fafc,#f1f5f9)",
        card:       "#ffffff",
        cardBorder: "rgba(0,0,0,0.07)",
        text:       "#0f172a",
        subtext:    "#475569",
        arabic:     "#0f172a",
        accent:     "#059669",
        accentRgb:  "5, 150, 105",
        toolBg:     "rgba(0,0,0,0.05)",
        drawerBg:   "#f1f5f9",
        numBg:      "linear-gradient(135deg,#34d399,#10b981)",
        numColor:   "#ffffff",
        bismillah:  "#059669",
        themeBtn:   { bg: "rgba(0,0,0,0.06)", color: "#0f172a" },
        panel:      { bg: "#ffffff", border: "rgba(0,0,0,0.1)", label: "#64748b" },
    },
};

// ============================================================
// HELPERS
// ============================================================

function formatTime(sec) {
    if (!sec || isNaN(sec)) return "0:00";
    const mins    = Math.floor(sec / 60);
    const seconds = Math.floor(sec % 60);
    return `${mins}:${seconds.toString().padStart(2, "0")}`;
}

function showFloatingPlayer(surahName, ayahLabel) {
    floatingSurah.textContent = surahName;
    floatingAyah.textContent  = ayahLabel;
    floatingPlayer.classList.add("active");
}

function hideFloatingPlayer() {
    floatingPlayer.classList.remove("active");
}

function syncMiniPlayIcon(playing) {
    miniPlay.innerHTML = playing
        ? `<i data-lucide="pause"></i>`
        : `<i data-lucide="play"></i>`;
    lucide.createIcons();
}

function getActiveAudio() {
    return activeAudioMode === "surah" ? audioPlayer : ayahPlayer;
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
// READER THEME — apply to reader-content and all cards
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
    reader.style.color      = t.text;

    reader.style.setProperty("--reader-accent", t.accent);
    reader.style.setProperty("--reader-accent-rgb", t.accentRgb);
    reader.style.setProperty("--reader-text", t.text);
    reader.style.setProperty("--reader-subtext", t.subtext);
    reader.style.setProperty("--reader-arabic", t.arabic);
    reader.style.setProperty("--reader-card-bg", t.card);
    reader.style.setProperty("--reader-card-border", t.cardBorder);
    reader.style.setProperty("--reader-header-border", t.cardBorder);
    reader.style.setProperty("--reader-tool-bg", t.toolBg);
    reader.style.setProperty("--reader-drawer-bg", t.drawerBg);

    const themeBtn = document.getElementById("reader-theme-btn");
    if (themeBtn) {
        themeBtn.style.background = t.themeBtn.bg;
        themeBtn.style.color      = t.themeBtn.color;
    }

    const panel = document.getElementById("reader-theme-panel");
    if (panel) {
        panel.style.background  = t.panel.bg;
        panel.style.borderColor = t.panel.border;
        panel.querySelectorAll(".theme-panel-label, .swatch-label").forEach(el => {
            el.style.color = t.panel.label;
        });
    }

    document.querySelectorAll(".verse-number").forEach(el => {
        el.style.background = t.numBg;
        el.style.color      = t.numColor;
        el.style.boxShadow  = "none";
    });

    const isLight = key === "light";
    const closeBtn = document.querySelector(".reader-close");
    if (closeBtn) {
        closeBtn.style.background = isLight ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.06)";
        closeBtn.style.color      = isLight ? "#0f172a" : "#ffffff";
    }

    document.querySelectorAll(".theme-swatch").forEach(s => {
        s.classList.toggle("active", s.dataset.theme === key);
    });

    refreshBookmarkButtonStates();
}

// ============================================================
// READER THEME PANEL — position relative to button (fixed)
// so it follows the button even when scrolled inside the modal
// ============================================================

function initReaderThemePanel() {
    const btn   = document.getElementById("reader-theme-btn");
    const panel = document.getElementById("reader-theme-panel");
    if (!btn || !panel) return;

    btn.addEventListener("click", e => {
        e.stopPropagation();
        panel.classList.toggle("open");
    });

    document.addEventListener("click", e => {
        if (!panel.contains(e.target) && !btn.contains(e.target)) {
            panel.classList.remove("open");
        }
    });

    panel.querySelectorAll(".theme-swatch").forEach(swatch => {
        swatch.addEventListener("click", () => {
            applyReaderTheme(swatch.dataset.theme);
            panel.classList.remove("open");
        });
    });

    applyReaderTheme(readerThemeKey);
}

// ============================================================
// SITE-WIDE DARK / LIGHT MODE TOGGLE
// ============================================================

function initThemeToggle() {
    const themeBtn = document.querySelector(".theme-btn");
    if (!themeBtn) return;

    const saved = localStorage.getItem("siteTheme") || "dark";
    if (saved === "light") {
        document.body.classList.add("light-mode");
        siteTheme = "light";
        themeBtn.innerHTML = `<i data-lucide="sun"></i>`;
        lucide.createIcons();
    }

    themeBtn.addEventListener("click", () => {
        if (siteTheme === "dark") {
            siteTheme = "light";
            document.body.classList.add("light-mode");
            themeBtn.innerHTML = `<i data-lucide="sun"></i>`;
            localStorage.setItem("siteTheme", "light");
        } else {
            siteTheme = "dark";
            document.body.classList.remove("light-mode");
            themeBtn.innerHTML = `<i data-lucide="moon"></i>`;
            localStorage.setItem("siteTheme", "dark");
        }
        lucide.createIcons();
    });
}

// ============================================================
// ANIMATED SEARCH PLACEHOLDER
// ============================================================

function initAnimatedPlaceholder() {
    const hints = [
        "Search surah name…",
        "Search by number…",
        "Search surah name…",
        "e.g. 'Al-Baqarah' or '2'…",
    ];
    let idx = 0;

    function cyclePlaceholder() {
        idx = (idx + 1) % hints.length;
        searchInput.classList.remove("ph-anim");
        void searchInput.offsetWidth;
        searchInput.placeholder = hints[idx];
        searchInput.classList.add("ph-anim");
    }

    searchInput.placeholder = hints[0];
    setInterval(cyclePlaceholder, 3200);
}

// ============================================================
// FILTER BAR — wires the HTML already in the DOM
// ============================================================

function initFilterBar() {
    const filterBtn = document.getElementById("explorer-filter-btn");
    const dropdown  = document.getElementById("filter-dropdown");
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
            pill.classList.remove("active");
            activeFilter = "all";
        } else {
            dropdown.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
            pill.classList.add("active");
            activeFilter = pill.dataset.filter;
        }

        renderSurahs(getFilteredSurahs());
        dropdown.classList.remove("open");
        filterBtn.classList.remove("filter-active");
        filterBtn.style.background = activeFilter === "all"
            ? "rgba(16,185,129,0.12)"
            : "rgba(16,185,129,0.3)";
    });

    document.addEventListener("click", e => {
        if (!e.target.closest("#filter-clear-btn")) return;
        dropdown.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
        activeFilter = "all";
        renderSurahs(getFilteredSurahs());
        filterBtn.style.background = "rgba(16,185,129,0.12)";
        dropdown.classList.remove("open");
        filterBtn.classList.remove("filter-active");
    });
}

// ============================================================
// JUZ / HIZB HELPERS
// ============================================================

function compareAyahRef(a, b) {
    if (a.surah !== b.surah) return a.surah - b.surah;
    return a.ayah - b.ayah;
}

function surahOverlapsRange(surahNum, ayahCount, rangeStart, rangeEnd) {
    const surahStart = { surah: surahNum, ayah: 1 };
    const surahEnd   = { surah: surahNum, ayah: ayahCount };
    return compareAyahRef(surahEnd, rangeStart) >= 0 && compareAyahRef(surahStart, rangeEnd) < 0;
}

function buildSurahSetForRange(rangeStart, rangeEnd, surahList) {
    const set = new Set();
    surahList.forEach(s => {
        if (surahOverlapsRange(s.number, s.numberOfAyahs, rangeStart, rangeEnd)) {
            set.add(s.number);
        }
    });
    return set;
}

// ============================================================
// BOOKMARKS
// ============================================================

function getBookmarks() {
    try {
        return JSON.parse(localStorage.getItem("bookmarks") || "[]");
    } catch {
        return [];
    }
}

function saveBookmarks(list) {
    localStorage.setItem("bookmarks", JSON.stringify(list));
}

function bookmarkKey(surah, ayah) {
    return `${surah}:${ayah}`;
}

function isBookmarked(surah, ayah) {
    return getBookmarks().some(b => b.surah === surah && b.ayah === ayah);
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function formatBookmarkDate(ts) {
    return new Date(ts).toLocaleDateString(undefined, {
        month: "short", day: "numeric", year: "numeric",
    });
}

function toggleBookmark(entry) {
    let list = getBookmarks();
    const key = bookmarkKey(entry.surah, entry.ayah);
    const idx = list.findIndex(b => bookmarkKey(b.surah, b.ayah) === key);

    if (idx >= 0) {
        list.splice(idx, 1);
        showToast("Bookmark removed");
    } else {
        list.unshift({ ...entry, savedAt: Date.now() });
        showToast("Verse bookmarked ✓");
    }

    saveBookmarks(list);
    renderBookmarks();
    refreshBookmarkButtonStates();
}

function renderBookmarks() {
    const listEl  = document.getElementById("bookmarks-list");
    const emptyEl = document.getElementById("bookmarks-empty");
    const countEl = document.getElementById("bookmarks-count");
    if (!listEl) return;

    const bookmarks = getBookmarks();
    if (countEl) countEl.textContent = `${bookmarks.length} saved`;

    if (!bookmarks.length) {
        listEl.innerHTML = `
            <div class="bookmarks-empty" id="bookmarks-empty">
                <i data-lucide="bookmark"></i>
                <p>No bookmarks yet. Save verses from the reader or daily ayah.</p>
            </div>`;
        lucide.createIcons();
        return;
    }

    listEl.innerHTML = bookmarks.map(b => `
        <article class="bookmark-card">
            <div class="bookmark-card-main">
                <div class="bookmark-card-meta">
                    <span class="bookmark-tag">${escapeHtml(b.surahName)} · Ayah ${b.ayah}</span>
                    <span class="bookmark-date">${formatBookmarkDate(b.savedAt)}</span>
                </div>
                <div class="bookmark-arabic">${escapeHtml(b.arabic)}</div>
                <div class="bookmark-translation">${escapeHtml(b.translation)}</div>
            </div>
            <div class="bookmark-actions">
                <button type="button" class="open-bookmark" data-surah="${b.surah}" data-ayah="${b.ayah}" title="Open in reader">
                    <i data-lucide="book-open"></i>
                </button>
                <button type="button" class="remove-bookmark" data-surah="${b.surah}" data-ayah="${b.ayah}" title="Remove bookmark">
                    <i data-lucide="trash-2"></i>
                </button>
            </div>
        </article>
    `).join("");

    lucide.createIcons();
    wireBookmarkCards();
}

function wireBookmarkCards() {
    document.querySelectorAll(".open-bookmark").forEach(btn => {
        btn.addEventListener("click", () => {
            selectedSurah = Number(btn.dataset.surah);
            readBtn.click();
            setTimeout(() => scrollToActiveVerse(Number(btn.dataset.ayah)), 1200);
        });
    });

    document.querySelectorAll(".remove-bookmark").forEach(btn => {
        btn.addEventListener("click", () => {
            let list = getBookmarks().filter(b =>
                !(b.surah === Number(btn.dataset.surah) && b.ayah === Number(btn.dataset.ayah))
            );
            saveBookmarks(list);
            renderBookmarks();
            refreshBookmarkButtonStates();
            showToast("Bookmark removed");
        });
    });
}

function refreshBookmarkButtonStates() {
    document.querySelectorAll(".bookmark-btn").forEach(btn => {
        const surah = Number(btn.dataset.surah);
        const ayah  = Number(btn.dataset.ayah);
        const saved = isBookmarked(surah, ayah);
        btn.classList.toggle("bookmarked", saved);
        btn.innerHTML = saved
            ? `<i data-lucide="bookmark-check"></i>`
            : `<i data-lucide="bookmark"></i>`;
        btn.title = saved ? "Remove bookmark" : "Bookmark verse";
    });

    const dailyBtn = document.getElementById("daily-bookmark-btn");
    if (dailyBtn && dailyAyahData) {
        const saved = isBookmarked(dailyAyahData.surah, dailyAyahData.ayah);
        dailyBtn.classList.toggle("bookmarked", saved);
        dailyBtn.innerHTML = saved
            ? `<i data-lucide="bookmark-check"></i>`
            : `<i data-lucide="bookmark"></i>`;
        dailyBtn.title = saved ? "Remove bookmark" : "Bookmark this ayah";
    }

    lucide.createIcons();
}

function initBookmarks() {
    renderBookmarks();

    document.getElementById("bookmarks-clear-btn")?.addEventListener("click", () => {
        if (!getBookmarks().length) return;
        if (!confirm("Remove all bookmarks?")) return;
        saveBookmarks([]);
        renderBookmarks();
        refreshBookmarkButtonStates();
        showToast("All bookmarks cleared");
    });

    document.getElementById("daily-bookmark-btn")?.addEventListener("click", () => {
        if (!dailyAyahData) return;
        toggleBookmark(dailyAyahData);
    });
}

// ============================================================
// LOAD JUZ / HIZB META + POPULATE PILLS
// ============================================================

async function loadJuzData() {
    const juzContainer  = document.getElementById("juz-pills");
    const hizbContainer = document.getElementById("hizb-pills");
    const loadingHtml   = `<span class="filter-loading">Loading…</span>`;

    if (juzContainer)  juzContainer.innerHTML  = loadingHtml;
    if (hizbContainer) hizbContainer.innerHTML = loadingHtml;

    try {
        const res  = await fetch("https://api.alquran.cloud/v1/meta");
        const meta = await res.json();
        const d    = meta.data;

        const surahList = (allSurahs.length ? allSurahs : d.surahs?.references) || [];
        const juzRefs   = d.juzs?.references || [];
        const hizbRefs  = d.hizbQuarters?.references || [];

        window._juzSurahMap = {};
        juzRefs.forEach((start, i) => {
            const end = juzRefs[i + 1] || { surah: 114, ayah: Number.MAX_SAFE_INTEGER };
            window._juzSurahMap[i + 1] = buildSurahSetForRange(start, end, surahList);
        });

        window._hizbSurahMap = {};
        for (let h = 1; h <= 60; h++) {
            const qIdx  = (h - 1) * 4;
            const start = hizbRefs[qIdx];
            const end   = hizbRefs[qIdx + 4] || { surah: 114, ayah: Number.MAX_SAFE_INTEGER };
            if (start) {
                window._hizbSurahMap[h] = buildSurahSetForRange(start, end, surahList);
            }
        }

        if (juzContainer) {
            juzContainer.innerHTML = Array.from({ length: 30 }, (_, i) => i + 1)
                .map(n => `<button type="button" class="fpill" data-filter="juz-${n}">Juz ${n}</button>`)
                .join("");
        }

        if (hizbContainer) {
            hizbContainer.innerHTML = Array.from({ length: 60 }, (_, i) => i + 1)
                .map(n => `<button type="button" class="fpill" data-filter="hizb-${n}">Hizb ${n}</button>`)
                .join("");
        }

    } catch (err) {
        console.error("Failed to load juz/hizb meta:", err);
        const errHtml = `<span class="filter-error">Could not load filters</span>`;
        if (juzContainer)  juzContainer.innerHTML  = errHtml;
        if (hizbContainer) hizbContainer.innerHTML = errHtml;
    }
}

// ============================================================
// FILTER LOGIC
// ============================================================

function getFilteredSurahs() {
    const val = searchInput.value.trim().toLowerCase();
    let base  = allSurahs;

    if (activeFilter === "makkah") {
        base = allSurahs.filter(s => s.revelationType === "Meccan");
    } else if (activeFilter === "madinah") {
        base = allSurahs.filter(s => s.revelationType === "Medinan");
    } else if (activeFilter.startsWith("juz-")) {
        const num     = Number(activeFilter.split("-")[1]);
        const allowed = window._juzSurahMap[num] || new Set();
        base = allSurahs.filter(s => allowed.has(s.number));
    } else if (activeFilter.startsWith("hizb-")) {
        const num     = Number(activeFilter.split("-")[1]);
        const allowed = window._hizbSurahMap[num] || new Set();
        base = allSurahs.filter(s => allowed.has(s.number));
    }

    if (!val) return base;
    return base.filter(s =>
        s.englishName.toLowerCase().includes(val) ||
        s.name.toLowerCase().includes(val)         ||
        String(s.number) === val
    );
}

searchInput.addEventListener("input", () => renderSurahs(getFilteredSurahs()));

// ============================================================
// DAILY AYAH
// ============================================================

async function loadDailyAyah() {
    try {
        const now     = new Date();
        const seed    = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
        const ayahNum = (seed % 6236) + 1;

        const [ayahRes, audioRes] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}/editions/quran-uthmani,en.sahih`),
            fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}/${currentReciter}`)
        ]);

        const ayahData  = await ayahRes.json();
        const audioData = await audioRes.json();

        const arabicEl = document.querySelector(".ayah-arabic");
        const transEl  = document.querySelector(".ayah-translation");
        if (arabicEl) arabicEl.textContent = ayahData.data[0].text;
        if (transEl)  transEl.textContent  = ayahData.data[1].text;

        dailyAyahData = {
            surah:       ayahData.data[0].surah.number,
            ayah:        ayahData.data[0].numberInSurah,
            surahName:   ayahData.data[0].surah.englishName,
            arabic:      ayahData.data[0].text,
            translation: ayahData.data[1].text,
        };
        refreshBookmarkButtonStates();

        const infoH3   = document.querySelector(".audio-info h3");
        const infoSpan = document.querySelector(".audio-info span");
        if (infoH3)   infoH3.textContent   = ayahData.data[0].surah.englishName;
        if (infoSpan) infoSpan.textContent = `Verse ${ayahData.data[0].numberInSurah}`;

        if (quranAudio) quranAudio.src = audioData.data.audio;
        wireHomepageAudioPlayer(audioData.data.audio);

    } catch (err) {
        console.error("Failed to load daily ayah:", err);
    }
}

function wireHomepageAudioPlayer(audioUrl) {
    const playBtn       = document.getElementById("play-btn");
    const progressEl    = document.getElementById("audio-progress");
    const progressFill  = progressEl?.querySelector(".audio-progress-fill");
    const currentTimeEl = document.getElementById("current-time");
    const durationEl    = document.getElementById("duration");
    const muteBtn       = document.getElementById("mute-btn");
    const volumeSlider  = document.getElementById("volume-slider");
    const speedBton     = document.getElementById("speed-bton");
    const skipBack      = document.getElementById("skip-back-btn");
    const skipFwd       = document.getElementById("skip-forward-btn");
    const reciterSel    = document.getElementById("reciter-select");

    if (!quranAudio || !playBtn) return;

    quranAudio.src    = audioUrl;
    quranAudio.volume = 0.8;
    let homeSpeed     = 1;

    playBtn.onclick = () => {
        if (quranAudio.paused) {
            quranAudio.play();
            playBtn.innerHTML = `<i data-lucide="pause"></i>`;
        } else {
            quranAudio.pause();
            playBtn.innerHTML = `<i data-lucide="play"></i>`;
        }
        lucide.createIcons();
    };

    quranAudio.addEventListener("timeupdate", () => {
        if (!quranAudio.duration) return;
        const pct = (quranAudio.currentTime / quranAudio.duration) * 100;
        if (progressFill) progressFill.style.width = pct + "%";
        if (currentTimeEl) currentTimeEl.textContent = formatTime(quranAudio.currentTime);
        if (durationEl)    durationEl.textContent    = formatTime(quranAudio.duration);
    });

    if (progressEl) {
        progressEl.addEventListener("click", e => {
            const rect = progressEl.getBoundingClientRect();
            quranAudio.currentTime = ((e.clientX - rect.left) / rect.width) * quranAudio.duration;
        });
    }

    if (volumeSlider) volumeSlider.addEventListener("input", () => { quranAudio.volume = volumeSlider.value / 100; });

    if (muteBtn) {
        muteBtn.onclick = () => {
            quranAudio.muted = !quranAudio.muted;
            muteBtn.innerHTML = quranAudio.muted ? `<i data-lucide="volume-x"></i>` : `<i data-lucide="volume-2"></i>`;
            lucide.createIcons();
        };
    }

    if (speedBton) {
        speedBton.onclick = () => {
            homeSpeed = homeSpeed >= 2 ? 1 : homeSpeed + 0.25;
            quranAudio.playbackRate = homeSpeed;
            speedBton.textContent   = `${homeSpeed}x`;
        };
    }

    if (skipBack) skipBack.onclick = () => { quranAudio.currentTime = Math.max(0, quranAudio.currentTime - 10); };
    if (skipFwd)  skipFwd.onclick  = () => { quranAudio.currentTime = Math.min(quranAudio.duration || 0, quranAudio.currentTime + 10); };

    if (reciterSel) {
        reciterSel.addEventListener("change", async () => {
            try {
                const now     = new Date();
                const seed    = now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
                const ayahNum = (seed % 6236) + 1;
                const res     = await fetch(`https://api.alquran.cloud/v1/ayah/${ayahNum}/${reciterSel.value}`);
                const d       = await res.json();
                quranAudio.src = d.data.audio;
                quranAudio.load();
                if (playBtn) { playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
            } catch (err) { console.error("Reciter switch failed:", err); }
        });
    }

    quranAudio.addEventListener("ended", () => {
        if (playBtn) { playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
    });
}

// ============================================================
// REPEAT MODE BUTTON — wired from HTML (#repeat-btn)
// ============================================================

function initRepeatButton() {
    const btn = document.getElementById("repeat-btn");
    if (!btn) return;
    btn.addEventListener("click", () => {
        if (repeatMode === "off") {
            repeatMode = "surah";
            btn.innerHTML = `<i data-lucide="repeat-1"></i> Surah`;
            showToast("Repeat: current Surah");
        } else if (repeatMode === "surah") {
            repeatMode = "quran";
            btn.innerHTML = `<i data-lucide="repeat"></i> Qur'an`;
            showToast("Repeat: whole Qur'an");
        } else {
            repeatMode = "off";
            btn.innerHTML = `<i data-lucide="repeat"></i> Off`;
            showToast("Repeat: off");
        }
        lucide.createIcons();
    });
}

// ============================================================
// FLOATING PLAYER — fix icons from HTML emoji to lucide
// ============================================================

function fixFloatingPlayerIcons() {
    miniPlay.innerHTML = `<i data-lucide="play"></i>`;
    miniPrev.innerHTML = `<i data-lucide="skip-back"></i>`;
    miniNext.innerHTML = `<i data-lucide="skip-forward"></i>`;
    lucide.createIcons();
}

// ============================================================
// READER MODE UI
// ============================================================

function updateReaderModeUI() {
    document.querySelectorAll(".verse-arabic").forEach(el => {
        el.style.display = readerMode === "translation" ? "none" : "block";
    });
    document.querySelectorAll(".verse-translation").forEach(el => {
        el.style.display = readerMode === "arabic" ? "none" : "block";
    });
    document.querySelectorAll(".toggle-btn").forEach(btn => btn.classList.remove("active"));
    if (readerMode === "both")        modeBoth.classList.add("active");
    if (readerMode === "arabic")      modeArabic.classList.add("active");
    if (readerMode === "translation") modeTranslation.classList.add("active");
}

modeBoth.addEventListener("click",        () => { readerMode = "both";        updateReaderModeUI(); });
modeArabic.addEventListener("click",      () => { readerMode = "arabic";      updateReaderModeUI(); });
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
document.getElementById("font-reset").addEventListener("click",    () => { arabicFontSize = 3;    translationFontSize = 1.05;  applyFontSizes(); });

// ============================================================
// CONTINUE READING
// ============================================================

function updateContinueReading() {
    const saved = JSON.parse(localStorage.getItem("lastRead"));
    if (!saved) return;
    document.getElementById("continue-surah").textContent = saved.surahName;
    document.getElementById("continue-ayah").textContent  = `Ayah ${saved.ayah} of ${saved.totalAyahs}`;
    document.getElementById("continue-meta").textContent  = `${saved.totalAyahs - saved.ayah} Ayahs Remaining`;
    const percent = saved.totalAyahs ? Math.round((saved.ayah / saved.totalAyahs) * 100) : 0;
    document.getElementById("reading-status").textContent    = percent >= 100 ? "Completed" : "In Progress";
    document.getElementById("continue-progress").textContent = `${percent}% Completed`;
    document.querySelector(".progress-fill").style.width     = percent + "%";
}

document.getElementById("resume-reading-btn").addEventListener("click", () => {
    const saved = JSON.parse(localStorage.getItem("lastRead"));
    if (!saved || !saved.totalAyahs) return;
    selectedSurah = Number(saved.surah);
    readBtn.click();
    setTimeout(() => scrollToActiveVerse(saved.ayah), 1200);
});

// ============================================================
// FULL-SURAH AUDIO PLAYER
// ============================================================

function loadSurahAudio() {
    if (!selectedSurah) return;
    const url = `https://cdn.islamic.network/quran/audio-surah/128/${currentReciter}/${selectedSurah}.mp3`;
    audioPlayer.src = url;
    audioPlayer.load();
}

playButton.addEventListener("click", () => {
    if (!audioPlayer.src) return;
    if (!ayahPlayer.paused) {
        ayahPlayer.pause();
        if (activePlayButton) { activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); activePlayButton = null; }
    }
    activeAudioMode = "surah";
    if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = `<i data-lucide="pause"></i>`;
        syncMiniPlayIcon(true);
        showFloatingPlayer(document.getElementById("reader-title").textContent, "Full Surah");
    } else {
        audioPlayer.pause();
        playButton.innerHTML = `<i data-lucide="play"></i>`;
        syncMiniPlayIcon(false);
    }
    lucide.createIcons();
});

audioPlayer.addEventListener("timeupdate", () => {
    progressBar2.max   = audioPlayer.duration || 0;
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
    } else {
        syncMiniPlayIcon(false);
    }
});

const speedBtn   = document.getElementById("speed-btn");
let playbackRate = 1;
speedBtn?.addEventListener("click", () => {
    playbackRate = playbackRate >= 2 ? 1 : playbackRate + 0.25;
    audioPlayer.playbackRate = playbackRate;
    speedBtn.textContent     = `${playbackRate}x`;
});

document.getElementById("next-surah-audio")?.addEventListener("click", () => { if (selectedSurah < 114) { selectedSurah++; readBtn.click(); } });
document.getElementById("prev-surah-audio")?.addEventListener("click", () => { if (selectedSurah > 1)   { selectedSurah--; readBtn.click(); } });

// ============================================================
// LOAD SURAHS
// ============================================================

async function loadSurahs() {
    try {
        const res  = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await res.json();
        allSurahs  = data.data;
        renderSurahs(allSurahs);
        await loadJuzData();
    } catch (err) {
        console.error("Failed to load Surahs:", err);
    }
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
        <div class="surah-card"
            data-number="${surah.number}"
            data-name="${surah.englishName}"
            data-arabic="${surah.name}"
            data-ayahs="${surah.numberOfAyahs}"
            data-type="${surah.revelationType}">
            <button class="favorite-btn ${isFav ? "active" : ""}" data-id="${surah.number}">★</button>
            <div class="surah-number">${surah.number}</div>
            <h3>${surah.englishName}</h3>
            <div class="surah-english">${surah.name}</div>
            <div class="surah-meta">
                <span>${surah.numberOfAyahs} Ayahs</span>
                <span>${surah.revelationType}</span>
            </div>
        </div>`;
    });
    grid.innerHTML = html || `<p style="color:#94a3b8;grid-column:1/-1;text-align:center;padding:2rem">No surahs found.</p>`;
    activateFavorites();
    activateCards();
}

// ============================================================
// FAVORITES
// ============================================================

function activateFavorites() {
    document.querySelectorAll(".favorite-btn").forEach(btn => {
        btn.addEventListener("click", e => {
            e.stopPropagation();
            const id  = Number(btn.dataset.id);
            let favs  = JSON.parse(localStorage.getItem("favorites")) || [];
            favs      = favs.includes(id) ? favs.filter(x => x !== id) : [...favs, id];
            localStorage.setItem("favorites", JSON.stringify(favs));
            renderSurahs(getFilteredSurahs());
        });
    });
}

// ============================================================
// SURAH CARD → MODAL
// ============================================================

function activateCards() {
    document.querySelectorAll(".surah-card").forEach(card => {
        card.addEventListener("click", () => {
            selectedSurah = Number(card.dataset.number);
            document.getElementById("modal-surah-number").textContent = card.dataset.number;
            document.getElementById("modal-surah-name").textContent   = card.dataset.name;
            document.getElementById("modal-surah-arabic").textContent = card.dataset.arabic;
            document.getElementById("modal-surah-ayahs").textContent  = card.dataset.ayahs + " Ayahs";
            document.getElementById("modal-surah-type").textContent   = card.dataset.type;
            surahModal.classList.add("active");
            lucide.createIcons();
        });
    });
}

// ============================================================
// MODAL CLOSE
// ============================================================

modalClose.addEventListener("click", () => surahModal.classList.remove("active"));
document.querySelector(".surah-modal-overlay").addEventListener("click", () => surahModal.classList.remove("active"));

// ============================================================
// BISMILLAH CLEAN
// ============================================================

function cleanAyah(text, surahNumber, ayahNumber) {
    if (surahNumber === 9 || surahNumber === 1) return text;
    if (ayahNumber === 1) {
        const words = text.split(" ");
        if (words.slice(0, 4).join(" ").includes("بِسْمِ"))
            return words.slice(4).join(" ").trim();
    }
    return text;
}

// ============================================================
// READ SURAH → OPEN READER MODAL
// ============================================================

readBtn.addEventListener("click", async () => {
    if (!selectedSurah) return;
    try {
        const res  = await fetch(`https://api.alquran.cloud/v1/surah/${selectedSurah}/editions/quran-uthmani,en.sahih`);
        const data = await res.json();

        const arabicAyahs  = data.data[0].ayahs;
        const englishAyahs = data.data[1].ayahs;
        totalAyahsInSurah  = arabicAyahs.length;

        document.getElementById("reader-title").textContent       = data.data[0].englishName;
        document.getElementById("reader-arabic-name").textContent = data.data[0].name;
        document.getElementById("reader-meaning").textContent     = data.data[0].englishNameTranslation;
        document.getElementById("reader-meta").textContent        = `${arabicAyahs.length} Ayahs • ${data.data[0].revelationType}`;

        const bismillahContainer = document.getElementById("bismillah-container");
        bismillahContainer.innerHTML = (selectedSurah !== 1 && selectedSurah !== 9)
            ? `<div class="bismillah-header">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>`
            : "";

        let html = "";
        arabicAyahs.forEach((ayah, index) => {
            const cleaned = cleanAyah(ayah.text, selectedSurah, ayah.numberInSurah);
            html += `
            <div class="verse-card" data-surah="${selectedSurah}" data-ayah="${ayah.numberInSurah}">
                <div class="verse-number">${ayah.numberInSurah}</div>
                <div class="verse-arabic">${cleaned}</div>
                <div class="verse-translation">${englishAyahs[index].text}</div>
                <div class="verse-actions">
                    <button class="ayah-action play-btn" data-surah="${selectedSurah}" data-ayah="${ayah.numberInSurah}" title="Play ayah">
                        <i data-lucide="play"></i>
                    </button>
                    <button class="ayah-action bookmark-btn" data-surah="${selectedSurah}" data-ayah="${ayah.numberInSurah}" title="Bookmark verse">
                        <i data-lucide="bookmark"></i>
                    </button>
                    <button class="ayah-action copy-btn" title="Copy verse"><i data-lucide="copy"></i></button>
                    <button class="ayah-action share-btn" title="Share verse"><i data-lucide="share-2"></i></button>
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

        document.querySelectorAll(".verse-card").forEach(card => observer.observe(card));

        applyFontSizes();
        updateReaderModeUI();
        loadSurahAudio();
        applyReaderTheme(readerThemeKey);
        refreshBookmarkButtonStates();

        readerModal.classList.add("active");
        document.body.style.overflow = "hidden";
        requestAnimationFrame(() => { document.querySelector(".reader-content").scrollTop = 0; });
        lucide.createIcons();

    } catch (err) {
        console.error("Failed to load Surah:", err);
    }
});

// ============================================================
// READER CLOSE
// ============================================================

function closeReader() {
    readerModal.classList.remove("active");
    document.body.style.overflow = "auto";
    audioPlayer.pause();
    ayahPlayer.pause();
    if (activePlayButton) { activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); activePlayButton = null; }
    playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    syncMiniPlayIcon(false);
    hideFloatingPlayer();
    document.getElementById("reader-theme-panel")?.classList.remove("open");
}

readerClose.addEventListener("click", closeReader);
document.querySelector(".reader-overlay").addEventListener("click", closeReader);

// ============================================================
// SETTINGS / AUDIO DRAWER
// ============================================================

const settingsBtn    = document.getElementById("reader-settings-btn");
const audioBtn       = document.getElementById("reader-audio-btn");
const settingsDrawer = document.getElementById("settings-drawer");
const audioDrawer    = document.getElementById("audio-drawer");

settingsBtn.addEventListener("click", () => { audioDrawer.classList.remove("active"); settingsDrawer.classList.toggle("active"); });
audioBtn.addEventListener("click",    () => { settingsDrawer.classList.remove("active"); audioDrawer.classList.toggle("active"); });

// ============================================================
// FAVOURITE RECITER
// ============================================================

document.getElementById("favorite-reciter")?.addEventListener("click", function () {
    localStorage.setItem("favoriteReciter", currentReciter);
    this.innerHTML = `<i data-lucide="heart"></i>`;
    this.style.color = "#10b981";
    lucide.createIcons();
});

// ============================================================
// RECITER SWITCH (reader)
// ============================================================

document.addEventListener("change", e => {
    if (e.target.id === "reciter-select2") {
        currentReciter = e.target.value;
        document.getElementById("current-reciter-badge").textContent =
            e.target.options[e.target.selectedIndex].text;
        loadSurahAudio();
    }
});

// ============================================================
// PER-AYAH PLAY BUTTONS
// ============================================================

document.addEventListener("click", async e => {
    const playBtn = e.target.closest(".play-btn");
    if (!playBtn) return;

    if (!audioPlayer.paused) {
        audioPlayer.pause();
        playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    }

    activeAudioMode = "ayah";

    if (activePlayButton === playBtn && !ayahPlayer.paused) {
        ayahPlayer.pause();
        playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
        syncMiniPlayIcon(false);
        return;
    }

    if (activePlayButton && activePlayButton !== playBtn) {
        activePlayButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
    }

    const surah = playBtn.dataset.surah;
    const ayah  = playBtn.dataset.ayah;

    try {
        const res  = await fetch(`https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${currentReciter}`);
        const data = await res.json();

        ayahPlayer.src = data.data.audio;
        ayahPlayer.play();

        activePlayButton   = playBtn;
        currentAyahPlaying = Number(ayah);

        playBtn.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();

        scrollToActiveVerse(currentAyahPlaying);
        showFloatingPlayer(document.getElementById("reader-title").textContent, `Ayah ${ayah}`);
        syncMiniPlayIcon(true);

        ayahPlayer.onended = () => {
            playBtn.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons();
            activePlayButton  = null;
            const nextBtn = document.querySelector(`[data-ayah="${currentAyahPlaying + 1}"] .play-btn`);
            if (nextBtn) { nextBtn.click(); }
            else { syncMiniPlayIcon(false); floatingAyah.textContent = "Finished"; }
        };

    } catch (err) {
        console.error("Ayah audio error:", err);
    }
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
        if (activeAudioMode === "surah") { playButton.innerHTML = `<i data-lucide="play"></i>`;  lucide.createIcons(); }
    }
});

miniNext.addEventListener("click", () => {
    if (activeAudioMode === "ayah") {
        const nextBtn = document.querySelector(`[data-ayah="${currentAyahPlaying + 1}"] .play-btn`);
        if (nextBtn) nextBtn.click();
    } else {
        if (selectedSurah < 114) {
            selectedSurah++;
            readBtn.click();
            setTimeout(() => {
                audioPlayer.play(); playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();
                syncMiniPlayIcon(true);
                showFloatingPlayer(document.getElementById("reader-title").textContent, "Full Surah");
            }, 1800);
        }
    }
});

miniPrev.addEventListener("click", () => {
    if (activeAudioMode === "ayah") {
        const prevBtn = document.querySelector(`[data-ayah="${currentAyahPlaying - 1}"] .play-btn`);
        if (prevBtn) prevBtn.click();
    } else {
        if (selectedSurah > 1) {
            selectedSurah--;
            readBtn.click();
            setTimeout(() => {
                audioPlayer.play(); playButton.innerHTML = `<i data-lucide="pause"></i>`; lucide.createIcons();
                syncMiniPlayIcon(true);
                showFloatingPlayer(document.getElementById("reader-title").textContent, "Full Surah");
            }, 1800);
        }
    }
});

// ============================================================
// BOOKMARK VERSE (reader)
// ============================================================

document.addEventListener("click", e => {
    const btn = e.target.closest(".bookmark-btn");
    if (!btn) return;

    const card = btn.closest(".verse-card");
    if (!card) return;

    toggleBookmark({
        surah:       Number(btn.dataset.surah),
        ayah:        Number(btn.dataset.ayah),
        surahName:   document.getElementById("reader-title")?.textContent || "Surah",
        arabic:      card.querySelector(".verse-arabic")?.innerText || "",
        translation: card.querySelector(".verse-translation")?.innerText || "",
    });
});

// ============================================================
// COPY
// ============================================================

document.addEventListener("click", async e => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const card = btn.closest(".verse-card");
    const arabic      = card.querySelector(".verse-arabic")?.innerText || "";
    const translation = card.querySelector(".verse-translation")?.innerText || "";
    try {
        await navigator.clipboard.writeText(`${arabic}\n\n${translation}`);
        btn.classList.add("copied"); showToast("Verse copied ✓");
        setTimeout(() => btn.classList.remove("copied"), 800);
    } catch { showToast("Copy failed"); }
});

// ============================================================
// SHARE
// ============================================================

document.addEventListener("click", async e => {
    const btn = e.target.closest(".share-btn");
    if (!btn) return;
    const card = btn.closest(".verse-card");
    const arabic      = card.querySelector(".verse-arabic")?.innerText || "";
    const translation = card.querySelector(".verse-translation")?.innerText || "";
    const text        = `${arabic}\n\n${translation}`;
    try {
        if (navigator.share) { await navigator.share({ title: "Qur'an Verse", text }); showToast("Shared ✓"); }
        else                  { await navigator.clipboard.writeText(text); showToast("Copied to clipboard"); }
    } catch { showToast("Share cancelled"); }
});

// ============================================================
// INIT
// ============================================================

loadSurahs();
loadDailyAyah();
initAnimatedPlaceholder();
initThemeToggle();
initFilterBar();
initRepeatButton();
initReaderThemePanel();
initBookmarks();
fixFloatingPlayerIcons();
updateContinueReading();

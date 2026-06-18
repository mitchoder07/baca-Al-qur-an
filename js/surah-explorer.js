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
let siteTheme           = "dark";   // "dark" | "light"
let readerThemeKey      = "dark";   // "dark" | "warm" | "sepia" | "light"

// surahNumber → juzNumber (built from API)
window._surahJuzMap  = {};   // surahNum → juzNum (1-30)
window._surahHizbMap = {};   // surahNum → hizbNum (1-60, first hizb it appears in)
window._juzSurahMap  = {};   // juzNum  → Set of surahNums
window._hizbSurahMap = {};   // hizbNum → Set of surahNums

// ============================================================
// READER THEMES
// ============================================================

const readerThemes = {
    dark: {
        bg:          "linear-gradient(180deg, #0f172a, #111827)",
        contentBg:   "#0f172a",
        card:        "rgba(255,255,255,0.04)",
        cardBorder:  "rgba(255,255,255,0.08)",
        text:        "#ffffff",
        subtext:     "#cbd5e1",
        arabic:      "#ffffff",
        number:      "linear-gradient(135deg,#34d399,#10b981)",
        numberText:  "#111827",
        bismillah:   "var(--primary)",
    },
    warm: {
        bg:          "linear-gradient(180deg,#1a1208,#231a0c)",
        contentBg:   "#1a1208",
        card:        "rgba(255,220,120,0.04)",
        cardBorder:  "rgba(255,200,80,0.1)",
        text:        "#f5e6c8",
        subtext:     "#c4a97a",
        arabic:      "#f5e6c8",
        number:      "linear-gradient(135deg,#d4a94e,#b8892c)",
        numberText:  "#1a1208",
        bismillah:   "#d4a94e",
    },
    sepia: {
        bg:          "linear-gradient(180deg,#2d1f0e,#3d2a14)",
        contentBg:   "#2d1f0e",
        card:        "rgba(255,210,140,0.06)",
        cardBorder:  "rgba(200,150,80,0.15)",
        text:        "#ede0c8",
        subtext:     "#b89a6f",
        arabic:      "#ede0c8",
        number:      "linear-gradient(135deg,#c49a45,#a07830)",
        numberText:  "#2d1f0e",
        bismillah:   "#c49a45",
    },
    light: {
        bg:          "linear-gradient(180deg,#f8fafc,#f1f5f9)",
        contentBg:   "#ffffff",
        card:        "#ffffff",
        cardBorder:  "rgba(0,0,0,0.07)",
        text:        "#0f172a",
        subtext:     "#475569",
        arabic:      "#0f172a",
        number:      "linear-gradient(135deg,#34d399,#10b981)",
        numberText:  "#ffffff",
        bismillah:   "var(--primary)",
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
// VERSE HIGHLIGHT + SCROLL
// ============================================================

(function injectVerseActiveStyle() {
    if (document.getElementById("verse-active-style")) return;
    const s = document.createElement("style");
    s.id = "verse-active-style";
    s.textContent = `
        @keyframes verseHighlight {
            0%   { border-color: rgba(16,185,129,0.9); box-shadow: 0 0 0 0   rgba(16,185,129,0.4); background: rgba(16,185,129,0.13); }
            35%  { border-color: rgba(16,185,129,1);   box-shadow: 0 0 0 7px rgba(16,185,129,0.12); background: rgba(16,185,129,0.18); }
            100% { border-color: rgba(255,255,255,0.08); box-shadow: 0 0 0 0 rgba(16,185,129,0);    background: transparent; }
        }
        .verse-card.verse-active { animation: verseHighlight 1.8s ease forwards; }
    `;
    document.head.appendChild(s);
})();

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
// SITE-WIDE DARK / LIGHT MODE
// ============================================================

(function injectLightModeStyles() {
    if (document.getElementById("light-mode-style")) return;
    const s = document.createElement("style");
    s.id = "light-mode-style";
    s.textContent = `
        body.light-mode {
            --dark:       #f8fafc;
            --dark-light: #ffffff;
            --white:      #0f172a;
            --text:       #475569;
            --border:     rgba(0,0,0,0.08);
            background:   #f1f5f9;
            color:        #0f172a;
        }
        body.light-mode .navbar {
            background: rgba(248,250,252,0.85);
            border-bottom: 1px solid rgba(0,0,0,0.08);
        }
        body.light-mode .navbar a,
        body.light-mode .logo { color: #0f172a; }
        body.light-mode .nav-actions button,
        body.light-mode .audio-btn,
        body.light-mode .audio-small-btn {
            background: #e2e8f0;
            color: #0f172a;
        }
        body.light-mode .ayah-card,
        body.light-mode .audio-player,
        body.light-mode .surah-card,
        body.light-mode .topic-card,
        body.light-mode .journey-card,
        body.light-mode .reciter-card,
        body.light-mode .continue-card,
        body.light-mode .reflection-card {
            background: #ffffff;
            border-color: rgba(0,0,0,0.07);
            color: #0f172a;
        }
        body.light-mode .surah-card h3,
        body.light-mode .ayah-arabic { color: #0f172a; }
        body.light-mode .ayah-translation,
        body.light-mode .surah-meta,
        body.light-mode .section-header p { color: #475569; }
        body.light-mode #reciter-select,
        body.light-mode #reciter-select option { background: #fff; color: #0f172a; }
        body.light-mode .hero { background: #f8fafc; }
        body.light-mode .hero h1 { color: #0f172a; }
        body.light-mode .bg-glow { opacity: 0.07; }
        body.light-mode .search-container { background: #fff; }
        body.light-mode .search-header input { color: #0f172a; }
    `;
    document.head.appendChild(s);
})();

function initThemeToggle() {
    const themeBtn = document.querySelector(".theme-btn");
    if (!themeBtn) return;

    // Restore saved preference
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
// READER THEME SWITCHER (palette button top-left)
// ============================================================

function injectReaderThemeButton() {
    if (document.getElementById("reader-theme-btn")) return;

    const readerContent = document.querySelector(".reader-content");
    if (!readerContent) return;

    // Inject styles
    if (!document.getElementById("reader-theme-styles")) {
        const s = document.createElement("style");
        s.id = "reader-theme-styles";
        s.textContent = `
            #reader-theme-btn {
                position: sticky;
                top: 0;
                float: left;
                border: none;
                width: 45px;
                height: 45px;
                border-radius: 12px;
                background: rgba(255,255,255,0.06);
                color: white;
                cursor: pointer;
                z-index: 2000;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
            }
            #reader-theme-btn:hover { background: rgba(16,185,129,0.15); }

            #reader-theme-panel {
                display: none;
                position: absolute;
                top: 60px;
                left: 1.5rem;
                background: #111827;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 18px;
                padding: 1rem;
                z-index: 3000;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                animation: filterDrop 0.2s ease;
            }
            #reader-theme-panel.open { display: block; }

            .theme-panel-label {
                font-size: 0.72rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin-bottom: 0.7rem;
                font-weight: 700;
            }

            .theme-swatches {
                display: flex;
                gap: 0.6rem;
            }

            .theme-swatch {
                width: 44px;
                height: 44px;
                border-radius: 12px;
                border: 2px solid transparent;
                cursor: pointer;
                transition: 0.2s;
                position: relative;
                overflow: hidden;
            }
            .theme-swatch:hover { transform: scale(1.08); }
            .theme-swatch.active { border-color: #10b981; }

            .swatch-dark   { background: linear-gradient(135deg,#0f172a,#1e293b); }
            .swatch-warm   { background: linear-gradient(135deg,#1a1208,#3d2a0a); }
            .swatch-sepia  { background: linear-gradient(135deg,#2d1f0e,#4a3015); }
            .swatch-light  { background: linear-gradient(135deg,#f8fafc,#e2e8f0); border-color: rgba(0,0,0,0.12); }

            .swatch-label {
                display: block;
                font-size: 0.65rem;
                text-align: center;
                margin-top: 0.3rem;
                color: #94a3b8;
                font-weight: 600;
            }
        `;
        document.head.appendChild(s);
    }

    // Theme button
    const btn = document.createElement("button");
    btn.id        = "reader-theme-btn";
    btn.title     = "Change theme";
    btn.innerHTML = `<i data-lucide="palette"></i>`;
    readerContent.insertBefore(btn, readerContent.firstChild);

    // Theme panel
    const panel = document.createElement("div");
    panel.id = "reader-theme-panel";
    panel.innerHTML = `
        <div class="theme-panel-label">Reader Theme</div>
        <div class="theme-swatches">
            <div>
                <button class="theme-swatch swatch-dark active"  data-theme="dark"  title="Dark"></button>
                <span class="swatch-label">Dark</span>
            </div>
            <div>
                <button class="theme-swatch swatch-warm"  data-theme="warm"  title="Warm"></button>
                <span class="swatch-label">Warm</span>
            </div>
            <div>
                <button class="theme-swatch swatch-sepia" data-theme="sepia" title="Sepia"></button>
                <span class="swatch-label">Sepia</span>
            </div>
            <div>
                <button class="theme-swatch swatch-light" data-theme="light" title="Light"></button>
                <span class="swatch-label">Light</span>
            </div>
        </div>
    `;
    readerContent.insertBefore(panel, readerContent.children[1]);

    lucide.createIcons();

    btn.addEventListener("click", e => {
        e.stopPropagation();
        panel.classList.toggle("open");
    });

    document.addEventListener("click", e => {
        if (!panel.contains(e.target) && e.target !== btn) {
            panel.classList.remove("open");
        }
    });

    panel.querySelectorAll(".theme-swatch").forEach(swatch => {
        swatch.addEventListener("click", () => {
            panel.querySelectorAll(".theme-swatch").forEach(s => s.classList.remove("active"));
            swatch.classList.add("active");
            applyReaderTheme(swatch.dataset.theme);
            panel.classList.remove("open");
        });
    });
}

function applyReaderTheme(key) {
    readerThemeKey = key;
    const t = readerThemes[key];
    const reader = document.querySelector(".reader-content");
    if (!reader) return;

    reader.style.background = t.bg;
    reader.style.color       = t.text;

    // Update theme button color for light theme visibility
    const themeBtn = document.getElementById("reader-theme-btn");
    if (themeBtn) {
        themeBtn.style.background = key === "light" ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";
        themeBtn.style.color      = key === "light" ? "#0f172a" : "white";
    }

    document.querySelectorAll(".verse-card").forEach(card => {
        card.style.background   = t.card;
        card.style.borderColor  = t.cardBorder;
        card.style.color        = t.text;
    });
    document.querySelectorAll(".verse-arabic").forEach(el => {
        el.style.color = t.arabic;
    });
    document.querySelectorAll(".verse-translation").forEach(el => {
        el.style.color = t.subtext;
    });
    document.querySelectorAll(".verse-number").forEach(el => {
        el.style.background = t.number;
        el.style.color      = t.numberText;
    });
    document.querySelectorAll(".bismillah-header").forEach(el => {
        el.style.color = t.bismillah;
    });
    document.querySelectorAll(".reader-close, .reader-tool-btn, .settings-drawer, .reader-audio-card").forEach(el => {
        if (key === "light") {
            el.style.background = key === "light" ? "#f1f5f9" : "";
            el.style.color      = t.text;
        } else {
            el.style.background = "";
            el.style.color      = "";
        }
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

    if (!document.getElementById("placeholder-style")) {
        const style = document.createElement("style");
        style.id = "placeholder-style";
        style.textContent = `
            @keyframes placeholderFade {
                0%   { opacity: 0; transform: translateY(5px);  }
                18%  { opacity: 1; transform: translateY(0);    }
                78%  { opacity: 1; transform: translateY(0);    }
                100% { opacity: 0; transform: translateY(-5px); }
            }
            #surah-search::placeholder { transition: none; }
            #surah-search.ph-anim::placeholder { animation: placeholderFade 2.8s ease forwards; }
        `;
        document.head.appendChild(style);
    }

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
// FILTER BAR (beside search box)
// ============================================================

function injectFilterBar() {
    if (document.getElementById("explorer-filter-btn")) return;

    if (!document.getElementById("filter-styles")) {
        const s = document.createElement("style");
        s.id = "filter-styles";
        s.textContent = `
            #explorer-filter-btn {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                width: 42px;
                height: 42px;
                border: none;
                border-radius: 12px;
                background: rgba(16,185,129,0.12);
                color: #10b981;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: 0.2s;
                z-index: 3;
            }
            #explorer-filter-btn:hover,
            #explorer-filter-btn.filter-active { background: rgba(16,185,129,0.28); }

            #filter-dropdown {
                display: none;
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                width: min(440px, 96vw);
                background: #111827;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 20px;
                padding: 1.3rem;
                z-index: 100;
                box-shadow: 0 20px 50px rgba(0,0,0,0.45);
                animation: filterDrop 0.2s ease;
            }
            #filter-dropdown.open { display: block; }

            @keyframes filterDrop {
                from { opacity:0; transform: translateY(-8px); }
                to   { opacity:1; transform: translateY(0);    }
            }

            .filter-section-label {
                font-size: 0.72rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin: 1rem 0 0.5rem;
            }
            .filter-section-label:first-child { margin-top: 0; }

            .filter-pill-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.4rem;
                max-height: 110px;
                overflow-y: auto;
            }

            .fpill {
                border: none;
                padding: 0.38rem 0.85rem;
                border-radius: 50px;
                background: rgba(255,255,255,0.05);
                color: #94a3b8;
                cursor: pointer;
                font-size: 0.78rem;
                font-weight: 600;
                transition: 0.18s;
                display: flex;
                align-items: center;
                gap: 0.35rem;
            }
            .fpill svg { width:14px; height:14px; }
            .fpill:hover  { background: rgba(16,185,129,0.12); color: #10b981; }
            .fpill.active { background: rgba(16,185,129,0.22); color: #10b981; border: 1px solid rgba(16,185,129,0.4); }

            .filter-clear-row { margin-top:1rem; text-align:right; }
            #filter-clear-btn {
                border: none;
                background: transparent;
                color: #64748b;
                cursor: pointer;
                font-size: 0.82rem;
                font-weight: 600;
                display: inline-flex;
                align-items: center;
                gap: 0.3rem;
                transition: 0.18s;
            }
            #filter-clear-btn:hover { color: #ef4444; }
            #filter-clear-btn svg { width:14px; height:14px; }

            #surah-search { padding-right: 62px; }
        `;
        document.head.appendChild(s);
    }

    const searchBox = document.querySelector(".explorer-search");
    if (!searchBox) return;
    searchBox.style.position = "relative";

    // Filter button
    const filterBtn = document.createElement("button");
    filterBtn.id        = "explorer-filter-btn";
    filterBtn.title     = "Filter surahs";
    filterBtn.innerHTML = `<i data-lucide="sliders-horizontal"></i>`;
    searchBox.appendChild(filterBtn);
    lucide.createIcons();

    // Dropdown
    const dropdown = document.createElement("div");
    dropdown.id = "filter-dropdown";
    dropdown.innerHTML = buildFilterDropdownHTML();
    searchBox.appendChild(dropdown);
    lucide.createIcons();

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
        if (e.target.id !== "filter-clear-btn" && !e.target.closest("#filter-clear-btn")) return;
        dropdown.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
        activeFilter = "all";
        renderSurahs(getFilteredSurahs());
        filterBtn.style.background = "rgba(16,185,129,0.12)";
        dropdown.classList.remove("open");
        filterBtn.classList.remove("filter-active");
    });
}

function buildFilterDropdownHTML() {
    const juzPills = Array.from({ length: 30 }, (_, i) => i + 1)
        .map(n => `<button class="fpill" data-filter="juz-${n}">Juz ${n}</button>`)
        .join("");

    const hizbPills = Array.from({ length: 60 }, (_, i) => i + 1)
        .map(n => `<button class="fpill" data-filter="hizb-${n}">Hizb ${n}</button>`)
        .join("");

    return `
        <div class="filter-section-label">Place of Revelation</div>
        <div class="filter-pill-row">
            <button class="fpill" data-filter="makkah">
                <i data-lucide="sun"></i> Makkan
            </button>
            <button class="fpill" data-filter="madinah">
                <i data-lucide="building-2"></i> Medinan
            </button>
        </div>

        <div class="filter-section-label">By Juz</div>
        <div class="filter-pill-row">${juzPills}</div>

        <div class="filter-section-label">By Hizb</div>
        <div class="filter-pill-row">${hizbPills}</div>

        <div class="filter-clear-row">
            <button id="filter-clear-btn">
                <i data-lucide="x"></i> Clear filter
            </button>
        </div>
    `;
}

// ============================================================
// LOAD JUZ / HIZB META  ← FIXED
// ============================================================
// The /v1/meta endpoint returns data.data.surahs.references[] where
// each item is { number, name, ... } but NOT juz info directly.
// The reliable structure is data.data.juzs[] where each juz has
// { number, startingVerseKey, endingVerseKey, verseCount, surahs: {surahNum: startAyah} }
// BUT the API also has data.data.surahs.references[].juzStartingAyah... let's log and use the correct path.
// Safest: fetch /v1/surah and use each surah's juz from a separate call, OR
// use the fact that /v1/juz/{n} returns the surahs in that juz.
// Most reliable: fetch all 30 juz pages (too slow).
// BEST FIX: fetch /v1/meta, use data.data.juzs[i].surahs which IS the correct key
// confirmed from alquran.cloud API source:
//   juzs[i] = { number, startingVerseKey, endingVerseKey, verseCount,
//               surahs: { "surahNum": startAyahInSurah, ... } }

async function loadJuzData() {
    try {
        const res  = await fetch("https://api.alquran.cloud/v1/meta");
        const meta = await res.json();
        const d    = meta.data;

        // --- JUZ MAP ---
        if (d.juzs && Array.isArray(d.juzs)) {
            d.juzs.forEach(juz => {
                const juzNum = Number(juz.number);
                window._juzSurahMap[juzNum] = new Set();
                if (juz.surahs && typeof juz.surahs === "object") {
                    Object.keys(juz.surahs).forEach(sNum => {
                        window._juzSurahMap[juzNum].add(Number(sNum));
                        window._surahJuzMap[Number(sNum)] = juzNum;
                    });
                }
            });
        }

        // --- HIZB MAP ---
        // hizbQuarters is an array of 240 items (240 = 60 hizbs × 4 quarters)
        // Each item: { surah: surahNum, ayah: ayahNum, juz, quarter }
        const hq = d.hizbQuarters || [];
        hq.forEach((item, i) => {
            // Every 4 quarters = 1 hizb; quarter index 0 = start of hizb
            const hizbNum = Math.floor(i / 4) + 1; // 1-60
            if (!window._hizbSurahMap[hizbNum]) window._hizbSurahMap[hizbNum] = new Set();

            // item.surah may be a number or string depending on API version
            const sNum = Number(item.surah);
            if (!isNaN(sNum)) {
                window._hizbSurahMap[hizbNum].add(sNum);
                window._surahHizbMap[sNum] = window._surahHizbMap[sNum] || hizbNum;
            }
        });

        // DEBUG: log a sample to verify
        console.log("[Juz 1 surahs]", [...(window._juzSurahMap[1] || [])]);
        console.log("[Hizb 1 surahs]", [...(window._hizbSurahMap[1] || [])]);

    } catch (err) {
        console.error("Failed to load juz/hizb meta:", err);
    } finally {
        injectFilterBar();
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

        const arabicText      = ayahData.data[0].text;
        const translationText = ayahData.data[1].text;
        const surahName       = ayahData.data[0].surah.englishName;
        const ayahInSurah     = ayahData.data[0].numberInSurah;
        const audioUrl        = audioData.data.audio;

        const arabicEl = document.querySelector(".ayah-arabic");
        const transEl  = document.querySelector(".ayah-translation");
        if (arabicEl) arabicEl.textContent = arabicText;
        if (transEl)  transEl.textContent  = translationText;

        const infoH3   = document.querySelector(".audio-info h3");
        const infoSpan = document.querySelector(".audio-info span");
        if (infoH3)   infoH3.textContent   = surahName;
        if (infoSpan) infoSpan.textContent = `Verse ${ayahInSurah}`;

        if (quranAudio) quranAudio.src = audioUrl;
        wireHomepageAudioPlayer(audioUrl);

        window._dailyAyah = { arabicText, translationText, surahName, ayahInSurah, audioUrl };
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
    if (skipFwd)  skipFwd.onclick  = () => { quranAudio.currentTime = Math.min(quranAudio.duration, quranAudio.currentTime + 10); };

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
// REPEAT MODE BUTTON
// ============================================================

function injectRepeatButton() {
    const actions = document.querySelector(".audio-actions");
    if (!actions || document.getElementById("repeat-btn")) return;
    const btn = document.createElement("button");
    btn.id        = "repeat-btn";
    btn.innerHTML = `<i data-lucide="repeat"></i> Off`;
    btn.title     = "Repeat mode";
    actions.appendChild(btn);
    lucide.createIcons();

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
// FLOATING PLAYER ICON BUTTONS (HTML uses emoji — fix them once)
// ============================================================

function fixFloatingPlayerIcons() {
    // Mini buttons already have text content set by syncMiniPlayIcon.
    // Just ensure initial state is lucide.
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
                    <button class="ayah-action play-btn" data-surah="${selectedSurah}" data-ayah="${ayah.numberInSurah}">
                        <i data-lucide="play"></i>
                    </button>
                    <button class="ayah-action copy-btn"><i data-lucide="copy"></i></button>
                    <button class="ayah-action share-btn"><i data-lucide="share-2"></i></button>
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
        injectRepeatButton();
        injectReaderThemeButton();
        // Re-apply current reader theme to new verse cards
        applyReaderTheme(readerThemeKey);

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

document.getElementById("favorite-reciter")?.addEventListener("click", () => {
    localStorage.setItem("favoriteReciter", currentReciter);
    document.getElementById("favorite-reciter").innerHTML = `<i data-lucide="heart"></i>`;
    document.getElementById("favorite-reciter").style.color = "#10b981";
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
            if (nextBtn) {
                nextBtn.click();
            } else {
                syncMiniPlayIcon(false);
                floatingAyah.textContent = "Finished";
            }
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
        if (activeAudioMode === "surah") { playButton.innerHTML = `<i data-lucide="play"></i>`; lucide.createIcons(); }
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
// COPY
// ============================================================

document.addEventListener("click", async e => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;
    const card = btn.closest(".verse-card");
    const arabic = card.querySelector(".verse-arabic")?.innerText || "";
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
    const arabic = card.querySelector(".verse-arabic")?.innerText || "";
    const translation = card.querySelector(".verse-translation")?.innerText || "";
    const text = `${arabic}\n\n${translation}`;
    try {
        if (navigator.share) { await navigator.share({ title: "Qur'an Verse", text }); showToast("Shared ✓"); }
        else { await navigator.clipboard.writeText(text); showToast("Copied to clipboard"); }
    } catch { showToast("Share cancelled"); }
});

// ============================================================
// INIT
// ============================================================

loadSurahs();
loadJuzData();
loadDailyAyah();
initAnimatedPlaceholder();
initThemeToggle();
fixFloatingPlayerIcons();
updateContinueReading();
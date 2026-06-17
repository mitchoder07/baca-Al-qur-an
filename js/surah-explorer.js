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
let activeFilter        = "all";  // "all" | "juz-N" | "hizb-N" | "makkah" | "madinah"
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

// Built from /v1/meta
window._juzSurahMap  = {};   // juzNumber  (1-30)  → Set of surahNumbers
window._hizbSurahMap = {};   // hizbNumber (1-60)  → Set of surahNumbers

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
    miniPlay.textContent = playing ? "I I" : "▶️";
}

function getActiveAudio() {
    return activeAudioMode === "surah" ? audioPlayer : ayahPlayer;
}

// Scroll + highlight the active verse card
function scrollToActiveVerse(ayahNumber) {
    const readerContent = document.querySelector(".reader-content");
    const card = document.querySelector(`.verse-card[data-ayah="${ayahNumber}"]`);
    if (!card || !readerContent) return;

    const cardTop      = card.offsetTop;
    const parentHeight = readerContent.clientHeight;
    const cardHeight   = card.clientHeight;
    const targetScroll = cardTop - (parentHeight / 2) + (cardHeight / 2);

    readerContent.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });

    // Highlight: add class, remove after 1.8s
    card.classList.remove("verse-active");
    void card.offsetWidth; // force reflow so animation restarts
    card.classList.add("verse-active");
    setTimeout(() => card.classList.remove("verse-active"), 1800);
}

// Inject the highlight style once
(function injectVerseActiveStyle() {
    if (document.getElementById("verse-active-style")) return;
    const s = document.createElement("style");
    s.id = "verse-active-style";
    s.textContent = `
        @keyframes verseHighlight {
            0%   { border-color: rgba(16,185,129,0.8); box-shadow: 0 0 0 0   rgba(16,185,129,0.35); background: rgba(16,185,129,0.12); }
            40%  { border-color: rgba(16,185,129,0.9); box-shadow: 0 0 0 6px rgba(16,185,129,0.15); background: rgba(16,185,129,0.16); }
            100% { border-color: rgba(255,255,255,0.08); box-shadow: 0 0 0 0 rgba(16,185,129,0);    background: transparent; }
        }
        .verse-card.verse-active {
            animation: verseHighlight 1.8s ease forwards;
        }
    `;
    document.head.appendChild(s);
})();

// ============================================================
// ANIMATED SEARCH PLACEHOLDER
// ============================================================

function initAnimatedPlaceholder() {
    const hints = [
        "Search surah name…",
        "Search by number…",
        "Search surah name…",
        "e.g. 'Al-Baqarah' or '2'…"
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
            #surah-search.ph-anim::placeholder {
                animation: placeholderFade 2.8s ease forwards;
            }
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

    // Styles
    if (!document.getElementById("filter-styles")) {
        const s = document.createElement("style");
        s.id = "filter-styles";
        s.textContent = `
            .explorer-search { position: relative; }

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
                font-size: 1.1rem;
                transition: 0.2s;
                z-index: 3;
            }
            #explorer-filter-btn:hover,
            #explorer-filter-btn.active {
                background: rgba(16,185,129,0.25);
            }

            #filter-dropdown {
                display: none;
                position: absolute;
                top: calc(100% + 10px);
                right: 0;
                width: min(420px, 96vw);
                background: #111827;
                border: 1px solid rgba(255,255,255,0.08);
                border-radius: 20px;
                padding: 1.2rem;
                z-index: 100;
                box-shadow: 0 20px 50px rgba(0,0,0,0.4);
                animation: filterDrop 0.2s ease;
            }
            #filter-dropdown.open { display: block; }

            @keyframes filterDrop {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0);    }
            }

            .filter-section-label {
                font-size: 0.75rem;
                font-weight: 700;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #64748b;
                margin: 0.8rem 0 0.5rem;
            }
            .filter-section-label:first-child { margin-top: 0; }

            .filter-pill-row {
                display: flex;
                flex-wrap: wrap;
                gap: 0.4rem;
            }

            .fpill {
                border: none;
                padding: 0.4rem 0.85rem;
                border-radius: 50px;
                background: rgba(255,255,255,0.05);
                color: #94a3b8;
                cursor: pointer;
                font-size: 0.8rem;
                font-weight: 600;
                transition: 0.18s;
            }
            .fpill:hover  { background: rgba(16,185,129,0.12); color: #10b981; }
            .fpill.active { background: rgba(16,185,129,0.22); color: #10b981; border: 1px solid rgba(16,185,129,0.4); }

            .filter-clear-row {
                margin-top: 1rem;
                text-align: right;
            }
            #filter-clear-btn {
                border: none;
                background: transparent;
                color: #64748b;
                cursor: pointer;
                font-size: 0.82rem;
                font-weight: 600;
                transition: 0.18s;
            }
            #filter-clear-btn:hover { color: #ef4444; }

            /* Give search input right padding so text doesn't overlap the button */
            #surah-search { padding-right: 60px; }
        `;
        document.head.appendChild(s);
    }

    const searchBox = document.querySelector(".explorer-search");
    if (!searchBox) return;
    searchBox.style.position = "relative";

    // Filter toggle button
    const filterBtn = document.createElement("button");
    filterBtn.id        = "explorer-filter-btn";
    filterBtn.title     = "Filter surahs";
    filterBtn.innerHTML = "⚙️";
    searchBox.appendChild(filterBtn);

    // Dropdown panel
    const dropdown = document.createElement("div");
    dropdown.id = "filter-dropdown";
    dropdown.innerHTML = buildFilterDropdownHTML();
    searchBox.appendChild(dropdown);

    // Toggle dropdown
    filterBtn.addEventListener("click", e => {
        e.stopPropagation();
        dropdown.classList.toggle("open");
        filterBtn.classList.toggle("active");
    });

    // Close on outside click
    document.addEventListener("click", e => {
        if (!dropdown.contains(e.target) && e.target !== filterBtn) {
            dropdown.classList.remove("open");
            filterBtn.classList.remove("active");
        }
    });

    // Pill clicks
    dropdown.addEventListener("click", e => {
        const pill = e.target.closest(".fpill");
        if (!pill) return;

        // If clicking the already-active filter → clear it
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
        filterBtn.classList.remove("active");

        // Update button to show active state
        filterBtn.style.background = activeFilter === "all"
            ? "rgba(16,185,129,0.12)"
            : "rgba(16,185,129,0.3)";
    });

    // Clear button
    document.addEventListener("click", e => {
        if (e.target.id !== "filter-clear-btn") return;
        dropdown.querySelectorAll(".fpill").forEach(p => p.classList.remove("active"));
        activeFilter = "all";
        renderSurahs(getFilteredSurahs());
        filterBtn.style.background = "rgba(16,185,129,0.12)";
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
            <button class="fpill" data-filter="makkah">🕋 Makkan</button>
            <button class="fpill" data-filter="madinah">🕌 Medinan</button>
        </div>

        <div class="filter-section-label">By Juz</div>
        <div class="filter-pill-row">${juzPills}</div>

        <div class="filter-section-label">By Hizb</div>
        <div class="filter-pill-row">${hizbPills}</div>

        <div class="filter-clear-row">
            <button id="filter-clear-btn">Clear filter</button>
        </div>
    `;
}

function getFilteredSurahs() {
    const val = searchInput.value.trim().toLowerCase();
    let base  = allSurahs;

    // Apply active filter
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

    // Apply search (name or number only)
    if (!val) return base;
    return base.filter(s =>
        s.englishName.toLowerCase().includes(val) ||
        s.name.toLowerCase().includes(val)         ||
        String(s.number) === val
    );
}

// ============================================================
// LOAD JUZ / HIZB META
// ============================================================

async function loadJuzData() {
    try {
        const res  = await fetch("https://api.alquran.cloud/v1/meta");
        const data = await res.json();

        // Build juz → surah map
        data.data.juzs.forEach((juz, i) => {
            const juzNum = i + 1;
            window._juzSurahMap[juzNum] = new Set();
            if (juz.surahs) {
                Object.keys(juz.surahs).forEach(n => window._juzSurahMap[juzNum].add(Number(n)));
            }
        });

        // Build hizb → surah map (240 quarter entries, 4 per hizb → 60 hizbGroups)
        data.data.hizbQuarters.forEach((hq, i) => {
            const hizbNum = Math.floor(i / 4) + 1;
            if (!window._hizbSurahMap[hizbNum]) window._hizbSurahMap[hizbNum] = new Set();
            window._hizbSurahMap[hizbNum].add(Number(hq.surah));
        });

        // Now that maps are ready, inject the filter bar
        injectFilterBar();

    } catch (err) {
        console.error("Failed to load juz/hizb meta:", err);
        // Still inject filter bar — juz/hizb pills just won't match anything
        injectFilterBar();
    }
}

// ============================================================
// SEARCH INPUT
// ============================================================

searchInput.addEventListener("input", () => {
    renderSurahs(getFilteredSurahs());
});

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

    let homeSpeed = 1;

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

    if (volumeSlider) {
        volumeSlider.addEventListener("input", () => {
            quranAudio.volume = volumeSlider.value / 100;
        });
    }

    if (muteBtn) {
        muteBtn.onclick = () => {
            quranAudio.muted = !quranAudio.muted;
            muteBtn.innerHTML = quranAudio.muted
                ? `<i data-lucide="volume-x"></i>`
                : `<i data-lucide="volume-2"></i>`;
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
            } catch (err) {
                console.error("Reciter switch failed:", err);
            }
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
    btn.id          = "repeat-btn";
    btn.textContent = "🔁 Off";
    btn.title       = "Repeat mode";
    actions.appendChild(btn);
    btn.addEventListener("click", () => {
        if (repeatMode === "off") {
            repeatMode = "surah"; btn.textContent = "🔂 Surah"; showToast("Repeat: current Surah");
        } else if (repeatMode === "surah") {
            repeatMode = "quran"; btn.textContent = "🔁 Qur'an"; showToast("Repeat: whole Qur'an");
        } else {
            repeatMode = "off";   btn.textContent = "🔁 Off";    showToast("Repeat: off");
        }
    });
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
    document.getElementById("favorite-reciter").textContent = "💚";
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

        // Scroll + highlight
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
// READER THEMES
// ============================================================

document.querySelectorAll(".reader-theme-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const theme  = readerThemes[btn.dataset.theme];
        const reader = document.querySelector(".reader-content");
        reader.style.background = theme.bg;
        reader.style.color      = theme.text;
        document.querySelectorAll(".verse-card").forEach(card => { card.style.background = theme.card; card.style.color = theme.text; });
        document.querySelectorAll(".verse-arabic, .verse-translation").forEach(el => { el.style.color = theme.text; });
    });
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
        if (navigator.share) { await navigator.share({ title: "Qur'an Verse", text }); showToast("Shared successfully ✓"); }
        else                  { await navigator.clipboard.writeText(text); showToast("Sharing not supported — copied instead"); }
    } catch { showToast("Share cancelled"); }
});

// ============================================================
// INIT
// ============================================================

loadSurahs();
loadJuzData();
loadDailyAyah();
initAnimatedPlaceholder();
updateContinueReading();
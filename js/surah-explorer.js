console.log(window.isSecureContext);

function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
        toast.classList.remove("show");
    }, 1200);
}
// ============== Surah Explorer ============================ //

const grid = document.getElementById("surah-grid");
const searchInput = document.getElementById("surah-search");
const readerModal = document.querySelector(".reader-modal");
const readerClose = document.querySelector(".reader-close");
const surahModal = document.querySelector(".surah-modal");
const modalClose = document.querySelector(".surah-modal-close");
const readBtn = document.getElementById("read-surah-btn");

const settingsBtn = document.getElementById("reader-settings-btn");

const settingsPanel = document.querySelector(".reader-settings-panel");

settingsBtn.addEventListener(
    "click",
    () => {

        settingsPanel.classList.toggle(
            "active"
        );

    }
);

function updateReaderModeUI() {

    const arabicEls =
        document.querySelectorAll(".verse-arabic");

    const translationEls =
        document.querySelectorAll(".verse-translation");

    arabicEls.forEach(el => {

        el.style.display =
            readerMode === "translation"
                ? "none"
                : "block";

    });

    translationEls.forEach(el => {

        el.style.display =
            readerMode === "arabic"
                ? "none"
                : "block";

    });

    document
        .querySelectorAll(".toggle-btn")
        .forEach(btn =>
            btn.classList.remove("active")
        );

    if (readerMode === "both")
        modeBoth.classList.add("active");

    if (readerMode === "arabic")
        modeArabic.classList.add("active");

    if (readerMode === "translation")
        modeTranslation.classList.add("active");
}

function updateContinueReading() {

    const saved =
        JSON.parse(
            localStorage.getItem("lastRead")
        );

    if (!saved) return;

    document.getElementById(
        "continue-surah"
    ).textContent = saved.surahName;

    document.getElementById(
        "continue-ayah"
    ).textContent =
        `Ayah ${saved.ayah} of ${saved.totalAyahs}`;

    document.getElementById(
        "continue-meta"
    ).textContent =
        `${saved.totalAyahs - saved.ayah} Ayahs Remaining`;

    const percent =
        saved.totalAyahs
            ? Math.round(
                (saved.ayah /
                    saved.totalAyahs) * 100
            )
            : 0;

    const status =
        percent >= 100
            ? "Completed"
            : "In Progress";

    document.getElementById(
        "reading-status"
    ).textContent =
        status;

    document.getElementById(
        "continue-progress"
    ).textContent =
        `${percent}% Completed`;

    document.querySelector(
        ".progress-fill"
    ).style.width =
        percent + "%";

}

function applyFontSizes() {

    document
        .querySelectorAll(".verse-arabic")
        .forEach(el => {

            el.style.fontSize =
                arabicFontSize + "rem";

        });

    document
        .querySelectorAll(".verse-translation")
        .forEach(el => {

            el.style.fontSize =
                translationFontSize + "rem";

        });

}

let allSurahs = [];
let selectedSurah = null;
let readerMode = "both"
let lastRead = null;
let arabicFontSize = 3;
let translationFontSize = 1.05;
let currentReciter = "ar.alafasy";
let currentArabicAyahs = [];
let currentEnglishAyahs = [];
let readingMode = "verse";
let currentMushafPage = 1;
let mushafPages = [];
let mushafModeActive = false;

const reciterCodes = {

    "ar.alafasy":
        "ar.alafasy",

    "ar.husary":
        "ar.husary",

    "ar.minshawi":
        "ar.minshawi",

    "ar.abdulbasitmurattal":
        "ar.abdulbasitmurattal",

    "ar.mahermuaiqly":
        "ar.mahermuaiqly"

};

const audioPlayer =
    document.getElementById(
        "surah-audio"
    );

const reciterSelect =
    document.getElementById(
        "reciter-select"
    );

console.log(reciterSelect);

const mushafPageSize = 15;

const modeBoth =
    document.getElementById("mode-both");

const modeArabic =
    document.getElementById("mode-arabic");

const modeTranslation =
    document.getElementById("mode-translation");

const switchVerseMode =
    document.getElementById("switch-verse-mode");

const switchMushafMode =
    document.getElementById("switch-mushaf-mode");

modeBoth.addEventListener("click", () => {
    readerMode = "both";
    updateReaderModeUI();
});

modeArabic.addEventListener("click", () => {
    readerMode = "arabic";
    updateReaderModeUI();
});

modeTranslation.addEventListener("click", () => {
    readerMode = "translation";

    updateReaderModeUI();
});

switchVerseMode.addEventListener("click", () => {

    readingMode = "verse";

    switchVerseMode.classList.add("active");
    switchMushafMode.classList.remove("active");

    mushafModeActive = false;
});

switchMushafMode.addEventListener("click", () => {

    readingMode = "mushaf";

    switchMushafMode.classList.add("active");
    switchVerseMode.classList.remove("active");

    mushafModeActive = true;

    currentMushafPage = 1;
    renderMushafPage(currentMushafPage);
});

/* ========================= FETCH SURAHS ========================= */

async function loadSurahs() {
    try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();

        allSurahs = data.data;
        renderSurahs(allSurahs);

    } catch (error) {
        console.error("Failed to load Surahs", error);
    }
}

/* ========================= LOAD MUSHAF ========================= */

async function loadMushafData() {
    try {
        const res = await fetch("https://api.alquran.cloud/v1/quran/quran-uthmani");
        const data = await res.json();

        const allAyahs = [];

        data.data.surahs.forEach(surah => {
            surah.ayahs.forEach(ayah => {
                allAyahs.push(ayah.text);
            });
        });

        buildMushafPages(allAyahs);

        console.log("Mushaf loaded:", mushafPages.length, "pages");

    } catch (err) {
        console.error("Mushaf load failed", err);
    }
}

/* ========================= RENDER SURAH GRID ========================= */

function renderSurahs(data) {
    grid.innerHTML = "";

    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];

    let html = "";

    data.forEach((surah) => {
        const isFav = favorites.includes(surah.number);

        html += `
        <div class="surah-card"
            data-number="${surah.number}"
            data-name="${surah.englishName}"
            data-arabic="${surah.name}"
            data-ayahs="${surah.numberOfAyahs}"
            data-type="${surah.revelationType}">

            <button class="favorite-btn ${isFav ? "active" : ""}" data-id="${surah.number}">
                ★
            </button>

            <div class="surah-number">${surah.number}</div>

            <h3>${surah.englishName}</h3>

            <div class="surah-english">${surah.name}</div>

            <div class="surah-meta">
                <span>${surah.numberOfAyahs} Ayahs</span>
                <span>${surah.revelationType}</span>
            </div>

        </div>
        `;
    });

    grid.innerHTML = html;

    activateFavorites();
    activateCards();
}

/* ======== Load Audio ============*/

function loadSurahAudio() {

    if (!selectedSurah) return;

    const audioUrl =
        `https://cdn.islamic.network/quran/audio-surah/128/${currentReciter}/${selectedSurah}.mp3`;

    console.log(audioUrl);

    audioPlayer.src = audioUrl;

    audioPlayer.load();

}

/* ========================= SEARCH ========================= */

searchInput.addEventListener("input", () => {
    const value = searchInput.value.toLowerCase();

    const filtered = allSurahs.filter((surah) => {
        return (
            surah.englishName.toLowerCase().includes(value) ||
            surah.name.toLowerCase().includes(value)
        );
    });

    renderSurahs(filtered);
});

/* ========================= FAVORITES ========================= */

function activateFavorites() {
    document.querySelectorAll(".favorite-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
            e.stopPropagation();

            const id = Number(btn.dataset.id);

            let favorites = JSON.parse(localStorage.getItem("favorites")) || [];

            if (favorites.includes(id)) {
                favorites = favorites.filter(item => item !== id);
            } else {
                favorites.push(id);
            }

            localStorage.setItem("favorites", JSON.stringify(favorites));

            renderSurahs(allSurahs);
        });
    });
}

/* ========================= SURAH CARD CLICK ========================= */

function activateCards() {
    document.querySelectorAll(".surah-card").forEach(card => {
        card.addEventListener("click", () => {

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

/* ========================= MODAL CLOSE ========================= */

modalClose.addEventListener("click", () => {
    surahModal.classList.remove("active");
});

document.querySelector(".surah-modal-overlay")
    .addEventListener("click", () => {
        surahModal.classList.remove("active");
    });

/* ========================= CLEAN BISMILLAH FIX ========================= */

function cleanAyah(text, surahNumber, ayahNumber) {

    // Surah At-Tawbah (9) → no Bismillah exists
    if (surahNumber === 9) return text;

    // Surah Al-Fatihah (1) → keep as-is
    if (surahNumber === 1) return text;

    // Only first ayah of other surahs
    if (ayahNumber === 1) {

        // SAFER fallback removal (works even if text varies)
        const words = text.split(" ");

        if (words.slice(0, 4).join(" ").includes("بِسْمِ")) {
            return words.slice(4).join(" ").trim();
        }
    }

    return text;
}

function buildMushafPages(allAyahsFlat) {
    const pages = [];
    const PAGE_SIZE = 12; // controls how dense each page is

    for (let i = 0; i < allAyahsFlat.length; i += PAGE_SIZE) {
        pages.push({
            page: pages.length + 1,
            lines: allAyahsFlat.slice(i, i + PAGE_SIZE)
        });
    }

    mushafPages = pages;
}

/* ========================= MUSHAF PAGE RENDERING ========================= */

function renderMushafPage(pageNumber) {
    const page = mushafPages[pageNumber - 1];
    if (!page) return;

    const container = document.getElementById("reader-verses");

    container.innerHTML = `
        <div class="mushaf-page-header">
            Page ${page.page} / ${mushafPages.length}
        </div>

        <div class="mushaf-content">
            ${page.lines.map(line => `
                <div class="mushaf-line">${line}</div>
            `).join("")}
        </div>
    `;

    document.getElementById("page-indicator").textContent =
        `Page ${page.page} / ${mushafPages.length}`;
}

function nextMushafPage() {
    if (currentMushafPage < mushafPages.length) {
        currentMushafPage++;
        renderMushafPage(currentMushafPage);
    }
}

function prevMushafPage() {
    if (currentMushafPage > 1) {
        currentMushafPage--;
        renderMushafPage(currentMushafPage);
    }
}

/* ========================= READ SURAH ========================= */

readBtn.addEventListener("click", async () => {
    if (!selectedSurah) return;

    try {
        const response = await fetch(
            `https://api.alquran.cloud/v1/surah/${selectedSurah}/editions/quran-uthmani,en.sahih`
        );

        const data = await response.json();

        const arabicAyahs = data.data[0].ayahs;
        const englishAyahs = data.data[1].ayahs;

        const container = document.getElementById("reader-verses");
        container.innerHTML = "";

        document.getElementById("reader-title").textContent =
            data.data[0].englishName;

        document.getElementById("reader-arabic-name").textContent =
            data.data[0].name;

        document.getElementById("reader-meaning").textContent =
            data.data[0].englishNameTranslation;

        document.getElementById("reader-meta").textContent =
            `${arabicAyahs.length} Ayahs • ${data.data[0].revelationType}`;

        const bismillahContainer = document.getElementById("bismillah-container");

        if (selectedSurah !== 1 && selectedSurah !== 9) {
            bismillahContainer.innerHTML = `
                    <div class="bismillah-header">
                        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                    </div>
                `;
        } else {
            bismillahContainer.innerHTML = "";
        }

        let html = "";

        arabicAyahs.forEach((ayah, index) => {

            const cleanedArabic = cleanAyah(
                ayah.text,
                selectedSurah,
                ayah.numberInSurah
            );

            html += `
            <div class="verse-card"
                data-surah="${selectedSurah}"
                data-ayah="${ayah.numberInSurah}">

                <div class="verse-number">
                    ${ayah.numberInSurah}
                </div>

                <div class="verse-arabic">
                    ${cleanedArabic}
                </div>

                <div class="verse-translation">
                    ${englishAyahs[index].text}
                </div>

                <div class="verse-actions">

                    <button
                        class="ayah-action play-btn"
                        data-surah="${selectedSurah}"
                        data-ayah="${ayah.numberInSurah}">

                        <i data-lucide="play"></i>

                    </button>

                    <button
                        class="ayah-action copy-btn"
                        data-copy="${cleanedArabic} - ${englishAyahs[index].text}">

                        <i data-lucide="copy"></i>

                    </button>

                    <button
                        class="ayah-action share-btn"
                        data-share="${cleanedArabic} - ${englishAyahs[index].text}">

                        <i data-lucide="share-2"></i>

                    </button>

                </div>

            </div>
            `;
        });

        container.innerHTML = html;



        const observer = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (
                        entry.isIntersecting &&
                        entry.intersectionRatio > 0.6
                    ) {

                        const ayah =
                            Number(
                                entry.target.dataset.ayah
                            );

                        localStorage.setItem(
                            "lastRead",
                            JSON.stringify({

                                surah: selectedSurah,

                                surahName:
                                    data.data[0].englishName,

                                surahArabic:
                                    data.data[0].name,

                                totalAyahs:
                                    arabicAyahs.length,

                                ayah

                            })
                        );

                        updateContinueReading();

                    }

                });

            },
            {
                threshold: 0.6
            }
        );

        document
            .querySelectorAll(".verse-card")
            .forEach(card => observer.observe(card));

        applyFontSizes();
        updateReaderModeUI();
        loadSurahAudio();

        readerModal.classList.add("active");
        document.body.style.overflow = "hidden";

        requestAnimationFrame(() => {
            document.querySelector(".reader-content").scrollTop = 0;
        });

        lucide.createIcons();

    } catch (error) {
        console.error("Failed to load Surah:", error);
    }
});

/* =========================== Theme Switcher ========================== */



/* ========================= READER CLOSE ========================= */

readerClose.addEventListener("click", () => {
    readerModal.classList.remove("active");
    document.body.style.overflow = "auto";
});

document
    .getElementById("resume-reading-btn")
    .addEventListener("click", async () => {

        const saved =
            JSON.parse(
                localStorage.getItem("lastRead")
            );
        if (
            !saved ||
            !saved.totalAyahs
        ) return;

        // if (!saved) return;

        // selectedSurah =
        //     saved.surah;

        selectedSurah =
            Number(saved.surah);

        readBtn.click();

        setTimeout(() => {

            const target =
                document.querySelector(
                    `[data-ayah="${saved.ayah}"]`
                );

            if (target) {

                target.scrollIntoView({

                    behavior: "smooth",

                    block: "center"

                });

            }

        }, 1000);

    });

document.querySelector(".reader-overlay")
    .addEventListener("click", () => {
        readerModal.classList.remove("active");
        document.body.style.overflow = "auto";
    });

/* ================= READER THEMES ================= */

document.querySelectorAll(".reader-theme-btn")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            const theme =
                readerThemes[btn.dataset.theme];

            const reader =
                document.querySelector(".reader-content");

            reader.style.background =
                theme.bg;

            reader.style.color =
                theme.text;

            document
                .querySelectorAll(".verse-card")
                .forEach(card => {

                    card.style.background =
                        theme.card;

                    card.style.color =
                        theme.text;
                });

            document
                .querySelectorAll(".verse-arabic")
                .forEach(el => {

                    el.style.color =
                        theme.text;
                });

            document
                .querySelectorAll(".verse-translation")
                .forEach(el => {

                    el.style.color =
                        theme.text;
                });

        });

    });

/* ================= FONT CONTROLS ================= */

document
    .getElementById("font-increase")
    .addEventListener("click", () => {

        arabicFontSize += 0.2;
        translationFontSize += 0.05;

        applyFontSizes();

    });

document
    .getElementById("font-decrease")
    .addEventListener("click", () => {

        arabicFontSize -= 0.2;
        translationFontSize -= 0.05;

        applyFontSizes();

    });

document
    .getElementById("font-reset")
    .addEventListener("click", () => {

        arabicFontSize = 3;
        translationFontSize = 1.05;

        applyFontSizes();

    });

/* ================= PLAY AYAH ================= */

document.addEventListener(
    "click",
    async (e) => {

        const playBtn =
            e.target.closest(".play-btn");

        if (!playBtn) return;

        const surah =
            playBtn.dataset.surah;

        const ayah =
            playBtn.dataset.ayah;

        const player =
            document.getElementById(
                "ayah-player"
            );

        try {

            const response =
                await fetch(
                    `https://api.alquran.cloud/v1/ayah/${surah}:${ayah}/${currentReciter}`
                );

            const data =
                await response.json();

            player.src =
                data.data.audio;

            player.play();

        }

        catch (error) {

            console.error(
                "Audio Error:",
                error
            );

        }

    }
);

/* ========================= INIT ========================= */

loadSurahs();
updateContinueReading();
loadMushafData();

/* ===================== RECITER SWITCH ============================= */

document.addEventListener(
    "change",
    (e) => {

        if (
            e.target.id ===
            "reciter-select"
        ) {

            currentReciter =
                e.target.value;

            console.log(
                "Reciter:",
                currentReciter
            );

            loadSurahAudio();

        }

    }
);

/* ===================== COPY ============================= */

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".copy-btn");
    if (!btn) return;

    const verseCard = btn.closest(".verse-card");

    const arabic = verseCard.querySelector(".verse-arabic")?.innerText || "";
    const translation = verseCard.querySelector(".verse-translation")?.innerText || "";

    const text = `${arabic}\n\n${translation}`;

    try {
        await navigator.clipboard.writeText(text);

        btn.classList.add("copied");
        showToast("Verse copied ✓");

        setTimeout(() => {
            btn.classList.remove("copied");
        }, 800);

    } catch (err) {
        showToast("Copy failed");
    }
});

/* ===================== SHARE ============================= */

document.addEventListener("click", async (e) => {
    const btn = e.target.closest(".share-btn");
    if (!btn) return;

    const verseCard = btn.closest(".verse-card");

    const arabic = verseCard.querySelector(".verse-arabic")?.innerText || "";
    const translation = verseCard.querySelector(".verse-translation")?.innerText || "";

    const text = `${arabic}\n\n${translation}`;

    try {
        if (navigator.share) {
            await navigator.share({
                title: "Qur'an Verse",
                text
            });
            showToast("Shared successfully ✓");
        } else {
            await navigator.clipboard.writeText(text);
            showToast("Sharing not supported — copied instead");
        }
    } catch (err) {
        showToast("Share cancelled");
    }
});


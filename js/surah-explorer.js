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

// function updateBookmarkCount() {

//     const bookmarks =
//         JSON.parse(
//             localStorage.getItem(
//                 "ayahBookmarks"
//             )
//         ) || [];

//     document.getElementById(
//         "bookmark-count"
//     ).textContent =
//         `${bookmarks.length} Bookmarks Saved`;

//     const today =
//         new Date()
//             .toDateString();

//     localStorage.setItem(
//         "lastReadingDay",
//         today
//     );
// }

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
let currentReciter = "ar.alafasy"

const modeBoth =
    document.getElementById("mode-both");

const modeArabic =
    document.getElementById("mode-arabic");

const modeTranslation =
    document.getElementById("mode-translation");

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

        // If Bismillah is present at start, remove first ~6–7 words
        if (words.slice(0, 4).join(" ").includes("بِسْمِ")) {
            return words.slice(4).join(" ").trim();
        }
    }

    return text;
}

/* ========================= READ SURAH ========================= */

readBtn.addEventListener("click", async () => {
    if (!selectedSurah) return;

    try {
        const response = await fetch(
            `https://api.alquran.cloud/v1/surah/${selectedSurah}/editions/quran-uthmani,en.asad`
        );

        const data = await response.json();

        const arabic = data.data[0].ayahs;
        const english = data.data[1].ayahs;

        const container = document.getElementById("reader-verses");
        container.innerHTML = "";

        document.getElementById("reader-title").textContent =
            data.data[0].englishName;

        document.getElementById("reader-arabic-name").textContent =
            data.data[0].name;

        document.getElementById("reader-meaning").textContent =
            data.data[0].englishNameTranslation;

        document.getElementById("reader-meta").textContent =
            `${arabic.length} Ayahs • ${data.data[0].revelationType}`;

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

        arabic.forEach((ayah, index) => {

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
                    ${english[index].text}
                </div>

                <div class="verse-actions">

                    <button
                        class="ayah-action bookmark-btn"
                        data-surah="${selectedSurah}"
                        data-ayah="${ayah.numberInSurah}">

                        <i data-lucide="bookmark"></i>

                    </button>

                    <button
                        class="ayah-action copy-btn"
                        data-copy="${cleanedArabic} - ${english[index].text}">

                        <i data-lucide="copy"></i>

                    </button>

                    <button
                        class="ayah-action share-btn"
                        data-share="${cleanedArabic} - ${english[index].text}">

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
                                    arabic.length,

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

        readerModal.classList.add("active");

        requestAnimationFrame(() => {
            document.querySelector(".reader-content").scrollTop = 0;
        });

        lucide.createIcons();

    } catch (error) {
        console.error("Failed to load Surah:", error);
    }
});

/* =========================== Theme Switcher ========================== */

const readerContent =
    document.querySelector(".reader-content");

document
    .querySelectorAll(".theme-option")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            document
                .querySelectorAll(".theme-option")
                .forEach(item =>
                    item.classList.remove("active")
                );

            btn.classList.add("active");

            readerContent.classList.remove(
                "dark-theme",
                "gold-theme",
                "sepia-theme"
            );

            readerContent.classList.add(
                btn.dataset.theme + "-theme"
            );
        });

    });

/* ========================= READER CLOSE ========================= */

readerClose.addEventListener("click", () => {
    readerModal.classList.remove("active");
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

/* ========================= INIT ========================= */

loadSurahs();
updateContinueReading();

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

// document.addEventListener("click", async (e) => {

//     const copyBtn = e.target.closest(".copy-btn");
//     const shareBtn = e.target.closest(".share-btn");

//     // If nothing clicked
//     if (!copyBtn && !shareBtn) return;

//     // ================= COPY =================
//     if (copyBtn) {

//         const card = copyBtn.closest(".verse-card");
//         if (!card) return;
    
//         const arabic = card.querySelector(".verse-arabic")?.innerText?.trim();
//         const translation = card.querySelector(".verse-translation")?.innerText?.trim();
    
//         const text = `${arabic}\n\n${translation}`;
    
//         try {
//             await navigator.clipboard.writeText(text);
    
//             // ✨ animation class
//             copyBtn.classList.add("copied");
    
//             // icon bounce feel
//             copyBtn.style.transform = "scale(1.15)";
//             setTimeout(() => {
//                 copyBtn.style.transform = "scale(1)";
//             }, 150);
    
//             showToast("Copied ✓");
    
//             setTimeout(() => {
//                 copyBtn.classList.remove("copied");
//             }, 900);
    
//         } catch (err) {
//             console.error(err);
//             showToast("Copy failed");
//         }
//     }

//     // ================= SHARE =================
//     if (shareBtn) {

//         const card = shareBtn.closest(".verse-card");
//         if (!card) return;

//         const arabic = card.querySelector(".verse-arabic")?.innerText?.trim();
//         const translation = card.querySelector(".verse-translation")?.innerText?.trim();

//         const text = `${arabic}\n\n${translation}`;

//         try {

//             if (navigator.share) {
//                 try {
//                     await navigator.share({
//                         title: "Quran Verse",
//                         text
//                     });
//                 } catch (err) {
//                     console.log("Share cancelled or failed", err);
//                 }
//             } else {
//                 await navigator.clipboard.writeText(text);
//                 showToast("Copied to clipboard (share not supported)");
//             }
//             console.log("SHARED:", text);

//         } catch (err) {
//             console.error("Share failed:", err);
//         }
//     }
// });
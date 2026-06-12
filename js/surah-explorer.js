// ============== Surah Explorer ============================ //

const grid = document.getElementById("surah-grid");
const searchInput = document.getElementById("surah-search");
const readerModal = document.querySelector(".reader-modal");
const readerClose = document.querySelector(".reader-close");
const surahModal = document.querySelector(".surah-modal");
const modalClose = document.querySelector(".surah-modal-close");
const readBtn = document.getElementById("read-surah-btn");

document.getElementById("show-translation").addEventListener("click", () => {
    readerMode = "both";
    updateReaderModeUI();
});

document.getElementById("hide-translation").addEventListener("click", () => {
    readerMode = "arabic";
    updateReaderModeUI();
});

function updateReaderModeUI() {
    const arabicEls = document.querySelectorAll(".verse-arabic");
    const translationEls = document.querySelectorAll(".verse-translation");

    arabicEls.forEach(el => {
        el.style.display = (readerMode === "translation") ? "none" : "block";
    });

    translationEls.forEach(el => {
        el.style.display = (readerMode === "arabic") ? "none" : "block";
    });
}

let allSurahs = [];
let selectedSurah = null;
let readerMode = "both"

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
            <div class="verse-card">

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
                    <button class="ayah-action">
                        <i data-lucide="bookmark"></i>
                    </button>

                    <button class="ayah-action">
                        <i data-lucide="copy"></i>
                    </button>

                    <button class="ayah-action">
                        <i data-lucide="share-2"></i>
                    </button>
                </div>

            </div>
            `;
        });

        container.innerHTML = html;

        updateReaderModeUI();

        readerModal.classList.add("active");

        lucide.createIcons();

    } catch (error) {
        console.error("Failed to load Surah:", error);
    }
});

/* ========================= READER CLOSE ========================= */

readerClose.addEventListener("click", () => {
    readerModal.classList.remove("active");
});

document.querySelector(".reader-overlay")
    .addEventListener("click", () => {
        readerModal.classList.remove("active");
    });

/* ========================= INIT ========================= */

loadSurahs();
// ============== Surah Explorer ============================ //
const readBtn =
    document.getElementById(
        "read-surah-btn"
    );

const readerModal =
    document.querySelector(
        ".reader-modal"
    );

const readerClose =
    document.querySelector(
        ".reader-close"
    );

let selectedSurah = null;

const grid =
    document.getElementById("surah-grid");

const searchInput =
    document.getElementById("surah-search");

let allSurahs = [];

/* FETCH SURAHS */

async function loadSurahs() {

    try {

        const response =
            await fetch(
                "https://api.alquran.cloud/v1/surah"
            );

        const data =
            await response.json();

        allSurahs =
            data.data;

        renderSurahs(allSurahs);

    } catch (error) {

        console.error(
            "Failed to load Surahs",
            error
        );
    }

}

/* RENDER */

function renderSurahs(data) {

    grid.innerHTML = "";

    data.forEach((surah) => {

        const favorites =
            JSON.parse(
                localStorage.getItem("favorites")
            ) || [];

        const active =
            favorites.includes(
                surah.number
            );

        grid.innerHTML += `

        <div
        class="surah-card"
        data-number="${surah.number}"
        data-name="${surah.englishName}"
        data-arabic="${surah.name}"
        data-ayahs="${surah.numberOfAyahs}"
        data-type="${surah.revelationType}">

        <button
        class="favorite-btn
        ${active ? "active" : ""}"
        data-id="${surah.number}">

        ★

        </button>

        <div class="surah-number">

        ${surah.number}

        </div>

        <h3>

        ${surah.englishName}

        </h3>

        <div class="surah-english">

        ${surah.name}

        </div>

        <div class="surah-meta">

        <span>

        ${surah.numberOfAyahs}
         Ayahs

        </span>

        <span>

        ${surah.revelationType}

        </span>

        </div>

        </div>

        `;

    });

    activateFavorites();
    activateCards();

}

/* ========================= SEARCH ========================= */

searchInput.addEventListener(
    "input",
    () => {

        const value =
            searchInput.value
                .toLowerCase();

        const filtered =
            allSurahs.filter((surah) => {

                return (

                    surah.englishName
                        .toLowerCase()
                        .includes(value)

                    ||

                    surah.name
                        .toLowerCase()
                        .includes(value)

                );

            });

        renderSurahs(filtered);

    });

/* ========================= FAVORITES ========================= */

function activateFavorites() {

    document
        .querySelectorAll(".favorite-btn")
        .forEach((btn) => {

            btn.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            btn.dataset.id
                        );

                    let favorites =
                        JSON.parse(
                            localStorage.getItem(
                                "favorites"
                            )
                        ) || [];

                    if (
                        favorites.includes(id)
                    ) {

                        favorites =
                            favorites.filter(
                                item => item !== id
                            );

                    } else {

                        favorites.push(id);
                    }

                    localStorage.setItem(
                        "favorites",
                        JSON.stringify(
                            favorites
                        )
                    );

                    renderSurahs(allSurahs);

                });
        });

}

loadSurahs();

/* ========================= SURAH MODAL ========================= */

const surahModal =
    document.querySelector(
        ".surah-modal"
    );

const modalClose =
    document.querySelector(
        ".surah-modal-close"
    );

function activateCards() {

    document
        .querySelectorAll(".surah-card")
        .forEach(card => {

            card.addEventListener(
                "click",
                () => {

                    document.getElementById(
                        "modal-surah-number"
                    ).textContent =
                        card.dataset.number;

                    document.getElementById(
                        "modal-surah-name"
                    ).textContent =
                        card.dataset.name;

                    document.getElementById(
                        "modal-surah-arabic"
                    ).textContent =
                        card.dataset.arabic;

                    document.getElementById(
                        "modal-surah-ayahs"
                    ).textContent =
                        card.dataset.ayahs + " Ayahs";

                    document.getElementById(
                        "modal-surah-type"
                    ).textContent =
                        card.dataset.type;

                    surahModal.classList.add(
                        "active"
                    );

                    selectedSurah = card.dataset.number

                    lucide.createIcons();

                });

        });
}

modalClose.addEventListener(
    "click",
    () => {

        surahModal.classList.remove(
            "active"
        );

    });

document
    .querySelector(
        ".surah-modal-overlay"
    )
    .addEventListener(
        "click",
        () => {

            surahModal.classList.remove(
                "active"
            );

        });


/* ========================= READ SURAH ========================= */

readBtn.addEventListener(
    "click",
    async () => {

        if (!selectedSurah) return;

        try {

            const response =
                await fetch(
                    `https://api.alquran.cloud/v1/surah/${selectedSurah}/editions/quran-uthmani,en.asad`
                );

            const data =
                await response.json();

            const arabic =
                data.data[0].ayahs;

            const english =
                data.data[1].ayahs;

            const container =
                document.getElementById(
                    "reader-verses"
                );

            container.innerHTML = "";

            document.getElementById(
                "reader-title"
            ).textContent =
                data.data[0].englishName;

            arabic.forEach(
                (ayah, index) => {

                    container.innerHTML += `
    
    <div class="verse-card">
    
    <div class="verse-number">
    
    ${ayah.numberInSurah}
    
    </div>
    
    <div class="verse-arabic">
    
    ${ayah.text}
    
    </div>
    
    <div class="verse-translation">
    
    ${english[index].text}
    
    </div>
    
    </div>
    
    `;

                });

            readerModal.classList.add(
                "active"
            );

        } catch (error) {

            console.error(error);

        }

    });

readerClose.addEventListener(
    "click",
    () => {

        readerModal.classList.remove(
            "active"
        );

    });

document
    .querySelector(
        ".reader-overlay"
    )
    .addEventListener(
        "click",
        () => {

            readerModal.classList.remove(
                "active"
            );

        });
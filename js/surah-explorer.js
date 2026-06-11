const surahs = [

    {
        number: 1,
        name: "Al-Fatiha",
        english: "The Opening",
        verses: 7,
        type: "Meccan"
    },

    {
        number: 2,
        name: "Al-Baqarah",
        english: "The Cow",
        verses: 286,
        type: "Medinan"
    },

    {
        number: 3,
        name: "Ali Imran",
        english: "Family Of Imran",
        verses: 200,
        type: "Medinan"
    },

    {
        number: 18,
        name: "Al-Kahf",
        english: "The Cave",
        verses: 110,
        type: "Meccan"
    },

    {
        number: 36,
        name: "Yaseen",
        english: "Heart Of The Qur'an",
        verses: 83,
        type: "Meccan"
    },

    {
        number: 55,
        name: "Ar-Rahman",
        english: "The Most Merciful",
        verses: 78,
        type: "Medinan"
    },

    {
        number: 67,
        name: "Al-Mulk",
        english: "The Sovereignty",
        verses: 30,
        type: "Meccan"
    },

    {
        number: 112,
        name: "Al-Ikhlas",
        english: "Sincerity",
        verses: 4,
        type: "Meccan"
    }

];

const grid =
    document.getElementById("surah-grid");

const searchInput =
    document.getElementById("surah-search");

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
    
    <div class="surah-card">
    
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
    
    ${surah.name}
    
    </h3>
    
    <div class="surah-english">
    
    ${surah.english}
    
    </div>
    
    <div class="surah-meta">
    
    <span>
    ${surah.verses} Verses
    </span>
    
    <span>
    ${surah.type}
    </span>
    
    </div>
    
    </div>
    
    `;
    });

    activateFavorites();
}

renderSurahs(surahs);

searchInput.addEventListener("input", () => {

    const value =
        searchInput.value.toLowerCase();

    const filtered =
        surahs.filter((surah) =>

            surah.name
                .toLowerCase()
                .includes(value)

        );

    renderSurahs(filtered);

});

function activateFavorites() {

    document
        .querySelectorAll(".favorite-btn")
        .forEach(btn => {

            btn.addEventListener(
                "click",
                () => {

                    const id =
                        Number(
                            btn.dataset.id
                        );

                    let favorites =
                        JSON.parse(
                            localStorage.getItem("favorites")
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
                        JSON.stringify(favorites)
                    );

                    renderSurahs(surahs);

                });
        });
}
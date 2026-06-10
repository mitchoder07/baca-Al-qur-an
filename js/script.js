// ================= SEARCH MODAL ========================
const searchBtn =
    document.querySelector(".search-btn");

const searchModal =
    document.querySelector(".search-modal");

const closeSearch =
    document.querySelector(".close-search");

const searchOverlay =
    document.querySelector(".search-overlay");

searchBtn.addEventListener("click", () => {

    searchModal.classList.add("active");

});

closeSearch.addEventListener("click", () => {

    searchModal.classList.remove("active");

});

searchOverlay.addEventListener("click", () => {

    searchModal.classList.remove("active");

});

document.addEventListener("keydown", (e) => {

    if (e.key === "/") {

        e.preventDefault();

        searchModal.classList.add("active");

    }

    if (e.key === "Escape") {

        searchModal.classList.remove("active");

    }

});

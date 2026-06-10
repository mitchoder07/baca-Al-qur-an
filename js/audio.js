console.log("Premium Quran Player Loaded");

/* Elements */

const audio =
    document.getElementById("quran-audio");

const playBtn =
    document.getElementById("play-btn");

const prevBtn =
    document.getElementById("prev-btn");

const nextBtn =
    document.getElementById("next-btn");

const volumeSlider =
    document.getElementById("volume-slider");

const speedBtn =
    document.getElementById("speed-btn");

const progressBar =
    document.querySelector(".audio-progress");

const progressFill =
    document.querySelector(".audio-progress-fill");

const currentTimeEl =
    document.getElementById("current-time");

const durationEl =
    document.getElementById("duration");

const reciterSelect =
    document.getElementById("reciter-select");

/* Demo Audio */

audio.src =
    "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

let isPlaying = false;

/* Play / Pause */

playBtn.addEventListener("click", () => {

    if (!isPlaying) {

        audio.play();

        playBtn.innerHTML =
            '<i data-lucide="pause"></i>';

        isPlaying = true;

    } else {

        audio.pause();

        playBtn.innerHTML =
            '<i data-lucide="play"></i>';

        isPlaying = false;
    }

    lucide.createIcons();
});

/* Volume */

volumeSlider.addEventListener("input", () => {

    audio.volume =
        volumeSlider.value / 100;
});

/* Speed */

const speeds =
    [1, 1.25, 1.5, 1.75, 2];

let speedIndex = 0;

speedBtn.addEventListener("click", () => {

    speedIndex++;

    if (speedIndex >= speeds.length) {

        speedIndex = 0;
    }

    audio.playbackRate =
        speeds[speedIndex];

    speedBtn.textContent =
        speeds[speedIndex] + "x";
});

/* Progress */

audio.addEventListener("timeupdate", () => {

    const progress = (audio.currentTime / audio.duration) * 100;

    progressFill.style.width =
        `${progress}%`;

    currentTimeEl.textContent = formatTime(audio.currentTime);
});

/* Duration */

audio.addEventListener("loadedmetadata", () => {

    durationEl.textContent =
        formatTime(audio.duration);
});

/* Seek */

progressBar.addEventListener("click", (e) => {

    const width =
        progressBar.clientWidth;

    const clickX =
        e.offsetX;

    audio.currentTime =
        (clickX / width) *
        audio.duration;
});


prevBtn.addEventListener("click", () => {

    audio.currentTime = 0;
});


nextBtn.addEventListener("click", () => {

    audio.currentTime =
        audio.duration - 1;
});


function formatTime(seconds) {

    const mins =
        Math.floor(seconds / 60);

    const secs =
        Math.floor(seconds % 60);

    return `${mins}:${secs
        .toString()
        .padStart(2, "0")}`;
}
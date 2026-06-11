console.log("Audio Player Loaded");

const audio =
document.getElementById("quran-audio");

const playBtn =
document.getElementById("play-btn");

const skipBackBtn =
document.getElementById("skip-back-btn");

const skipForwardBtn =
document.getElementById("skip-forward-btn");

const progressBar =
document.getElementById("audio-progress");

const progressFill =
document.querySelector(".audio-progress-fill");

const currentTimeEl =
document.getElementById("current-time");

const durationEl =
document.getElementById("duration");

const muteBtn =
document.getElementById("mute-btn");

const volumeSlider =
document.getElementById("volume-slider");

const speedBtn =
document.getElementById("speed-btn");

audio.src =
"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";

audio.volume = .8;

let isPlaying = false;

playBtn.addEventListener("click", () => {

    if(isPlaying){

        audio.pause();

        playBtn.innerHTML =
        '<i data-lucide="play"></i>';

    }else{

        audio.play();

        playBtn.innerHTML =
        '<i data-lucide="pause"></i>';
    }

    isPlaying = !isPlaying;

    lucide.createIcons();
});

audio.addEventListener("loadedmetadata", () => {

    durationEl.textContent =
    formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {

    const progress =
    (audio.currentTime /
    audio.duration) * 100;

    progressFill.style.width =
    `${progress}%`;

    currentTimeEl.textContent =
    formatTime(audio.currentTime);
});

progressBar.addEventListener("click", (e) => {

    const width =
    progressBar.clientWidth;

    const clickX =
    e.offsetX;

    audio.currentTime =
    (clickX / width)
    * audio.duration;
});

skipBackBtn.addEventListener("click", () => {

    audio.currentTime -= 10;
});

skipForwardBtn.addEventListener("click", () => {

    audio.currentTime += 10;
});

muteBtn.addEventListener("click", () => {

    audio.muted =
    !audio.muted;

    if(audio.muted){

        muteBtn.innerHTML =
        '<i data-lucide="volume-x"></i>';

    }else{

        muteBtn.innerHTML =
        '<i data-lucide="volume-2"></i>';
    }

    lucide.createIcons();
});

volumeSlider.addEventListener("input", () => {

    audio.volume =
    volumeSlider.value / 100;
});

const speeds =
[1,1.25,1.5,2];

let speedIndex = 0;

speedBtn.addEventListener("click", () => {

    speedIndex++;

    if(speedIndex >= speeds.length){

        speedIndex = 0;
    }

    audio.playbackRate =
    speeds[speedIndex];

    speedBtn.textContent =
    speeds[speedIndex] + "x";
});

function formatTime(seconds){

    const mins =
    Math.floor(seconds / 60);

    const secs =
    Math.floor(seconds % 60);

    return `${mins}:${secs
    .toString()
    .padStart(2,"0")}`;
}
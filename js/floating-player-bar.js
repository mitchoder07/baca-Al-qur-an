/* ============================================================
   BACA — floating-player-bar.js  (v2 — professional redesign)
   A compact floating audio player with full controls.
   ============================================================ */

(function () {
    'use strict';

    var STORAGE_KEY = 'bacaFloatingPlayer';
    var SAVE_INTERVAL_MS = 2000;

    // ── Audio servers (mp3quran.net) ──
    var SERVERS = {
        'mishari':    'https://server8.mp3quran.net/afs/',
        'sudais':     'https://server11.mp3quran.net/sds/',
        'abdulbasit': 'https://server7.mp3quran.net/basit/',
        'husary':     'https://server13.mp3quran.net/husr/',
        'minshawi':   'https://server10.mp3quran.net/minsh/',
        'shaatree':   'https://server11.mp3quran.net/shatri/',
        'muaiqly':    'https://server12.mp3quran.net/maher/',
        'shuraym':    'https://server7.mp3quran.net/shur/',
        'hudhaify':   'https://server8.mp3quran.net/bna/',
        'ajamy':      'https://server10.mp3quran.net/ajm/',
        'jibreel':    'https://server8.mp3quran.net/jbrl/',
        'ayyoub':     'https://server16.mp3quran.net/ayyoub2/',
        'ghamdi':     'https://server7.mp3quran.net/s_gmd/',
        'basfar':     'https://server6.mp3quran.net/bsfr/',
        'matroud':    'https://server8.mp3quran.net/mtrod/',
        'rifai':      'https://server8.mp3quran.net/hani/',
        'tablawi':    'https://server12.mp3quran.net/tblawi/',
        'okasha':     'https://server16.mp3quran.net/okasha/Rewayat-Albizi-A-n-Ibn-Katheer/',
        'ali_jaber':  'https://server8.mp3quran.net/jbrl/',
        'abdulbasit_mj': 'https://server7.mp3quran.net/basit/',
        'husary_muj': 'https://server13.mp3quran.net/husr/',
        'juhaynee':   'https://server8.mp3quran.net/afs/',
        'johany':     'https://server8.mp3quran.net/afs/',
        'qasim':      'https://server8.mp3quran.net/afs/',
        'neana':      'https://server8.mp3quran.net/afs/',
        'ayman_swed': 'https://server8.mp3quran.net/afs/'
    };

    // ── Surah names (compact) ──
    var SURAH_NAMES = [
        'Al-Fatihah','Al-Baqarah','Ali Imran','An-Nisa','Al-Maidah','Al-Anam','Al-Araf','Al-Anfal','At-Tawbah','Yunus',
        'Hud','Yusuf','Ar-Rad','Ibrahim','Al-Hijr','An-Nahl','Al-Isra','Al-Kahf','Maryam','Ta-Ha',
        'Al-Anbiya','Al-Hajj','Al-Muminun','An-Nur','Al-Furqan','Ash-Shuara','An-Naml','Al-Qasas','Al-Ankabut','Ar-Rum',
        'Luqman','As-Sajdah','Al-Ahzab','Saba','Fatir','Ya-Sin','As-Saffat','Sad','Az-Zumar','Ghafir',
        'Fussilat','Ash-Shuraa','Az-Zukhruf','Ad-Dukhan','Al-Jathiyah','Al-Ahqaf','Muhammad','Al-Fath','Al-Hujurat','Qaf',
        'Adh-Dhariyat','At-Tur','An-Najm','Al-Qamar','Ar-Rahman','Al-Waqiah','Al-Hadid','Al-Mujadila','Al-Hashr','Al-Mumtahanah',
        'As-Saf','Al-Jumuah','Al-Munafiqun','At-Taghabun','At-Talaq','At-Tahrim','Al-Mulk','Al-Qalam','Al-Haqqah','Al-Maarj',
        'Nuh','Al-Jinn','Al-Muzzammil','Al-Muddaththir','Al-Qiyamah','Al-Insan','Al-Mursalat','An-Naba','An-Nazi-at','Abasa',
        'At-Takwir','Al-Infitar','Al-Mutaffifin','Al-Inshiqaq','Al-Buruj','At-Tariq','Al-Ala','Al-Ghashiyah','Al-Fajr','Al-Balad',
        'Ash-Shams','Al-Layl','Ad-Duha','Ash-Sharh','At-Tin','Al-Alaq','Al-Qadr','Al-Bayyinah','Az-Zalzalah','Al-Adiyat',
        'Al-Qariah','At-Takathur','Al-Asr','Al-Humazah','Al-Fil','Quraysh','Al-Maun','Al-Kawthar','Al-Kafirun','An-Nasr',
        'Al-Masad','Al-Ikhlas','Al-Falaq','An-Nas'
    ];

    // ── SVG Icons ──
    var ICONS = {
        play:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h4v14H6zm8 0h4v14h-4z"/></svg>',
        prev:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>',
        next:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>',
        back10:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4l-8 8 8 8v-4"/><text x="14" y="17" font-size="9" fill="currentColor" stroke="none" font-weight="bold">10</text></svg>',
        fwd10: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8V4l8 8-8 8v-4"/><text x="3" y="17" font-size="9" fill="currentColor" stroke="none" font-weight="bold">10</text></svg>',
        close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
        repeatOff:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>',
        repeatOne:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/><text x="12" y="15" font-size="7" fill="currentColor" stroke="none" font-weight="bold" text-anchor="middle">1</text></svg>',
        repeatAll:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 2l4 4-4 4"/><path d="M3 11v-1a4 4 0 0 1 4-4h14"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v1a4 4 0 0 1-4 4H3"/></svg>'
    };

    // ── Helper functions ──
    function getAudioUrl(surahId, reciterId) {
        var server = SERVERS[reciterId] || SERVERS['mishari'];
        return server + String(surahId).padStart(3, '0') + '.mp3';
    }

    function getSurahName(id) {
        return SURAH_NAMES[Number(id) - 1] || ('Surah ' + id);
    }

    function fmt(s) {
        if (!s || isNaN(s)) return '0:00';
        var m = Math.floor(s / 60);
        var sec = Math.floor(s % 60);
        return m + ':' + String(sec).padStart(2, '0');
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
    }

    // ── Determine which page we're on ──
    var path = window.location.pathname;
    var filename = path.split('/').pop() || 'index.html';
    var dirParts = path.split('/').filter(Boolean);
    dirParts.pop();
    var inRecitersDir = dirParts.indexOf('reciters') !== -1;
    var isReciterProfile = path.indexOf('/reciters/reciter.html') !== -1;
    var isTargetPage = (filename === 'index.html') || (filename === 'game.html');

    // ── Main execution ──
    if (isReciterProfile) {
        setupReciterPageSaving();
    } else if (isTargetPage) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupFloatingBar);
        } else {
            setupFloatingBar();
        }
    }

    // ============================================================
    // PART 1: reciter.html — save playback state
    // ============================================================
    function setupReciterPageSaving() {
        var audio = document.getElementById('reciter-audio');
        if (!audio) return;

        function saveState() {
            try {
                var rid = new URLSearchParams(window.location.search).get('r') || 'mishari';
                var nameEl = document.getElementById('reciter-name') || document.getElementById('sp-reciter-name');
                var surahEl = document.getElementById('sp-surah-name');
                var sid = window.currentSurahId || audio.dataset.surahId;
                if (!sid) return;
                localStorage.setItem(STORAGE_KEY, JSON.stringify({
                    surahId: Number(sid),
                    reciterId: rid,
                    reciterName: nameEl ? nameEl.textContent.trim() : '',
                    surahName: surahEl ? surahEl.textContent.trim() : ('Surah ' + sid),
                    currentTime: audio.currentTime || 0,
                    duration: audio.duration || 0,
                    isPlaying: !audio.paused && !audio.ended,
                    savedAt: Date.now()
                }));
            } catch (e) {}
        }

        setInterval(saveState, SAVE_INTERVAL_MS);
        audio.addEventListener('play', saveState);
        audio.addEventListener('pause', saveState);
        audio.addEventListener('loadedmetadata', saveState);
        audio.addEventListener('ended', function () {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        });
        window.addEventListener('beforeunload', saveState);
    }

    // ============================================================
    // PART 2: Target pages — show floating bar + resume
    // ============================================================
    function setupFloatingBar() {
        var state = null;
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            if (raw) state = JSON.parse(raw);
        } catch (e) {}
        if (!state || !state.surahId) return;

        // Expire after 6 hours
        if (Date.now() - (state.savedAt || 0) > 6 * 60 * 60 * 1000) {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            return;
        }

        // Load CSS if not already loaded
        var cssHref = (inRecitersDir ? '../' : '') + 'css/floating-player-bar.css';
        if (!document.querySelector('link[href*="floating-player-bar.css"]')) {
            var link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = cssHref;
            document.head.appendChild(link);
        }

        // Clean surah name (remove Arabic part after ·)
        var surahName = state.surahName || getSurahName(state.surahId);
        if (surahName.indexOf('\u00b7') !== -1) surahName = surahName.split('\u00b7')[0].trim();

        // Build the bar
        var bar = document.createElement('div');
        bar.className = 'baca-fb';
        bar.id = 'baca-fb';
        bar.setAttribute('role', 'region');
        bar.setAttribute('aria-label', 'Audio player');
        bar.innerHTML =
            '<div class="baca-fb-top">' +
                '<div class="baca-fb-info">' +
                    '<div class="baca-fb-surah" id="baca-fb-surah">' + escapeHtml(surahName) + '</div>' +
                    '<div class="baca-fb-reciter" id="baca-fb-reciter">' + escapeHtml(state.reciterName || 'Reciter') + '</div>' +
                '</div>' +
                '<button class="baca-fb-btn baca-fb-btn-close" id="baca-fb-close" aria-label="Close player">' + ICONS.close + '</button>' +
            '</div>' +
            '<div class="baca-fb-controls">' +
                '<button class="baca-fb-btn baca-fb-btn-sm" id="baca-fb-prev" aria-label="Previous surah" title="Previous surah">' + ICONS.prev + '</button>' +
                '<button class="baca-fb-btn baca-fb-btn-sm" id="baca-fb-back10" aria-label="Skip back 10 seconds" title="Back 10s">' + ICONS.back10 + '</button>' +
                '<button class="baca-fb-btn baca-fb-btn-play" id="baca-fb-play" aria-label="Play / Pause">' +
                    '<span class="baca-fb-icon-play">' + ICONS.play + '</span>' +
                    '<span class="baca-fb-icon-pause" style="display:none">' + ICONS.pause + '</span>' +
                    '<span class="baca-fb-spinner" style="display:none"></span>' +
                '</button>' +
                '<button class="baca-fb-btn baca-fb-btn-sm" id="baca-fb-fwd10" aria-label="Skip forward 10 seconds" title="Forward 10s">' + ICONS.fwd10 + '</button>' +
                '<button class="baca-fb-btn baca-fb-btn-sm" id="baca-fb-next" aria-label="Next surah" title="Next surah">' + ICONS.next + '</button>' +
                '<button class="baca-fb-btn baca-fb-btn-sm baca-fb-repeat" id="baca-fb-repeat" aria-label="Repeat" title="Repeat off">' + ICONS.repeatOff + '</button>' +
            '</div>' +
            '<div class="baca-fb-progress-section">' +
                '<div class="baca-fb-progress-bar" id="baca-fb-progress">' +
                    '<div class="baca-fb-progress-fill" id="baca-fb-fill"></div>' +
                '</div>' +
                '<div class="baca-fb-time-row">' +
                    '<span id="baca-fb-current">0:00</span>' +
                    '<span id="baca-fb-duration">0:00</span>' +
                '</div>' +
            '</div>';

        document.body.appendChild(bar);
        document.body.classList.add('baca-fb-active');

        // Create hidden audio element
        var audio = document.createElement('audio');
        audio.id = 'baca-fb-audio';
        audio.preload = 'auto';
        document.body.appendChild(audio);

        // ── PREVENT SIMULTANEOUS PLAYBACK ──
        // When the daily ayah audio (quran-audio) starts playing, pause the
        // floating bar. When the floating bar starts playing, pause the daily
        // ayah audio. Only one should play at a time.
        var dailyAyahAudio = document.getElementById('quran-audio');

        // When floating bar plays → pause daily ayah
        audio.addEventListener('play', function () {
            if (dailyAyahAudio && !dailyAyahAudio.paused) {
                dailyAyahAudio.pause();
                // Update the daily ayah play button icon to "play"
                var dailyPlayBtn = document.getElementById('play-btn');
                if (dailyPlayBtn) dailyPlayBtn.innerHTML = '<i data-lucide="play"></i>';
                if (window.lucide) lucide.createIcons();
            }
        });

        // When daily ayah plays → pause floating bar
        if (dailyAyahAudio) {
            dailyAyahAudio.addEventListener('play', function () {
                if (!audio.paused) {
                    audio.pause();
                }
            });
        }

        // State
        var isLoaded = false;
        var isPlaying = false;
        var currentSurahId = Number(state.surahId);
        var currentReciterId = state.reciterId;
        // Repeat modes: 'off' (stop after current), 'one' (repeat current surah), 'all' (auto-advance)
        var repeatMode = 'off';

        function loadAudio(surahId, seekTo) {
            isLoaded = false;
            showLoading(true);
            audio.src = getAudioUrl(surahId, currentReciterId);
            audio.load();
            audio.addEventListener('loadedmetadata', function onMeta() {
                audio.removeEventListener('loadedmetadata', onMeta);
                if (seekTo && seekTo < (audio.duration || Infinity)) {
                    try { audio.currentTime = seekTo; } catch (e) {}
                }
                isLoaded = true;
                showLoading(false);
                updateDuration();
                updateProgress();
            }, { once: true });
        }

        function play() {
            if (!isLoaded) {
                loadAudio(currentSurahId, state.currentTime);
                audio.addEventListener('canplay', function onCan() {
                    audio.removeEventListener('canplay', onCan);
                    audio.play().then(function () {
                        isPlaying = true; updatePlayIcon(); saveState();
                    }).catch(function () { isPlaying = false; updatePlayIcon(); });
                }, { once: true });
                return;
            }
            audio.play().then(function () {
                isPlaying = true; updatePlayIcon(); saveState();
            }).catch(function () {});
        }

        function pause() {
            audio.pause();
            isPlaying = false; updatePlayIcon(); saveState();
        }

        function togglePlay() { if (isPlaying) pause(); else play(); }

        function prevSurah() {
            if (currentSurahId > 1) {
                currentSurahId--;
                updateSurahDisplay();
                var wasPlaying = isPlaying;
                loadAudio(currentSurahId, 0);
                if (wasPlaying) audio.addEventListener('canplay', function () {
                    audio.play().then(function () { isPlaying = true; updatePlayIcon(); }).catch(function () {});
                }, { once: true });
            }
        }

        function nextSurah() {
            if (currentSurahId < 114) {
                currentSurahId++;
                updateSurahDisplay();
                var wasPlaying = isPlaying;
                loadAudio(currentSurahId, 0);
                if (wasPlaying) audio.addEventListener('canplay', function () {
                    audio.play().then(function () { isPlaying = true; updatePlayIcon(); }).catch(function () {});
                }, { once: true });
            }
        }

        function updateSurahDisplay() {
            var nameEl = document.getElementById('baca-fb-surah');
            if (nameEl) nameEl.textContent = getSurahName(currentSurahId);
            saveState();
        }

        function skip(seconds) {
            if (!isLoaded) return;
            audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds));
            updateProgress();
        }

        function showLoading(loading) {
            var sp = bar.querySelector('.baca-fb-spinner');
            var pl = bar.querySelector('.baca-fb-icon-play');
            var pa = bar.querySelector('.baca-fb-icon-pause');
            if (loading) { sp.style.display = 'inline-block'; pl.style.display = 'none'; pa.style.display = 'none'; }
            else { sp.style.display = 'none'; updatePlayIcon(); }
        }

        function updatePlayIcon() {
            var pl = bar.querySelector('.baca-fb-icon-play');
            var pa = bar.querySelector('.baca-fb-icon-pause');
            if (isPlaying) { pl.style.display = 'none'; pa.style.display = 'inline-block'; }
            else { pl.style.display = 'inline-block'; pa.style.display = 'none'; }
        }

        function updateProgress() {
            var cur = audio.currentTime || 0;
            var dur = audio.duration || state.duration || 0;
            var pct = dur > 0 ? (cur / dur) * 100 : 0;
            var fill = document.getElementById('baca-fb-fill');
            var curEl = document.getElementById('baca-fb-current');
            var durEl = document.getElementById('baca-fb-duration');
            if (fill) fill.style.width = pct + '%';
            if (curEl) curEl.textContent = fmt(cur);
            if (durEl) durEl.textContent = fmt(dur);
        }

        function updateDuration() {
            var durEl = document.getElementById('baca-fb-duration');
            if (durEl) durEl.textContent = fmt(audio.duration);
        }

        function saveState() {
            var newState = {
                surahId: currentSurahId, reciterId: currentReciterId,
                reciterName: state.reciterName, surahName: getSurahName(currentSurahId),
                currentTime: audio.currentTime || 0, duration: audio.duration || state.duration || 0,
                isPlaying: isPlaying, savedAt: Date.now()
            };
            state = newState;
            try { localStorage.setItem(STORAGE_KEY, JSON.stringify(newState)); } catch (e) {}
        }

        // Wire up events
        document.getElementById('baca-fb-play').addEventListener('click', togglePlay);
        document.getElementById('baca-fb-prev').addEventListener('click', prevSurah);
        document.getElementById('baca-fb-next').addEventListener('click', nextSurah);
        document.getElementById('baca-fb-back10').addEventListener('click', function () { skip(-10); });
        document.getElementById('baca-fb-fwd10').addEventListener('click', function () { skip(10); });

        // Repeat button: cycles off → one → all → off
        document.getElementById('baca-fb-repeat').addEventListener('click', function () {
            if (repeatMode === 'off') repeatMode = 'one';
            else if (repeatMode === 'one') repeatMode = 'all';
            else repeatMode = 'off';
            updateRepeatIcon();
        });

        function updateRepeatIcon() {
            var btn = document.getElementById('baca-fb-repeat');
            if (!btn) return;
            var labels = { off: 'Repeat off', one: 'Repeat one surah', all: 'Repeat all (auto-advance)' };
            btn.title = labels[repeatMode];
            btn.setAttribute('aria-label', labels[repeatMode]);
            // Swap icon
            btn.innerHTML = repeatMode === 'one' ? ICONS.repeatOne :
                            repeatMode === 'all' ? ICONS.repeatAll :
                            ICONS.repeatOff;
            // Highlight when active
            btn.classList.toggle('active', repeatMode !== 'off');
        }
        document.getElementById('baca-fb-close').addEventListener('click', function () {
            audio.pause(); audio.src = '';
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
            bar.classList.remove('visible');
            document.body.classList.remove('baca-fb-active');
            setTimeout(function () { bar.remove(); audio.remove(); }, 400);
        });

        var progressEl = document.getElementById('baca-fb-progress');
        progressEl.addEventListener('click', function (e) {
            if (!isLoaded || !audio.duration) return;
            var r = progressEl.getBoundingClientRect();
            audio.currentTime = ((e.clientX - r.left) / r.width) * audio.duration;
            updateProgress();
        });

        audio.addEventListener('timeupdate', function () {
            updateProgress();
            if (Math.floor(audio.currentTime) % 3 === 0) saveState();
        });

        audio.addEventListener('ended', function () {
            // Repeat one: replay the same surah
            if (repeatMode === 'one') {
                audio.currentTime = 0;
                audio.play().catch(function () {});
                return;
            }
            // Repeat all or auto-advance: play next surah
            if (repeatMode === 'all' || currentSurahId < 114) {
                nextSurah();
            } else {
                // Last surah, repeat off → stop and close
                isPlaying = false; updatePlayIcon();
                try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
                bar.classList.remove('visible');
                document.body.classList.remove('baca-fb-active');
                setTimeout(function () { bar.remove(); audio.remove(); }, 400);
            }
        });

        audio.addEventListener('play', function () { isPlaying = true; updatePlayIcon(); });
        audio.addEventListener('pause', function () { isPlaying = false; updatePlayIcon(); });
        audio.addEventListener('canplay', function () { showLoading(false); });

        // Show the bar
        setTimeout(function () { bar.classList.add('visible'); }, 400);

        // Preload audio
        loadAudio(currentSurahId, state.currentTime);

        // Auto-resume if was playing
        if (state.isPlaying) {
            setTimeout(function () { play(); }, 1000);
        } else {
            updatePlayIcon();
            setTimeout(updateProgress, 500);
        }

        window.addEventListener('beforeunload', saveState);
    }
})();

/* ayah-downloader.js - Download single ayah audio to device storage
 *
 * v31: provides a single shared API for downloading any ayah's audio as an
 * MP3 file to the user's device. Used by:
 *   - The floating mini-player on the home page (id="mini-download")
 *   - The floating mini-player on the Mushaf page (id="mini-download")
 *   - The reciter page's per-surah download buttons (future)
 *
 * The downloaded MP3 is fetched from everyayah.com (or the reciter's
 * full-surah server, depending on whether the reciter is per-ayah or
 * full-surah-only). The file is named like:
 *   "{SurahName} - Ayah {N} - {ReciterName}.mp3"
 *
 * The script also caches the downloaded audio in the Cache API (so the
 * mobile app can play it offline), and shows a toast when done.
 *
 * Public API:
 *   BacaDownloader.downloadAyahAudio(surahNum, ayahNum, reciterId, reciterName, surahName)
 *     - Returns a Promise that resolves to { success, url, filename, error }
 *
 *   BacaDownloader.downloadFullSurah(surahNum, reciterId, reciterName, surahName)
 *     - For the reciter page: downloads a full surah MP3 from mp3quran.net
 *     - Returns a Promise that resolves to { success, url, filename, error }
 */

(function () {
  'use strict';

  window.BacaDownloader = window.BacaDownloader || {};

  // === HELPERS ===

  function showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else {
      var t = document.getElementById('toast');
      if (t) {
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(function () { t.classList.remove('show'); }, 3500);
      }
    }
  }

  function sanitizeFilename(s) {
    return String(s || '')
      .replace(/[\\/:*?"<>|]/g, '')   // Windows-illegal chars
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Pad surah and ayah numbers to 3 digits (everyayah.com format)
  function pad3(n) {
    return String(n).padStart(3, '0');
  }

  // Trigger a browser download from a Blob
  function triggerBlobDownload(blob, filename) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);
  }

  // === RECITER URL HELPERS ===
  // v32 FIX: The v31 version had WRONG folder names (e.g. "Alafasy" instead
  // of "Alafasy_128kbps"), which caused 404 errors on everyayah.com for
  // EVERY reciter. Now we use the EXACT same RECITERS array as script.js,
  // with the correct folder names verified against the live everyayah.com
  // server.
  //
  // We also try to use window.getAyahAudioUrl() from script.js first (which
  // has the full RECITERS array with proper folder + fullSurahOnly handling).
  // Only fall back to the local map if script.js isn't loaded.

  var RECITER_FOLDERS = {
    'mishari': 'Alafasy_128kbps',
    'sudais': 'Abdurrahmaan_As-Sudais_192kbps',
    'ali_jaber': 'Ali_Jaber_64kbps',
    'abdulbasit': 'Abdul_Basit_Murattal_192kbps',
    'abdulbasit_mj': 'Abdul_Basit_Mujawwad_128kbps',
    'husary': 'Husary_128kbps',
    'husary_muj': 'Husary_128kbps_Mujawwad',
    'minshawi': 'Minshawy_Murattal_128kbps',
    'shaatree': 'Abu_Bakr_Ash-Shaatree_128kbps',
    'muaiqly': 'Maher_AlMuaiqly_64kbps',
    'shuraym': 'Saood_ash-Shuraym_128kbps',
    'hudhaify': 'Hudhaify_128kbps',
    'ajamy': 'ahmed_ibn_ali_al_ajamy_128kbps',
    'jibreel': 'Muhammad_Jibreel_128kbps',
    'ayyoub': 'Muhammad_Ayyoub_128kbps',
    'ghamdi': 'Ghamadi_40kbps',
    'basfar': 'Abdullah_Basfar_192kbps',
    'matroud': 'Abdullah_Matroud_128kbps',
    'juhaynee': 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    'johany': 'Abdullah_Al-Johany_128kbps',
    'tablawi': 'Mohammad_al_Tablaway_128kbps',
    'rifai': 'Hani_Rifai_192kbps',
    'qasim': 'Muhsin_Al_Qasim_192kbps',
    'neana': 'Ahmed_Neana_128kbps',
    'ayman_swed': 'Ayman_Sowaid_64kbps',
    'okasha': 'Okasha_Kameny_64kbps',
    'yasser_dosari': 'Yasser_Al_Dosari_128kbps',
    'mansour_salmi': 'Mansour_Al_Salmi_128kbps',
    'husary_warsh': 'Husary_Warsh_128kbps',
    'husary_qalun': 'Husary_Qalun_128kbps',
    'abdulbasit_warsh': 'Abdul_Basit_Warsh_128kbps',
    'ibrahim_dosari_warsh': 'Ibrahim_Dosari_Warsh_128kbps',
    'huthaifi_qalun': 'Hudhaify_Qalun_128kbps',
    'airawy_warsh': 'Al-Airawy_Warsh_128kbps',
  };

  // Reciters that are full-surah-only (no per-ayah audio on everyayah.com)
  var FULL_SURAH_ONLY_RECITERS = [
    'okasha', 'yasser_dosari', 'mansour_salmi',
    'husary_warsh', 'husary_qalun', 'abdulbasit_warsh',
    'ibrahim_dosari_warsh', 'huthaifi_qalun', 'airawy_warsh'
  ];

  var FULL_SURAH_SERVERS = {
    'mishari': 'https://server8.mp3quran.net/afs/',
    'sudais': 'https://server11.mp3quran.net/sds/',
    'abdulbasit': 'https://server7.mp3quran.net/basit/',
    'husary': 'https://server13.mp3quran.net/husr/',
    'minshawi': 'https://server10.mp3quran.net/minsh/',
    'shaatree': 'https://server11.mp3quran.net/shatri/',
    'muaiqly': 'https://server12.mp3quran.net/maher/',
    'shuraym': 'https://server7.mp3quran.net/shur/',
    'hudhaify': 'https://server8.mp3quran.net/bna/',
    'ajamy': 'https://server10.mp3quran.net/ajm/',
    'jibreel': 'https://server8.mp3quran.net/jbrl/',
    'ayyoub': 'https://server16.mp3quran.net/ayyoub2/',
    'ghamdi': 'https://server7.mp3quran.net/s_gmd/',
    'basfar': 'https://server6.mp3quran.net/bsfr/',
    'matroud': 'https://server8.mp3quran.net/mtrod/',
    'rifai': 'https://server8.mp3quran.net/hani/',
    'tablawi': 'https://server12.mp3quran.net/tblawi/',
    'okasha': 'https://server16.mp3quran.net/okasha/Rewayat-Albizi-A-n-Ibn-Katheer/',
    'yasser_dosari': 'https://server11.mp3quran.net/yasser/',
    'mansour_salmi': 'https://server14.mp3quran.net/mansor/',
    'husary_warsh': 'https://server13.mp3quran.net/husr/Rewayat-Warsh-A-n-Nafi/',
    'husary_qalun': 'https://server13.mp3quran.net/husr/Rewayat-Qalon-A-n-Nafi/',
    'abdulbasit_warsh': 'https://server7.mp3quran.net/basit/Rewayat-Warsh-A-n-Nafi/',
    'ibrahim_dosari_warsh': 'https://server10.mp3quran.net/ibrahim_dosri/Rewayat-Warsh-A-n-Nafi/',
    'huthaifi_qalun': 'https://server9.mp3quran.net/huthifi_qalon/',
    'airawy_warsh': 'https://server6.mp3quran.net/earawi/'
  };

  function getAyahAudioUrl(surahNum, ayahNum, reciterId) {
    // v32: try to use script.js's getAyahAudioUrl first (it has the full
    // RECITERS array with proper fullSurahOnly handling)
    if (typeof window.getAyahAudioUrl === 'function') {
      try {
        return window.getAyahAudioUrl(surahNum, ayahNum, reciterId);
      } catch (e) { /* fall through to local implementation */ }
    }
    // Local fallback
    var folder = RECITER_FOLDERS[reciterId] || RECITER_FOLDERS['mishari'];
    var s = pad3(surahNum);
    var a = pad3(ayahNum);
    return 'https://everyayah.com/data/' + folder + '/' + s + a + '.mp3';
  }

  function getFullSurahAudioUrl(surahNum, reciterId) {
    var server = FULL_SURAH_SERVERS[reciterId] || FULL_SURAH_SERVERS['mishari'];
    var padded = String(surahNum).padStart(3, '0');
    return server + padded + '.mp3';
  }

  function hasFullSurahAudio(reciterId) {
    return Object.prototype.hasOwnProperty.call(FULL_SURAH_SERVERS, reciterId);
  }

  // Cache the downloaded audio in the Cache API so the mobile app can play it offline
  function cacheAudio(url, blob) {
    if (!('caches' in window)) return Promise.resolve();
    return caches.open('baca-offline-audio-v1').then(function (cache) {
      var response = new Response(blob, {
        headers: { 'Content-Type': blob.type || 'audio/mpeg' }
      });
      return cache.put(url, response);
    }).catch(function () { /* ignore cache errors */ });
  }

  // === PUBLIC API ===

  // Download a single ayah's audio as an MP3 file.
  // surahNum: 1-114
  // ayahNum: 1 to N (number of ayahs in the surah)
  // reciterId: e.g. "mishari", "sudais", etc.
  // reciterName: e.g. "Mishary Alafasy" (for the filename)
  // surahName: e.g. "Al-Fatihah" (for the filename)
  // Returns: Promise<{ success: boolean, url: string, filename: string, error?: string }>
  function downloadAyahAudio(surahNum, ayahNum, reciterId, reciterName, surahName) {
    var url = getAyahAudioUrl(surahNum, ayahNum, reciterId);
    var filename = sanitizeFilename(surahName + ' - Ayah ' + ayahNum + ' - ' + reciterName) + '.mp3';

    showToast('Downloading ' + surahName + ' Ayah ' + ayahNum + '...');

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      })
      .then(function (blob) {
        // Cache for offline use in the mobile app
        return cacheAudio(url, blob).then(function () {
          return blob;
        });
      })
      .then(function (blob) {
        triggerBlobDownload(blob, filename);
        showToast('Downloaded: ' + surahName + ' Ayah ' + ayahNum);
        return { success: true, url: url, filename: filename };
      })
      .catch(function (err) {
        console.error('Ayah download failed:', err);
        showToast('Download failed. Check your internet connection.');
        return { success: false, url: url, filename: filename, error: err.message };
      });
  }

  // Download a full surah's audio as an MP3 file (for the reciter page).
  // surahNum: 1-114
  // reciterId: e.g. "mishari"
  // reciterName: e.g. "Mishary Alafasy"
  // surahName: e.g. "Al-Fatihah"
  function downloadFullSurah(surahNum, reciterId, reciterName, surahName) {
    var url = getFullSurahAudioUrl(surahNum, reciterId);
    var filename = sanitizeFilename(surahName + ' - Full Surah - ' + reciterName) + '.mp3';

    showToast('Downloading ' + surahName + ' (full surah)...');

    return fetch(url)
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.blob();
      })
      .then(function (blob) {
        return cacheAudio(url, blob).then(function () {
          return blob;
        });
      })
      .then(function (blob) {
        triggerBlobDownload(blob, filename);
        showToast('Downloaded: ' + surahName + ' (full surah)');
        return { success: true, url: url, filename: filename };
      })
      .catch(function (err) {
        console.error('Full surah download failed:', err);
        showToast('Download failed. This reciter may not support full-surah download.');
        return { success: false, url: url, filename: filename, error: err.message };
      });
  }

  // === WIRE UP THE MINI-PLAYER DOWNLOAD BUTTONS ===
  // Both the home page and the Mushaf page have a #mini-download button.
  // We wire it up via event delegation so it works regardless of when the
  // button appears in the DOM.

  function getActiveAudioContext() {
    // v33: the Mushaf page exposes window.currentMushafSurah and
    // window.currentMushafAyah when an ayah is played. Use those first.
    // The home page (index.html) exposes window.selectedSurah and
    // window.currentAyahPlaying. Fall back to reading the floating
    // player's text if neither is available.

    var surahNum = 0;
    var ayahNum = 0;
    var reciterId = 'mishari';
    var reciterName = 'Mishary Alafasy';
    var surahName = 'Surah';

    // --- Mushaf page: check globals exposed by mushaf.js ---
    if (typeof window.currentMushafSurah === 'number' && window.currentMushafSurah > 0) {
      surahNum = window.currentMushafSurah;
      ayahNum = window.currentMushafAyah || 1;
      reciterId = window.currentReciterId || 'mishari';
      // Get reciter name from the Mushaf toolbar indicator
      var mushafReciterIndicator = document.getElementById('reciter-indicator');
      if (mushafReciterIndicator) {
        reciterName = mushafReciterIndicator.textContent.trim();
      }
      // Get surah name from the floating player
      var fpSurah = document.getElementById('floating-surah');
      if (fpSurah) surahName = fpSurah.textContent.trim();
      // Or from SURAH_LIST if available
      if (typeof window.SURAH_LIST !== 'undefined' && window.SURAH_LIST) {
        var meta = window.SURAH_LIST.find(function (s) { return s.id === surahNum; });
        if (meta) surahName = meta.transliteration || meta.name || surahName;
      } else if (typeof SURAH_LIST !== 'undefined') {
        // Mushaf page has SURAH_LIST in its own scope
        var meta2 = SURAH_LIST[surahNum - 1];
        if (meta2) surahName = meta2.transliteration || meta2.name || surahName;
      }
      return { surahNum: surahNum, ayahNum: ayahNum, reciterId: reciterId, reciterName: reciterName, surahName: surahName };
    }

    // --- Home page (index.html): check globals exposed by script.js ---
    if (typeof window.selectedSurah === 'number' && window.selectedSurah > 0) {
      surahNum = window.selectedSurah;
    }
    if (typeof window.currentAyahPlaying === 'number' && window.currentAyahPlaying > 0) {
      ayahNum = window.currentAyahPlaying;
    }
    if (typeof window.currentReciterId === 'string') {
      reciterId = window.currentReciterId;
    }

    // --- Fall back to reading the floating player text ---
    var fp = document.getElementById('floating-player');
    if (!fp || fp.hidden || fp.style.display === 'none') return null;

    var surahNameEl = document.getElementById('floating-surah');
    var ayahEl = document.getElementById('floating-ayah');
    if (!surahNameEl || !ayahEl) return null;

    surahName = surahNameEl.textContent || '';
    var ayahText = ayahEl.textContent || '';
    var ayahMatch = ayahText.match(/Ayah\s+(\d+)/i);
    if (ayahMatch) ayahNum = parseInt(ayahMatch[1], 10);
    if (!ayahNum) ayahNum = 1;

    // Look up surah number by name if we don't already have it
    if (!surahNum && typeof window.SURAH_LIST !== 'undefined') {
      for (var i = 0; i < window.SURAH_LIST.length; i++) {
        if (window.SURAH_LIST[i].transliteration === surahName ||
            window.SURAH_LIST[i].name === surahName) {
          surahNum = window.SURAH_LIST[i].id;
          break;
        }
      }
    }
    if (!surahNum) surahNum = 1;

    // Get reciter name from the badge or dropdown
    var badge = document.getElementById('current-reciter-badge');
    if (badge) {
      reciterName = badge.textContent.trim();
    } else {
      var sel = document.getElementById('reciter-select2') || document.getElementById('reciter-select');
      if (sel && sel.selectedIndex >= 0) {
        reciterName = sel.options[sel.selectedIndex].text;
      }
    }

    return { surahNum: surahNum, ayahNum: ayahNum, reciterId: reciterId, reciterName: reciterName, surahName: surahName };
  }

  function wireMiniDownloadButton() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('#mini-download');
      if (!btn) return;
      e.preventDefault();
      var ctx = getActiveAudioContext();
      if (!ctx) {
        showToast('Play an ayah first, then tap download.');
        return;
      }
      downloadAyahAudio(ctx.surahNum, ctx.ayahNum, ctx.reciterId, ctx.reciterName, ctx.surahName);
    });
  }

  // Expose the public API
  window.BacaDownloader.downloadAyahAudio = downloadAyahAudio;
  window.BacaDownloader.downloadFullSurah = downloadFullSurah;

  // Wire up the mini-download button when the DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireMiniDownloadButton);
  } else {
    wireMiniDownloadButton();
  }
})();

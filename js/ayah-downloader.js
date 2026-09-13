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
  // Mirrors the logic in js/script.js getAyahAudioUrl() so this file is
  // self-contained. Supports both per-ayah (everyayah.com) and full-surah
  // (mp3quran.net) reciters.

  var RECITER_FOLDERS = {
    'mishari': 'Alafasy',
    'sudais': 'Abdul_Basit',
    'abdulbasit': 'Abdul_Basit',
    'husary': 'Husary',
    'husary_muj': 'Husary_128kbps',
    'minshawi': 'Minshawy_Murattal',
    'shaatree': 'Saood_ash-Shuraym',
    'muaiqly': 'MaherAlMuaiqly',
    'shuraym': 'Saood_ash-Shuraym',
    'hudhaify': 'Hudhaify_128kbps',
    'ajamy': 'Ahmed_ibn_Ali_al-Ajamy_128kbps',
    'jibreel': 'Muhammad_Jibreel_128kbps',
    'ayyoub': 'Muhammad_Ayyoub_128kbps',
    'ghamdi': 'Saood_ash-Shuraym',
    'basfar': 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    'matroud': 'Mahmood_Khaleel_Al-Husaree_128kbps',
    'juhaynee': 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    'johany': 'Abdullaah_3awwaad_Al-Juhaynee_128kbps',
    'tablawi': 'Mohammad_al-Tablawi_128kbps',
    'rifai': 'Hani_Rifai_128kbps',
    'qasim': 'Abdul_Muhsin_al-Qasim_128kbps',
    'neana': 'Ahmed_Neana_128kbps',
    'ayman_swed': 'Ayman_Sowaid_64kbps',
    'okasha': 'Okasha_Kameny_64kbps',
    'yasser_dosari': 'Yasser_Ad-Dosari_128kbps',
    'mansour_salmi': 'Mansour_Al-Salmi_64kbps',
    'husary_warsh': 'Husary_Warsh_128kbps',
    'husary_qalun': 'Husary_Qalun_128kbps',
    'abdulbasit_warsh': 'Abdul_Basit_Warsh_128kbps',
    'ibrahim_dosari_warsh': 'Ibrahim_Al-Dosari_Warsh_128kbps',
    'huthaifi_qalun': 'Hudhaify_Qalun_128kbps',
    'airawy_warsh': 'Al-Airawy_Warsh_128kbps',
  };

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
    // The home page (index.html) uses two audio elements:
    //   - #surah-audio (full-surah player in the audio drawer)
    //   - #ayah-player (per-ayah player for individual verse buttons)
    // The Mushaf page uses #ayah-audio.
    // We determine which is currently playing and extract surah/ayah info
    // from the floating player's display.
    var fp = document.getElementById('floating-player');
    if (!fp || fp.hidden || fp.style.display === 'none') return null;

    var surahNameEl = document.getElementById('floating-surah');
    var ayahEl = document.getElementById('floating-ayah');
    if (!surahNameEl || !ayahEl) return null;

    var surahName = surahNameEl.textContent || '';
    var ayahText = ayahEl.textContent || '';
    // ayahText looks like "Ayah 5" or "Ayah 5 (range loop)"
    var ayahMatch = ayahText.match(/Ayah\s+(\d+)/i);
    var ayahNum = ayahMatch ? parseInt(ayahMatch[1], 10) : 1;

    // We don't have surah number directly, but we can look it up from
    // the global SURAH_LIST if available, or from the current surah context.
    var surahNum = 1;
    if (typeof window.SURAH_LIST !== 'undefined') {
      for (var i = 0; i < window.SURAH_LIST.length; i++) {
        if (window.SURAH_LIST[i].transliteration === surahName ||
            window.SURAH_LIST[i].name === surahName) {
          surahNum = window.SURAH_LIST[i].id;
          break;
        }
      }
    } else if (typeof window.selectedSurah === 'number') {
      surahNum = window.selectedSurah;
    } else if (typeof window.currentSurahId === 'number') {
      surahNum = window.currentSurahId;
    }

    // Get the reciter ID from wherever the page stores it
    var reciterId = 'mishari'; // default
    var reciterName = 'Mishary Alafasy';
    if (typeof window.currentReciterId === 'string') {
      reciterId = window.currentReciterId;
    } else {
      var reciterSelect = document.getElementById('reciter-select') ||
                          document.getElementById('reciter-select2');
      if (reciterSelect && reciterSelect.value) {
        reciterId = reciterSelect.value;
      }
    }
    // Get reciter name from the badge or dropdown
    var badge = document.getElementById('current-reciter-badge');
    if (badge) reciterName = badge.textContent.trim();
    else {
      var sel = document.getElementById('reciter-select2') || document.getElementById('reciter-select');
      if (sel) reciterName = sel.options[sel.selectedIndex].text;
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

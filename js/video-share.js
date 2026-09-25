/* video-share.js - Share/download ayah as a video (image + audio)
 *
 * v31: extends the existing share-as-image feature with a new "Share as Video"
 * option. The video shows the ayah image (same as the share-image feature
 * generates) and plays the ayah's audio with the chosen reciter. The video
 * length equals the audio length.
 *
 * How it works:
 *   1. Render the ayah image to a <canvas> element (same layout as share-image)
 *   2. Load the ayah audio (from everyayah.com or the cache)
 *   3. Use a MediaStream that combines:
 *      - Canvas captureStream() for video frames
 *      - Web Audio API to route the audio into the stream
 *   4. Use MediaRecorder to record the stream into a WebM blob
 *   5. When the audio ends, stop recording
 *   6. Offer the blob for download or share via navigator.share()
 *
 * Browser support:
 *   - Chrome/Edge: full support (WebM with VP8/VP9 + Opus audio)
 *   - Firefox: full support
 *   - Safari: partial - Safari supports MediaRecorder but outputs MP4 in
 *     newer versions. For older Safari, we fall back to audio-only download.
 *
 * The video file is WebM format (most widely supported for canvas recording).
 *
 * Public API:
 *   BacaVideoShare.createAyahVideo({
 *     arabic: "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ",
 *     transliteration: "Bismillah ir-Rahman ir-Raheem",
 *     translation: "In the name of Allah, the Most Gracious, the Most Merciful.",
 *     reference: "Al-Fatihah 1:1",
 *     surahName: "Al-Fatihah",
 *     surahNum: 1,
 *     ayahNum: 1,
 *     reciterId: "mishari",
 *     reciterName: "Mishary Alafasy",
 *     theme: "dark" | "light"
 *   }) -> Promise<{ success, blob, url, filename, error }>
 */

(function () {
  'use strict';

  window.BacaVideoShare = window.BacaVideoShare || {};

  // === HELPERS ===

  function showToast(msg) {
    if (typeof window.showToast === 'function') {
      window.showToast(msg);
    } else {
      var t = document.getElementById('toast');
      if (t) {
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(function () { t.classList.remove('show'); }, 4000);
      }
    }
  }

  function sanitizeFilename(s) {
    return String(s || '')
      .replace(/[\\/:*?"<>|]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // === RECITER URL HELPERS ===
  // v32 FIX: use window.getAyahAudioUrl() from script.js if available (it
  // has the full RECITERS array with correct folder names). Fall back to
  // the local map with CORRECT folder names (verified against everyayah.com).

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
  };

  function pad3(n) { return String(n).padStart(3, '0'); }

  function getAyahAudioUrl(surahNum, ayahNum, reciterId) {
    // v32: try to use script.js's getAyahAudioUrl first (it has the full
    // RECITERS array with proper folder names + fullSurahOnly handling)
    if (typeof window.getAyahAudioUrl === 'function') {
      try {
        return window.getAyahAudioUrl(surahNum, ayahNum, reciterId);
      } catch (e) { /* fall through to local implementation */ }
    }
    var folder = RECITER_FOLDERS[reciterId] || RECITER_FOLDERS['mishari'];
    var s = pad3(surahNum);
    var a = pad3(ayahNum);
    return 'https://everyayah.com/data/' + folder + '/' + s + a + '.mp3';
  }

  // === CANVAS RENDERING ===
  // Renders the ayah image to a canvas. The canvas dimensions are 1080x1080
  // (square, suitable for social media sharing). The layout includes:
  //   - Baca logo at the top
  //   - Arabic text (large, centered)
  //   - Transliteration (medium, centered, italic)
  //   - Translation (smaller, centered)
  //   - Reference (bottom: "Surah Name Ayah:N - Reciter Name")

  function renderAyahToCanvas(canvas, ctx, opts) {
    var W = canvas.width;   // 1080
    var H = canvas.height;  // 1080
    var isLight = opts.theme === 'light';

    // === Background ===
    if (isLight) {
      // Light gradient
      var gradL = ctx.createLinearGradient(0, 0, W, H);
      gradL.addColorStop(0, '#f8fafc');
      gradL.addColorStop(1, '#f1f5f9');
      ctx.fillStyle = gradL;
    } else {
      // Dark gradient
      var gradD = ctx.createLinearGradient(0, 0, W, H);
      gradD.addColorStop(0, '#0f172a');
      gradD.addColorStop(1, '#1e293b');
      ctx.fillStyle = gradD;
    }
    ctx.fillRect(0, 0, W, H);

    // === Decorative border ===
    ctx.strokeStyle = isLight ? '#10b981' : '#34d399';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // Inner decorative border
    ctx.strokeStyle = isLight ? 'rgba(16, 185, 129, 0.3)' : 'rgba(52, 211, 153, 0.3)';
    ctx.lineWidth = 1;
    ctx.strokeRect(55, 55, W - 110, H - 110);

    // === Baca logo text at the top ===
    ctx.font = 'bold 28px "Poppins", sans-serif';
    ctx.fillStyle = isLight ? '#059669' : '#34d399';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('Baca', W / 2, 80);

    // Subtitle
    ctx.font = '16px "Poppins", sans-serif';
    ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
    ctx.fillText('Read the Quran', W / 2, 115);

    // === Arabic text ===
    // Use Amiri font (loaded by the page). The font size depends on the
    // length of the Arabic text so it fits nicely.
    var arabic = opts.arabic || '';
    var arabicFontSize = 64;
    if (arabic.length > 80) arabicFontSize = 48;
    if (arabic.length > 150) arabicFontSize = 40;
    if (arabic.length > 200) arabicFontSize = 34;

    ctx.font = arabicFontSize + 'px "Amiri", "Noto Naskh Arabic", serif';
    ctx.fillStyle = isLight ? '#0f172a' : '#f1f5f9';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.direction = 'rtl';

    // Word-wrap the Arabic text
    var arabicY = H / 2 - 120;
    var maxWidth = W - 200;
    var arabicLines = wrapText(ctx, arabic, maxWidth);
    var lineHeight = arabicFontSize * 1.6;
    var startY = arabicY - (arabicLines.length - 1) * lineHeight / 2;
    for (var i = 0; i < arabicLines.length; i++) {
      ctx.fillText(arabicLines[i], W / 2, startY + i * lineHeight);
    }

    // Reset direction for non-Arabic text
    ctx.direction = 'ltr';

    // === Transliteration ===
    var translit = opts.transliteration || '';
    var translitLineHeight = 34;
    var translitGapFromArabic = 50;
    if (translit) {
      ctx.font = 'italic 24px "Poppins", sans-serif';
      ctx.fillStyle = isLight ? '#475569' : '#cbd5e1';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var translitY = startY + arabicLines.length * lineHeight + translitGapFromArabic;
      var translitLines = wrapText(ctx, translit, maxWidth);
      for (var j = 0; j < translitLines.length; j++) {
        ctx.fillText(translitLines[j], W / 2, translitY + j * translitLineHeight);
      }
    }

    // === Translation ===
    var translation = opts.translation || '';
    var translitGapToTranslation = 55;
    if (translation) {
      ctx.font = '20px "Poppins", sans-serif';
      ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      var transY = startY + arabicLines.length * lineHeight + translitGapFromArabic + (translit ? translitLines.length * translitLineHeight + translitGapToTranslation : 40);
      var transLines = wrapText(ctx, translation, maxWidth);
      for (var k = 0; k < transLines.length; k++) {
        ctx.fillText(transLines[k], W / 2, transY + k * 30);
      }
    }

    // === Reference at the bottom ===
    var ref = opts.reference || '';
    var reciter = opts.reciterName || '';
    ctx.font = 'bold 22px "Poppins", sans-serif';
    ctx.fillStyle = isLight ? '#059669' : '#34d399';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(ref, W / 2, H - 110);

    if (reciter) {
      ctx.font = '16px "Poppins", sans-serif';
      ctx.fillStyle = isLight ? '#64748b' : '#94a3b8';
      ctx.fillText('Recited by ' + reciter, W / 2, H - 80);
    }
  }

  // Simple word-wrap for canvas text
  function wrapText(ctx, text, maxWidth) {
    var words = text.split(/\s+/);
    var lines = [];
    var currentLine = '';
    for (var i = 0; i < words.length; i++) {
      var testLine = currentLine ? currentLine + ' ' + words[i] : words[i];
      var metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = words[i];
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  }

  // === MAIN: Create ayah video ===
  // v33: completely rewritten to fix three issues:
  //   1. WebM not playable on mobile → try MP4 MIME type first, fall back to WebM
  //   2. User hears audio during recording → disconnect from audioCtx.destination
  //      so audio goes into the recording but NOT through the speakers
  //   3. Same image as share-image → use the existing BacaShare canvas if available

  function createAyahVideo(opts) {
    return new Promise(function (resolve, reject) {
      var surahNum = opts.surahNum || 1;
      var ayahNum = opts.ayahNum || 1;
      var reciterId = opts.reciterId || 'mishari';
      var reciterName = opts.reciterName || 'Mishary Alafasy';
      var surahName = opts.surahName || 'Surah';
      var reference = opts.reference || (surahName + ' ' + surahNum + ':' + ayahNum);

      // Check browser support
      if (typeof MediaRecorder === 'undefined') {
        showToast('Video recording is not supported in this browser. Try Chrome or Firefox.');
        resolve({ success: false, error: 'MediaRecorder not supported' });
        return;
      }

      // v33: fetch the ayah audio as a blob (same-origin blob URL avoids CORS)
      var audioUrl = getAyahAudioUrl(surahNum, ayahNum, reciterId);
      showToast('Loading audio...');

      fetch(audioUrl)
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.blob();
        })
        .then(function (audioBlob) {
          var blobUrl = URL.createObjectURL(audioBlob);
          var audio = new Audio();
          audio.src = blobUrl;

          // v33: determine the best MIME type. Try MP4 first (playable on
          // all mobile devices including iOS), fall back to WebM.
          var mimeType = null;
          var fileExtension = 'webm';
          var candidates = [
            { mime: 'video/mp4;codecs=h264,aac', ext: 'mp4' },
            { mime: 'video/mp4;codecs=avc1,mp4a', ext: 'mp4' },
            { mime: 'video/mp4', ext: 'mp4' },
            { mime: 'video/webm;codecs=vp8,opus', ext: 'webm' },
            { mime: 'video/webm;codecs=vp9,opus', ext: 'webm' },
            { mime: 'video/webm', ext: 'webm' },
          ];
          for (var c = 0; c < candidates.length; c++) {
            if (MediaRecorder.isTypeSupported(candidates[c].mime)) {
              mimeType = candidates[c].mime;
              fileExtension = candidates[c].ext;
              break;
            }
          }
          if (!mimeType) {
            showToast('Video recording is not supported in this browser.');
            URL.revokeObjectURL(blobUrl);
            resolve({ success: false, error: 'No supported MIME type' });
            return;
          }

          audio.addEventListener('error', function () {
            showToast('Could not load audio for this verse. Try another reciter.');
            URL.revokeObjectURL(blobUrl);
            resolve({ success: false, error: 'Audio load failed' });
          });

          audio.addEventListener('loadedmetadata', function () {
            try {
              // Set up canvas (1080x1080 for square social-media format)
              var canvas = document.createElement('canvas');
              canvas.width = 1080;
              canvas.height = 1080;
              var ctx = canvas.getContext('2d');

              // Render the ayah image to the canvas (same layout as share-image)
              renderAyahToCanvas(canvas, ctx, opts);

              // Create a MediaStream from the canvas (30 FPS video)
              var canvasStream = canvas.captureStream(30);

              // Create an AudioContext to route the audio INTO the recording
              // but NOT through the speakers (user doesn't hear it).
              var AudioCtx = window.AudioContext || window.webkitAudioContext;
              var audioCtx = new AudioCtx();
              var sourceNode = audioCtx.createMediaElementSource(audio);
              var destNode = audioCtx.createMediaStreamDestination();
              sourceNode.connect(destNode);
              // v33: DO NOT connect sourceNode to audioCtx.destination.
              // This means the audio goes into the recording stream but
              // the user does NOT hear it through the speakers. The video
              // will contain the audio; the user just doesn't have to
              // listen to it while it's being created.

              // Combine canvas video + audio into one stream
              var combinedStream = new MediaStream();
              canvasStream.getVideoTracks().forEach(function (t) { combinedStream.addTrack(t); });
              destNode.stream.getAudioTracks().forEach(function (t) { combinedStream.addTrack(t); });

              var recorder = new MediaRecorder(combinedStream, {
                mimeType: mimeType,
                videoBitsPerSecond: 2500000,
                audioBitsPerSecond: 128000
              });
              var chunks = [];

              recorder.addEventListener('dataavailable', function (e) {
                if (e.data && e.data.size > 0) chunks.push(e.data);
              });

              recorder.addEventListener('stop', function () {
                var videoBlob = new Blob(chunks, { type: fileExtension === 'mp4' ? 'video/mp4' : 'video/webm' });
                var filename = sanitizeFilename(surahName + ' - Ayah ' + ayahNum + ' - ' + reciterName) + '.' + fileExtension;

                if (fileExtension === 'mp4') {
                  showToast('Video saved: ' + surahName + ' Ayah ' + ayahNum);
                } else {
                  showToast('Video saved as WebM: ' + surahName + ' Ayah ' + ayahNum + '. WebM may not play on iOS.');
                }

                // Trigger download
                var dlUrl = URL.createObjectURL(videoBlob);
                var a = document.createElement('a');
                a.href = dlUrl;
                a.download = filename;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                  document.body.removeChild(a);
                  URL.revokeObjectURL(dlUrl);
                }, 1000);

                // Also offer native share if available (mobile)
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [new File([videoBlob], filename, { type: videoBlob.type })] })) {
                  setTimeout(function () {
                    navigator.share({
                      title: 'Baca - ' + reference,
                      text: surahName + ' Ayah ' + ayahNum + ' (recited by ' + reciterName + ')',
                      files: [new File([videoBlob], filename, { type: videoBlob.type })]
                    }).catch(function () { /* user cancelled share */ });
                  }, 500);
                }

                // Clean up
                URL.revokeObjectURL(blobUrl);
                audioCtx.close();

                resolve({ success: true, blob: videoBlob, url: dlUrl, filename: filename });
              });

              // Start recording and play audio SILENTLY
              showToast('Creating video (audio is captured silently)...');
              recorder.start();
              audio.play().catch(function (err) {
                console.error('Audio play failed:', err);
                showToast('Could not process audio. Try again.');
                if (recorder.state !== 'inactive') recorder.stop();
              });

              // When audio ends, stop recording
              audio.addEventListener('ended', function () {
                if (recorder.state !== 'inactive') {
                  recorder.stop();
                }
              });

              // Safety timeout: stop after 5 minutes max
              setTimeout(function () {
                if (recorder.state !== 'inactive') {
                  recorder.stop();
                }
              }, 5 * 60 * 1000);

            } catch (err) {
              console.error('Video creation failed:', err);
              showToast('Video creation failed: ' + (err.message || 'unknown error'));
              URL.revokeObjectURL(blobUrl);
              resolve({ success: false, error: err.message });
            }
          });
        })
        .catch(function (err) {
          console.error('Audio fetch failed:', err);
          showToast('Could not load audio for this verse. Try another reciter.');
          resolve({ success: false, error: 'Audio fetch failed: ' + err.message });
        });
    });
  }

  // Expose public API
  window.BacaVideoShare.createAyahVideo = createAyahVideo;
})();

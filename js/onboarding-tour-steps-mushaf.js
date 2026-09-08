/* onboarding-tour-steps-mushaf.js - Step definitions for the MUSHAF page tour
 *
 * v27: removed the tafsir-drawer and surah-search steps per user request.
 * v26: rewritten, thorough and precise. Walks a brand-new user through every
 * visible element on mushaf.html, the 604-page Uthmani Mushaf reader.
 *
 * The mushaf page is a single-page reader: there is a topbar with logo and
 * hamburger, a sticky toolbar with navigator + tools, the read area showing
 * one page at a time, side drawers (reciter, settings, bookmarks, tafsir),
 * a floating mini-player for audio, a word-by-word modal, a search modal,
 * and an ayah-action popover (opened by tapping the ayah's number circle,
 * not by long-pressing).
 *
 * The tafsir drawer and the surah search modal are NOT part of the tour -
 * users discover them naturally through other steps (the ayah-action
 * popover step mentions tafsir; the navigator step mentions jumping to a
 * surah by name).
 *
 * Each step is consumed by onboarding-tour.js. Steps with `skipIfMissing: true`
 * are skipped (auto-advance) if the target element is not in the DOM at the
 * moment the tour reaches them.
 */

(function () {
  'use strict';

  window.BacaTour = window.BacaTour || {};

  window.BacaTour.MUSHAF_STEPS = [
    // ─── 1. Welcome ──────────────────────────────────────────────────────
    {
      target: 'body',
      title: 'Welcome to the Mushaf',
      body: 'This is the 604-page Uthmani Mushaf, the same printed page layout as the standard Madinah mushaf. This tour walks you through every control. The page you are looking at now is Page 1. Press Next to begin.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 2. Top bar (logo + back) - WEB ONLY ───────────────────────────
    // skipIfMissing: true so this step auto-advances on the mobile app
    // (where the topbar is hidden in standalone mode via the v28 CSS
    // patch in mushaf.html). The engine's isTargetVisible() check will
    // detect that .mushaf-topbar is display:none and skip this step.
    {
      target: '.mushaf-topbar',
      title: 'Top bar',
      body: 'The Baca logo on the left takes you back to the home page. The hamburger button on the right (added by shared-nav.js) slides in the side menu: home, Adhkar, Salah, Reciters, Blog, Progress, Bookmarks, Topics, Journeys, Ask AI.',
      placement: 'bottom',
      skipIfMissing: true,
    },

    // ─── 3. Sticky toolbar (overview) ───────────────────────────────────
    {
      target: '.mushaf-toolbar',
      title: 'Mushaf toolbar',
      body: 'This sticky toolbar has two groups. On the left, the navigator: previous-arrow, a selector button (currently showing "Page 1"), and next-arrow. On the right, the tools group: Tajweed, Reciter, Settings, Bookmarks, Share. We will walk through each one in turn.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 4. Previous / next arrows ─────────────────────────────────────
    {
      target: '#nav-prev-btn',
      title: 'Page navigation',
      body: 'Use the left and right arrows to flip through the 604 pages one at a time, just like turning the pages of a printed mushaf. Keyboard arrows (← and →) also work. Swiping on touch screens works too.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 5. Page selector (surah / juz / page / ayah) ────────────────────
    {
      target: '#nav-selector-btn',
      title: 'Jump to surah, juz, page, or ayah',
      body: 'Tap the selector button to open a dropdown with four tabs: Surah (all 114), Juz (all 30), Page (all 604), and Ayah (surah number + ayah number). The search box filters surahs by name. Pick any item to jump straight to it.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 6. Tajweed tool ───────────────────────────────────────────────
    {
      target: '#tajweed-tool',
      title: 'Tajweed colors',
      body: 'Toggle this to colour-code the Arabic text by tajweed rule: Ghunnah (nasal), Ikhfa (hidden), Idgham (merge), Iqlab (convert), Qalqalah (echo), and Madd (elongation). A legend explaining each colour is in the Settings drawer. Off by default - turn it on when you want to refine your recitation.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 7. Reciter tool ───────────────────────────────────────────────
    {
      target: '#reciter-tool',
      title: 'Choose a reciter',
      body: 'Tap to open the reciter drawer on the right. There are 34+ reciters, including Hafs, Warsh, and Qalun riwayat. Use the search box to filter by name. Tap any reciter to set them as your default - the indicator label on the toolbar shows the current choice. Reciter audio is streamed from everyayah.com and cached on your device after first play.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 8. Settings tool ─────────────────────────────────────────────
    {
      target: '#settings-tool',
      title: 'Reader settings',
      body: 'Tap to open the settings drawer. Inside: theme swatches (Dark, Warm, Teal, Sapphire, Light), Arabic text size (A−, A, A+), Tajweed on/off toggle with full legend and Quranic Signs Guide, Quranic Signs Guide explaining the ayah marker and other symbols, and the Riwayah section explaining Hafs, Warsh, and Qalun differences. At the bottom is a "Replay Tour" button - that is how you replay this tour.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 9. Bookmarks tool ────────────────────────────────────────────
    {
      target: '#bookmarks-tool',
      title: 'My bookmarks',
      body: 'Tap to open the bookmarks drawer on the right. Every verse you bookmark from the Mushaf or the home page appears here. Each entry has the surah name, ayah number, Arabic text, translation, and the date saved. The book-open icon jumps to that verse; the trash icon removes it. "Clear all" wipes the list. The indicator on the toolbar shows the count.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 10. Share tool ───────────────────────────────────────────────
    {
      target: '#share-tool',
      title: 'Share this page',
      body: 'Tap to share the current page as an image. On a phone with native share, this opens the share sheet. On desktop, it copies a shareable image to the clipboard. The image includes the Arabic page content and the Baca logo.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 11. Read area ────────────────────────────────────────────────
    {
      target: '.mushaf-read-area',
      title: 'Read area',
      body: 'This is the page itself, rendered as the printed Madinah mushaf layout. Tap any word to open the word-by-word analysis modal (transliteration, translation, and root). Tap the ayah number (the ornamental circle at the end of each verse) to open the ayah-action popover (play, bookmark, tafsir, copy, share).',
      placement: 'top',
      skipIfMissing: false,
    },

    // ─── 12. Page number + slider at the bottom ───────────────────────
    {
      target: '.page-bottom-bar',
      title: 'Page indicator and slider',
      body: 'Below the page, a label shows "Page X of 604" and a slider lets you drag to any page in the mushaf. Drag the slider to jump large distances without flipping through every page.',
      placement: 'top',
      skipIfMissing: false,
    },

    // ─── 13. Word-by-word modal (preview) ─────────────────────────────
    {
      target: 'body',
      title: 'Word-by-word analysis',
      body: 'When you tap a single Arabic word, a modal opens showing its transliteration (how to pronounce it), translation (English meaning), and root (the 3- or 4-letter Arabic root, which opens a family of related words). Use the chevron buttons inside the modal to walk through every word of the current ayah.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 14. Ayah-action popover ──────────────────────────────────────
    {
      target: 'body',
      title: 'Ayah actions',
      body: 'Tap the ayah number at the end of any verse (the ornamental circle with the Arabic numeral) to open the action popover. From there you can play that ayah with the current reciter, bookmark it, open its tafsir, copy the Arabic + translation, or share it as an image.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 15. Floating mini player ─────────────────────────────────────
    {
      target: '#floating-player',
      title: 'Floating mini player',
      body: 'When audio is playing, a small player floats at the bottom of the screen with the surah name, ayah number, prev/play/next/repeat/close buttons, and a progress bar. It stays visible while you scroll through the mushaf so you can control playback without going back to the toolbar.',
      placement: 'top',
      skipIfMissing: true, // Hidden until audio plays
    },

    // ─── 16. Theme switching ──────────────────────────────────────────
    {
      target: 'body',
      title: 'Five reader themes',
      body: 'Open Settings to switch between Dark (default), Warm (sepia), Teal (green-tinted dark), Sapphire (blue-tinted dark), and Light. Your theme choice is saved on this device and applies every time you return to the Mushaf.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 17. Riwayah support ──────────────────────────────────────────
    {
      target: 'body',
      title: 'Hafs, Warsh, and Qalun',
      body: 'The Mushaf text you see is in the Hafs riwayah, the most widely used worldwide. To listen in Warsh (common in North and West Africa) or Qalun (Libya, Tunisia, parts of Egypt), pick a reciter labelled "(Warsh)" or "(Qalun)" in the reciter drawer. The Settings -> Riwayah section explains the differences in detail.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 18. Closing ──────────────────────────────────────────────────
    {
      target: 'body',
      title: 'That is the Mushaf',
      body: 'You are ready to read. To replay this tour later, open Settings -> Help -> Replay Tour. May Allah make your reading easy and beneficial.',
      placement: 'center',
      skipIfMissing: false,
    },
  ];
})();

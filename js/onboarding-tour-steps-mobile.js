/* onboarding-tour-steps-mobile.js - Step definitions for the MOBILE APP tour
 *
 * v26 NEW: a separate tour for the installed mobile app (standalone mode).
 *
 * The mobile app has a different UI from the web app:
 *   - Bottom tab bar with 5 tabs: Home, Qur'an, Ask, Progress, More
 *   - No footer (footer is hidden in standalone mode)
 *   - Hamburger menu hidden in standalone mode (it's replaced by the More tab)
 *   - 8 sections hidden from the home page in standalone mode (topics,
 *     journeys, bookmarks-section, featured-reciters, daily-reflection,
 *     reading-progress-section, daily-challenge-section, achievements-section)
 *     - these are accessible via the More sheet
 *   - The Mushaf page has a top bar + tab bar visible
 *   - The chat FAB is hidden on mobile (Ask tab replaces it)
 *
 * So a web-app tour does not match the mobile app. This file defines a
 * separate tour that walks the mobile user through the bottom tab bar,
 * the home page (with its reduced sections), and the More sheet's
 * destinations.
 *
 * Each step is consumed by onboarding-tour.js. The engine auto-detects
 * whether the app is in standalone mode and chooses between HOME_STEPS
 * (web) and MOBILE_STEPS (mobile) when starting the home tour.
 */

(function () {
  'use strict';

  window.BacaTour = window.BacaTour || {};

  window.BacaTour.MOBILE_STEPS = [
    // ─── 1. Welcome ──────────────────────────────────────────────────────
    {
      target: 'body',
      title: 'Assalamu alaykum, welcome to Baca',
      body: 'This is the installed mobile app. It works offline once your first session has loaded. This tour walks you through the home screen and the bottom tab bar. You can replay it any time from the More sheet (More → Replay Tour).',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 2. Top bar (logo + theme only; no hamburger) ───────────────────
    {
      target: '.navbar',
      title: 'Top bar',
      body: 'On the mobile app, the top bar is minimal: the Baca logo (tap to come home) and the moon icon (toggle dark/light theme). The hamburger menu you may see in the web app is hidden here. To reach other pages, use the More tab at the bottom right.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 3. Hero ─────────────────────────────────────────────────────────
    {
      target: '.hero',
      title: 'Hero',
      body: 'Two quick entry points: "Explore Surahs" scrolls to the surah grid below; "Today\'s Ayah" scrolls to the daily verse.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 4. Daily Ayah ──────────────────────────────────────────────────
    {
      target: '#daily-ayah',
      title: 'Daily Ayah',
      body: 'A new verse every day. The Hijri date and ISO week number sit on the right of the header. Below the Arabic and translation, four icons let you bookmark, copy, share as image, or open tafsir.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 5. Audio player (today's ayah) ────────────────────────────────
    {
      target: '#audio-player-section',
      title: "Listen to today's ayah",
      body: 'Choose a reciter, press play, adjust the progress bar, set the volume, and change playback speed between 1× and 2×. Audio is cached after first play, so it works offline the next time.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 6. Surah explorer (search + filter) ──────────────────────────
    {
      target: '#surah-explorer .explorer-search',
      title: 'Search and filter surahs',
      body: 'Type a surah name to filter the grid. The sliders icon opens filters: Makkan / Medinan, by revelation order, by Juz (1-30), by Hizb (1-60). Clear filter resets.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 7. Surah grid (cards) ─────────────────────────────────────────
    {
      target: '#surah-grid',
      title: 'Surah grid',
      body: 'Each surah is a card with number, English name, Arabic name, ayah count, and place of revelation. Tap a card to open the detail modal (Read Surah opens the reader on this page; Listen opens the audio player). For the full 604-page Mushaf view, use the Qur\'an tab at the bottom.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 8. Continue reading (kept on mobile home) ────────────────────
    {
      target: '.continue-reading',
      title: 'Continue your journey',
      body: 'Pick up exactly where you left off. The card shows the last surah and ayah, with a percentage-progress bar. Press Resume Reading to jump back into the reader at that ayah.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 9. Mobile-only note: sections hidden ────────────────────────
    {
      target: 'body',
      title: 'Hidden sections are in the More sheet',
      body: 'The mobile home page hides eight sections that are visible on the web: Topics, Journeys, Bookmarks, Featured Reciters, Reflection of the Day, Reading Progress, Daily Challenge, and Achievements. They live in the More tab so the home page stays short. We will tour the More tab in a moment.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 10. Bottom tab bar (overview) ────────────────────────────────
    {
      target: '.baca-tab-bar',
      title: 'Bottom tab bar',
      body: 'Five tabs: Home (this page), Qur\'an (the full 604-page Mushaf), Ask (Baca AI chat), Progress (streaks, challenges, achievements), and More (the extra sections). Tap any tab to switch pages. The tab bar is always visible at the bottom of the screen.',
      placement: 'top',
      skipIfMissing: false,
    },

    // ─── 11. Home tab ─────────────────────────────────────────────────
    {
      target: '.baca-tab-bar__btn[data-tab="home"]',
      title: 'Home tab',
      body: 'Brings you back to this page from anywhere in the app.',
      placement: 'top',
      skipIfMissing: true,
    },

    // ─── 12. Qur'an tab ───────────────────────────────────────────────
    {
      target: '.baca-tab-bar__btn[data-tab="quran"]',
      title: "Qur'an tab",
      body: 'Opens the 604-page Uthmani Mushaf reader. The Mushaf page has its own tour the first time you open it - page navigator, tajweed, reciter, bookmarks, tafsir, and word-by-word analysis.',
      placement: 'top',
      skipIfMissing: true,
    },

    // ─── 13. Ask tab (replaces chat FAB) ──────────────────────────────
    {
      target: '.baca-tab-bar__btn[data-tab="ask"]',
      title: 'Ask tab (Baca AI)',
      body: 'Opens ask.html, the Baca AI chat page. Ask questions about the Qur\'an, hadith, and Islamic practice in natural language. The same AI as the green chat bubble on the web app, but as a full page on mobile. Please remember: AI answers are not religious rulings - verify with a qualified scholar for fatwa.',
      placement: 'top',
      skipIfMissing: true,
    },

    // ─── 14. Progress tab ─────────────────────────────────────────────
    {
      target: '.baca-tab-bar__btn[data-tab="progress"]',
      title: 'Progress tab',
      body: 'Opens progress.html with your reading stats, today\'s daily challenge, and the achievements grid. All numbers are stored locally on this device - never sent anywhere.',
      placement: 'top',
      skipIfMissing: true,
    },

    // ─── 15. More tab (sheet with all hidden sections) ───────────────
    {
      target: '.baca-tab-bar__btn[data-tab="more"]',
      title: 'More tab',
      body: 'Opens a sheet listing the eight sections hidden from the home page: Topics, Journeys, Bookmarks, Featured Reciters, Reflection, Reading Progress, Daily Challenge, Achievements. Tap any item in the sheet to open its page. The More sheet also has Replay Tour and Reset Progress.',
      placement: 'top',
      skipIfMissing: true,
    },

    // ─── 16. Feedback (mobile) ───────────────────────────────────────
    {
      target: '#mobile-feedback',
      title: 'Send feedback',
      body: 'On the mobile app, the feedback form sits outside the footer (because the footer itself is hidden). Tap it to suggest improvements, report bugs, request removals, or just say Jazak Allah Khayr. Your message goes straight to the developer.',
      placement: 'top',
      skipIfMissing: true,
    },

    // ─── 17. Closing ──────────────────────────────────────────────────
    {
      target: 'body',
      title: 'You are ready',
      body: 'That is the mobile app home screen plus the bottom tab bar. Open the Qur\'an tab to start the Mushaf tour. Jazak Allah Khayr for reading.',
      placement: 'center',
      skipIfMissing: false,
    },
  ];
})();

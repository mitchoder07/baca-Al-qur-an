/* onboarding-tour-steps-mobile.js - Step definitions for the MOBILE APP tour
 *
 * v27: removed the bottom tab bar steps. The tab bar is always visible at
 *      the bottom of the screen so the user discovers it on their own; the
 *      tour does not need to walk through each of the 5 tabs.
 * v26 NEW: a separate tour for the installed mobile app (standalone mode).
 *
 * The mobile app has a different UI from the web app:
 *   - Bottom tab bar with 5 tabs: Home, Qur'an, Ask, Progress, More
 *     (always visible - not toured, just mentioned in the closing step)
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
 * separate tour that walks the mobile user through the home page (with
 * its reduced sections) and explains where the hidden sections went.
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
      body: 'The mobile home page hides eight sections that are visible on the web: Topics, Journeys, Bookmarks, Featured Reciters, Reflection of the Day, Reading Progress, Daily Challenge, and Achievements. They live in the More tab (the rightmost tab in the bottom bar) so the home page stays short. Tap More to open the sheet listing all eight sections, plus Replay Tour and Reset Progress.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 10. Feedback (mobile) ───────────────────────────────────────
    {
      target: '#mobile-feedback',
      title: 'Send feedback',
      body: 'On the mobile app, the feedback form sits outside the footer (because the footer itself is hidden). Tap it to suggest improvements, report bugs, request removals, or just say Jazak Allah Khayr. Your message goes straight to the developer.',
      placement: 'top',
      skipIfMissing: true,
    },

    // ─── 11. Closing ──────────────────────────────────────────────────
    {
      target: 'body',
      title: 'You are ready',
      body: 'That is the mobile home screen. The bottom tab bar is always visible - explore it at your own pace. Open the Qur\'an tab when you want to try the Mushaf reader (it has its own tour). Jazak Allah Khayr for reading.',
      placement: 'center',
      skipIfMissing: false,
    },
  ];
})();

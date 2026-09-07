/* onboarding-tour-steps-home.js - Step definitions for the WEB APP home page tour
 *
 * v26 rewrite: thorough and precise. Walks a brand-new user through every
 * visible element on the home page, in the order they appear top-to-bottom.
 *
 * The tour targets elements by CSS selector. If a target is not present
 * (e.g. the floating chat FAB is hidden on first load), the step is skipped.
 *
 * Each step has:
 *   - target: CSS selector of the element to highlight
 *   - title: short heading
 *   - body: 1-3 sentences of explanation
 *   - placement: 'bottom' | 'top' | 'left' | 'right' (relative to target)
 *   - skipIfMissing: optional boolean (default false). If true and target not
 *                   found in DOM, the tour auto-advances instead of getting stuck.
 *
 * The list is consumed by onboarding-tour.js (engine). The engine handles the
 * overlay, the tooltip card, prev/next/skip buttons, and the localStorage flag
 * that says "user has seen the tour, don't auto-play it again".
 */

(function () {
  'use strict';

  window.BacaTour = window.BacaTour || {};

  window.BacaTour.HOME_STEPS = [
    // ─── 1. Welcome ──────────────────────────────────────────────────────
    {
      target: 'body',
      title: 'Assalamu alaykum, welcome to Baca',
      body: 'This short tour walks you through every part of the home page so nothing gets missed. You can replay it any time from the footer (Resources → Replay Tour). Press Next to begin, or Skip to explore on your own.',
      placement: 'center',
      skipIfMissing: false,
    },

    // ─── 2. Navbar: logo + search + theme ────────────────────────────────
    {
      target: '.navbar',
      title: 'Top bar',
      body: 'Tap the Baca logo to come back to this home page from anywhere. The magnifying glass opens the surah search. The moon toggles between dark and light theme. The hamburger menu (added by shared-nav.js) slides in extra pages: Adhkar, Salah, Mushaf, Reciters, Blog, Progress, Bookmarks, Topics, Journeys.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 3. Hero ─────────────────────────────────────────────────────────
    {
      target: '.hero',
      title: 'Hero',
      body: 'The hero gives you the two quickest entry points: "Explore Surahs" jumps to the surah grid below; "Today\'s Ayah" jumps to the daily verse.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 4. Daily Ayah ──────────────────────────────────────────────────
    {
      target: '#daily-ayah',
      title: 'Daily Ayah',
      body: 'A new verse is shown here every day. The Hijri date and ISO week number sit on the right of the header. Below the Arabic and translation, four icons let you bookmark, copy, share as image, or open tafsir for this ayah.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 5. Audio player (today's ayah recitation) ────────────────────────
    {
      target: '#audio-player-section',
      title: "Listen to today's ayah",
      body: 'Choose a reciter from the dropdown (Mishary Alafasy, Abdul Basit, Al-Husary, and 9 others by default). Use the skip-back, play, and skip-forward buttons. The progress bar and current/duration times are below. The volume slider and a 1× / 1.25× / 1.5× / 1.75× / 2× speed button sit at the bottom.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 6. Surah explorer (search + filter) ─────────────────────────────
    {
      target: '#surah-explorer .explorer-search',
      title: 'Search and filter surahs',
      body: 'Type a surah name (English or transliteration) to filter the grid. The sliders icon opens a filter panel with: Makkan / Medinan, by revelation order, by Juz (1-30), and by Hizb (1-60). Use "Clear filter" to reset.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 7. Surah grid (cards) ───────────────────────────────────────────
    {
      target: '#surah-grid',
      title: 'Surah grid',
      body: 'Every surah is shown as a card with its number, English name, Arabic name, ayah count, and place of revelation. Tap a card to open a detail modal with Read Surah and Listen buttons. Read Surah opens the reader modal on this page; Listen opens the audio player. To go to the full 604-page Uthmani Mushaf view, use the "Mushaf Reader" link in the footer or the hamburger menu.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 8. Topics ───────────────────────────────────────────────────────
    {
      target: '#topics',
      title: 'Explore by topic',
      body: 'Twelve themes drawn from the verses: Mercy, Prayer, Knowledge, Protection, Charity, Hope, Patience, Gratitude, Forgiveness, Family, Repentance, and the Hereafter. Tap a card to open a hand-picked reading list - the home page scrolls back to the surah grid and only verses on that topic are highlighted.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 9. Journeys ────────────────────────────────────────────────────
    {
      target: '#journeys',
      title: 'Guided journeys',
      body: 'Four multi-day reading plans: Finding Peace (7 days), Strengthening Salah (14 days), Overcoming Anxiety (10 days), and Building Character (12 days). Each day shows one verse. Your progress is saved on this device, so you can come back tomorrow and pick up where you left off. Press Start Journey on any card to begin.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 10. Continue reading ───────────────────────────────────────────
    {
      target: '.continue-reading',
      title: 'Continue your journey',
      body: 'If you have read before, this card shows the last surah and ayah you opened, with a percentage-progress bar. Press Resume Reading to open the reader at exactly that ayah. If you have never read, the card shows "No Reading History".',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 11. Bookmarks ──────────────────────────────────────────────────
    {
      target: '#bookmarks',
      title: 'Saved bookmarks',
      body: 'Every verse you bookmark (from the reader or from the daily ayah) appears here. Each bookmark card has the surah name, ayah number, Arabic text, translation, and the date you saved it. The book-open icon opens the verse in the reader; the trash icon removes that one bookmark. "Clear all" wipes the list. The count at the top shows how many you have saved.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 12. Featured reciters ──────────────────────────────────────────
    {
      target: '#featured-reciters',
      title: 'Featured reciters',
      body: 'A preview of four reciter avatars. Tap "Browse 20+ reciters" to open the full reciter gallery on reciters/index.html, where each reciter has a profile page with their full Qur\'an available to play.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 13. Reflection of the day ──────────────────────────────────────
    {
      target: '.daily-reflection',
      title: 'Reflection of the day',
      body: 'A short, rotating quote inspired by a surah. A small nudge to think about one idea each day.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 14. Reading progress ──────────────────────────────────────────
    {
      target: '#reading-progress',
      title: 'Your reading journey',
      body: 'Four stat cards: Day Streak (consecutive days you have read), Time Reading (total), Today\'s Pages (against a 5-page daily goal with progress bar), and Surahs Completed. Below them, four more stats: Verses Read, Pages Read, Juz Explored, and Total Days. All numbers are stored locally on this device - never sent anywhere.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 15. Daily challenge ────────────────────────────────────────────
    {
      target: '#daily-challenge',
      title: 'Daily challenge',
      body: 'A rotating challenge (read 3 pages, 5 pages, complete a surah, read 10 minutes, or read 10 verses). The progress bar fills as you read. On Fridays, every challenge rewards double XP. Complete it to keep your streak alive and earn the badge for that challenge.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 16. Achievements ──────────────────────────────────────────────
    {
      target: '#achievements',
      title: 'Achievements',
      body: 'Twelve badges you unlock as you read: First Steps, Surah Complete, On Fire (3-day streak), Week Warrior (7-day streak), Monthly Master (30-day streak), Half Century (50 pages), Century Club (100 pages), Juz Explorer, Dedicated Reader (10 surahs), Hour Power (1 hour total), Challenge Chaser (5 challenges), and Verse Voyager (100 verses). Locked badges are greyed out.',
      placement: 'bottom',
      skipIfMissing: false,
    },

    // ─── 17. Footer ─────────────────────────────────────────────────────
    {
      target: '.baca-footer',
      title: 'Footer',
      body: 'Five columns: brand, Explore links, Engage links, Resources (Toggle Theme, Replay Tour, Reset Progress, Install App, Meet Developer), and Connect (GitHub, X, email, WhatsApp). Below them is the feedback form and the footer-bottom with the copyright and "Made with love for the Ummah" line.',
      placement: 'top',
      skipIfMissing: false,
    },

    // ─── 18. Feedback form ─────────────────────────────────────────────
    {
      target: '.footer-feedback',
      title: 'Send feedback',
      body: 'Found a bug? Have an idea? Want something removed? Drop a note here. Your message goes straight to the developer. There are four categories: suggest an improvement, report a bug, request a removal, or just say Jazak Allah Khayr.',
      placement: 'top',
      skipIfMissing: false,
    },

    // ─── 19. Floating chat FAB (Baca AI) ────────────────────────────────
    {
      target: '.baca-chat-fab',
      title: 'Baca AI',
      body: 'Tap the green chat bubble (bottom-right) to ask a question about the Qur\'an, hadith, or Islamic practice. Baca AI answers in natural language. Please remember: AI answers are not religious rulings. Always verify with a qualified scholar for fatwa. The chat is also reachable from the Ask page (ask.html).',
      placement: 'top',
      skipIfMissing: true, // FAB may not be present on first paint
    },

    // ─── 20. Scroll-to-top button ──────────────────────────────────────
    {
      target: '.baca-scroll-top',
      title: 'Scroll-to-top and scroll-to-bottom',
      body: 'A small floating button at the bottom-left lets you jump to the top or bottom of the long home page. Useful when you have scrolled deep into the achievements or footer and want to get back to the top quickly.',
      placement: 'right',
      skipIfMissing: true,
    },

    // ─── 21. Page-section shortcuts (left side on desktop) ─────────────
    {
      target: '.baca-shortcuts-nav',
      title: 'Page section shortcuts',
      body: 'On wide screens, a vertical pill bar appears on the left after you scroll past the hero. Each pill jumps to a section: Home, Qur\'an, Daily Ayah, Topics, Journeys, Progress, Challenge, Awards, Bookmarks. The X icon at the bottom of the bar collapses the bar to a small bubble; tap again to expand. On mobile, this becomes a horizontal scrollable bar at the top.',
      placement: 'right',
      skipIfMissing: true,
    },

    // ─── 22. Closing ────────────────────────────────────────────────────
    {
      target: 'body',
      title: 'That is the home page',
      body: 'You are ready to start. The Mushaf Reader (mushaf.html) has its own tour the first time you open it. To replay this one, scroll to the footer → Resources → Replay Tour. Jazak Allah Khayr for reading.',
      placement: 'center',
      skipIfMissing: false,
    },
  ];
})();

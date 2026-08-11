/* ============================================================
   BACA — Onboarding Tour Steps: HOME PAGE (index.html)
   Must load BEFORE js/onboarding-tour.js (the shared engine).
   ============================================================ */

window.BACA_ONBOARDING_STORAGE_KEY = 'bacaOnboardingComplete';

window.BACA_ONBOARDING_STEPS = [
    {
        target: null,
        title: 'Welcome to Baca 👋',
        text: "Let's take a quick look around. Baca is a beautiful way to read, understand, and reflect on the Qur'an. This takes about 30 seconds."
    },
    {
        target: '.search-btn',
        title: 'Quick Search',
        text: 'Tap here anytime to jump straight to a surah by name or number.'
    },
    {
        target: '#surah-explorer .explorer-search',
        title: 'Explore Surahs',
        text: 'Search and filter all 114 surahs by Makkan/Medinan, revelation order, Juz, or Hizb.'
    },
    {
        target: '#daily-ayah .ayah-card',
        title: 'Daily Ayah',
        text: 'A fresh verse every day. Bookmark it, copy it, share it as an image, or open its tafsir.'
    },
    {
        target: '#topics .topics-grid',
        title: 'Browse by Topic',
        text: 'Looking for verses about Mercy, Prayer, or Patience? Filter the Qur\u2019an by theme.'
    },
    {
        target: '#journeys .journey-grid',
        title: 'Guided Journeys',
        text: 'Structured multi-day reading paths, like Finding Peace or Strengthening Salah.'
    },
    {
        target: '#bookmarks .section-header',
        title: 'Your Bookmarks',
        text: 'Every verse you save from the reader shows up here for quick access later.'
    },
    {
        target: '#reciters-preview',
        title: 'Reciters',
        text: 'Listen to 25+ world-renowned reciters, with full-surah audio in the reading modal.'
    },
    {
        target: '#reading-progress .progress-grid',
        title: 'Your Reading Journey',
        text: 'Track your streak, pages read, and progress as you go. These are real stats, not fake ones.'
    },
    {
        target: '.theme-btn',
        title: 'Light / Dark Mode',
        text: 'Prefer a lighter look? Toggle the theme here anytime.'
    },
    {
        target: '.baca-chat-fab',
        title: 'Ask Baca AI',
        text: "Stuck on something? Ask in plain language and Baca AI can point you to the right surah or ayah."
    },
    {
        target: '.baca-nav-toggle',
        title: 'More Pages',
        text: 'Open the menu for the Salah guide, Adhkar, the word game, and everything else Baca offers.'
    }
];

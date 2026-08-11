/* ============================================================
   BACA — Onboarding Tour Steps: MUSHAF READER (mushaf.html)
   Separate storage key from the home page tour, so a first-time
   visit here shows this tour independently of whether someone's
   already seen (or skipped) the home page one.
   Must load BEFORE js/onboarding-tour.js (the shared engine).
   ============================================================ */

window.BACA_ONBOARDING_STORAGE_KEY = 'bacaOnboardingMushafComplete';

window.BACA_ONBOARDING_STEPS = [
    {
        target: null,
        title: 'The Mushaf Reader 📖',
        text: 'This is where you read the Qur\u2019an page by page, just like a printed Mushaf. Here\u2019s what each button does.'
    },
    {
        target: '#nav-navigator',
        title: 'Jump Anywhere',
        text: 'Tap here to go straight to any surah, page, juz, or ayah.'
    },
    {
        target: '#tajweed-tool',
        title: 'Tajweed Colors',
        text: 'Turn this on to see pronunciation rules highlighted in color as you read.'
    },
    {
        target: '#reciter-tool',
        title: 'Reciter',
        text: 'Pick your favorite reciter here, then tap any ayah to hear it recited.'
    },
    {
        target: '#settings-tool',
        title: 'Reader Settings',
        text: 'Adjust font size, switch reading mode, or change the reader theme.'
    },
    {
        target: '#bookmarks-tool',
        title: 'Your Bookmarks',
        text: 'Every verse you bookmark shows up here for quick access later.'
    },
    {
        target: '#share-tool',
        title: 'Share a Page',
        text: 'Share the current page as a beautiful image with friends and family.'
    },
    {
        target: '.baca-nav-toggle',
        title: 'More Pages',
        text: 'Open the menu for the Salah guide, Adhkar, the word game, and everything else Baca offers.'
    }
];

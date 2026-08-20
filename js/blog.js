/* blog.js — Blog rendering for Baca
 *
 * Renders blog posts from a static data array (no backend needed — works on Vercel).
 * Categories: hadith, sabab-nuzul, fasting, features, reflection, dua
 *
 * The blog is WEB-ONLY — hidden in the installed mobile app (standalone mode).
 */

(function () {
    'use strict';

    // === BLOG POSTS DATA ===
    // Add new posts here. They'll render automatically on the blog page.
    // Categories: hadith, sabab-nuzul, fasting, features, reflection, dua
    var POSTS = [
        {
            category: 'hadith',
            categoryLabel: 'Hadith of the Day',
            title: 'The Best of You',
            excerpt: 'The Prophet ﷺ said: "The best of you are those who learn the Qur\'an and teach it." — Sahih al-Bukhari. A reminder that every verse you read and share is a seed of Sadaqah Jariyah.',
            date: '2026-08-19',
            icon: 'fa-book-open',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'Why Al-Fatihah Was Revealed First',
            excerpt: 'Al-Fatihah, "The Opening," was the first complete surah revealed to the Prophet ﷺ. It serves as the gateway to the Qur\'an and the backbone of every prayer — a reminder that every conversation with Allah begins with praise.',
            date: '2026-08-18',
            icon: 'fa-scroll',
        },
        {
            category: 'fasting',
            categoryLabel: 'Fasting Reminder',
            title: 'Fasting on Monday',
            excerpt: 'The Prophet ﷺ was asked about fasting on Monday. He said: "That is the day I was born, and the day I was sent (as a Messenger), and the day I received revelation." — Sahih Muslim. A beautiful reason to fast tomorrow.',
            date: '2026-08-17',
            icon: 'fa-sun',
        },
        {
            category: 'features',
            categoryLabel: 'App Feature',
            title: 'Word-by-Word Analysis',
            excerpt: 'Did you know? Tap any Arabic word in the Mushaf Reader to see its transliteration, translation, and root meaning. Perfect for deepening your understanding, one word at a time.',
            date: '2026-08-16',
            icon: 'fa-magnifying-glass',
        },
        {
            category: 'reflection',
            categoryLabel: 'Reflection',
            title: 'The Power of "Bismillah"',
            excerpt: 'Every surah in the Qur\'an (except Surah At-Tawbah) begins with "Bismillah ir-Rahman ir-Raheem." Before you start anything today — a meal, a task, a journey — say it. It transforms the ordinary into an act of worship.',
            date: '2026-08-15',
            icon: 'fa-heart',
        },
        {
            category: 'dua',
            categoryLabel: 'Daily Dua',
            title: 'Dua for Knowledge',
            excerpt: '"Rabbi zidni ilma." (My Lord, increase me in knowledge.) — Surah Ta-Ha 20:114. A short, powerful dua you can recite before reading the Qur\'an or studying anything beneficial.',
            date: '2026-08-14',
            icon: 'fa-hands-praying',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'Whoever Reads a Letter',
            excerpt: 'The Prophet ﷺ said: "Whoever reads a letter from the Book of Allah will receive a hasanah (good deed) for it, and each hasanah is multiplied by ten." — Sunan at-Tirmidhi. Imagine the reward of reading just one page.',
            date: '2026-08-13',
            icon: 'fa-star',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'The Night of Power',
            excerpt: 'Surah Al-Qadr was revealed to tell us about Laylatul Qadr — the night better than a thousand months. The Qur\'an itself was sent down on this night. Search for it in the last ten nights of Ramadan.',
            date: '2026-08-12',
            icon: 'fa-moon',
        },
        {
            category: 'features',
            categoryLabel: 'App Feature',
            title: 'Install Baca for Offline Reading',
            excerpt: 'You can install Baca as a mobile app — it works offline! Just tap "Install App" in the footer, or use your browser\'s "Add to Home Screen" option. Read the Qur\'an anywhere, even without internet.',
            date: '2026-08-11',
            icon: 'fa-download',
        },
    ];

    // === RENDER ===
    function renderBlog() {
        var grid = document.getElementById('blog-grid');
        var empty = document.getElementById('blog-empty');
        if (!grid) return;

        if (!POSTS || POSTS.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.hidden = false;
            return;
        }

        // Sort by date descending (newest first)
        var sorted = POSTS.slice().sort(function (a, b) {
            return new Date(b.date) - new Date(a.date);
        });

        grid.innerHTML = sorted.map(function (post) {
            var dateStr = formatDate(post.date);
            return '' +
                '<article class="blog-card">' +
                    '<div class="blog-card-body">' +
                        '<span class="blog-card-category ' + post.category + '">' +
                            '<i class="fa-solid ' + post.icon + '"></i> ' + post.categoryLabel +
                        '</span>' +
                        '<h3 class="blog-card-title">' + escapeHtml(post.title) + '</h3>' +
                        '<p class="blog-card-excerpt">' + escapeHtml(post.excerpt) + '</p>' +
                        '<div class="blog-card-meta">' +
                            '<i class="fa-regular fa-calendar"></i> ' + dateStr +
                        '</div>' +
                    '</div>' +
                '</article>';
        }).join('');

        if (empty) empty.hidden = true;
    }

    function formatDate(dateStr) {
        try {
            var d = new Date(dateStr);
            return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        } catch {
            return dateStr;
        }
    }

    function escapeHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // === HIDE BLOG IN STANDALONE (INSTALLED APP) MODE ===
    // The blog is web-only for now — installed app users don't see it.
    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
    }

    if (isStandalone()) {
        // Redirect to home page if someone opens blog.html in the installed app
        window.location.href = '/index.html';
        return;
    }

    // Init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderBlog);
    } else {
        renderBlog();
    }
})();

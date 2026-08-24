/* blog.js — Blog rendering for Baca
 *
 * Renders blog posts from a static data array (no backend needed).
 * Categories: hadith, sabab-nuzul, fasting, features, reflection, dua
 *
 * The blog is WEB ONLY. Hidden in the installed mobile app (standalone mode).
 */

(function () {
    'use strict';

    var POSTS = [
        // === HADITH (12) ===
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'The Best of People',
            excerpt: 'The Prophet (PBUH) said: "The best of you are those who learn the Quran and teach it." A simple reminder that every verse you read and share with others is a seed of ongoing charity that keeps growing even after you are gone.',
            date: '2026-08-20',
            icon: 'fa-book-open',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'A Lamp in the House',
            excerpt: 'The Prophet (PBUH) said: "The one who is proficient in the recitation of the Quran will be with the honourable scribes, and the one who recites it with difficulty will have a double reward." Never feel discouraged if reading is hard. Your effort itself is rewarded.',
            date: '2026-08-19',
            icon: 'fa-lightbulb',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'The Quran Intercedes',
            excerpt: 'The Prophet (PBUH) said: "Read the Quran, for it will come as an intercessor for its companions on the Day of Resurrection." Imagine the Book you spent time with in this life speaking on your behalf in the next.',
            date: '2026-08-18',
            icon: 'fa-hands-praying',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'Whoever Reads a Letter',
            excerpt: 'The Prophet (PBUH) said: "Whoever reads a letter from the Book of Allah will receive a good deed, and each good deed is multiplied by ten." Think about that the next time you read just one page. The numbers add up fast.',
            date: '2026-08-17',
            icon: 'fa-star',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'The Heart Rusts',
            excerpt: 'The Prophet (PBUH) said: "These hearts rust just as iron rusts, and water polishes them." He was asked what the water was, and he replied: "The Quran and the remembrance of death." Let the Quran be the polish your heart needs today.',
            date: '2026-08-16',
            icon: 'fa-heart',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'No People Gather',
            excerpt: 'The Prophet (PBUH) said: "No people gather in a house of the houses of Allah, reciting the Book of Allah and studying it together, except tranquility descends upon them, mercy covers them, and the angels surround them." Gather to read, even if it is online.',
            date: '2026-08-15',
            icon: 'fa-users',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'The Quran is a Proof',
            excerpt: 'The Prophet (PBUH) said: "The Quran is a proof for you or against you." The way you live with the Quran determines whether it speaks for you or against you. Let it be your greatest advocate.',
            date: '2026-08-14',
            icon: 'fa-scale-balanced',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'Fasting and the Quran',
            excerpt: 'The Prophet (PBUH) said: "Fasting and the Quran intercede for the servant on the Day of Resurrection. Fasting says: O Lord, I prevented him from food and desires, so accept my intercession. And the Quran says: I prevented him from sleep, so accept my intercession."',
            date: '2026-08-13',
            icon: 'fa-sun',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'The Example of a Believer',
            excerpt: 'The Prophet (PBUH) said: "The example of the believer who reads the Quran is like that of a citron, its taste is sweet and its scent is pleasant." Your recitation should leave a sweet impression on everyone around you.',
            date: '2026-08-12',
            icon: 'fa-lemon',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'Recite Even If You Stumble',
            excerpt: 'The Prophet (PBUH) said to a man who was struggling to recite: "Keep reciting, for the one who recites the Quran with difficulty, stammering through it, will have a double reward." Your struggle is seen and rewarded.',
            date: '2026-08-11',
            icon: 'fa-person-walking',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'Envy in Two Things',
            excerpt: 'The Prophet (PBUH) said: "Envy is not justified except in two cases: a man whom Allah has given the Quran and he recites it during the night and day, and a man whom Allah has given wealth and he spends it in charity." Let people envy your connection with the Quran.',
            date: '2026-08-10',
            icon: 'fa-eye',
        },
        {
            category: 'hadith',
            categoryLabel: 'Hadith',
            title: 'The Parent and the Quran',
            excerpt: 'The Prophet (PBUH) said: "Whoever reads the Quran, learns it, and acts upon it will be given a crown of light to wear on the Day of Resurrection, and its light will be brighter than the sun. And his parents will be given garments that surpass the whole world." Your reading elevates your parents too.',
            date: '2026-08-09',
            icon: 'fa-crown',
        },

        // === SABAB NUZUL (8) ===
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'Why Al-Fatihah Was Revealed First',
            excerpt: 'Al-Fatihah, meaning "The Opening," was the first complete surah revealed to the Prophet (PBUH). It serves as the gateway to the Quran and the backbone of every prayer. Every conversation with Allah begins with praise, and this surah teaches us exactly how to start.',
            date: '2026-08-19',
            icon: 'fa-scroll',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'The Night of Power',
            excerpt: 'Surah Al-Qadr was revealed to tell us about Laylatul Qadr, the night better than a thousand months. The Quran itself was sent down on this night. It falls in the last ten nights of Ramadan, most likely on an odd numbered night. Search for it with sincere prayer.',
            date: '2026-08-18',
            icon: 'fa-moon',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'Ayat al-Kursi and Its Power',
            excerpt: 'Ayat al-Kursi (2:255) was revealed to confirm the greatness of Allah in a way no other verse does. The Prophet (PBUH) called it the greatest verse in the Quran. Reading it after every prayer grants you protection until the next prayer.',
            date: '2026-08-17',
            icon: 'fa-shield-halved',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'Surah Al-Ikhlas Equals a Third',
            excerpt: 'The Prophet (PBUH) told his companions that Surah Al-Ikhlas equals one third of the Quran. It was revealed when the people of Makkah asked the Prophet to describe the lineage of Allah. The answer: He is One, without beginning or end, and nothing compares to Him.',
            date: '2026-08-16',
            icon: 'fa-hand-fist',
        },
        {
            category: 'sabak-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'The Cave of Protection',
            excerpt: 'Surah Al-Kahf was revealed in response to a test the people of Makkah set for the Prophet, asking about the story of the young men who slept in a cave for centuries. Reading it every Friday brings light between you and the Kaaba.',
            date: '2026-08-15',
            icon: 'fa-mountain',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'Surah An-Nas and the Whispers',
            excerpt: 'The last three surahs were revealed when the Prophet (PBUH) was affected by a spell cast on him. Allah sent these surahs as a cure and a protection. Reading them morning and evening shields you from harm, envy, and negative thoughts.',
            date: '2026-08-14',
            icon: 'fa-shield-heart',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'The Change of Qibla',
            excerpt: 'Verses in Surah Al-Baqarah (2:144-150) were revealed when the Muslims were commanded to change the direction of prayer from Jerusalem to Makkah. It was a test of obedience. The Quran reminds us that Allah is everywhere, but unity of direction matters.',
            date: '2026-08-13',
            icon: 'fa-compass',
        },
        {
            category: 'sabab-nuzul',
            categoryLabel: 'Sabab Nuzul',
            title: 'The Story of Yusuf',
            excerpt: 'Surah Yusuf was revealed as a single complete surah, a beautiful narrative of patience, betrayal, forgiveness, and reunion. The Prophet (PBUH) called it "the best of stories." It was revealed during the Year of Sorrow, comforting the Prophet through his own trials.',
            date: '2026-08-12',
            icon: 'fa-book',
        },

        // === FASTING (3) ===
        {
            category: 'fasting',
            categoryLabel: 'Fasting',
            title: 'Fasting on Monday',
            excerpt: 'The Prophet (PBUH) was asked about fasting on Monday. He said: "That is the day I was born, the day I was sent as a Messenger, and the day I received revelation." A beautiful reason to fast this Monday.',
            date: '2026-08-17',
            icon: 'fa-sun',
        },
        {
            category: 'fasting',
            categoryLabel: 'Fasting',
            title: 'Fasting on Thursday',
            excerpt: 'The Prophet (PBUH) used to fast on Mondays and Thursdays. He said: "Deeds are presented to Allah on Mondays and Thursdays, and I want my deeds to be presented while I am fasting." Try it this Thursday.',
            date: '2026-08-15',
            icon: 'fa-calendar-day',
        },
        {
            category: 'fasting',
            categoryLabel: 'Fasting',
            title: 'The White Days',
            excerpt: 'Fasting on the 13th, 14th, and 15th of every Islamic month (the white days when the moon is full) was a regular practice of the Prophet (PBUH). It is like fasting the whole year in reward. Three days, huge return.',
            date: '2026-08-13',
            icon: 'fa-circle',
        },

        // === FEATURES (3) ===
        {
            category: 'features',
            categoryLabel: 'Feature',
            title: 'Word by Word Analysis',
            excerpt: 'Tap any Arabic word in the Mushaf Reader to see its transliteration, translation, and root meaning. Perfect for deepening your understanding one word at a time. Try it on any verse.',
            date: '2026-08-16',
            icon: 'fa-magnifying-glass',
        },
        {
            category: 'features',
            categoryLabel: 'Feature',
            title: 'Install Baca for Offline Reading',
            excerpt: 'You can install Baca as a mobile app that works offline. Tap "Install App" in the footer or use your browser menu to add it to your home screen. Read the Quran anywhere, even without internet.',
            date: '2026-08-11',
            icon: 'fa-download',
        },
        {
            category: 'features',
            categoryLabel: 'Feature',
            title: 'Daily Adhkar with Audio',
            excerpt: 'Never miss your morning and evening adhkar again. Baca includes the full collection with Arabic audio, transliteration, and translation. Set a daily reminder and build the habit.',
            date: '2026-08-08',
            icon: 'fa-bell',
        },

        // === REFLECTION (3) ===
        {
            category: 'reflection',
            categoryLabel: 'Reflection',
            title: 'The Power of Bismillah',
            excerpt: 'Every surah in the Quran except Surah At-Tawbah begins with Bismillah ir-Rahman ir-Raheem. Before you start anything today, a meal, a task, a journey, say it. It transforms the ordinary into an act of worship.',
            date: '2026-08-15',
            icon: 'fa-heart',
        },
        {
            category: 'reflection',
            categoryLabel: 'Reflection',
            title: 'The Quran is Not Just for Reading',
            excerpt: 'The first word revealed was Iqra, which means read, but it also means recite, proclaim, and convey. The Quran is meant to be lived, not just read. Let one verse today change one action in your life.',
            date: '2026-08-12',
            icon: 'fa-lightbulb',
        },
        {
            category: 'reflection',
            categoryLabel: 'Reflection',
            title: 'A Letter to Your Future Self',
            excerpt: 'Every page you read, every ayah you memorize, every duaa you make from the Quran is a letter to your future self in the hereafter. What kind of letter are you writing today?',
            date: '2026-08-09',
            icon: 'fa-envelope',
        },

        // === DUA (3) ===
        {
            category: 'dua',
            categoryLabel: 'Dua',
            title: 'Dua for Knowledge',
            excerpt: 'Rabbi zidni ilma. My Lord, increase me in knowledge. This is from Surah Ta-Ha (20:114). A short, powerful dua you can recite before reading the Quran or studying anything beneficial.',
            date: '2026-08-14',
            icon: 'fa-hands-praying',
        },
        {
            category: 'dua',
            categoryLabel: 'Dua',
            title: 'Dua for Protection',
            excerpt: 'Bismillahil-ladhi la yadurru ma asmihi shay un fil ardi wa la fis sama i wa huwas sami ul alim. In the name of Allah, with whose name nothing on earth or in the sky can cause harm. Read this three times morning and evening for complete protection.',
            date: '2026-08-11',
            icon: 'fa-shield',
        },
        {
            category: 'dua',
            categoryLabel: 'Dua',
            title: 'Dua for Forgiveness',
            excerpt: 'Rabbi ghfir li wa tub alayya innaka antat tawwabur rahim. My Lord, forgive me and accept my repentance, for You are the Accepter of repentance, the Most Merciful. A beautiful dua the Prophet (PBUH) recited over a hundred times a day.',
            date: '2026-08-08',
            icon: 'fa-hand-holding-heart',
        },
    ];

    function renderBlog() {
        var grid = document.getElementById('blog-grid');
        var empty = document.getElementById('blog-empty');
        if (!grid) return;

        if (!POSTS || POSTS.length === 0) {
            grid.innerHTML = '';
            if (empty) empty.hidden = false;
            return;
        }

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

    function isStandalone() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true;
    }

    if (isStandalone()) {
        window.location.href = '/index.html';
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', renderBlog);
    } else {
        renderBlog();
    }
})();

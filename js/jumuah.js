(function () {
    'use strict';

    // Only meaningful on Fridays — the day of Jumu'ah.
    //
    // Testing note: add ?jumuah=1 to any page's URL to preview this on any
    // day of the week (e.g. index.html?jumuah=1), or ?jumuah=0 to force it
    // off even on a real Friday. Nothing is written anywhere by the
    // override — it only affects the current tab.
    var urlOverride = new URLSearchParams(location.search).get('jumuah');
    var isFriday = urlOverride === '1' ? true : urlOverride === '0' ? false : (new Date().getDay() === 5);
    if (!isFriday) return;

    // Dismissed once per calendar day (re-appears next Friday, and again
    // later the same Friday only after a refresh — that's intentional,
    // it's a gentle reminder, not a nag). The override always shows it,
    // ignoring any earlier dismissal, so it's easy to keep testing.
    function todayStr() {
        return new Date().toISOString().split('T')[0];
    }
    var DISMISS_KEY = 'jumuahDismissed';
    if (!urlOverride && localStorage.getItem(DISMISS_KEY) === todayStr()) return;

    // ── Detect site root the same way shared-nav.js does, so this works
    // from both root pages (index.html) and subfolders (reciters/*.html) ──
    var thisScript = (document.currentScript ||
        Array.prototype.slice.call(document.querySelectorAll('script[src*="jumuah.js"]')).pop());
    var rootPrefix = '';
    if (thisScript && thisScript.getAttribute) {
        var src = thisScript.getAttribute('src') || '';
        var match = src.match(/^((?:\.\.\/)*)js\/jumuah\.js/);
        if (match) rootPrefix = match[1] || '';
    }
    function R(path) { return rootPrefix + path; }

    var DUAS = [
        {
            title: 'Read Surah Al-Kahf',
            arabic: 'سُورَةُ الْكَهْف',
            body: 'It is reported that whoever reads Surah Al-Kahf on the day of Jumu\u2019ah will have light shining for them until the next Jumu\u2019ah (Al-Hakim, authenticated by Al-Albani).',
            action: { label: 'Read it now', href: R('mushaf.html#surah=18') }
        },
        {
            title: 'Increase Your Salawat',
            arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
            translit: 'Allāhumma ṣalli ʿalā Muḥammad wa ʿalā āli Muḥammad',
            body: 'The Prophet ﷺ encouraged sending abundant blessings upon him on Fridays, as this is the day his ummah\u2019s salawat are presented to him (Sunan Abi Dawud, An-Nasa\u2019i).'
        },
        {
            title: 'Seek the Hour of Acceptance',
            arabic: null,
            body: 'There is an hour on Friday in which a supplication is answered — commonly held to fall in the final hour before Maghrib. Make du\u2019a for what is on your heart (Sahih Bukhari, Sahih Muslim).'
        }
    ];

    var css = document.createElement('style');
    css.textContent =
        '.jumuah-bar{position:fixed;left:50%;transform:translateX(-50%) translateY(-14px);width:min(640px,92vw);z-index:9500;' +
        'background:linear-gradient(120deg,#0f172a 0%,#132036 100%);border:1px solid rgba(16,185,129,.35);' +
        'border-radius:18px;box-shadow:0 18px 44px rgba(0,0,0,.45);padding:.9rem 1.1rem;' +
        'display:flex;align-items:center;gap:.8rem;opacity:0;pointer-events:none;' +
        'transition:opacity .3s ease,transform .3s ease,top .3s ease;font-family:"Poppins",sans-serif;}' +
        '.jumuah-bar.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:auto;}' +
        '.jumuah-bar-icon{flex-shrink:0;width:38px;height:38px;border-radius:11px;display:flex;align-items:center;' +
        'justify-content:center;font-size:1.15rem;background:linear-gradient(135deg,#10b981,#06b6d4,#6366f1);}' +
        '.jumuah-bar-body{flex:1;min-width:0;}' +
        '.jumuah-bar-title{color:#fff;font-weight:700;font-size:.86rem;margin-bottom:.1rem;}' +
        '.jumuah-bar-sub{color:#94a3b8;font-size:.76rem;line-height:1.4;}' +
        '.jumuah-bar-actions{display:flex;gap:.4rem;flex-shrink:0;}' +
        '.jumuah-bar-btn{white-space:nowrap;font-size:.75rem;font-weight:600;padding:.4rem .7rem;border-radius:9px;' +
        'border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#e2e8f0;cursor:pointer;' +
        'text-decoration:none;transition:.15s;}' +
        '.jumuah-bar-btn:hover{border-color:#10b981;color:#10b981;}' +
        '.jumuah-bar-btn.primary{background:linear-gradient(135deg,#10b981,#06b6d4);border-color:transparent;color:#fff;}' +
        '.jumuah-bar-close{flex-shrink:0;width:26px;height:26px;border:none;border-radius:8px;background:rgba(255,255,255,.06);' +
        'color:#94a3b8;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:.9rem;}' +
        '.jumuah-bar-close:hover{background:rgba(255,255,255,.12);color:#fff;}' +
        '@media (max-width:560px){.jumuah-bar{flex-wrap:wrap;padding:.85rem;}.jumuah-bar-actions{width:100%;order:3;' +
        'justify-content:flex-start;margin-top:.2rem;margin-left:48px;}}' +
        '.jumuah-modal-overlay{position:fixed;inset:0;background:rgba(2,6,23,.72);backdrop-filter:blur(3px);' +
        'z-index:9600;display:flex;align-items:center;justify-content:center;padding:1.2rem;opacity:0;' +
        'pointer-events:none;transition:opacity .2s ease;}' +
        '.jumuah-modal-overlay.show{opacity:1;pointer-events:auto;}' +
        '.jumuah-modal{width:min(460px,100%);max-height:80vh;overflow-y:auto;background:#0f172a;' +
        'border:1px solid rgba(255,255,255,.08);border-radius:20px;padding:1.4rem;' +
        'font-family:"Poppins",sans-serif;transform:scale(.96);transition:transform .2s ease;}' +
        '.jumuah-modal-overlay.show .jumuah-modal{transform:scale(1);}' +
        '.jumuah-modal-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem;}' +
        '.jumuah-modal-head h3{color:#fff;font-size:1.05rem;font-weight:700;}' +
        '.jumuah-modal-close{width:30px;height:30px;border:none;border-radius:9px;background:rgba(255,255,255,.06);' +
        'color:#94a3b8;cursor:pointer;}' +
        '.jumuah-dua{padding:.9rem 0;border-top:1px solid rgba(255,255,255,.06);}' +
        '.jumuah-dua:first-child{border-top:none;padding-top:0;}' +
        '.jumuah-dua h4{color:#10b981;font-size:.85rem;font-weight:700;margin-bottom:.4rem;}' +
        '.jumuah-dua .ar{font-family:"Amiri","Noto Naskh Arabic",serif;font-size:1.25rem;color:#fff;direction:rtl;' +
        'text-align:right;line-height:1.9;margin-bottom:.35rem;}' +
        '.jumuah-dua .tl{font-style:italic;color:#94a3b8;font-size:.78rem;margin-bottom:.35rem;}' +
        '.jumuah-dua p{color:#cbd5e1;font-size:.82rem;line-height:1.6;}' +
        '.jumuah-dua a{display:inline-block;margin-top:.5rem;font-size:.78rem;font-weight:600;color:#10b981;' +
        'text-decoration:none;}' +
        '.jumuah-dua a:hover{text-decoration:underline;}' +
        'body.light-mode .jumuah-bar{background:linear-gradient(120deg,#ffffff 0%,#f0fdf9 100%);' +
        'border-color:rgba(16,185,129,.3);}' +
        'body.light-mode .jumuah-bar-title{color:#0f172a;}' +
        'body.light-mode .jumuah-bar-sub{color:#64748b;}' +
        'body.light-mode .jumuah-bar-btn{background:rgba(0,0,0,.04);border-color:rgba(0,0,0,.1);color:#334155;}' +
        'body.light-mode .jumuah-bar-close{background:rgba(0,0,0,.05);color:#64748b;}' +
        'body.light-mode .jumuah-modal{background:#ffffff;border-color:rgba(0,0,0,.08);}' +
        'body.light-mode .jumuah-modal-head h3{color:#0f172a;}' +
        'body.light-mode .jumuah-dua{border-top-color:rgba(0,0,0,.07);}' +
        'body.light-mode .jumuah-dua .ar{color:#0f172a;}' +
        'body.light-mode .jumuah-dua p{color:#475569;}' +
        '#challenge-card.jumuah-bonus{border-color:rgba(251,191,36,.5) !important;' +
        'box-shadow:0 0 0 1px rgba(251,191,36,.2),0 18px 40px rgba(251,191,36,.12) !important;}';
    document.head.appendChild(css);

    var bar = document.createElement('div');
    bar.className = 'jumuah-bar';
    bar.innerHTML =
        '<div class="jumuah-bar-icon">🕌</div>' +
        '<div class="jumuah-bar-body">' +
        '<div class="jumuah-bar-title">Jumu\u2019ah Mubarak</div>' +
        '<div class="jumuah-bar-sub">Read Surah Al-Kahf today, and enjoy 2\u00d7 XP on your Reading Journey.</div>' +
        '</div>' +
        '<div class="jumuah-bar-actions">' +
        '<a class="jumuah-bar-btn primary" href="' + R('mushaf.html#surah=18') + '">Read Al-Kahf</a>' +
        '<button type="button" class="jumuah-bar-btn" id="jumuah-duas-btn">Friday Duas</button>' +
        '</div>' +
        '<button type="button" class="jumuah-bar-close" aria-label="Dismiss">\u2715</button>';
    document.body.appendChild(bar);

    var modalOverlay = document.createElement('div');
    modalOverlay.className = 'jumuah-modal-overlay';
    modalOverlay.innerHTML =
        '<div class="jumuah-modal" role="dialog" aria-modal="true" aria-label="Friday duas">' +
        '<div class="jumuah-modal-head"><h3>Friday Duas &amp; Sunnah</h3>' +
        '<button type="button" class="jumuah-modal-close" aria-label="Close">\u2715</button></div>' +
        '<div id="jumuah-dua-list"></div>' +
        '</div>';
    document.body.appendChild(modalOverlay);

    var listEl = modalOverlay.querySelector('#jumuah-dua-list');
    listEl.innerHTML = DUAS.map(function (d) {
        var arabic = d.arabic ? '<p class="ar">' + d.arabic + '</p>' : '';
        var translit = d.translit ? '<p class="tl">' + d.translit + '</p>' : '';
        var action = d.action ? '<a href="' + d.action.href + '">' + d.action.label + ' \u2192</a>' : '';
        return '<div class="jumuah-dua"><h4>' + d.title + '</h4>' + arabic + translit +
            '<p>' + d.body + '</p>' + action + '</div>';
    }).join('');

    function positionBar() {
        var maxBottom = 56;
        var all = document.querySelectorAll('body > *');
        for (var i = 0; i < all.length; i++) {
            var el = all[i];
            if (el === bar || el === modalOverlay) continue;
            var cs = window.getComputedStyle(el);
            if (cs.position !== 'fixed') continue;
            var rect = el.getBoundingClientRect();
            // Only count elements that read as part of a top header stack:
            // anchored somewhere in the upper region of the viewport (not a
            // bottom-anchored player bar or a back-to-top button), short
            // enough to be a bar rather than a full-height drawer/overlay,
            // and wide enough to be a real bar rather than a small FAB.
            var looksLikeHeaderBar = rect.top < 200 && rect.height > 0 &&
                rect.height < 300 && rect.width > 200;
            if (looksLikeHeaderBar && rect.bottom > maxBottom) {
                maxBottom = rect.bottom;
            }
        }
        bar.style.top = (maxBottom + 12) + 'px';
    }

    function showBar() {
        positionBar();
        requestAnimationFrame(function () { bar.classList.add('show'); });
        // Some pages show their own brief welcome toast a moment after load
        // (e.g. salah.html's "Bismillah..." toast, which starts empty and
        // widens once its text is set). Re-measuring shortly after catches
        // that instead of the bar sitting underneath it. The CSS transition
        // on `top` makes this a smooth nudge rather than a jump.
        setTimeout(positionBar, 1200);
    }

    function dismissBar() {
        bar.classList.remove('show');
        localStorage.setItem(DISMISS_KEY, todayStr());
    }

    bar.querySelector('.jumuah-bar-close').addEventListener('click', dismissBar);

    bar.querySelector('#jumuah-duas-btn').addEventListener('click', function () {
        modalOverlay.classList.add('show');
    });
    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) modalOverlay.classList.remove('show');
    });
    modalOverlay.querySelector('.jumuah-modal-close').addEventListener('click', function () {
        modalOverlay.classList.remove('show');
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') modalOverlay.classList.remove('show');
    });

    window.addEventListener('resize', positionBar);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', showBar);
    } else {
        showBar();
    }
})();

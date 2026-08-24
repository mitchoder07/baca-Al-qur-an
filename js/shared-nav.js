/* shared-nav.js */
(function () {
    'use strict';

    // Detect site root from this script's src
    // e.g. src="js/shared-nav.js"     → root = ''
    //      src="../js/shared-nav.js"  → root = '../'
    var thisScript = (document.currentScript ||
        Array.prototype.slice.call(document.querySelectorAll('script[src*="shared-nav.js"]')).pop());
    var rootPrefix = '';
    if (thisScript && thisScript.getAttribute) {
        var src = thisScript.getAttribute('src') || '';
        var match = src.match(/^((?:\.\.\/)*)js\/shared-nav\.js/);
        if (match) {
            rootPrefix = match[1] || '';
        }
    }

    function R(path) { return rootPrefix + path; }

    // Navigation links
    var NAV_LINKS = [
        { label: 'Home', icon: 'home', href: R('index.html'), page: 'index.html' },
        { label: 'Read Quran', icon: 'book-open', href: R('mushaf.html'), page: 'mushaf.html' },
        { label: 'Reciters', icon: 'mic', href: R('reciters/index.html'), page: 'reciters/index.html', subdir: 'reciters/' },
        { label: 'Adhkar', icon: 'sparkles', href: R('adhkar.html'), page: 'adhkar.html' },
        { label: 'How to Pray', icon: 'compass', href: R('salah.html'), page: 'salah.html' },
        { label: 'Word Game', icon: 'gamepad-2', href: R('game.html'), page: 'game.html' },
        { label: 'Blog', icon: 'newspaper', href: R('blog.html'), page: 'blog.html' },
        { label: 'Ask (AI)', icon: 'message-circle', href: R('ask.html'), page: 'ask.html' },
    ];

    // Detect current page
    // Use the FULL path (not just the filename) so that
    // reciters/index.html doesn't match the Home link (index.html).
    var fullPath = window.location.pathname;
    // Normalize: strip trailing slash, ensure leading slash
    if (fullPath.length > 1 && fullPath.endsWith('/')) fullPath = fullPath.slice(0, -1);
    if (!fullPath.startsWith('/')) fullPath = '/' + fullPath;

    // The path of the page we're on, relative to the site root
    // e.g. '/' or '/index.html' → home
    //      '/mushaf.html' → mushaf
    //      '/reciters/index.html' → reciters page
    //      '/reciters/reciter.html' → reciters page (subdir match)
    function isActive(link) {
        // Build the expected full path for this link
        var expectedPath = link.href;
        // Remove any root prefix (../) since we're comparing against window.location.pathname
        // which is always root-relative
        while (expectedPath.startsWith('../')) expectedPath = expectedPath.slice(3);
        if (!expectedPath.startsWith('/')) expectedPath = '/' + expectedPath;

        // Special case: Home link matches '/' or '/index.html' at the ROOT only
        if (link.page === 'index.html' && !link.subdir) {
            return fullPath === '/' || fullPath === '/index.html' ||
                fullPath === '' || fullPath === '/index.htm';
        }

        // For links with a subdir (e.g. Reciters), match if we're anywhere
        // inside that subdirectory
        if (link.subdir) {
            var subdirPath = '/' + link.subdir;
            return fullPath.indexOf(subdirPath) !== -1 ||
                fullPath === expectedPath;
        }

        // For all other links, exact path match
        return fullPath === expectedPath;
    }

    // SVG icons (inline so no icon-font dependency)
    // SVG icons (inline, explicit dimensions to prevent FOUC)
    var ICONS = {
        'home': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        'book-open': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        'mic': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        'sparkles': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>',
        'compass': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        'gamepad-2': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z"/></svg>',
        'message-circle': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
        'newspaper': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>',
        'menu': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        'x': '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    };

    // Baca logo — new calligraphic logo image (replaces old SVG book)
    var LOGO_SVG = '<img class="baca-logo-icon" src="' + R('images/baca-logo.webp') + '" alt="Baca logo" width="32" height="32" loading="eager">';

    // Inject CSS links if not already present
    var cssHref = R('css/shared-nav.css');
    if (!document.querySelector('link[href*="shared-nav.css"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
    }
    // Inject baca-logo.css (new logo + Reem Kufi font + green gradient)
    var logoCssHref = R('css/baca-logo.css');
    if (!document.querySelector('link[href*="baca-logo.css"]')) {
        var logoLink = document.createElement('link');
        logoLink.rel = 'stylesheet';
        logoLink.href = logoCssHref;
        document.head.appendChild(logoLink);
    }
    // Inject tab bar CSS (only applies in standalone mode via the media query)
    if (!document.getElementById('baca-tab-bar-css')) {
        var tabCss = document.createElement('style');
        tabCss.id = 'baca-tab-bar-css';
        tabCss.textContent = `
            .baca-tab-bar { display: none; }
            .baca-more-sheet { display: none; }
            .baca-more-backdrop { display: none; }
            /* Tab bar ONLY shows in standalone mode (installed PWA) */
            @media (display-mode: standalone) {
                .baca-tab-bar {
                    display: flex !important;
                    position: fixed; bottom: 0; left: 0; right: 0;
                    height: calc(60px + env(safe-area-inset-bottom, 0px));
                    padding-bottom: env(safe-area-inset-bottom, 0px);
                    background: rgba(15, 23, 42, 0.95);
                    backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    z-index: 99998; align-items: stretch; justify-content: space-around;
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    -webkit-tap-highlight-color: transparent;
                }
                body.baca-has-tab-bar { padding-bottom: calc(60px + env(safe-area-inset-bottom, 0px)); }
                body.baca-has-tab-bar .baca-tab-bar.hidden { transform: translateY(100%); }
                .baca-tab-item {
                    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
                    gap: 2px; padding: 8px 4px 6px; background: none; border: none; color: #64748b;
                    cursor: pointer; text-decoration: none; font-family: 'Poppins', sans-serif;
                    font-size: 0.65rem; font-weight: 500; line-height: 1;
                    transition: color 0.18s ease, transform 0.12s ease;
                    -webkit-tap-highlight-color: transparent; min-width: 0; position: relative;
                }
                .baca-tab-item:active { transform: scale(0.92); }
                .baca-tab-icon { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; transition: transform 0.2s ease; }
                .baca-tab-icon svg { width: 22px; height: 22px; display: block; }
                .baca-tab-label { font-size: 0.6rem; font-weight: 500; letter-spacing: 0.2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; }
                .baca-tab-item.active { color: #10b981; }
                .baca-tab-item.active .baca-tab-icon svg { stroke-width: 2.4; }
                .baca-tab-item.active::before {
                    content: ''; position: absolute; top: 2px; left: 50%; transform: translateX(-50%);
                    width: 5px; height: 5px; border-radius: 50%;
                    background: linear-gradient(135deg, #10b981, #06b6d4);
                    box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
                }
                body.light-mode .baca-tab-bar { background: rgba(255, 255, 255, 0.95); border-top-color: rgba(0, 0, 0, 0.08); }
                body.light-mode .baca-tab-item { color: #94a3b8; }
                body.light-mode .baca-tab-item.active { color: #059669; }
                .baca-more-sheet {
                    display: block; position: fixed; bottom: 0; left: 0; right: 0;
                    background: #1e293b; border-radius: 20px 20px 0 0;
                    padding: 8px 20px calc(20px + env(safe-area-inset-bottom, 0px));
                    z-index: 100000; transform: translateY(100%);
                    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.3); max-height: 70vh; overflow-y: auto;
                }
                .baca-more-sheet.open { transform: translateY(0); }
                .baca-more-sheet-handle { width: 40px; height: 4px; background: rgba(255, 255, 255, 0.2); border-radius: 2px; margin: 0 auto 12px; }
                .baca-more-sheet-title { font-family: 'Poppins', sans-serif; font-size: 0.85rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 16px; text-align: center; }
                .baca-more-sheet-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding-bottom: 8px; }
                .baca-more-sheet-item {
                    display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px 8px;
                    background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 14px; text-decoration: none; color: #cbd5e1;
                    font-family: 'Poppins', sans-serif; font-size: 0.75rem; font-weight: 500;
                    transition: background 0.18s, transform 0.12s, border-color 0.18s;
                    -webkit-tap-highlight-color: transparent;
                }
                .baca-more-sheet-item:active { transform: scale(0.94); }
                .baca-more-sheet-item.active { background: rgba(16, 185, 129, 0.15); border-color: rgba(16, 185, 129, 0.4); color: #10b981; }
                .baca-more-sheet-item-icon { width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; }
                .baca-more-sheet-item-icon svg { width: 26px; height: 26px; }
                body.light-mode .baca-more-sheet { background: #f8fafc; box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.1); }
                body.light-mode .baca-more-sheet-handle { background: rgba(0, 0, 0, 0.15); }
                body.light-mode .baca-more-sheet-title { color: #64748b; }
                body.light-mode .baca-more-sheet-item { background: rgba(0, 0, 0, 0.04); border-color: rgba(0, 0, 0, 0.06); color: #475569; }
                body.light-mode .baca-more-sheet-item.active { background: rgba(16, 185, 129, 0.12); border-color: rgba(16, 185, 129, 0.4); color: #059669; }
                .baca-more-backdrop { display: none; position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); z-index: 99999; opacity: 0; transition: opacity 0.3s; }
                .baca-more-backdrop.open { display: block; opacity: 1; }
            }
        `;
        document.head.appendChild(tabCss);
    }

    // Remove old hamburger buttons and mobile-nav divs
    // (common IDs/classes from before this unified script).
    function removeLegacyNav() {
        var selectors = [
            '#hamburger-btn',          // index.html old hamburger
            '#askHamburger',           // ask.html old hamburger
            '#mobile-nav',             // index.html old mobile nav
            '#askMobileNav',           // ask.html old mobile nav
            '.hamburger-btn:not(.baca-nav-toggle)',  // any other hamburger-btn
            '.mobile-nav:not(.baca-nav-drawer)'      // any other mobile-nav
        ];
        selectors.forEach(function (sel) {
            document.querySelectorAll(sel).forEach(function (el) {
                el.parentNode && el.parentNode.removeChild(el);
            });
        });

        // Also remove nav-actions containers that are now empty
        // (after removing the old hamburger, some .nav-actions divs
        // may have only the theme button left — that's fine, we keep
        // those. We only remove truly empty ones.)
        document.querySelectorAll('.nav-actions').forEach(function (el) {
            if (!el.children.length && !el.textContent.trim()) {
                el.parentNode && el.parentNode.removeChild(el);
            }
        });
    }

    // Find the navbar to inject into
    function findNavbar() {
        // Priority order:
        // 1. header.navbar (most pages)
        // 2. header.mushaf-topbar (mushaf.html)
        // 3. header (any header)
        return document.querySelector('header.navbar') ||
            document.querySelector('header.mushaf-topbar') ||
            document.querySelector('header');
    }

    // Find or create a nav-actions container
    function findOrCreateNavActions(navbar) {
        // Look for an existing .nav-actions container
        var existing = navbar.querySelector('.nav-actions');
        if (existing) return existing;

        // For mushaf topbar: the topbar has [logo, topbar-spacer(flex:1)].
        // We must NOT inject into the spacer (that puts the button right
        // next to the logo). Instead, create a new .nav-actions div and
        // append it AFTER the spacer. The topbar's `justify-content:
        // space-between` + the spacer's `flex:1` will push the nav-actions
        // to the far right.
        if (navbar.classList.contains('mushaf-topbar')) {
            var div = document.createElement('div');
            div.className = 'nav-actions';
            div.style.cssText = 'display:flex;align-items:center;gap:0.6rem;flex-shrink:0;';
            navbar.appendChild(div);
            return div;
        }

        // Look for a back button container we can repurpose
        var navBack = navbar.querySelector('.nav-back, .back-btn, .adhkar-btn, .salah-btn');
        if (navBack) return navBack;

        // Create a new nav-actions div
        var div2 = document.createElement('div');
        div2.className = 'nav-actions';
        div2.style.cssText = 'display:flex;align-items:center;gap:0.6rem;margin-left:auto;';
        navbar.appendChild(div2);
        return div2;
    }

    // Build the hamburger button
    function buildToggleButton() {
        var btn = document.createElement('button');
        btn.className = 'baca-nav-toggle';
        btn.type = 'button';
        btn.setAttribute('aria-label', 'Open navigation menu');
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'baca-nav-drawer');
        btn.innerHTML =
            '<span class="baca-nav-toggle-icon-open">' + ICONS['menu'] + '</span>' +
            '<span class="baca-nav-toggle-icon-close">' + ICONS['x'] + '</span>';
        return btn;
    }

    // Build the drawer
    function buildDrawer() {
        var drawer = document.createElement('nav');
        drawer.className = 'baca-nav-drawer';
        drawer.id = 'baca-nav-drawer';
        drawer.setAttribute('aria-label', 'Baca navigation');
        drawer.setAttribute('role', 'navigation');

        // Head
        var head = document.createElement('div');
        head.className = 'baca-nav-drawer-head';
        head.innerHTML =
            '<a href="' + R('index.html') + '" class="baca-nav-drawer-logo" aria-label="Baca — Home">' +
            LOGO_SVG +
            '<span class="baca-nav-drawer-logo-text">Baca</span>' +
            '</a>' +
            '<button class="baca-nav-drawer-close" type="button" aria-label="Close menu">' + ICONS['x'] + '</button>';

        // Body
        var body = document.createElement('div');
        body.className = 'baca-nav-drawer-body';

        var label = document.createElement('div');
        label.className = 'baca-nav-drawer-section-label';
        label.textContent = 'Navigate';
        body.appendChild(label);

        NAV_LINKS.forEach(function (link) {
            // Hide web-only links in standalone (installed app) mode
            if (link.webOnly && isStandaloneMode()) return;
            var a = document.createElement('a');
            a.className = 'baca-nav-drawer-link' + (isActive(link) ? ' active' : '');
            a.href = link.href;
            a.innerHTML = (ICONS[link.icon] || '') + '<span>' + link.label + '</span>';
            body.appendChild(a);
        });

        // Footer
        var footer = document.createElement('div');
        footer.className = 'baca-nav-drawer-footer';
        footer.innerHTML = '<div class="baca-nav-drawer-footer-text">Read • Reflect • Grow<br>Baca - <i>Your Qur\'an Companion</i></div>';

        drawer.appendChild(head);
        drawer.appendChild(body);
        drawer.appendChild(footer);
        return drawer;
    }

    // Main: wait for DOM, then integrate
    function integrate() {
        removeLegacyNav();

        var navbar = findNavbar();
        if (!navbar) {
            // No navbar on this page — nothing to do
            return;
        }

        // Don't double-inject
        if (navbar.querySelector('.baca-nav-toggle')) return;

        var navActions = findOrCreateNavActions(navbar);
        var btn = buildToggleButton();
        var drawer = buildDrawer();
        var backdrop = document.createElement('div');
        backdrop.className = 'baca-nav-backdrop';

        navActions.appendChild(btn);
        document.body.appendChild(backdrop);
        document.body.appendChild(drawer);

        // Toggle behaviour
        function openDrawer() {
            drawer.classList.add('open');
            backdrop.classList.add('open');
            btn.setAttribute('aria-expanded', 'true');
            document.body.style.overflow = 'hidden';
        }
        function closeDrawer() {
            drawer.classList.remove('open');
            backdrop.classList.remove('open');
            btn.setAttribute('aria-expanded', 'false');
            document.body.style.overflow = '';
        }
        function toggleDrawer() {
            if (drawer.classList.contains('open')) closeDrawer();
            else openDrawer();
        }

        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            toggleDrawer();
        });
        backdrop.addEventListener('click', closeDrawer);
        drawer.querySelector('.baca-nav-drawer-close').addEventListener('click', closeDrawer);

        // Close on Escape
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
        });

        // Close drawer when any link inside it is clicked
        drawer.querySelectorAll('.baca-nav-drawer-link').forEach(function (a) {
            a.addEventListener('click', function () {
                setTimeout(closeDrawer, 120);
            });
        });

        // Close drawer if window resized to large width (optional UX nicety)
        window.addEventListener('resize', function () {
            if (drawer.classList.contains('open') && window.innerWidth > 1200) {
                closeDrawer();
            }
        });

        // Expose API
        window.BacaSharedNav = {
            open: openDrawer,
            close: closeDrawer,
            toggle: toggleDrawer
        };
    }

    // ========================================================================
    // MOBILE BOTTOM TAB BAR — ONLY IN STANDALONE (INSTALLED APP) MODE
    // Mobile browser users get the hamburger drawer (above) instead.
    // Installed app users get the native-style bottom tab bar because:
    //   1. It's thumb-reachable (better UX for one-handed use)
    //   2. It replaces the browser chrome that's no longer there
    //   3. It's the standard mobile-app navigation pattern
    // ========================================================================

    function isStandaloneMode() {
        return window.matchMedia('(display-mode: standalone)').matches ||
            window.navigator.standalone === true ||
            document.referrer.includes('android-app://');
    }

    var PRIMARY_TABS = [
        { label: 'Home', icon: 'home', href: R('index.html'), page: 'index.html' },
        { label: 'Read', icon: 'book-open', href: R('mushaf.html'), page: 'mushaf.html' },
        { label: 'Adhkar', icon: 'sparkles', href: R('adhkar.html'), page: 'adhkar.html' },
        { label: 'Pray', icon: 'compass', href: R('salah.html'), page: 'salah.html' },
        { label: 'Ask', icon: 'message-circle', href: R('ask.html'), page: 'ask.html' },
    ];

    var SECONDARY_ITEMS = [
        { label: 'Reciters', icon: 'mic', href: R('reciters/index.html'), page: 'reciters/index.html', subdir: 'reciters/' },
        { label: 'Word Game', icon: 'gamepad-2', href: R('game.html'), page: 'game.html' },
        // Mobile-app-only destinations (hidden in web browser, shown in installed app)
        { label: 'Topics', icon: 'compass', href: R('topics.html'), page: 'topics.html', mobileOnly: true },
        { label: 'Journeys', icon: 'map', href: R('journeys.html'), page: 'journeys.html', mobileOnly: true },
        { label: 'Progress', icon: 'trending-up', href: R('progress.html'), page: 'progress.html', mobileOnly: true },
        { label: 'Bookmarks', icon: 'bookmark', href: R('bookmarks.html'), page: 'bookmarks.html', mobileOnly: true },
        { label: 'Blog', icon: 'newspaper', href: R('blog.html'), page: 'blog.html' },
    ];

    var TAB_ICONS = {
        'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        'book-open': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        'sparkles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>',
        'compass': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        'message-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
        'newspaper': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>',
        'grid': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>',
        'map': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>',
        'trending-up': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
        'bookmark': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>',
        'newspaper': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6z"/></svg>',
        'mic': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        'gamepad-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z"/></svg>',
    };

    function buildTabBar() {
        var bar = document.createElement('nav');
        bar.className = 'baca-tab-bar';
        bar.id = 'baca-tab-bar';
        bar.setAttribute('aria-label', 'Primary navigation');
        PRIMARY_TABS.forEach(function (tab) {
            var a = document.createElement('a');
            a.className = 'baca-tab-item' + (isActive(tab) ? ' active' : '');
            a.href = tab.href;
            a.setAttribute('aria-label', tab.label);
            a.innerHTML = '<span class="baca-tab-icon">' + (TAB_ICONS[tab.icon] || '') + '</span><span class="baca-tab-label">' + tab.label + '</span>';
            bar.appendChild(a);
        });
        var moreBtn = document.createElement('button');
        moreBtn.className = 'baca-tab-item baca-tab-more';
        moreBtn.type = 'button';
        moreBtn.setAttribute('aria-label', 'More options');
        moreBtn.innerHTML = '<span class="baca-tab-icon">' + (TAB_ICONS['grid'] || '') + '</span><span class="baca-tab-label">More</span>';
        bar.appendChild(moreBtn);
        return bar;
    }

    function buildMoreSheet() {
        var sheet = document.createElement('div');
        sheet.className = 'baca-more-sheet';
        sheet.id = 'baca-more-sheet';
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-label', 'More options');
        sheet.innerHTML = '<div class="baca-more-sheet-handle"></div><div class="baca-more-sheet-title">More</div>';
        var grid = document.createElement('div');
        grid.className = 'baca-more-sheet-grid';
        SECONDARY_ITEMS.forEach(function (item) {
            // Hide mobile-only items in web browser (only show in installed app)
            if (item.mobileOnly && !isStandaloneMode()) return;
            var a = document.createElement('a');
            a.className = 'baca-more-sheet-item' + (isActive(item) ? ' active' : '');
            a.href = item.href;
            a.innerHTML = '<span class="baca-more-sheet-item-icon">' + (TAB_ICONS[item.icon] || '') + '</span><span class="baca-more-sheet-item-label">' + item.label + '</span>';
            grid.appendChild(a);
        });
        sheet.appendChild(grid);
        return sheet;
    }

    var lastScrollY = 0;
    var tabBarHidden = false;

    function handleScroll() {
        var bar = document.getElementById('baca-tab-bar');
        if (!bar) return;
        var currentY = window.scrollY;
        var delta = currentY - lastScrollY;
        if (currentY < 50) { bar.classList.remove('hidden'); tabBarHidden = false; lastScrollY = currentY; return; }
        if (Math.abs(delta) < 10) return;
        if (delta > 0 && !tabBarHidden) { bar.classList.add('hidden'); tabBarHidden = true; }
        else if (delta < 0 && tabBarHidden) { bar.classList.remove('hidden'); tabBarHidden = false; }
        lastScrollY = currentY;
    }

    function integrateTabBar() {
        if (document.getElementById('baca-tab-bar')) return;
        var bar = buildTabBar();
        var sheet = buildMoreSheet();
        var backdrop = document.createElement('div');
        backdrop.className = 'baca-more-backdrop';
        backdrop.id = 'baca-more-backdrop';
        document.body.appendChild(bar);
        document.body.appendChild(backdrop);
        document.body.appendChild(sheet);
        document.body.classList.add('baca-has-tab-bar');
        function openMoreSheet() { sheet.classList.add('open'); backdrop.classList.add('open'); document.body.style.overflow = 'hidden'; }
        function closeMoreSheet() { sheet.classList.remove('open'); backdrop.classList.remove('open'); document.body.style.overflow = ''; }
        bar.querySelector('.baca-tab-more').addEventListener('click', function (e) {
            e.stopPropagation();
            if (sheet.classList.contains('open')) closeMoreSheet(); else openMoreSheet();
        });
        backdrop.addEventListener('click', closeMoreSheet);
        sheet.querySelectorAll('.baca-more-sheet-item').forEach(function (a) {
            a.addEventListener('click', function () { setTimeout(closeMoreSheet, 150); });
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sheet.classList.contains('open')) closeMoreSheet();
        });
        window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // === Main: drawer on desktop+mobile browser; tab bar + NO drawer in standalone ===
    // NOTE: The hamburger button is hidden in standalone mode via CSS
    // (in baca-logo.css, @media (display-mode: standalone)) — NOT via JS injection.
    // This is more reliable: the CSS is loaded in <head> and applied immediately
    // before any JS runs, so there's no flash of the hamburger button in the app.
    function init() {
        // Build the drawer (needed for navigation on desktop/mobile browser,
        // and for "More" sheet links in standalone mode)
        integrate();

        // In standalone mode, also build the tab bar
        if (isStandaloneMode()) {
            integrateTabBar();
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

(function () {
    'use strict';

    // ── Detect site root from this script's src ──────────────
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

    // ── Navigation links ─────────────────────────────────────
    var NAV_LINKS = [
        { label: 'Home', icon: 'home', href: R('index.html'), page: 'index.html' },
        { label: 'Read Quran', icon: 'book-open', href: R('mushaf.html'), page: 'mushaf.html' },
        { label: 'Reciters', icon: 'mic', href: R('reciters/index.html'), page: 'reciters/index.html', subdir: 'reciters/' },
        { label: 'Adhkar', icon: 'sparkles', href: R('adhkar.html'), page: 'adhkar.html' },
        { label: 'How to Pray', icon: 'compass', href: R('salah.html'), page: 'salah.html' },
        { label: 'Word Game', icon: 'gamepad-2', href: R('game.html'), page: 'game.html' },
        { label: 'Ask (AI)', icon: 'message-circle', href: R('ask.html'), page: 'ask.html' },
    ];

    // ── Detect current page ──────────────────────────────────
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

    // ── SVG icons (inline so no icon-font dependency) ────────
    var ICONS = {
        'home': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
        'book-open': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
        'mic': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2" width="6" height="11" rx="3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>',
        'sparkles': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3z"/></svg>',
        'compass': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
        'gamepad-2': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="11" x2="10" y2="11"/><line x1="8" y1="9" x2="8" y2="13"/><line x1="15" y1="12" x2="15.01" y2="12"/><line x1="18" y1="10" x2="18.01" y2="10"/><path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0 0 17.32 5z"/></svg>',
        'message-circle': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>',
        'menu': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
        'x': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    };

    // ── Baca logo SVG ────────────────────────────────────────
    var LOGO_SVG = '<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
        '<path d="M24 14C20 12 14 11 8 12V36C14 35 20 36 24 38C28 36 34 35 40 36V12C34 11 28 12 24 14Z" fill="url(#bacaNavLogoGrad)" opacity="0.18"/>' +
        '<path d="M24 14C20 12 14 11 8 12V36C14 35 20 36 24 38C28 36 34 35 40 36V12C34 11 28 12 24 14Z" stroke="url(#bacaNavLogoGrad)" stroke-width="1.8" stroke-linejoin="round"/>' +
        '<line x1="24" y1="14" x2="24" y2="38" stroke="url(#bacaNavLogoGrad)" stroke-width="1.5" stroke-linecap="round"/>' +
        '<path d="M24 4L25.5 8.5L30 9L26.5 12L28 16.5L24 14L20 16.5L21.5 12L18 9L22.5 8.5L24 4Z" fill="url(#bacaNavLogoGrad)" opacity="0.9"/>' +
        '<defs><linearGradient id="bacaNavLogoGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">' +
        '<stop offset="0" stop-color="#10b981"/><stop offset="0.5" stop-color="#06b6d4"/><stop offset="1" stop-color="#6366f1"/>' +
        '</linearGradient></defs></svg>';

    // ── Inject CSS link if not already present ───────────────
    var cssHref = R('css/shared-nav.css');
    if (!document.querySelector('link[href*="shared-nav.css"]')) {
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssHref;
        document.head.appendChild(link);
    }

    // ── Remove OLD hamburger buttons and mobile-nav divs ─────
    // This cleans up any legacy navigation so only the new
    // unified hamburger remains. We look for the common IDs and
    // classes that existed in the codebase before this script.
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

    // ── Find the navbar to inject into ───────────────────────
    function findNavbar() {
        // Priority order:
        // 1. header.navbar (most pages)
        // 2. header.mushaf-topbar (mushaf.html)
        // 3. header (any header)
        return document.querySelector('header.navbar') ||
            document.querySelector('header.mushaf-topbar') ||
            document.querySelector('header');
    }

    // ── Find or create a nav-actions container ───────────────
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

    // ── Build the hamburger button ───────────────────────────
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

    // ── Build the drawer ─────────────────────────────────────
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
            var a = document.createElement('a');
            a.className = 'baca-nav-drawer-link' + (isActive(link) ? ' active' : '');
            a.href = link.href;
            a.innerHTML = (ICONS[link.icon] || '') + '<span>' + link.label + '</span>';
            body.appendChild(a);
        });

        // Footer
        var footer = document.createElement('div');
        footer.className = 'baca-nav-drawer-footer';
        footer.innerHTML = '<div class="baca-nav-drawer-footer-text">Read • Reflect • Grow<br>Baca — Qur\'an Companion</div>';

        drawer.appendChild(head);
        drawer.appendChild(body);
        drawer.appendChild(footer);
        return drawer;
    }

    // ── Main: wait for DOM, then integrate ───────────────────
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

        // ── Toggle behaviour ──────────────────────────────────
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

        // Close the drawer with NO transition — used right before we
        // navigate away to a new page. Animating the close here is
        // pointless (the page is about to unload) and was the cause of
        // a visible flash: the 120ms-delayed close used to fire WHILE
        // the next page's document was already loading, so its slide-
        // out / fade animation got caught mid-flight and rendered on
        // top of the incoming page's own (freshly-closed) toggle button.
        // Closing instantly removes that overlapping half-animated frame.
        function closeDrawerInstant() {
            var prevDrawerTransition = drawer.style.transition;
            var prevBackdropTransition = backdrop.style.transition;
            drawer.style.transition = 'none';
            backdrop.style.transition = 'none';
            closeDrawer();
            // Force the browser to apply the "no transition" style before
            // we restore it, otherwise the browser may batch/skip it.
            // eslint-disable-next-line no-unused-expressions
            drawer.offsetHeight;
            drawer.style.transition = prevDrawerTransition;
            backdrop.style.transition = prevBackdropTransition;
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

        // Close drawer INSTANTLY when a nav link is clicked — we're
        // navigating to a brand-new page, so there's nothing to animate
        // and animating it was causing a visible flash during the
        // transition (see closeDrawerInstant comment above).
        drawer.querySelectorAll('.baca-nav-drawer-link').forEach(function (a) {
            a.addEventListener('click', function () {
                closeDrawerInstant();
            });
        });

        // Close drawer if window resized to large width (optional UX nicety)
        window.addEventListener('resize', function () {
            if (drawer.classList.contains('open') && window.innerWidth > 1200) {
                closeDrawer();
            }
        });

        // If the browser restores this exact page from the back/forward
        // cache (bfcache) — e.g. the user taps the browser's Back button
        // after navigating away via the drawer — make sure the drawer
        // and body scroll-lock are reset to closed. Without this, a page
        // restored from bfcache can reappear with the drawer still "open"
        // internally (stale state from right before it was left).
        window.addEventListener('pageshow', function () {
            closeDrawerInstant();
        });

        // Expose API
        window.BacaSharedNav = {
            open: openDrawer,
            close: closeDrawer,
            toggle: toggleDrawer
        };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', integrate);
    } else {
        integrate();
    }
})();

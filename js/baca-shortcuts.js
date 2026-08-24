/* baca-shortcuts.js — Floating section navigator for the Baca home page
 *
 * Shows a set of quick-jump shortcut pills on the LEFT side of the screen
 * (desktop) or a horizontal scrollable bar (mobile) that let users jump
 * directly to any section of the long home page.
 *
 * Positioned on the LEFT (vertically centered) so it doesn't block the
 * chat FAB on the bottom-right. The scroll-to-top/scroll-to-bottom buttons
 * are at the bottom-left, but the shortcuts are vertically centered —
 * no overlap.
 *
 * The shortcuts detect the page's section IDs and build pills automatically.
 * Active section is highlighted based on scroll position (IntersectionObserver).
 */
(function () {
  'use strict';

  // Only run on index.html
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/') {
    // Also match root path
    if (window.location.pathname !== '/' && window.location.pathname !== '') return;
  }

  // Section definitions — id + label + icon
  // (Topics, Journeys, Daily Challenge, and Achievements have been moved into
  //  the mobile app's "More" sheet as their own destinations. The home page
  //  now keeps compact summary cards for Bookmarks and Reading Progress.)
  var SECTIONS = [
    { id: 'hero', label: 'Home', icon: 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10' },
    { id: 'surah-explorer', label: 'Qur\'an', icon: 'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z' },
    { id: 'daily-ayah', label: 'Daily Ayah', icon: 'M12 2L13.09 8.26L20 9L13.09 9.74L12 16L10.91 9.74L4 9L10.91 8.26L12 2Z' },
    { id: 'reading-progress', label: 'Progress', icon: 'M22 7 13.5 15.5 8.5 10.5 2 17 M16 7 22 7 22 13' },
    { id: 'bookmarks', label: 'Bookmarks', icon: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' },
  ];

  var nav = null;
  var activeId = null;

  function buildNav() {
    // Check which sections actually exist on the page
    var available = SECTIONS.filter(function (s) {
      return document.getElementById(s.id);
    });

    if (available.length === 0) return;

    nav = document.createElement('nav');
    nav.className = 'baca-shortcuts-nav';
    nav.setAttribute('aria-label', 'Page sections');

    available.forEach(function (section) {
      var btn = document.createElement('button');
      btn.className = 'baca-shortcut-pill';
      btn.type = 'button';
      btn.dataset.target = section.id;
      btn.setAttribute('aria-label', section.label);
      btn.innerHTML =
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="' + section.icon + '"/>' +
        '</svg>' +
        '<span class="baca-shortcut-label">' + section.label + '</span>';

      btn.addEventListener('click', function () {
        var el = document.getElementById(section.id);
        if (el) {
          var offset = 80; // navbar height
          var top = el.getBoundingClientRect().top + window.scrollY - offset;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }
      });

      nav.appendChild(btn);
    });

    // --- NEW: Minimize / Expand Toggle Button ---
    var toggleBtn = document.createElement('button');
    toggleBtn.className = 'baca-shortcut-pill baca-shortcut-toggle';
    toggleBtn.type = 'button';
    toggleBtn.setAttribute('aria-label', 'Minimize shortcuts');
    // X icon to minimize, List icon to expand
    toggleBtn.innerHTML =
      '<svg class="icon-minimize" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M18 6L6 18M6 6l12 12"/>' +
      '</svg>' +
      '<svg class="icon-expand" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' +
      '<path d="M3 12h18M3 6h18M3 18h18"/>' +
      '</svg>';

    toggleBtn.addEventListener('click', function () {
      nav.classList.toggle('minimized');
      if (nav.classList.contains('minimized')) {
        toggleBtn.setAttribute('aria-label', 'Expand shortcuts');
      } else {
        toggleBtn.setAttribute('aria-label', 'Minimize shortcuts');
      }
    });

    nav.appendChild(toggleBtn);
    // ---------------------------------------------

    document.body.appendChild(nav);

    // Inject CSS
    if (!document.getElementById('baca-shortcuts-css')) {
      var css = document.createElement('style');
      css.id = 'baca-shortcuts-css';
      css.textContent = `
        .baca-shortcuts-nav {
          position: fixed;
          left: 1.5rem;
          top: calc(50% - 30px);
          transform: translateY(-50%);
          z-index: 2999;
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: 8px;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease, border-radius 0.3s ease, padding 0.3s ease, transform 0.3s ease;
          max-height: calc(100vh - 160px);
          overflow-y: auto;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .baca-shortcuts-nav::-webkit-scrollbar { display: none; }
        .baca-shortcuts-nav.visible {
          opacity: 1;
          pointer-events: auto;
        }
        .baca-shortcut-pill {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          background: none;
          border: none;
          border-radius: 10px;
          color: #64748b;
          cursor: pointer;
          font-family: 'Poppins', sans-serif;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          transition: all 0.2s ease;
          -webkit-tap-highlight-color: transparent;
        }
        .baca-shortcut-pill svg {
          width: 16px;
          height: 16px;
          flex-shrink: 0;
        }
        .baca-shortcut-pill:hover {
          background: rgba(16, 185, 129, 0.1);
          color: #34d399;
        }
        .baca-shortcut-pill.active {
          background: rgba(16, 185, 129, 0.15);
          color: #10b981;
        }
        /* The label expands to the RIGHT (since the nav is on the left side) */
        .baca-shortcut-label {
          max-width: 0;
          overflow: hidden;
          transition: max-width 0.25s ease;
          white-space: nowrap;
        }
        .baca-shortcut-pill:hover .baca-shortcut-label,
        .baca-shortcut-pill.active .baca-shortcut-label {
          max-width: 120px;
        }

        /* --- Toggle Button & Minimized State --- */
        .baca-shortcut-toggle {
          margin-top: 6px;
          padding-top: 8px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          justify-content: center;
        }
        .baca-shortcut-toggle .icon-expand { display: none; }
        .baca-shortcut-toggle .icon-minimize { display: block; }
        
        .baca-shortcuts-nav.minimized {
          padding: 6px;
          border-radius: 50%; /* Shrinks into a bubble */
        }
        .baca-shortcuts-nav.minimized .baca-shortcut-pill:not(.baca-shortcut-toggle) {
          display: none; /* Hide all section pills */
        }
        .baca-shortcuts-nav.minimized .baca-shortcut-toggle {
          border-top: none;
          margin-top: 0;
          padding-top: 0;
          padding: 8px;
        }
        .baca-shortcuts-nav.minimized .baca-shortcut-toggle .icon-minimize { display: none; }
        .baca-shortcuts-nav.minimized .baca-shortcut-toggle .icon-expand { display: block; }
        /* --------------------------------------- */

        /* Light mode */
        body.light-mode .baca-shortcuts-nav {
          background: rgba(255, 255, 255, 0.7);
          border-color: rgba(0, 0, 0, 0.06);
        }
        body.light-mode .baca-shortcut-pill {
          color: #94a3b8;
        }
        body.light-mode .baca-shortcut-pill:hover {
          background: rgba(16, 185, 129, 0.1);
          color: #059669;
        }
        body.light-mode .baca-shortcut-pill.active {
          background: rgba(16, 185, 129, 0.12);
          color: #059669;
        }
        body.light-mode .baca-shortcut-toggle {
          border-top-color: rgba(0, 0, 0, 0.06);
        }

        /* Mobile — horizontal bar at the top (centered, not blocking anything) */
        @media (max-width: 768px) {
          .baca-shortcuts-nav {
            position: fixed;
            left: 50%;
            top: calc(60px + env(safe-area-inset-top, 0px));
            transform: translateX(-50%);
            flex-direction: row;
            gap: 4px;
            padding: 6px;
            border-radius: 14px;
            max-width: calc(100vw - 2rem);
            overflow-x: auto;
            max-height: none;
          }
          .baca-shortcuts-nav::-webkit-scrollbar { display: none; }
          .baca-shortcut-pill {
            padding: 6px 10px;
            font-size: 0.7rem;
            gap: 5px;
          }
          .baca-shortcut-pill svg { width: 14px; height: 14px; }
          .baca-shortcut-label {
            max-width: 100px; /* always show label on mobile */
          }
          .baca-shortcut-pill:hover .baca-shortcut-label,
          .baca-shortcut-pill.active .baca-shortcut-label {
            max-width: 100px;
          }
          /* Hide minimize button on mobile */
          .baca-shortcut-toggle { display: none !important; }
          /* Reset minimized shape on mobile just in case */
          .baca-shortcuts-nav.minimized {
            border-radius: 14px;
            padding: 6px;
          }
        }

        /* Standalone mode — adjust top offset for the navbar */
        @media (display-mode: standalone) {
          @media (max-width: 768px) {
            .baca-shortcuts-nav {
              top: calc(56px + env(safe-area-inset-top, 0px));
            }
          }
        }
      `;
      document.head.appendChild(css);
    }
  }

  // Track active section
  function setupObserver() {
    if (!nav) return;

    var pills = nav.querySelectorAll('.baca-shortcut-pill:not(.baca-shortcut-toggle)');

    // Show/hide the nav based on scroll position
    function checkVisibility() {
      if (window.scrollY > 300) {
        nav.classList.add('visible');
      } else {
        nav.classList.remove('visible');
      }
    }

    // Use IntersectionObserver to detect active section
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          var id = entry.target.id;
          pills.forEach(function (pill) {
            if (pill.dataset.target === id) {
              pill.classList.add('active');
            } else {
              pill.classList.remove('active');
            }
          });
        }
      });
    }, {
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0,
    });

    // Observe each section
    SECTIONS.forEach(function (s) {
      var el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    window.addEventListener('scroll', checkVisibility, { passive: true });
    checkVisibility();

    // === Hide when a modal is open ===
    function checkModalOpen() {
      var wordModal = document.getElementById('word-modal-overlay');
      var searchModal = document.getElementById('search-modal');
      var modalOpen = false;
      if (wordModal && !wordModal.hidden) modalOpen = true;
      if (searchModal && searchModal.classList.contains('open')) modalOpen = true;
      document.querySelectorAll('[aria-modal="true"]').forEach(function (el) {
        if (!el.hasAttribute('hidden') && el.offsetParent !== null) modalOpen = true;
      });
      if (nav) nav.style.display = modalOpen ? 'none' : '';
    }
    window.addEventListener('scroll', checkModalOpen, { passive: true });
    setInterval(checkModalOpen, 500);
  }

  function init() {
    buildNav();
    setupObserver();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
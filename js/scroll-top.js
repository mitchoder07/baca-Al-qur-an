/* scroll-top.js — Professional scroll-to-top + scroll-to-bottom for Baca (v2)
 *
 * Features:
 * - TWO buttons: scroll-to-top (up arrow) + scroll-to-bottom (down arrow)
 * - Both appear together after scrolling 400px
 * - Scroll-to-top hides when at the top of the page
 * - Scroll-to-bottom hides when at the bottom of the page
 * - Frosted-glass buttons with emerald glow + progress ring (on the up button)
 * - Smooth cubic-eased scrolling
 * - Bottom-left (stacked vertically) — never collides with chat FAB
 * - Smaller on mobile
 * - Only loaded on index.html and reciters/reciter.html
 */
(function () {
  'use strict';

  var SHOW_AFTER = 400;
  var upBtn = null, downBtn = null;
  var upVisible = false, downVisible = false;

  function createButtons() {
    // === SCROLL TO TOP ===
    upBtn = document.createElement('button');
    upBtn.className = 'baca-scroll-top';
    upBtn.type = 'button';
    upBtn.setAttribute('aria-label', 'Scroll to top');
    upBtn.setAttribute('title', 'Back to top');
    upBtn.innerHTML =
      '<span class="baca-scroll-top-ring"></span>' +
      '<span class="baca-scroll-top-glow"></span>' +
      '<svg class="baca-scroll-top-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 19V5"/>' +
        '<path d="m5 12 7-7 7 7"/>' +
      '</svg>';

    // === SCROLL TO BOTTOM ===
    downBtn = document.createElement('button');
    downBtn.className = 'baca-scroll-bottom';
    downBtn.type = 'button';
    downBtn.setAttribute('aria-label', 'Scroll to bottom');
    downBtn.setAttribute('title', 'Jump to bottom');
    downBtn.innerHTML =
      '<span class="baca-scroll-bottom-glow"></span>' +
      '<svg class="baca-scroll-bottom-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 5v14"/>' +
        '<path d="m19 12-7 7-7-7"/>' +
      '</svg>';

    document.body.appendChild(upBtn);
    document.body.appendChild(downBtn);

    // Scroll to top
    upBtn.addEventListener('click', function () {
      var startY = window.scrollY;
      if (startY === 0) return;
      var startTime = performance.now();
      var duration = Math.min(600, Math.max(350, startY / 3));
      function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
      function step(now) {
        var progress = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY * (1 - ease(progress)));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    // Scroll to bottom
    downBtn.addEventListener('click', function () {
      var targetY = document.documentElement.scrollHeight - window.innerHeight;
      var startY = window.scrollY;
      if (startY >= targetY - 5) return;
      var startTime = performance.now();
      var distance = targetY - startY;
      var duration = Math.min(600, Math.max(350, distance / 3));
      function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
      function step(now) {
        var progress = Math.min((now - startTime) / duration, 1);
        window.scrollTo(0, startY + distance * ease(progress));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    // Inject CSS (only once)
    if (!document.getElementById('baca-scroll-top-css')) {
      var css = document.createElement('style');
      css.id = 'baca-scroll-top-css';
      css.textContent = `
        /* === SCROLL TO TOP === */
        .baca-scroll-top {
          position: fixed; bottom: 1.5rem; left: 1.5rem;
          width: 48px; height: 48px; border-radius: 50%; border: none;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          color: #34d399; cursor: pointer; display: grid; place-items: center;
          opacity: 0; pointer-events: none;
          transform: translateY(16px) scale(0.7);
          transition: opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s ease, background 0.3s ease;
          z-index: 3000;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(52, 211, 153, 0.15) inset,
                      0 0 20px rgba(16, 185, 129, 0.15);
          -webkit-tap-highlight-color: transparent; isolation: isolate;
        }
        .baca-scroll-top.visible { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
        .baca-scroll-top-glow {
          position: absolute; inset: -8px; border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
          opacity: 0.6; transition: opacity 0.3s ease; z-index: -1; pointer-events: none;
        }
        .baca-scroll-top:hover .baca-scroll-top-glow { opacity: 1; }
        .baca-scroll-top-ring {
          position: absolute; inset: 0; border-radius: 50%;
          background: conic-gradient(from -90deg, #10b981 0%, #34d399 calc(var(--scroll-pct, 0) * 1%),
                      rgba(255, 255, 255, 0.08) calc(var(--scroll-pct, 0) * 1%), rgba(255, 255, 255, 0.08) 100%);
          -webkit-mask: radial-gradient(circle, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px));
          mask: radial-gradient(circle, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px));
          opacity: 0; transition: opacity 0.3s ease 0.1s; z-index: 0;
        }
        .baca-scroll-top.visible .baca-scroll-top-ring { opacity: 1; }
        .baca-scroll-top-icon {
          position: relative; width: 20px; height: 20px; display: block; z-index: 1;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }
        .baca-scroll-top:hover {
          background: rgba(15, 23, 42, 0.95);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(52, 211, 153, 0.3) inset, 0 0 28px rgba(16, 185, 129, 0.3);
          transform: translateY(-3px) scale(1.06);
        }
        .baca-scroll-top:hover .baca-scroll-top-icon { transform: translateY(-2px); }
        .baca-scroll-top:active { transform: translateY(-1px) scale(0.96); transition-duration: 0.1s; }

        /* === SCROLL TO BOTTOM === */
        .baca-scroll-bottom {
          position: fixed; bottom: calc(1.5rem + 56px); left: 1.5rem;
          width: 48px; height: 48px; border-radius: 50%; border: none;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
          color: #06b6d4; cursor: pointer; display: grid; place-items: center;
          opacity: 0; pointer-events: none;
          transform: translateY(16px) scale(0.7);
          transition: opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s ease, background 0.3s ease;
          z-index: 3000;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3),
                      0 0 0 1px rgba(6, 182, 212, 0.15) inset,
                      0 0 20px rgba(6, 182, 212, 0.15);
          -webkit-tap-highlight-color: transparent; isolation: isolate;
        }
        .baca-scroll-bottom.visible { opacity: 1; pointer-events: auto; transform: translateY(0) scale(1); }
        .baca-scroll-bottom-glow {
          position: absolute; inset: -8px; border-radius: 50%;
          background: radial-gradient(circle, rgba(6, 182, 212, 0.25) 0%, transparent 70%);
          opacity: 0.6; transition: opacity 0.3s ease; z-index: -1; pointer-events: none;
        }
        .baca-scroll-bottom:hover .baca-scroll-bottom-glow { opacity: 1; }
        .baca-scroll-bottom-icon {
          position: relative; width: 20px; height: 20px; display: block; z-index: 1;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }
        .baca-scroll-bottom:hover {
          background: rgba(15, 23, 42, 0.95);
          box-shadow: 0 8px 28px rgba(0, 0, 0, 0.4),
                      0 0 0 1px rgba(6, 182, 212, 0.3) inset, 0 0 28px rgba(6, 182, 212, 0.3);
          transform: translateY(-3px) scale(1.06);
        }
        .baca-scroll-bottom:hover .baca-scroll-bottom-icon { transform: translateY(2px); }
        .baca-scroll-bottom:active { transform: translateY(-1px) scale(0.96); transition-duration: 0.1s; }

        /* Light mode */
        body.light-mode .baca-scroll-top, body.light-mode .baca-scroll-bottom {
          background: rgba(255, 255, 255, 0.85);
        }
        body.light-mode .baca-scroll-top { color: #059669; }
        body.light-mode .baca-scroll-bottom { color: #0891b2; }
        [data-mushaf-theme="light"] .baca-scroll-top, [data-mushaf-theme="light"] .baca-scroll-bottom {
          background: rgba(255, 255, 255, 0.85);
        }

        /* Mobile — smaller */
        @media (max-width: 768px) {
          .baca-scroll-top { bottom: calc(68px + env(safe-area-inset-bottom, 0px)); left: 0.75rem; width: 38px; height: 38px; }
          .baca-scroll-top-icon { width: 16px; height: 16px; }
          .baca-scroll-top-glow { inset: -6px; }
          .baca-scroll-bottom { bottom: calc(68px + env(safe-area-inset-bottom, 0px) + 46px); left: 0.75rem; width: 38px; height: 38px; }
          .baca-scroll-bottom-icon { width: 16px; height: 16px; }
          .baca-scroll-bottom-glow { inset: -6px; }
        }
        /* Mobile browser (NOT standalone) — lower position */
        @media (max-width: 768px) {
          @media not all and (display-mode: standalone) {
            .baca-scroll-top { bottom: 1rem; }
            .baca-scroll-bottom { bottom: calc(1rem + 46px); }
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .baca-scroll-top, .baca-scroll-bottom { transition: opacity 0.2s ease; }
        }
      `;
      document.head.appendChild(css);
    }
  }

  function update() {
    var scrollY = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0;
    var nearBottom = scrollY >= docHeight - 50;
    var nearTop = scrollY < SHOW_AFTER;

    if (!upBtn) createButtons();

    // Show/hide scroll-to-top (hide when near top)
    if (!nearTop && !upVisible) {
      upBtn.classList.add('visible');
      upVisible = true;
    } else if (nearTop && upVisible) {
      upBtn.classList.remove('visible');
      upVisible = false;
    }

    // Show/hide scroll-to-bottom (hide when near bottom)
    if (!nearBottom && !downVisible && scrollY > 50) {
      downBtn.classList.add('visible');
      downVisible = true;
    } else if ((nearBottom || scrollY <= 50) && downVisible) {
      downBtn.classList.remove('visible');
      downVisible = false;
    }

    // Update progress ring
    upBtn.style.setProperty('--scroll-pct', pct.toFixed(0));
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  // === Hide when a modal is open ===
  // The word-modal (z-index 5000) and search-modal (z-index 4000) are above
  // the scroll buttons (z-index 3000). But we also hide them visually so
  // they don't peek through the backdrop blur.
  function checkModalOpen() {
    var wordModal = document.getElementById('word-modal-overlay');
    var searchModal = document.getElementById('search-modal');
    var modalOpen = false;
    if (wordModal && !wordModal.hidden) modalOpen = true;
    if (searchModal && searchModal.classList.contains('open')) modalOpen = true;
    // Also check for any element with [aria-modal="true"] that's visible
    document.querySelectorAll('[aria-modal="true"]').forEach(function (el) {
      if (el.offsetParent !== null || getComputedStyle(el).display !== 'none') {
        if (!el.hasAttribute('hidden')) modalOpen = true;
      }
    });
    if (modalOpen) {
      if (upBtn) upBtn.style.display = 'none';
      if (downBtn) downBtn.style.display = 'none';
    } else {
      if (upBtn) upBtn.style.display = '';
      if (downBtn) downBtn.style.display = '';
    }
  }

  // Check on scroll and also periodically (for modal open/close)
  window.addEventListener('scroll', checkModalOpen, { passive: true });
  setInterval(checkModalOpen, 500);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }
})();

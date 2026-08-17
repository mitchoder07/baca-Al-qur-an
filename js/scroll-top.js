/* scroll-top.js — Professional scroll-to-top button for Baca (v2 redesign)
 *
 * Design philosophy:
 * - Frosted-glass circular button with a soft emerald glow
 * - SVG arrow icon with rounded line caps (matches Lucide style used elsewhere)
 * - Conic-gradient progress ring around the button shows scroll position
 * - Appears with a spring-like scale+fade after 400px
 * - Smooth eased scroll-to-top (cubic ease, ~500ms)
 * - Hover: button lifts, glow intensifies, icon shifts up slightly
 * - Active: subtle press feedback
 * - Bottom-LEFT to avoid collision with chat FAB (bottom-right)
 * - Sits above the mobile tab bar when in standalone mode
 * - Hidden in standalone mode if the page has its own scroll container
 *   (e.g. mushaf reader — the reader has its own scroll-to-top)
 */
(function () {
  'use strict';

  var SHOW_AFTER = 400;
  var btn = null;
  var visible = false;

  function createButton() {
    btn = document.createElement('button');
    btn.className = 'baca-scroll-top';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Scroll to top');
    btn.setAttribute('title', 'Back to top');

    // SVG arrow-up icon (Lucide-style — rounded caps, 2px stroke)
    btn.innerHTML =
      '<span class="baca-scroll-top-ring"></span>' +
      '<span class="baca-scroll-top-glow"></span>' +
      '<svg class="baca-scroll-top-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">' +
        '<path d="M12 19V5"/>' +
        '<path d="m5 12 7-7 7 7"/>' +
      '</svg>';

    document.body.appendChild(btn);

    btn.addEventListener('click', function () {
      // Smooth scroll with cubic ease
      var startY = window.scrollY;
      if (startY === 0) return;
      var startTime = performance.now();
      var duration = Math.min(600, Math.max(350, startY / 3));

      function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

      function step(now) {
        var elapsed = now - startTime;
        var progress = Math.min(elapsed / duration, 1);
        var eased = ease(progress);
        window.scrollTo(0, startY * (1 - eased));
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });

    // Inject CSS (only once)
    if (!document.getElementById('baca-scroll-top-css')) {
      var css = document.createElement('style');
      css.id = 'baca-scroll-top-css';
      css.textContent = `
        .baca-scroll-top {
          position: fixed;
          bottom: 1.5rem;
          left: 1.5rem;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: none;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          color: #34d399;
          cursor: pointer;
          display: grid;
          place-items: center;
          opacity: 0;
          pointer-events: none;
          transform: translateY(16px) scale(0.7);
          transition: opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.3s ease,
                      background 0.3s ease;
          z-index: 9998;
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(52, 211, 153, 0.15) inset,
            0 0 20px rgba(16, 185, 129, 0.15);
          -webkit-tap-highlight-color: transparent;
          isolation: isolate;
        }

        .baca-scroll-top.visible {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0) scale(1);
        }

        /* Soft glow layer (behind everything) */
        .baca-scroll-top-glow {
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%);
          opacity: 0.6;
          transition: opacity 0.3s ease;
          z-index: -1;
          pointer-events: none;
        }

        .baca-scroll-top:hover .baca-scroll-top-glow {
          opacity: 1;
        }

        /* Progress ring (conic gradient, masked to a ring) */
        .baca-scroll-top-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: conic-gradient(
            from -90deg,
            #10b981 0%,
            #34d399 calc(var(--scroll-pct, 0) * 1%),
            rgba(255, 255, 255, 0.08) calc(var(--scroll-pct, 0) * 1%),
            rgba(255, 255, 255, 0.08) 100%
          );
          -webkit-mask: radial-gradient(circle, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px));
          mask: radial-gradient(circle, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px));
          opacity: 0;
          transition: opacity 0.3s ease 0.1s;
          z-index: 0;
        }

        .baca-scroll-top.visible .baca-scroll-top-ring {
          opacity: 1;
        }

        /* Arrow icon (centered, above ring) */
        .baca-scroll-top-icon {
          position: relative;
          width: 20px;
          height: 20px;
          display: block;
          z-index: 1;
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
        }

        /* Hover: lift + intensify glow + shift icon up */
        .baca-scroll-top:hover {
          background: rgba(15, 23, 42, 0.95);
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.4),
            0 0 0 1px rgba(52, 211, 153, 0.3) inset,
            0 0 28px rgba(16, 185, 129, 0.3);
          transform: translateY(-3px) scale(1.06);
        }

        .baca-scroll-top:hover .baca-scroll-top-icon {
          transform: translateY(-2px);
        }

        /* Active: press feedback */
        .baca-scroll-top:active {
          transform: translateY(-1px) scale(0.96);
          transition-duration: 0.1s;
        }

        /* Light mode */
        body.light-mode .baca-scroll-top {
          background: rgba(255, 255, 255, 0.85);
          color: #059669;
          box-shadow:
            0 4px 16px rgba(0, 0, 0, 0.12),
            0 0 0 1px rgba(16, 185, 129, 0.2) inset,
            0 0 20px rgba(16, 185, 129, 0.12);
        }

        body.light-mode .baca-scroll-top:hover {
          background: rgba(255, 255, 255, 0.95);
          box-shadow:
            0 8px 28px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(16, 185, 129, 0.35) inset,
            0 0 28px rgba(16, 185, 129, 0.25);
        }

        body.light-mode .baca-scroll-top-ring {
          -webkit-mask: radial-gradient(circle, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px));
          mask: radial-gradient(circle, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px));
        }

        /* Mushaf light theme */
        [data-mushaf-theme="light"] .baca-scroll-top {
          background: rgba(255, 255, 255, 0.85);
          color: #059669;
        }

        /* Mobile — smaller button, sit above the tab bar (standalone) or bottom-left (browser) */
        @media (max-width: 768px) {
          .baca-scroll-top {
            bottom: calc(68px + env(safe-area-inset-bottom, 0px));
            left: 0.75rem;
            width: 38px;
            height: 38px;
          }
          .baca-scroll-top-icon {
            width: 16px;
            height: 16px;
          }
          .baca-scroll-top-glow {
            inset: -6px;
          }
        }

        /* In mobile browser (NOT standalone), the hamburger drawer is used
           instead of the tab bar, so the button can sit lower */
        @media (max-width: 768px) {
          @media not all and (display-mode: standalone) {
            .baca-scroll-top {
              bottom: 1rem;
            }
          }
        }

        /* Respect reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .baca-scroll-top {
            transition: opacity 0.2s ease;
          }
          .baca-scroll-top:hover .baca-scroll-top-icon {
            transform: none;
          }
        }
      `;
      document.head.appendChild(css);
    }
  }

  function update() {
    var scrollY = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? Math.min(100, (scrollY / docHeight) * 100) : 0;

    if (!btn) createButton();

    if (scrollY > SHOW_AFTER && !visible) {
      btn.classList.add('visible');
      visible = true;
    } else if (scrollY <= SHOW_AFTER && visible) {
      btn.classList.remove('visible');
      visible = false;
    }

    btn.style.setProperty('--scroll-pct', pct.toFixed(0));
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) {
      requestAnimationFrame(function () { update(); ticking = false; });
      ticking = true;
    }
  }, { passive: true });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', update);
  } else {
    update();
  }
})();

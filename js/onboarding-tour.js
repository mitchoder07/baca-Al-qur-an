/* onboarding-tour.js - Tour engine for Baca
 *
 * v26 rewrite: supports both web app and mobile app. The engine:
 *   1. Auto-detects standalone mode (mobile app) vs browser (web app)
 *   2. Loads the correct step list (HOME_STEPS, MOBILE_STEPS, or MUSHAF_STEPS)
 *      based on the current page
 *   3. Builds an overlay with a darkened backdrop and a cutout highlight on
 *      the current target
 *   4. Renders a tooltip card with title, body, prev / next / skip buttons,
 *      and a step counter (e.g. "Step 5 of 22")
 *   5. Skips steps where the target is not in the DOM and skipIfMissing=true
 *   6. Saves completion to localStorage so the tour does not auto-play again
 *
 * To start the tour manually (e.g. from the footer "Replay Tour" link):
 *   BacaTour.start('home');   // web app home page tour
 *   BacaTour.start('mobile'); // mobile app home page tour (auto-detected)
 *   BacaTour.start('mushaf'); // mushaf page tour
 *
 * To reset the "seen" flag (so it auto-plays again next visit):
 *   BacaTour.reset();
 *
 * The engine is page-agnostic. Pages load their own step files:
 *   - index.html loads onboarding-tour-steps-home.js + onboarding-tour-steps-mobile.js
 *   - mushaf.html loads onboarding-tour-steps-mushaf.js
 * Both pages also load onboarding-tour.js (this file).
 *
 * Auto-play logic: on first load of index.html or mushaf.html, if the
 * corresponding localStorage key is not set, the tour auto-plays after a
 * 800ms delay (so the page settles first).
 */

(function () {
  'use strict';

  var STORAGE_KEYS = {
    home: 'baca:tour:home:seen',
    mobile: 'baca:tour:mobile:seen',
    mushaf: 'baca:tour:mushaf:seen',
  };

  var state = {
    list: [],       // active step list
    index: 0,       // current step index
    name: null,     // 'home' | 'mobile' | 'mushaf'
    overlayEl: null,
    tooltipEl: null,
    highlightEl: null,
  };

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
      || document.referrer.indexOf('android-app://') === 0;
  }

  function isMushafPage() {
    return /mushaf\.html/.test(window.location.pathname)
      || document.body.hasAttribute('data-mushaf-theme');
  }

  function pickTourName() {
    if (isMushafPage()) return 'mushaf';
    return isStandalone() ? 'mobile' : 'home';
  }

  function getSteps(name) {
    if (name === 'mushaf') return (window.BacaTour && window.BacaTour.MUSHAF_STEPS) || [];
    if (name === 'mobile') return (window.BacaTour && window.BacaTour.MOBILE_STEPS) || [];
    return (window.BacaTour && window.BacaTour.HOME_STEPS) || [];
  }

  // Inject the CSS once
  function injectCSS() {
    if (document.getElementById('baca-tour-css')) return;
    var css = document.createElement('style');
    css.id = 'baca-tour-css';
    css.textContent = [
      '.baca-tour-overlay {',
      '  position: fixed; inset: 0; z-index: 99998;',
      '  background: rgba(0, 0, 0, 0.55);',
      '  backdrop-filter: blur(2px);',
      '  -webkit-backdrop-filter: blur(2px);',
      '  opacity: 0;',
      '  pointer-events: none;',            /* CRITICAL: invisible overlay must not block clicks */
      '  transition: opacity 0.2s ease;',
      '  display: block;',
      '}',
      '.baca-tour-overlay.open {',
      '  opacity: 1;',
      '  pointer-events: auto;',            /* only block clicks while tour is active */
      '}',
      '.baca-tour-highlight {',
      '  position: absolute; border: 2px solid #10b981; border-radius: 8px;',
      '  box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.55);',
      '  pointer-events: none; transition: all 0.25s ease;',
      '  z-index: 99999;',
      '  display: none;',                   /* hidden by default; shown only when positioning */
      '}',
      '.baca-tour-tooltip {',
      '  position: absolute; z-index: 100000;',
      '  max-width: 360px; min-width: 260px;',
      '  background: #0f172a; color: #f1f5f9;',
      '  border: 1px solid rgba(16, 185, 129, 0.4);',
      '  border-radius: 14px; padding: 1rem 1.1rem 0.9rem;',
      '  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);',
      '  font-family: -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif;',
      '  transition: all 0.25s ease;',
      '  display: none;',                   /* hidden by default; engine shows it on renderStep */
      '}',
      '.baca-tour-tooltip h3 {',
      '  font-size: 1rem; font-weight: 700; color: #34d399;',
      '  margin: 0 0 0.45rem; line-height: 1.3;',
      '  padding-right: 1.8rem;',                   /* leave room for the close X */
      '}',
      '.baca-tour-tooltip p {',
      '  font-size: 0.85rem; line-height: 1.55; color: #cbd5e1;',
      '  margin: 0 0 0.9rem;',
      '}',
      '.baca-tour-tooltip-close {',
      '  position: absolute; top: 8px; right: 8px;',
      '  width: 28px; height: 28px; border-radius: 50%;',
      '  background: transparent; border: none; cursor: pointer;',
      '  color: #94a3b8; font-size: 1.1rem; line-height: 1;',
      '  display: inline-flex; align-items: center; justify-content: center;',
      '  transition: all 0.15s ease; padding: 0;',
      '}',
      '.baca-tour-tooltip-close:hover {',
      '  background: rgba(255, 255, 255, 0.08);',
      '  color: #e2e8f0;',
      '}',
      '.baca-tour-tooltip-actions {',
      '  display: flex; align-items: center; justify-content: space-between;',
      '  gap: 0.5rem; flex-wrap: wrap;',
      '}',
      '.baca-tour-tooltip-counter {',
      '  font-size: 0.75rem; color: #64748b; font-weight: 600;',
      '}',
      '.baca-tour-tooltip-buttons { display: flex; gap: 0.4rem; align-items: center; }',
      '.baca-tour-tooltip button {',
      '  font-family: inherit; font-size: 0.8rem; font-weight: 600;',
      '  padding: 6px 12px; border-radius: 8px; cursor: pointer;',
      '  border: 1px solid rgba(255, 255, 255, 0.12);',
      '  background: rgba(255, 255, 255, 0.04); color: #e2e8f0;',
      '  transition: all 0.15s ease;',
      '}',
      '.baca-tour-tooltip button:hover {',
      '  background: rgba(16, 185, 129, 0.15);',
      '  border-color: rgba(16, 185, 129, 0.5);',
      '}',
      '.baca-tour-tooltip button.primary {',
      '  background: rgba(16, 185, 129, 0.25); color: #10b981;',
      '  border-color: rgba(16, 185, 129, 0.5);',
      '}',
      '.baca-tour-tooltip button.primary:hover {',
      '  background: rgba(16, 185, 129, 0.4);',
      '}',
      '.baca-tour-tooltip button.skip-btn {',
      '  color: #94a3b8;',
      '  background: transparent;',
      '  border-color: transparent;',
      '  padding: 6px 8px;',
      '}',
      '.baca-tour-tooltip button.skip-btn:hover {',
      '  color: #e2e8f0;',
      '  background: rgba(255, 255, 255, 0.06);',
      '  border-color: rgba(255, 255, 255, 0.08);',
      '}',
      '@media (max-width: 480px) {',
      '  .baca-tour-tooltip { max-width: calc(100vw - 2rem); }',
      '}',
    ].join('\n');
    document.head.appendChild(css);
  }

  function ensureDOM() {
    if (state.overlayEl) return;
    injectCSS();

    var overlay = document.createElement('div');
    overlay.className = 'baca-tour-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        // tap outside the tooltip = next step (gentler than dismissing)
        next();
      }
    });
    document.body.appendChild(overlay);
    state.overlayEl = overlay;

    var highlight = document.createElement('div');
    highlight.className = 'baca-tour-highlight';
    highlight.style.display = 'none';
    document.body.appendChild(highlight);
    state.highlightEl = highlight;

    var tooltip = document.createElement('div');
    tooltip.className = 'baca-tour-tooltip';
    tooltip.style.display = 'none';
    document.body.appendChild(tooltip);
    state.tooltipEl = tooltip;
  }

  function scrollToTarget(el) {
    if (!el || el === document.body) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    var rect = el.getBoundingClientRect();
    var viewportH = window.innerHeight;
    // If element is not fully visible, scroll it gently into the centre
    if (rect.top < 60 || rect.bottom > viewportH - 60) {
      var targetY = window.scrollY + rect.top + rect.height / 2 - viewportH / 2;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });
    }
  }

  function positionTooltip(targetRect, placement) {
    var tip = state.tooltipEl;
    var tipRect = tip.getBoundingClientRect();
    var margin = 12;
    var top, left;

    // For 'center' placement, center the tooltip on the viewport
    if (placement === 'center' || !targetRect || targetRect.width === 0) {
      top = (window.innerHeight - tipRect.height) / 2;
      left = (window.innerWidth - tipRect.width) / 2;
      tip.style.top = Math.max(margin, top) + 'px';
      tip.style.left = Math.max(margin, left) + 'px';
      return;
    }

    switch (placement) {
      case 'top':
        top = targetRect.top - tipRect.height - margin;
        left = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tipRect.height / 2;
        left = targetRect.left - tipRect.width - margin;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tipRect.height / 2;
        left = targetRect.right + margin;
        break;
      default:
        top = targetRect.bottom + margin;
        left = targetRect.left + targetRect.width / 2 - tipRect.width / 2;
    }

    // Clamp inside viewport
    top = Math.max(margin, Math.min(top, window.innerHeight - tipRect.height - margin));
    left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));

    // Convert to absolute (page) coordinates since tooltip is position:absolute
    tip.style.top = (top + window.scrollY) + 'px';
    tip.style.left = (left + window.scrollX) + 'px';
  }

  function positionHighlight(targetRect) {
    var hl = state.highlightEl;
    if (!targetRect || targetRect.width === 0) {
      hl.style.display = 'none';
      return;
    }
    hl.style.display = 'block';
    var pad = 4;
    hl.style.top = (targetRect.top + window.scrollY - pad) + 'px';
    hl.style.left = (targetRect.left + window.scrollX - pad) + 'px';
    hl.style.width = (targetRect.width + pad * 2) + 'px';
    hl.style.height = (targetRect.height + pad * 2) + 'px';
  }

  function renderStep() {
    var step = state.list[state.index];
    if (!step) return endTour();

    var target = null;
    if (step.target && step.target !== 'body') {
      target = document.querySelector(step.target);
    } else {
      target = document.body;
    }

    // Auto-skip if missing
    if (!target && step.skipIfMissing) {
      state.index++;
      return renderStep();
    }
    if (!target) target = document.body; // safe fallback

    scrollToTarget(target);

    // Need to wait one frame for the scroll to settle before measuring
    requestAnimationFrame(function () {
      var rect = target === document.body
        ? { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, bottom: window.innerHeight, right: window.innerWidth }
        : target.getBoundingClientRect();

      positionHighlight(rect === target.getBoundingClientRect() ? target.getBoundingClientRect() : rect);

      var tip = state.tooltipEl;
      // Close X button is always visible at top-right, in addition to the Skip text button
      tip.innerHTML =
        '<button class="baca-tour-tooltip-close" data-action="skip" aria-label="Close tour" title="Close tour">&times;</button>' +
        '<h3>' + escapeHtml(step.title) + '</h3>' +
        '<p>' + escapeHtml(step.body) + '</p>' +
        '<div class="baca-tour-tooltip-actions">' +
          '<span class="baca-tour-tooltip-counter">Step ' + (state.index + 1) + ' of ' + state.list.length + '</span>' +
          '<div class="baca-tour-tooltip-buttons">' +
            (state.index > 0 ? '<button data-action="prev">Back</button>' : '') +
            '<button class="skip-btn" data-action="skip">Skip tour</button>' +
            '<button class="primary" data-action="' + (state.index === state.list.length - 1 ? 'finish' : 'next') + '">' +
              (state.index === state.list.length - 1 ? 'Finish' : 'Next') +
            '</button>' +
          '</div>' +
        '</div>';
      tip.style.display = 'block';

      // Re-measure after content set
      requestAnimationFrame(function () {
        // Re-measure rect (in case scroll moved it)
        if (target !== document.body) {
          rect = target.getBoundingClientRect();
          positionHighlight(rect);
        }
        positionTooltip(rect, step.placement);
      });
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function next() {
    state.index++;
    if (state.index >= state.list.length) return endTour();
    renderStep();
  }

  function prev() {
    state.index--;
    if (state.index < 0) state.index = 0;
    renderStep();
  }

  function skip() {
    endTour();
  }

  function endTour() {
    if (state.tooltipEl) {
      state.tooltipEl.style.display = 'none';
      state.tooltipEl.innerHTML = ''; // release listeners / dereference DOM
    }
    if (state.highlightEl) state.highlightEl.style.display = 'none';
    if (state.overlayEl) {
      state.overlayEl.classList.remove('open'); // CSS sets opacity:0 + pointer-events:none
    }
    // Defensive: clear any scroll/resize rAF that was scheduled mid-render
    if (state._scrollRaf) {
      cancelAnimationFrame(state._scrollRaf);
      state._scrollRaf = null;
    }
    // Restore body scroll if we had locked it (we currently don't, but future-proof)
    document.body.style.overflow = '';
    // Mark as seen
    if (state.name && STORAGE_KEYS[state.name]) {
      try { localStorage.setItem(STORAGE_KEYS[state.name], '1'); } catch (e) {}
    }
  }

  function start(name) {
    var resolvedName = name || pickTourName();
    var list = getSteps(resolvedName);
    if (!list || !list.length) return;

    state.name = resolvedName;
    state.list = list;
    state.index = 0;

    ensureDOM();
    state.overlayEl.classList.add('open');

    // Wire button events once (delegate)
    if (!state.tooltipEl.dataset.wired) {
      state.tooltipEl.addEventListener('click', function (e) {
        var btn = e.target.closest('button');
        if (!btn) return;
        var action = btn.dataset.action;
        if (action === 'next') next();
        else if (action === 'prev') prev();
        else if (action === 'skip') skip();
        else if (action === 'finish') endTour();
      });
      state.tooltipEl.dataset.wired = '1';
    }

    // Keyboard navigation
    if (!state.keyboardWired) {
      document.addEventListener('keydown', function (e) {
        if (!state.overlayEl || !state.overlayEl.classList.contains('open')) return;
        if (e.key === 'Escape') skip();
        else if (e.key === 'ArrowRight' || e.key === 'Enter') next();
        else if (e.key === 'ArrowLeft') prev();
      });
      state.keyboardWired = true;
    }

    // Recompute positions on scroll/resize
    if (!state.resizeWired) {
      window.addEventListener('resize', function () {
        if (!state.overlayEl || !state.overlayEl.classList.contains('open')) return;
        renderStep();
      });
      window.addEventListener('scroll', function () {
        if (!state.overlayEl || !state.overlayEl.classList.contains('open')) return;
        // Debounce with rAF
        if (state._scrollRaf) cancelAnimationFrame(state._scrollRaf);
        state._scrollRaf = requestAnimationFrame(renderStep);
      }, { passive: true });
      state.resizeWired = true;
    }

    renderStep();
  }

  function reset() {
    Object.keys(STORAGE_KEYS).forEach(function (k) {
      try { localStorage.removeItem(STORAGE_KEYS[k]); } catch (e) {}
    });
  }

  function maybeAutoStart() {
    var name = pickTourName();
    var key = STORAGE_KEYS[name];
    if (!key) return;
    var seen;
    try { seen = localStorage.getItem(key); } catch (e) { seen = null; }
    if (seen) return; // already played

    // Wait for the page to settle
    setTimeout(function () { start(name); }, 800);
  }

  // Public API
  window.BacaTour = window.BacaTour || {};
  window.BacaTour.start = start;
  window.BacaTour.reset = reset;
  window.BacaTour.isStandalone = isStandalone;

  // Wire the footer "Replay Tour" links (delegated, so they work whether
  // the link exists at load time or is added later)
  document.addEventListener('click', function (e) {
    var t = e.target.closest('#footer-replay-tour, #replay-tour-btn, [data-action="replay-tour"]');
    if (!t) return;
    e.preventDefault();
    // Reset the seen flag for the current page so the tour can replay
    var name = pickTourName();
    try { localStorage.removeItem(STORAGE_KEYS[name]); } catch (err) {}
    start(name);
  });

  // Auto-start on first visit
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', maybeAutoStart);
  } else {
    maybeAutoStart();
  }
})();

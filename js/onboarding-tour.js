/* ============================================================
   BACA — Onboarding Tour Engine
   Spotlights key features with step-by-step tooltips on a user's
   first visit (Next / Back / Skip), then never shows again unless
   explicitly replayed. Self-contained: injects its own <style>,
   no dependencies, matches the pattern used by chat-widget.js and
   floating-player-bar.js.

   This file is the shared engine only, reused across pages. Each
   page loads its own steps config first (e.g.
   js/onboarding-tour-steps-home.js or
   js/onboarding-tour-steps-mushaf.js), which sets:
     window.BACA_ONBOARDING_STEPS         (array of step objects)
     window.BACA_ONBOARDING_STORAGE_KEY   (string, unique per page)
   before this engine script runs.
   ============================================================
   TABLE OF CONTENTS
   ------------------------------------------------------------
   1. Config — read from the page's steps file, with a safe
      fallback if one wasn't loaded
   2. Injected <style>
   3. DOM construction (overlay, spotlight, tooltip)
   4. Positioning — spotlight + tooltip placement per step
   5. Step navigation (next / back / skip / finish)
   6. Init — auto-starts for first-time visitors, exposes
      window.BacaOnboarding = { start, reset } for a manual
      "Replay Tour" trigger
   ============================================================ */

(function () {
    'use strict';

    // ============================================================
    // 1. CONFIG — provided by a page-specific steps file that must
    // load before this one. Falls back to a minimal single-step
    // tour if a page forgets to include a steps file, rather than
    // silently doing nothing or throwing.
    // ============================================================
    const STORAGE_KEY = window.BACA_ONBOARDING_STORAGE_KEY || 'bacaOnboardingComplete';
    const STEPS = (window.BACA_ONBOARDING_STEPS && window.BACA_ONBOARDING_STEPS.length)
        ? window.BACA_ONBOARDING_STEPS
        : [{ target: null, title: 'Welcome to Baca', text: 'Enjoy exploring the app.' }];

    // ============================================================
    // 2. INJECTED STYLE
    // ============================================================
    function injectStyle() {
        if (document.getElementById('baca-onboarding-style')) return;
        const style = document.createElement('style');
        style.id = 'baca-onboarding-style';
        style.textContent = `
            .baca-ob-overlay {
                position: fixed;
                inset: 0;
                z-index: 999998;
                background: rgba(2, 6, 23, 0.72);
                backdrop-filter: blur(1px);
                opacity: 0;
                transition: opacity .25s ease;
            }
            .baca-ob-overlay.active { opacity: 1; }

            .baca-ob-spotlight {
                position: fixed;
                z-index: 999999;
                border-radius: 14px;
                box-shadow: 0 0 0 4px var(--primary, #10b981), 0 0 0 9999px rgba(2, 6, 23, 0.72);
                transition: top .35s ease, left .35s ease, width .35s ease, height .35s ease, opacity .25s ease;
                pointer-events: none;
                opacity: 0;
            }
            .baca-ob-spotlight.active { opacity: 1; }
            .baca-ob-spotlight.hidden { display: none; }

            .baca-ob-card {
                position: fixed;
                z-index: 1000000;
                width: min(340px, calc(100vw - 2rem));
                background: var(--dark-light, #1e293b);
                border: 1px solid var(--border, rgba(255, 255, 255, 0.08));
                border-radius: 16px;
                padding: 1.4rem 1.5rem;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                opacity: 0;
                transform: translateY(8px);
                transition: opacity .25s ease, transform .25s ease, top .35s ease, left .35s ease;
                font-family: "Poppins", sans-serif;
            }
            .baca-ob-card.active { opacity: 1; transform: translateY(0); }

            .baca-ob-step-count {
                font-size: .75rem;
                font-weight: 600;
                letter-spacing: .04em;
                text-transform: uppercase;
                color: var(--primary, #10b981);
                margin-bottom: .5rem;
            }

            .baca-ob-title {
                font-size: 1.15rem;
                font-weight: 700;
                color: var(--white, #fff);
                margin-bottom: .5rem;
            }

            .baca-ob-text {
                font-size: .92rem;
                line-height: 1.55;
                color: var(--text, #cbd5e1);
                margin-bottom: 1.2rem;
            }

            .baca-ob-actions {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: .75rem;
            }

            .baca-ob-skip {
                background: none;
                border: none;
                color: var(--text, #94a3b8);
                font-size: .82rem;
                cursor: pointer;
                padding: .4rem 0;
                text-decoration: underline;
                text-underline-offset: 2px;
            }
            .baca-ob-skip:hover { color: var(--white, #fff); }

            .baca-ob-nav {
                display: flex;
                gap: .5rem;
            }

            .baca-ob-btn {
                border: none;
                border-radius: 999px;
                padding: .55rem 1.1rem;
                font-size: .85rem;
                font-weight: 600;
                cursor: pointer;
                font-family: inherit;
                transition: transform .15s, opacity .15s;
            }
            .baca-ob-btn:active { transform: scale(0.96); }

            .baca-ob-btn-back {
                background: rgba(255, 255, 255, 0.08);
                color: var(--white, #fff);
            }
            .baca-ob-btn-back:disabled {
                opacity: .35;
                cursor: default;
            }

            .baca-ob-btn-next {
                background: var(--primary, #10b981);
                color: #fff;
            }

            @media (max-width: 480px) {
                .baca-ob-card {
                    left: 1rem !important;
                    right: 1rem !important;
                    width: auto !important;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // ============================================================
    // 3 & 4. DOM CONSTRUCTION + POSITIONING
    // ============================================================
    let overlay, spotlight, card, currentStep = 0;

    function buildDom() {
        overlay = document.createElement('div');
        overlay.className = 'baca-ob-overlay';

        spotlight = document.createElement('div');
        spotlight.className = 'baca-ob-spotlight hidden';

        card = document.createElement('div');
        card.className = 'baca-ob-card';
        card.innerHTML = `
            <div class="baca-ob-step-count" id="baca-ob-count"></div>
            <div class="baca-ob-title" id="baca-ob-title"></div>
            <div class="baca-ob-text" id="baca-ob-text"></div>
            <div class="baca-ob-actions">
                <button class="baca-ob-skip" id="baca-ob-skip">Skip tour</button>
                <div class="baca-ob-nav">
                    <button class="baca-ob-btn baca-ob-btn-back" id="baca-ob-back">Back</button>
                    <button class="baca-ob-btn baca-ob-btn-next" id="baca-ob-next">Next</button>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(spotlight);
        document.body.appendChild(card);

        card.querySelector('#baca-ob-skip').addEventListener('click', endTour);
        card.querySelector('#baca-ob-back').addEventListener('click', () => goToStep(currentStep - 1));
        card.querySelector('#baca-ob-next').addEventListener('click', () => {
            if (currentStep === STEPS.length - 1) endTour();
            else goToStep(currentStep + 1);
        });
        // Deliberately NOT closing on overlay/backdrop click — the spotlight
        // area covers real page elements, and an accidental tap near them
        // (very easy to do since it's the visually inviting part of the
        // screen) used to kill the whole tour instantly. Skip button and
        // Escape key remain as the explicit ways out.

        document.addEventListener('keydown', onKeydown);
        window.addEventListener('resize', () => positionForStep(STEPS[currentStep], true));
    }

    function onKeydown(e) {
        if (e.key === 'Escape') endTour();
        else if (e.key === 'ArrowRight') card.querySelector('#baca-ob-next').click();
        else if (e.key === 'ArrowLeft') card.querySelector('#baca-ob-back').click();
    }

    function positionForStep(step, immediate) {
        const target = step.target ? document.querySelector(step.target) : null;

        if (!target) {
            // No target (welcome step) or target missing — center the card,
            // no spotlight, so the tour still delivers the info instead of
            // breaking outright.
            spotlight.classList.add('hidden');
            const cw = Math.min(340, window.innerWidth - 32);
            const ch = card.offsetHeight || 200;
            card.style.left = `${(window.innerWidth - cw) / 2}px`;
            card.style.top = `${Math.max(20, (window.innerHeight - ch) / 2)}px`;
            return;
        }

        const rect = target.getBoundingClientRect();
        const pad = 8;

        spotlight.classList.remove('hidden');
        spotlight.style.top = `${Math.max(0, rect.top - pad)}px`;
        spotlight.style.left = `${rect.left - pad}px`;
        spotlight.style.width = `${rect.width + pad * 2}px`;
        spotlight.style.height = `${rect.height + pad * 2}px`;

        // Prefer placing the card below the target; flip above if there's
        // not enough room; clamp horizontally so it never runs off-screen.
        // Uses the card's REAL rendered height (it already has this step's
        // text in it by the time this runs) rather than a fixed guess —
        // text length varies per step, so a fixed estimate was off by a
        // few pixels on longer steps and could push the card off-screen.
        const cardWidth = Math.min(340, window.innerWidth - 32);
        const cardHeight = card.offsetHeight || 180;
        let top = rect.bottom + pad + 12;
        if (top + cardHeight > window.innerHeight) {
            top = rect.top - pad - 12 - cardHeight;
        }
        // Unconditional safety net: whatever the above produced, never let
        // the card render above or below the actual viewport.
        top = Math.max(12, Math.min(top, window.innerHeight - cardHeight - 12));

        let left = rect.left + rect.width / 2 - cardWidth / 2;
        left = Math.max(16, Math.min(left, window.innerWidth - cardWidth - 16));

        card.style.top = `${top}px`;
        card.style.left = `${left}px`;
    }

    // ============================================================
    // 5. STEP NAVIGATION
    // ============================================================
    function goToStep(index) {
        currentStep = index;
        const step = STEPS[index];

        card.querySelector('#baca-ob-count').textContent = `Step ${index + 1} of ${STEPS.length}`;
        card.querySelector('#baca-ob-title').textContent = step.title;
        card.querySelector('#baca-ob-text').textContent = step.text;
        card.querySelector('#baca-ob-back').disabled = index === 0;
        card.querySelector('#baca-ob-next').textContent = index === STEPS.length - 1 ? 'Finish' : 'Next';

        const target = step.target ? document.querySelector(step.target) : null;
        if (target) {
            // Instant, not smooth — a smooth scroll over a long distance can
            // still be mid-animation after a fixed delay, which was causing
            // position to be measured before the page actually finished
            // moving (this is what sent the card off-screen on step 3).
            target.scrollIntoView({ behavior: 'instant', block: 'center' });
            requestAnimationFrame(() => requestAnimationFrame(() => positionForStep(step)));
        } else {
            positionForStep(step);
        }
    }

    function startTour() {
        injectStyle();
        buildDom();
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            spotlight.classList.add('active');
            card.classList.add('active');
        });
        goToStep(0);
    }

    function endTour() {
        try { localStorage.setItem(STORAGE_KEY, 'true'); } catch (e) { }
        if (!overlay) return;
        overlay.classList.remove('active');
        spotlight.classList.remove('active');
        card.classList.remove('active');
        document.removeEventListener('keydown', onKeydown);
        setTimeout(() => {
            overlay?.remove();
            spotlight?.remove();
            card?.remove();
            overlay = spotlight = card = null;
        }, 250);
    }

    // ============================================================
    // 6. INIT
    // ============================================================
    let alreadySeen;
    try { alreadySeen = localStorage.getItem(STORAGE_KEY) === 'true'; }
    catch (e) { alreadySeen = false; }

    if (!alreadySeen) {
        // Small delay so the page has fully settled (fonts, layout,
        // any late-injected elements like the hamburger/chat FAB) before
        // the tour starts measuring positions.
        setTimeout(startTour, 900);
    }

    // Exposed for a "Replay Tour" link/button, and reusable if other
    // pages want their own step lists later.
    window.BacaOnboarding = {
        start: startTour,
        reset: function () {
            try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
        }
    };
})();

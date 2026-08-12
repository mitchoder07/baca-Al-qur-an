/* ============================================================
   BACA — Logo Info Trigger
   Adds a small "?" button right next to the site logo. Clicking it
   opens Baca AI and asks what the name "Baca" means, without
   changing the logo's own click behavior (which still navigates
   home as expected). Only does anything on pages where
   chat-widget.js has already added its FAB + panel.
   ============================================================ */

(function () {
    'use strict';

    function init() {
        const logo = document.querySelector('.logo, .topbar-logo');
        const fab = document.querySelector('.baca-chat-fab');
        if (!logo || !fab) return; // this page has no chat widget, nothing to wire up
        if (document.getElementById('baca-logo-info-btn')) return; // already added

        const btn = document.createElement('button');
        btn.id = 'baca-logo-info-btn';
        btn.type = 'button';
        btn.title = 'What does "Baca" mean?';
        btn.setAttribute('aria-label', 'What does the name Baca mean?');
        btn.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
        btn.style.cssText = [
            'display:inline-flex', 'align-items:center', 'justify-content:center',
            'width:20px', 'height:20px', 'margin-left:6px', 'border:none',
            'border-radius:50%', 'background:rgba(16,185,129,0.15)', 'color:var(--primary,#10b981)',
            'font-size:0.65rem', 'cursor:pointer', 'vertical-align:middle', 'flex-shrink:0',
            'transition:background 0.2s, transform 0.15s'
        ].join(';');
        btn.onmouseenter = () => { btn.style.background = 'var(--primary, #10b981)'; btn.style.color = '#fff'; };
        btn.onmouseleave = () => { btn.style.background = 'rgba(16,185,129,0.15)'; btn.style.color = 'var(--primary, #10b981)'; };

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const panel = document.querySelector('.baca-chat-panel');
            if (panel && !panel.classList.contains('open')) {
                fab.click(); // reuses chat-widget.js's own open logic
            }
            setTimeout(() => {
                if (window.bacaChatSend) {
                    window.bacaChatSend('What does the name "Baca" mean?');
                }
            }, 250);
        });

        // Insert right after the logo link, inside its parent, not inside
        // the <a> itself, so it isn't swallowed by the logo's own href.
        logo.insertAdjacentElement('afterend', btn);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

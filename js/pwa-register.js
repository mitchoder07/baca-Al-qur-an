/* pwa-register.js — Registers SW, handles install prompt (banner + footer link)
 *
 * Exposes window.BacaInstall.trigger() so the footer "Install App" link can
 * programmatically trigger the install prompt even after the banner was dismissed.
 */
(function () {
  'use strict';

  // === 1. Register the service worker ===
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('/sw.js').then(function (reg) {
        setInterval(function () { reg.update().catch(function () {}); }, 5 * 60 * 1000);
        var refreshing = false;
        navigator.serviceWorker.addEventListener('controllerchange', function () {
          if (!refreshing) { refreshing = true; window.location.reload(); }
        });
      }).catch(function (err) { console.warn('[PWA] SW registration failed:', err); });
    });
  }

  // === 2. Install prompt handling ===
  var deferredPrompt = null;
  var installBanner = null;

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (isStandalone()) return;
    // Show the banner after a short delay (unless dismissed recently)
    var dismissed = localStorage.getItem('baca-install-dismissed');
    if (dismissed) {
      var daysSince = (Date.now() - new Date(dismissed).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) return;
    }
    setTimeout(showInstallBanner, 2500);
    // Show the footer "Install App" link (if it was hidden because no prompt was available)
    showFooterInstallLinks();
  });

  function isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true ||
      document.referrer.includes('android-app://');
  }

  // Trigger the install prompt programmatically (called by footer link)
  async function triggerInstall() {
    if (!deferredPrompt) {
      // No prompt available — show instructions
      showInstallInstructions();
      return;
    }
    deferredPrompt.prompt();
    var choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      hideInstallBanner();
    }
    deferredPrompt = null;
    // Hide footer links after install (the app is now installed)
    if (isStandalone()) hideFooterInstallLinks();
  }

  // Expose the trigger globally so the footer link can call it
  window.BacaInstall = { trigger: triggerInstall };

  function showInstallBanner() {
    if (!deferredPrompt || installBanner) return;
    installBanner = document.createElement('div');
    installBanner.id = 'baca-install-banner';
    installBanner.innerHTML =
      '<div class="baca-install-banner-inner">' +
        '<div class="baca-install-banner-icon">' +
          '<img src="/images/baca-logo.webp" alt="Baca" style="width:32px;height:32px">' +
        '</div>' +
        '<div class="baca-install-banner-text">' +
          '<strong>Install Baca</strong>' +
          '<span>Read the Qur\'an anytime — even offline</span>' +
        '</div>' +
        '<button class="baca-install-banner-btn" type="button">Install</button>' +
        '<button class="baca-install-banner-close" type="button" aria-label="Dismiss">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>';
    document.body.insertBefore(installBanner, document.body.firstChild);
    requestAnimationFrame(function () { installBanner.classList.add('baca-install-banner-visible'); });
    installBanner.querySelector('.baca-install-banner-btn').addEventListener('click', triggerInstall);
    installBanner.querySelector('.baca-install-banner-close').addEventListener('click', function () {
      hideInstallBanner();
      localStorage.setItem('baca-install-dismissed', new Date().toISOString());
    });
  }

  function hideInstallBanner() {
    if (!installBanner) return;
    installBanner.classList.remove('baca-install-banner-visible');
    setTimeout(function () {
      if (installBanner && installBanner.parentNode) installBanner.parentNode.removeChild(installBanner);
      installBanner = null;
    }, 300);
  }

  // Show instructions when no prompt is available (e.g. iOS Safari, or already installed)
  function showInstallInstructions() {
    var isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    var modal = document.createElement('div');
    modal.className = 'baca-install-modal';
    modal.innerHTML =
      '<div class="baca-install-modal-overlay"></div>' +
      '<div class="baca-install-modal-card">' +
        '<button class="baca-install-modal-close" aria-label="Close">&times;</button>' +
        '<img src="/images/baca-logo.webp" alt="Baca" style="width:72px;height:72px;margin:0 auto 12px;display:block">' +
        '<h3>Install Baca</h3>' +
        (isIOS ?
          '<p>Add Baca to your home screen for a full-screen, app-like experience:</p>' +
          '<ol><li>Tap the <strong>Share</strong> button in Safari</li><li>Tap <strong>Add to Home Screen</strong></li><li>Tap <strong>Add</strong></li></ol>' :
          '<p>To install Baca:</p>' +
          '<ol><li>Open the browser menu (three dots)</li><li>Tap <strong>Install app</strong> or <strong>Add to Home screen</strong></li></ol>' +
          '<p style="margin-top:8px;font-size:0.8rem;color:#94a3b8">If you don\'t see the option, try Chrome or Edge.</p>'
        ) +
      '</div>';
    document.body.appendChild(modal);
    requestAnimationFrame(function () { modal.classList.add('open'); });
    function close() {
      modal.classList.remove('open');
      setTimeout(function () { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 250);
    }
    modal.querySelector('.baca-install-modal-overlay').addEventListener('click', close);
    modal.querySelector('.baca-install-modal-close').addEventListener('click', close);
  }

  // Footer "Install App" link visibility
  function showFooterInstallLinks() {
    document.querySelectorAll('.baca-footer-install').forEach(function (el) {
      el.style.display = '';
    });
  }
  function hideFooterInstallLinks() {
    document.querySelectorAll('.baca-footer-install').forEach(function (el) {
      el.style.display = 'none';
    });
  }

  // Hide footer install link if already installed
  if (isStandalone()) {
    document.addEventListener('DOMContentLoaded', hideFooterInstallLinks);
  }

  // Wire up footer "Install App" links
  document.addEventListener('click', function (e) {
    var target = e.target;
    // Walk up to find the anchor (in case the click was on the <i> icon inside)
    while (target && target.tagName !== 'A') target = target.parentElement;
    if (target && target.id === 'footer-install-app') {
      e.preventDefault();
      triggerInstall();
    }
  });

  window.addEventListener('appinstalled', function () {
    hideInstallBanner();
    hideFooterInstallLinks();
    deferredPrompt = null;
  });

  // === 3. Inject the CSS ===
  var style = document.createElement('style');
  style.textContent = `
    #baca-install-banner {
      position: fixed; top: 0; left: 0; right: 0; z-index: 99999;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      border-bottom: 1px solid rgba(16, 185, 129, 0.3);
      padding: 0.75rem 1rem;
      padding-top: calc(0.75rem + env(safe-area-inset-top, 0px));
      transform: translateY(-100%);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    #baca-install-banner.baca-install-banner-visible { transform: translateY(0); }
    .baca-install-banner-inner { max-width: 600px; margin: 0 auto; display: flex; align-items: center; gap: 0.75rem; }
    .baca-install-banner-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(255, 255, 255, 0.08); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .baca-install-banner-text { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 1px; }
    .baca-install-banner-text strong { color: #f1f5f9; font-size: 0.9rem; font-weight: 600; font-family: 'Poppins', sans-serif; }
    .baca-install-banner-text span { color: #94a3b8; font-size: 0.78rem; font-family: 'Poppins', sans-serif; }
    .baca-install-banner-btn { background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; border-radius: 8px; padding: 0.5rem 1.1rem; font-size: 0.85rem; font-weight: 600; font-family: 'Poppins', sans-serif; cursor: pointer; flex-shrink: 0; transition: transform 0.15s; -webkit-tap-highlight-color: transparent; }
    .baca-install-banner-btn:active { transform: scale(0.95); }
    .baca-install-banner-close { background: rgba(255, 255, 255, 0.08); border: none; color: #94a3b8; width: 28px; height: 28px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; -webkit-tap-highlight-color: transparent; transition: background 0.15s; }
    .baca-install-banner-close:hover { background: rgba(255, 255, 255, 0.15); color: #f1f5f9; }
    body.light-mode #baca-install-banner { background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%); border-bottom-color: rgba(16, 185, 129, 0.4); box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08); }
    body.light-mode .baca-install-banner-text strong { color: #0f172a; }
    body.light-mode .baca-install-banner-text span { color: #64748b; }
    body.light-mode .baca-install-banner-close { background: rgba(0, 0, 0, 0.06); color: #64748b; }
    body.light-mode .baca-install-banner-close:hover { background: rgba(0, 0, 0, 0.1); color: #0f172a; }

    /* Install instructions modal */
    .baca-install-modal { position: fixed; inset: 0; z-index: 100001; display: flex; align-items: center; justify-content: center; padding: 1.5rem; opacity: 0; transition: opacity 0.25s; }
    .baca-install-modal.open { opacity: 1; }
    .baca-install-modal-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(4px); }
    .baca-install-modal-card { position: relative; background: #1e293b; border: 1px solid rgba(255,255,255,0.1); border-radius: 18px; padding: 24px 24px 20px; max-width: 380px; width: 100%; font-family: 'Poppins', sans-serif; color: #e2e8f0; transform: scale(0.95); transition: transform 0.25s; }
    .baca-install-modal.open .baca-install-modal-card { transform: scale(1); }
    .baca-install-modal-card h3 { font-size: 1.25rem; font-weight: 700; text-align: center; margin-bottom: 10px; background: linear-gradient(135deg, #10b981, #06b6d4, #6366f1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .baca-install-modal-card p { font-size: 0.88rem; line-height: 1.5; color: #cbd5e1; margin-bottom: 10px; }
    .baca-install-modal-card ol { font-size: 0.85rem; line-height: 1.7; color: #cbd5e1; padding-left: 1.2rem; }
    .baca-install-modal-card ol li { margin-bottom: 6px; }
    .baca-install-modal-card strong { color: #10b981; }
    .baca-install-modal-close { position: absolute; top: 10px; right: 12px; background: none; border: none; color: #94a3b8; font-size: 1.5rem; cursor: pointer; line-height: 1; padding: 4px 8px; border-radius: 6px; transition: background 0.15s; }
    .baca-install-modal-close:hover { background: rgba(255,255,255,0.08); color: #f1f5f9; }
    body.light-mode .baca-install-modal-card { background: #ffffff; color: #0f172a; }
    body.light-mode .baca-install-modal-card p, body.light-mode .baca-install-modal-card ol { color: #475569; }
    body.light-mode .baca-install-modal-close { color: #94a3b8; }
    body.light-mode .baca-install-modal-close:hover { background: rgba(0,0,0,0.06); color: #0f172a; }
  `;
  document.head.appendChild(style);
})();

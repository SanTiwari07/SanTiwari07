// ==UserScript==
// @name         ChatGPT Emerald Wave Theme
// @namespace    santiwari07
// @version      1.0
// @description  Black-and-emerald theme with a wave wallpaper for ChatGPT (use ChatGPT's dark theme)
// @match        https://chatgpt.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/chatgpt-emerald-wave.user.js
// @downloadURL  https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/chatgpt-emerald-wave.user.js
// ==/UserScript==

(function () {
  'use strict';

  const WALLPAPER_URL =
    'https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/assets/background.webp';
  const CHECK_EVERY_MS = 6 * 60 * 60 * 1000; // look for a replaced image every 6 hours

  GM_addStyle(`
    /* Emerald versions of ChatGPT's dark theme colours.
       Set on every element so ChatGPT can't redefine them further down. */
    html.dark, html.dark * {
      --main-surface-primary: transparent !important;
      --main-surface-secondary: rgba(6, 30, 22, 0.70) !important;
      --main-surface-tertiary: rgba(10, 44, 33, 0.80) !important;
      --sidebar-surface-primary: rgba(3, 14, 10, 0.86) !important;
      --sidebar-surface-secondary: rgba(8, 34, 25, 0.86) !important;
      --sidebar-surface-tertiary: rgba(12, 48, 36, 0.86) !important;
      --composer-surface-primary: rgba(6, 26, 19, 0.88) !important;
      --message-surface: rgba(8, 40, 30, 0.80) !important;
      --bg-primary: transparent !important;
      --bg-secondary: rgba(6, 30, 22, 0.70) !important;
      --bg-tertiary: rgba(10, 44, 33, 0.80) !important;
      --bg-elevated-primary: rgba(5, 22, 16, 0.96) !important;
      --bg-elevated-secondary: rgba(8, 32, 24, 0.96) !important;
      --border-light: rgba(16, 163, 127, 0.18) !important;
      --border-medium: rgba(16, 163, 127, 0.28) !important;
      --chat-selection-background: rgba(16, 163, 127, 0.40) !important;
    }

    /* Wallpaper with a black-to-emerald tint (both layers pinned to the screen) */
    html.dark {
      background:
        linear-gradient(135deg, rgba(0, 10, 7, 0.82) 0%, rgba(0, 38, 28, 0.68) 55%, rgba(0, 110, 80, 0.48) 100%) center / cover fixed,
        var(--pdp-wallpaper, none) center / cover fixed,
        #010805 !important;
    }

    /* Page-level backgrounds become see-through so the wallpaper shows */
    html.dark body, html.dark body > div:has(main), html.dark main {
      background: transparent !important;
    }

    /* Sidebar: dark green glass */
    html.dark nav, html.dark aside, html.dark body > div:has(main) div:has(> nav) {
      background: rgba(3, 14, 10, 0.86) !important;
      backdrop-filter: blur(8px);
    }

    /* Message box */
    html.dark form:has(#prompt-textarea), html.dark #lightweight-composer {
      background: rgba(6, 26, 19, 0.88) !important;
      border: 1px solid rgba(16, 163, 127, 0.45) !important;
      backdrop-filter: blur(6px);
    }
    html.dark form:has(#prompt-textarea):focus-within {
      border-color: #10a37f !important;
    }

    ::selection { background: rgba(16, 163, 127, 0.40); }
  `);

  // ChatGPT's class and colour names are auto-generated and change often, so
  // instead of targeting them, find big panels painted black or dark grey and
  // recolour them: pure black becomes see-through, dark grey becomes green glass.
  function tintPanels() {
    if (!document.documentElement.classList.contains('dark')) return;
    for (const el of document.querySelectorAll('body *')) {
      if (el.dataset.pdpTinted || el.matches('aside, nav') || el.closest('pre')) continue;
      const box = el.getBoundingClientRect();
      if (box.width < 120 || box.height < 40) continue;
      const rgba = getComputedStyle(el).backgroundColor.match(/[\d.]+/g);
      if (!rgba) continue;
      const [r, g, b, a = 1] = rgba.map(Number);
      const grey = Math.max(r, g, b);
      if (a < 0.9 || grey > 60 || grey - Math.min(r, g, b) > 12) continue;
      // Inside the sidebar, only clear black so the sidebar's green glass shows
      const inSidebar = el.closest('aside, nav');
      if (inSidebar && grey >= 10) continue;
      el.dataset.pdpTinted = '1';
      const tint = grey < 10
        ? 'transparent'
        : `rgba(${Math.round(grey * 0.3)}, ${Math.round(grey * 1.1 + 6)}, ${Math.round(grey * 0.8 + 4)}, 0.80)`;
      el.style.setProperty('background-color', tint, 'important');
    }
  }

  let tintQueued = false;
  function queueTint() {
    if (tintQueued) return;
    tintQueued = true;
    setTimeout(() => { tintQueued = false; tintPanels(); }, 400);
  }
  new MutationObserver(queueTint).observe(document.documentElement, {
    childList: true, subtree: true, attributes: true, attributeFilter: ['class'],
  });

  function applyWallpaper(dataUrl) {
    document.documentElement.style.setProperty('--pdp-wallpaper', `url("${dataUrl}")`);
  }

  function readEtag(res) {
    const match = /^etag:\s*(.+)$/im.exec(res.responseHeaders || '');
    return match ? match[1].trim() : null;
  }

  // Download the image and embed it, which gets around image blocking
  function downloadWallpaper() {
    GM_xmlhttpRequest({
      method: 'GET',
      url: WALLPAPER_URL,
      responseType: 'blob',
      onload(res) {
        if (res.status !== 200) return;
        const reader = new FileReader();
        reader.onload = () => {
          GM_setValue('wallpaper', {
            src: WALLPAPER_URL,
            etag: readEtag(res),
            checked: Date.now(),
            data: reader.result,
          });
          applyWallpaper(reader.result);
        };
        reader.readAsDataURL(res.response);
      },
    });
  }

  // Ask GitHub whether background.webp was replaced, without downloading it
  function checkForNewWallpaper(cached) {
    GM_xmlhttpRequest({
      method: 'HEAD',
      url: WALLPAPER_URL,
      onload(res) {
        if (res.status !== 200) return;
        const etag = readEtag(res);
        if (etag && etag === cached.etag) {
          GM_setValue('wallpaper', { ...cached, checked: Date.now() });
        } else {
          downloadWallpaper();
        }
      },
    });
  }

  GM_registerMenuCommand('Refresh wallpaper now', downloadWallpaper);

  // Use the saved copy so the image isn't downloaded on every page load,
  // and check for a replaced image every few hours
  const cached = GM_getValue('wallpaper');
  if (cached && cached.src === WALLPAPER_URL) {
    applyWallpaper(cached.data);
    if (Date.now() - (cached.checked || 0) > CHECK_EVERY_MS) checkForNewWallpaper(cached);
  } else {
    downloadWallpaper();
  }
})();

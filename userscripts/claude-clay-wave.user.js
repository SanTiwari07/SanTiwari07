// ==UserScript==
// @name         Claude Clay Wave Theme
// @namespace    santiwari07
// @version      1.0
// @description  Black-and-clay theme with a wave wallpaper for Claude (use Claude's dark mode)
// @match        https://claude.ai/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/claude-clay-wave.user.js
// @downloadURL  https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/claude-clay-wave.user.js
// ==/UserScript==

(function () {
  'use strict';

  const WALLPAPER_URL =
    'https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/assets/background.webp';
  const CHECK_EVERY_MS = 6 * 60 * 60 * 1000; // look for a replaced image every 6 hours

  GM_addStyle(`
    /* Clay versions of Claude's dark theme colours.
       Set on every element so Claude can't redefine them further down. */
    html[data-mode="dark"], html[data-mode="dark"] * {
      --cds-surface-0: rgba(12, 6, 3, 0.60) !important;
      --cds-surface-1: rgba(22, 12, 8, 0.66) !important;
      --cds-surface-2: rgba(34, 19, 12, 0.88) !important;
      --cds-surface-3: rgba(40, 23, 15, 0.97) !important;
      --cds-surface-popover: rgba(40, 23, 15, 0.97) !important;
      /* Older colour system: hue saturation lightness */
      --bg-000: 18 30% 13% !important;
      --bg-100: 18 32% 9% !important;
      --bg-200: 18 32% 7.5% !important;
      --bg-300: 18 34% 6% !important;
      --bg-400: 18 36% 5% !important;
      --bg-500: 18 36% 5% !important;
      --border-100: 15 55% 70% !important;
      --border-200: 15 55% 70% !important;
      --border-300: 15 55% 70% !important;
      --border-400: 15 55% 70% !important;
    }

    /* Wallpaper with a black-to-clay tint (both layers pinned to the screen) */
    html[data-mode="dark"] {
      background:
        linear-gradient(135deg, rgba(10, 4, 2, 0.82) 0%, rgba(45, 18, 8, 0.66) 55%, rgba(140, 60, 30, 0.45) 100%) center / cover fixed,
        var(--pdp-wallpaper, none) center / cover fixed,
        #0a0503 !important;
    }

    /* Page-level backgrounds (including the login page) become see-through */
    html[data-mode="dark"] body,
    html[data-mode="dark"] .min-h-screen {
      background: transparent !important;
    }

    /* Message box: clay border that lights up while typing */
    html[data-mode="dark"] [data-cds="ChatComposer"],
    html[data-mode="dark"] fieldset:has([contenteditable="true"]) > div {
      border-color: rgba(217, 119, 87, 0.45) !important;
      backdrop-filter: blur(6px);
    }
    html[data-mode="dark"] [data-cds="ChatComposer"]:focus-within {
      border-color: #d97757 !important;
    }

    ::selection { background: rgba(217, 119, 87, 0.40); }
  `);

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

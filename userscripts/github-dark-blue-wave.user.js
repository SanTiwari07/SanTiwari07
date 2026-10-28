// ==UserScript==
// @name         GitHub Dark Blue Wave Theme
// @namespace    santiwari07
// @version      1.2
// @description  Dark navy and cyan theme with a wave wallpaper, matching my README
// @match        https://github.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/github-dark-blue-wave.user.js
// @downloadURL  https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/github-dark-blue-wave.user.js
// ==/UserScript==

(function () {
  'use strict';

  const WALLPAPER_URL =
    'https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/assets/background.webp';
  const CHECK_EVERY_MS = 6 * 60 * 60 * 1000; // look for a replaced image every 6 hours

  GM_addStyle(`
    :root, [data-color-mode] {
      --bgColor-default: transparent !important;
      --bgColor-muted: rgba(6, 30, 50, 0.55) !important;
      --borderColor-default: #12405a !important;
      --borderColor-muted: #0d3047 !important;
      --fgColor-accent: #38bdf8 !important;
      --bgColor-accent-emphasis: #0e7490 !important;
      --underlineNav-borderColor-active: #22d3ee !important;
    }

    /* Wallpaper with a navy-to-teal tint, like the README banner */
    html {
      background:
        linear-gradient(135deg, rgba(2, 8, 20, 0.80) 0%, rgba(4, 30, 55, 0.70) 55%, rgba(8, 90, 120, 0.55) 100%),
        var(--pdp-wallpaper, none) center / cover fixed,
        #050b14 !important;
    }

    body, .application-main, main, .Layout, .Layout-main, .Layout-sidebar {
      background: transparent !important;
    }

    /* Top bar: dark navy glass with a cyan underline */
    .AppHeader, .Header {
      background: rgba(3, 10, 22, 0.88) !important;
      backdrop-filter: blur(8px);
      border-bottom: 1px solid #0e7490 !important;
    }

    /* README and cards: frosted navy glass */
    .Box, .BorderGrid-cell {
      background: rgba(4, 14, 28, 0.72) !important;
      backdrop-filter: blur(6px);
    }

    input, textarea { background: #07121f !important; }

    .btn-primary {
      background: linear-gradient(90deg, #0b3a5a, #0891b2) !important;
      border-color: #22d3ee !important;
    }
    a:hover { color: #67e8f9 !important; }

    /* Cyan glow around your avatar */
    .avatar-user { box-shadow: 0 0 0 3px #0891b2, 0 0 25px rgba(34, 211, 238, 0.45); }
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

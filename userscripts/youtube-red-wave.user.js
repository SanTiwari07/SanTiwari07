// ==UserScript==
// @name         YouTube Red Wave Theme
// @namespace    santiwari07
// @version      1.0
// @description  Black-and-red theme with a wave wallpaper for YouTube (use YouTube's dark theme)
// @match        https://www.youtube.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/youtube-red-wave.user.js
// @downloadURL  https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/youtube-red-wave.user.js
// ==/UserScript==

(function () {
  'use strict';

  const WALLPAPER_URL =
    'https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/assets/pewdiepie-bg.webp';

  GM_addStyle(`
    /* Red versions of YouTube's dark theme colours */
    html[dark] {
      --yt-spec-base-background: transparent !important;
      --yt-spec-general-background-a: transparent !important;
      --yt-spec-raised-background: rgba(26, 4, 4, 0.92) !important;
      --yt-spec-menu-background: rgba(26, 4, 4, 0.96) !important;
      --yt-spec-badge-chip-background: rgba(255, 40, 40, 0.14) !important;
      --yt-spec-10-percent-layer: rgba(255, 60, 60, 0.22) !important;
      --yt-spec-call-to-action: #ff3b3b !important;
      --yt-spec-themed-blue: #ff3b3b !important;
    }

    /* Wallpaper with a black-to-red tint (both layers fixed, since YouTube's html has no height) */
    html[dark] {
      background:
        linear-gradient(135deg, rgba(18, 0, 0, 0.80) 0%, rgba(55, 0, 0, 0.66) 55%, rgba(150, 0, 0, 0.50) 100%) center / cover fixed,
        var(--pdp-wallpaper, none) center / cover fixed,
        #0a0000 !important;
    }

    html[dark] body, html[dark] ytd-app {
      background: transparent !important;
    }

    /* Top bar: black glass with a red underline */
    html[dark] #masthead-container #background.ytd-masthead {
      background: rgba(8, 0, 0, 0.88) !important;
      backdrop-filter: blur(8px);
    }
    html[dark] #masthead-container {
      border-bottom: 1px solid #b00000;
    }

    /* Side menu: solid enough to read over videos */
    html[dark] #guide-content.ytd-app,
    html[dark] #contentContainer.tp-yt-app-drawer,
    html[dark] ytd-mini-guide-renderer {
      background: rgba(12, 0, 0, 0.92) !important;
    }

    /* Cards such as the "Try searching" box */
    html[dark] #content-wrapper.ytd-feed-nudge-renderer {
      background: rgba(30, 4, 4, 0.80) !important;
      border: 1px solid #5a0c0c;
    }

    /* Search box */
    html[dark] .ytSearchboxComponentInputBox {
      background: rgba(20, 0, 0, 0.85) !important;
      border-color: #7a0f0f !important;
    }
    html[dark] .ytSearchboxComponentInputBox:focus-within {
      border-color: #ff3b3b !important;
    }

    /* Video player: red progress bar */
    .ytp-play-progress, .ytp-swatch-background-color {
      background: #ff1f1f !important;
    }

    ::selection { background: rgba(255, 40, 40, 0.4); }
  `);

  function applyWallpaper(dataUrl) {
    document.documentElement.style.setProperty('--pdp-wallpaper', `url("${dataUrl}")`);
  }

  // Use the saved copy so the image isn't downloaded on every page load
  const cached = GM_getValue('wallpaper');
  if (cached && cached.src === WALLPAPER_URL) {
    applyWallpaper(cached.data);
    return;
  }

  // Download the image and embed it, which gets around image blocking
  GM_xmlhttpRequest({
    method: 'GET',
    url: WALLPAPER_URL,
    responseType: 'blob',
    onload(res) {
      const reader = new FileReader();
      reader.onload = () => {
        GM_setValue('wallpaper', { src: WALLPAPER_URL, data: reader.result });
        applyWallpaper(reader.result);
      };
      reader.readAsDataURL(res.response);
    },
  });
})();

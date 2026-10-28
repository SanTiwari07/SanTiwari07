// ==UserScript==
// @name         LeetCode Gold Wave Theme
// @namespace    santiwari07
// @version      2.0
// @description  Warm black-and-gold theme with a wave wallpaper for LeetCode (use LeetCode's dark mode)
// @match        https://leetcode.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/leetcode-gold-wave.user.js
// @downloadURL  https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/leetcode-gold-wave.user.js
// ==/UserScript==

(function () {
  'use strict';

  const WALLPAPER_URL =
    'https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/assets/pewdiepie-bg.webp';

  GM_addStyle(`
    /* Wallpaper with a warm black-to-gold tint */
    html {
      background:
        linear-gradient(135deg, rgba(12, 8, 0, 0.82) 0%, rgba(40, 28, 0, 0.68) 55%, rgba(120, 85, 0, 0.50) 100%),
        var(--pdp-wallpaper, none) center / cover fixed,
        #0d0a02 !important;
    }

    /* Page-level backgrounds become see-through so the wallpaper shows */
    body, #__next, #app,
    [class*="bg-layer-bg"], [class*="bg-dark-layer-bg"] {
      background: transparent !important;
    }

    /* Panels and cards: dark amber glass with a thin gold edge */
    [class*="bg-dark-layer-1"], [class*="bg-layer-1"] {
      background-color: rgba(20, 14, 2, 0.74) !important;
      backdrop-filter: blur(6px);
      border-color: rgba(250, 204, 21, 0.18) !important;
    }
    [class*="bg-dark-layer-2"], [class*="bg-layer-2"],
    [class*="bg-dark-layer-3"], [class*="bg-layer-3"] {
      background-color: rgba(38, 27, 4, 0.78) !important;
    }

    /* Top nav bar */
    nav, #navbar-root, #leetcode-navbar {
      background: rgba(14, 10, 2, 0.88) !important;
      backdrop-filter: blur(8px);
      border-bottom: 1px solid #facc15 !important;
    }

    /* Code editor: mostly solid so code stays readable */
    .monaco-editor, .monaco-editor-background,
    .monaco-editor .margin, .monaco-editor .inputarea.ime-input {
      background-color: rgba(14, 10, 2, 0.92) !important;
    }
    .monaco-editor .current-line { border-color: rgba(250, 204, 21, 0.25) !important; }

    /* Gold accents */
    [class*="flexlayout__splitter"]:hover { background-color: #facc15 !important; }
    [class*="flexlayout__tab_button--selected"] { box-shadow: inset 0 -2px 0 #facc15 !important; }
    ::selection { background: rgba(250, 204, 21, 0.35); }

    input, textarea { background-color: #140f03 !important; }
    input:focus, textarea:focus { outline: 1px solid #facc15 !important; }

    a:hover { color: #fde047 !important; }

    /* Gold glow around your avatar */
    img[alt*="avatar" i] { box-shadow: 0 0 0 2px #facc15, 0 0 14px rgba(250, 204, 21, 0.5); }
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

// ==UserScript==
// @name         LeetCode Dark Blue Wave Theme
// @namespace    santiwari07
// @version      1.0
// @description  Dark navy theme with LeetCode yellow accents and a wave wallpaper (use LeetCode's dark mode)
// @match        https://leetcode.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/leetcode-dark-blue-wave.user.js
// @downloadURL  https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/userscripts/leetcode-dark-blue-wave.user.js
// ==/UserScript==

(function () {
  'use strict';

  const WALLPAPER_URL =
    'https://raw.githubusercontent.com/SanTiwari07/SanTiwari07/main/assets/pewdiepie-bg.webp';

  GM_addStyle(`
    /* Wallpaper with a navy-to-teal tint, same as the GitHub theme */
    html {
      background:
        linear-gradient(135deg, rgba(2, 8, 20, 0.80) 0%, rgba(4, 30, 55, 0.70) 55%, rgba(8, 90, 120, 0.55) 100%),
        var(--pdp-wallpaper, none) center / cover fixed,
        #050b14 !important;
    }

    /* Page-level backgrounds become see-through so the wallpaper shows */
    body, #__next, #app,
    [class*="bg-layer-bg"], [class*="bg-dark-layer-bg"] {
      background: transparent !important;
    }

    /* Panels and cards: frosted navy glass */
    [class*="bg-dark-layer-1"], [class*="bg-layer-1"] {
      background-color: rgba(4, 14, 28, 0.72) !important;
      backdrop-filter: blur(6px);
    }
    [class*="bg-dark-layer-2"], [class*="bg-layer-2"],
    [class*="bg-dark-layer-3"], [class*="bg-layer-3"] {
      background-color: rgba(8, 26, 46, 0.78) !important;
    }

    /* Top nav bar */
    nav, #navbar-root, #leetcode-navbar {
      background: rgba(3, 10, 22, 0.88) !important;
      backdrop-filter: blur(8px);
      border-bottom: 1px solid #ffa116 !important;
    }

    /* Code editor: mostly solid so code stays readable */
    .monaco-editor, .monaco-editor-background,
    .monaco-editor .margin, .monaco-editor .inputarea.ime-input {
      background-color: rgba(3, 12, 24, 0.90) !important;
    }

    /* LeetCode yellow as the accent on top of the navy theme */
    [class*="flexlayout__splitter"]:hover { background-color: #ffa116 !important; }
    [class*="flexlayout__tab_button--selected"] { box-shadow: inset 0 -2px 0 #ffa116 !important; }
    ::selection { background: rgba(255, 161, 22, 0.35); }

    input, textarea { background-color: #07121f !important; }
    input:focus, textarea:focus { outline: 1px solid #ffa116 !important; }

    a:hover { color: #ffc01e !important; }

    /* Yellow glow around your avatar */
    img[alt*="avatar" i] { box-shadow: 0 0 0 2px #ffa116, 0 0 14px rgba(255, 161, 22, 0.5); }
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

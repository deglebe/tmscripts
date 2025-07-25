// ==UserScript==
// @name	hide instagram reels
// @namespace	https://deglebe.com
// @version	1.0.0
// @description	hide all non-essential instagram reels features on instagram web
// @author	thomas "deglebe" bruce
// @match	https://www.instagram.com/*
// @run-at	document-start
// @grant	none
// ==/UserScript==

(function () {
  "use strict";

  const hideReelsCSS = `
        a[href="/reels/"],
        a[href^="/reel/"],
        a[href^="/explore/"],
        div[role="dialog"] video[src*="reel"],
        article:has(a[href^="/reel/"]),
        a[href^="/reel/"],
        a[href*="/reels/"],
        div[style*="--media-size"] video[src*="reel"],
        div[role="link"][tabindex="0"] > div:has(svg[aria-label="Reels"]),
        nav a[href="/reels/"],
        div.x1i10hfl:has(svg[aria-label="Reels"])
        {
            display: none !important;
        }

        /* Optional: Prevent loading reel pages directly */
        body.reel-blocked body {
            pointer-events: none;
            overflow: hidden;
        }
    `;

  function injectStyle() {
    const style = document.createElement("style");
    style.textContent = hideReelsCSS;
    document.head.appendChild(style);
  }

  function blockReelPages() {
    const path = window.location.pathname;
    if (path.startsWith("/reel/")) {
      document.body.innerHTML =
        "<h1 style='text-align:center; margin-top: 20%; font-family:sans-serif;'>Reels are blocked.</h1>";
      document.title = "Blocked";
    }
  }

  function observeDOMChanges() {
    const observer = new MutationObserver(() => {
      blockReelPages();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  injectStyle();
  blockReelPages();
  observeDOMChanges();
})();

// ==UserScript==
// @name	hide youtube recommendations
// @namespace	https://deglebe.com
// @version	1.0.0
// @description	removes the recommended videos from the homepage and sidebar
// @author	thomas "deglebe" bruce
// @match	https://www.youtube.com/*
// @grant	GM_addStyle
// @run-at	document-start
// ==/UserScript==

(() => {
  "use strict";

  /* the two style blocks */
  const styles = {
    home: GM_addStyle(`
      ytd-rich-grid-renderer,
      ytd-rich-grid-renderer + * {
        display: none !important;
      }
    `),
    watch: GM_addStyle(`
      #secondary,
      ytd-watch-next-secondary-results-renderer,
      #related {
        display: none !important;
      }
    `),
  };

  /* enable/disable style blocks based on the url */
  function applyRules() {
    const { pathname } = location;

    if (pathname === "/" || pathname.startsWith("/feed/")) {
      /* home */
      styles.home.disabled = false;
      styles.watch.disabled = true;
    } else if (pathname.startsWith("/watch")) {
      /* watch */
      styles.home.disabled = true;
      styles.watch.disabled = false;
    } else {
      /* fallback */
      styles.home.disabled = true;
      styles.watch.disabled = true;
    }
  }

  applyRules();
  window.addEventListener("yt-navigate-finish", applyRules, false);
})();

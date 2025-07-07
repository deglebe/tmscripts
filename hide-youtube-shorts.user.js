// ==UserScript==
// @name	hide youtube shorts
// @namespace	https://deglebe.com
// @version	1.0.0
// @description	nuke the shorts tab, section, and player from appearing in youtube
// @author	thomas "deglebe" bruce
// @match	https://www.youtube.com/*
// @run-at	document-start
// @grant	none
// ==/UserScript==

(() => {
  /* pure css fallback, works for most elements since css selectors are
   * reevaluated whenever the dom mutates */
  const css = `
    /* shorts shelf on home/subs pages */
    ytd-rich-shelf-renderer[is-shorts],
    /* shorts shelf in search results */
    ytd-reel-shelf-renderer,
    /* “shorts” side-bar nav button */
    a[title="Shorts"],
    #endpoint[title="Shorts"],
    /* shorts tab on channel pages */
    yt-tab-shape[tab-title="Shorts"],
    /* shorts chip on search-result filter bar */
    yt-chip-cloud-chip-renderer[chip-id*="shorts"]
  { display:none !important; }`;

  const s = document.createElement("style");
  s.id = "tm-hide-shorts";
  s.textContent = css;
  document.documentElement.appendChild(s);

  /* extra guard, removes shorts shelf that isn't in the css defaults */
  const SELECTORS = [
    "ytd-rich-shelf-renderer[is-shorts]",
    "ytd-reel-shelf-renderer",
  ];

  const zapShorts = (root) => {
    SELECTORS.forEach((sel) =>
      root.querySelectorAll(sel).forEach((el) => el.remove()),
    );
    /* detect shelves labelled “shorts” without the is-shorts attr */
    root.querySelectorAll("ytd-rich-shelf-renderer").forEach((shelf) => {
      const label = shelf.querySelector("#title span")?.textContent?.trim();
      if (label === "Shorts") shelf.remove();
    });
  };

  const mo = new MutationObserver((muts) =>
    muts.forEach((m) => m.addedNodes.forEach((n) => zapShorts(n))),
  );

  mo.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  /* initial sweep for elements already present */
  zapShorts(document);
})();

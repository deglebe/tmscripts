// ==UserScript==
// @name	kill google one-tap globally
// @namespace	https://deglebe.com
// @version	1.0.0
// @description	removes the floating google one-tap popup on all sites
// @author	thomas "deglebe" bruce
// @match	*://*/*
// @run-at	document-start
// @grant	GM_addStyle
// ==/UserScript==

(() => {
  "use strict";

  /* hide common containers */
  GM_addStyle(`
    #credential_picker_container,
    iframe[src^="https://accounts.google.com/gsi/"],
    iframe[src^="https://accounts.google.com/AccountChooser"],
    iframe[src^="https://accounts.google.com/embedded/"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  `);

  /* remove already-inserted elements */
  const selectors =
    '#credential_picker_container, iframe[src^="https://accounts.google.com/gsi/"], ' +
    'iframe[src^="https://accounts.google.com/AccountChooser"], iframe[src^="https://accounts.google.com/embedded/"]';

  const nuke = (root) =>
    root.querySelectorAll
      ? root.querySelectorAll(selectors).forEach((el) => el.remove())
      : void 0;

  /* initial sweep: covers document-start insertions */
  nuke(document);

  /* keep watching for future injections */
  new MutationObserver((mutations) =>
    mutations.forEach((m) => m.addedNodes.forEach(nuke)),
  ).observe(document.documentElement, { childList: true, subtree: true });

  /* stub the gsi api so sites can't relaunch it */
  const noop = () => {};
  const stubGSI = () => {
    if (window.google?.accounts?.id) {
      ["initialize", "prompt", "renderButton", "disableAutoSelect"].forEach(
        (fn) => (window.google.accounts.id[fn] = noop),
      );
    }
  };
  stubGSI();

  /* gsi script may load later on, keep trying until found */
  new MutationObserver(stubGSI).observe(document.documentElement, {
    childList: true,
    subtree: true,
  });
})();

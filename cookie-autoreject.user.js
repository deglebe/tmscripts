// ==UserScript==
// @name	auto-reject cookies
// @namespace	https://deglebe.com
// @version	1.0.0
// @description	automatically clicks reject on gdpr-compliant cookie dialogues
// @author	thomas "deglebe" bruce
// @match	*://*/*
// @run-at	document-start
// @grant	GM_addStyle
// ==/UserScript==

(() => {
  "use strict";

  /* config */
  const SCAN_INTERVAL_MS = 400; // how often to look for banners
  const MAX_SCAN_TIME_MS = 15_000; // give up after 15s
  const OPT_OUT_KEYWORDS = [
    /* english */
    "reject all",
    "deny all",
    "decline all",
    "opt out",
    "disagree",
    /* deutsch */
    "alle ablehnen",
    "alles ablehnen",
    "ablehnen",
    /* dansk / svenska / norsk / suomi */
    "afvis alle",
    "avvisa alla",
    "avslå alle",
    "hylkää kaikki",
  ];

  /* hide overflow when banner must stay on screen briefly */
  GM_addStyle(`
    .__cookieKillHide { display:none !important; visibility:hidden !important; }
  `);

  /* cmp-specific selectors */
  const cmpSelectors = [
    /* onetrust */
    "button#onetrust-reject-all-handler",
    /* quantcast */
    'button[mode="secondary"]#qc-cmp2-ui button:contains("Reject")',
    /* trustarc */
    "a#truste-consent-button",
    /* didomi */
    'button[data-testid="reject-button"]',
    /* cookiebot */
    "button#CybotCookiebotDialogBodyButtonDecline",
    /* sourcepoint/urban (reject all inside cmp wrapper) */
    "span.sp_choice_type_reject, button#sp_choice_type_reject",
    /* google consent mode banner on yt/blogger (eu) */
    'button[aria-label="Reject the use of cookies and other data for the purposes described"]',
  ];

  /* case-insensitive contains */
  function matchesKeyword(el) {
    const text = el.textContent.trim().toLowerCase();
    return OPT_OUT_KEYWORDS.some((k) => text === k || text.startsWith(k));
  }

  /* click node if visible and clickable */
  function clickIfPossible(el) {
    try {
      if (!el || !(el instanceof HTMLElement)) return false;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false; // hidden off-screen
      el.click();
      return true;
    } catch {
      return false;
    }
  }

  /* scan and attempt to reject */
  function tryReject() {
    /* a: dedicated cmp selectors */
    for (const sel of cmpSelectors) {
      const btn = document.querySelector(sel);
      if (clickIfPossible(btn)) return true;
    }

    /* b: generic text search */
    const possibleBanners = Array.from(
      document.querySelectorAll("div, section, form, aside"),
    ).filter(
      (node) =>
        node.innerText && /cookie|consent|privacy/i.test(node.innerText),
    );
    for (const container of possibleBanners) {
      const btns = container.querySelectorAll(
        'button, a, input[type="button"], input[type="submit"]',
      );
      for (const btn of btns) {
        if (matchesKeyword(btn) && clickIfPossible(btn)) return true;
      }
    }
    return false; /* nothing clicked */
  }

  /* observe dom mutations for late banners */
  const observer = new MutationObserver(() => tryReject());
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  /* repeated scans */
  const start = Date.now();
  const interval = setInterval(() => {
    if (tryReject()) return; // success: banner gone!

    if (Date.now() - start > MAX_SCAN_TIME_MS)
      clearInterval(interval); /* i give up */
  }, SCAN_INTERVAL_MS);
})();

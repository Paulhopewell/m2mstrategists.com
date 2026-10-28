/* Keep campaign parameters from the landing URL and add them to outbound
   booking links. First touch in this tab is stored in sessionStorage.
   That is not analytics tracking and it does not set a cookie, so the
   Consent Mode choice in js/consent.js does not gate it.

   Decorated links: any calendly.com URL (book-a-call-with-paul, 90min,
   or another event) and portal sign-up / checkout / register URLs.
   The path is never changed. Query parameters already on the link,
   including GA4's _gl linker parameter, are left byte-for-byte. */
(function () {
  var STORAGE_KEY = 'm2m-utm';
  var FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  var PORTAL_HOST = 'portal.m2mstrategists.com';

  function clean(value) {
    if (typeof value !== 'string') return '';
    return value.replace(/^\s+|\s+$/g, '');
  }

  function pick(source) {
    var out = {};
    var i, key, value;
    if (!source) return out;
    for (i = 0; i < FIELDS.length; i++) {
      key = FIELDS[i];
      value = clean(source[key]);
      if (value) out[key] = value;
    }
    return out;
  }

  function hasAny(map) {
    var i;
    for (i = 0; i < FIELDS.length; i++) {
      if (map[FIELDS[i]]) return true;
    }
    return false;
  }

  function readStored() {
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var picked = pick(JSON.parse(raw));
      if (!hasAny(picked)) return null;
      return picked;
    } catch (err) {
      return null;
    }
  }

  function writeStored(map) {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    } catch (err) {}
  }

  function fromLocation() {
    var params, raw, i, key;
    try {
      params = new URLSearchParams(window.location.search);
    } catch (err) {
      return {};
    }
    raw = {};
    for (i = 0; i < FIELDS.length; i++) {
      key = FIELDS[i];
      raw[key] = params.get(key) || '';
    }
    return pick(raw);
  }

  /* First touch wins. A later page in the same tab does not replace it. */
  function capture() {
    var stored = readStored();
    var fresh;
    if (stored) return stored;
    fresh = fromLocation();
    if (hasAny(fresh)) writeStored(fresh);
    return fresh;
  }

  function parseUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (err) {
      return null;
    }
  }

  function isCalendly(url) {
    var host = url.hostname.toLowerCase();
    return host === 'calendly.com' || host === 'www.calendly.com';
  }

  function isPortalBooking(url) {
    if (url.hostname.toLowerCase() !== PORTAL_HOST) return false;
    return /(?:^|\/)(?:checkout|signup|sign-up|register)(?:\/|$)/.test(url.pathname.toLowerCase());
  }

  function joinQuery(rawHref, addition) {
    var hashIndex = rawHref.indexOf('#');
    var hash = '';
    var base = rawHref;
    var last, glue;
    if (hashIndex !== -1) {
      hash = rawHref.slice(hashIndex);
      base = rawHref.slice(0, hashIndex);
    }
    last = base.charAt(base.length - 1);
    if (base.indexOf('?') === -1) glue = '?';
    else if (last === '?' || last === '&') glue = '';
    else glue = '&';
    return base + glue + addition + hash;
  }

  function applyToLink(link, utms) {
    var raw, url, addition, i, key, value;
    if (!hasAny(utms) || !link || !link.getAttribute) return;
    raw = link.getAttribute('href');
    if (!raw || raw.charAt(0) === '#') return;
    url = parseUrl(raw);
    if (!url || (url.protocol !== 'http:' && url.protocol !== 'https:')) return;
    if (!isCalendly(url) && !isPortalBooking(url)) return;
    addition = [];
    for (i = 0; i < FIELDS.length; i++) {
      key = FIELDS[i];
      value = utms[key];
      if (!value || url.searchParams.has(key)) continue;
      addition.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    }
    if (!addition.length) return;
    link.setAttribute('href', joinQuery(raw, addition.join('&')));
  }

  function decorateAll(utms) {
    var links = document.getElementsByTagName('a');
    var i;
    for (i = 0; i < links.length; i++) applyToLink(links[i], utms);
  }

  function linkFromEvent(event) {
    var node = event.target;
    if (!node) return null;
    if (node.nodeType !== 1) node = node.parentElement;
    if (!node || !node.closest) return null;
    return node.closest('a[href]');
  }

  var utms = capture();

  function onInteract(event) {
    try {
      var link = linkFromEvent(event);
      if (link) applyToLink(link, utms);
    } catch (err) {}
  }

  document.addEventListener('click', onInteract, true);
  document.addEventListener('auxclick', onInteract, true);

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { decorateAll(utms); });
  } else {
    decorateAll(utms);
  }
})();

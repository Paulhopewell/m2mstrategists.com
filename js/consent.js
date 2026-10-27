/* Google Consent Mode v2. Load this script before gtag.js and before js/ga4.js.
   The default is denied, so the tag can queue without writing analytics cookies.
   Accept grants analytics_storage only. Ad storage stays denied.
   The choice is remembered in localStorage. Cookie settings clears it. */
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

var M2M_CONSENT_KEY = 'm2m-analytics-consent';

gtag('consent', 'default', {
  analytics_storage: 'denied',
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied'
});

function m2mConsentChoice() {
  try {
    return localStorage.getItem(M2M_CONSENT_KEY);
  } catch (err) {
    return null;
  }
}

function m2mStoreConsent(value) {
  try {
    if (value) localStorage.setItem(M2M_CONSENT_KEY, value);
    else localStorage.removeItem(M2M_CONSENT_KEY);
  } catch (err) {}
}

/* Returning visitors who already accepted must be granted before ga4.js
   calls gtag('config'), or the first page view stays cookieless. */
if (m2mConsentChoice() === 'accepted') {
  gtag('consent', 'update', { analytics_storage: 'granted' });
}

function m2mClearAnalyticsCookies() {
  var cookies = document.cookie ? document.cookie.split(';') : [];
  var host = (location.hostname || '').toLowerCase();
  var domains = [''];
  var parts;
  var i;
  if (host) {
    domains.push(host);
    parts = host.split('.');
    if (parts.length >= 2) domains.push('.' + parts.slice(-2).join('.'));
  }
  for (i = 0; i < cookies.length; i++) {
    var name = cookies[i].split('=')[0].replace(/^\s+/, '');
    var domainIndex;
    if (name !== '_ga' && name !== '_gid' && name !== '_gat' && name.indexOf('_ga_') !== 0) continue;
    for (domainIndex = 0; domainIndex < domains.length; domainIndex++) {
      var domain = domains[domainIndex];
      document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + (domain ? '; domain=' + domain : '');
    }
  }
}

function m2mInitConsentBanner() {
  var choice = m2mConsentChoice();
  var banner = document.createElement('div');
  banner.className = 'cookie-banner';
  banner.id = 'cookie-banner';
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-label', 'Cookie consent');
  banner.hidden = true;
  banner.innerHTML =
    '<p class="cookie-message">We use Google Analytics cookies to see how visitors use this site, only if you accept. Essential cookies are always on. <a href="/legal.html#analytics">Analytics notice</a>.</p>' +
    '<div class="cookie-actions">' +
      '<button type="button" class="cookie-accept">Accept</button>' +
      '<button type="button" class="cookie-decline">Decline</button>' +
    '</div>';

  function syncOffset() {
    if (banner.hidden) {
      document.body.classList.remove('cookie-banner-open');
      document.body.style.removeProperty('--cookie-banner-height');
      return;
    }
    document.body.classList.add('cookie-banner-open');
    document.body.style.setProperty('--cookie-banner-height', banner.offsetHeight + 'px');
  }

  function hideBanner() {
    banner.hidden = true;
    syncOffset();
  }

  function showBanner(moveFocus) {
    banner.hidden = false;
    syncOffset();
    if (moveFocus) {
      var accept = banner.querySelector('.cookie-accept');
      if (accept) accept.focus();
    }
  }

  banner.querySelector('.cookie-accept').addEventListener('click', function () {
    m2mStoreConsent('accepted');
    gtag('consent', 'update', { analytics_storage: 'granted' });
    hideBanner();
  });

  banner.querySelector('.cookie-decline').addEventListener('click', function () {
    m2mStoreConsent('declined');
    gtag('consent', 'update', { analytics_storage: 'denied' });
    m2mClearAnalyticsCookies();
    hideBanner();
  });

  document.body.appendChild(banner);

  var settingsLinks = document.querySelectorAll('[data-cookie-settings]');
  var linkIndex;
  for (linkIndex = 0; linkIndex < settingsLinks.length; linkIndex++) {
    settingsLinks[linkIndex].addEventListener('click', function (event) {
      event.preventDefault();
      m2mStoreConsent('');
      gtag('consent', 'update', { analytics_storage: 'denied' });
      m2mClearAnalyticsCookies();
      showBanner(true);
    });
  }

  window.addEventListener('resize', syncOffset);

  if (choice !== 'accepted' && choice !== 'declined') showBanner(false);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', m2mInitConsentBanner);
} else {
  m2mInitConsentBanner();
}

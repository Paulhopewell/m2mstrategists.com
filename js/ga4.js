window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

/* Decorate links to the client portal with the _gl linker param.
   set has to precede js/config so the tag picks the domains up.
   The portal must load this same measurement ID (and accept _gl)
   for a later sign_up there to stay on this session. */
gtag('set', 'linker', {
  domains: ['m2mstrategists.com', 'portal.m2mstrategists.com']
});
gtag('js', new Date());
gtag('config', 'G-8XTQVTNBNF');

(function () {
  var PORTAL_HOST = 'portal.m2mstrategists.com';

  function track(name, params) {
    var payload = {};
    var key;
    if (params) {
      for (key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) payload[key] = params[key];
      }
    }
    /* Reserved gtag field: send the hit before a navigation unloads the page.
       GA4 does not store transport_type as an event parameter. */
    payload.transport_type = 'beacon';
    gtag('event', name, payload);
  }

  function parseUrl(href) {
    try {
      return new URL(href, window.location.href);
    } catch (err) {
      return null;
    }
  }

  function isPortalCheckout(url) {
    if (!url || url.hostname.toLowerCase() !== PORTAL_HOST) return false;
    return /(?:^|\/)(?:checkout|signup|sign-up|register)(?:\/|$)/.test(url.pathname.toLowerCase());
  }

  function isBookCall(url) {
    if (!url) return false;
    var host = url.hostname.toLowerCase();
    if (host !== 'calendly.com' && host !== 'www.calendly.com') return false;
    var path = url.pathname.toLowerCase();
    return path === '/ph-paulhopewell' || path.indexOf('/ph-paulhopewell/') === 0;
  }

  function pageName() {
    var path = window.location.pathname || '';
    var file = path.split('/').pop();
    return file || 'index.html';
  }

  function ctaLocation(el) {
    var marked = el.closest('[data-cta-location]');
    if (marked) {
      var explicit = marked.getAttribute('data-cta-location');
      if (explicit && explicit.trim()) return explicit.trim();
    }
    if (el.closest('.offer-banner')) return 'banner';
    if (el.closest('.offer-ticker, .ticker')) return 'ticker';
    if (el.closest('#book-form')) return 'book-form';
    if (el.closest('footer, .site-footer')) return 'footer';
    if (el.closest('.hero')) return 'hero';
    if (el.closest('.nav-mobile')) return 'nav-mobile';
    if (el.closest('header, .site-header, .nav-desktop')) return 'nav';
    var level = el.closest('.level-card');
    if (level) {
      var numEl = level.querySelector('.level-number');
      var num = numEl && numEl.textContent ? numEl.textContent.trim() : '';
      if (num) return 'level-' + num;
      return 'level';
    }
    var section = el.closest('section[id]');
    if (section && section.id) {
      if (section.id === 'after-hero' && pageName() === 'legal.html') return 'legal';
      return section.id;
    }
    return 'page';
  }

  function linkFromEvent(event) {
    var node = event.target;
    if (!node) return null;
    if (node.nodeType !== 1) node = node.parentElement;
    if (!node || !node.closest) return null;
    return node.closest('a[href]');
  }

  document.addEventListener('click', function (event) {
    try {
      var link = linkFromEvent(event);
      if (!link) return;
      var url = parseUrl(link.href);
      var location = ctaLocation(link);
      if (isPortalCheckout(url)) {
        track('claim_free_audit_click', { cta_location: location });
      } else if (isBookCall(url)) {
        track('book_call_click', { cta_location: location });
      }
    } catch (err) {}
  }, true);

  function findSuccess(form) {
    if (!form.id) return null;
    var success = document.getElementById(form.id.replace(/-form$/, '-success'));
    if (success && success !== form) return success;
    return null;
  }

  function formName(form) {
    var named = form.getAttribute('name');
    if (named) return named;
    var hidden = form.querySelector('input[name="form-name"]');
    if (hidden && hidden.value) return hidden.value;
    return form.id || 'form';
  }

  function bindLeadForm(form) {
    var success = findSuccess(form);
    if (!success || typeof MutationObserver !== 'function') return;
    var pending = false;
    var fired = false;

    form.addEventListener('submit', function () {
      pending = true;
    }, true);

    /* The page shows the success node only after Netlify accepts the POST.
       A failed POST keeps it hidden and falls through to the mailto draft. */
    var observer = new MutationObserver(function () {
      try {
        if (fired || !pending) return;
        if (window.getComputedStyle(success).display === 'none') return;
        fired = true;
        track('generate_lead', { form_name: formName(form) });
      } catch (err) {}
    });
    observer.observe(success, {
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden']
    });
  }

  function bindLeadForms() {
    var forms = document.getElementsByTagName('form');
    var i;
    for (i = 0; i < forms.length; i++) bindLeadForm(forms[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindLeadForms);
  } else {
    bindLeadForms();
  }
})();

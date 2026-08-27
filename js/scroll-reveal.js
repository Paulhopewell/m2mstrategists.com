/* Scroll reveal: content blocks rise gently into place the first time they
   enter the viewport. Elements are tagged from here rather than in the HTML,
   so without JavaScript nothing is ever hidden; with reduced motion set,
   nothing is tagged and the page stays static. Styles live in style.css
   (.reveal-init / .reveal-in). */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var SELECTORS = [
    'main .section .body-text',
    'main .section .section-title',
    'main .section .section-label',
    'main .section-dark .body-text',
    'main .section-dark .section-title',
    'main .section-dark .section-label',
    'main .about .body-text',
    'main .foundation-card',
    'main .method-step',
    'main .testimonial',
    'main .article-card',
    'main .sidebar-box',
    'main .level-header',
    'main .level-section',
    'main .hero-cta',
    'main .cta-group'
  ];

  var els = document.querySelectorAll(SELECTORS.join(','));
  if (!els.length) return;

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('reveal-in');
      io.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  var groupCounters = [];
  els.forEach(function (el) {
    /* nested matches (e.g. a .body-text inside a .level-section) animate with
       their parent; tagging both makes the child fade twice as slowly */
    if (el.parentElement && el.parentElement.closest('.reveal-init')) return;
    el.classList.add('reveal-init');
    /* siblings revealed together get a small stagger */
    var parent = el.parentElement;
    var idx = groupCounters.indexOf(parent);
    if (idx === -1) { groupCounters.push(parent); idx = 0; }
    var siblings = parent ? parent.querySelectorAll(':scope > .reveal-init').length - 1 : 0;
    el.style.transitionDelay = Math.min(siblings * 0.1, 0.4).toFixed(2) + 's';
    io.observe(el);
  });
})();

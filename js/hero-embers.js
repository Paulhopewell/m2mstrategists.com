/* Floating embers in the hero. Injects its own canvas so no page markup or
   stylesheet changes are needed; the hero is position:relative with its text
   at z-index:1, so the canvas sits between the background image and the copy. */
(function () {
  'use strict';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var hero = document.querySelector('.hero');
  if (!hero) return;

  var canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText =
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;';
  hero.insertBefore(canvas, hero.firstChild);

  var ctx = canvas.getContext('2d');
  var W, H;
  function resize() {
    W = canvas.width = canvas.offsetWidth * devicePixelRatio;
    H = canvas.height = canvas.offsetHeight * devicePixelRatio;
  }
  resize();
  window.addEventListener('resize', resize);

  var COUNT = Math.min(46, Math.floor(window.innerWidth / 30));
  var embers = [];
  function newEmber(anyY) {
    return {
      x: Math.random() * (W || 1),
      y: anyY ? Math.random() * (H || 1) : (H || 1) + 10,
      r: (0.6 + Math.random() * 1.8) * devicePixelRatio,
      vy: (0.15 + Math.random() * 0.45) * devicePixelRatio,
      vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
      a: 0.15 + Math.random() * 0.5,
      tw: Math.random() * Math.PI * 2,
      warm: Math.random() > 0.35
    };
  }
  for (var i = 0; i < COUNT; i++) embers.push(newEmber(true));

  (function loop(ts) {
    ctx.clearRect(0, 0, W, H);
    embers.forEach(function (p, idx) {
      p.y -= p.vy;
      p.x += p.vx + Math.sin(ts * 0.0006 + p.tw) * 0.2;
      var alpha = p.a * (0.6 + 0.4 * Math.sin(ts * 0.002 + p.tw));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.warm
        ? 'rgba(224, 140, 90, ' + alpha + ')'
        : 'rgba(249, 230, 200, ' + alpha * 0.7 + ')';
      ctx.fill();
      if (p.y < -12) embers[idx] = newEmber(false);
    });
    requestAnimationFrame(loop);
  })(0);
})();

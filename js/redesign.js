/* M2M REDESIGN — LOCAL TEST ONLY. Effects engine for the redesign pages. */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* ?static=1 — QA capture mode: everything visible, no motion */
  if (/[?&]static=1/.test(window.location.search)) {
    document.documentElement.classList.add('static-mode');
    reduceMotion = true;
  }

  /* ---------- scroll progress bar ---------- */
  var progress = document.querySelector('.scroll-progress');
  var header = document.querySelector('.site-header');
  var floatCta = document.querySelector('.float-cta');
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    if (progress) progress.style.width = (max > 0 ? (h.scrollTop / max) * 100 : 0) + '%';
    if (header) header.classList.toggle('is-scrolled', h.scrollTop > 40);
    if (floatCta) floatCta.classList.toggle('is-visible', h.scrollTop > window.innerHeight * 0.75);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- hero word-by-word rise ---------- */
  var h1 = document.querySelector('.hero h1');
  if (h1 && !reduceMotion) {
    var frag = document.createDocumentFragment();
    var delay = 0.15;
    Array.prototype.forEach.call(h1.childNodes, function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (piece) {
          if (!piece) return;
          if (/^\s+$/.test(piece)) { frag.appendChild(document.createTextNode(' ')); return; }
          var w = document.createElement('span'); w.className = 'w';
          var inner = document.createElement('span');
          inner.textContent = piece;
          inner.style.animationDelay = delay.toFixed(2) + 's';
          delay += 0.09;
          w.appendChild(inner); frag.appendChild(w);
        });
      } else if (node.nodeType === 1) {
        var wrap = document.createElement('span'); wrap.className = 'w';
        var innerEl = document.createElement('span');
        innerEl.style.animationDelay = delay.toFixed(2) + 's';
        delay += 0.09;
        innerEl.appendChild(node.cloneNode(true));
        wrap.appendChild(innerEl); frag.appendChild(wrap);
      }
    });
    h1.textContent = '';
    h1.appendChild(frag);
  }

  /* staged hero entrance */
  document.querySelectorAll('.hero-stage').forEach(function (el, i) {
    setTimeout(function () { el.classList.add('is-in'); }, 350 + i * 200);
  });

  /* ---------- scroll reveals ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });

  /* ---------- hero mouse parallax ---------- */
  var hero = document.querySelector('.hero');
  var heroMedia = document.querySelector('.hero-media');
  var heroSmoke = document.querySelector('.hero-smoke');
  if (hero && heroMedia && !reduceMotion && matchMedia('(pointer: fine)').matches) {
    var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
    hero.addEventListener('mousemove', function (e) {
      var r = hero.getBoundingClientRect();
      tx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      ty = ((e.clientY - r.top) / r.height - 0.5) * 2;
      if (!raf) tick();
    });
    function tick() {
      raf = requestAnimationFrame(function () {
        cx += (tx - cx) * 0.06; cy += (ty - cy) * 0.06;
        var t = 'translate(' + (-cx * 14) + 'px,' + (-cy * 9) + 'px)';
        heroMedia.style.transform = t;
        if (heroSmoke) heroSmoke.style.transform = t;
        if (Math.abs(tx - cx) > 0.001 || Math.abs(ty - cy) > 0.001) tick(); else raf = null;
      });
    }
  }

  /* ---------- ember particles ---------- */
  var pCanvas = document.querySelector('.hero-particles');
  if (pCanvas && !reduceMotion) {
    var ctx = pCanvas.getContext('2d');
    var W, H, embers = [];
    function resize() {
      W = pCanvas.width = pCanvas.offsetWidth * devicePixelRatio;
      H = pCanvas.height = pCanvas.offsetHeight * devicePixelRatio;
    }
    resize(); window.addEventListener('resize', resize);
    var COUNT = Math.min(46, Math.floor(window.innerWidth / 30));
    for (var i = 0; i < COUNT; i++) embers.push(newEmber(true));
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
    (function loop(ts) {
      ctx.clearRect(0, 0, W, H);
      embers.forEach(function (p, idx) {
        p.y -= p.vy; p.x += p.vx + Math.sin(ts * 0.0006 + p.tw) * 0.2;
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
  }

  /* ---------- 3D tilt + spotlight cards ---------- */
  if (matchMedia('(pointer: fine)').matches && !reduceMotion) {
    document.querySelectorAll('.foundation-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r = card.getBoundingClientRect();
        var x = (e.clientX - r.left) / r.width;
        var y = (e.clientY - r.top) / r.height;
        card.style.setProperty('--mx', (x * 100) + '%');
        card.style.setProperty('--my', (y * 100) + '%');
        card.style.transform =
          'rotateY(' + ((x - 0.5) * 8) + 'deg) rotateX(' + ((0.5 - y) * 8) + 'deg) translateY(-6px)';
      });
      card.addEventListener('mouseleave', function () { card.style.transform = ''; });
    });

    /* magnetic buttons */
    document.querySelectorAll('.btn, .cta-btn-book, .float-cta').forEach(function (btn) {
      btn.addEventListener('mousemove', function (e) {
        var r = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left - r.width / 2) * 0.12;
        var dy = (e.clientY - r.top - r.height / 2) * 0.18;
        btn.style.translate = dx + 'px ' + dy + 'px';
      });
      btn.addEventListener('mouseleave', function () { btn.style.translate = ''; });
    });
  }

  /* ---------- process timeline fill ---------- */
  var steps = document.querySelector('.methodology-steps');
  var fill = document.querySelector('.timeline-fill');
  if (steps && fill) {
    function timelineTick() {
      var r = steps.getBoundingClientRect();
      var vh = window.innerHeight;
      var pct = Math.min(1, Math.max(0, (vh * 0.72 - r.top) / r.height));
      fill.style.height = (pct * 100) + '%';
      var fillBottom = r.top + r.height * pct;
      document.querySelectorAll('.method-step').forEach(function (s) {
        s.classList.toggle('is-lit', s.getBoundingClientRect().top + 12 < fillBottom);
      });
    }
    window.addEventListener('scroll', timelineTick, { passive: true });
    timelineTick();
  }

  /* ---------- price count-up ---------- */
  var priceEl = document.querySelector('[data-countup]');
  if (priceEl) {
    var target = parseInt(priceEl.getAttribute('data-countup'), 10);
    var pio = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting) return;
      pio.disconnect();
      if (reduceMotion) { priceEl.textContent = String(target); return; }
      var start = null, dur = 1400;
      (function step(ts) {
        if (!start) start = ts;
        var p = Math.min(1, (ts - start) / dur);
        var eased = 1 - Math.pow(1 - p, 4);
        priceEl.textContent = String(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(step);
      })(performance.now());
    }, { threshold: 0.5 });
    pio.observe(priceEl);
  }

  /* ---------- DNA double helix ---------- */
  var dna = document.querySelector('.dna-visual canvas');
  if (dna) {
    var dctx = dna.getContext('2d');
    var dw, dh;
    function dnaResize() {
      dw = dna.width = dna.offsetWidth * devicePixelRatio;
      dh = dna.height = dna.offsetHeight * devicePixelRatio;
    }
    dnaResize(); window.addEventListener('resize', dnaResize);
    var RUNGS = 26;
    function drawDNA(ts) {
      dctx.clearRect(0, 0, dw, dh);
      var cx2 = dw / 2;
      var amp = Math.min(dw * 0.24, 120 * devicePixelRatio);
      var top = dh * 0.06, bottom = dh * 0.9;
      var speed = reduceMotion ? 0 : ts * 0.0011;
      var nodes = [[], []];
      for (var i = 0; i <= RUNGS; i++) {
        var t = i / RUNGS;
        var y = top + (bottom - top) * t;
        var ph = t * Math.PI * 3.1 + speed;
        var x1 = cx2 + Math.sin(ph) * amp;
        var x2 = cx2 + Math.sin(ph + Math.PI) * amp;
        var z1 = Math.cos(ph), z2 = Math.cos(ph + Math.PI);
        nodes[0].push({ x: x1, y: y, z: z1 });
        nodes[1].push({ x: x2, y: y, z: z2 });
      }
      /* rungs first (behind strands) */
      for (var j = 0; j <= RUNGS; j++) {
        if (j % 2) continue;
        var a = nodes[0][j], b = nodes[1][j];
        var depth = (a.z + 1) / 2;
        var g = dctx.createLinearGradient(a.x, a.y, b.x, b.y);
        g.addColorStop(0, 'rgba(224, 122, 95, ' + (0.3 + depth * 0.5) + ')');
        g.addColorStop(1, 'rgba(196, 163, 90, ' + (0.3 + (1 - depth) * 0.5) + ')');
        dctx.strokeStyle = g;
        dctx.lineWidth = 2.4 * devicePixelRatio;
        dctx.beginPath(); dctx.moveTo(a.x, a.y); dctx.lineTo(b.x, b.y); dctx.stroke();
      }
      /* strands */
      [
        { pts: nodes[0], color: '224, 122, 95' },
        { pts: nodes[1], color: '196, 163, 90' }
      ].forEach(function (strand) {
        for (var k = 0; k < strand.pts.length - 1; k++) {
          var p1 = strand.pts[k], p2 = strand.pts[k + 1];
          var d = (p1.z + 1) / 2;
          dctx.strokeStyle = 'rgba(' + strand.color + ', ' + (0.4 + d * 0.6) + ')';
          dctx.lineWidth = (2.2 + d * 3.4) * devicePixelRatio;
          dctx.beginPath(); dctx.moveTo(p1.x, p1.y); dctx.lineTo(p2.x, p2.y); dctx.stroke();
        }
        strand.pts.forEach(function (p) {
          var d = (p.z + 1) / 2;
          var r = (2.6 + d * 4.2) * devicePixelRatio;
          dctx.beginPath(); dctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          dctx.fillStyle = 'rgba(' + strand.color + ', ' + (0.5 + d * 0.5) + ')';
          if (d > 0.6) {
            dctx.shadowColor = 'rgba(' + strand.color + ', 0.9)';
            dctx.shadowBlur = 18 * devicePixelRatio;
          }
          dctx.fill();
          dctx.shadowBlur = 0;
        });
      });
      if (!reduceMotion) requestAnimationFrame(drawDNA);
    }
    drawDNA(0);
    window.addEventListener('load', function () { dnaResize(); drawDNA(0); });
  }

  /* ---------- audit page: #book-form smooth landing ---------- */
  if (window.location.hash === '#book-form') {
    window.scrollTo(0, 0);
    window.addEventListener('load', function () {
      setTimeout(function () {
        var target = document.getElementById('book-form');
        if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }, 400);
    });
  }
})();

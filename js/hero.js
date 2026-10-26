/* หน้าแรก: ดาวเคลื่อนช้าๆ + ชื่อ TANASAK DAMDEE ที่ประกอบจากจุดแสง (เมาส์/นิ้วลากผ่านแล้วกระจาย) */
(function () {
  'use strict';
  var hero = document.getElementById('home');
  var sc = document.getElementById('heroStars');
  var nc = document.getElementById('heroName');
  var meta = hero.querySelector('.hero-meta');
  if (!sc.getContext) return;
  var sx = sc.getContext('2d'), nx = nc.getContext('2d');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var W, H, stars = [], parts = [], raf = null, visible = true, started = false;
  var mouse = { x: -1e4, y: -1e4 };

  function size() {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    W = hero.clientWidth; H = hero.clientHeight;
    [sc, nc].forEach(function (c) { c.width = W * r; c.height = H * r; });
    sx.setTransform(r, 0, 0, r, 0, 0);
    nx.setTransform(r, 0, 0, r, 0, 0);
  }

  function makeStars() {
    var n = W < 760 ? 350 : 700;
    stars = [];
    for (var i = 0; i < n; i++) stars.push({ x: (Math.random() - .5) * W * 2, y: (Math.random() - .5) * H * 2, z: Math.random() * W, pz: 0 });
  }

  function makeName(scatter) {
    var two = W < 760;
    var off = document.createElement('canvas');
    off.width = W; off.height = H;
    var g = off.getContext('2d');
    var widest = two ? 'TANASAK' : 'TANASAK DAMDEE';
    var fs = window.Lib.fitFontSize(function (px) {
      g.font = '900 ' + px + 'px Orbitron';
      return g.measureText(widest).width;
    }, W * 0.88, two ? 150 : 170, 20);
    g.font = '900 ' + fs + 'px Orbitron';
    g.fillStyle = '#fff'; g.textAlign = 'center'; g.textBaseline = 'middle';
    var bottom = meta.offsetTop - 12;                 // ชื่ออยู่เหนือบรรทัด meta พอดี
    if (two) {
      g.fillText('TANASAK', W / 2, bottom - fs * 1.62);
      g.fillText('DAMDEE', W / 2, bottom - fs * 0.52);
    } else {
      g.fillText('TANASAK DAMDEE', W / 2, bottom - fs * 0.55);
    }
    var pts = window.Lib.samplePoints(g.getImageData(0, 0, W, H).data, W, H, two ? 3 : 4, 140);
    parts = pts.map(function (p) {
      return {
        hx: p.x, hy: p.y,
        x: scatter ? W / 2 + (Math.random() - .5) * W * 1.6 : p.x,
        y: scatter ? H / 2 + (Math.random() - .5) * H * 1.6 : p.y,
        vx: 0, vy: 0, c: Math.random()
      };
    });
    hero.classList.add('has-particles');
  }

  function drawStars() {
    sx.clearRect(0, 0, W, H);
    var cx = W / 2, cy = H / 2, k = W * 0.5;
    sx.lineCap = 'round';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.pz = s.z; s.z -= 1.2;
      if (s.z < 1) { s.z = W; s.pz = W; s.x = (Math.random() - .5) * W * 2; s.y = (Math.random() - .5) * H * 2; }
      var n = 1 - s.z / W;
      sx.strokeStyle = 'rgba(205,232,255,' + Math.min(1, n * 1.4) + ')';
      sx.lineWidth = 0.4 + n * 2;
      sx.beginPath();
      sx.moveTo(cx + s.x / s.pz * k, cy + s.y / s.pz * k);
      sx.lineTo(cx + s.x / s.z * k, cy + s.y / s.z * k);
      sx.stroke();
    }
  }

  function drawName(animate) {
    nx.clearRect(0, 0, W, H);
    for (var i = 0; i < parts.length; i++) {
      var p = parts[i];
      if (animate) {
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 12000) { var d = Math.sqrt(d2) || 1, f = (12000 - d2) / 12000 * 7; p.vx += dx / d * f; p.vy += dy / d * f; }
        p.vx += (p.hx - p.x) * 0.045; p.vy += (p.hy - p.y) * 0.045;
        p.vx *= 0.84; p.vy *= 0.84; p.x += p.vx; p.y += p.vy;
      }
      nx.fillStyle = p.c > .82 ? '#7dd3fc' : p.c > .7 ? '#bae6fd' : '#fff';
      nx.fillRect(p.x, p.y, 2, 2);
    }
  }

  function loop() {
    raf = null;
    if (!visible) return;
    drawStars();
    drawName(true);
    raf = requestAnimationFrame(loop);
  }
  function play() { if (!raf && visible && !reduced) raf = requestAnimationFrame(loop); }

  function start() {
    if (started) return;
    started = true;
    var go = function () {
      size(); makeStars(); makeName(!reduced);
      if (reduced) { drawStars(); drawName(false); } else play();
    };
    if (document.fonts && document.fonts.load) document.fonts.load('900 100px Orbitron').then(go, go); else go();
  }

  var release = null;
  function point(e) {
    clearTimeout(release);
    var r = hero.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  }
  function away() { mouse.x = mouse.y = -1e4; }
  hero.addEventListener('pointermove', point);
  hero.addEventListener('pointerdown', point);          // มือถือ: แตะครั้งเดียวก็กระจาย
  hero.addEventListener('pointerleave', away);
  ['pointerup', 'pointercancel'].forEach(function (t) {
    hero.addEventListener(t, function (e) { if (e.pointerType !== 'mouse') release = setTimeout(away, 450); });
  });

  var lastW = 0;
  window.addEventListener('resize', function () {
    if (!started || hero.clientWidth === lastW) return;   // มือถือ: แถบที่อยู่เลื่อนขึ้นลงไม่ต้องสร้างใหม่
    lastW = hero.clientWidth;
    size(); makeStars(); makeName(false);
    if (reduced) { drawStars(); drawName(false); }
  });

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      visible = es[0].isIntersecting;
      if (visible) play();
    }).observe(hero);
  }

  if (window.__introDone) start();
  else window.addEventListener('intro:done', start);
  lastW = hero.clientWidth;
})();

/* ท้องฟ้าพื้นหลังทั้งเว็บ
   - เครื่องบินและยานอวกาศลอยผ่านแบบ parallax (ยิ่งเลื่อนลง = ยิ่งไต่สูง เครื่องบินจาง ยานอวกาศชัด)
   - ดาวที่ยืดเป็นเส้นวาร์ปเมื่อเลื่อนเร็ว
   - มาตรวัดความสูง FL000–FL400 (จอกว้าง) / แถบความคืบหน้า (จอแคบ) */
(function () {
  'use strict';
  var root = document.documentElement;
  var sky = document.getElementById('sky');
  var canvas = document.getElementById('starfield');
  var altValue = document.getElementById('altValue');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- เครื่องบินและยานอวกาศ (ลายเส้นเรืองแสง) ---------- */
  var SVG = {
    airliner: '<svg viewBox="0 0 120 40"><path d="M8 20C8 16 14 15 22 15H96C106 15 114 17 117 20C114 23 106 25 96 25H22C14 25 8 24 8 20Z"/><path d="M13 16L19 3H27L30 15"/><path d="M11 21H27L19 28H13Z"/><path d="M50 23H70L52 37H43Z"/><ellipse cx="60" cy="30" rx="8" ry="3"/><path class="dim" d="M32 18.5H94"/><path d="M104 17.5L110 18.5"/></svg>',
    jet: '<svg viewBox="0 0 100 30"><path d="M4 16L30 12H70C84 12 94 14 98 16C94 18 84 19 70 19H30Z"/><path d="M8 15L14 3H22L26 12"/><path d="M44 18H64L48 28H40Z"/><path d="M66 12C70 7 78 8 83 12.5"/></svg>',
    rocket: '<svg viewBox="0 0 30 80"><path d="M15 2C22 10 24 22 24 44V60H6V44C6 22 8 10 15 2Z"/><path d="M6 46L0 62L6 60M24 46L30 62L24 60"/><circle cx="15" cy="26" r="4"/><path d="M6 50H24"/></svg>',
    satellite: '<svg viewBox="0 0 120 50"><rect x="48" y="15" width="24" height="20" rx="3"/><rect x="4" y="19" width="38" height="12"/><path class="dim" d="M13.5 19V31M23 19V31M32.5 19V31M4 25H42"/><rect x="78" y="19" width="38" height="12"/><path class="dim" d="M87.5 19V31M97 19V31M106.5 19V31M78 25H116"/><path d="M42 25H48M72 25H78M60 15V8"/><path d="M53 7C56 2 64 2 67 7"/><circle class="blink" cx="60" cy="40" r="2"/></svg>',
    shuttle: '<svg viewBox="0 0 120 40"><path d="M8 22L14 14H84C100 14 112 18 117 22C112 26 100 28 84 28H10Z"/><path d="M12 14L18 2H26L30 14"/><path d="M40 26H86L58 37H40Z"/><path d="M2 17L8 19V26L2 28Z"/><path class="dim" d="M98 17.5L108 19.5"/></svg>'
  };
  function craft(cls, svg, extra) {
    return '<div class="craft ' + cls + '">' + (extra || '') + svg + '</div>';
  }
  sky.innerHTML =
    '<div class="sky-group sky-air">' +
      '<div class="sky-layer far">' + craft('c-airliner far', SVG.airliner, '<span class="trail"></span><span class="trail two"></span>') + '</div>' +
      '<div class="sky-layer near">' +
        craft('c-airliner', SVG.airliner, '<span class="trail"></span><span class="trail two"></span>') +
        craft('c-jet', SVG.jet, '<span class="trail"></span>') +
      '</div>' +
    '</div>' +
    '<div class="sky-group sky-space">' +
      '<div class="sky-layer far">' + craft('c-satellite two', SVG.satellite) + '</div>' +
      '<div class="sky-layer near">' +
        craft('c-rocket', SVG.rocket, '<span class="smoke"></span><span class="flame"></span>') +
        craft('c-satellite', SVG.satellite) +
        craft('c-shuttle', SVG.shuttle) +
      '</div>' +
    '</div>';

  /* ---------- ดาววาร์ปตามความเร็วการเลื่อน ---------- */
  var ctx = canvas.getContext && canvas.getContext('2d');
  var W = 0, H = 0, stars = [], lastY = window.scrollY, vel = 0, dirty = true;
  function size() {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * r; canvas.height = H * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
    var n = W < 760 ? 90 : 170;
    stars = [];
    for (var i = 0; i < n; i++) stars.push({ x: Math.random() * W, y: Math.random() * H * 3, d: 0.25 + Math.random() * 0.75 });
    dirty = true;
  }
  function drawStars(scrollY) {
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var y = ((s.y - scrollY * s.d * 0.35) % (H * 3) + H * 3) % (H * 3) - H;
      if (y < -40 || y > H + 40) continue;
      var len = Math.min(Math.abs(vel) * s.d * 1.4, 160) * (vel > 0 ? 1 : -1);
      ctx.strokeStyle = 'rgba(205,232,255,' + (0.35 + s.d * 0.6) + ')';
      ctx.lineWidth = 0.6 + s.d * 1.3;
      ctx.beginPath();
      ctx.moveTo(s.x, y);
      ctx.lineTo(s.x, y + len + 0.01);
      ctx.stroke();
    }
  }

  /* ---------- มาตรวัดความสูง ---------- */
  var lastLabel = '', lastP = -1;
  function hud(p) {
    root.style.setProperty('--p', p.toFixed(4));
    var cur = document.querySelector('.nav-links a[aria-current="true"]');
    var label = window.Lib.altitudeLabel(p) + (cur ? ' · ' + cur.textContent : '');
    if (label !== lastLabel) { altValue.textContent = label; lastLabel = label; }
    var mix = window.Lib.skyMix(p);
    root.style.setProperty('--air', mix.air.toFixed(3));
    root.style.setProperty('--space', mix.space.toFixed(3));
    if (window.SFX && Math.abs(p - lastP) > 0.01) { window.SFX.altitude(p); lastP = p; }
  }

  function frame() {
    var y = window.scrollY;
    var dy = y - lastY;
    lastY = y;
    vel += (dy - vel) * 0.25;                      // ความเร็วแบบนุ่มๆ
    if (Math.abs(vel) < 0.05) vel = 0;
    var p = window.Lib.scrollProgress(y, document.documentElement.scrollHeight, window.innerHeight);
    root.style.setProperty('--sy', String(Math.round(y)));
    hud(p);
    if (ctx && (dirty || dy !== 0 || vel !== 0)) { drawStars(y); dirty = false; }
    requestAnimationFrame(frame);
  }

  if (ctx) { size(); window.addEventListener('resize', size); }
  if (reduced) {
    /* ไม่มีแอนิเมชัน: อัปเดตแค่ตอนเลื่อน */
    var update = function () {
      var y = window.scrollY;
      hud(window.Lib.scrollProgress(y, document.documentElement.scrollHeight, window.innerHeight));
      if (ctx) { vel = 0; drawStars(y); }
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
  } else {
    requestAnimationFrame(frame);
  }
})();

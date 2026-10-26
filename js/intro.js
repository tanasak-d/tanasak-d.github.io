/* ฉากเปิด: หน้าเริ่มภารกิจ (เลือกเปิด/ปิดเสียง) → บูตระบบ → นับถอยหลัง 3-2-1 → วาร์ปทะลุดวงดาว → แสงวาบ
   แล้วยิง event 'intro:done'  (เบราว์เซอร์ต้องให้ผู้ชมกดก่อนถึงจะเล่นเสียงได้ จึงมีหน้าเริ่มภารกิจ) */
(function () {
  'use strict';
  window.__introLoaded = true;
  var KEY = 'march-intro-seen';
  var overlay = document.getElementById('intro');
  var canvas = document.getElementById('introCanvas');
  var boot = document.getElementById('introBoot');
  var count = document.getElementById('introCount');
  var flash = document.getElementById('introFlash');
  var skip = document.getElementById('introSkip');
  var gate = document.getElementById('introGate');
  var gateSound = document.getElementById('gateSound');
  var gateMute = document.getElementById('gateMute');
  function sfx(name, arg) { if (window.SFX) window.SFX[name](arg); }
  var timers = [], raf = null, done = false;

  function seen() { try { return sessionStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
  function markSeen() { try { sessionStorage.setItem(KEY, '1'); } catch (e) { /* โหมดส่วนตัว */ } }

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(function (t) { clearTimeout(t); clearInterval(t); });
    timers = [];
    markSeen();
    overlay.classList.add('leaving');
    document.body.classList.remove('intro-active');
    window.dispatchEvent(new Event('intro:done'));
    setTimeout(function () { cancelAnimationFrame(raf); overlay.remove(); }, 750);
  }
  window.__introFinish = finish;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.Lib.shouldPlayIntro({ reducedMotion: reduced, seen: seen() })) {
    overlay.remove();
    document.body.classList.remove('intro-active');
    done = true;
    window.__introDone = true;
    window.dispatchEvent(new Event('intro:done'));
    return;
  }
  window.addEventListener('intro:done', function () { window.__introDone = true; });
  /* ฉากเปิดจบที่หน้าแรกเสมอ ไม่กระโดดไปตำแหน่งเดิมที่เบราว์เซอร์จำไว้ */
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  if (!location.hash) window.scrollTo(0, 0);
  skip.addEventListener('click', finish);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') finish(); });

  /* ---------- ดาววาร์ป ---------- */
  var ctx = canvas.getContext('2d'), W, H, stars = [], speed = 0.3, target = 0.3;
  function size() {
    var r = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    canvas.width = W * r; canvas.height = H * r;
    ctx.setTransform(r, 0, 0, r, 0, 0);
  }
  function makeStars() {
    var n = W < 760 ? 500 : 1000;
    stars = [];
    for (var i = 0; i < n; i++) stars.push({ x: (Math.random() - .5) * W * 2, y: (Math.random() - .5) * H * 2, z: Math.random() * W, pz: 0 });
  }
  function frame() {
    speed += (target - speed) * 0.035;
    ctx.clearRect(0, 0, W, H);
    ctx.lineCap = 'round';
    var cx = W / 2, cy = H / 2, k = W * 0.5;
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.pz = s.z; s.z -= speed * 4;
      if (s.z < 1) { s.z = W; s.pz = W; s.x = (Math.random() - .5) * W * 2; s.y = (Math.random() - .5) * H * 2; }
      var n = 1 - s.z / W;
      ctx.strokeStyle = 'rgba(' + (190 + n * 65 | 0) + ',' + (225 + n * 30 | 0) + ',255,' + Math.min(1, n * 1.5) + ')';
      ctx.lineWidth = 0.4 + n * 2.2;
      ctx.beginPath();
      ctx.moveTo(cx + s.x / s.pz * k, cy + s.y / s.pz * k);
      ctx.lineTo(cx + s.x / s.z * k, cy + s.y / s.z * k);
      ctx.stroke();
    }
    raf = requestAnimationFrame(frame);
  }
  window.addEventListener('resize', function () { if (!done) { size(); makeStars(); } });

  /* ---------- ลำดับเหตุการณ์ ---------- */
  function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
  var LINES = [
    '> INITIALIZING FLIGHT SYSTEM ......... OK',
    '> PILOT ID 67145679 ................. VERIFIED',
    '> AVIATION SAFETY MODULE ............ ONLINE',
    '> AI NAVIGATION ..................... READY',
    '',
    '          CLEARED FOR LAUNCH'
  ];
  function typeLines() {
    var i = 0, j = 0;
    var t = setInterval(function () {
      if (i >= LINES.length) { clearInterval(t); return; }
      if (j < LINES[i].length) {
        var ch = LINES[i][j++];
        boot.textContent += ch;
        if (ch !== ' ' && ch !== '.') sfx('type');
      } else {
        if (/OK|VERIFIED|ONLINE|READY|LAUNCH/.test(LINES[i])) sfx('verified');
        boot.textContent += '\n'; i++; j = 0;
      }
    }, 20);
    timers.push(t);
  }
  function pop(n) {
    boot.style.opacity = 0;
    count.textContent = n;
    count.classList.remove('pop'); void count.offsetWidth; count.classList.add('pop');
    sfx('beep', Number(n));
  }

  /* หน้าเริ่มภารกิจ: ดาวลอยช้าๆ รอผู้ชมกด */
  var begun = false;
  function begin(withSound) {
    if (begun || done) return;
    begun = true;
    if (window.SFX) window.SFX.setEnabled(withSound);
    gate.classList.add('gone');
    overlay.classList.remove('gated');
    skip.focus({ preventScroll: true });
    typeLines();
    ['3', '2', '1'].forEach(function (n, i) { at(3100 + i * 800, function () { pop(n); }); });
    at(5500, function () { target = 70; sfx('warp'); });
    at(7600, function () { flash.classList.add('go'); target = 1; sfx('boom'); });
    at(7900, finish);
  }
  gateSound.addEventListener('click', function () { begin(true); });
  gateMute.addEventListener('click', function () { begin(false); });

  size(); makeStars(); frame();
  overlay.classList.add('gated');
  gateSound.focus({ preventScroll: true });
})();

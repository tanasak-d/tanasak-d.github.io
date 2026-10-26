/* เสียงประกอบทั้งเว็บ สังเคราะห์สดด้วย Web Audio API (ไม่มีไฟล์เสียง)
   - window.SFX.type / verified / beep / warp / boom / chime  ใช้ในฉากเปิดและปุ่มต่างๆ
   - เพลงพื้นหลัง "เชื่อในฝัน" — Release เล่นผ่านเครื่องเล่น YouTube ขนาดเล็กมุมซ้ายล่าง
   - ปุ่มเปิด/ปิดเสียงมุมซ้ายล่าง จำค่าที่เลือกไว้
   เบราว์เซอร์ยอมให้เล่นเสียงหลังผู้ชมกดหรือแตะครั้งแรกเท่านั้น */
(function () {
  'use strict';
  var KEY = 'march-sound';
  var AC = window.AudioContext || window.webkitAudioContext;
  var ctx = null, master = null, amb = null, noiseBuf = null;
  var enabled = readPref();
  var toggle = document.getElementById('soundToggle');

  function readPref() { try { return window.Lib.parseSoundPref(localStorage.getItem(KEY)); } catch (e) { return null; } }
  function savePref(on) { try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (e) { /* โหมดส่วนตัว */ } }

  function ensure() {
    if (!AC) return null;
    if (!ctx) {
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 0.9;
      master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function on() { return enabled === true && ensure(); }

  function noise() {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 2, ctx.sampleRate);
      var d = noiseBuf.getChannelData(0);
      for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    var src = ctx.createBufferSource();
    src.buffer = noiseBuf;
    src.loop = true;
    return src;
  }

  /* โทนสั้นๆ พร้อม envelope */
  function tone(freq, dur, type, vol, delay, slideTo) {
    if (!on()) return;
    var t = ctx.currentTime + (delay || 0);
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'sine';
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }

  /* เสียงลมกรองความถี่ (ใช้ทำเสียงวาร์ป/เสียงตูม) */
  function whoosh(dur, vol, f0, f1, type) {
    if (!on()) return;
    var t = ctx.currentTime;
    var src = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = type || 'bandpass';
    f.Q.value = 1.2;
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(f1, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + dur * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.25);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.3);
  }

  var lastType = 0;
  var SFX = {
    get enabled() { return enabled === true; },
    type: function () {                                   // เสียงพิมพ์ (จำกัดไม่ให้ถี่เกินไป)
      var now = performance.now();
      if (now - lastType < 45) return;
      lastType = now;
      tone(1500 + Math.random() * 500, 0.03, 'square', 0.025);
    },
    verified: function () { tone(880, 0.09, 'sine', 0.12); tone(1320, 0.16, 'sine', 0.12, 0.09); },
    beep: function (n) { tone(n === 1 ? 1046 : 660, n === 1 ? 0.45 : 0.22, 'sine', 0.28); },
    warp: function () {
      whoosh(2.1, 0.32, 180, 3200);
      tone(55, 2.1, 'sawtooth', 0.08, 0, 880);
    },
    boom: function () {
      tone(110, 1.2, 'sine', 0.5, 0, 32);
      whoosh(0.5, 0.25, 1800, 120, 'lowpass');
    },
    chime: function () { tone(784, 1.1, 'sine', 0.22); tone(622, 1.5, 'sine', 0.2, 0.55); },   // ติ๊ง-ต่อง แบบประกาศบนเครื่องบิน
    ambientStart: ambientStart,
    ambientStop: ambientStop,
    altitude: function (p) {                              // ยิ่งสูง เสียงยิ่งโปร่ง
      /* เพลงจาก YouTube ปรับเสียงตามความสูงไม่ได้ */
    },
    setEnabled: setEnabled
  };

  /* ---------- เพลงพื้นหลัง: "เชื่อในฝัน" — Release ----------
     เพลงมีลิขสิทธิ์ จึงเล่นผ่านเครื่องเล่น YouTube ที่มองเห็นได้ (ขนาดไม่ต่ำกว่า 200×200 ตามเงื่อนไข YouTube)
     ไม่ดาวน์โหลดไฟล์เพลงมาไว้ในเว็บ */
  var YT_ID = 'SYzdWlNY0Vw', YT_VOL = 25;
  var mini = document.getElementById('ytMini');
  var ytPlayer = null, ytReady = false, ytWant = false, ytLoading = false;

  function showMini(show) {
    if (!mini) return;
    if (show) { mini.hidden = false; requestAnimationFrame(function () { mini.classList.add('show'); }); }
    else { mini.classList.remove('show'); setTimeout(function () { if (!ytWant) mini.hidden = true; }, 350); }
  }
  function loadYT() {
    if (ytLoading) return;
    ytLoading = true;
    window.onYouTubeIframeAPIReady = function () {
      ytPlayer = new window.YT.Player('ytPlayer', {
        width: '100%', height: '100%', videoId: YT_ID,
        playerVars: { autoplay: 1, loop: 1, playlist: YT_ID, rel: 0, playsinline: 1, modestbranding: 1 },
        events: {
          onReady: function (e) { ytReady = true; e.target.setVolume(YT_VOL); if (ytWant) e.target.playVideo(); else e.target.pauseVideo(); }
        }
      });
    };
    var s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = function () { ytWant = false; showMini(false); };   // โหลด YouTube ไม่ได้ เว็บยังใช้งานได้ตามปกติ
    document.head.appendChild(s);
  }
  function ambientStart() {
    if (enabled !== true || !mini) return;
    ytWant = true;
    amb = true;
    showMini(true);
    if (ytPlayer && ytReady) ytPlayer.playVideo(); else loadYT();
    updateToggle();
  }
  function ambientStop() {
    ytWant = false;
    amb = null;
    if (ytPlayer && ytReady) ytPlayer.pauseVideo();
    showMini(false);
    updateToggle();
  }
  var ytClose = document.getElementById('ytClose');
  if (ytClose) ytClose.addEventListener('click', function () { setEnabled(false); });

  function setEnabled(v) {
    enabled = !!v;
    savePref(enabled);
    if (enabled) { ensure(); if (!document.body.classList.contains('intro-active')) ambientStart(); }
    else ambientStop();
    updateToggle();
  }

  function updateToggle() {
    if (!toggle) return;
    var playing = enabled === true;
    toggle.setAttribute('aria-pressed', String(playing));
    toggle.setAttribute('aria-label', playing ? 'ปิดเสียง' : 'เปิดเสียง');
    toggle.classList.toggle('on', playing);
  }

  if (toggle) toggle.addEventListener('click', function () { setEnabled(!(enabled === true)); });

  /* เคยเปิดเสียงไว้: เริ่มเสียงบรรยากาศทันทีที่ผู้ชมกดหรือแตะครั้งแรก */
  function firstGesture() {
    document.removeEventListener('pointerdown', firstGesture, true);
    document.removeEventListener('keydown', firstGesture, true);
    if (enabled === true && !document.body.classList.contains('intro-active')) ambientStart();
  }
  document.addEventListener('pointerdown', firstGesture, true);
  document.addEventListener('keydown', firstGesture, true);

  /* สลับไปแท็บอื่นแล้วเสียงหยุด กลับมาแล้วเล่นต่อ */
  document.addEventListener('visibilitychange', function () {
    if (!ctx && !ytPlayer) return;
    if (!ctx) ensure();
    if (document.hidden) { ctx.suspend(); if (ytPlayer && ytReady) ytPlayer.pauseVideo(); }
    else if (enabled === true) { ctx.resume(); if (ytWant && ytPlayer && ytReady) ytPlayer.playVideo(); }
  });

  window.addEventListener('intro:done', function () { if (enabled === true) ambientStart(); });
  if (!AC && toggle) toggle.hidden = true;
  updateToggle();
  window.SFX = SFX;
})();

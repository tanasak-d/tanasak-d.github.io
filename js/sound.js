/* เสียงประกอบทั้งเว็บ สังเคราะห์สดด้วย Web Audio API (ไม่มีไฟล์เสียง)
   - window.SFX.type / verified / beep / warp / boom / chime  ใช้ในฉากเปิดและปุ่มต่างๆ
   - เพลงพื้นหลังแนว chill electronic สดใส แต่งสดด้วยโค้ด ยิ่งเลื่อนสูงเสียงยิ่งใส (SFX.altitude)
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
      if (amb) amb.filter.frequency.setTargetAtTime(1300 + p * 1800, ctx.currentTime, 0.8);
    },
    setEnabled: setEnabled
  };

  /* ---------- เพลงพื้นหลัง: Chill electronic สดใส (แต่งสดด้วยโค้ด ไม่มีไฟล์เพลง) ----------
     92 BPM · คอร์ด Fmaj7 → Dm9 → B♭maj7 → C6/9 · กลองเบาๆ + เบส + อาร์เปจจิโอมีเสียงสะท้อน */
  var BPM = 92, STEP = 60 / BPM / 4;                     // โน้ตตัวละ 1/16
  var CHORDS = [                                         // ความถี่ (Hz)
    { root: 87.31, pad: [174.61, 220.00, 261.63, 329.63], arp: [349.23, 440.00, 523.25, 659.25, 783.99] },   // Fmaj7
    { root: 73.42, pad: [146.83, 174.61, 220.00, 329.63], arp: [293.66, 349.23, 440.00, 523.25, 659.25] },   // Dm9
    { root: 58.27, pad: [174.61, 233.08, 293.66, 440.00], arp: [349.23, 466.16, 587.33, 698.46, 880.00] },   // B♭maj7
    { root: 65.41, pad: [196.00, 261.63, 329.63, 440.00], arp: [392.00, 523.25, 587.33, 659.25, 783.99] }    // C6/9
  ];
  var ARP = [0, -1, 2, -1, 1, 3, -1, 2, 4, -1, 2, -1, 3, 1, -1, 2];   // ลำดับโน้ตใน 1 ห้อง (-1 = เว้น)

  function voice(freq, t, dur, type, vol, dest, attack) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + (attack || 0.008));
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function hit(t, dur, vol, type, freq, dest) {          // เสียงกลองจาก noise
    var src = noise(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = type; f.frequency.value = freq; f.Q.value = 0.8;
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(dest);
    src.start(t, Math.random()); src.stop(t + dur + 0.02);
  }
  function kick(t, dest) {
    var o = ctx.createOscillator(), g = ctx.createGain();
    o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.22);
    g.gain.setValueAtTime(0.7, t); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32);
    o.connect(g); g.connect(dest); o.start(t); o.stop(t + 0.35);
  }

  function scheduleStep(a, step, t) {
    var bar = Math.floor(step / 16) % CHORDS.length, s = step % 16, ch = CHORDS[bar];
    if (s === 0) ch.pad.forEach(function (f, i) {         // คอร์ดยาวทั้งห้อง
      voice(f, t, STEP * 16 + 0.6, i % 2 ? 'sine' : 'triangle', 0.05, a.pad, 0.35);
      voice(f * 1.003, t, STEP * 16 + 0.6, 'sine', 0.025, a.pad, 0.4);
    });
    if (s === 0 || s === 6 || s === 8 || s === 14) voice(ch.root, t, STEP * (s === 6 || s === 14 ? 2 : 3.5), 'sine', 0.22, a.bus);   // เบส
    if (s === 0 || s === 8 || (s === 10 && bar % 2)) kick(t, a.drums);
    if (s === 4 || s === 12) hit(t, 0.18, 0.22, 'bandpass', 1700, a.drums);          // แคลป
    if (s % 2 === 0) hit(t + (s % 4 === 2 ? STEP * 0.12 : 0), 0.05, s % 4 === 2 ? 0.09 : 0.05, 'highpass', 7500, a.drums);   // ไฮแฮท (สวิงนิดๆ)
    var n = ARP[s];
    if (n >= 0 && !(bar === 3 && s > 11)) voice(ch.arp[n], t, 0.32, 'triangle', 0.06, a.lead);
  }

  function ambientStart() {
    if (!on() || amb) return;
    var t0 = ctx.currentTime + 0.1;
    var out = ctx.createGain();
    out.gain.setValueAtTime(0.0001, ctx.currentTime);
    out.gain.exponentialRampToValueAtTime(0.42, ctx.currentTime + 2.5);
    out.connect(master);
    var bus = ctx.createGain(); bus.gain.value = 1; bus.connect(out);
    var drums = ctx.createGain(); drums.gain.value = 0.55; drums.connect(out);
    var filter = ctx.createBiquadFilter();                 // เปิดกว้างขึ้นตามความสูง (SFX.altitude)
    filter.type = 'lowpass'; filter.frequency.value = 1500; filter.Q.value = 0.5;
    var pad = ctx.createGain(); pad.gain.value = 1; pad.connect(filter); filter.connect(out);
    var lead = ctx.createGain(); lead.gain.value = 1;
    var delay = ctx.createDelay(1), fb = ctx.createGain(), wet = ctx.createGain();
    delay.delayTime.value = STEP * 3; fb.gain.value = 0.32; wet.gain.value = 0.45;
    lead.connect(filter); lead.connect(delay); delay.connect(fb); fb.connect(delay); delay.connect(wet); wet.connect(filter);
    var a = { out: out, filter: filter, bus: bus, drums: drums, pad: pad, lead: lead, step: 0, next: t0, timer: 0 };
    a.timer = setInterval(function () {
      while (a.next < ctx.currentTime + 0.15) {
        scheduleStep(a, a.step, a.next);
        a.step++;
        a.next += STEP;
      }
    }, 30);
    amb = a;
    updateToggle();
  }
  function ambientStop() {
    if (!amb || !ctx) return;
    var a = amb; amb = null;
    clearInterval(a.timer);
    a.out.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.35);
    setTimeout(function () { a.out.disconnect(); }, 2500);
    updateToggle();
  }

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
    if (!ctx) return;
    if (document.hidden) ctx.suspend(); else if (enabled === true) ctx.resume();
  });

  window.addEventListener('intro:done', function () { if (enabled === true) ambientStart(); });
  if (!AC && toggle) toggle.hidden = true;
  updateToggle();
  window.SFX = SFX;
})();

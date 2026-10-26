/* แอนิเมชันตอนเลื่อนหน้า (GSAP + ScrollTrigger) และการเลื่อนนุ่ม (Lenis บนคอม)
   ถ้าโหลดไลบรารีไม่ได้ หรือผู้ชมตั้งค่าลดการเคลื่อนไหว ทุกอย่างแสดงตามปกติโดยไม่ซ่อนอะไร */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var GSAP = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/';
  var LENIS = 'https://cdn.jsdelivr.net/npm/lenis@1.1.13/dist/lenis.min.js';
  var desktop = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  function load(src, cb) {
    var s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    s.onerror = function () { /* ไม่มีแอนิเมชันก็ไม่เป็นไร */ };
    document.head.appendChild(s);
  }

  /* ---------- เลื่อนนุ่ม (เฉพาะเมาส์/ทัชแพด) ---------- */
  function smooth(gsap) {
    if (!desktop || !window.Lenis) return;
    var lenis = new window.Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    window.__lenis = lenis;
    lenis.on('scroll', window.ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    if (document.body.classList.contains('intro-active')) {
      lenis.stop();
      window.addEventListener('intro:done', function () { lenis.start(); }, { once: true });
    }
    /* ลิงก์ในเมนูและปุ่มต่างๆ ให้เลื่อนแบบเดียวกัน */
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { duration: 1.6, easing: function (x) { return 1 - Math.pow(1 - x, 4); } });
    });
  }

  function run() {
    var gsap = window.gsap, ST = window.ScrollTrigger;
    gsap.registerPlugin(ST);
    smooth(gsap);

    /* #pass กับ .social มี transform ของตัวเองใน CSS (เอียงตามเมาส์ / ลอยตอน hover)
       จึงปิด CSS transition ระหว่าง tween และ clearProps คืน transform ให้ CSS เมื่อเล่นจบ */
    function own(sel) {
      var els = gsap.utils.toArray(sel);
      return {
        onStart: function () { els.forEach(function (e) { e.style.transition = 'none'; }); },
        onComplete: function () { els.forEach(function (e) { e.style.transition = ''; }); }
      };
    }

    /* หน้าแรก: "เครื่องขึ้น" ตอนเลื่อนออก */
    var heroST = { trigger: '#home', start: 'top top', end: 'bottom top', scrub: true };
    gsap.set('.hero-stage', { xPercent: -50, x: 0 });
    gsap.to('.hero-stage', { yPercent: -14, scale: 1.1, opacity: 0.12, ease: 'none', scrollTrigger: heroST });
    gsap.to('#heroName', { y: -140, opacity: 0, ease: 'none', scrollTrigger: heroST });
    gsap.to('.hero-meta, .hero-cta', { y: -80, opacity: 0, ease: 'none', scrollTrigger: { trigger: '#home', start: 'top top', end: '60% top', scrub: true } });
    gsap.to('.hero-orbits', { rotate: 25, scale: 1.25, opacity: 0, ease: 'none', scrollTrigger: heroST });

    /* หัวข้อ: ปาดเผยจากซ้าย */
    gsap.utils.toArray('.section .eyebrow').forEach(function (el) {
      gsap.from(el, { opacity: 0, x: -40, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });
    gsap.utils.toArray('.section .section-title').forEach(function (el) {
      gsap.fromTo(el, { clipPath: 'inset(0 100% 0 0)', x: -30 },
        { clipPath: 'inset(0 0% 0 0)', x: 0, duration: 1.1, ease: 'power4.out', clearProps: 'clipPath', scrollTrigger: { trigger: el, start: 'top 88%' } });
    });

    /* เลขหัวข้อตัวใหญ่ลอยช้ากว่าเนื้อหา */
    gsap.utils.toArray('.sec-num').forEach(function (el) {
      gsap.fromTo(el, { yPercent: 45 }, { yPercent: -45, ease: 'none', scrollTrigger: { trigger: el.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* การ์ดลอยขึ้นแบบ 3 มิติ */
    gsap.utils.toArray('.reveal').forEach(function (el) {
      var isAct = el.classList.contains('act-card');
      var i = isAct ? Array.prototype.indexOf.call(el.parentElement.querySelectorAll('.act-card'), el) : 0;
      var isDoc = el.classList.contains('doc-card');
      var j = isDoc ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      gsap.from(el, {
        opacity: 0,
        y: isAct ? 40 : 90,
        x: isAct ? (i % 2 ? 120 : -120) : 0,
        rotateX: isAct ? 0 : -22,
        rotateY: isAct ? (i % 2 ? -14 : 14) : 0,
        transformPerspective: 1000,
        transformOrigin: '50% 100%',
        duration: 1.1,
        delay: j * 0.14,
        ease: 'power3.out',
        clearProps: 'transform,opacity',
        scrollTrigger: { trigger: el, start: 'top 88%' }
      });
    });

    gsap.from('#pass', { opacity: 0, y: 60, rotateX: 18, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity', onStart: own('#pass').onStart, onComplete: own('#pass').onComplete, scrollTrigger: { trigger: '#pass', start: 'top 85%' } });
    gsap.from('.video-hud', { opacity: 0, scale: 0.9, duration: 1, ease: 'power3.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: '.video-hud', start: 'top 85%' } });
    gsap.from('.social', { opacity: 0, y: 30, stagger: 0.12, duration: 0.7, ease: 'power3.out', clearProps: 'transform,opacity', onStart: own('.social').onStart, onComplete: own('.social').onComplete, scrollTrigger: { trigger: '.socials', start: 'top 90%' } });
    gsap.from('.thanks', { opacity: 0, letterSpacing: '0.4em', duration: 1.4, ease: 'power2.out', scrollTrigger: { trigger: '.thanks', start: 'top 92%' } });

    /* รูป/ฟอนต์โหลดเสร็จแล้วความสูงหน้าเปลี่ยน ให้คำนวณจุดเริ่มแอนิเมชันใหม่ */
    window.addEventListener('load', function () { ST.refresh(); });
  }

  var pending = desktop ? 2 : 1;
  function ready() { if (--pending === 0) run(); }
  load(GSAP + 'gsap.min.js', function () { load(GSAP + 'ScrollTrigger.min.js', ready); });
  if (desktop) load(LENIS, ready);
})();

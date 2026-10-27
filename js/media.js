/* ACTIVITIES: แถบรูปกิจกรรมจาก content.js + lightbox ดูรูปเต็มจอ
   CONTACT: เครื่องเล่นคลิปวิดีโอจาก content.js */
(function () {
  'use strict';
  /* กันกรณีพิมพ์ content.js ผิดรูปแบบ: เว็บยังทำงานต่อได้ แค่ไม่มีรูป/คลิป */
  var content = window.SITE_CONTENT || {};
  var acts = (content.activities && typeof content.activities === 'object') ? content.activities : {};

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function fileName(path) { return String(path || '').split('/').pop(); }

  /* ---------------- lightbox (รูป + วิดีโอ) ---------------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbCap = document.getElementById('lbCap');
  var lbClose = document.getElementById('lbClose');
  var lbPrev = document.getElementById('lbPrev');
  var lbNext = document.getElementById('lbNext');
  var lbVid = null;
  var items = [], index = 0, opener = null;

  lbImg.addEventListener('error', function () {
    if (!lbImg.getAttribute('src')) return;
    lbImg.style.visibility = 'hidden';
    lbCap.textContent = 'โหลดรูปไม่ได้: ' + fileName(lbImg.getAttribute('src'));
  });
  function dropVideo() {
    if (!lbVid) return;
    lbVid.pause();
    lbVid.removeAttribute('src');
    lbVid.load();
    lbVid.remove();
    lbVid = null;
  }
  function caption(it) {
    return items.length > 1 ? (it.caption ? it.caption + ' · ' : '') + (index + 1) + ' / ' + items.length : (it.caption || '');
  }
  function show() {
    var it = items[index];
    dropVideo();
    lbImg.removeAttribute('src');          // กันรูปเก่าค้างระหว่างโหลดรูปใหม่
    if (it.video) {
      lbImg.hidden = true;
      lbVid = document.createElement('video');
      lbVid.className = 'lb-video';
      lbVid.controls = true;
      lbVid.autoplay = true;
      lbVid.playsInline = true;
      lbVid.setAttribute('playsinline', '');
      if (it.poster) lbVid.poster = it.poster;
      lbVid.src = it.src;
      lbVid.setAttribute('aria-label', it.caption || 'วิดีโอกิจกรรม');
      lbVid.addEventListener('error', function () { lbCap.textContent = 'เปิดคลิปไม่ได้: ' + fileName(it.src); });
      lbImg.parentNode.insertBefore(lbVid, lbImg);
    } else {
      lbImg.hidden = false;
      lbImg.style.visibility = '';
      lbImg.src = it.src;
      lbImg.alt = it.caption || '';
    }
    lbCap.textContent = caption(it);
  }
  function openLightbox(list, start) {
    items = list; index = start || 0;
    opener = document.activeElement;
    lb.classList.toggle('single', items.length < 2);
    show();
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    if (window.__lenis) window.__lenis.stop();
    if (window.SFX) window.SFX.ambientStop();   // ดูวิดีโอแล้วไม่ให้เสียงบรรยากาศทับ
    lbClose.focus();
  }
  function closeLightbox() {
    dropVideo();
    lb.hidden = true;
    lbImg.removeAttribute('src');
    document.body.style.overflow = '';
    if (window.__lenis) window.__lenis.start();
    if (window.SFX && window.SFX.enabled) window.SFX.ambientStart();
    if (opener && opener.focus) opener.focus({ preventScroll: true });
    if (lb.contains(document.activeElement)) document.activeElement.blur();
  }
  function step(dir) {
    if (items.length < 2) return;
    var i = index;
    for (var n = 0; n < items.length; n++) {   // ข้ามรูปที่โหลดไม่ได้
      i = window.Lib.nextIndex(i, items.length, dir);
      if (!items[i].broken) break;
    }
    index = i;
    show();
  }

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', function () { step(-1); });
  lbNext.addEventListener('click', function () { step(1); });
  lb.addEventListener('click', function (e) { if (e.target === lb || e.target.tagName === 'FIGURE') closeLightbox(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'Tab') {             // วน focus อยู่ในกล่อง lightbox
      var f = [lbClose, lbPrev, lbNext].concat(lbVid ? [lbVid] : []).filter(function (b) { return b.offsetParent !== null; });
      var i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[window.Lib.nextIndex(i < 0 ? 0 : i, f.length, e.shiftKey ? -1 : 1)].focus();
    }
  });
  window.openLightbox = openLightbox;

  /* รูปในแผง PROFILE */
  var profilePhoto = document.getElementById('profilePhoto');
  if (profilePhoto) profilePhoto.addEventListener('click', function () {
    openLightbox([{ src: 'assets/img/march-profile.jpg', caption: 'ธนศักดิ์ ดำดี' }], 0);
  });

  /* ---------------- กิจกรรม: แถบวิดีโอ + รูป ---------------- */
  var PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';
  function valid(arr) { return Array.isArray(arr) ? arr.filter(function (p) { return p && typeof p.file === 'string'; }) : []; }

  Array.prototype.forEach.call(document.querySelectorAll('.act-card'), function (card) {
    var id = card.getAttribute('data-activity');
    var strip = card.querySelector('.act-strip');
    var cert = card.querySelector('.act-cert[data-cert]');
    var title = card.querySelector('h3').textContent;
    var act = acts[id] || {};
    /* วิดีโอแรกขึ้นก่อน แล้วสลับรูปกับวิดีโอ */
    var media = window.Lib.mixMedia(
      valid(act.videos).map(function (v) { return { file: v.file, poster: v.poster, caption: v.caption, video: true }; }),
      valid(act.photos));
    var list = [];
    if (cert) list.push({ src: cert.getAttribute('data-cert'), caption: cert.getAttribute('data-cert-label') || ('เกียรติบัตร · ' + title) });
    var offset = list.length;
    media.forEach(function (m) { list.push({ src: m.file, poster: m.poster, video: !!m.video, caption: m.caption || title }); });

    if (cert) cert.addEventListener('click', function () { openLightbox(list, 0); });
    if (!strip) return;                     // กิจกรรมที่ไม่มีแถบรูป (เช่น U-FUTURE)

    if (!media.length) {
      strip.appendChild(el('div', 'strip-empty', 'รอรูปกิจกรรม'));
      return;
    }
    strip.setAttribute('tabindex', '0');
    strip.setAttribute('aria-label', 'รูปและวิดีโอกิจกรรม ' + title + ' เลื่อนดูได้');
    media.forEach(function (m, i) {
      var b = el('button', 'strip-item' + (m.video ? ' is-video' : ''));
      b.type = 'button';
      b.setAttribute('aria-label', (m.video ? 'เล่นวิดีโอ: ' : 'ดูรูปขยาย: ') + (m.caption || title));
      var thumb = m.video ? m.poster : m.file;
      if (thumb) {
        var img = el('img');
        img.src = thumb;
        img.alt = m.caption || title;
        img.loading = 'lazy';
        img.decoding = 'async';
        img.addEventListener('error', function () {
          if (m.video) { img.remove(); return; }   // วิดีโอไม่มีรูปปกก็ยังกดเล่นได้
          list[offset + i].broken = true;
          b.replaceWith(el('div', 'strip-error', 'โหลดรูปไม่ได้: ' + fileName(m.file)));
        });
        b.appendChild(img);
      }
      if (m.video) {
        var badge = el('span', 'play-badge');
        badge.innerHTML = PLAY;
        b.appendChild(badge);
      }
      b.addEventListener('click', function () { openLightbox(list, offset + i); });
      strip.appendChild(b);
    });
  });

  /* ---------------- วิดีโอ ---------------- */
  var stage = document.getElementById('videoStage');
  var tabs = document.getElementById('videoTabs');
  var videos = Array.isArray(content.videos) ? content.videos.filter(function (v) { return v && typeof v.file === 'string'; }) : [];
  var PLAY_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15" rx="3"/><path d="M10 9l5 3-5 3z"/></svg>';

  function placeholder(msg, isError) {
    var box = el('div', 'video-empty' + (isError ? ' error' : ''));
    box.innerHTML = PLAY_ICON;
    box.appendChild(el('p', '', msg));
    stage.replaceChildren(box);
  }
  function play(i) {
    var v = videos[i];
    var video = document.createElement('video');
    video.controls = true;
    video.preload = 'metadata';            // โหลดแค่ส่วนหัวของไฟล์ เพื่อรู้ทันทีถ้าไฟล์หาย และได้ภาพเฟรมแรก
    video.playsInline = true;
    video.setAttribute('playsinline', '');
    if (v.poster) video.poster = v.poster;
    video.setAttribute('aria-label', v.caption || 'คลิปวิดีโอ');
    var src = document.createElement('source');
    src.src = v.file;
    src.type = /\.webm$/i.test(v.file) ? 'video/webm' : 'video/mp4';
    src.addEventListener('error', function () { placeholder('เปิดคลิปไม่ได้: ' + fileName(v.file), true); });
    video.appendChild(src);
    /* คลิปแนวตั้งจากมือถือ: ปรับกรอบให้สูงแทนที่จะมีแถบดำสองข้าง */
    video.addEventListener('loadedmetadata', function () {
      stage.classList.toggle('portrait', video.videoHeight > video.videoWidth);
    });
    stage.replaceChildren(video);
    Array.prototype.forEach.call(tabs.children, function (t, k) { t.setAttribute('aria-selected', String(k === i)); });
  }

  if (!videos.length) {
    placeholder('รอคลิปวิดีโอ');
  } else {
    if (videos.length > 1) {
      videos.forEach(function (v, i) {
        var t = el('button', '', v.caption || ('คลิป ' + (i + 1)));
        t.type = 'button';
        t.setAttribute('role', 'tab');
        t.addEventListener('click', function () { play(i); });
        tabs.appendChild(t);
      });
    }
    play(0);
  }
})();

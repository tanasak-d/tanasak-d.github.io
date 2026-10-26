/* ฟังก์ชันที่ทดสอบได้ ใช้ได้ทั้งในเบราว์เซอร์ (window.Lib) และ Node (require) */
(function (root) {
  'use strict';

  var ACTIVITY_IDS = ['flight-school', 'u-future', 'bootcamp', 'drone-soccer', 'iyrc'];
  var PHOTO_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
  var VIDEO_EXT = ['.mp4', '.webm'];
  var MB = 1024 * 1024;
  var PHOTO_MAX = 3 * MB;
  var VIDEO_MAX = 20 * MB;

  function ext(file) {
    var m = /\.[^./\\]+$/.exec(file || '');
    return m ? m[0].toLowerCase() : '';
  }

  function isObj(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

  function checkFile(file, allowed, max, kindHint, fileInfo, errs) {
    if (typeof file !== 'string' || !file) {
      errs.push('มีรายการที่ไม่มี file: \'...\' (ต้องใส่ที่อยู่ไฟล์ เช่น file: \'assets/activities/bootcamp/photo1.jpg\')');
      return;
    }
    var e = ext(file);
    if (allowed.indexOf(e) === -1) {
      errs.push('ไฟล์ "' + file + '" เป็นนามสกุล ' + (e || '(ไม่มี)') + ' ใช้บนเว็บไม่ได้ ' + kindHint);
      return;
    }
    var info = fileInfo(file);
    if (!info.exists) {
      errs.push('หาไฟล์ "' + file + '" ไม่เจอ ตรวจชื่อไฟล์และโฟลเดอร์ใน content.js อีกครั้ง');
    } else if (info.actual) {
      errs.push('ไฟล์ "' + file + '" ตัวพิมพ์เล็ก/ใหญ่ไม่ตรงกับชื่อไฟล์จริง "' + info.actual + '" (บนเว็บจริงจะเปิดไม่ได้) ให้พิมพ์ชื่อให้ตรงทุกตัวอักษร');
    } else if (info.bytes > max) {
      errs.push('ไฟล์ "' + file + '" ใหญ่ ' + (info.bytes / MB).toFixed(1) + ' MB เกินกำหนด ' + (max / MB) + ' MB กรุณาย่อขนาดก่อน');
    }
  }

  function validateContent(content, fileInfo) {
    var errs = [];
    if (!isObj(content)) return ['content.js ต้องมี SITE_CONTENT = { activities: {...}, videos: [...] }'];
    Object.keys(content).forEach(function (k) {
      if (k !== 'activities' && k !== 'videos') errs.push('ไม่รู้จักหัวข้อ "' + k + '" ใน content.js (ใช้ได้เฉพาะ activities และ videos)');
    });
    if (!isObj(content.activities)) {
      errs.push('ไม่พบ activities: { ... } ใน content.js หรือพิมพ์ชื่อผิด');
    } else {
      Object.keys(content.activities).forEach(function (id) {
        if (ACTIVITY_IDS.indexOf(id) === -1) {
          errs.push('ไม่รู้จักกิจกรรม "' + id + '" ใช้ได้เฉพาะ: ' + ACTIVITY_IDS.join(', '));
          return;
        }
        var act = content.activities[id];
        if (!isObj(act) || !Array.isArray(act.photos)) {
          var keys = isObj(act) ? Object.keys(act).join(', ') : String(act);
          errs.push('กิจกรรม "' + id + '" ต้องเขียนเป็น { photos: [ ... ] } (ตอนนี้เป็น ' + (keys || 'ว่าง') + ')');
          return;
        }
        act.photos.forEach(function (p) {
          checkFile(p && p.file, PHOTO_EXT, PHOTO_MAX, '(ใช้ .jpg .png หรือ .webp ถ้าเป็น .heic จาก iPhone ให้แปลงก่อน)', fileInfo, errs);
        });
        if (act.videos !== undefined) {
          if (!Array.isArray(act.videos)) {
            errs.push('videos ของกิจกรรม "' + id + '" ต้องเป็นรายการในวงเล็บ [ ... ]');
          } else {
            act.videos.forEach(function (v) {
              checkFile(v && v.file, VIDEO_EXT, VIDEO_MAX, '(ใช้ .mp4 ถ้าเป็น .MOV จาก iPhone ให้แปลงเป็น mp4 ก่อน)', fileInfo, errs);
              if (v && v.poster) checkFile(v.poster, PHOTO_EXT, PHOTO_MAX, '(รูปปกใช้ .jpg .png หรือ .webp)', fileInfo, errs);
            });
          }
        }
      });
    }
    if (!Array.isArray(content.videos)) {
      errs.push('videos ต้องเป็นรายการในวงเล็บ [ ... ] หรือพิมพ์ชื่อผิด');
    } else {
      content.videos.forEach(function (v) {
        checkFile(v && v.file, VIDEO_EXT, VIDEO_MAX, '(ใช้ .mp4 ถ้าเป็น .MOV จาก iPhone ให้แปลงเป็น mp4 ก่อน)', fileInfo, errs);
        if (v && v.poster) checkFile(v.poster, PHOTO_EXT, PHOTO_MAX, '(รูปปกใช้ .jpg .png หรือ .webp)', fileInfo, errs);
      });
    }
    return errs;
  }

  /* หัวข้อที่กำลังอ่านอยู่ = หัวข้อสุดท้ายที่ขอบบนเลื่อนพ้น 35% ของจอแล้ว */
  function activeSection(sections, scrollY, viewportH) {
    var line = scrollY + viewportH * 0.35;
    var id = sections.length ? sections[0].id : null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].top <= line) id = sections[i].id;
    }
    return id;
  }

  function shouldPlayIntro(opts) {
    return !opts.reducedMotion && !opts.seen;
  }

  /* จุดบนกริดทุก step พิกเซลที่ทึบกว่า threshold (ใช้สร้างชื่อจากจุดแสง) */
  function samplePoints(alpha, w, h, step, threshold) {
    var pts = [];
    for (var y = 0; y < h; y += step) {
      for (var x = 0; x < w; x += step) {
        if (alpha[(y * w + x) * 4 + 3] > threshold) pts.push({ x: x, y: y });
      }
    }
    return pts;
  }

  /* ขนาดฟอนต์ใหญ่สุดที่ข้อความกว้างไม่เกิน maxWidth (ลดทีละ 2px) */
  function fitFontSize(measure, maxWidth, startPx, minPx) {
    for (var px = startPx; px >= minPx; px -= 2) {
      if (measure(px) <= maxWidth) return px;
    }
    return minPx;
  }

  /* ละติจูด/ลองจิจูด → พิกัด 3 มิติ (ตรงกับการแปะ texture แผนที่โลกบน SphereGeometry ของ Three.js) */
  function latLonToVec3(lat, lon, r) {
    var phi = (90 - lat) * Math.PI / 180, th = (lon + 180) * Math.PI / 180;
    return [-r * Math.sin(phi) * Math.cos(th), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(th)];
  }

  var SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@';
  /* ข้อความถอดรหัสทีละตัว: ตัวที่ i กลายเป็นตัวจริงเมื่อ frame > i*3+8 */
  function scrambleFrame(final, frame, rand) {
    var out = '';
    for (var i = 0; i < final.length; i++) {
      var c = final[i];
      out += (c === ' ' || frame > i * 3 + 8) ? c : SCRAMBLE_CHARS[Math.floor(rand() * SCRAMBLE_CHARS.length) % SCRAMBLE_CHARS.length];
    }
    return out;
  }

  function nextIndex(i, len, dir) {
    return ((i + dir) % len + len) % len;
  }

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  /* สัดส่วนที่เลื่อนหน้ามาแล้ว 0 (บนสุด) ถึง 1 (ล่างสุด) */
  function scrollProgress(scrollY, docH, viewH) {
    var max = docH - viewH;
    return max > 0 ? clamp(scrollY / max, 0, 1) : 0;
  }

  /* ความสูงแบบนักบิน: FL000 ถึง FL400 ทีละ 10 */
  function altitudeLabel(p) {
    var fl = Math.round(clamp(p, 0, 1) * 40) * 10;
    return 'FL' + ('00' + fl).slice(-3);
  }

  /* ยิ่งเลื่อนลง (ไต่สูง) เครื่องบินยิ่งจาง ยานอวกาศยิ่งชัด */
  function skyMix(p) {
    return { air: clamp(1 - p * 1.6, 0.12, 1), space: clamp(0.2 + p * 1.4, 0.2, 1) };
  }

  /* ค่าที่จำไว้ว่าผู้ชมเปิดเสียงไหม: true / false / null (ยังไม่เคยเลือก) */
  function parseSoundPref(v) {
    return v === '1' ? true : v === '0' ? false : null;
  }

  /* ลำดับในแถบกิจกรรม: วิดีโอแรกขึ้นก่อน แล้วสลับรูป-วิดีโอ ที่เหลือต่อท้าย */
  function mixMedia(videos, photos) {
    var out = videos.length ? [videos[0]] : [];
    var v = videos.slice(1), p = photos.slice();
    while (v.length || p.length) {
      if (p.length) out.push(p.shift());
      if (v.length) out.push(v.shift());
    }
    return out;
  }

  var Lib = {
    mixMedia: mixMedia,
    parseSoundPref: parseSoundPref,
    scrollProgress: scrollProgress,
    altitudeLabel: altitudeLabel,
    skyMix: skyMix,
    nextIndex: nextIndex,
    latLonToVec3: latLonToVec3,
    scrambleFrame: scrambleFrame,
    ACTIVITY_IDS: ACTIVITY_IDS,
    validateContent: validateContent,
    activeSection: activeSection,
    shouldPlayIntro: shouldPlayIntro,
    samplePoints: samplePoints,
    fitFontSize: fitFontSize
  };

  root.Lib = Lib;
  if (typeof module !== 'undefined' && module.exports) module.exports = Lib;
})(typeof window !== 'undefined' ? window : globalThis);

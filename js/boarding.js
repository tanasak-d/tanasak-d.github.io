/* EDUCATION: ตั๋วเครื่องบินเอียงตามเมาส์ + แสงโฮโลแกรม  กด BOARD NOW แล้วตั๋วฉีก เครื่องบินบิน PKN → SPU แล้วการ์ดโรงเรียนโผล่ */
(function () {
  'use strict';
  var section = document.getElementById('education');
  var pass = document.getElementById('pass');
  var board = document.getElementById('passBoard');
  var again = document.getElementById('passAgain');
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  if (reduced) { section.classList.add('boarded'); return; }

  if (fine) {
    pass.addEventListener('pointermove', function (e) {
      if (section.classList.contains('boarded')) return;
      var r = pass.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      pass.style.setProperty('--ry', (x * 14) + 'deg');
      pass.style.setProperty('--rx', (-y * 10) + 'deg');
      pass.style.setProperty('--mx', (x * 100 + 50) + '%');
    });
    pass.addEventListener('pointerleave', function () {
      pass.style.setProperty('--rx', '0deg');
      pass.style.setProperty('--ry', '0deg');
    });
  }

  board.addEventListener('click', function () {
    pass.style.setProperty('--rx', '0deg');
    pass.style.setProperty('--ry', '0deg');
    section.classList.add('boarded');
    if (window.SFX) { window.SFX.chime(); setTimeout(function () { window.SFX.warp(); }, 700); }
    setTimeout(function () { again.focus({ preventScroll: true }); }, 2700);
  });
  /* กด Tab มาถึงลิงก์ในการ์ดที่ยังซ่อนอยู่ ให้เปิดการ์ดเลย */
  section.querySelector('.edu-cards').addEventListener('focusin', function () { section.classList.add('boarded'); });
  again.addEventListener('click', function () {
    section.classList.remove('boarded');
    board.focus({ preventScroll: true });
  });
})();

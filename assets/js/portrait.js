/* ==========================================================================
   portrait.js — ASCII portrait: fit-to-width, decode-in, cursor glitch lens,
   and the occasional horizontal tear.
   ========================================================================== */
(function () {
  'use strict';

  var pre = document.getElementById('portrait');
  if (!pre) return;
  var stage = pre.parentNode, panel = document.getElementById('portraitPanel');
  var status = document.getElementById('portraitStatus');
  var reduced = window.MN && window.MN.reduced;

  var target = pre.textContent.replace(/\s+$/, '').split('\n');
  var rows = target.length, cols = 0;
  target.forEach(function (l) { cols = Math.max(cols, l.length); });
  target = target.map(function (l) { return l + ' '.repeat(cols - l.length); });

  var GL = '01<>/\\|=+*#%@$?!';
  var SOFT = ".:'`,";
  var heat = new Float32Array(rows * cols);
  var delay = new Float32Array(rows * cols);
  var charW = 0, lineH = 0;

  /* ---------- fit to container ---------- */
  var ratio = 0.6;
  function measure() {
    var c = document.createElement('canvas').getContext('2d');
    c.font = '700 100px "JetBrains Mono", monospace';
    var w = c.measureText('MMMMMMMMMM').width / 1000;
    if (w > 0.3 && w < 1) ratio = w;
  }
  function fit() {
    var cs = getComputedStyle(stage);
    var avail = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var fs = Math.min(14, avail / (cols * ratio));
    charW = fs * ratio;
    lineH = charW / 0.55;
    pre.style.fontSize = fs.toFixed(3) + 'px';
    pre.style.lineHeight = lineH.toFixed(3) + 'px';
  }
  measure(); fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { measure(); fit(); });
  var rT;
  window.addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(fit, 80); });

  if (reduced) { pre.textContent = target.join('\n'); if (status) status.textContent = 'locked'; return; }

  /* ---------- render loop ---------- */
  var decodeStart = -1, decoded = false;
  var tear = null;          // { r0, r1, shift, until }
  var running = false, visible = true;

  function rnd(s) { return s[(Math.random() * s.length) | 0]; }

  function render(now) {
    var out = [], busy = false, t = decodeStart < 0 ? -1 : now - decodeStart;
    for (var r = 0; r < rows; r++) {
      var line = target[r], s = '';
      var shift = tear && r >= tear.r0 && r <= tear.r1 ? tear.shift : 0;
      for (var c = 0; c < cols; c++) {
        var i = r * cols + c;
        var src = shift ? line[(c - shift + cols) % cols] : line[c];
        var ch = src;
        if (!decoded) {
          var d = delay[i];
          if (t < d - 260) ch = ' ';
          else if (t < d) ch = src === ' ' ? (Math.random() < 0.06 ? rnd(SOFT) : ' ') : rnd(GL);
        }
        var h = heat[i];
        if (h > 0.02) {
          busy = true;
          if (h > 0.18 && src !== ' ') ch = rnd(GL);
          else if (h > 0.5) ch = rnd(SOFT);
          heat[i] = h * 0.86;
        } else heat[i] = 0;
        s += ch;
      }
      out.push(s);
    }
    pre.textContent = out.join('\n');

    if (!decoded) {
      if (t > maxDelay) { decoded = true; if (status) status.textContent = 'locked'; }
      else busy = true;
    }
    if (tear) { if (now > tear.until) tear = null; busy = true; }
    return busy;
  }

  function loop(now) {
    if (!visible) { running = false; return; }
    var busy = render(now);
    if (busy) requestAnimationFrame(loop);
    else { running = false; pre.textContent = target.join('\n'); }
  }
  function kick() {
    if (running || !visible || decodeStart < 0) return;
    running = true;
    requestAnimationFrame(loop);
  }

  /* ---------- decode-in ---------- */
  var maxDelay = 0;
  for (var r = 0; r < rows; r++) for (var c = 0; c < cols; c++) {
    var d = 200 + r * 22 + Math.random() * 520 + Math.abs(c - cols / 2) * 3;
    delay[r * cols + c] = d;
    if (d > maxDelay) maxDelay = d;
  }
  pre.textContent = '';

  function startDecode() {
    if (decodeStart >= 0) return;
    decodeStart = performance.now();
    kick();
  }

  /* ---------- pointer glitch lens ---------- */
  function burn(x, y, R) {
    var rect = pre.getBoundingClientRect();
    var cc = (x - rect.left) / charW, rr = (y - rect.top) / lineH;
    var Ry = R * 0.55;
    for (var r = Math.max(0, Math.floor(rr - Ry)); r <= Math.min(rows - 1, Math.ceil(rr + Ry)); r++) {
      for (var c = Math.max(0, Math.floor(cc - R)); c <= Math.min(cols - 1, Math.ceil(cc + R)); c++) {
        var dx = (c - cc) / R, dy = (r - rr) / Ry, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 1) {
          var i = r * cols + c, v = 1 - dist;
          if (v > heat[i]) heat[i] = v;
        }
      }
    }
    kick();
  }
  stage.addEventListener('pointermove', function (e) { if (decoded) burn(e.clientX, e.clientY, 6); });
  stage.addEventListener('pointerdown', function (e) { if (decoded) burn(e.clientX, e.clientY, 11); });

  /* ---------- random tears ---------- */
  function scheduleTear() {
    setTimeout(function () {
      if (decoded && visible && !document.hidden) {
        var r0 = (Math.random() * rows) | 0;
        tear = { r0: r0, r1: Math.min(rows - 1, r0 + 1 + ((Math.random() * 3) | 0)), shift: (Math.random() < 0.5 ? -1 : 1) * (2 + ((Math.random() * 6) | 0)), until: performance.now() + 140 };
        kick();
      }
      scheduleTear();
    }, 2400 + Math.random() * 3600);
  }
  scheduleTear();

  /* ---------- visibility ---------- */
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) {
      visible = en[0].isIntersecting;
      if (visible) {
        if (window.MN && window.MN.ready) startDecode();
        kick();
      }
    }, { threshold: 0.1 }).observe(panel || stage);
  }
  function ready() { if (visible) startDecode(); }
  if (window.MN && window.MN.ready) ready();
  else window.addEventListener('mn:ready', ready);
})();

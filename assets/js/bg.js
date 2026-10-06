/* ==========================================================================
   bg.js — reactive dot-grid with packets tracing circuit paths
   ========================================================================== */
(function () {
  'use strict';

  var cv = document.getElementById('bgCanvas');
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext('2d');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var W, H, dpr, S, cols, rows;
  var acc = '255,74,28';
  var mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999 };
  var packets = [];
  var lastSpawn = 0;

  function readAcc() {
    var v = getComputedStyle(document.documentElement).getPropertyValue('--acc-rgb').trim();
    if (v) acc = v.replace(/\s+/g, '');
  }

  function resize() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = window.innerWidth; H = window.innerHeight;
    cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    S = W < 700 ? 30 : 36;
    cols = Math.ceil(W / S) + 2; rows = Math.ceil(H / S) + 2;
    if (reduced) draw(0);
  }

  function spawn() {
    var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    var d = dirs[(Math.random() * 4) | 0];
    var gx = (Math.random() * cols) | 0, gy = (Math.random() * rows) | 0;
    packets.push({
      x: gx * S, y: gy * S, dx: d[0], dy: d[1],
      v: 1.4 + Math.random() * 1.8, trail: [], life: 0, max: 220 + Math.random() * 260
    });
  }

  function step(p) {
    p.x += p.dx * p.v; p.y += p.dy * p.v; p.life++;
    p.trail.push(p.x, p.y);
    if (p.trail.length > 90) p.trail.splice(0, 2);
    // at grid intersections, sometimes turn 90°
    var onNode = Math.abs(p.x / S - Math.round(p.x / S)) * S < p.v && Math.abs(p.y / S - Math.round(p.y / S)) * S < p.v;
    if (onNode && Math.random() < 0.22) {
      p.x = Math.round(p.x / S) * S; p.y = Math.round(p.y / S) * S;
      var sign = Math.random() < 0.5 ? 1 : -1;
      if (p.dx !== 0) { p.dx = 0; p.dy = sign; } else { p.dy = 0; p.dx = sign; }
    }
  }

  function draw(now) {
    ctx.clearRect(0, 0, W, H);
    var off = -(window.scrollY * 0.12) % S;

    // base grid
    ctx.fillStyle = 'rgba(242,236,228,0.075)';
    for (var y = 0; y < rows; y++) {
      var py = y * S + off;
      for (var x = 0; x < cols; x++) ctx.fillRect(x * S - 0.75, py - 0.75, 1.5, 1.5);
    }

    // cursor field
    mouse.x += (mouse.tx - mouse.x) * 0.18;
    mouse.y += (mouse.ty - mouse.y) * 0.18;
    var R = 170;
    if (mouse.x > -R) {
      var x0 = Math.max(0, Math.floor((mouse.x - R) / S)), x1 = Math.min(cols, Math.ceil((mouse.x + R) / S));
      var y0 = Math.max(0, Math.floor((mouse.y - R - off) / S)), y1 = Math.min(rows, Math.ceil((mouse.y + R - off) / S));
      for (var gy = y0; gy <= y1; gy++) {
        for (var gx = x0; gx <= x1; gx++) {
          var px = gx * S, pyy = gy * S + off, dx = px - mouse.x, dy = pyy - mouse.y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < R) {
            var k = 1 - d / R, push = k * k * 10;
            var nx = px + (dx / (d || 1)) * push, ny = pyy + (dy / (d || 1)) * push;
            ctx.fillStyle = 'rgba(' + acc + ',' + (k * 0.85).toFixed(3) + ')';
            var sz = 1.5 + k * 2;
            ctx.fillRect(nx - sz / 2, ny - sz / 2, sz, sz);
          }
        }
      }
    }

    // packets
    if (now - lastSpawn > 520 && packets.length < (W < 700 ? 4 : 8)) { spawn(); lastSpawn = now; }
    ctx.lineWidth = 1;
    for (var i = packets.length - 1; i >= 0; i--) {
      var p = packets[i];
      step(p);
      var tr = p.trail, n = tr.length / 2;
      var fade = p.life > p.max - 40 ? Math.max(0, (p.max - p.life) / 40) : 1;
      for (var j = 1; j < n; j++) {
        ctx.strokeStyle = 'rgba(' + acc + ',' + ((j / n) * 0.55 * fade).toFixed(3) + ')';
        ctx.beginPath();
        ctx.moveTo(tr[(j - 1) * 2], tr[(j - 1) * 2 + 1] + off);
        ctx.lineTo(tr[j * 2], tr[j * 2 + 1] + off);
        ctx.stroke();
      }
      ctx.fillStyle = 'rgba(' + acc + ',' + (0.95 * fade).toFixed(3) + ')';
      ctx.fillRect(p.x - 1.5, p.y + off - 1.5, 3, 3);
      if (p.life > p.max || p.x < -S * 2 || p.x > W + S * 2 || p.y < -S * 2 || p.y > H + S * 2) packets.splice(i, 1);
    }
  }

  function loop(now) {
    if (!document.hidden) draw(now);
    requestAnimationFrame(loop);
  }

  window.addEventListener('resize', resize);
  window.addEventListener('themechange', readAcc);
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    mouse.tx = e.clientX; mouse.ty = e.clientY;
    if (mouse.x < -1000) { mouse.x = e.clientX; mouse.y = e.clientY; }
  }, { passive: true });
  document.addEventListener('mouseleave', function () { mouse.tx = mouse.ty = -9999; mouse.x = mouse.y = -9999; });

  readAcc();
  resize();
  if (!reduced) requestAnimationFrame(loop);
})();

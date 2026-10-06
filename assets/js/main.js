/* ==========================================================================
   main.js — boot sequence, nav, reveals, text effects, clock, themes
   ========================================================================== */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  function store(k, v) {
    try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; }
  }
  function sstore(k, v) {
    try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch (e) { return null; }
  }

  /* ---------- toast + clipboard ---------- */
  var toastEl = $('#toast'), toastT;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('is-on'); }, 2200);
  }
  function copy(text) {
    var done = function () { toast('> copied: ' + text); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { fallback(text); done(); });
    } else { fallback(text); done(); }
  }
  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- themes ---------- */
  var THEMES = ['redteam', 'phosphor', 'amber', 'mono'];
  function setTheme(name) {
    if (THEMES.indexOf(name) < 0) return false;
    document.documentElement.setAttribute('data-theme', name);
    store('mn-theme', name);
    var n = $('#themeName'); if (n) n.textContent = name;
    window.dispatchEvent(new CustomEvent('themechange', { detail: name }));
    return true;
  }
  function currentTheme() { return document.documentElement.getAttribute('data-theme') || 'redteam'; }

  /* expose a tiny API for terminal.js / portrait.js */
  window.MN = { toast: toast, copy: copy, setTheme: setTheme, themes: THEMES, currentTheme: currentTheme, reduced: reduced };

  /* ---------- boot sequence (once per session, home only) ---------- */
  function boot(done) {
    if (reduced || sstore('mn-booted') || !document.body.classList.contains('home')) return done();
    sstore('mn-booted', '1');
    var lines = [
      ['[  0.000000] ', 'nayem-os 6.10.0-redteam #1 SMP PREEMPT_DYNAMIC'],
      ['[  0.004219] ', 'cpu0: caffeine-driven core detected, 1 thread, unlimited curiosity'],
      ['[  0.031337] ', 'mounting /home/moosa ', 'ok'],
      ['[  0.069420] ', 'loading modules: burp nmap sqlmap ffuf metasploit ', 'ok'],
      ['[  0.203001] ', 'job: central-bank-of-bahrain/gp15 ', 'active'],
      ['[  0.240000] ', 'establishing session with visitor ', 'ok'],
      ['', '> access granted. welcome.']
    ];
    // one line per cert, straight from _data/certs.yml
    var certs = (window.SITE && window.SITE.certs) || [];
    certs.slice().reverse().forEach(function (c, k) {
      var st = c.status === 'done' ? 'verified' : c.status === 'progress' ? c.progress + '%' : 'queued';
      lines.splice(4, 0, ['[  0.1' + String(80 - k * 9).padStart(2, '0') + '337] ', 'cert/' + c.id + ' ', st]);
    });
    var el = document.createElement('div');
    el.className = 'boot';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="boot__skip">click / any key to skip</span>';
    document.body.appendChild(el);
    var i = 0, finished = false;
    function finish() {
      if (finished) return; finished = true;
      el.classList.add('is-done');
      setTimeout(function () { el.remove(); }, 600);
      window.removeEventListener('keydown', finish);
      done();
    }
    el.addEventListener('click', finish);
    window.addEventListener('keydown', finish);
    (function next() {
      if (finished) return;
      if (i >= lines.length) return setTimeout(finish, 380);
      var l = lines[i++], p = document.createElement('p');
      var a = document.createElement('span'); a.textContent = l[0]; p.appendChild(a);
      var b = document.createElement('span'); b.textContent = l[1]; if (!l[0]) b.className = 'hi'; p.appendChild(b);
      if (l[2]) {
        var dots = document.createElement('span'); dots.textContent = '.'.repeat(Math.max(2, 46 - l[1].length)) + ' '; p.appendChild(dots);
        var c = document.createElement('span'); c.className = 'ok'; c.textContent = l[2]; p.appendChild(c);
      }
      el.insertBefore(p, el.lastChild);
      setTimeout(next, 90 + Math.random() * 110);
    })();
  }

  /* ---------- nav ---------- */
  var topbar = $('#topbar'), burger = $('#burger'), nav = $('#nav');
  function closeNav() {
    if (!nav) return;
    nav.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    $$('a', nav).forEach(function (a) { a.addEventListener('click', closeNav); });
    window.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeNav(); });
  }
  function onScroll() { if (topbar) topbar.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // highlight the section in view
  var navLinks = $$('[data-sec]');
  if ('IntersectionObserver' in window && navLinks.length) {
    var secIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        navLinks.forEach(function (a) { a.classList.toggle('is-active', a.dataset.sec === en.target.id); });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach(function (a) { var s = document.getElementById(a.dataset.sec); if (s) secIO.observe(s); });
  }

  /* ---------- clock + uptime ---------- */
  var clock = $('#clock'), uptime = $('#uptime'), t0 = Date.now();
  var fmt;
  try { fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Bahrain', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }); } catch (e) {}
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function tick() {
    if (clock && fmt) clock.textContent = fmt.format(new Date());
    if (uptime) {
      var s = Math.floor((Date.now() - t0) / 1000);
      uptime.textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s / 60) % 60) + ':' + pad(s % 60);
    }
  }
  tick(); setInterval(tick, 1000);

  /* ---------- theme cycle button ---------- */
  var cycle = $('#themeCycle');
  if (cycle) {
    $('#themeName').textContent = currentTheme();
    cycle.addEventListener('click', function () {
      var i = THEMES.indexOf(currentTheme());
      var next = THEMES[(i + 1) % THEMES.length];
      setTheme(next);
      toast('> theme set: ' + next);
    });
  }

  /* ---------- qr dialog ---------- */
  var qr = $('#qrDialog'), qrOpen = $('#qrOpen');
  if (qr && qrOpen) {
    if (typeof qr.showModal !== 'function') qrOpen.style.display = 'none';
    qrOpen.addEventListener('click', function () { qr.showModal(); });
    $$('[data-qr-close]', qr).forEach(function (b) { b.addEventListener('click', function () { qr.close(); }); });
    // click on the backdrop closes it
    qr.addEventListener('click', function (e) { if (e.target === qr) qr.close(); });
  }

  /* ---------- copy handlers ---------- */
  $$('[data-copy-text]').forEach(function (b) {
    b.addEventListener('click', function () { copy(b.getAttribute('data-copy-text')); });
  });
  var cmdbox = $('[data-cmdbox]');
  if (cmdbox) {
    var out = $('[data-cmd-out]', cmdbox), tabs = $$('[data-cmd]', cmdbox), active = tabs[0];
    tabs.forEach(function (t) {
      t.addEventListener('click', function () {
        tabs.forEach(function (x) { x.classList.toggle('is-on', x === t); x.setAttribute('aria-selected', String(x === t)); });
        active = t;
        scramble(out, t.getAttribute('data-cmd'), 380);
      });
    });
    $('[data-cmd-copy]', cmdbox).addEventListener('click', function () { copy(active.getAttribute('data-copy')); });
  }

  /* ---------- text scramble ---------- */
  var GLYPHS = '!<>-_\\/[]{}=+*^?#$%&@01ABCDEFX';
  function scramble(el, finalText, dur) {
    if (reduced) { el.textContent = finalText; return; }
    var from = el.textContent, len = Math.max(from.length, finalText.length);
    var start = performance.now(); dur = dur || 900;
    var q = [];
    for (var i = 0; i < len; i++) {
      var s = Math.random() * dur * 0.45, e = s + dur * 0.3 + Math.random() * dur * 0.25;
      q.push({ from: from[i] || '', to: finalText[i] || '', s: s, e: e });
    }
    cancelAnimationFrame(el._scr);
    (function frame(now) {
      var t = now - start, out = '', done = 0;
      for (var i = 0; i < q.length; i++) {
        var c = q[i];
        if (t >= c.e) { out += c.to; done++; }
        else if (t >= c.s) { out += c.to === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]; }
        else out += c.from;
      }
      el.textContent = out;
      if (done < q.length) el._scr = requestAnimationFrame(frame);
    })(start);
  }
  window.MN.scramble = scramble;

  /* ---------- typed roles ---------- */
  var typed = $('#typed');
  if (typed && !reduced) {
    var roles = ['penetration tester.', 'cbb gp15 graduate trainee.', 'eJPT certified.', 'first-class cybersecurity grad.', 'web & api breaker.', 'oscp: in progress...'];
    var ri = 0, ci = roles[0].length, deleting = true;
    (function typeLoop() {
      var word = roles[ri];
      if (deleting) {
        ci--;
        typed.textContent = word.slice(0, ci);
        if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; return setTimeout(typeLoop, 260); }
        return setTimeout(typeLoop, 28);
      }
      word = roles[ri]; ci++;
      typed.textContent = word.slice(0, ci);
      if (ci >= word.length) { deleting = true; return setTimeout(typeLoop, 2200); }
      setTimeout(typeLoop, 55 + Math.random() * 60);
    })();
  }

  /* ---------- hero name glitch ---------- */
  var lines = $$('.hero__line');
  if (lines.length && !reduced) {
    setInterval(function () {
      var l = lines[(Math.random() * lines.length) | 0];
      l.classList.add('is-glitch');
      setTimeout(function () { l.classList.remove('is-glitch'); }, 280);
    }, 3400);
  }

  /* ---------- timeline filter ---------- */
  var filters = $$('[data-filter]');
  filters.forEach(function (f) {
    f.addEventListener('click', function () {
      var v = f.dataset.filter;
      filters.forEach(function (x) { x.classList.toggle('is-on', x === f); });
      $$('.tl__item').forEach(function (it) {
        var show = v === 'all' || it.dataset.type === v;
        it.classList.toggle('is-hidden', !show);
        if (show) { it.classList.add('is-in'); }
      });
    });
  });

  /* ---------- project spotlight ---------- */
  $$('.proj').forEach(function (p) {
    p.addEventListener('pointermove', function (e) {
      var r = p.getBoundingClientRect();
      p.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      p.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });

  /* ---------- counters ---------- */
  function countUp(el) {
    var target = parseFloat(el.getAttribute('data-count')), start = performance.now(), dur = 1400;
    var dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
    if (reduced) { el.textContent = target.toFixed(dec); return; }
    (function f(now) {
      var p = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = (target * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(f);
    })(start);
  }

  /* ---------- reveal on scroll ---------- */
  function startReveals() {
    var items = $$('.reveal, .tl__item, [data-scramble], [data-count], [data-progress], .cert--htb');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        io.unobserve(el);
        // stagger siblings that enter together
        var delay = 0;
        if (el.classList.contains('reveal')) {
          var sibs = $$('.reveal', el.parentNode).filter(function (s) { return s.parentNode === el.parentNode; });
          delay = Math.min(sibs.indexOf(el), 6) * 70;
        }
        setTimeout(function () { el.classList.add('is-in'); }, delay);
        if (el.hasAttribute('data-scramble')) scramble(el, el.textContent, 1000);
        if (el.hasAttribute('data-count')) countUp(el);
        if (el.hasAttribute('data-progress')) {
          var fill = el.querySelector('.bar__fill');
          setTimeout(function () { fill.style.width = el.getAttribute('data-progress') + '%'; }, 250);
        }
        if (el.classList.contains('cert--htb')) {
          $$('.htb-grid i', el).forEach(function (sq, i) { sq.style.transitionDelay = (i * 22) + 'ms'; });
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }

  boot(function () {
    startReveals();
    window.MN.ready = true;
    window.dispatchEvent(new Event('mn:ready'));
  });
})();

/* ==========================================================================
   terminal.js — a small fake shell. Content comes from window.SITE (_data/*.yml)
   ========================================================================== */
(function () {
  'use strict';

  var body = document.getElementById('termBody');
  var form = document.getElementById('termForm');
  var input = document.getElementById('termIn');
  if (!body || !form || !input) return;

  var S = window.SITE || {};
  var MN = window.MN || {};
  var htb = S.htb || { handle: 'seanporter', level: '?', rank: 'Skilled' };
  var history = [], hIdx = 0;

  /* ---------- output helpers (DOM only, never innerHTML with user input) ---------- */
  function line(text, cls) {
    var p = document.createElement('p');
    p.className = cls || 't-out';
    if (text instanceof Node) p.appendChild(text); else p.textContent = text;
    body.appendChild(p);
    return p;
  }
  function frag() {
    var f = document.createDocumentFragment();
    Array.prototype.forEach.call(arguments, function (part) {
      if (part == null) return;
      if (typeof part === 'string') f.appendChild(document.createTextNode(part));
      else f.appendChild(part);
    });
    return f;
  }
  function span(text, cls) { var s = document.createElement('span'); s.className = cls; s.textContent = text; return s; }
  function link(text, href, ext) {
    var a = document.createElement('a'); a.href = href; a.textContent = text;
    if (ext) { a.target = '_blank'; a.rel = 'noopener'; }
    return a;
  }
  function grid(pairs) {
    var d = document.createElement('div'); d.className = 't-grid';
    pairs.forEach(function (p) {
      var k = document.createElement('span'); k.className = 't-acc'; k.textContent = p[0];
      var v = document.createElement('span'); v.className = 't-out';
      if (p[1] instanceof Node) v.appendChild(p[1]); else v.textContent = p[1];
      d.appendChild(k); d.appendChild(v);
    });
    body.appendChild(d);
  }
  function blank() { line(' '); }
  function scroll() { body.scrollTop = body.scrollHeight; }

  /* typewriter for multi-line "process" output */
  var busy = false;
  function stream(lines, speed, done) {
    busy = true;
    var i = 0;
    (function next() {
      if (i >= lines.length) { busy = false; if (done) done(); scroll(); return; }
      var l = lines[i++];
      if (typeof l === 'function') l(); else line(l[0], l[1]);
      scroll();
      setTimeout(next, speed);
    })();
  }

  /* ---------- commands ---------- */
  var C = {};
  var HELP = [
    ['whoami', 'who is this guy'],
    ['about', 'the longer version'],
    ['experience', 'work history'],
    ['education', 'degrees and school'],
    ['certs', 'certifications + progress'],
    ['skills', 'the arsenal'],
    ['projects', 'things I\'ve built'],
    ['blog', 'writeups'],
    ['contact', 'how to reach me'],
    ['theme [name]', 'redteam | phosphor | amber | mono'],
    ['nmap <host>', 'scan something (safely)'],
    ['clear', 'clear the screen'],
    ['ls / cat / history / date / echo', 'the usual suspects']
  ];

  C.help = function () {
    line('available commands:', 't-hi');
    grid(HELP);
    line('tip: tab autocompletes, ↑/↓ walks history. there may be easter eggs.', 't-out');
  };

  C.whoami = function () {
    line('moosa nayem', 't-hi');
    line('penetration tester · eJPT · first-class bsc networks & cybersecurity (90%)');
    line('currently: graduate trainee @ central bank of bahrain — GP15 (1 of 15 from 1,600)');
    line('location: manama, bahrain');
  };

  C.about = function () {
    line('Bahraini penetration tester. First-Class Honours from Northumbria University (90% overall).', 't-hi');
    line('I do web, API and infrastructure testing, and I care as much about the report as the exploit.');
    line('Previously: pentester @ Vulnxperts, ethical hacker @ NEBRC (UK), cyber intern @ NGN International.');
    line('Off-keyboard: ex-U16 national basketball (GCC gold with Team Bahrain), ex-student council president.');
    line('Next target: OSCP.');
  };

  function timeline(type) {
    (S.timeline || []).filter(function (e) { return e.type === type; }).forEach(function (e) {
      line(frag(span('* ' + e.sha + ' ', 't-acc'), e.head ? span('(HEAD -> main) ', 't-hi') : null, span(e.when, 't-out')), 't-out');
      line('  ' + e.role + ' — ' + e.org, 't-hi');
      if (e.summary) line('  ' + e.summary);
      (e.points || []).forEach(function (p) { line('  + ' + p); });
      blank();
    });
  }
  C.experience = function () { timeline('work'); };
  C.education = function () { timeline('edu'); };

  C.certs = function () {
    (S.certs || []).forEach(function (c) {
      var pct = c.progress || 0, n = 20, f = Math.round(pct / 100 * n);
      var bar = c.status === 'queued' ? '[' + '▒'.repeat(4) + '·'.repeat(n - 4) + '] loading…' : '[' + '█'.repeat(f) + '·'.repeat(n - f) + '] ' + pct + '%';
      line(frag(span(c.name.padEnd(6), 't-acc'), span(' ' + bar + '  ', 't-hi'), c.full + ' (' + c.issuer + ')'));
    });
    line(frag(span('HTB   ', 't-acc'), span(' rank: ' + htb.rank.toLowerCase() + ' · level ' + htb.level + ' · handle: ' + htb.handle, 't-hi')));
  };

  C.skills = function () {
    grid((S.skills || []).map(function (g) { return [g.group, g.items.join(', ')]; }));
  };

  C.projects = function () {
    (S.projects || []).forEach(function (p) {
      line(frag(span('▸ ' + p.name, 't-hi'), span('  [' + p.lang + ']', 't-acc')), 't-out');
      line('  ' + p.desc);
      if (p.url) line(frag('  ', link(p.url.replace('https://', ''), p.url, true)));
      blank();
    });
  };

  C.blog = function () {
    var posts = S.posts || [];
    if (!posts.length) {
      line('total 0');
      line('no posts yet. writeups are compiling: HTB boxes, web vulns, lessons from the field.');
    } else {
      posts.forEach(function (p) { line(frag(span(p.date + '  ', 't-acc'), link(p.title, p.url))); });
    }
    line(frag('→ ', link('open ~/blog', (S.base || '') + '/blog/')));
  };

  C.contact = function () {
    grid([
      ['email', link(S.email, 'mailto:' + S.email)],
      ['linkedin', link('linkedin.com/in/' + S.linkedin, 'https://www.linkedin.com/in/' + S.linkedin, true)],
      ['github', link('github.com/' + S.github, 'https://github.com/' + S.github, true)]
    ]);
  };
  C.socials = C.contact;
  C.hire = function () {
    line('excellent choice.', 't-hi');
    C.contact();
  };

  C.theme = function (args) {
    var t = (args[0] || '').toLowerCase();
    if (!t) {
      line('current theme: ' + (MN.currentTheme ? MN.currentTheme() : 'redteam'), 't-hi');
      line('usage: theme <' + (MN.themes || []).join(' | ') + '>');
      return;
    }
    if (MN.setTheme && MN.setTheme(t)) line('theme set → ' + t, 't-acc');
    else line('theme: unknown theme "' + t + '"', 't-err');
  };

  C.clear = function () { body.textContent = ''; };
  C.date = function () { line(new Date().toString()); };
  C.echo = function (args) { line(args.join(' ')); };
  C.pwd = function () { line('/home/guest'); };
  C.history = function () { history.forEach(function (h, i) { line(String(i + 1).padStart(4) + '  ' + h); }); };
  C.ls = function (args) {
    if (args.join(' ').indexOf('-a') > -1) line('.  ..  .secrets  about.txt  experience/  education/  certs/  projects/  blog/  contact.txt', 't-hi');
    else line('about.txt  experience/  education/  certs/  projects/  blog/  contact.txt', 't-hi');
  };
  C.cat = function (args) {
    var f = (args[0] || '').replace(/^\.\//, '');
    var map = { 'about.txt': C.about, 'contact.txt': C.contact, '.secrets': secrets };
    if (!f) return line('usage: cat <file>');
    if (map[f]) return map[f]();
    if (/^(experience|education|certs|projects|blog)\/?$/.test(f)) return line('cat: ' + f + ': Is a directory', 't-err');
    line('cat: ' + f + ': No such file or directory', 't-err');
  };
  C.cd = function (args) {
    var d = (args[0] || '').replace(/\/$/, '');
    if (C[d]) return C[d]([]);
    line('cd: you\'re already exactly where you need to be.');
  };
  function secrets() {
    line('-----BEGIN DEFINITELY NOT A FLAG-----', 't-acc');
    line('HTB{y0u_r34d_th3_s0urc3_0r_typ3d_ls_-a}');
    line('-----END DEFINITELY NOT A FLAG-----', 't-acc');
    line('if you found this, you\'re my kind of person. say hi: ' + S.email);
  }
  C.flag = secrets;

  C.sudo = function (args) {
    var rest = args.join(' ').toLowerCase();
    if (/hire/.test(rest)) {
      return stream([
        ['[sudo] password for guest: ********', 't-out'],
        ['verifying privileges ...', 't-out'],
        ['privilege escalation successful.', 't-acc'],
        function () { C.hire(); }
      ], 260);
    }
    line('[sudo] password for guest: ********');
    line('guest is not in the sudoers file. This incident will be reported.', 't-err');
    line('(hint: try `sudo hire moosa`)');
  };
  C.rm = function (args) {
    if (args.join(' ').indexOf('-rf') > -1) return line('nice try. I break things for a living, just not this.', 't-err');
    line('rm: permission denied');
  };

  C.nmap = function (args) {
    var host = args.filter(function (a) { return a[0] !== '-'; })[0] || 'moosa';
    var me = /moosa|nayem|localhost|127\.0\.0\.1|nayem-m\.github\.io/i.test(host);
    var start = new Date();
    var out = [
      ['Starting Nmap 7.95 ( https://nmap.org ) at ' + start.getFullYear() + '-' + String(start.getMonth() + 1).padStart(2, '0') + '-' + String(start.getDate()).padStart(2, '0') + ' ' + start.toTimeString().slice(0, 5), 't-out'],
      ['Nmap scan report for ' + host + (me ? ' (10.13.37.1)' : ''), 't-hi'],
      ['Host is up (0.0013s latency).', 't-out']
    ];
    if (me) {
      out.push(
        ['PORT      STATE  SERVICE', 't-hi'],
        ['22/tcp    open   curiosity', 't-out'],
        ['80/tcp    open   web-app-testing', 't-out'],
        ['443/tcp   open   api-security', 't-out'],
        ['1337/tcp  open   htb-grind (level ' + htb.level + ')', 't-out'],
        ['8080/tcp  open   opportunities', 't-acc'],
        ['31337/tcp filtered oscp (in progress)', 't-out'],
        ['', 't-out'],
        ['Service Info: OS: Kali/Arch; Location: Manama, BH', 't-out']
      );
    } else {
      out.push(['Not scanning third-party hosts from a portfolio site. Scope matters. ;)', 't-err']);
    }
    out.push(['Nmap done: 1 IP address (1 host up) scanned in 1.37 seconds', 't-out']);
    stream(out, 140);
  };

  C.hack = function () {
    var steps = [['initialising exploit chain ...', 't-out']];
    [12, 29, 47, 63, 81, 100].forEach(function (p) {
      var f = Math.round(p / 5);
      steps.push(['[' + '#'.repeat(f) + '.'.repeat(20 - f) + '] ' + p + '%', 't-acc']);
    });
    steps.push(['access granted.', 't-hi'], ['...to a CV you could have just scrolled to. try `experience`.', 't-out']);
    stream(steps, 180);
  };
  C.exit = function () { line('there is no escape. (try `contact` instead)'); };
  C.logout = C.exit;
  C.oscp = function () { line('status: preparing. the next boss fight. ETA: when it\'s done right.', 't-acc'); };
  C.gp15 = function () { line('Central Bank of Bahrain Graduate Programme, cohort 15. 15 places, 1,600 applicants. started 1 oct 2026.', 't-hi'); };
  C.vim = function () { line('opening vim... just kidding, you\'d never get out.'); };
  C.nano = C.vim;
  C.ping = function (args) {
    var h = args[0] || 'moosa';
    stream([0, 1, 2].map(function (i) { return ['64 bytes from ' + h + ': icmp_seq=' + i + ' ttl=64 time=' + (0.8 + Math.random()).toFixed(2) + ' ms', 't-out']; }), 300);
  };

  var ALIAS = { exp: 'experience', work: 'experience', edu: 'education', certifications: 'certs', cert: 'certs', skill: 'skills', tools: 'skills', arsenal: 'skills', project: 'projects', posts: 'blog', email: 'contact', '?': 'help', man: 'help', cls: 'clear', id: 'whoami', hireme: 'hire', 'hire-me': 'hire' };

  function run(raw) {
    var cmd = raw.trim();
    line(cmd, 't-cmd');
    if (!cmd) return scroll();
    history.push(cmd); hIdx = history.length;
    var parts = cmd.split(/\s+/), name = parts[0].toLowerCase(), args = parts.slice(1);
    name = ALIAS[name] || name;
    if (Object.prototype.hasOwnProperty.call(C, name)) C[name](args);
    else line('zsh: command not found: ' + parts[0] + '. type `help`.', 't-err');
    scroll();
  }

  /* ---------- input ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (busy) return;
    var v = input.value; input.value = '';
    run(v);
  });
  input.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp') {
      if (hIdx > 0) { hIdx--; input.value = history[hIdx]; }
      e.preventDefault();
    } else if (e.key === 'ArrowDown') {
      if (hIdx < history.length - 1) { hIdx++; input.value = history[hIdx]; } else { hIdx = history.length; input.value = ''; }
      e.preventDefault();
    } else if (e.key === 'Tab') {
      var v = input.value.trim().toLowerCase();
      if (!v || v.indexOf(' ') > -1) return;
      e.preventDefault();
      var names = Object.keys(C).filter(function (n) { return n.indexOf(v) === 0; });
      if (names.length === 1) input.value = names[0] + ' ';
      else if (names.length > 1) { line(v, 't-cmd'); line(names.join('  ')); scroll(); }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault(); C.clear();
    }
  });
  // clicking anywhere in the terminal focuses the prompt (but don't steal link clicks / text selection)
  document.getElementById('term').addEventListener('click', function (e) {
    if (e.target.closest('a') || String(window.getSelection())) return;
    input.focus({ preventScroll: true });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-run]'), function (b) {
    b.addEventListener('click', function () { if (!busy) run(b.getAttribute('data-run')); });
  });

  /* ---------- motd ---------- */
  var motd = [
    ['Last login: ' + new Date(Date.now() - 864e5).toDateString() + ' from 10.10.14.37', 't-out'],
    ['nayem-os 6.10.0-redteam · welcome, guest.', 't-hi'],
    ['type `help` to see what you can do here, or tap a command below.', 't-out']
  ];
  var started = false;
  function startMotd() {
    if (started) return; started = true;
    stream(motd, MN.reduced ? 0 : 160);
  }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) { if (en[0].isIntersecting) { startMotd(); io.disconnect(); } }, { threshold: 0.3 });
    io.observe(body);
  } else startMotd();
})();

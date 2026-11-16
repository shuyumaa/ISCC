/* ISCC broadcast HUD: a scripted 20 s show loop, fully derived from elapsed time (stateless paint).
   window.ISCCHUD = { start, stop, reset }  (seek is a test helper) */
(function () {
  'use strict';
  var root = document.getElementById('broadcast');
  if (!root) return;
  var frame = root.querySelector('.bc-frame');
  var $ = function (s, r) { return (r || root).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || root).querySelectorAll(s)); };
  var RM = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };

  /* ---- timeline (ms inside a lap) ---- */
  var LOOP = 20000, RESET = 19400, LIVE = 3000, PLANT = 9500, BOMB = 6500, DEF0 = 14350, KTTL = 3400, STATIC_T = 5600;
  var E_DEF = Math.round(PLANT + BOMB * 39.6 / 40);   /* defuse completes with 0.4 s left */
  var E_BOOM = PLANT + BOMB;                          /* detonation */
  var EASE_OUT = function (p) { return 1 - Math.pow(1 - p, 4); };

  var SIDE = { kite: 'ct', ninefold: 'ct', mossglass: 'ct', odd1: 'ct', quill: 'ct', ember: 't', tallow: 't', wick: 't', sable: 't', juno: 't' };
  var NAMES = ['kite', 'ninefold', 'mossglass', 'odd1', 'quill', 'ember', 'tallow', 'wick', 'sable', 'juno'];
  var KD = { kite: [21, 8], ninefold: [15, 10], mossglass: [13, 12], odd1: [9, 11], quill: [11, 9], ember: [17, 11], tallow: [12, 13], wick: [10, 13], sable: [14, 12], juno: [8, 12] };
  var WPN = { kite: 'RIFLE', ninefold: 'SNIPER', mossglass: 'RIFLE', odd1: 'SMG', quill: 'PISTOL', ember: 'RIFLE', tallow: 'PISTOL', wick: 'RIFLE', sable: 'RIFLE', juno: 'SMG' };
  var UTIL = { kite: 3, ninefold: 4, mossglass: 2, odd1: 3, quill: 2, ember: 4, tallow: 2, wick: 3, sable: 2, juno: 3 };
  var ARM = { kite: 1, ninefold: 1, mossglass: 1, odd1: 0, quill: 1, ember: 1, tallow: 1, wick: 0, sable: 1, juno: 1 };
  var MONEY = [
    { kite: 4700, ninefold: 2900, mossglass: 1850, odd1: 600, quill: 1350, ember: 3200, tallow: 1450, wick: 850, sable: 1100, juno: 1000 },
    { kite: 5900, ninefold: 3600, mossglass: 1250, odd1: 2100, quill: 1900, ember: 2400, tallow: 700, wick: 500, sable: 800, juno: 800 }
  ];
  var HP = { /* [t, hp] steps */
    kite: [[0, 100], [3550, 72], [10750, 44]], ninefold: [[0, 100], [4950, 63]], mossglass: [[0, 100], [4050, 58]],
    odd1: [[0, 100], [5700, 61]], quill: [[0, 100], [6900, 38]], ember: [[0, 100], [7700, 44]],
    tallow: [[0, 100], [4700, 80]], wick: [[0, 100], [3300, 34]], sable: [[0, 100], [6700, 70]], juno: [[0, 100]]
  };
  var KILLS = [ /* t, attacker, victim, modifiers, class */
    [3600, 'kite', 'wick', ['hs'], 'RIFLE'], [4300, 'sable', 'mossglass', [], 'RIFLE'], [5000, 'ninefold', 'tallow', ['smoke'], 'SNIPER'],
    [6200, 'juno', 'odd1', [], 'SMG'], [7000, 'quill', 'sable', ['hs'], 'PISTOL'], [7800, 'ember', 'quill', [], 'RIFLE'],
    [10800, 'kite', 'juno', ['smoke'], 'RIFLE'], [12000, 'ember', 'ninefold', ['flash'], 'RIFLE'], [14300, 'ember', 'kite', [], 'RIFLE', 1]
  ];
  var HIST0 = 'ctccttctcttcc'; /* rounds 1-13 winners: 7 KES, 6 LAN */
  var ECO = [
    { m: [11400, 7600], e: [3800, 2900], loss: [0, 2] },
    { m: [12800, 5200], e: [4400, 2100], loss: [0, 3] }
  ];

  /* ---- DOM handles ---- */
  var h = {
    sb: $('.sb'), tab: $('.sb-tab'), scCt: $('.sb-sc[data-s="ct"]'), scT: $('.sb-sc[data-s="t"]'), clk: $('.sb-clk'),
    rn: $$('.rn'), lres: $('.l-res'), bomb: $('.sb-bomb'), def: $('.sb-def'), hist: $$('.hp'),
    kf: $('.kf'), fp: $('.fp'), l3: $('.l3'), bn: $('.bn'), stg: $('.stg'), eco: $('.eco'),
    rows: {}
  };
  NAMES.forEach(function (n) { h.rows[n] = $('.rw[data-p="' + n + '"]'); });
  var cache = {};
  function ch(key, val) { if (cache[key] === val) return false; cache[key] = val; return true; }
  function dig(el, s, key) {
    s = String(s);
    if (!ch(key, s)) return;
    var out = '';
    for (var i = 0; i < s.length; i++) { var c = s.charAt(i); out += '<i class="dg' + (c === ':' || c === '.' ? ' nar' : '') + '">' + c + '</i>'; }
    el.innerHTML = out;
  }
  function txt(el, s, key) { if (ch(key, s)) el.textContent = s; }
  function bi(e, z) { return '<span class="le">' + e + '</span><span class="lz">' + z + '</span>'; }
  function cls(el, c, on, key) { if (ch(key, !!on)) el.classList.toggle(c, !!on); }
  function money(v) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }

  var ICON = {
    bar: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M3 9h18M21 5v8"/></svg>',
    hs: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M13 1.5v4M13 12.5v4M5 9h4M17 9h4"/></svg>',
    smoke: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M6 14.5h14a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 10.800 6 4.200 4.200 0 0 0 6 14.500z"/></svg>',
    flash: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M13 2v4M13 12v4M6 9h4M16 9h4M8 4l2.500 2.500M18 4l-2.500 2.500M8 14l2.500-2.500M18 14l-2.500-2.500"/></svg>'
  };

  /* ---- time model ---- */
  var needIntro = true, running = false, inView = false, raf = 0, last = 0, el = 0;
  function model(abs) {
    var lap = Math.floor(abs / LOOP), tl = abs - lap * LOOP, eff = lap, lt = tl, rolled = false;
    if (tl >= RESET) { eff = lap + 1; lt = 0; rolled = true; }
    var P = eff % 2;
    return { P: P, lt: lt, tl: tl, rolled: rolled, E: P ? E_BOOM : E_DEF };
  }
  function hpAt(n, P, lt) {
    var a = HP[n], v = 100, i;
    for (i = 0; i < a.length; i++) if (lt >= a[i][0]) v = a[i][1];
    for (i = 0; i < KILLS.length; i++) { var k = KILLS[i]; if (k[2] === n && lt >= k[0] && (!k[5] || P)) return 0; }
    return v;
  }
  function killsOf(n, P, lt, field) {
    var c = 0;
    KILLS.forEach(function (k) { if (lt >= k[0] && (!k[5] || P) && k[field] === n) c++; });
    return c;
  }
  function utilOf(n, P, lt) {
    var u = UTIL[n];
    KILLS.forEach(function (k) { if (lt >= k[0] && (!k[5] || P) && k[1] === n && (k[3].indexOf('smoke') > -1 || k[3].indexOf('flash') > -1)) u--; });
    return Math.max(0, u);
  }
  function obsAt(lt) { return lt >= 11000 ? 'kite' : (lt >= 5200 ? 'ember' : 'kite'); }

  /* ---- painters ---- */
  function paint(abs) {
    var m = model(abs), P = m.P, lt = m.lt, E = m.E;
    var live = lt >= LIVE && !m.rolled, ended = live && lt >= E, planted = live && lt >= PLANT && lt < E;
    var freeze = m.rolled || lt < LIVE;
    var ctWin = P === 0;
    var post = live && lt >= E + 2500;                  /* score updates after the band has cleared the scoreboard */
    var round = 14 + P;

    /* shell state classes */
    var l3on = live && lt >= 5000 && lt < 8200;
    var bnOn = ended && lt >= E + 2000 && lt < E + 3300;
    cls(frame, 's-fz', freeze, 'fz'); cls(frame, 's-l3', l3on, 'l3'); cls(frame, 's-bn', bnOn, 'bn');

    /* scoreboard */
    var sc = ctWin ? [7, 6] : [8, 6];
    var scEnd = ctWin ? [8, 6] : [8, 7];
    if (post) sc = scEnd;
    dig(h.scCt, sc[0], 'sc0'); dig(h.scT, sc[1], 'sc1');
    h.rn.forEach(function (n, i) { txt(n, round, 'rn' + i); });
    var st = ended ? 'res' : (planted ? 'bomb' : 'def');
    if (ch('st', st)) h.tab.dataset.st = st, h.sb.dataset.st = st;
    var clk;
    if (freeze) clk = '1:55';
    else if (lt < PLANT) clk = fmt(115 - (lt - LIVE) * 4.2 / 1000 * 1);
    else if (planted) { var rem = Math.max(0, 40 * (1 - (lt - PLANT) / BOMB)); clk = rem >= 10 ? '0:' + Math.ceil(rem) : rem.toFixed(1); }
    else clk = ctWin ? '0.4' : '0.0';
    dig(h.clk, clk, 'clk');
    if (planted) {
      var r2 = Math.max(0, 1 - (lt - PLANT) / BOMB);
      h.bomb.style.transform = 'scaleX(' + r2.toFixed(4) + ')';
      var dp = (ctWin && lt >= DEF0) ? Math.min(1, (lt - DEF0) / (E_DEF - DEF0)) : 0;
      h.def.style.transform = 'scaleX(' + dp.toFixed(4) + ')';
    } else if (ch('bar0', ended ? 'e' : 'n')) { h.bomb.style.transform = 'scaleX(1)'; h.def.style.transform = 'scaleX(0)'; }
    if (ended) {
      var res = ctWin ? ['BOMB DEFUSED', '炸弹已拆除'] : ['BOMB DETONATED', '炸弹已引爆'];
      var le = h.lres.querySelector('.le'), lz = h.lres.querySelector('.lz');
      txt(le, res[0], 'res0'); txt(lz, res[1], 'res1');
    }

    /* round history: 24 pips, winners by team colour; round in play outlined */
    var seq = HIST0 + (P ? 'c' : '');
    var idx = round - 1;
    h.hist.forEach(function (p, i) {
      var v = i < seq.length ? seq.charAt(i) : '';
      if (post && i === idx) v = ctWin ? 'c' : 't';
      var key = v + (i === idx && !post ? 'n' : '');
      if (ch('hp' + i, key)) p.className = 'hp' + (v ? ' ' + v : '') + (i === idx && !post ? ' now' : '');
    });

    /* players */
    NAMES.forEach(function (n) {
      var r = h.rows[n], hpv = freeze ? 100 : hpAt(n, P, lt), dead = hpv <= 0;
      var kk = freeze ? 0 : killsOf(n, P, lt, 1), dd = freeze ? 0 : killsOf(n, P, lt, 2);
      dig(r.querySelector('.rw-hp'), hpv, 'hpv' + n);
      if (ch('fl' + n, hpv)) r.querySelector('.rw-fill').style.transform = 'scaleX(' + (hpv / 100) + ')';
      cls(r, 'dead', dead, 'dead' + n);
      cls(r, 'ob', obsAt(freeze ? 0 : lt) === n && !dead, 'ob' + n);
      txt(r.querySelector('.rw-w'), dead ? '–' : WPN[n], 'w' + n + dead);
      txt(r.querySelector('.rw-mn'), money(MONEY[P][n]), 'mn' + n + P);
      txt(r.querySelector('.rw-k'), KD[n][0] + kk, 'k' + n + kk);
      txt(r.querySelector('.rw-d'), KD[n][1] + dd, 'd' + n + dd);
      var uc = dead ? 0 : (freeze ? UTIL[n] : utilOf(n, P, lt));
      if (ch('u' + n, uc)) $$('.rw-ut i', r).forEach(function (i, j) { i.classList.toggle('on', j < uc); });
      var ar = $('.rw-ar', r); if (ch('ar' + n, ARM[n] && !dead)) ar.classList.toggle('off', !(ARM[n] && !dead));
    });

    /* focus panel */
    var on = freeze ? 'kite' : obsAt(lt), os = SIDE[on], ohp = freeze ? 100 : hpAt(on, P, lt);
    var okills = freeze ? 0 : killsOf(on, P, lt, 1);
    if (ch('fpn', on)) {
      $('.fp-n').textContent = on;
      $('.fp-t').textContent = os === 'ct' ? 'KES' : 'LAN';
      $('.fp-m').textContent = os === 'ct' ? 'K' : 'L';
      h.fp.classList.toggle('t', os === 't');
    }
    dig($('.fp-hp'), ohp, 'fphp'); dig($('.fp-ar'), ARM[on] ? 100 : 0, 'fpar' + on);
    cls(h.fp, 'dead', ohp <= 0, 'fpd');
    if (ch('fpf', ohp)) $('.fp-fill').style.transform = 'scaleX(' + (ohp / 100) + ')';
    var mag = freeze ? 30 : Math.max(6, 30 - 5 * okills - Math.floor(Math.max(0, lt - LIVE) / 1800));
    txt($('.fp-mag'), mag, 'mag'); txt($('.fp-res'), 90, 'res');
    if (ch('fpk', on + okills)) $$('.fp-kp i').forEach(function (i, j) { i.classList.toggle('on', j < okills); });

    /* economy (freeze only) */
    var eco = ECO[P], er = $$('.eco-r');
    er.forEach(function (r, i) {
      txt($('.eco-v', r), money(eco.m[i]), 'ecov' + i + P); txt($('.eco-e', r), money(eco.e[i]), 'ecoe' + i + P);
      if (ch('ecof' + i + P, 1)) $('.eco-fill', r).style.setProperty('--v', ((eco.m[i] - 800) / 15200).toFixed(3));
      if (ch('ecol' + i + P, 1)) $$('.eco-lp i', r).forEach(function (n, j) { n.classList.toggle('on', j < eco.loss[i]); });
    });

    /* lower third */
    if (ch('l3p', P)) {
      var L = h.l3, cast = P === 1;
      L.classList.toggle('cast', cast); L.classList.toggle('t', !cast);
      $('.l3-h').textContent = cast ? 'Iris Calder' : 'ember';
      $('.l3-sub').innerHTML = cast ? bi('PLAY-BY-PLAY · CASTER', '解说 · 主持') : bi('Northgate Academy · ENTRY', '北门学堂 · 突破手');
      $('.l3-k').textContent = '17'; $('.l3-d').textContent = '11'; $('.l3-adr').textContent = '81.4';
    }

    /* banner + stinger */
    if (ended && ch('bnc', P)) {
      var w = ctWin ? ['KESTRELS WIN', '红隼 获胜'] : ['LANTERNS WIN', '灯笼 获胜'];
      var sub = ctWin ? ['ROUND ' + round + ' · BOMB DEFUSED', '第' + round + '局 · 炸弹已拆除'] : ['ROUND ' + round + ' · BOMB DETONATED', '第' + round + '局 · 炸弹已引爆'];
      $('.bn-m .le').textContent = w[0]; $('.bn-m .lz').textContent = w[1];
      $('.bn-t .le').textContent = sub[0]; $('.bn-t .lz').textContent = sub[1];
      h.bn.classList.toggle('t', !ctWin); h.bn.classList.toggle('ct', ctWin);
      h.stg.classList.toggle('t', !ctWin); h.stg.classList.toggle('ct', ctWin);
      $('.stg-w').textContent = ctWin ? 'KES' : 'LAN';
      $('.stg-s .le').textContent = 'ROUND WIN'; $('.stg-s .lz').textContent = '本局获胜';
    }
    var s = lt - E - 300, stOn = ended && s >= 0 && s < 2200;
    cls(h.stg, 'on', stOn, 'stg');
    if (stOn) {
      var bands = $$('.stg-b, .stg-m', h.stg);
      /* order in DOM: stg-4 stg-3 stg-2 stg-1 stg-m ; trail delays in ms */
      var delays = [240, 180, 120, 60, 0];
      bands.forEach(function (b, i) {
        var q = s - delays[i], x;
        if (q < 0) x = -170;
        else if (q < 720) x = -170 * (1 - EASE_OUT(q / 720));
        else if (q < 1500) x = 0;
        else { var u = Math.min(1, (q - 1500) / 420); x = 170 * u * u; }
        b.style.transform = 'translateX(' + x.toFixed(2) + '%) skewX(-18deg)';
      });
    }

    /* killfeed */
    var vis = [];
    if (live) KILLS.forEach(function (k, i) {
      if (k[5] && !P) return;
      var age = lt - k[0];
      if (age >= 0 && age < KTTL) vis.push([i, age]);
    });
    vis = vis.slice(-5);
    var key = vis.map(function (v) { return v[0]; }).join(',');
    if (ch('kfk', key)) {
      var have = {};
      $$('.kr', h.kf).forEach(function (r) { have[r.dataset.k] = r; });
      var keep = {};
      vis.forEach(function (v) { keep[v[0]] = 1; });
      Object.keys(have).forEach(function (k) { if (!keep[k]) have[k].remove(); });
      vis.forEach(function (v) {
        if (have[v[0]]) { h.kf.appendChild(have[v[0]]); return; }
        var k = KILLS[v[0]], row = document.createElement('div');
        row.className = 'kr ' + SIDE[k[1]]; row.dataset.k = v[0];
        var a = document.createElement('span'); a.className = 'kn';
        var s1 = document.createElement('i'); s1.className = 'sq ' + SIDE[k[1]]; a.appendChild(s1); a.appendChild(document.createTextNode(k[1]));
        var ic = document.createElement('span'); ic.className = 'ics';
        ic.innerHTML = ICON.bar + k[3].map(function (x) { return ICON[x]; }).join('');
        var b = document.createElement('span'); b.className = 'kn v';
        var s2 = document.createElement('i'); s2.className = 'sq dead'; b.appendChild(s2); b.appendChild(document.createTextNode(k[2]));
        var w = document.createElement('span'); w.className = 'wc'; w.textContent = k[4];
        [a, ic, b, w].forEach(function (n) { row.appendChild(n); });
        h.kf.appendChild(row);
      });
    }
    $$('.kr', h.kf).forEach(function (r) {
      var age = lt - KILLS[+r.dataset.k][0], x = 0;
      if (age < 380) x = 1 - EASE_OUT(Math.max(0, age) / 380);
      else if (age > KTTL - 220) { var u = (age - (KTTL - 220)) / 220; x = u * u; }
      r.style.transform = x ? 'translateX(' + (x * 46).toFixed(1) + '%)' : '';
    });
  }

  /* ---- loop control ---- */
  function frameStep(now) {
    if (!running) return;
    var dt = Math.min(100, now - last); last = now;
    el += dt;
    paint(el);
    raf = requestAnimationFrame(frameStep);
  }
  function intro() {
    frame.classList.remove('is-in');
    void frame.offsetWidth;
    requestAnimationFrame(function () { requestAnimationFrame(function () { frame.classList.add('is-in'); }); });
  }
  function start() {
    if (running) return;
    if (RM.matches) { frame.classList.add('is-in'); paint(STATIC_T); return; }
    running = true;
    if (needIntro) { needIntro = false; intro(); }
    last = performance.now();
    raf = requestAnimationFrame(frameStep);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function reset() { el = 0; cache = {}; $$('.kr', h.kf).forEach(function (r) { r.remove(); }); paint(0); }
  function seek(ms) { el = ms; paint(el); }

  window.ISCCHUD = { start: start, stop: stop, reset: reset, seek: seek };

  /* first paint: scoreboard already reads 7 : 6, round 14 */
  paint(RM.matches ? STATIC_T : 0);
  if (RM.matches) frame.classList.add('is-in');

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { inView = true; start(); }
        else { inView = false; stop(); needIntro = true; }
      });
    }, { threshold: 0.15 }).observe(root);
  } else { inView = true; start(); }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) stop(); else if (inView) start();
  });
})();

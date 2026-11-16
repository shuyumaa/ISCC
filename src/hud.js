/* ISCC broadcast HUD: scripted round loop. window.ISCCHUD = { start, stop, reset } */
(function () {
  'use strict';
  var root = document.getElementById('broadcast');
  if (!root) return;
  var frame = root.querySelector('.bc-frame');
  var $ = function (s) { return root.querySelector(s); };
  var $$ = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)');

  var LOOP = 22000, LIVE_AT = 1800, PLANT_AT = 9000, TIMER0 = 115, TIMER_RATE = 10, RING_RATE = 8, KILL_TTL = 3400;
  var RING_C = 131.95;

  function bi(e, z) { return '<span class="le">' + e + '</span><span class="lz">' + z + '</span>'; }

  var ICON = {
    bar: '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 8h10M12 5v6"/></svg>',
    hs: '<svg class="ic hs" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5v3.5M8 11v3.5M1.5 8H5M11 8h3.5"/><rect class="fill" x="7" y="7" width="2" height="2"/></svg>',
    smoke: '<svg class="ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4 12.5h7.5a2.5 2.5 0 0 0 .3-5 3.5 3.5 0 0 0-6.7-.6A3 3 0 0 0 4 12.5z"/></svg>'
  };

  var CT = ['kite', 'ninefold', 'mossglass', 'odd1', 'quill'];
  var TT = ['ember', 'tallow', 'wick', 'sable', 'juno'];
  var SCH = { ct: ['Harbour Collegiate', '海港书院'], t: ['Northgate Academy', '北门学堂'] };
  var ROLE = { entry: ['ENTRY', '突破手'], anchor: ['ANCHOR', '守点手'], lurk: ['LURK', '绕后手'], support: ['SUPPORT', '支援'], igl: ['CALLER', '指挥'] };
  var PL = {
    kite: { s: 'ct', r: 'entry', k: 21, d: 8, a: '96.7' },
    ninefold: { s: 'ct', r: 'anchor', k: 15, d: 10, a: '77.9' },
    mossglass: { s: 'ct', r: 'lurk', k: 13, d: 12, a: '69.3' },
    odd1: { s: 'ct', r: 'support', k: 9, d: 11, a: '58.4' },
    quill: { s: 'ct', r: 'igl', k: 11, d: 9, a: '66.0' },
    ember: { s: 't', r: 'entry', k: 17, d: 11, a: '81.4' },
    tallow: { s: 't', r: 'anchor', k: 12, d: 13, a: '64.8' },
    wick: { s: 't', r: 'lurk', k: 10, d: 13, a: '61.2' },
    sable: { s: 't', r: 'igl', k: 14, d: 12, a: '72.5' },
    juno: { s: 't', r: 'support', k: 8, d: 12, a: '55.7' }
  };

  var KILLS = [ // [time, attacker, victim, icons]
    [2400, 'kite', 'wick', ['hs']],
    [3000, 'sable', 'mossglass', ['bar']],
    [3700, 'ninefold', 'tallow', ['smoke', 'bar']],
    [5400, 'juno', 'odd1', ['bar']],
    [7200, 'quill', 'sable', ['hs']],
    [8100, 'ember', 'quill', ['bar']],
    [10600, 'kite', 'juno', ['smoke']]
  ];

  var ECO = { start: [11400, 7600], ct: [15100, 3300], t: [4400, 13800] };

  var el$ = {
    frame: frame,
    nCt: $('.n-ct'), nT: $('.n-t'),
    clk: $('.clk'), ringN: $('.ring-n'), arc: $('.rg-arc'),
    kf: $('.bc-kf'),
    pipsCt: $$('.sb-ct .pip'), pipsT: $$('.sb-t .pip'),
    hp: $$('.hp'),
    l3: $('.bc-l3'),
    stinger: $('.bc-stinger'), run: $('.st-run'), win: $('.st-win'), sub: $('.st-sub')
  };

  var running = false, inView = false, raf = 0, last = 0, el = 0, idx = 0, lap = 0;
  var events = [], tweens = [], rows = [], runAnim = null, lastClk = '', lastRing = '';
  var scoreCt = 7, scoreT = 6;

  function ease(p) { return 1 - Math.pow(1 - p, 4); }
  function tw(dur, fn) { tweens.push({ t0: el, dur: dur, fn: fn }); }
  function fmt(s) { s = Math.max(0, Math.ceil(s)); var m = Math.floor(s / 60), r = s % 60; return m + ':' + (r < 10 ? '0' : '') + r; }
  function ctWins() { return lap % 2 === 0; }
  function endAt() { return ctWins() ? PLANT_AT + Math.round(39.6 / RING_RATE * 1000) : PLANT_AT + Math.round(40 / RING_RATE * 1000); }

  /* ---------- state painters ---------- */
  function setNum(node, v, bump) {
    node.textContent = v;
    if (bump) { node.classList.remove('bump'); void node.offsetWidth; node.classList.add('bump'); }
  }
  function setEco(vals, animate) {
    var rowsE = [[$('.eco-ct'), vals[0]], [$('.eco-t'), vals[1]]];
    rowsE.forEach(function (r) {
      var node = r[0], v = r[1], vEl = node.querySelector('.eco-v');
      var from = parseInt(vEl.textContent.replace(/[^0-9]/g, ''), 10) || v;
      node.style.setProperty('--p', ((v - 800) / 15200).toFixed(3));
      if (animate) {
        tw(1400, function (p) { vEl.textContent = '$' + Math.round(from + (v - from) * p).toLocaleString('en-US'); });
      } else vEl.textContent = '$' + v.toLocaleString('en-US');
    });
  }
  function setPlayer(name) {
    var p = PL[name], L = el$.l3;
    L.dataset.player = name;
    L.classList.toggle('ct', p.s === 'ct');
    L.classList.toggle('t', p.s === 't');
    $('.l3-h').textContent = name;
    $('.l3-sc .f').innerHTML = bi(SCH[p.s][0], SCH[p.s][1]);
    $('.l3-sc .s').textContent = p.s === 'ct' ? 'KES' : 'LAN';
    $('.l3-role').innerHTML = bi(ROLE[p.r][0], ROLE[p.r][1]);
    $('.l3-k').textContent = p.k; $('.l3-d').textContent = p.d; $('.l3-a').textContent = p.a;
  }
  function setPips(deadCt, deadT) {
    el$.pipsCt.forEach(function (n, i) { n.classList.toggle('off', deadCt.indexOf(CT[i]) > -1); });
    el$.pipsT.forEach(function (n, i) { n.classList.toggle('off', deadT.indexOf(TT[i]) > -1); });
  }
  function setClock(sec) { var s = fmt(sec); if (s !== lastClk) { lastClk = s; el$.clk.textContent = s; } }
  function setRing(rem) {
    var txt = rem >= 5 ? String(Math.ceil(rem)) : rem.toFixed(1);
    if (txt !== lastRing) { lastRing = txt; el$.ringN.textContent = txt; }
    el$.arc.style.strokeDashoffset = (RING_C * (1 - rem / 40)).toFixed(2);
  }
  function histBase() {
    var seq = ['c', 't', 'c', 'c', 't', 't', 'c', 't', 'c', 't', 't', 'c', 'c'];
    el$.hp.forEach(function (n, i) {
      n.className = 'hp' + (seq[i] ? ' ' + seq[i] : '') + (i === 13 ? ' now' : '');
    });
  }

  function addKill(k, animate) {
    var a = k[1], v = k[2], as = PL[a].s, vs = PL[v].s;
    var row = document.createElement('div');
    row.className = 'kf-row ' + as;
    if (!animate) row.style.animation = 'none';
    row.innerHTML = '<span class="kf-a ' + as + '">' + a + '</span><span class="kf-ic">' + k[3].map(function (i) { return ICON[i]; }).join('') + '</span><span class="kf-v ' + vs + '">' + v + '</span>';
    el$.kf.appendChild(row);
    rows.push({ node: row, t0: el, out: false });
    while (rows.length > 4) { var o = rows.shift(); o.node.remove(); }
    var deadCt = [], deadT = [];
    KILLS.forEach(function (kk) {
      if (kk[0] > k[0]) return;
      (PL[kk[2]].s === 'ct' ? deadCt : deadT).push(kk[2]);
    });
    setPips(deadCt, deadT);
  }

  function runStinger() {
    var w = ctWins() ? 'ct' : 't';
    el$.stinger.className = 'bc-stinger is-' + w;
    el$.win.textContent = w === 'ct' ? 'KES' : 'LAN';
    el$.sub.innerHTML = ctWins() ? bi('ROUND 14 · BOMB DEFUSED', '第14局 · 拆除成功') : bi('ROUND 14 · BOMB DETONATED', '第14局 · 炸弹引爆');
    var W = frame.clientWidth / 100;
    el$.run.classList.add('go');
    if (runAnim) runAnim.cancel();
    runAnim = el$.run.animate([
      { transform: 'translateX(' + (-150 * W) + 'px)', easing: 'cubic-bezier(.16,1,.3,1)' },
      { transform: 'translateX(' + (-64 * W) + 'px)', offset: .38, easing: 'cubic-bezier(.7,0,.84,0)' },
      { transform: 'translateX(' + (74 * W) + 'px)' }
    ], { duration: 1000, fill: 'forwards' });
    runAnim.onfinish = function () { el$.run.classList.remove('go'); };
  }

  /* ---------- timeline ---------- */
  function buildEvents() {
    var E = endAt(), cw = ctWins();
    events = [
      [60, function () { frame.classList.add('is-in'); }],
      [LIVE_AT, function () { }]
    ];
    KILLS.forEach(function (k) { events.push([k[0], function () { addKill(k, true); }]); });
    events.push([PLANT_AT, function () { frame.classList.add('is-bomb'); }]);
    events.push([E, function () { frame.classList.add('is-ended'); runStinger(); }]);
    events.push([E + 480, function () {
      if (cw) { scoreCt++; setNum(el$.nCt, scoreCt, true); } else { scoreT++; setNum(el$.nT, scoreT, true); }
    }]);
    events.push([E + 650, function () {
      el$.hp[13].className = 'hp ' + (cw ? 'c' : 't');
      el$.hp[14].className = 'hp now';
    }]);
    events.push([E + 950, function () { setEco(cw ? ECO.ct : ECO.t, true); }]);
    events.push([E + 1400, function () { el$.l3.classList.add('swap'); }]);
    events.push([E + 1750, function () { setPlayer(cw ? 'kite' : 'sable'); el$.l3.classList.remove('swap'); }]);
    events.sort(function (a, b) { return a[0] - b[0]; });
  }

  function clearDom() {
    frame.classList.add('nt');
    frame.classList.remove('is-in', 'is-bomb', 'is-ended');
    if (runAnim) { runAnim.cancel(); runAnim = null; }
    el$.run.classList.remove('go');
    rows.forEach(function (r) { r.node.remove(); }); rows = []; tweens = [];
    scoreCt = 7; scoreT = 6;
    setNum(el$.nCt, 7); setNum(el$.nT, 6);
    el$.nCt.classList.remove('bump'); el$.nT.classList.remove('bump');
    lastClk = ''; setClock(TIMER0);
    lastRing = ''; setRing(40);
    setPips([], []);
    histBase();
    setEco(ECO.start, false);
    el$.l3.classList.remove('swap');
    setPlayer('ember');
    void frame.offsetWidth;
    requestAnimationFrame(function () { frame.classList.remove('nt'); });
  }

  function resetState() { el = 0; idx = 0; lastClk = ''; clearDom(); buildEvents(); }

  /* ---------- reduced-motion static frame ---------- */
  function staticFrame() {
    stop();
    frame.classList.add('nt');
    clearDom();
    frame.classList.add('is-in', 'is-bomb');
    scoreCt = 7; scoreT = 6;
    el$.nCt.textContent = 7; el$.nT.textContent = 6;
    setRing(23);
    addKill(KILLS[0], false); addKill(KILLS[1], false);
    rows.forEach(function (r) { r.t0 = 1e9; });
    frame.classList.remove('nt');
  }

  /* ---------- frame loop ---------- */
  function step() {
    while (idx < events.length && events[idx][0] <= el) { events[idx][1](); idx++; }
    // clock / ring
    if (el >= LIVE_AT && el < PLANT_AT) setClock(TIMER0 - (el - LIVE_AT) / 1000 * TIMER_RATE);
    if (el >= PLANT_AT) {
      var rem = 40 - (el - PLANT_AT) / 1000 * RING_RATE;
      rem = Math.max(ctWins() ? 0.4 : 0, rem);
      setRing(rem);
    }
    // tweens
    for (var i = tweens.length - 1; i >= 0; i--) {
      var t = tweens[i], p = Math.min(1, (el - t.t0) / t.dur);
      t.fn(ease(p));
      if (p >= 1) tweens.splice(i, 1);
    }
    // killfeed expiry
    for (var j = rows.length - 1; j >= 0; j--) {
      var r = rows[j], age = el - r.t0;
      if (!r.out && age > KILL_TTL) { r.out = true; r.node.classList.add('out'); }
      if (age > KILL_TTL + 450) { r.node.remove(); rows.splice(j, 1); }
    }
  }

  function loop(now) {
    if (!running) return;
    var dt = Math.min(100, now - last); last = now;
    el += dt;
    if (el >= LOOP) { lap++; resetState(); }
    step();
    raf = requestAnimationFrame(loop);
  }

  function start() {
    if (RM.matches) { staticFrame(); return; }
    if (running) return;
    running = true;
    if (el === 0 && idx === 0 && !events.length) resetState();
    last = performance.now();
    raf = requestAnimationFrame(loop);
  }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = 0; }
  function reset() {
    if (RM.matches) { staticFrame(); return; }
    resetState();
    if (running) step();
  }

  /* ---------- wiring ---------- */
  frame.classList.add('js');
  if (RM.matches) staticFrame(); else resetState();

  function sync() { if (inView && !document.hidden) start(); else stop(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { inView = es[es.length - 1].isIntersecting; sync(); }, { threshold: 0.15 }).observe(root);
  } else { inView = true; sync(); }
  document.addEventListener('visibilitychange', sync);
  var onRM = function () { if (RM.matches) staticFrame(); else { resetState(); sync(); } };
  if (RM.addEventListener) RM.addEventListener('change', onRM); else if (RM.addListener) RM.addListener(onRM);

  window.ISCCHUD = { start: start, stop: stop, reset: reset };
})();

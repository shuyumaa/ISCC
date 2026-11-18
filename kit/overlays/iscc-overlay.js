/* ISCC OBS overlays: shared runtime.
   Pages mount components with data-ov="name". State comes from URL parameters, then window.ISCC.update({...}) and
   window.postMessage({iscc:{...}}). User-supplied strings are only ever written with textContent. */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function bi(e, z) { return '<span class="le">' + e + '</span><span class="lz">' + z + '</span>'; }   /* constants only */

  /* ---------------- state ---------------- */
  var POOL = { QUAD: '方院', ARCHIVE: '档案馆', CLOISTER: '回廊', ATRIUM: '中庭', REFECTORY: '膳堂', OBSERVATORY: '观星台', BOATHOUSE: '船坞' };
  var SAMPLE_CT = [
    { name: 'kite', hp: 72, armor: 100, wpn: 'RIFLE', money: 4700, k: 21, d: 8, util: 3, obs: true },
    { name: 'ninefold', hp: 63, armor: 100, wpn: 'SNIPER', money: 2900, k: 15, d: 10, util: 4 },
    { name: 'mossglass', hp: 0, armor: 0, wpn: 'RIFLE', money: 1850, k: 13, d: 12, util: 0 },
    { name: 'odd1', hp: 61, armor: 0, wpn: 'SMG', money: 600, k: 9, d: 11, util: 3 },
    { name: 'quill', hp: 100, armor: 100, wpn: 'PISTOL', money: 1350, k: 11, d: 9, util: 2 }
  ];
  var SAMPLE_T = [
    { name: 'ember', hp: 100, armor: 100, wpn: 'RIFLE', money: 3200, k: 17, d: 11, util: 4 },
    { name: 'tallow', hp: 0, armor: 0, wpn: 'PISTOL', money: 1450, k: 12, d: 13, util: 0 },
    { name: 'wick', hp: 0, armor: 0, wpn: 'RIFLE', money: 850, k: 10, d: 14, util: 0 },
    { name: 'sable', hp: 100, armor: 100, wpn: 'RIFLE', money: 1100, k: 15, d: 12, util: 2 },
    { name: 'juno', hp: 100, armor: 100, wpn: 'SMG', money: 1000, k: 8, d: 12, util: 3 }
  ];
  var SAMPLE_VETO = [
    { map: 'QUAD', type: 'ban', by: 'KES' }, { map: 'ARCHIVE', type: 'ban', by: 'LAN' }, { map: 'CLOISTER', type: 'pick', by: 'KES' },
    { map: 'ATRIUM', type: 'pick', by: 'LAN' }, { map: 'REFECTORY', type: 'ban', by: 'KES' }, { map: 'OBSERVATORY', type: 'ban', by: 'LAN' },
    { map: 'BOATHOUSE', type: 'decider', by: '' }
  ];
  var S = {
    ct: 'KES', ctName: 'KESTRELS', ctZh: '红隼', ctSchool: 'Harbour Collegiate', ctSchoolZh: '海港书院',
    t: 'LAN', tName: 'LANTERNS', tZh: '灯笼', tSchool: 'Northgate Academy', tSchoolZh: '北门学堂',
    cs: 7, ts: 6, round: 14, clock: '1:55', ctMaps: 1, tMaps: 0, bo: 3, hist: 'ctccttctcttcc',
    planted: false, bomb: 1, defuse: 0, result: null, theme: 'dark', lang: 'en', map: 'ATRIUM', mapZh: '中庭',
    players: { ct: SAMPLE_CT, t: SAMPLE_T }, veto: SAMPLE_VETO, current: 'ATRIUM',
    focus: { name: 'kite', side: 'ct', hp: 72, armor: 100, mag: 25, res: 90, kills: 2 },
    eco: null, title: 'International Schools CS2 Championships', titleZh: '国际学校CS2锦标赛', stage: 'GROUP B', stageZh: 'B组', when: '19:00', ttl: 5000, side: 'ct'
  };
  var NUM = { cs: 1, ts: 1, round: 1, ctMaps: 1, tMaps: 1, bo: 1, mins: 1, secs: 1, ttl: 1, dur: 1 };
  Q.forEach(function (v, k) { if (k === 'demo' || k === 'autoplay' || k === 'fit' || k === 'bg' || k === 'loop') return; S[k] = NUM[k] ? Number(v) : v; });
  if (Q.has('veto')) S.veto = Q.get('veto').split(',').map(function (x) { var p = x.split(':'); return { map: p[0].toUpperCase(), type: p[1] || 'ban', by: p[2] || '' }; });
  if (Q.has('hist')) S.hist = Q.get('hist');
  if (S.lang !== 'zh') S.lang = 'en';
  if (S.theme !== 'light') S.theme = 'dark';

  /* ---------------- helpers ---------------- */
  var cache = new WeakMap();
  function memo(node, key, val, fn) {
    var c = cache.get(node); if (!c) { c = {}; cache.set(node, c); }
    var v = typeof val === 'object' ? JSON.stringify(val) : String(val);
    if (c[key] === v) return; c[key] = v; fn();
  }
  function txt(root, sel, v) { var n = $(sel, root); if (n) memo(n, 't', v, function () { n.textContent = v; }); }
  function digits(node, s) {
    s = String(s);
    memo(node, 'd', s, function () {
      node.textContent = '';
      for (var i = 0; i < s.length; i++) { var c = s.charAt(i), d = el('i', 'dg' + (c === ':' || c === '.' ? ' nar' : ''), c); node.appendChild(d); }
    });
  }
  function money(v) { return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function nm(side) { return side === 'ct' ? S.ctName : S.tName; }
  function bilabel(node, en, zh) { var a = $('.le', node), b = $('.lz', node); a.textContent = en; b.textContent = zh == null ? en : zh; }
  function tick(fn) { var raf = 0; return function () { if (raf) return; raf = requestAnimationFrame(function () { raf = 0; fn(); }); }; }

  var ICON = {
    bar: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M3 9h18M21 5v8"/></svg>',
    hs: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M13 1.5v4M13 12.5v4M5 9h4M17 9h4"/></svg>',
    smoke: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M6 14.5h14a3.5 3.5 0 0 0 .4-7A5 5 0 0 0 10.8 6 4.2 4.2 0 0 0 6 14.5z"/></svg>',
    flash: '<svg class="ic" viewBox="0 0 26 18" aria-hidden="true"><path d="M13 2v4M13 12v4M6 9h4M16 9h4M8 4l2.5 2.5M18 4l-2.5 2.5M8 14l2.5-2.5M18 14l-2.5-2.5"/></svg>'
  };

  /* ---------------- components ---------------- */
  var C = {};

  C.scoreboard = function (root) {
    root.classList.add('ov');
    root.innerHTML =
      '<div class="sb"><div class="sb-bar">' + team('ct') + '<div class="sb-mid"><i class="logo-slot" style="--s:28px" aria-hidden="true"></i></div>' + team('t') + '<i class="sb-bomb"></i><i class="sb-def"></i></div>' +
      '<div class="sb-tab" data-st="def"><span class="sb-mp ct"></span><span class="sb-clk"></span><span class="sb-lb">' +
      '<span class="lbl l-def">MR12 · ' + bi('ROUND <b class="rn"></b>', '第<b class="rn"></b>局') + '</span><span class="lbl l-bomb">' + bi('BOMB PLANTED', '炸弹已安放') + '</span><span class="lbl l-res">' + bi('', '') + '</span></span><span class="sb-mp t"></span></div>' +
      '<div class="hist" aria-hidden="true"><span class="hh"></span><i class="hd"></i><span class="hh"></span></div></div>';
    function team(s) {
      var mono = '<i class="mono">' + (s === 'ct' ? 'K' : 'L') + '</i>';
      var id = '<div class="sb-id"><b class="sb-tag"></b><span class="lbl sb-nm">' + bi('', '') + '</span></div>';
      var sc = '<span class="sb-sc" data-s="' + s + '"></span>';
      return '<div class="sb-t ' + s + '">' + (s === 'ct' ? mono + id + sc : sc + id + mono) + '</div>';
    }
    var pips = $$('.hh', root);
    for (var h = 0; h < 2; h++) for (var i = 0; i < 12; i++) pips[h].appendChild(el('i', 'hp'));
    var hp = $$('.hp', root);
    return {
      render: function () {
        ['ct', 't'].forEach(function (s) {
          var tag = String(S[s]).toUpperCase(), box = $('.sb-t.' + s, root);
          txt(box, '.mono', tag.charAt(0)); txt(box, '.sb-tag', tag);
          memo(box, 'nm', S[s + 'Name'] + '|' + S[s + 'Zh'], function () { bilabel($('.sb-nm', box), S[s + 'Name'], S[s + 'Zh'] || S[s + 'Name']); });
          digits($('.sb-sc', box), S[s === 'ct' ? 'cs' : 'ts']);
          var mp = $('.sb-mp.' + s, root), need = Math.ceil((S.bo || 3) / 2), won = S[s + 'Maps'] || 0;
          memo(mp, 'mp', need + ':' + won, function () { mp.textContent = ''; for (var i = 0; i < need; i++) mp.appendChild(el('i', i < won ? 'on' : '')); });
        });
        $$('.rn', root).forEach(function (n) { memo(n, 'r', S.round, function () { n.textContent = S.round; }); });
        var tab = $('.sb-tab', root), st = S.result ? 'res' : (S.planted ? 'bomb' : 'def');
        tab.dataset.st = st; $('.sb', root).dataset.st = st;
        if (S.result) { var r = S.result, en = typeof r === 'string' ? r : (r.en || ''), zh = typeof r === 'string' ? r : (r.zh || r.en || ''); var l = $('.l-res', root); memo(l, 'r', en + zh, function () { bilabel(l, en, zh); }); }
        digits($('.sb-clk', root), S.clock);
        var on = S.planted && !S.result;
        $('.sb-bomb', root).style.transform = 'scaleX(' + Math.max(0, Math.min(1, S.bomb)) + ')';
        $('.sb-def', root).style.transform = 'scaleX(' + Math.max(0, Math.min(1, S.defuse)) + ')';
        var hist = String(S.hist || ''), now = S.round - 1;
        hp.forEach(function (p, i) {
          var v = hist.charAt(i) === 'c' || hist.charAt(i) === 't' ? hist.charAt(i) : '';
          var key = v + (i === now && !v ? 'n' : ''); memo(p, 'h', key, function () { p.className = 'hp' + (v ? ' ' + v : '') + (key.slice(-1) === 'n' ? ' now' : ''); });
        });
        void on;
      }
    };
  };

  C.rows = function (root) {
    root.classList.add('ov');
    function rowHTML(side) {
      return '<div class="rw ' + side + '"><b class="rw-hp"></b><div class="rw-m"><div class="rw-l1"><span class="rw-n"></span><span class="rw-kd"><b class="rw-k"></b><i>/</i><b class="rw-d"></b></span></div>' +
        '<div class="rw-l2"><span class="rw-bar"><i class="rw-fill"></i><i class="rw-tk"></i></span><span class="rw-ar"><i></i></span><span class="rw-ut"><i></i><i></i><i></i><i></i></span></div></div>' +
        '<div class="rw-c"><span class="rw-w"></span><span class="rw-mn"></span></div></div>';
    }
    root.innerHTML = '<div class="rws rws-ct">' + new Array(6).join(rowHTML('ct')) + '</div><div class="rws rws-t">' + new Array(6).join(rowHTML('t')) + '</div>';
    return {
      render: function () {
        ['ct', 't'].forEach(function (s) {
          var rs = $$('.rws-' + s + ' .rw', root);
          rs.forEach(function (r, i) {
            var p = (S.players && S.players[s] && S.players[s][i]) || null;
            r.style.visibility = p ? '' : 'hidden'; if (!p) return;
            var hpv = Math.max(0, Math.min(100, p.hp == null ? 100 : p.hp)), dead = hpv <= 0;
            txt(r, '.rw-n', p.name); digits($('.rw-hp', r), hpv);
            memo(r, 'f', hpv, function () { $('.rw-fill', r).style.transform = 'scaleX(' + hpv / 100 + ')'; });
            r.classList.toggle('dead', dead); r.classList.toggle('ob', !!p.obs && !dead);
            txt(r, '.rw-w', dead ? '–' : (p.wpn || '')); txt(r, '.rw-mn', money(p.money || 0));
            txt(r, '.rw-k', p.k == null ? 0 : p.k); txt(r, '.rw-d', p.d == null ? 0 : p.d);
            var u = dead ? 0 : (p.util || 0);
            memo(r, 'u', u, function () { $$('.rw-ut i', r).forEach(function (n, j) { n.classList.toggle('on', j < u); }); });
            $('.rw-ar', r).classList.toggle('off', dead || !(p.armor > 0));
          });
        });
      }
    };
  };

  C.killfeed = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="kf" aria-hidden="true"></div>';
    var kf = $('.kf', root);
    function remove(r) { if (!r.parentNode) return; r.classList.add('out'); setTimeout(function () { r.remove(); }, 230); }
    return {
      render: function () {},
      event: function (p) {
        if (!p.kill) return;
        var k = p.kill, as = k.as === 't' ? 't' : 'ct', vs = k.vs === 'ct' ? 'ct' : 't';
        var row = el('div', 'kr ' + as);
        var a = el('span', 'kn'); a.appendChild(el('i', 'sq ' + as)); a.appendChild(document.createTextNode(String(k.a)));
        var ic = el('span', 'ics'); ic.innerHTML = ICON.bar + (k.mods || []).map(function (m) { return ICON[m] || ''; }).join('');
        var v = el('span', 'kn v'); v.appendChild(el('i', 'sq dead')); v.appendChild(document.createTextNode(String(k.v)));
        row.appendChild(a); row.appendChild(ic); row.appendChild(v); row.appendChild(el('span', 'wc', String(k.wpn || '').toUpperCase()));
        void vs;
        kf.appendChild(row);
        while ($$('.kr:not(.out)', kf).length > 5) remove($('.kr:not(.out)', kf));
        setTimeout(function () { remove(row); }, S.ttl || 5000);
      },
      clear: function () { $$('.kr', kf).forEach(function (r) { r.remove(); }); }
    };
  };

  C.lowerthird = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="l3 t is-off"><i class="l3-ed"></i><div class="l3-h"></div><div class="lbl l3-sub"><span class="l3-line"></span></div>' +
      '<div class="l3-stats"><div><b class="l3-k"></b><span class="lbl">' + bi('K', '击杀') + '</span></div><div><b class="l3-d"></b><span class="lbl">' + bi('D', '死亡') + '</span></div><div><b class="l3-adr"></b><span class="lbl">' + bi('ADR', '场均伤害') + '</span></div></div></div>';
    var box = $('.l3', root), shown = false, timer = 0;
    function show(o) {
      txt(box, '.l3-h', o.name || ''); txt(box, '.l3-line', o.line || '');
      box.classList.toggle('ct', o.side === 'ct'); box.classList.toggle('t', o.side !== 'ct' && o.side !== 'cast'); box.classList.toggle('cast', o.side === 'cast');
      var st = o.k != null || o.d != null || o.adr != null;
      box.classList.toggle('nostats', !st);
      if (st) { txt(box, '.l3-k', o.k == null ? '–' : o.k); txt(box, '.l3-d', o.d == null ? '–' : o.d); txt(box, '.l3-adr', o.adr == null ? '–' : o.adr); }
      if (!shown) { shown = true; box.classList.remove('is-off', 'out-clip'); void box.offsetWidth; box.classList.add('in-clip'); }
      clearTimeout(timer);
      var d = S.dur || (o.dur); if (d) timer = setTimeout(function () { hide(); }, d * 1000);
    }
    function hide() { if (!shown) return; shown = false; box.classList.remove('in-clip'); box.classList.add('out-clip'); setTimeout(function () { if (!shown) box.classList.add('is-off'); }, 230); }
    return { render: function () { var o = S.lowerThird; if (o) show(o); else hide(); } };
  };

  C.veto = function (root, big) {
    root.classList.add('ov');
    root.innerHTML = (big ? '<div class="vt-panel"></div><div class="vt-hd"><span class="lbl">' + bi('INTERNATIONAL SCHOOLS CS2 CHAMPIONSHIPS', '国际学校CS2锦标赛') + '</span><div class="t">' + bi('MAP VETO', '地图选择') + '</div></div>' : '') + '<ol class="vtr' + (big ? ' big' : '') + '" aria-label="Map veto"></ol>' +
      (big ? '<div class="vt-ft"><span class="lbl ft-a"></span><span class="lbl ft-b"></span></div>' : '');
    var ol = $('.vtr', root);
    return {
      render: function () {
        var list = S.veto || [];
        if (!big) root.style.visibility = S.eco ? 'visible' : 'hidden';
        memo(ol, 'v', [list, S.ct, S.current], function () {
          ol.textContent = '';
          list.forEach(function (v, i) {
            var type = v.type === 'pick' || v.type === 'decider' ? v.type : 'ban', side = v.by && v.by.toUpperCase() === String(S.ct).toUpperCase() ? 'ct' : (v.by ? 't' : 'x');
            var li = el('li', 'vt ' + type + ' ' + side + (S.current && S.current.toUpperCase() === v.map ? ' now' : ''));
            if (big) li.appendChild(el('span', 'vt-idx', String(i + 1).padStart(2, '0')));
            var n = el('span', 'vt-n'), le = el('span', 'le'), lz = el('span', 'lz', POOL[v.map] || v.zh || v.map);
            le.appendChild(el('span', 'f', v.map)); le.appendChild(el('span', 's', v.map.slice(0, 3))); n.appendChild(le); n.appendChild(lz);
            var s = el('span', 'lbl vt-s'), sa = el('span', 'le'), sb = el('span', 'lz');
            var en = { ban: 'BAN', pick: 'PICK', decider: 'DECIDER' }[type], zh = { ban: '禁用', pick: '选择', decider: '决胜' }[type];
            sa.textContent = en + (v.by ? ' · ' + v.by : ''); sb.textContent = zh + (v.by ? ' · ' + v.by : '');
            s.appendChild(sa); s.appendChild(sb); li.appendChild(n); li.appendChild(s); ol.appendChild(li);
          });
        });
        if (big) { txt(root, '.ft-a', S.ctName + '  vs  ' + S.tName); txt(root, '.ft-b', 'BO' + S.bo + ' · MR12'); }
      }
    };
  };

  C.roundwin = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="bn ct is-off"><i class="bn-ed"></i><span class="lbl bn-t">' + bi('', '') + '</span><b class="bn-m">' + bi('', '') + '</b></div>';
    var box = $('.bn', root), shown = false, timer = 0;
    var METHOD = { defused: ['BOMB DEFUSED', '炸弹已拆除'], detonated: ['BOMB DETONATED', '炸弹已引爆'], elimination: ['ELIMINATION', '全员击败'], time: ['TIME EXPIRED', '时间耗尽'] };
    function hide() { if (!shown) return; shown = false; box.classList.remove('in-clip'); box.classList.add('out-clip'); setTimeout(function () { if (!shown) box.classList.add('is-off'); }, 230); }
    return {
      render: function () {
        var o = S.roundWin; if (!o) return hide();
        var side = o.side === 't' ? 't' : 'ct', m = METHOD[o.method || 'defused'] || METHOD.defused, rd = o.round || S.round;
        var w = o.winner || nm(side), wz = o.winnerZh || (side === 'ct' ? S.ctZh : S.tZh) || w;
        box.classList.toggle('ct', side === 'ct'); box.classList.toggle('t', side === 't');
        memo(box, 'c', [o, S.lang], function () {
          bilabel($('.bn-t', box), 'ROUND ' + rd + ' · ' + m[0], '第' + rd + '局 · ' + m[1]);
          bilabel($('.bn-m', box), String(w).toUpperCase() + ' WIN', wz + ' 获胜');
        });
        if (!shown) { shown = true; box.classList.remove('is-off', 'out-clip'); void box.offsetWidth; box.classList.add('in-clip'); }
        clearTimeout(timer); var d = S.dur || o.dur; if (d) timer = setTimeout(hide, d * 1000);
      }
    };
  };

  C.stinger = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="stg ct" aria-hidden="true"><i class="stg-b stg-4"></i><i class="stg-b stg-3"></i><i class="stg-b stg-2"></i><i class="stg-b stg-1"></i><div class="stg-m"><div class="stg-tx"><b class="stg-w"></b><span class="lbl stg-s">' + bi('ROUND WIN', '本局获胜') + '</span></div></div></div>';
    var box = $('.stg', root), t = 0;
    function play(o) {
      o = o || {}; var side = o.side === 't' ? 't' : (o.side === 'ct' ? 'ct' : (S.side === 't' ? 't' : 'ct'));
      box.classList.toggle('ct', side === 'ct'); box.classList.toggle('t', side === 't');
      txt(box, '.stg-w', String(o.tag || S[side]).toUpperCase());
      box.classList.remove('play'); void box.offsetWidth; box.classList.add('play');
      clearTimeout(t); t = setTimeout(function () { box.classList.remove('play'); }, 2300);
    }
    if (Q.get('loop')) setInterval(function () { play({ side: S.side }); }, 5200);
    if (Q.get('autoplay') === '1') setTimeout(function () { play({ side: S.side }); }, 250);
    return { render: function () {}, event: function (p) { if (p.stinger) play(p.stinger === true ? {} : p.stinger); } };
  };

  C.focus = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="fp"><i class="fp-ed"></i><div class="fp-id"><i class="mono fp-m"></i><div><b class="fp-n"></b><span class="lbl fp-t"></span></div></div>' +
      '<div class="fp-st"><span class="fp-v fp-hp"></span><span class="lbl">' + bi('HEALTH', '生命') + '</span></div><div class="fp-st"><span class="fp-v fp-ar"></span><span class="lbl">' + bi('ARMOR', '护甲') + '</span></div>' +
      '<div class="fp-st fp-am"><b class="fp-mag"></b><i>/</i><b class="fp-res"></b><span class="lbl">' + bi('AMMO', '弹药') + '</span></div>' +
      '<div class="fp-kl"><span class="fp-kp"><i></i><i></i><i></i><i></i><i></i></span><span class="lbl">' + bi('KILLS', '击杀') + '</span></div><span class="fp-bar"><i class="fp-fill"></i></span></div>';
    var box = $('.fp', root);
    return {
      render: function () {
        var f = S.focus; if (!f) return;
        box.style.visibility = S.eco ? 'hidden' : 'visible';
        box.classList.toggle('t', f.side === 't'); box.classList.toggle('dead', !(f.hp > 0));
        txt(box, '.fp-n', f.name); var tag = String(f.side === 't' ? S.t : S.ct).toUpperCase(); txt(box, '.fp-t', tag); txt(box, '.fp-m', tag.charAt(0));
        digits($('.fp-hp', box), f.hp); digits($('.fp-ar', box), f.armor || 0);
        txt(box, '.fp-mag', f.mag); txt(box, '.fp-res', f.res);
        $('.fp-fill', box).style.transform = 'scaleX(' + Math.max(0, Math.min(1, f.hp / 100)) + ')';
        $$('.fp-kp i', box).forEach(function (n, j) { n.classList.toggle('on', j < (f.kills || 0)); });
      }
    };
  };

  C.radar = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="rd"><div class="rd-fr"><div class="bc-radar-slot"></div><i class="rd-c a"></i><i class="rd-c b"></i><i class="rd-c c"></i><i class="rd-c d"></i></div><div class="lbl rd-lb"><span class="rd-t"></span></div></div>';
    return { render: function () { txt(root, '.rd-t', String(S.map).toUpperCase() + ' ' + (S.mapZh || '')); } };
  };

  C.eco = function (root) {
    root.classList.add('ov');
    function r(s) { return '<div class="eco-r ' + s + '"><b class="eco-tag"></b><span class="eco-bar"><i class="eco-fill"></i></span><b class="eco-v"></b><span class="eco-lp"><i></i><i></i><i></i><i></i><i></i></span><b class="eco-e"></b></div>'; }
    root.innerHTML = '<div class="eco"><div class="lbl eco-h"><span></span><span>' + bi('MONEY', '资金') + '</span><span></span><span>' + bi('LOSS', '连败') + '</span><span>' + bi('EQUIP', '装备') + '</span></div>' + r('ct') + r('t') + '</div>';
    var box = $('.eco', root);
    return {
      render: function () {
        var e = S.eco; box.style.visibility = e ? 'visible' : 'hidden'; if (!e) return;
        ['ct', 't'].forEach(function (s, i) {
          var r = $('.eco-r.' + s, box);
          txt(r, '.eco-tag', S[s].toUpperCase()); txt(r, '.eco-v', money(e.m[i])); txt(r, '.eco-e', money(e.e[i]));
          $('.eco-fill', r).style.setProperty('--v', ((e.m[i] - 800) / 15200).toFixed(3));
          $$('.eco-lp i', r).forEach(function (n, j) { n.classList.toggle('on', j < e.loss[i]); });
        });
      }
    };
  };

  function teamBlock(s, cls) {
    return '<div class="' + cls + ' ' + s + '"><i class="mono"></i><div class="mu-tag"></div><div class="mu-nm">' + bi('', '') + '</div><div class="mu-sc">' + bi('', '') + '</div></div>';
  }
  C.matchup = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="mu-head"><div class="t">' + bi('', '') + '</div><span class="lbl mu-st">' + bi('', '') + '</span></div>' +
      '<div class="mu-pl ct"><div class="mu-side"><i class="mono"></i><span class="lbl">' + bi('COUNTER-TERRORISTS', '反恐方') + '</span></div><div><div class="mu-tag"></div><div class="mu-nm">' + bi('', '') + '</div><div class="mu-sc">' + bi('', '') + '</div></div></div>' +
      '<div class="mu-mid"><i class="logo-slot" style="--s:96px"></i><div class="mu-vs">VS</div><span class="lbl mu-bo"></span></div>' +
      '<div class="mu-pl t"><div class="mu-side"><i class="mono"></i><span class="lbl">' + bi('TERRORISTS', '恐怖方') + '</span></div><div><div class="mu-tag"></div><div class="mu-nm">' + bi('', '') + '</div><div class="mu-sc">' + bi('', '') + '</div></div></div>' +
      '<div class="mu-foot"><span class="lbl mu-f1">' + bi('', '') + '</span><span class="mid"></span><span class="lbl r mu-f3"></span></div>';
    return {
      render: function () {
        bilabel($('.mu-head .t', root), S.title, S.titleZh || S.title);
        bilabel($('.mu-st', root), S.stage + ' · BO' + S.bo, (S.stageZh || S.stage) + ' · BO' + S.bo);
        ['ct', 't'].forEach(function (s) {
          var p = $('.mu-pl.' + s, root), tag = String(S[s]).toUpperCase();
          txt(p, '.mono', tag.charAt(0)); txt(p, '.mu-tag', tag);
          bilabel($('.mu-nm', p), String(S[s + 'Name']).toUpperCase(), S[s + 'Zh'] || S[s + 'Name']);
          bilabel($('.mu-sc', p), S[s + 'School'] || '', S[s + 'SchoolZh'] || S[s + 'School'] || '');
        });
        txt(root, '.mu-bo', 'BO' + S.bo + ' · MR12');
        bilabel($('.mu-f1', root), 'FIRST MAP · ' + (S.map || ''), '首张地图 · ' + (S.mapZh || S.map));
        digits($('.mu-foot .mid', root), S.when);
        txt(root, '.mu-f3', S.ctName + '  vs  ' + S.tName);
      }
    };
  };

  /* countdown shared by starting-soon and break */
  var cdTarget = null;
  function cdInit() {
    if (S.until) { var u = isNaN(Number(S.until)) ? Date.parse(S.until) : Number(S.until); if (u) cdTarget = u; }
    else if (S.mins != null || S.secs != null) cdTarget = Date.now() + ((S.mins || 0) * 60 + (S.secs || 0)) * 1000;
  }
  var cdTotal = 0;
  function cdRemain() {
    if (cdTarget == null) return null;
    var r = Math.max(0, Math.ceil((cdTarget - Date.now()) / 1000)); if (!cdTotal) cdTotal = Math.max(1, r); return r;
  }
  function mmss(r) { var h = Math.floor(r / 3600), m = Math.floor(r % 3600 / 60), s = r % 60; return (h ? h + ':' + (m < 10 ? '0' : '') : '') + m + ':' + (s < 10 ? '0' : '') + s; }

  C.startingsoon = function (root) {
    root.classList.add('ov');
    root.innerHTML = '<div class="ss"><i class="logo-slot" aria-hidden="true"></i><span class="ss-t">' + bi('STARTING SOON', '即将开始') + '</span><div class="ss-n"></div><span class="ss-bar"><i class="ss-fill"></i></span>' +
      '<div class="ss-ft"><span class="lbl ss-a">' + bi('', '') + '</span><i></i><span class="lbl ss-b"></span><i></i><span class="lbl ss-c"></span></div></div>';
    return {
      render: function () {
        cdInit; var r = cdRemain(); if (r == null) { cdTarget = Date.now() + 300000; r = 300; }
        digits($('.ss-n', root), mmss(r)); $('.ss-fill', root).style.transform = 'scaleX(' + (cdTotal ? r / cdTotal : 0) + ')';
        bilabel($('.ss-a', root), S.title, S.titleZh || S.title); txt(root, '.ss-b', S.ctName + '  vs  ' + S.tName); txt(root, '.ss-c', S.when);
      },
      tickable: true
    };
  };

  C.breakscreen = function (root) {
    root.classList.add('ov');
    function tm(s) { return '<div class="bk-tm ' + s + '"><i class="mono ' + s + '"></i><div><div class="tg"></div><div class="nm"></div></div></div>'; }
    root.innerHTML = '<div class="bk-l"><span class="lbl">' + bi('INTERMISSION', '中场休息') + '</span><div class="bk-big">' + bi('BREAK', '休息') + '</div>' +
      '<div class="bk-back"><span class="lbl">' + bi('BACK IN', '距离开始') + '</span><span class="n"></span></div></div>' +
      '<div class="bk-r"><span class="lbl">' + bi('UP NEXT', '下一场') + '</span>' + tm('ct') + '<div class="bk-vs">VS</div>' + tm('t') +
      '<div class="bk-wh"><span class="lbl bk-st">' + bi('', '') + '</span><span class="lbl bk-w"></span></div></div>';
    return {
      render: function () {
        var r = cdRemain(); if (r == null) { cdTarget = Date.now() + 272000; r = 272; }
        digits($('.bk-back .n', root), mmss(r));
        ['ct', 't'].forEach(function (s) {
          var b = $('.bk-tm.' + s, root), tag = String(S[s]).toUpperCase();
          txt(b, '.mono', tag.charAt(0)); txt(b, '.tg', tag); txt(b, '.nm', S[s + 'Name']);
        });
        bilabel($('.bk-st', root), S.stage + ' · BO' + S.bo, (S.stageZh || S.stage) + ' · BO' + S.bo); txt(root, '.bk-w', S.when);
      },
      tickable: true
    };
  };

  /* ---------------- engine ---------------- */
  var mounted = [];
  function applyBody() {
    document.body.dataset.theme = S.theme; document.body.dataset.lang = S.lang;
    document.documentElement.lang = S.lang === 'zh' ? 'zh-CN' : 'en';
    if (S.logo) document.body.style.setProperty('--logo', 'url("' + String(S.logo).replace(/"/g, '%22') + '")');
  }
  function renderAll() { mounted.forEach(function (m) { m.comp.render(); }); }
  function update(patch) {
    if (!patch || typeof patch !== 'object') return;
    Object.keys(patch).forEach(function (k) {
      if (k === 'kill' || k === 'stinger') return;
      var v = patch[k];
      if (k === 'players' && v) S.players = { ct: v.ct || S.players.ct, t: v.t || S.players.t };
      else S[k] = NUM[k] && v != null ? Number(v) : v;
    });
    applyBody(); renderAll();
    mounted.forEach(function (m) { if (m.comp.event) m.comp.event(patch); });
  }
  window.addEventListener('message', function (e) { if (e && e.data && e.data.iscc) update(e.data.iscc); });
  window.ISCC = { update: update, state: S, params: Q };

  function boot() {
    var bg = Q.get('bg');
    if (bg === 'checker') document.body.classList.add('bg-checker'); else if (bg) document.body.style.background = bg;
    if (Q.get('fit') === '1') {
      var fit = function () { var k = Math.min(innerWidth / 1920, innerHeight / 1080); document.body.style.transformOrigin = '0 0'; document.body.style.transform = 'scale(' + k + ')'; document.documentElement.style.overflow = 'hidden'; };
      fit(); addEventListener('resize', fit);
    }
    /* default one-off state for single-purpose pages */
    var kind = {};
    $$('[data-ov]').forEach(function (n) { kind[n.dataset.ov] = 1; });
    if (kind.lowerthird && !S.lowerThird) S.lowerThird = { name: S.name || 'ember', line: S.line || 'Northgate Academy · ENTRY', side: S.side === 'ct' ? 'ct' : (Q.has('side') ? S.side : 't'), k: S.k, d: S.d, adr: S.adr };
    if (kind.roundwin && !S.roundWin) S.roundWin = { side: S.side === 't' ? 't' : 'ct', method: S.method || 'defused', round: S.round };
    cdInit();
    if ($$('[data-ov]').length === 1) document.body.classList.add('solo');
    $$('[data-ov]').forEach(function (n) {
      var t = n.dataset.ov, f = t === 'vetoscreen' ? function (r) { return C.veto(r, true); } : C[t];
      if (!f) return; var comp = f(n); mounted.push({ node: n, comp: comp });
    });
    applyBody(); renderAll();
    if (mounted.some(function (m) { return m.comp.tickable; })) setInterval(renderAll, 250);
    if (Q.get('demo') === '1' && $('[data-ov="scoreboard"]')) demo();
  }

  /* ---------------- demo loop (full-hud): ~20 s show, driven only through update() ---------------- */
  function demo() {
    var LOOP = 20000, RESET = 19400, LIVE = 3000, PLANT = 9500, BOMB = 6500, DEF0 = 14350;
    var E_DEF = Math.round(PLANT + BOMB * 39.6 / 40), E_BOOM = PLANT + BOMB;
    var CT = SAMPLE_CT.map(function (p) { return p.name; }), T = SAMPLE_T.map(function (p) { return p.name; });
    var base = {}; SAMPLE_CT.concat(SAMPLE_T).forEach(function (p, i) { base[p.name] = p; });
    var HP = { kite: [[0, 100], [3550, 72], [10750, 44]], ninefold: [[0, 100], [4950, 63]], mossglass: [[0, 100], [4050, 58]], odd1: [[0, 100], [5700, 61]], quill: [[0, 100], [6900, 38]], ember: [[0, 100], [7700, 44]], tallow: [[0, 100], [4700, 80]], wick: [[0, 100], [3300, 34]], sable: [[0, 100], [6700, 70]], juno: [[0, 100]] };
    var KILLS = [[3600, 'kite', 'wick', ['hs'], 'rifle'], [4300, 'sable', 'mossglass', [], 'rifle'], [5000, 'ninefold', 'tallow', ['smoke'], 'sniper'], [6200, 'juno', 'odd1', [], 'smg'], [7000, 'quill', 'sable', ['hs'], 'pistol'], [7800, 'ember', 'quill', [], 'rifle'], [10800, 'kite', 'juno', ['smoke'], 'rifle'], [12000, 'ember', 'ninefold', ['flash'], 'rifle'], [14300, 'ember', 'kite', [], 'rifle', 1]];
    var side = function (n) { return CT.indexOf(n) > -1 ? 'ct' : 't'; };
    var lastT = -1, lapN = -1;
    var t0 = performance.now(), fired = {};
    function fmt(s) { s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60); }
    function frame(now) {
      var abs = now - t0, lap = Math.floor(abs / LOOP), tl = abs - lap * LOOP, eff = tl >= RESET ? lap + 1 : lap, lt = tl >= RESET ? 0 : tl, P = eff % 2;
      if (lap !== lapN) { lapN = lap; fired = {}; }
      var E = P ? E_BOOM : E_DEF, freeze = tl >= RESET || lt < LIVE, ended = !freeze && lt >= E, planted = !freeze && lt >= PLANT && lt < E, ctWin = P === 0, post = !freeze && lt >= E + 2500, round = 14 + P;
      var live = !freeze;
      function hpOf(n) {
        if (freeze) return 100; var v = 100, a = HP[n];
        a.forEach(function (s) { if (lt >= s[0]) v = s[1]; });
        KILLS.forEach(function (k) { if (k[2] === n && lt >= k[0] && (!k[5] || P)) v = 0; }); return v;
      }
      function cnt(n, f) { var c = 0; if (!live) return 0; KILLS.forEach(function (k) { if (lt >= k[0] && (!k[5] || P) && k[f] === n) c++; }); return c; }
      var obs = !live ? 'kite' : (lt >= 11000 ? 'kite' : (lt >= 5200 ? 'ember' : 'kite'));
      function mk(n) { var b = base[n], h = hpOf(n); return { name: n, hp: h, armor: b.armor, wpn: b.wpn, money: b.money, k: b.k + cnt(n, 1), d: b.d + cnt(n, 2), util: b.util, obs: n === obs && h > 0 }; }
      var clock = freeze ? '1:55' : (lt < PLANT ? fmt(115 - (lt - LIVE) * 4.2 / 1000) : (planted ? (function () { var r = Math.max(0, 40 * (1 - (lt - PLANT) / BOMB)); return r >= 10 ? '0:' + Math.ceil(r) : r.toFixed(1); })() : (ctWin ? '0.4' : '0.0')));
      var seq = 'ctccttctcttcc' + (P ? 'c' : ''); if (post) seq += ctWin ? 'c' : 't';
      var sc = post ? (ctWin ? [8, 6] : [8, 7]) : (P ? [8, 6] : [7, 6]);
      var fh = hpOf(obs), fk = cnt(obs, 1);
      var patch = {
        cs: sc[0], ts: sc[1], round: round, clock: clock, hist: seq, planted: planted,
        bomb: planted ? Math.max(0, 1 - (lt - PLANT) / BOMB) : 1, defuse: planted && ctWin && lt >= DEF0 ? Math.min(1, (lt - DEF0) / (E_DEF - DEF0)) : 0,
        result: ended ? (ctWin ? { en: 'BOMB DEFUSED', zh: '炸弹已拆除' } : { en: 'BOMB DETONATED', zh: '炸弹已引爆' }) : null,
        players: { ct: CT.map(mk), t: T.map(mk) },
        focus: { name: obs, side: side(obs), hp: fh, armor: base[obs].armor, mag: freeze ? 30 : Math.max(6, 30 - 5 * fk - Math.floor(Math.max(0, lt - LIVE) / 1800)), res: 90, kills: fk },
        eco: freeze ? (P ? { m: [12800, 5200], e: [4400, 2100], loss: [0, 3] } : { m: [11400, 7600], e: [3800, 2900], loss: [0, 2] }) : null,
        lowerThird: live && lt >= 5000 && lt < 8200 ? (P ? { name: 'Iris Calder', line: 'PLAY-BY-PLAY · CASTER', side: 'cast' } : { name: 'ember', line: 'Northgate Academy · ENTRY', side: 't', k: 17, d: 11, adr: '81.4' }) : null,
        roundWin: ended && lt >= E + 2000 && lt < E + 3300 ? { side: ctWin ? 'ct' : 't', method: ctWin ? 'defused' : 'detonated', round: round } : null
      };
      update(patch);
      KILLS.forEach(function (k, i) {
        if (!live || (k[5] && !P) || fired['k' + i] || lt < k[0] || lt > k[0] + 600) return;
        fired['k' + i] = 1; update({ kill: { a: k[1], as: side(k[1]), v: k[2], vs: side(k[2]), mods: k[3], wpn: k[4] } });
      });
      if (ended && lt >= E + 300 && !fired.stg) { fired.stg = 1; update({ stinger: { side: ctWin ? 'ct' : 't' } }); }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

'use strict';
// node tools/ae_mock/run.js [--readme-table out.md]
// Executes every ISCC builder against a mock of the After Effects DOM and validates the result.
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const acorn = require('acorn');
const mock = require('./mock_ae');

const AE = path.resolve(__dirname, '../../kit/ae');
const ENTRIES = ['ISCC_Build_All.jsx', 'ISCC_Transitions.jsx', 'ISCC_LowerThirds.jsx', 'ISCC_InGame.jsx', 'ISCC_FullScreens.jsx', 'ISCC_Ads.jsx', 'ISCC_Elements.jsx'];
const PALETTE = ['C9A44C', 'E4CF9A', '15294E', '4868A4', '0B0D10', '07090D', 'EFE9DA', '9AA3B2'].map(function (h) { return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16) / 255; }); });
let problems = [];
const bad = function (m) { problems.push(m); };

// ---- preprocessor + ES3 gate -------------------------------------------------
const checked = {};
function es3Check(file, src) {
  if (checked[file]) return; checked[file] = true;
  const rel = path.basename(file);
  const comments = []; const tokens = [];
  try {
    acorn.parse(src, { ecmaVersion: 3, allowReserved: 'never', onComment: comments, onToken: tokens, locations: true });
  } catch (e) { bad('ES3 parse ' + rel + ': ' + e.message); return; }
  let code = src.split('');
  comments.forEach(function (c) { for (let i = c.start; i < c.end; i++) if (code[i] !== '\n') code[i] = ' '; });
  tokens.forEach(function (t) { if (t.type.label === 'string' || t.type.label === 'regexp') for (let i = t.start; i < t.end; i++) if (code[i] !== '\n') code[i] = '_'; });
  code = code.join('');
  const rules = [[/=>/, 'arrow function'], [/\blet\s+[\w$]/, 'let'], [/\bconst\s+[\w$]/, 'const'], [/`/, 'template string'], [/\bclass\s+[\w$]/, 'class'], [/\.\.\./, 'spread'],
    [/,\s*[\]}]/, 'trailing comma'], [/\.(map|forEach|filter|reduce|some|every|trim|bind)\s*\(/, 'ES5 array/string method'], [/\bJSON\b/, 'JSON'], [/Object\.(keys|create|defineProperty)/, 'ES5 Object API'], [/Array\.isArray/, 'Array.isArray'], [/\bDate\.now/, 'Date.now']];
  rules.forEach(function (r) { const m = r[0].exec(code); if (m) bad('non-ES3 (' + r[1] + ') in ' + rel + ' near line ' + code.slice(0, m.index).split('\n').length); });
}
function preprocess(file, depthGuard) {
  const src = fs.readFileSync(file, 'utf8');
  const out = src.split('\n').map(function (ln) {
    const m = /^\s*#include\s+"([^"]+)"/.exec(ln);
    if (m) return preprocess(path.resolve(path.dirname(file), m[1]));
    if (/^\s*#target|^\s*\/\/@target/.test(ln)) return '';
    return ln;
  });
  // ES3 check on the file body without includes
  es3Check(file, src.split('\n').map(function (l) { return /^\s*#include/.test(l) || /^\s*#target/.test(l) ? '' : l; }).join('\n'));
  return out.join('\n');
}

// ---- one run --------------------------------------------------------------------
function runEntry(entryName, opts) {
  const entry = path.join(AE, entryName);
  const env = mock.makeEnv(Object.assign({ entry: entry }, opts));
  const ctx = vm.createContext(env.globals);
  const src = preprocess(entry);
  const label = entryName + ' [AE ' + (opts.version || '23') + (opts.vfs ? ' +files' : '') + ']';
  try { vm.runInContext(src, ctx, { filename: entryName }); }
  catch (e) { bad(label + ' THREW: ' + (e.stack || e).toString().split('\n').slice(0, 4).join(' | ')); }
  if (env.state.undoDepth !== 0) bad(label + ' unbalanced undo group');
  env.state.alerts.forEach(function (a) { if (/fail|error/i.test(a)) bad(label + ' alert: ' + a.split('\n')[0]); });
  return { env: env, ctx: ctx, label: label };
}

function walkProps(g, fn) {
  const kids = g.kids || [];
  kids.forEach(function (k) { fn(k); if (k.kids) walkProps(k, fn); });
}
function inspect(r) {
  const comps = r.env.state.items.filter(function (i) { return i instanceof r.env.CompItem; });
  const rows = [];
  const names = {};
  comps.forEach(function (c) {
    const row = { name: c.name, layers: c._layers.length, w: c.width, h: c.height, fps: c.frameRate, dur: c.duration, markers: c.markerProperty.keys.length, expr: 0, keys: 0, eg: c._eg || 0, texts: 0, alpha: !c._layers.some(function (l) { return l.name === 'STAGE'; }) };
    if (names[c.name]) bad('duplicate comp name ' + c.name); names[c.name] = 1;
    if (c._layers.length === 0) bad('zero-layer comp ' + c.name);
    const layerNames = {};
    c._layers.forEach(function (l) {
      layerNames[l.name] = l;
      if (l.kind === 'text') row.texts++;
      walkProps(l.root, function (p) {
        if (p.type !== undefined) { if (p.expression) { row.expr++; checkExpr(c, l, p); } row.keys += p.keys.length; }
      });
    });
    const isc = /^ISCC_/.test(c.name);
    if (isc) {
      const mk = c.markerProperty.keys.map(function (k) { return k.v.comment; });
      if (mk.indexOf('IN') < 0 || mk.indexOf('OUT') < 0) bad(c.name + ': missing IN/OUT marker');
      if (!layerNames['CONTROL']) bad(c.name + ': no CONTROL');
      c._layers.forEach(function (l) { if (/ EN$/.test(l.name) && !layerNames[l.name.replace(/ EN$/, ' CN')]) bad(c.name + ': ' + l.name + ' has no CN pair'); });
      const stage = !!layerNames['STAGE'];
      if (/^ISCC_(Trans|LT|InGame|Elem)_/.test(c.name) && stage && !/Smoke|Grain/.test(c.name)) bad(c.name + ': overlay comp has background solid');
      c.markerProperty.keys.forEach(function (k) { if (k.t > c.duration + 1e-6) bad(c.name + ': marker past end'); });
      row.logo = c._layers.some(function (l) { return l.usesComp && l.usesComp.name === 'LOGO (replace me)'; });
    }
    row.isc = isc; row.comp = c;
    rows.push(row);
  });
  return rows;
}
function checkExpr(c, l, p) {
  const e = p.expression;
  try { new Function(e); } catch (x) { bad(c.name + '/' + l.name + '/' + p.name + ' expression syntax: ' + x.message + ' :: ' + e.slice(0, 80)); return; }
  let m; const re = /thisComp\.layer\("([^"]+)"\)(?:\.effect\("([^"]+)"\))?/g;
  while ((m = re.exec(e))) {
    const t = c._layers.filter(function (x) { return x.name === m[1]; })[0];
    if (!t) { bad(c.name + ': expression references missing layer ' + m[1]); continue; }
    if (m[2] && !t.Effects.property(m[2])) bad(c.name + ': expression references missing effect ' + m[2]);
  }
}
function checkGlobal(r, rows) {
  const ISCC = r.ctx.ISCC;
  const fontVals = Object.keys(ISCC.CFG.fonts).map(function (k) { return ISCC.CFG.fonts[k]; });
  Object.keys(mock.stats.fonts).forEach(function (f) { if (fontVals.indexOf(f) < 0) bad('font not from CFG: ' + f); });
  mock.stats.colours.forEach(function (c) {
    if (!PALETTE.some(function (p) { return Math.abs(p[0] - c[0]) < 0.003 && Math.abs(p[1] - c[1]) < 0.003 && Math.abs(p[2] - c[2]) < 0.003; })) bad('off-brand colour ' + c.map(function (x) { return Math.round(x * 255); }));
  });
  rows.forEach(function (row) {
    if (!row.isc) return;
    const sq = /_(9x16|1x1|4x5)/.test(row.name) || /Story/.test(row.name);
    if (!sq && (row.w !== 1920 || row.h !== 1080)) bad(row.name + ' not 1920x1080');
    if (Math.abs(row.fps - ISCC.CFG.fps) > 1e-9) bad(row.name + ' fps');
    const b = ISCC.built.filter(function (x) { return x.name === row.name; })[0];
    if (!b) bad(row.name + ' not registered in ISCC.built'); else if (b.alpha !== row.alpha) bad(row.name + ' alpha flag mismatch');
  });
}

const t0 = Date.now();
mock.stats.warnings.length = 0;
const main = runEntry('ISCC_Build_All.jsx', { version: '23.0.0', buildAll: true, vfsOnly: true });
const mainRows = inspect(main);
checkGlobal(main, mainRows);
const iscc = mainRows.filter(function (r) { return r.isc; });

// AE 22 fallback path + files present (import success path)
const rootKit = path.resolve(AE, '..');
const run22 = runEntry('ISCC_Build_All.jsx', { version: '22.0.0', buildAll: true, vfsOnly: true, vfs: [rootKit + '/plates/beams-dark-16x9.png', rootKit + '/plates/beams-dark-9x16.png', rootKit + '/logos/gold/mark-gold-2048.png'] });
const rows22 = inspect(run22);
if (run22.env.state.imports.length !== 3) bad('AE22 run: expected 3 imports, got ' + run22.env.state.imports.length);
const n22 = rows22.filter(function (r) { return r.isc; }).length;
if (n22 !== iscc.length) bad('AE22 run built ' + n22 + ' comps vs ' + iscc.length);
if (main.env.state.imports.length !== 0) bad('files-missing run imported something?');

// real kit assets on disk (kit/plates, kit/logos), real filesystem
const realRun = runEntry('ISCC_Build_All.jsx', { version: '23.0.0', buildAll: true });
inspect(realRun);
if (realRun.env.state.imports.length < 5) bad('real-assets run imported only ' + realRun.env.state.imports.length);
console.log('real-assets run: imported ' + realRun.env.state.imports.length + ' files; notes: ' + realRun.ctx.ISCC.notes.join(' / '));

// standalone family runs
ENTRIES.slice(1).forEach(function (e) {
  const r = runEntry(e, { version: '23.0.0', vfsOnly: true });
  const rows = inspect(r).filter(function (x) { return x.isc; });
  if (rows.length === 0) bad(e + ' standalone built no comps');
  if (/Alert/.test('')) {}
});

// ---- report ---------------------------------------------------------------------------
const pad = function (s, n) { s = String(s); return s.length >= n ? s : s + new Array(n - s.length + 1).join(' '); };
console.log(pad('COMP', 40) + pad('SIZE', 11) + pad('DUR', 7) + pad('LAYERS', 7) + pad('MARK', 5) + pad('EXPR', 6) + pad('KEYS', 6) + pad('EG', 4) + pad('ALPHA', 6) + 'LOGO');
iscc.forEach(function (r) { console.log(pad(r.name, 40) + pad(r.w + 'x' + r.h, 11) + pad(r.dur.toFixed(1), 7) + pad(r.layers, 7) + pad(r.markers, 5) + pad(r.expr, 6) + pad(r.keys, 6) + pad(r.eg, 4) + pad(r.alpha ? 'yes' : 'no', 6) + (r.logo ? 'y' : '')); });
const sum = function (k) { return iscc.reduce(function (a, r) { return a + r[k]; }, 0); };
console.log('\nISCC comps: ' + iscc.length + ' | layers ' + sum('layers') + ' | expressions ' + sum('expr') + ' | keyframes ' + sum('keys') + ' | EG props ' + sum('eg'));
console.log('match names exercised: ' + Object.keys(mock.stats.matchNamesUsed).length + ' | fonts used: ' + Object.keys(mock.stats.fonts).join(', '));
console.log('notes from lib (run 1): ' + main.ctx.ISCC.notes.join(' / '));
let srcBytes = 0; fs.readdirSync(AE).forEach(function (f) { if (/\.(jsx|jsxinc)$/.test(f)) srcBytes += fs.statSync(path.join(AE, f)).size; });
console.log('script size: ' + (srcBytes / 1024).toFixed(1) + ' KB; elapsed ' + (Date.now() - t0) + ' ms');
if (iscc.length < 45) bad('only ' + iscc.length + ' comps (need >= 45)');
const warn = mock.stats.warnings.filter(function (x, i, a) { return a.indexOf(x) === i; });
if (warn.length) { console.log('\nTIMING WARNINGS (' + warn.length + '):'); warn.slice(0, 40).forEach(function (w) { console.log('  ' + w); }); bad(warn.length + ' keyframes past comp end'); }

const ti = process.argv.indexOf('--readme-table');
if (ti > 0) {
  const lines = ['| Comp | Size | Dur (s) | Alpha | Purpose | Controls |', '|---|---|---|---|---|---|'];
  main.ctx.ISCC.built.forEach(function (b) { lines.push('| `' + b.name + '` | ' + b.w + '×' + b.h + ' | ' + b.dur + ' | ' + (b.alpha ? 'yes' : 'no') + ' | ' + b.note + ' | ' + b.ctrl + ' |'); });
  fs.writeFileSync(process.argv[ti + 1], lines.join('\n') + '\n');
}
if (problems.length) { console.log('\nFAILED (' + problems.length + '):'); problems.slice(0, 60).forEach(function (p) { console.log('  - ' + p); }); process.exit(1); }
console.log('\nPASS');

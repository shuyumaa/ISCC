'use strict';
// Minimal After Effects DOM mock. Strict about match names, value shapes, ease arity and enums.
const fs = require('fs');
const path = require('path');

const PVT = { NO_VALUE: 0, ThreeD_SPATIAL: 1, ThreeD: 2, TwoD_SPATIAL: 3, TwoD: 4, OneD: 5, COLOR: 6, CUSTOM_VALUE: 7, MARKER: 8, SHAPE: 9, TEXT_DOCUMENT: 10 };
const ENUMS = {
  BlendingMode: { NORMAL: 1, ADD: 2, SCREEN: 3, OVERLAY: 4, MULTIPLY: 5 },
  TrackMatteType: { NO_TRACK_MATTE: 0, ALPHA: 1, ALPHA_INVERTED: 2, LUMA: 3, LUMA_INVERTED: 4 },
  ParagraphJustification: { LEFT_JUSTIFY: 7613, CENTER_JUSTIFY: 7614, RIGHT_JUSTIFY: 7615 },
  KeyframeInterpolationType: { LINEAR: 6612, BEZIER: 6613, HOLD: 6614 },
  ImportAsType: { FOOTAGE: 3813, COMP: 3814, PROJECT: 3815 },
  PropertyValueType: PVT,
  PropertyType: { PROPERTY: 6212, INDEXED_GROUP: 6213, NAMED_GROUP: 6214 }
};
const EFFECTS = {
  'ADBE Color Control': { name: 'Color Control', kids: [['ADBE Color Control-0001', 'Color', 'color', [1, 0, 0, 1]]] },
  'ADBE Slider Control': { name: 'Slider Control', kids: [['ADBE Slider Control-0001', 'Slider', 'oneD', 0]] },
  'ADBE Checkbox Control': { name: 'Checkbox Control', kids: [['ADBE Checkbox Control-0001', 'Checkbox', 'oneD', 0]] },
  'ADBE Point Control': { name: 'Point Control', kids: [['ADBE Point Control-0001', 'Point', 'twoD', [0, 0]]] },
  'ADBE Gaussian Blur 2': { name: 'Gaussian Blur', kids: [['ADBE Gaussian Blur 2-0001', 'Blurriness', 'oneD', 0]] },
  'ADBE Fractal Noise': { name: 'Fractal Noise', kids: [
    ['ADBE Fractal Noise-0001', 'Fractal Type', 'oneD', 1], ['ADBE Fractal Noise-0002', 'Noise Type', 'oneD', 1],
    ['ADBE Fractal Noise-0003', 'Invert', 'oneD', 0], ['ADBE Fractal Noise-0004', 'Contrast', 'oneD', 100],
    ['ADBE Fractal Noise-0005', 'Brightness', 'oneD', 0], ['ADBE Fractal Noise-0010', 'Scale', 'oneD', 100],
    ['ADBE Fractal Noise-0020', 'Evolution', 'oneD', 0], ['ADBE Fractal Noise-0021', 'Complexity', 'oneD', 6] ] }
};
// leaf property definitions: match -> [display, type, default]
const LEAF = {
  'ADBE Anchor Point': ['Anchor Point', 'twoS', [0, 0]], 'ADBE Position': ['Position', 'twoS', [0, 0]],
  'ADBE Scale': ['Scale', 'threeD', [100, 100, 100]], 'ADBE Rotate Z': ['Rotation', 'oneD', 0], 'ADBE Opacity': ['Opacity', 'oneD', 100],
  'ADBE Text Document': ['Source Text', 'text', null],
  'ADBE Vector Rect Size': ['Size', 'twoD', [100, 100]], 'ADBE Vector Rect Position': ['Position', 'twoD', [0, 0]], 'ADBE Vector Rect Roundness': ['Roundness', 'oneD', 0],
  'ADBE Vector Ellipse Size': ['Size', 'twoD', [100, 100]], 'ADBE Vector Ellipse Position': ['Position', 'twoD', [0, 0]],
  'ADBE Vector Shape': ['Path', 'shape', null],
  'ADBE Vector Fill Color': ['Color', 'color', [1, 0, 0, 1]], 'ADBE Vector Fill Opacity': ['Opacity', 'oneD', 100],
  'ADBE Vector Stroke Color': ['Color', 'color', [1, 1, 1, 1]], 'ADBE Vector Stroke Opacity': ['Opacity', 'oneD', 100],
  'ADBE Vector Stroke Width': ['Stroke Width', 'oneD', 2], 'ADBE Vector Stroke Line Cap': ['Line Cap', 'oneD', 1], 'ADBE Vector Stroke Line Join': ['Line Join', 'oneD', 1],
  'ADBE Vector Stroke Dash 1': ['Dash', 'oneD', 10], 'ADBE Vector Stroke Gap 1': ['Gap', 'oneD', 10], 'ADBE Vector Stroke Offset': ['Offset', 'oneD', 0],
  'ADBE Vector Trim Start': ['Start', 'oneD', 0], 'ADBE Vector Trim End': ['End', 'oneD', 100], 'ADBE Vector Trim Offset': ['Offset', 'oneD', 0], 'ADBE Vector Trim Type': ['Trim Multiple Shapes', 'oneD', 1],
  'ADBE Vector Anchor': ['Anchor Point', 'twoD', [0, 0]], 'ADBE Vector Position': ['Position', 'twoD', [0, 0]], 'ADBE Vector Scale': ['Scale', 'twoD', [100, 100]],
  'ADBE Vector Skew': ['Skew', 'oneD', 0], 'ADBE Vector Skew Axis': ['Skew Axis', 'oneD', 0], 'ADBE Vector Rotation': ['Rotation', 'oneD', 0], 'ADBE Vector Group Opacity': ['Opacity', 'oneD', 100]
};
const VEC_ITEMS = {
  'ADBE Vector Shape - Rect': ['Rectangle Path', ['ADBE Vector Rect Size', 'ADBE Vector Rect Position', 'ADBE Vector Rect Roundness']],
  'ADBE Vector Shape - Ellipse': ['Ellipse Path', ['ADBE Vector Ellipse Size', 'ADBE Vector Ellipse Position']],
  'ADBE Vector Shape - Group': ['Path', ['ADBE Vector Shape']],
  'ADBE Vector Graphic - Fill': ['Fill', ['ADBE Vector Fill Color', 'ADBE Vector Fill Opacity']],
  'ADBE Vector Graphic - Stroke': ['Stroke', ['ADBE Vector Stroke Color', 'ADBE Vector Stroke Opacity', 'ADBE Vector Stroke Width', 'ADBE Vector Stroke Line Cap', 'ADBE Vector Stroke Line Join', 'G:ADBE Vector Stroke Dashes']],
  'ADBE Vector Filter - Trim': ['Trim Paths', ['ADBE Vector Trim Start', 'ADBE Vector Trim End', 'ADBE Vector Trim Offset', 'ADBE Vector Trim Type']],
  'ADBE Vector Group': ['Group', null]
};
const stats = { matchNamesUsed: {}, colours: [], fonts: {}, warnings: [], errors: [] };
function fail(msg) { throw new Error('[mock] ' + msg); }
function isNum(n) { return typeof n === 'number' && isFinite(n); }
function clone(v) { return Array.isArray(v) ? v.slice() : v; }

class KeyframeEase { constructor(speed, infl) { if (!isNum(speed) || !isNum(infl) || infl < 0.1 || infl > 100) fail('bad KeyframeEase ' + speed + ',' + infl); this.speed = speed; this.influence = infl; } }
class MarkerValue { constructor(comment) { if (typeof comment !== 'string') fail('MarkerValue needs string'); this.comment = comment; this.duration = 0; } }
class Shape { constructor() { this.vertices = []; this.inTangents = []; this.outTangents = []; this.closed = true; } }
class TextDocument {
  constructor(t) { this.text = t; this.fontSize = 50; this.font = 'Arial'; this.fillColor = [1, 1, 1]; this.applyFill = true; this.applyStroke = false; this.justification = ENUMS.ParagraphJustification.LEFT_JUSTIFY; this.tracking = 0; this.leading = 60; this.autoLeading = true; }
  resetCharStyle() {}
}

class Prop {
  constructor(parent, match, name, type, def, comp) {
    this.parentProp = parent; this.matchName = match; this.name = name; this.type = type; this.comp = comp;
    this.keys = []; this._expr = ''; this.propertyType = ENUMS.PropertyType.PROPERTY;
    this._v = def === null ? null : clone(def);
    this.propertyValueType = ({ twoS: PVT.TwoD_SPATIAL, threeD: PVT.ThreeD, oneD: PVT.OneD, twoD: PVT.TwoD, color: PVT.COLOR, shape: PVT.SHAPE, text: PVT.TEXT_DOCUMENT, marker: PVT.MARKER })[type];
    this.isSpatial = type === 'twoS';
    if (type === 'text') this._v = new TextDocument('');
  }
  get value() { const v = this._v; if (this.type === 'text') { const t = new TextDocument(v.text); Object.assign(t, v); return t; } return clone(v); }
  get expression() { return this._expr; }
  set expression(s) { if (typeof s !== 'string') fail('expression must be string'); this._expr = s; }
  get expressionEnabled() { return this._expr !== ''; }
  get numKeys() { return this.keys.length; }
  _check(v) {
    const t = this.type;
    if (t === 'oneD') { if (!isNum(v)) fail(this.name + ' needs number, got ' + v); }
    else if (t === 'twoD' || t === 'twoS') { if (!Array.isArray(v) || v.length < 2 || v.length > 3 || !v.every(isNum)) fail(this.name + ' needs [x,y]'); }
    else if (t === 'threeD') { if (!Array.isArray(v) || v.length < 2 || v.length > 3 || !v.every(isNum)) fail(this.name + ' needs [x,y(,z)]'); }
    else if (t === 'color') {
      if (!Array.isArray(v) || (v.length !== 3 && v.length !== 4) || !v.every(function (n) { return isNum(n) && n >= 0 && n <= 1; })) fail(this.name + ' bad colour ' + v);
      stats.colours.push(v.slice(0, 3));
    } else if (t === 'shape') { if (!(v instanceof Shape) || v.vertices.length !== v.inTangents.length || v.vertices.length !== v.outTangents.length || v.vertices.length < 2) fail('bad Shape'); }
    else if (t === 'text') { checkText(v); }
    else if (t === 'marker') { if (!(v instanceof MarkerValue)) fail('marker needs MarkerValue'); }
  }
  setValue(v) { this._check(v); this._v = (this.type === 'text') ? Object.assign(new TextDocument(''), v) : clone(v); }
  _time(t) { if (!isNum(t) || t < 0) fail('bad key time ' + t + ' on ' + this.name); if (this.comp && t > this.comp.duration + 1e-6) stats.warnings.push(this.comp.name + ': key past comp end ' + t.toFixed(2) + ' on ' + this.name); }
  setValueAtTime(t, v) {
    this._time(t); this._check(v);
    if (this.type === 'text' || this.type === 'shape') { /* allowed */ }
    const k = { t: t, v: clone(v), inE: null, outE: null };
    for (let i = 0; i < this.keys.length; i++) { if (Math.abs(this.keys[i].t - t) < 1e-9) { this.keys[i].v = k.v; return; } }
    this.keys.push(k); this.keys.sort(function (a, b) { return a.t - b.t; });
  }
  addKey(t) { this._time(t); this.setValueAtTime(t, this._v === null ? 0 : this._v); for (let i = 0; i < this.keys.length; i++) if (Math.abs(this.keys[i].t - t) < 1e-9) return i + 1; }
  keyTime(i) { if (i < 1 || i > this.keys.length) fail('keyTime index'); return this.keys[i - 1].t; }
  keyValue(i) { return clone(this.keys[i - 1].v); }
  valueAtTime(t) {
    if (!this.keys.length) return this.value;
    const ks = this.keys; if (t <= ks[0].t) return clone(ks[0].v); if (t >= ks[ks.length - 1].t) return clone(ks[ks.length - 1].v);
    for (let i = 0; i < ks.length - 1; i++) if (t >= ks[i].t && t <= ks[i + 1].t) return clone(ks[i].v);
  }
  _dims() { return ({ twoS: 1, threeD: 3, twoD: 2, oneD: 1, color: 4 })[this.type] || 1; }
  setTemporalEaseAtKey(i, a, b) {
    if (i < 1 || i > this.keys.length) fail('ease key index');
    if (!this.keys.length) fail('no keys');
    if (!Array.isArray(a) || !Array.isArray(b)) fail('ease arrays needed');
    const d = this._dims();
    if (a.length !== d || b.length !== d) fail('ease arity ' + a.length + ' != ' + d + ' for ' + this.name);
    a.concat(b).forEach(function (e) { if (!(e instanceof KeyframeEase)) fail('not KeyframeEase'); });
    this.keys[i - 1].inE = a; this.keys[i - 1].outE = b;
  }
  setInterpolationTypeAtKey(i, a, b) {
    if (i < 1 || i > this.keys.length) fail('interp key index');
    [a, b].forEach(function (x) { let ok = false; for (const k in ENUMS.KeyframeInterpolationType) if (ENUMS.KeyframeInterpolationType[k] === x) ok = true; if (!ok) fail('bad interpolation enum'); });
  }
  canAddToMotionGraphicsTemplate(comp) { return !!comp && (this.type === 'text' || this.type === 'color' || this.type === 'oneD'); }
  addToMotionGraphicsTemplateAs(comp, nm) { if (typeof nm !== 'string') fail('EG name'); stats.eg = (stats.eg || 0) + 1; this.comp._eg = (this.comp._eg || 0) + 1; return true; }
}

class Group {
  constructor(parent, match, name, comp, addable, indexed) {
    this.parentProp = parent; this.matchName = match; this.name = name; this.comp = comp; this.kids = []; this.addable = addable || null; this.indexed = !!indexed;
    this.propertyType = indexed ? ENUMS.PropertyType.INDEXED_GROUP : ENUMS.PropertyType.NAMED_GROUP;
  }
  get numProperties() { return this.kids.length; }
  property(k) {
    if (typeof k === 'number') return this.kids[k - 1] || null;
    for (const c of this.kids) if (c.matchName === k) return c;
    for (const c of this.kids) if (c.name === k) return c;
    return null;
  }
  addProperty(match) {
    if (!this.addable || this.addable.indexOf(match) < 0) fail('addProperty("' + match + '") not allowed on ' + this.matchName);
    stats.matchNamesUsed[match] = 1;
    let g;
    if (EFFECTS[match]) {
      const e = EFFECTS[match]; g = new Group(this, match, e.name, this.comp, null, false);
      e.kids.forEach(function (k) { stats.matchNamesUsed[k[0]] = 1; g.kids.push(new Prop(g, k[0], k[1], k[2], k[3], g.comp)); });
    } else if (match === 'ADBE Vector Group') {
      g = new Group(this, match, 'Group ' + (this.kids.length + 1), this.comp, null, false);
      g.kids.push(new Group(g, 'ADBE Vectors Group', 'Contents', this.comp, Object.keys(VEC_ITEMS).filter(function (x) { return x !== 'ADBE Vector Group'; }), true));
      const t = new Group(g, 'ADBE Vector Transform Group', 'Transform', this.comp, null, false);
      ['ADBE Vector Anchor', 'ADBE Vector Position', 'ADBE Vector Scale', 'ADBE Vector Skew', 'ADBE Vector Skew Axis', 'ADBE Vector Rotation', 'ADBE Vector Group Opacity'].forEach(function (m) { t.kids.push(mkLeaf(t, m)); });
      g.kids.push(t);
    } else if (VEC_ITEMS[match]) {
      g = new Group(this, match, VEC_ITEMS[match][0], this.comp, null, false);
      VEC_ITEMS[match][1].forEach(function (m) {
        if (m.indexOf('G:') === 0) { const d = new Group(g, m.slice(2), 'Dashes', g.comp, ['ADBE Vector Stroke Dash 1', 'ADBE Vector Stroke Gap 1', 'ADBE Vector Stroke Offset'], true); g.kids.push(d); }
        else g.kids.push(mkLeaf(g, m));
      });
    } else if (LEAF[match]) { g = mkLeaf(this, match); }
    else fail('unknown match name ' + match);
    this.kids.push(g);
    return g;
  }
}
function mkLeaf(parent, m) { const d = LEAF[m]; if (!d) fail('no leaf def ' + m); stats.matchNamesUsed[m] = 1; return new Prop(parent, m, d[0], d[1], d[2], parent.comp); }
function checkText(v) {
  if (!(v instanceof TextDocument)) fail('text value must be TextDocument');
  if (!isNum(v.fontSize) || v.fontSize <= 0) fail('fontSize');
  if (typeof v.font !== 'string' || !v.font) fail('font');
  if (!Array.isArray(v.fillColor) || v.fillColor.length !== 3 || !v.fillColor.every(function (n) { return isNum(n) && n >= 0 && n <= 1; })) fail('fillColor');
  let ok = false; for (const k in ENUMS.ParagraphJustification) if (ENUMS.ParagraphJustification[k] === v.justification) ok = true;
  if (!ok) fail('justification enum');
  if (!isNum(v.tracking) || !isNum(v.leading)) fail('tracking/leading');
  if (typeof v.text !== 'string') fail('text');
  stats.colours.push(v.fillColor.slice()); stats.fonts[v.font] = 1;
}

class Layer {
  constructor(comp, kind, name) {
    this.containingComp = comp; this.kind = kind; this.name = name; this.enabled = true; this.guideLayer = false; this.parent = null;
    this.startTime = 0; this.inPoint = 0; this.outPoint = comp.duration; this._matte = 0; this.hasTrackMatte = false; this.source = null; this.blendingMode = ENUMS.BlendingMode.NORMAL; this.adjustmentLayer = false;
    this.root = new Group(null, 'ROOT', 'ROOT', comp, null, true);
    const t = new Group(this.root, 'ADBE Transform Group', 'Transform', comp, null, false);
    ['ADBE Anchor Point', 'ADBE Position', 'ADBE Scale', 'ADBE Rotate Z', 'ADBE Opacity'].forEach(function (m) { t.kids.push(mkLeaf(t, m)); });
    this.root.kids.push(t);
    this.root.kids.push(new Group(this.root, 'ADBE Effect Parade', 'Effects', comp, Object.keys(EFFECTS), true));
    this.root.kids.push(new Prop(this.root, 'ADBE Marker', 'Marker', 'marker', null, comp));
    if (kind === 'text') { const tp = new Group(this.root, 'ADBE Text Properties', 'Text', comp, null, false); tp.kids.push(mkLeaf(tp, 'ADBE Text Document')); this.root.kids.push(tp); }
    if (kind === 'shape') this.root.kids.push(new Group(this.root, 'ADBE Root Vectors Group', 'Contents', comp, ['ADBE Vector Group'], true));
  }
  get index() { return this.containingComp._layers.indexOf(this) + 1; }
  property(k) { return this.root.property(k); }
  get Effects() { return this.root.property('ADBE Effect Parade'); }
  get transform() { return this.root.property('ADBE Transform Group'); }
  set trackMatteType(t) {
    let ok = false; for (const k in ENUMS.TrackMatteType) if (ENUMS.TrackMatteType[k] === t) ok = true; if (!ok) fail('bad TrackMatteType');
    if (t !== 0) { const above = this.containingComp._layers[this.index - 2]; if (!above) fail('trackMatteType: no layer above ' + this.name); this._matteLayer = above; }
    this._matte = t; this.hasTrackMatte = t !== 0;
  }
  get trackMatteType() { return this._matte; }
  _mv(arr, at) { const L = this.containingComp._layers; L.splice(this.index - 1, 1); L.splice(at, 0, this); }
  moveToEnd() { const L = this.containingComp._layers; L.splice(this.index - 1, 1); L.push(this); }
  moveToBeginning() { this._mv(null, 0); }
  moveBefore(o) { if (!(o instanceof Layer) || o.containingComp !== this.containingComp) fail('moveBefore needs layer of same comp'); const L = this.containingComp._layers; L.splice(this.index - 1, 1); L.splice(o.index - 1, 0, this); }
  moveAfter(o) { if (!(o instanceof Layer) || o.containingComp !== this.containingComp) fail('moveAfter needs layer of same comp'); const L = this.containingComp._layers; L.splice(this.index - 1, 1); L.splice(o.index, 0, this); }
}
function chkParent(l, p) { if (p !== null && (!(p instanceof Layer) || p.containingComp !== l.containingComp || p === l)) fail('bad parent'); }
Object.defineProperty(Layer.prototype, 'parent', { get() { return this._parent || null; }, set(p) { chkParent(this, p); this._parent = p; } });

class Item { constructor(name) { this.name = name; this.comment = ''; } }
class FolderItem extends Item { constructor(n) { super(n); this.items = []; } get numItems() { return this.items.length; } }
class FootageItem extends Item { constructor(n, w, h) { super(n); this.width = w; this.height = h; } }
class CompItem extends Item {
  constructor(name, w, h, pa, dur, fps) {
    super(name); this.width = w; this.height = h; this.pixelAspect = pa; this.duration = dur; this.frameRate = fps;
    this._layers = []; this.workAreaStart = 0; this.workAreaDuration = dur; this.bgColor = [0, 0, 0]; this.motionGraphicsTemplateName = '';
    this.markerProperty = new Prop(this, 'ADBE Marker', 'Marker', 'marker', null, this);
    const self = this;
    this.layers = {
      get length() { return self._layers.length; },
      _add(kind, name) { const l = new Layer(self, kind, name); self._layers.unshift(l); return l; },
      addSolid(color, name, w, h, pa, d) {
        if (!Array.isArray(color) || color.length !== 3) fail('addSolid colour'); stats.colours.push(color.slice());
        if (!isNum(w) || !isNum(h) || w < 1 || h < 1 || pa !== 1) fail('addSolid size'); const l = this._add('solid', name); l.source = { width: w, height: h }; return l;
      },
      addNull(d) { return this._add('null', 'Null'); },
      addShape() { return this._add('shape', 'Shape Layer'); },
      addText(s) { if (typeof s !== 'string' && !(s instanceof TextDocument)) fail('addText arg'); const l = this._add('text', 'Text'); const p = l.property('ADBE Text Properties').property('ADBE Text Document'); p._v.text = typeof s === 'string' ? s : s.text; return l; },
      addBoxText(sz, s) { return this.addText(s); },
      add(item, d) { if (!(item instanceof CompItem) && !(item instanceof FootageItem)) fail('layers.add needs item'); if (item === self) fail('comp cannot contain itself'); const l = this._add('av', item.name); l.source = item; l.usesComp = item; return l; },
      byName(n) { for (const l of self._layers) if (l.name === n) return l; return null; }
    };
  }
  get numLayers() { return this._layers.length; }
  layer(i) { return typeof i === 'number' ? this._layers[i - 1] : this.layers.byName(i); }
  openInEssentialGraphics() {}
}
Object.defineProperty(Item.prototype, 'parentFolder', { get() { return this._pf || null; }, set(f) { if (!(f instanceof FolderItem)) fail('parentFolder must be FolderItem'); if (this._pf) this._pf.items.splice(this._pf.items.indexOf(this), 1); this._pf = f; f.items.push(this); } });

function makeEnv(opts) {
  const vfs = new Set(opts.vfs || []); const real = !opts.vfsOnly;
  const norm = function (p) { return path.resolve(p); };
  const state = { alerts: [], undoDepth: 0, undoMax: 0, undoGroups: 0, items: [], imports: [] };
  class FileSys { constructor(p) { this._p = norm(p); } get fsName() { return this._p; } get name() { return path.basename(this._p); } get parent() { return new Folder(path.dirname(this._p)); } }
  class Folder extends FileSys {
    get exists() { if (real && fs.existsSync(this._p) && fs.statSync(this._p).isDirectory()) return true; for (const v of vfs) if (v.indexOf(this._p + '/') === 0) return true; return false; }
    getFiles() {
      const out = {}; const self = this;
      try { if (real) fs.readdirSync(this._p).forEach(function (n) { out[n] = fs.statSync(path.join(self._p, n)).isDirectory() ? 'd' : 'f'; }); } catch (e) {}
      for (const v of vfs) if (v.indexOf(this._p + '/') === 0) { const rest = v.slice(this._p.length + 1); const i = rest.indexOf('/'); if (i < 0) out[rest] = 'f'; else out[rest.slice(0, i)] = 'd'; }
      return Object.keys(out).map(function (n) { return out[n] === 'd' ? new Folder(path.join(self._p, n)) : new File(path.join(self._p, n)); });
    }
  }
  class File extends FileSys {
    get exists() { return (real && fs.existsSync(this._p)) || vfs.has(this._p); }
    open() { return true; } close() {} read() { return real && fs.existsSync(this._p) ? fs.readFileSync(this._p, 'utf8') : ''; }
  }
  class ImportOptions { constructor(f) { if (!(f instanceof File)) fail('ImportOptions needs File'); this.file = f; this.importAs = ENUMS.ImportAsType.FOOTAGE; } }
  const project = {
    items: {
      addComp(name, w, h, pa, dur, fps) {
        if (typeof name !== 'string' || !(w >= 4 && w <= 30000 && h >= 4 && h <= 30000) || pa !== 1 || !(dur > 0 && dur <= 10800) || !(fps >= 1 && fps <= 99)) fail('addComp args ' + [name, w, h, pa, dur, fps]);
        const c = new CompItem(name, w, h, pa, dur, fps); state.items.push(c); return c;
      },
      addFolder(n) { const f = new FolderItem(n); state.items.push(f); return f; }
    },
    get numItems() { return state.items.length; },
    item(i) { return state.items[i - 1]; },
    importFile(io) {
      if (!(io instanceof ImportOptions)) fail('importFile needs ImportOptions');
      if (!io.file.exists) throw new Error('Unable to import file: ' + io.file.fsName);
      const n = io.file.name; const big = /mark|logo/i.test(n); const wh = /9x16/.test(n) ? [2160, 3840] : /1x1/.test(n) ? [2048, 2048] : /16x9|smoke/.test(n) ? [3840, 2160] : [2000, 2480]; const f = new FootageItem(n, big ? 2048 : wh[0], big ? 2048 : wh[1]); state.items.push(f); state.imports.push(io.file.fsName); return f;
    }
  };
  const app = {
    version: opts.version || '23.0.0', project,
    beginUndoGroup(n) { if (state.undoDepth) fail('nested undo group'); state.undoDepth++; state.undoGroups++; },
    endUndoGroup() { if (!state.undoDepth) fail('endUndoGroup without begin'); state.undoDepth--; }
  };
  const g = Object.assign({ app, KeyframeEase, MarkerValue, Shape, TextDocument, File, Folder, ImportOptions, FolderItem, CompItem, FootageItem, Layer }, ENUMS);
  g.alert = function (m) { state.alerts.push(String(m)); };
  g.$ = { fileName: opts.entry, writeln() {} };
  if (opts.version && parseInt(opts.version, 10) < 23) { delete Layer.prototype.setTrackMatte; }
  else Layer.prototype.setTrackMatte = function (m, t) { if (!(m instanceof Layer) || m.containingComp !== this.containingComp || m === this) fail('setTrackMatte bad matte'); this._matteLayer = m; this._matte = t; this.hasTrackMatte = true; };
  g.ISCC_DEBUG_RETHROW = true;
  g.ISCC_BUILD_ALL = !!opts.buildAll || undefined;
  if (!opts.buildAll) delete g.ISCC_BUILD_ALL;
  return { globals: g, state, CompItem, FolderItem, Layer, Prop, Group };
}
module.exports = { makeEnv, stats, ENUMS };

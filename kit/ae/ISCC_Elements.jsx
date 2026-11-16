//@target aftereffects
// ISCC_Elements.jsx - reusable ornament comps: beams, tracer, utility arc, spray column, crosshair, grain, crop marks, ratio bar, timer digits.
#include "ISCC_Lib.jsxinc"

function ISCC_buildElements() {
    var K = ISCC.COL, W = ISCC.CFG.W, H = ISCC.CFG.H, M = ISCC.CFG.margin, D = ISCC.DEMO, sl = ISCC.sl;
    var S18 = H * Math.tan(ISCC.CFG.slantDeg * Math.PI / 180);

    function el(name, dur, note, ctrl, sliders, side) {
        return ISCC.newComp(name, "el", { dur: dur, side: side || "CT", note: note, ctrl: ctrl, sliders: sliders || [] });
    }

    // ---- loopable diagonal beam band ----
    function beam(name, main, edge, side, note) {
        var c = el(name, 4, note, "Side Colour; loop with loopOut (seamless at 4 s)", [], side), a, b, e, w = 420, x0 = -(w + S18 + 60), x1 = W + 60;
        a = ISCC.band(c, "BAND", 0, 0, w, H, main, { op: 90 });
        b = ISCC.band(c, "LIGHT", w * 0.62, 0, w * 0.16, H, edge, { op: 40 });
        e = ISCC.band(c, "EDGE", w - 6, 0, 6, H, edge, { op: 90 });
        b.parent = a; e.parent = a;
        ISCC.P(a, "pos").setValueAtTime(0, [x0, 0]);
        ISCC.P(a, "pos").setValueAtTime(4, [x1, 0]);
        ISCC.P(a, "pos").expression = 'loopOut("cycle");';
        ISCC.finish(c, { inT: 0, hold: 2, outT: 3.5 });
    }
    beam("ISCC_Elem_Beam_Band_Blue", K.blue, K.blueLit, "CT", "Loopable diagonal light-beam band, blue (from the left).");
    beam("ISCC_Elem_Beam_Band_Gold", K.gold, K.goldLight, "T", "Loopable diagonal light-beam band, gold (from the right).");

    // ---- single tracer ----
    (function () {
        var c = el("ISCC_Elem_Tracer_Single", 1.6, "Single bullet tracer: bright head, fading tail via three trimmed strokes, impact ring.", "Edit path vertices / colours; Side Colour"), r, a = [W + 80, 260], b = [160, 260 + (W - 240) * 0.325];
        ISCC.tracer(c, "TRACER", a, b, 0.1, 0.5, {});
        r = ISCC.ring(c, "IMPACT RING", b[0], b[1], 90, K.goldLight, 3);
        ISCC.keys(ISCC.P(r, "sc"), [[0.55, ISCC.vec(ISCC.P(r, "sc"), [0, 0])], [1.1, ISCC.vec(ISCC.P(r, "sc"), [100, 100])]]);
        ISCC.keys(ISCC.P(r, "op"), [[0.55, 0], [0.62, 100], [1.1, 0]]);
        ISCC.finish(c, { inT: 0.1, hold: 0.6, outT: 1.1 });
    })();

    // ---- utility arc ----
    (function () {
        var c = el("ISCC_Elem_Utility_Arc", 2.6, "Grenade utility arc: dotted parabola trims in, landing ring scales in.", "Edit arc end points (shape path); Side Colour");
        ISCC.arc(c, "ARC", [300, 820], [1560, 760], 420, 0.2, 1.1, {});
        ISCC.finish(c, { inT: 0.2, hold: 1.5, outT: 2.2 });
    })();

    // ---- spray column ----
    (function () {
        var c = el("ISCC_Elem_Spray_Column_Fire", 4, "Spray-pattern dot column: 30 dots firing in sequence (2 f apart), scaled 4x.", "Edit dot colour / scale in the spray builder");
        ISCC.spray(c, "SPRAY", 880, 880, 0.3, { scale: 4, dotD: 14, stepFrames: 2, hold: 2.2 });
        ISCC.finish(c, { inT: 0.3, hold: 1.5, outT: 3.2 });
    })();

    // ---- crosshair gap idle ----
    (function () {
        var c = el("ISCC_Elem_Crosshair_Gap_Idle", 4, "Four-bar crosshair with a breathing gap, seamless 4 s loop.", "Progress slider unused; edit bar colour"), k = 3, cx = W / 2, cy = H / 2, g = 24 * k, i, d, L, ex, defs;
        defs = [[cx - 11 * k, cy - g - 70 * k, 22 * k, 70 * k, "[0, -G]"], [cx - 11 * k, cy + g, 22 * k, 70 * k, "[0, G]"], [cx - g - 70 * k, cy - 11 * k, 70 * k, 22 * k, "[-G, 0]"], [cx + g, cy - 11 * k, 70 * k, 22 * k, "[G, 0]"]];
        for (i = 0; i < 4; i++) {
            d = defs[i];
            L = ISCC.rect(c, "BAR " + (i + 1), d[0], d[1], d[2], d[3], (i % 2) ? K.gold : K.goldLight);
            ISCC.P(L, "pos").expression = "var G = 14 * (1 - Math.cos(time * Math.PI * 2 / 4)) / 2; value + " + d[4] + ";";
        }
        L = ISCC.ring(c, "RING", cx, cy, 300, K.silver, 2);
        ISCC.P(L, "op").setValue(35);
        ISCC.finish(c, { inT: 0, hold: 2, outT: 3.5 });
    })();

    // ---- grain overlay ----
    (function () {
        var c = el("ISCC_Elem_Grain_Overlay", 10, "Film-grain overlay: fractal-noise solid, Overlay blend, 7 % opacity. Drop above any scene.", "Opacity / Contrast / Scale on layer GRAIN"), L, fx;
        L = c.comp.layers.addSolid(K.black, "GRAIN", W, H, 1);
        fx = L.property("ADBE Effect Parade").addProperty("ADBE Fractal Noise");
        fx.property("Contrast").setValue(140);
        fx.property("Scale").setValue(12);
        fx.property("Evolution").expression = "time * 900;";
        try { L.blendingMode = BlendingMode.OVERLAY; } catch (e) {}
        ISCC.P(L, "op").setValue(7);
        ISCC.finish(c, { inT: 0, hold: 5, outT: 9.5 });
    })();

    // ---- crop marks ----
    (function () {
        var c = el("ISCC_Elem_Crop_Marks", 5, "Crop marks, margin frame and centre ticks (hairlines, 2 px).", "Edit margin in the builder"), L, m = 48, cx = W / 2, cy = H / 2, t = 2;
        ISCC.cropMarks(c, m, 40, K.silver);
        L = ISCC.shapeLayer(c, "FRAME + CENTRE TICKS");
        ISCC.addRect(L, M, M, W - 2 * M, H - 2 * M, { stroke: K.gold, sw: t, so: 35, gname: "frame" });
        ISCC.addRect(L, cx - 20, m, 40, t, { fill: K.silver, gname: "tick t" }); ISCC.addRect(L, cx - 20, H - m - t, 40, t, { fill: K.silver, gname: "tick b" });
        ISCC.addRect(L, m, cy - 20 + 18, t, 40, { fill: K.silver, gname: "tick l" }); ISCC.addRect(L, W - m - t, cy - 20 + 18, t, 40, { fill: K.silver, gname: "tick r" });
        ISCC.inFrom(L, 0, 0.7, { sx: 96, sy: 96 });
        ISCC.P(L, "anc").setValue([cx, cy]); ISCC.P(L, "pos").setValue([cx, cy]);
        ISCC.finish(c, { inT: 0, hold: 0.8, outT: 4.5 });
    })();

    // ---- ratio bar 70/20/10 ----
    (function () {
        var c = el("ISCC_Elem_Ratio_Bar_70_20_10", 5, "Brand proportion bar: 70 Arena Black / 20 Legacy Blue / 10 Cup Gold.", "Lang CN"), x = 360, w = 1200, y = 500, seg = [[0.7, K.black, "70  ARENA BLACK", "70 竞技场黑"], [0.2, K.blue, "20  LEGACY BLUE", "20 传承蓝"], [0.1, K.gold, "10  CUP GOLD", "10 金杯金"]], i, xx = x, L, lb, ww;
        for (i = 0; i < 3; i++) {
            ww = w * seg[i][0];
            L = ISCC.rect(c, "SEG " + (i + 1), xx, y, ww, 60, seg[i][1]);
            ISCC.addRect(L, 0, 0, ww, 60, { stroke: K.silver, sw: 2, so: 50, gname: "outline" });
            lb = ISCC.label(c, "LABEL " + (i + 1), seg[i][2], seg[i][3], xx + 4, y + 106, { size: 22 });
            ISCC.inFrom(L, ISCC.st(0, i, 4), 0.7, { sx: 0, fade: false });
            ISCC.inFrom(lb, ISCC.st(0.1, i, 4), 0.6, { dy: 16 });
            xx += ww;
        }
        ISCC.finish(c, { inT: 0, hold: 1, outT: 4.5 });
    })();

    // ---- timer digits ----
    (function () {
        var c = el("ISCC_Elem_Timer_Digits", 60, "Tabular timer: five fixed cells (mm:ss) counting down from slider Seconds.", "Slider Seconds (start value, default 60); edit colour", [["Seconds", 60]]);
        ISCC.digits(c, "TIMER", W / 2, 640, 300, 140, sl("Seconds") + " - time", K.parchment);
        ISCC.hairH(c, "RULE", W / 2 - 400, 700, 800, K.gold);
        ISCC.label(c, "LABEL", "TIME REMAINING", "剩余时间", W / 2, 760, { just: "C", size: 24 });
        ISCC.finish(c, { inT: 0, hold: 1, outT: 59.5 });
    })();
}

if (typeof ISCC_BUILD_ALL === "undefined") { ISCC.runStandalone(ISCC_buildElements, "Elements"); }

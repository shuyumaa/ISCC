//@target aftereffects
// ISCC_Transitions.jsx - stingers, wipes, replay, round win, map change, bumpers. Runnable alone.
#include "ISCC_Lib.jsxinc"

function ISCC_buildTransitions() {
    var K = ISCC.COL, W = ISCC.CFG.W, H = ISCC.CFG.H, F = ISCC.F, D = ISCC.DEMO;
    var S18 = H * Math.tan(ISCC.CFG.slantDeg * Math.PI / 180);

    // ---------- 1. Full-cover diagonal stinger (CT / T / Neutral) ----------
    function stinger(name, side, note) {
        var c, i, bw = 410, x, fills, dirs, bands = [], L, ride, tag, lines, gold, t0 = 0;
        c = ISCC.newComp(name, "trans", { dur: 2.2, side: side, note: note, ctrl: "Side Colour (band tint); Lang CN; logo = LOGO precomp" });
        fills = [K.black, "side", K.black, K.black, K.blue, K.black];
        if (side === "T") { fills[4] = K.black; fills[1] = "side"; fills[2] = K.blue; }
        if (side === "N") { fills[1] = K.blue; fills[2] = K.black; }
        for (i = 0; i < 6; i++) {
            x = -S18 - 60 + i * (bw - 6);
            // CT: blue from the left. T: gold from the right. Neutral: blue from the left, gold lights from the right.
            L = ISCC.sweep(c, "BAND " + (i + 1), x, bw, fills[i], (side === "T") ? -1 : 1, ISCC.st(t0, i, 3), 0.7, ISCC.st(1.25, i, 3), 0.4);
            bands.push(L);
        }
        // two slim light bands arriving from the opposite side
        gold = [];
        for (i = 0; i < 2; i++) {
            L = ISCC.sweep(c, "LIGHT " + (i + 1), 360 + i * 900, 14, (side === "N" && i === 1) ? K.gold : K.goldLight, (side === "T") ? 1 : -1, ISCC.st(0.1, i, 4), 0.6, ISCC.st(1.2, i, 3), 0.4, { op: 90 });
            gold.push(L);
        }
        ride = bands[3];
        tag = ISCC.pair(c, "TAGLINE", "Earn your crest.", "百炼成徽", { x: W / 2, y: 760, size: 40, f: "b6", track: 240, color: K.silver, just: "C" });
        ISCC.each(tag, function (l) { l.parent = ride; });
        ISCC.inFrom(tag, 0.85, 0.5, { dy: 20 });
        L = ISCC.logo(c, "LOGO (rides band)", W / 2, 500, 330);
        L.parent = ride;
        ISCC.inFrom(L, 0.55, 0.7, { sx: 70, sy: 70 });
        ISCC.finish(c, { inT: 0, cut: 1.0, hold: 1.0, outT: 1.25 });
    }
    stinger("ISCC_Trans_Stinger_CT", "CT", "Diagonal beam-band stinger, CT blue from the left; fully covers at CUT (1.0 s), logo rides the band.");
    stinger("ISCC_Trans_Stinger_T", "T", "Diagonal beam-band stinger, T gold from the right; fully covers at CUT (1.0 s), logo rides the band.");
    stinger("ISCC_Trans_Stinger_Neutral", "N", "Neutral stinger (blue from left, gold light from right); full cover at CUT (1.0 s).");

    // ---------- 2. Tracer stinger ----------
    (function () {
        var c, i, ys = [70, 290, 520, 760], cover, edge, lg, a, b, dy = (W + 240) * Math.tan(ISCC.CFG.slantDeg * Math.PI / 180);
        c = ISCC.newComp("ISCC_Trans_Stinger_Tracer", "trans", { dur: 1.8, side: "CT", note: "Four bullet-tracer streaks slash across, the last one wipes the frame (CUT 0.85 s).", ctrl: "Side Colour (edge light); Lang CN" });
        for (i = 0; i < 4; i++) {
            a = [W + 120, ys[i] - 180]; b = [-120, ys[i] - 180 + dy];
            ISCC.tracer(c, "TRACER " + (i + 1), a, b, ISCC.st(0, i, 8), 0.42, { color: (i === 3) ? K.goldLight : K.parchment });
        }
        cover = ISCC.sweep(c, "WIPE cover", -S18 - 100, W + 300, K.black, -1, 0.5, 0.55, 1.0, 0.4);
        edge = ISCC.sweep(c, "WIPE edge light", -S18 - 100 + W + 296, 12, "side", -1, 0.5, 0.55, 1.0, 0.4);
        lg = ISCC.logo(c, "LOGO (rides wipe)", W / 2, H / 2, 280);
        lg.parent = cover;
        ISCC.inFrom(lg, 0.7, 0.5, { sx: 80, sy: 80 });
        ISCC.finish(c, { inT: 0, cut: 0.85, hold: 0.85, outT: 1.0 });
    })();

    // ---------- 3. Smoke stinger (fractal-noise luma matte) ----------
    (function () {
        var c, pairs = [], i, cov, nz, fx, cols = [K.black, K.blue], lg, brightK;
        c = ISCC.newComp("ISCC_Trans_Stinger_Smoke", "trans", { dur: 2.4, side: "CT", note: "Soft-edged matte wipe: Fractal Noise luma matte drives brightness up (cover) and down (clear). CUT 1.1 s.", ctrl: "Lang CN; edit noise: Contrast / Evolution on SMOKE MATTE layers" });
        for (i = 0; i < 2; i++) {
            cov = c.comp.layers.addSolid(cols[i], i ? "SMOKE EDGE (blue)" : "SMOKE COVER (black)", W, H, 1);
            nz = c.comp.layers.addSolid(K.parchment, "SMOKE MATTE " + (i + 1), W, H, 1);
            fx = nz.property("ADBE Effect Parade").addProperty("ADBE Fractal Noise");
            fx.property("Contrast").setValue(260);
            fx.property("Scale").setValue(i ? 140 : 220);
            fx.property("Evolution").expression = "time * " + (i ? 70 : 110) + " + " + (i * 90) + ";";
            brightK = ISCC.F(i ? 0 : 10);
            ISCC.keys(fx.property("Brightness"), [[0.05 + brightK, -220], [1.0 + brightK, 140]]);
            fx.property("Brightness").setValueAtTime(1.3, 140);
            fx.property("Brightness").setValueAtTime(1.9 + brightK, -220);
            ISCC.easeProp(fx.property("Brightness"));
            ISCC.matte(cov, nz, "luma");
        }
        lg = ISCC.logo(c, "LOGO", W / 2, H / 2, 300);
        ISCC.keys(ISCC.P(lg, "op"), [[0.7, 0], [1.0, 100]]);
        ISCC.outTo(lg, 1.45, 0.35, { sx: 110, sy: 110 });
        ISCC.finish(c, { inT: 0, cut: 1.1, hold: 1.1, outT: 1.45 });
    })();

    // ---------- 4. Simple band wipes ----------
    function wipe(name, dir, note) {
        var c, L, lead;
        c = ISCC.newComp(name, "trans", { dur: 1.5, side: "CT", note: note, ctrl: "Side Colour (lead band); Lang CN" });
        lead = ISCC.sweep(c, "BAND lead", -S18 - 120, 300, "side", dir, 0.0, 0.7, 0.85, 0.4);
        ISCC.sweep(c, "BAND cover", -S18 - 120 + 296, W + 100, K.black, dir, 0.06, 0.7, 0.9, 0.4);
        ISCC.sweep(c, "BAND light", -S18 - 120 + 280, 10, K.goldLight, dir, 0.03, 0.7, 0.87, 0.4, { op: 90 });
        ISCC.finish(c, { inT: 0, cut: 0.78, hold: 0.78, outT: 0.85 });
    }
    wipe("ISCC_Trans_Wipe_Left", -1, "Simple band wipe travelling right-to-left (cut 0.78 s).");
    wipe("ISCC_Trans_Wipe_Right", 1, "Simple band wipe travelling left-to-right (cut 0.78 s).");

    // ---------- 5. Replay in / out ----------
    function replay(name, isIn, note) {
        var c, dir = isIn ? 1 : -1, en = isIn ? "REPLAY" : "LIVE", cn = isIn ? "回放" : "直播", sub = isIn ? "INSTANT REPLAY" : "BACK TO LIVE", subCn = isIn ? "即时回放" : "返回直播", t, L, p, q, i, tx, ch = [];
        c = ISCC.newComp(name, "trans", { dur: 1.8, side: isIn ? "T" : "CT", note: note, ctrl: "Side Colour (accent bar); Lang CN" });
        L = ISCC.sweep(c, "PLATE", -S18 - 200 + (isIn ? 0 : 400), 1200, K.black, dir, 0.0, 0.6, 1.25, 0.4, { op: 94 });
        ISCC.sweep(c, "ACCENT", -S18 - 200 + (isIn ? 1196 : 396), 22, "side", dir, 0.02, 0.6, 1.25, 0.4);
        ISCC.sweep(c, "HAIR", -S18 - 200 + (isIn ? 1236 : 436), 4, K.gold, dir, 0.04, 0.6, 1.25, 0.4);
        tx = isIn ? 150 : 1050;
        p = ISCC.pair(c, "TITLE", en, cn, { x: tx + 140, y: 600, size: 230, f: "d9", track: 20, color: K.parchment });
        ISCC.inFrom(p, 0.25, 0.6, { dx: -dir * 220 });
        ISCC.outTo(p, 1.2, 0.35, { dx: dir * 260 });
        q = ISCC.label(c, "SUB", sub, subCn, tx + 144, 420, { size: 30 });
        ISCC.inFrom(q, 0.32, 0.6, { dx: -dir * 160 });
        ISCC.outTo(q, 1.2, 0.3, { dx: dir * 200 });
        // rewind / forward chevrons: two square-edged triangles
        for (i = 0; i < 2; i++) {
            ch.push(ISCC.poly(c, "CHEVRON " + (i + 1), isIn ? [[tx + 60 - i * 54, 560], [tx + 8 - i * 54, 520], [tx + 60 - i * 54, 480]] : [[tx + i * 54, 560], [tx + 52 + i * 54, 520], [tx + i * 54, 480]], i ? K.gold : K.goldLight));
        }
        ISCC.inFrom(ch, 0.3, 0.5, { dx: -dir * 200 });
        ISCC.outTo(ch, 1.2, 0.3, { dx: dir * 200 });
        ISCC.finish(c, { inT: 0, hold: 0.8, outT: 1.2 });
    }
    replay("ISCC_Trans_Replay_In", true, "Replay bumper: REPLAY slab slides in from the left, rewind chevrons, exits right.");
    replay("ISCC_Trans_Replay_Out", false, "Back-to-live bumper: LIVE slab from the right, forward chevrons.");

    // ---------- 6. Round win (CT / T) ----------
    function roundWin(name, side) {
        var c, ct = (side === "CT"), tn = ct ? D.a : D.b, txtCol = ct ? K.parchment : K.black, p, g, i, m, bar, panel, edge, items;
        c = ISCC.newComp(name, "trans", { dur: 3.6, side: side, note: "ROUND WIN banner for " + side + " (" + (ct ? "Legacy Blue" : "Cup Gold") + " slab). IN 0, HOLD 0.9, OUT 3.0.", ctrl: "Side Colour; Slider Score A / Score B; Lang CN; edit team text" });
        ISCC.addCtl(c, "Score A", "ADBE Slider Control", ct ? 7 : 5);
        ISCC.addCtl(c, "Score B", "ADBE Slider Control", ct ? 5 : 7);
        panel = ISCC.rect(c, "PANEL black", -200, 380, W + 400, 330, K.black, { op: 94, center: true });
        panel.property("ADBE Transform Group").property("ADBE Position").setValue([W / 2, 545]);
        ISCC.inFrom(panel, 0.0, 0.5, { sy: 0, fade: false });
        ISCC.outTo(panel, 3.0, 0.4, { sy: 0, fade: false });
        bar = ISCC.band(c, "SIDE SLAB", 130, 380, 560, 330, "side");
        ISCC.inFrom(bar, 0.05, 0.6, { dx: -900, fade: false });
        ISCC.outTo(bar, 3.0, 0.35, { dx: -900, fade: false });
        edge = [ISCC.hairH(c, "HAIR top", 0, 380, W, K.gold), ISCC.hairH(c, "HAIR bottom", 0, 708, W, K.gold)];
        ISCC.inFrom(edge, 0.1, 0.5, { dx: W, fade: false });
        ISCC.outTo(edge, 3.0, 0.35, { dx: -W, fade: false });
        p = ISCC.pair(c, "ROUND WIN", "ROUND WIN", "回合胜利", { x: 330, y: 640, size: 220, f: "d9", track: 20, color: txtCol });
        items = [];
        for (i = 0; i < 2; i++) {
            m = ISCC.rect(c, "CLIP " + (i ? "CN" : "EN"), 300, 410, 1100, 270, K.parchment);
            ISCC.matte(p[i], m, "alpha");
            ISCC.inFrom(p[i], 0.3 + i * 0.0, 0.7, { dy: 260, fade: false });
        }
        ISCC.outTo(p, 3.0, 0.35, { dy: -60 });
        g = ISCC.label(c, "TEAM", tn.name + "  /  " + tn.tag, tn.cn + "  /  " + tn.tag, 334, 456, { size: 34, color: ct ? K.goldLight : K.black, track: 260 });
        ISCC.inFrom(g, 0.45, 0.6, { dx: -120 }); ISCC.outTo(g, 3.0, 0.3, { dx: -120 });
        g = ISCC.text(c, "SCORE", "", { x: 1760, y: 640, size: 190, f: "d8", track: 40, just: "R", color: K.parchment, expr: 'var a = Math.round(' + ISCC.sl("Score A") + '); var b = Math.round(' + ISCC.sl("Score B") + '); a + " - " + b;' });
        ISCC.inFrom(g, 0.5, 0.7, { dx: 200 }); ISCC.outTo(g, 3.0, 0.3, { dx: 200 });
        ISCC.tracer(c, "TRACER", [W + 60, 330], [-60, 330 + (W + 120) * 0.325], 0.15, 0.5, {});
        ISCC.finish(c, { inT: 0, hold: 0.9, outT: 3.0 });
    }
    roundWin("ISCC_Trans_RoundWin_CT", "CT");
    roundWin("ISCC_Trans_RoundWin_T", "T");

    // ---------- 7. Map change ----------
    (function () {
        var c, a, b, p, q, pn, lab, i, hair, bar;
        c = ISCC.newComp("ISCC_Trans_MapChange", "trans", { dur: 3.2, side: "CT", note: "Next map slides through the frame; previous map ghosts out. IN 0, HOLD 1.2, OUT 2.6.", ctrl: "Side Colour; edit map names (text layers); Lang CN" });
        bar = ISCC.rect(c, "PLATE", 0, 390, W, 300, K.black, { op: 94, center: true });
        ISCC.inFrom(bar, 0, 0.5, { sy: 0, fade: false }); ISCC.outTo(bar, 2.6, 0.4, { sy: 0, fade: false });
        hair = [ISCC.hairH(c, "HAIR top", 0, 390, W, K.gold), ISCC.hairH(c, "HAIR bottom", 0, 688, W, K.gold)];
        ISCC.inFrom(hair, 0.05, 0.5, { dx: -W, fade: false }); ISCC.outTo(hair, 2.6, 0.4, { dx: W, fade: false });
        a = ISCC.pair(c, "MAP PREVIOUS", D.maps[0], D.mapsCn[0], { x: 120, y: 620, size: 230, f: "d9", track: 20, color: K.silver, op: 28 });
        ISCC.outTo(a, 0.35, 0.8, { dx: -1300, fade: false });
        b = ISCC.pair(c, "MAP NEXT", D.maps[3], D.mapsCn[3], { x: 120, y: 620, size: 230, f: "d9", track: 20, color: K.parchment });
        ISCC.inFrom(b, 0.35, 0.9, { dx: 1500, fade: false });
        ISCC.outTo(b, 2.6, 0.4, { dx: -1500, fade: false });
        lab = ISCC.label(c, "LABEL", "NEXT MAP  /  2 OF 3", "下一张地图 / 第2张", 124, 440, { size: 30 });
        ISCC.inFrom(lab, 0.5, 0.6, { dx: 100 }); ISCC.outTo(lab, 2.6, 0.3, { dx: -100 });
        ISCC.rect(c, "SIDE TICK", 0, 390, 18, 300, "side");
        pn = ISCC.text(c, "MAP NO", "02", { x: 1800, y: 470, size: 70, f: "d8", track: 60, just: "R", color: K.gold });
        ISCC.inFrom(pn, 0.6, 0.6, { dy: 40 }); ISCC.outTo(pn, 2.6, 0.3, { dy: -40 });
        ISCC.arc(c, "ARC", [1400, 690], [1760, 560], 120, 0.7, 0.8, {});
        ISCC.finish(c, { inT: 0, hold: 1.2, outT: 2.6 });
    })();

    // ---------- 8. Segment bumper 2 s ----------
    (function () {
        var c, t, s, r, L;
        c = ISCC.newComp("ISCC_Trans_Segment_Bumper_2s", "trans", { dur: 2.0, side: "T", note: "2 s segment bumper: gold slab, segment title, logo. IN 0, OUT 1.5.", ctrl: "Side Colour; edit SEGMENT text; Lang CN" });
        ISCC.sweep(c, "BAND black", -S18 - 100, 1250, K.black, 1, 0, 0.6, 1.5, 0.4, { op: 96 });
        ISCC.sweep(c, "BAND side", -S18 - 100 + 1246, 40, "side", 1, 0.03, 0.6, 1.5, 0.4);
        ISCC.sweep(c, "BAND blue", -S18 - 100 + 1296, 170, K.blue, 1, 0.07, 0.6, 1.52, 0.4);
        t = ISCC.pair(c, "SEGMENT", "ANALYST DESK", "分析台", { x: 130, y: 560, size: 190, f: "d9", track: 20, color: K.parchment });
        ISCC.inFrom(t, 0.2, 0.6, { dx: -300 }); ISCC.outTo(t, 1.5, 0.3, { dx: 300 });
        s = ISCC.label(c, "KICKER", "SEGMENT  /  PRE-MATCH", "环节 / 赛前", 134, 410, { size: 28 });
        ISCC.inFrom(s, 0.26, 0.6, { dx: -200 }); ISCC.outTo(s, 1.5, 0.3, { dx: 200 });
        L = ISCC.logo(c, "LOGO", 1640, 500, 240);
        ISCC.inFrom(L, 0.3, 0.7, { sx: 70, sy: 70 }); ISCC.outTo(L, 1.5, 0.3, { sx: 110, sy: 110 });
        ISCC.hairH(c, "RULE", 134, 640, 700, K.gold);
        ISCC.finish(c, { inT: 0, hold: 0.8, outT: 1.5 });
    })();

    // ---------- 9. Logo sting 3 s ----------
    (function () {
        var c, k = 4, g0, gf = 24 * k, cx = W / 2, cy = H / 2, bars = [], defs, i, L, d, far, lg, p, ring, hv;
        c = ISCC.newComp("ISCC_Trans_Logo_Sting_3s", "trans", { dur: 3.0, side: "CT", note: "Crosshair bars converge, the gap opens, the logo resolves, voice line. HOLD 2.2, OUT 2.65.", ctrl: "Lang CN; logo = LOGO precomp" });
        hv = [ISCC.line(c, "CROSS h", [0, cy], [W, cy], K.silver, 2, { so: 40 }), ISCC.line(c, "CROSS v", [cx, 0], [cx, H], K.silver, 2, { so: 40 })];
        ISCC.keys(ISCC.P(hv[0], "sc"), [[0, ISCC.vec(ISCC.P(hv[0], "sc"), [0, 100])], [0.9, ISCC.vec(ISCC.P(hv[0], "sc"), [100, 100])]]);
        ISCC.P(hv[0], "anc").setValue([cx, cy]); ISCC.P(hv[0], "pos").setValue([cx, cy]);
        ISCC.keys(ISCC.P(hv[1], "sc"), [[0, ISCC.vec(ISCC.P(hv[1], "sc"), [100, 0])], [0.9, ISCC.vec(ISCC.P(hv[1], "sc"), [100, 100])]]);
        ISCC.P(hv[1], "anc").setValue([cx, cy]); ISCC.P(hv[1], "pos").setValue([cx, cy]);
        far = 760;
        // bar defs: x, y (top-left at final), w, h, direction vector
        defs = [[cx - 11 * k, cy - gf - 70 * k, 22 * k, 70 * k, 0, -1], [cx - 11 * k, cy + gf, 22 * k, 70 * k, 0, 1], [cx - gf - 70 * k, cy - 11 * k, 70 * k, 22 * k, -1, 0], [cx + gf, cy - 11 * k, 70 * k, 22 * k, 1, 0]];
        for (i = 0; i < 4; i++) {
            d = defs[i];
            L = ISCC.rect(c, "BAR " + (i + 1), d[0], d[1], d[2], d[3], (i % 2) ? K.gold : K.goldLight);
            // start far out, touch at centre (gap 0), then open to the final gap
            ISCC.keys(ISCC.P(L, "pos"), [[0.0, [d[0] + d[4] * far, d[1] + d[5] * far]], [0.85, [d[0] - d[4] * gf, d[1] - d[5] * gf]], [1.0, [d[0] - d[4] * gf, d[1] - d[5] * gf]], [1.7, [d[0], d[1]]]]);
            ISCC.outTo(L, 2.1, 0.01, { fade: true });
            bars.push(L);
        }
        ring = ISCC.ring(c, "RING pulse", cx, cy, 420, K.goldLight, 3);
        ISCC.keys(ISCC.P(ring, "sc"), [[1.0, ISCC.vec(ISCC.P(ring, "sc"), [20, 20])], [1.9, ISCC.vec(ISCC.P(ring, "sc"), [140, 140])]]);
        ISCC.keys(ISCC.P(ring, "op"), [[1.0, 0], [1.1, 100], [1.9, 0]]);
        lg = ISCC.logo(c, "LOGO", cx, cy, 240 * k);
        ISCC.keys(ISCC.P(lg, "op"), [[1.9, 0], [2.1, 100]]);
        p = ISCC.pair(c, "VOICE", "Earn your crest.", "百炼成徽", { x: cx, y: cy + 520, size: 54, f: "b6", track: 240, color: K.parchment, just: "C" });
        ISCC.inFrom(p, 2.0, 0.5, { dy: 24 });
        ISCC.outTo([lg, p, hv[0], hv[1]], 2.65, 0.35, {});
        ISCC.finish(c, { inT: 0, cut: 1.0, hold: 2.2, outT: 2.65 });
    })();
}

if (typeof ISCC_BUILD_ALL === "undefined") { ISCC.runStandalone(ISCC_buildTransitions, "Transitions"); }

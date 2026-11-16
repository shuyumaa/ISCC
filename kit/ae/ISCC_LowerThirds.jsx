//@target aftereffects
// ISCC_LowerThirds.jsx - player, casters, title, topic bar, social handle. Runnable alone.
#include "ISCC_Lib.jsxinc"

function ISCC_buildLowerThirds() {
    var K = ISCC.COL, W = ISCC.CFG.W, H = ISCC.CFG.H, M = ISCC.CFG.margin;

    // shared chrome: black plate (scales in from the left edge), side bar, gold hairline
    function base(name, dur, note, ctrl, x, y, w, h, side) {
        var c = ISCC.newComp(name, "lt", { dur: dur, side: side || "CT", note: note, ctrl: ctrl });
        c.parts = [
            ISCC.rect(c, "PLATE", x, y, w, h, K.black, { op: 94 }),
            ISCC.rect(c, "SIDE BAR", x, y, 10, h, "side"),
            ISCC.hairH(c, "HAIR top", x, y, w, K.gold)
        ];
        c.texts = [];
        return c;
    }
    // IN at 0 (plate 0.6 s expo-out, copy staggered 3 f), OUT at tOut (0.35 s)
    function play(c, tOut, hold) {
        var i;
        ISCC.inFrom(c.parts[0], 0, 0.6, { sx: 0, fade: false });
        ISCC.inFrom(c.parts[1], 0.04, 0.5, { sx: 0, fade: false });
        ISCC.inFrom(c.parts[2], 0.08, 0.7, { sx: 0, fade: false });
        for (i = 0; i < c.texts.length; i++) {
            ISCC.inFrom(c.texts[i], ISCC.st(0.18, i, 3), 0.6, { dx: -70 });
            ISCC.outTo(c.texts[i], ISCC.st(tOut, i, 2), 0.3, { dx: -90 });
        }
        for (i = 0; i < c.parts.length; i++) { ISCC.outTo(c.parts[i], tOut + 0.1, 0.35, { sx: 0, fade: false }); }
        ISCC.finish(c, { inT: 0, hold: hold, outT: tOut });
    }
    function add(c, t) { c.texts.push(t); return t; }

    // ---- LT_Player ----
    (function () {
        var c = base("ISCC_LT_Player", 7.0, "Player lower third: handle, school/role, three stats. IN 0, HOLD 0.9, OUT 6.4.", "Side Colour (CT blue / T gold); edit text via Essential Graphics; Lang CN", M, 770, 1000, 196, "CT"), i, st = [["1.32", "K/D", "击杀/死亡"], ["84.1", "ADR", "场均伤害"], ["47%", "HS", "爆头率"]], x;
        add(c, ISCC.text(c, "HANDLE", "kite", { x: M + 44, y: 872, size: 104, f: "d9", track: 20, color: K.parchment }));
        add(c, ISCC.pair(c, "TEAM TAG", "KES", "红隼", { x: M + 46, y: 806, size: 24, f: "b6", track: 240, color: K.gold }));
        add(c, ISCC.pair(c, "SCHOOL ROLE", D_A_SCHOOL_ROLE(), D_A_SCHOOL_ROLE_CN(), { x: M + 46, y: 930, size: 22, f: "b6", track: 220, color: K.silver }));
        ISCC.hairV(c, "DIVIDER", M + 600, 800, 130, K.gold, { op: 60 });
        for (i = 0; i < 3; i++) {
            x = M + 640 + i * 118;
            add(c, ISCC.text(c, "STAT " + (i + 1) + " VALUE", st[i][0], { x: x, y: 880, size: 58, f: "d8", track: 20, color: K.goldLight }));
            add(c, ISCC.pair(c, "STAT " + (i + 1) + " LABEL", st[i][1], st[i][2], { x: x, y: 918, size: 18, f: "b6", track: 240, color: K.silver }));
        }
        play(c, 6.4, 0.9);
    })();
    function D_A_SCHOOL_ROLE() { return ISCC.DEMO.a.school + "  /  ENTRY"; }
    function D_A_SCHOOL_ROLE_CN() { return ISCC.DEMO.a.schoolCn + " / 突破手"; }

    // ---- LT_Caster_Single ----
    (function () {
        var c = base("ISCC_LT_Caster_Single", 6.0, "Single caster lower third. IN 0, HOLD 0.8, OUT 5.4.", "Side Colour; edit text; Lang CN", M, 836, 700, 130, "CT");
        add(c, ISCC.pair(c, "ROLE", "PLAY-BY-PLAY", "主解说", { x: M + 42, y: 876, size: 22, f: "b6", track: 240, color: K.gold }));
        add(c, ISCC.pair(c, "NAME", "CASTER NAME", "解说姓名", { x: M + 40, y: 942, size: 76, f: "d9", track: 20, color: K.parchment }));
        play(c, 5.4, 0.8);
    })();

    // ---- LT_Caster_Duo ----
    (function () {
        var c = ISCC.newComp("ISCC_LT_Caster_Duo", "lt", { dur: 6.0, side: "CT", note: "Two casters side by side, shared hairline. IN 0, HOLD 0.9, OUT 5.4.", ctrl: "Side Colour; edit text; Lang CN" }), i, x, y = 836, w = 620, parts = [], tx = [], rl = [["PLAY-BY-PLAY", "主解说"], ["ANALYST", "分析员"]], nm = [["CASTER ONE", "解说一"], ["CASTER TWO", "解说二"]];
        for (i = 0; i < 2; i++) {
            x = M + i * (w + 4);
            parts.push(ISCC.rect(c, "PLATE " + (i + 1), x, y, w, 130, K.black, { op: 94 }));
            parts.push(ISCC.rect(c, "BAR " + (i + 1), x, y, 10, 130, i ? K.gold : "side"));
            parts.push(ISCC.hairH(c, "HAIR " + (i + 1), x, y, w, K.gold));
            tx.push(ISCC.pair(c, "ROLE " + (i + 1), rl[i][0], rl[i][1], { x: x + 42, y: 876, size: 22, f: "b6", track: 240, color: K.gold }));
            tx.push(ISCC.pair(c, "NAME " + (i + 1), nm[i][0], nm[i][1], { x: x + 40, y: 942, size: 76, f: "d9", track: 20, color: K.parchment }));
        }
        for (i = 0; i < parts.length; i++) { ISCC.inFrom(parts[i], ISCC.st(0, Math.floor(i / 3), 4) + (i % 3) * 0.03, 0.6, { sx: 0, fade: false }); ISCC.outTo(parts[i], 5.5, 0.35, { sx: 0, fade: false }); }
        for (i = 0; i < tx.length; i++) { ISCC.inFrom(tx[i], ISCC.st(0.2, i, 3), 0.6, { dx: -70 }); ISCC.outTo(tx[i], ISCC.st(5.4, i, 2), 0.3, { dx: -90 }); }
        ISCC.finish(c, { inT: 0, hold: 0.9, outT: 5.4 });
    })();

    // ---- LT_Title ----
    (function () {
        var c = base("ISCC_LT_Title", 6.0, "Generic two-line title (headline + sub line). IN 0, HOLD 0.9, OUT 5.4.", "Side Colour; edit text; Lang CN", M, 740, 1100, 226, "CT"), b;
        add(c, ISCC.pair(c, "KICKER", "GRAND FINAL  /  BEST OF 3", "总决赛 / 三局两胜", { x: M + 44, y: 794, size: 22, f: "b6", track: 240, color: K.gold }));
        add(c, ISCC.pair(c, "TITLE", "ONE CUP. EVERY NATION.", "金杯为证，万国同场", { x: M + 42, y: 896, size: 112, f: "d9", track: 20, color: K.parchment }));
        add(c, ISCC.pair(c, "SUBLINE", "KESTRELS VS LANTERNS  /  ATRIUM", "红隼队 对 灯笼队 / 中庭", { x: M + 46, y: 944, size: 22, f: "b6", track: 220, color: K.silver }));
        b = ISCC.band(c, "ORNAMENT", 1250, 740, 40, 226, K.gold, { op: 90 });
        ISCC.inFrom(b, 0.2, 0.7, { dx: 400, fade: false }); ISCC.outTo(b, 5.4, 0.35, { dx: 400, fade: false });
        play(c, 5.4, 0.9);
    })();

    // ---- LT_Topic_Bar ----
    (function () {
        var c = ISCC.newComp("ISCC_LT_Topic_Bar", "lt", { dur: 8.0, side: "T", note: "Analyst-desk topic bar, full width. IN 0, HOLD 0.8, OUT 7.4.", ctrl: "Side Colour (label slab); edit topic text; Lang CN" }), pl, sl, hr, tl, tp, lg;
        pl = ISCC.rect(c, "PLATE", M, 924, W - 2 * M, 96, K.black, { op: 94 });
        sl = ISCC.rect(c, "LABEL SLAB", M, 924, 250, 96, "side");
        hr = ISCC.hairH(c, "HAIR top", M, 924, W - 2 * M, K.gold);
        tl = ISCC.pair(c, "LABEL", "TOPIC", "话题", { x: M + 125, y: 988, size: 40, f: "d9", track: 120, color: K.black, just: "C", cnScale: 0.9 });
        tp = ISCC.pair(c, "TOPIC", "WHO OWNS THE LONG ROTATION?", "谁掌控长线转点？", { x: M + 290, y: 988, size: 46, f: "b6", track: 100, color: K.parchment });
        lg = ISCC.logo(c, "LOGO", W - M - 48, 972, 64);
        ISCC.inFrom(pl, 0, 0.6, { sx: 0, fade: false }); ISCC.inFrom(sl, 0.03, 0.5, { sx: 0, fade: false }); ISCC.inFrom(hr, 0.06, 0.7, { sx: 0, fade: false });
        ISCC.inFrom(tl, 0.2, 0.5, { dy: 30 }); ISCC.inFrom(tp, 0.26, 0.6, { dx: -80 }); ISCC.inFrom(lg, 0.34, 0.5, { sx: 60, sy: 60 });
        ISCC.outTo([tl, tp, lg], 7.4, 0.3, { dy: 24 });
        ISCC.outTo([pl, sl, hr], 7.5, 0.35, { sx: 0, fade: false });
        ISCC.finish(c, { inT: 0, hold: 0.8, outT: 7.4 });
    })();

    // ---- LT_Social_Handle ----
    (function () {
        var c = base("ISCC_LT_Social_Handle", 5.0, "Social handle tag (platform placeholder). IN 0, HOLD 0.7, OUT 4.5.", "Side Colour; edit handle; Lang CN", M, 900, 620, 104, "T"), sq;
        add(c, ISCC.pair(c, "CALL", "FOLLOW THE CUP", "关注金杯", { x: M + 38, y: 934, size: 20, f: "b6", track: 240, color: K.gold }));
        add(c, ISCC.text(c, "HANDLE", "@YOUR_HANDLE", { x: M + 38, y: 986, size: 52, f: "d9", track: 60, color: K.parchment }));
        sq = ISCC.rect(c, "BULLET", M + 560, 940, 16, 16, K.gold);
        c.texts.push(sq);
        play(c, 4.5, 0.7);
    })();
}

if (typeof ISCC_BUILD_ALL === "undefined") { ISCC.runStandalone(ISCC_buildLowerThirds, "Lower Thirds"); }

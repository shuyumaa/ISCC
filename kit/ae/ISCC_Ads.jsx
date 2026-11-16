//@target aftereffects
// ISCC_Ads.jsx - 15 s promos (16:9, 9:16, 1:1), end cards, social posts, sponsor strip placeholder. Runnable alone.
#include "ISCC_Lib.jsxinc"

function ISCC_buildAds() {
    var K = ISCC.COL, D = ISCC.DEMO, sl = ISCC.sl;

    function ad(name, w, h, dur, note, ctrl, sliders, side, alpha) {
        var c = ISCC.newComp(name, "ad", { w: w, h: h, dur: dur, side: side || "CT", note: note, ctrl: ctrl, sliders: sliders || [], alpha: alpha === true });
        ISCC.teamCtl(c);
        c.m = Math.round(64 * Math.min(w, h) / 1080);
        c.u = Math.min(w, h) / 1080;
        c.cx = w / 2;
        return c;
    }
    function bg(c, o) { c.dress = ISCC.fullBg(c, o || {}); return c.dress; }
    // fade/slide a list of layers in at t, out at tOut (staggered)
    function seq(items, tIn, tOut, o, oo) {
        var i;
        o = o || { dy: 40 };
        for (i = 0; i < items.length; i++) {
            ISCC.inFrom(items[i], ISCC.st(tIn, i, 3), 0.75, o);
            if (tOut !== null) { ISCC.outTo(items[i], ISCC.st(tOut, i, 1), 0.35, oo || { dy: -30 }); }
        }
    }

    // ================= 15 s promo =================
    function promo(name, w, h, kind, note) {
        var c = ad(name, w, h, 15, note, "Side Colour; Lang CN; logo = LOGO precomp; edit date/venue slot", []), u = c.u, cx = c.cx, gs, gp, i, g, gl = [], items, vy, ty, ts, dy2, L, mt, r;
        bg(c, { drift: true });
        // 0-1.6 beam sweeps (black stage stays, blue from left / gold from right)
        ISCC.sweep(c, "SWEEP blue", -h * 0.33 - 100, w * 0.45, K.blue, 1, 0.0, 0.9, 1.0, 0.5, { op: 80 });
        ISCC.sweep(c, "SWEEP gold", w * 0.55, 30 * u, K.gold, -1, 0.1, 0.9, 1.1, 0.5, { op: 90 });
        if (kind === "land") { gs = 400; gp = [[cx - 1.53 * gs, 640], [cx - 0.51 * gs, 640], [cx + 0.51 * gs, 640], [cx + 1.53 * gs, 640]]; vy = 790; ty = 520; ts = 150; dy2 = 590; }
        else if (kind === "port") { gs = 440; gp = [[cx - 250, 760], [cx + 250, 760], [cx - 250, 1240], [cx + 250, 1240]]; vy = 1420; ty = 900; ts = 104; dy2 = 1010; }
        else { gs = 240; gp = [[cx - 1.53 * gs, 560], [cx - 0.51 * gs, 560], [cx + 0.51 * gs, 560], [cx + 1.53 * gs, 560]]; vy = 700; ty = 440; ts = 96; dy2 = 520; }
        // A. 百炼成徽 glyph by glyph, clip rise
        mt = "百炼成徽";
        for (i = 0; i < 4; i++) {
            g = ISCC.text(c, "GLYPH " + (i + 1), mt.charAt(i), { x: gp[i][0], y: gp[i][1], size: gs, f: "c9", color: (i === 3) ? K.gold : K.parchment, just: "C", eg: false });
            ISCC.clipRise(c, g, gp[i][0] - gs * 0.56, gp[i][1] - gs * 0.98, gs * 1.12, gs * 1.12, ISCC.st(1.2, i, 5), 0.9, gs * 1.1);
            ISCC.outTo(g, 5.4 + i * 0.02, 0.35, { dy: -gs * 0.3 });
            gl.push(g);
        }
        // B. voice line + tracer
        ISCC.tracer(c, "TRACER", [w + 60, vy - 140 * u - w * 0.1], [-60, vy - 140 * u + w * 0.22], 2.3, 0.5, {});
        items = [ISCC.pair(c, "VOICE", "Earn your crest.", "百炼成徽", { x: cx, y: vy, size: 64 * u, f: "b6", track: 240, color: K.parchment, just: "C" }), ISCC.hairH(c, "VOICE RULE", cx - 180 * u, vy + 30 * u, 360 * u, K.gold)];
        seq(items, 2.6, 5.4);
        // transition band
        ISCC.sweep(c, "SWEEP 2", -h * 0.33 - 100, w * 0.3, K.blue, 1, 5.2, 0.5, 6.0, 0.4, { op: 85 });
        // C. title block
        items = [ISCC.pair(c, "TITLE KICKER", "THE INTERNATIONAL STAGE", "国际赛场", { x: cx, y: ty - 120 * u, size: 30 * u, f: "b6", track: 260, color: K.gold, just: "C" }),
                 ISCC.pair(c, "TITLE L1", "INTERNATIONAL SCHOOLS", "国际学校", { x: cx, y: ty + ts * 0.8, size: ts, f: "d9", track: 20, color: K.parchment, just: "C" }),
                 ISCC.pair(c, "TITLE L2", "CS2 CHAMPIONSHIPS", "CS2锦标赛", { x: cx, y: ty + ts * 1.75, size: ts, f: "d9", track: 20, color: K.goldLight, just: "C" }),
                 ISCC.hairH(c, "TITLE RULE", cx - 260 * u, ty + ts * 2.05, 520 * u, K.gold)];
        seq(items, 6.0, 10.0);
        // D. date / venue placeholders
        items = [ISCC.pair(c, "DATE", "00 MONTH 0000", "0000年0月0日", { x: cx, y: dy2 + 40 * u, size: 150 * u, f: "d9", track: 20, color: K.parchment, just: "C" }),
                 ISCC.pair(c, "VENUE", "VENUE  /  CITY  (PLACEHOLDER)", "场馆 / 城市（占位）", { x: cx, y: dy2 + 130 * u, size: 34 * u, f: "b6", track: 240, color: K.silver, just: "C" }),
                 ISCC.pair(c, "VOICE 2", "One cup. Every nation.", "金杯为证，万国同场", { x: cx, y: dy2 + 250 * u, size: 46 * u, f: "b6", track: 240, color: K.goldLight, just: "C" })];
        seq(items, 10.4, 13.2);
        // E. logo end card
        L = ISCC.logo(c, "LOGO end card", cx, h / 2 - 40 * u, 420 * u);
        ISCC.inFrom(L, 13.4, 0.9, { sx: 75, sy: 75 });
        r = ISCC.ring(c, "RING", cx, h / 2 - 40 * u, 520 * u, K.goldLight, 3);
        ISCC.keys(ISCC.P(r, "sc"), [[13.4, ISCC.vec(ISCC.P(r, "sc"), [60, 60])], [14.3, ISCC.vec(ISCC.P(r, "sc"), [120, 120])]]);
        ISCC.keys(ISCC.P(r, "op"), [[13.4, 0], [13.5, 100], [14.3, 0]]);
        items = [ISCC.pair(c, "END TAG", "ISCC  /  国际学校CS2锦标赛", "ISCC / 国际学校CS2锦标赛", { x: cx, y: h / 2 + 330 * u, size: 34 * u, f: "b6", track: 240, color: K.silver, just: "C", keep: true })];
        seq(items, 13.7, null);
        ISCC.outTo([L, items], 14.6, 0.35, {});
        ISCC.finish(c, { inT: 0, hold: 13.4, outT: 14.6 });
    }
    promo("ISCC_Ad_Promo_15s_16x9", 1920, 1080, "land", "15 s promo 16:9: beams plate, 百炼成徽 glyph-by-glyph clip rise, voice line, title, date/venue slot, logo end card. HOLD 13.4, OUT 14.6.");
    promo("ISCC_Ad_Promo_15s_9x16", 1080, 1920, "port", "15 s promo 9:16 (1080x1920): same sequence re-laid for vertical.");
    promo("ISCC_Ad_Promo_15s_1x1", 1080, 1080, "sq", "15 s promo 1:1 (1080x1080): same sequence re-laid for square.");

    // ================= 5 s end card (3 ratios) =================
    function endcard(name, w, h) {
        var c = ad(name, w, h, 5, "5 s end card: logo, voice line, date/venue slot, beams. HOLD 1.2, OUT 4.5.", "Side Colour; Lang CN; edit date/venue", []), u = c.u, cx = c.cx, L, items, cy = h * 0.42, r;
        bg(c, { drift: true });
        ISCC.sweep(c, "SWEEP", -h * 0.33 - 100, w * 0.5, K.blue, 1, 0.0, 0.8, 0.9, 0.5, { op: 80 });
        L = ISCC.logo(c, "LOGO", cx, cy, 440 * u);
        ISCC.inFrom(L, 0.4, 0.9, { sx: 75, sy: 75 });
        r = ISCC.ring(c, "RING", cx, cy, 540 * u, K.goldLight, 3);
        ISCC.keys(ISCC.P(r, "sc"), [[0.4, ISCC.vec(ISCC.P(r, "sc"), [60, 60])], [1.3, ISCC.vec(ISCC.P(r, "sc"), [120, 120])]]);
        ISCC.keys(ISCC.P(r, "op"), [[0.4, 0], [0.5, 100], [1.3, 0]]);
        items = [ISCC.pair(c, "VOICE", "Earn your crest.", "百炼成徽", { x: cx, y: h * 0.42 + 340 * u, size: 70 * u, f: "b6", track: 240, color: K.parchment, just: "C" }),
                 ISCC.hairH(c, "RULE", cx - 160 * u, h * 0.42 + 372 * u, 320 * u, K.gold),
                 ISCC.pair(c, "DATE VENUE", "00 MONTH  /  VENUE (PLACEHOLDER)", "0月0日 / 场馆（占位）", { x: cx, y: h * 0.42 + 440 * u, size: 30 * u, f: "b6", track: 240, color: K.silver, just: "C" })];
        seq(items, 0.9, null);
        ISCC.outTo([L, items], 4.5, 0.35, {});
        ISCC.finish(c, { inT: 0, hold: 1.2, outT: 4.5 });
    }
    endcard("ISCC_Ad_EndCard_5s_16x9", 1920, 1080);
    endcard("ISCC_Ad_EndCard_5s_9x16", 1080, 1920);
    endcard("ISCC_Ad_EndCard_5s_1x1", 1080, 1080);

    // ================= Social: match result 1:1 =================
    (function () {
        var c = ad("ISCC_Social_MatchResult_1x1", 1080, 1080, 6, "Match result post 1:1: score, teams, map line. HOLD 1.0, OUT 5.4.", "Sliders Score A / Score B; Team A/B Colour; Lang CN", [["Score A", 2], ["Score B", 1]]), it = [], M = c.m;
        bg(c, {});
        it.push(ISCC.label(c, "KICKER", "FULL TIME  /  GRAND FINAL", "比赛结束 / 总决赛", M, 130, { size: 26, color: K.gold }));
        it.push(ISCC.hairH(c, "RULE", M, 160, 1080 - 2 * M, K.gold));
        it.push(ISCC.band(c, "SLAB A", -200, 230, 760, 250, ISCC.TEAMA, { op: 90 }));
        it.push(ISCC.pair(c, "NAME A", D.a.name, D.a.cn, { x: M, y: 400, size: 200, f: "d9", track: 10, color: K.parchment }));
        it.push(ISCC.band(c, "SLAB B", 520, 560, 760, 250, ISCC.TEAMB, { op: 90 }));
        it.push(ISCC.pair(c, "NAME B", D.b.name, D.b.cn, { x: 1080 - M, y: 730, size: 200, f: "d9", track: 10, color: K.black, just: "R" }));
        it.push(ISCC.text(c, "SCORE", "2 - 1", { x: 540, y: 1000, size: 200, f: "d8", track: 10, just: "C", color: K.goldLight, expr: 'Math.round(' + sl("Score A") + ') + " - " + Math.round(' + sl("Score B") + ');' }));
        it.push(ISCC.pair(c, "MAPS", "ATRIUM 13-9  /  ARCHIVE 10-13  /  QUAD 13-7", "中庭 13-9 / 档案馆 10-13 / 方庭 13-7", { x: 540, y: 860, size: 24, f: "b6", track: 160, color: K.silver, just: "C" }));
        it.push(ISCC.logo(c, "LOGO", 1080 - M - 36, 100, 72));
        seq(it, 0.1, 5.4, { dy: 40 });
        ISCC.finish(c, { inT: 0, hold: 1.0, outT: 5.4 });
    })();

    // ================= Social: lineup 4:5 =================
    (function () {
        var c = ad("ISCC_Social_Lineup_4x5", 1080, 1350, 6, "Lineup post 4:5 (1080x1350): five players. HOLD 1.0, OUT 5.4.", "Side Colour; edit handles; Lang CN", [], "CT"), it = [], M = c.m, i, y, rl = [["ENTRY", "突破手"], ["LURKER", "潜伏手"], ["SUPPORT", "辅助"], ["AWP", "狙击手"], ["IGL", "指挥"]];
        bg(c, {});
        it.push(ISCC.label(c, "KICKER", "STARTING FIVE", "首发五人", M, 120, { size: 26, color: K.gold }));
        it.push(ISCC.pair(c, "TEAM", D.a.name, D.a.cn, { x: M - 4, y: 290, size: 230, f: "d9", track: 10, color: K.parchment }));
        it.push(ISCC.pair(c, "SCHOOL", D.a.school, D.a.schoolCn, { x: M, y: 342, size: 24, f: "b6", track: 220, color: K.silver }));
        it.push(ISCC.rect(c, "SIDE TICK", 0, 150, 18, 210, "side"));
        for (i = 0; i < 5; i++) {
            y = 400 + i * 160;
            it.push([ISCC.rect(c, "ROW " + (i + 1) + " PLATE", M, y, 1080 - 2 * M, 140, K.black, { op: 94 }), ISCC.rect(c, "ROW " + (i + 1) + " BAR", M, y, 8, 140, i === 4 ? K.gold : "side"),
                     ISCC.text(c, "ROW " + (i + 1) + " NO", "0" + (i + 1), { x: M + 40, y: y + 90, size: 40, f: "d8", color: K.silver }),
                     ISCC.text(c, "ROW " + (i + 1) + " HANDLE", D.pa[i], { x: M + 130, y: y + 100, size: 100, f: "d9", track: 20, color: K.parchment }),
                     ISCC.pair(c, "ROW " + (i + 1) + " ROLE", rl[i][0], rl[i][1], { x: 1080 - M - 24, y: y + 86, size: 24, f: "b6", track: 240, color: K.gold, just: "R" })]);
        }
        it.push(ISCC.logo(c, "LOGO", 1080 - M - 36, 100, 72));
        seq(it, 0.1, 5.4, { dx: -90, dy: 0 });
        ISCC.finish(c, { inT: 0, hold: 1.0, outT: 5.4 });
    })();

    // ================= Social: countdown story 9:16 =================
    (function () {
        var c = ad("ISCC_Social_Countdown_Story_9x16", 1080, 1920, 10, "Story countdown 9:16: days-to-go number from slider Days; keeps clear of story UI zones (top 250 / bottom 340 px). HOLD 1.2, OUT 9.4.", "Slider Days; Side Colour; Lang CN", [["Days", 12]], "T"), it = [], M = c.m, num;
        bg(c, {});
        it.push(ISCC.label(c, "KICKER", "COUNTDOWN", "倒计时", M, 330, { size: 28, color: K.gold }));
        it.push(ISCC.hairH(c, "RULE", M, 360, 1080 - 2 * M, K.gold));
        num = ISCC.text(c, "DAYS", "12", { x: 540, y: 1000, size: 900, f: "d9", track: -10, just: "C", color: K.parchment, expr: 'Math.round(' + sl("Days") + ') + "";' });
        it.push(num);
        it.push(ISCC.band(c, "BAND", 120, 1090, 22, 300, "side"));
        it.push(ISCC.pair(c, "UNIT", "DAYS TO GO", "天后开赛", { x: 540, y: 1160, size: 110, f: "d9", track: 60, color: K.goldLight, just: "C" }));
        it.push(ISCC.pair(c, "VOICE", "Earn your crest.", "百炼成徽", { x: 540, y: 1330, size: 56, f: "b6", track: 240, color: K.parchment, just: "C" }));
        it.push(ISCC.pair(c, "DATE", "00 MONTH  /  VENUE (PLACEHOLDER)", "0月0日 / 场馆（占位）", { x: 540, y: 1420, size: 28, f: "b6", track: 220, color: K.silver, just: "C" }));
        it.push(ISCC.logo(c, "LOGO", 540, 1560, 150));
        seq(it, 0.1, 9.4, { dy: 50 });
        ISCC.finish(c, { inT: 0, hold: 1.2, outT: 9.4 });
    })();

    // ================= Sponsor strip placeholder =================
    (function () {
        var c = ad("ISCC_Ad_Sponsor_Strip_Placeholder", 1920, 1080, 8, "Partner strip with five clearly labelled PLACEHOLDER slots (no sponsors invented). Drop logos over the slots. IN 0, HOLD 1.0, OUT 7.4.", "Side Colour; Lang CN", [], "CT", true), it = [], i, x, pl, hr;
        pl = ISCC.rect(c, "PLATE", 96, 880, 1728, 140, K.black, { op: 94 });
        hr = ISCC.hairH(c, "HAIR", 96, 880, 1728, K.gold);
        it.push(ISCC.rect(c, "SIDE BAR", 96, 880, 10, 140, "side"));
        it.push(ISCC.pair(c, "LABEL", "PARTNERS  (PLACEHOLDER)", "合作伙伴（占位）", { x: 136, y: 938, size: 20, f: "b6", track: 240, color: K.gold }));
        for (i = 0; i < 5; i++) {
            x = 136 + i * 332;
            it.push([ISCC.rect(c, "SLOT " + (i + 1) + " OUTLINE", x, 956, 300, 52, K.black, { stroke: K.silver, sw: 2, so: 45 }),
                     ISCC.text(c, "SLOT " + (i + 1) + " LABEL", "SPONSOR SLOT " + (i + 1) + "  LOGO HERE", { x: x + 150, y: 990, size: 16, f: "b6", track: 200, color: K.silver, just: "C", eg: false })]);
        }
        ISCC.inFrom(pl, 0, 0.6, { sx: 0, fade: false }); ISCC.inFrom(hr, 0.05, 0.7, { sx: 0, fade: false });
        seq(it, 0.15, 7.4, { dy: 30 }, { dy: 20 });
        ISCC.outTo([pl, hr], 7.5, 0.35, { sx: 0, fade: false });
        ISCC.finish(c, { inT: 0, hold: 1.0, outT: 7.4 });
    })();
}

if (typeof ISCC_BUILD_ALL === "undefined") { ISCC.runStandalone(ISCC_buildAds, "Ads & Social"); }

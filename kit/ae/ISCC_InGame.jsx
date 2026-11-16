//@target aftereffects
// ISCC_InGame.jsx - scorebug, bomb timer, killfeed, player rows, economy, round history, veto strip, series score, focus panel.
#include "ISCC_Lib.jsxinc"

function ISCC_buildInGame() {
    var K = ISCC.COL, W = ISCC.CFG.W, H = ISCC.CFG.H, M = ISCC.CFG.margin, D = ISCC.DEMO, sl = ISCC.sl;

    function comp(name, dur, note, ctrl, sliders, side) {
        var c = ISCC.newComp(name, "ig", { dur: dur, side: side || "CT", note: note, ctrl: ctrl, sliders: sliders || [] });
        ISCC.teamCtl(c);
        return c;
    }
    // staggered group entrance / exit
    function inOut(items, tIn, tOut, o, stag) {
        var i;
        for (i = 0; i < items.length; i++) {
            ISCC.inFrom(items[i], ISCC.st(tIn, i, stag === undefined ? 3 : stag), 0.6, o);
            ISCC.outTo(items[i], ISCC.st(tOut, i, 2), 0.3, o);
        }
    }

    // ---------------------------------------------------------------- Scorebug
    (function () {
        var c = comp("ISCC_InGame_Scorebug", 12, "Top-centre scorebug: team slabs, scores, round, clock, map line. IN 0, HOLD 0.9, OUT 11.3.", "Sliders: Score A / Score B / Round / Seconds (clock); Team A/B Colour; Lang CN", [["Score A", 7], ["Score B", 5], ["Round", 13], ["Seconds", 101]]);
        var x0 = 580, y = 36, h = 80, mid, sa, sb, ta, tb, tx = [], t, hr, strip, ml, i;
        mid = ISCC.rect(c, "MID PLATE", x0 + 200, y, 360, h, K.black, { op: 96, center: true });
        ta = ISCC.rect(c, "SLAB A", x0, y, 200, h, ISCC.TEAMA);
        tb = ISCC.rect(c, "SLAB B", x0 + 560, y, 200, h, ISCC.TEAMB);
        sa = ISCC.rect(c, "SCORE PLATE A", x0 + 200, y, 80, h, K.black, { op: 96 });
        sb = ISCC.rect(c, "SCORE PLATE B", x0 + 480, y, 80, h, K.black, { op: 96 });
        hr = ISCC.hairH(c, "HAIR", x0 + 200, y + h, 360, K.gold);
        strip = ISCC.rect(c, "MAP STRIP", x0 + 200, y + h + 2, 360, 28, K.black, { op: 90 });
        tx.push(ISCC.text(c, "TAG A", D.a.tag, { x: x0 + 100, y: y + 58, size: 58, f: "d9", track: 40, color: K.parchment, just: "C" }));
        tx.push(ISCC.text(c, "TAG B", D.b.tag, { x: x0 + 660, y: y + 58, size: 58, f: "d9", track: 40, color: K.black, just: "C" }));
        tx.push(ISCC.text(c, "SCORE A", "0", { x: x0 + 240, y: y + 62, size: 62, f: "d8", just: "C", color: K.parchment, expr: 'Math.round(' + sl("Score A") + ') + "";' }));
        tx.push(ISCC.text(c, "SCORE B", "0", { x: x0 + 520, y: y + 62, size: 62, f: "d8", just: "C", color: K.parchment, expr: 'Math.round(' + sl("Score B") + ') + "";' }));
        tx.push(ISCC.text(c, "CLOCK", "0:00", { x: x0 + 380, y: y + 64, size: 52, f: "d8", track: 20, just: "C", color: K.goldLight, expr: ISCC.CLOCK(sl("Seconds")) }));
        tx.push(ISCC.pair(c, "ROUND", "ROUND", "回合", { x: x0 + 380, y: y + 24, size: 15, f: "b6", track: 240, just: "C", color: K.silver, expr: '"ROUND " + Math.round(' + sl("Round") + ');', cnExpr: '"第 " + Math.round(' + sl("Round") + ') + " 回合";' }));
        ml = ISCC.pair(c, "MAP LINE", "BO3  /  ATRIUM", "三局两胜 / 中庭", { x: x0 + 380, y: y + h + 21, size: 15, f: "b6", track: 240, color: K.silver, just: "C" });
        ISCC.inFrom(mid, 0, 0.6, { sx: 0, fade: false }); ISCC.inFrom([sa, sb], 0.06, 0.6, { sx: 0, fade: false });
        ISCC.inFrom(ta, 0.1, 0.7, { dx: 220 }); ISCC.inFrom(tb, 0.1, 0.7, { dx: -220 });
        ISCC.inFrom(hr, 0.14, 0.7, { sx: 0, fade: false }); ISCC.inFrom(strip, 0.18, 0.5, { dy: -30 });
        for (i = 0; i < tx.length; i++) { ISCC.inFrom(tx[i], ISCC.st(0.22, i, 3), 0.5, { dy: 14 }); }
        ISCC.inFrom(ml, 0.34, 0.5, { dy: -10 });
        ISCC.outTo([ta, tb, sa, sb, mid, hr, strip, tx, ml], 11.3, 0.4, {});
        ISCC.finish(c, { inT: 0, hold: 0.9, outT: 11.3 });
    })();

    // ---------------------------------------------------------------- Bomb timer
    (function () {
        var c = comp("ISCC_InGame_Bomb_Timer_Bar", 44, "Bomb timer: 40 s drain bar (slider-driven), tick marks, last-5 s blink. IN 0, HOLD 0.8, OUT 41.5.", "Slider Seconds Left (keyed 40 > 0; override by hand); Side Colour", [["Seconds Left", 40]], "T"), pl, hr, bar, tr, tk, lb, tm, i, L, sec = sl("Seconds Left");
        pl = ISCC.rect(c, "PLATE", 560, 930, 800, 80, K.black, { op: 94 });
        ISCC.rect(c, "SIDE TICK", 560, 930, 10, 80, "side");
        hr = ISCC.hairH(c, "HAIR top", 560, 930, 800, K.gold);
        tr = ISCC.rect(c, "TRACK", 780, 968, 540, 12, K.blue, { op: 70 });
        bar = ISCC.rect(c, "FILL", 780, 968, 540, 12, K.goldLight);
        ISCC.P(bar, "sc").expression = "[100 * Math.max(0, Math.min(40, " + sec + ") ) / 40, 100];";
        ISCC.P(bar, "op").expression = "var s = " + sec + "; s < 5 && s > 0 ? (Math.floor(time * 4) % 2 === 0 ? 100 : 35) : 100;";
        tk = ISCC.shapeLayer(c, "TICKS 10s");
        for (i = 0; i < 5; i++) { ISCC.addRect(tk, 780 + i * 135 - (i === 4 ? 2 : 0), 960, 2, 28, { fill: K.silver, fo: 70 }); }
        lb = ISCC.pair(c, "LABEL", "BOMB PLANTED", "炸弹已安放", { x: 596, y: 962, size: 20, f: "b6", track: 240, color: K.gold });
        tm = ISCC.text(c, "TIME", "0:40", { x: 1340, y: 996, size: 64, f: "d8", track: 20, just: "R", color: K.parchment, expr: 'var s = Math.max(0, Math.ceil(' + sec + ')); (s < 10 ? "0:0" : "0:") + s;' });
        L = c.ctl.property("ADBE Effect Parade").property("Seconds Left").property("ADBE Slider Control-0001");
        L.setValueAtTime(0.8, 40); L.setValueAtTime(40.8, 0);
        ISCC.inFrom(pl, 0, 0.6, { sx: 0, fade: false }); ISCC.inFrom(hr, 0.05, 0.7, { sx: 0, fade: false });
        ISCC.inFrom([tr, bar], 0.2, 0.6, { sx: 0, fade: false });
        ISCC.inFrom(tk, 0.3, 0.5, {}); ISCC.inFrom(lb, 0.24, 0.6, { dx: -40 }); ISCC.inFrom(tm, 0.3, 0.6, { dx: 40 });
        ISCC.outTo([pl, hr, tr, tk, lb, tm], 41.5, 0.4, {});
        ISCC.P(bar, "op").setValueAtTime(41.5, 100);
        ISCC.finish(c, { inT: 0, hold: 0.8, outT: 41.5 });
    })();

    // ---------------------------------------------------------------- Killfeed row
    (function () {
        var c = comp("ISCC_InGame_Killfeed_Row", 6, "One killfeed row: killer, tracer glyph, victim, headshot square. IN 0, HOLD 0.6, OUT 5.2.", "Side Colour (killer team); edit handles", [], "CT"), x = W - M - 640, y = 160, pl, bar, hr, k, v, g, hs;
        pl = ISCC.rect(c, "PLATE", x, y, 640, 56, K.black, { op: 92 });
        bar = ISCC.rect(c, "SIDE BAR", x, y, 8, 56, "side");
        hr = ISCC.hairH(c, "HAIR", x, y + 54, 640, K.gold, { so: 60 });
        k = ISCC.text(c, "KILLER", "kite", { x: x + 28, y: y + 40, size: 34, f: "d9", track: 40, color: K.parchment });
        g = ISCC.line(c, "TRACER GLYPH", [x + 270, y + 28], [x + 360, y + 28], K.goldLight, 3);
        hs = ISCC.rect(c, "HEADSHOT", x + 372, y + 20, 16, 16, K.gold);
        v = ISCC.text(c, "VICTIM", "ember", { x: x + 612, y: y + 40, size: 34, f: "d9", track: 40, color: K.parchment, just: "R" });
        ISCC.inFrom([pl, bar, hr], 0, 0.5, { dx: 320 }); ISCC.inFrom([k, g, hs, v], 0.08, 0.5, { dx: 200 });
        ISCC.outTo([pl, bar, hr, k, g, hs, v], 5.2, 0.3, { dx: 260 });
        ISCC.finish(c, { inT: 0, hold: 0.6, outT: 5.2 });
    })();

    // ---------------------------------------------------------------- Player rows
    function playerRow(name, side, left) {
        var c = comp(name, 8, "Player row (" + side + "): slot, handle, health bar + number, money. Health slider 0-100 (0 = dead). IN 0, OUT 7.4.", "Sliders: Health / Money / Slot; Side Colour; edit handle", [["Health", 78], ["Money", 4200], ["Slot", 1]], side), x = left ? 36 : W - 36 - 560, y = 300, pl, bar, hr, tr, fl, tx = [], hp = sl("Health"), lowCol = "[0.894, 0.812, 0.604, 1]";
        pl = ISCC.rect(c, "PLATE", x, y, 560, 66, K.black, { op: 92 });
        bar = ISCC.rect(c, "SIDE BAR", x, y, 8, 66, "side");
        hr = ISCC.hairH(c, "HAIR", x, y, 560, K.gold, { so: 50 });
        tx.push(ISCC.text(c, "SLOT", "1", { x: x + 40, y: y + 46, size: 36, f: "d8", just: "C", color: K.silver, expr: 'Math.round(' + sl("Slot") + ') + "";' }));
        tx.push(ISCC.text(c, "HANDLE", side === "CT" ? "kite" : "ember", { x: x + 70, y: y + 48, size: 46, f: "d9", track: 40, color: K.parchment }));
        tr = ISCC.rect(c, "HEALTH TRACK", x + 270, y + 40, 150, 10, K.blue, { op: 80 });
        fl = ISCC.rect(c, "HEALTH FILL", x + 270, y + 40, 150, 10, "var h = " + hp + "; h < 25 ? " + lowCol + " : thisComp.layer(\"CONTROL\").effect(\"Side Colour\")(\"Color\");");
        ISCC.P(fl, "sc").expression = "[Math.max(0, Math.min(100, " + hp + ")), 100];";
        tx.push(ISCC.text(c, "HEALTH", "78", { x: x + 440, y: y + 50, size: 44, f: "d8", color: K.parchment, expr: 'Math.round(' + hp + ') + "";' }));
        tx.push(ISCC.text(c, "MONEY", "$4,200", { x: x + 270, y: y + 28, size: 18, f: "b6", track: 160, color: K.silver, expr: ISCC.MONEYFN + 'isccM(' + sl("Money") + ');' }));
        ISCC.each(tx, function (l) { var o = ISCC.P(l, "op"); o.expression = "var h = " + hp + "; h <= 0 ? 35 : 100;"; });
        ISCC.inFrom([pl, bar, hr], 0, 0.5, { dx: left ? -300 : 300 }); ISCC.inFrom(tx, 0.08, 0.5, { dx: left ? -200 : 200 });
        ISCC.inFrom([tr, fl], 0.14, 0.5, { dx: left ? -200 : 200 });
        ISCC.outTo([pl, bar, hr, tx, tr, fl], 7.4, 0.3, { dx: left ? -260 : 260 });
        ISCC.finish(c, { inT: 0, hold: 0.6, outT: 7.4 });
    }
    playerRow("ISCC_InGame_Player_Row_CT", "CT", true);
    playerRow("ISCC_InGame_Player_Row_T", "T", false);

    // ---------------------------------------------------------------- Economy panel
    (function () {
        var c = comp("ISCC_InGame_Economy_Panel", 8, "Economy panel: bank per team and loss-bonus pips. IN 0, HOLD 0.9, OUT 7.4.", "Sliders: Bank A / Bank B / Loss A / Loss B (0-5); Team A/B Colour; Lang CN", [["Bank A", 18400], ["Bank B", 9700], ["Loss A", 0], ["Loss B", 3]]), x = W - 96 - 440, y = 420, pl, hr, hd, i, r, rows = [], tx = [], pips, id, t;
        pl = ISCC.rect(c, "PLATE", x, y, 440, 230, K.black, { op: 94 });
        hr = ISCC.hairH(c, "HAIR", x, y, 440, K.gold);
        hd = ISCC.label(c, "HEADER", "ECONOMY", "经济", x + 24, y + 40, { size: 20 });
        ISCC.hairH(c, "HAIR mid", x + 24, y + 62, 392, K.silver, { so: 30 });
        for (i = 0; i < 2; i++) {
            r = y + 70 + i * 80;
            rows.push(ISCC.rect(c, "TEAM BAR " + (i ? "B" : "A"), x, r, 8, 70, i ? ISCC.TEAMB : ISCC.TEAMA));
            tx.push(ISCC.text(c, "TAG " + (i ? "B" : "A"), i ? D.b.tag : D.a.tag, { x: x + 28, y: r + 44, size: 42, f: "d9", track: 40, color: K.parchment }));
            tx.push(ISCC.text(c, "BANK " + (i ? "B" : "A"), "$0", { x: x + 416, y: r + 44, size: 50, f: "d8", just: "R", color: K.goldLight, expr: ISCC.MONEYFN + 'isccM(' + sl(i ? "Bank B" : "Bank A") + ');' }));
            pips = ISCC.shapeLayer(c, "LOSS PIPS " + (i ? "B" : "A"));
            for (t = 0; t < 5; t++) {
                id = ISCC.addRect(pips, x + 130 + t * 22, r + 14, 14, 14, { fill: "Math.round(" + sl(i ? "Loss B" : "Loss A") + ") > " + t + " ? [0.788, 0.643, 0.298, 1] : [0.082, 0.161, 0.306, 1];" });
            }
            tx.push(pips);
        }
        ISCC.inFrom([pl, hr], 0, 0.6, { dx: 460, fade: false }); ISCC.inFrom(hd, 0.1, 0.5, { dx: 60 });
        inOut(rows, 0.12, 7.4, { dx: 100 }); inOut(tx, 0.16, 7.4, { dx: 80 });
        ISCC.outTo([pl, hr, hd], 7.4, 0.35, { dx: 460, fade: false });
        ISCC.finish(c, { inT: 0, hold: 0.9, outT: 7.4 });
    })();

    // ---------------------------------------------------------------- Round history 24
    (function () {
        var c = comp("ISCC_InGame_Round_History_24", 8, "24 round pips (MR12), two rows, halftime gap. Two slider bit-masks: bit n set = that team won round n+1. IN 0, OUT 7.4.", "Sliders: History A / History B (24-bit masks, e.g. 5460 = alternate rounds); Team A/B Colour; Lang CN", [["History A", 1365], ["History B", 2730]]), x0 = 528, y0 = 150, rows = [], r, i, L, gx, pl, tg = [], bitE;
        pl = ISCC.rect(c, "PLATE", x0 - 96, y0 - 40, 1056 + 0, 130, K.black, { op: 90 });
        for (r = 0; r < 2; r++) {
            L = ISCC.shapeLayer(c, "PIPS " + (r ? "B" : "A"));
            for (i = 0; i < 24; i++) {
                gx = x0 + i * 34 + (i >= 12 ? 28 : 0);
                bitE = "Math.floor(" + sl(r ? "History B" : "History A") + " / Math.pow(2, " + i + ")) % 2 === 1 ? 100 : 0;";
                ISCC.addRect(L, gx, y0 + r * 40, 28, 28, { fill: (r ? ISCC.TEAMB : ISCC.TEAMA), stroke: K.silver, sw: 2, so: 35, gname: "pip " + (i + 1) });
                L.property("ADBE Root Vectors Group").property("pip " + (i + 1)).property("ADBE Vectors Group").property("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Opacity").expression = bitE;
            }
            rows.push(L);
            tg.push(ISCC.text(c, "TAG " + (r ? "B" : "A"), r ? D.b.tag : D.a.tag, { x: x0 - 20, y: y0 + r * 40 + 24, size: 34, f: "d9", track: 40, just: "R", color: K.parchment }));
        }
        tg.push(ISCC.pair(c, "HALF 1", "FIRST HALF", "上半场", { x: x0, y: y0 - 14, size: 16, f: "b6", track: 240, color: K.silver }));
        tg.push(ISCC.pair(c, "HALF 2", "SECOND HALF", "下半场", { x: x0 + 12 * 34 + 28, y: y0 - 14, size: 16, f: "b6", track: 240, color: K.silver }));
        tg.push(ISCC.hairV(c, "HALFTIME", x0 + 12 * 34 + 12, y0 - 8, 76, K.gold, { op: 80 }));
        ISCC.inFrom(pl, 0, 0.5, { dy: -60 }); inOut(rows, 0.1, 7.4, { dy: -30 }, 4); inOut(tg, 0.16, 7.4, { dy: -20 });
        ISCC.outTo(pl, 7.4, 0.35, { dy: -60 });
        ISCC.finish(c, { inT: 0, hold: 0.9, outT: 7.4 });
    })();

    // ---------------------------------------------------------------- Map veto strip
    (function () {
        var sliders = [], i, c, cw = 240, gap = 8, y = 880, x, cells = [], st, lbl, nm, bars, plates, tx, bn, ex, hl;
        for (i = 0; i < 7; i++) { sliders.push(["Cell " + (i + 1), [1, 3, 2, 4, 0, 0, 5][i]]); }
        c = comp("ISCC_InGame_Map_Veto_Strip", 10, "Seven-cell veto strip. Cell sliders: 0 open, 1 ban A, 2 ban B, 3 pick A, 4 pick B, 5 decider. IN 0, OUT 9.4.", "Sliders Cell 1..7; Team A/B Colour; edit map names; Lang CN", sliders);
        for (i = 0; i < 7; i++) {
            x = M + i * (cw + gap);
            st = "Math.round(" + sl("Cell " + (i + 1)) + ")";
            plates = ISCC.rect(c, "CELL " + (i + 1) + " PLATE", x, y, cw, 120, K.black, { op: 94 });
            ISCC.P(plates, "op").expression = "var s = " + st + "; s === 1 || s === 2 ? 55 : 94;";
            bars = ISCC.rect(c, "CELL " + (i + 1) + " BAR", x, y, cw, 8, "var s = " + st + "; s === 1 || s === 3 ? " + ISCC.TEAMA + " : (s === 2 || s === 4 ? " + ISCC.TEAMB + " : (s === 5 ? [0.894, 0.812, 0.604, 1] : [0.604, 0.639, 0.698, 1]));");
            ISCC.hairH(c, "CELL " + (i + 1) + " HAIR", x, y + 8, cw, K.gold, { so: 40 });
            tx = [ISCC.text(c, "CELL " + (i + 1) + " INDEX", "0" + (i + 1), { x: x + 16, y: y + 36, size: 16, f: "b6", track: 240, color: K.silver }),
                  ISCC.text(c, "CELL " + (i + 1) + " MAP", D.maps[i], { x: x + 16, y: y + 82, size: 44, f: "d9", track: 40, color: K.parchment }),
                  ISCC.pair(c, "CELL " + (i + 1) + " STATE", "OPEN", "待选", { x: x + 16, y: y + 108, size: 15, f: "b6", track: 240, color: K.gold,
                      expr: 'var s = ' + st + '; ["OPEN", "BAN KES", "BAN LAN", "PICK KES", "PICK LAN", "DECIDER"][Math.min(5, Math.max(0, s))];',
                      cnExpr: 'var s = ' + st + '; ["待选", "禁用 红隼", "禁用 灯笼", "选择 红隼", "选择 灯笼", "决胜图"][Math.min(5, Math.max(0, s))];' })];
            ex = ISCC.line(c, "CELL " + (i + 1) + " STRIKE", [x + 16, y + 66], [x + cw - 16, y + 66], K.parchment, 3);
            ISCC.P(ex, "op").expression = "var s = " + st + "; s === 1 || s === 2 ? 100 : 0;";
            ISCC.inFrom([plates, bars], ISCC.st(0, i, 3), 0.6, { dy: 140 });
            ISCC.inFrom(tx, ISCC.st(0.08, i, 3), 0.6, { dy: 90 });
            ISCC.outTo([plates, bars, tx], ISCC.st(9.4, i, 2), 0.3, { dy: 140 });
        }
        ISCC.finish(c, { inT: 0, hold: 0.9, outT: 9.4 });
    })();

    // ---------------------------------------------------------------- Series score BO3
    (function () {
        var c = comp("ISCC_InGame_Series_Score_BO3", 6, "Best-of-three series score: two rows with win pips. IN 0, OUT 5.4.", "Sliders Wins A / Wins B (0-2); Team A/B Colour; Lang CN", [["Wins A", 1], ["Wins B", 0]]), x = M, y = 36, pl, hr, items = [], i, p, t;
        pl = ISCC.rect(c, "PLATE", x, y, 330, 130, K.black, { op: 94 });
        hr = ISCC.hairH(c, "HAIR", x, y, 330, K.gold);
        items.push(ISCC.pair(c, "FORMAT", "BEST OF 3", "三局两胜", { x: x + 20, y: y + 28, size: 15, f: "b6", track: 240, color: K.silver }));
        for (i = 0; i < 2; i++) {
            items.push(ISCC.rect(c, "BAR " + (i ? "B" : "A"), x, y + 40 + i * 44, 8, 40, i ? ISCC.TEAMB : ISCC.TEAMA));
            items.push(ISCC.text(c, "TAG " + (i ? "B" : "A"), i ? D.b.name : D.a.name, { x: x + 24, y: y + 72 + i * 44, size: 36, f: "d9", track: 40, color: K.parchment }));
            p = ISCC.shapeLayer(c, "WIN PIPS " + (i ? "B" : "A"));
            for (t = 0; t < 2; t++) {
                ISCC.addRect(p, x + 262 + t * 26, y + 50 + i * 44, 18, 18, { fill: "Math.round(" + sl(i ? "Wins B" : "Wins A") + ") > " + t + " ? " + (i ? ISCC.TEAMB : ISCC.TEAMA) + " : [0.027, 0.035, 0.051, 1];", stroke: K.silver, sw: 2, so: 40, gname: "pip " + (t + 1) });
            }
            items.push(p);
        }
        ISCC.inFrom([pl, hr], 0, 0.5, { dx: -360, fade: false }); inOut(items, 0.1, 5.4, { dx: -80 });
        ISCC.outTo([pl, hr], 5.45, 0.35, { dx: -360, fade: false });
        ISCC.finish(c, { inT: 0, hold: 0.8, outT: 5.4 });
    })();

    // ---------------------------------------------------------------- Focus player panel
    (function () {
        var c = comp("ISCC_InGame_Focus_Player_Panel", 8, "Observed-player panel: handle, K/A/D, health bar. IN 0, HOLD 0.8, OUT 7.4.", "Sliders: Health / Kills / Assists / Deaths; Side Colour; edit handle; Lang CN", [["Health", 100], ["Kills", 14], ["Assists", 3], ["Deaths", 9]]), x = M, y = 830, pl, bar, hr, tr, fl, tx = [], i, nm = [["Kills", "K", "击杀"], ["Assists", "A", "助攻"], ["Deaths", "D", "死亡"]], cx;
        pl = ISCC.rect(c, "PLATE", x, y, 820, 170, K.black, { op: 94 });
        bar = ISCC.rect(c, "SIDE BAR", x, y, 10, 170, "side");
        hr = ISCC.hairH(c, "HAIR", x, y, 820, K.gold);
        tr = ISCC.rect(c, "HEALTH TRACK", x + 40, y + 140, 400, 10, K.blue, { op: 80 });
        fl = ISCC.rect(c, "HEALTH FILL", x + 40, y + 140, 400, 10, "side");
        ISCC.P(fl, "sc").expression = "[Math.max(0, Math.min(100, " + sl("Health") + ")), 100];";
        tx.push(ISCC.pair(c, "LABEL", "NOW OBSERVING", "当前观战", { x: x + 40, y: y + 40, size: 18, f: "b6", track: 240, color: K.gold }));
        tx.push(ISCC.text(c, "HANDLE", "mossglass", { x: x + 38, y: y + 118, size: 88, f: "d9", track: 20, color: K.parchment }));
        tx.push(ISCC.text(c, "HEALTH", "100", { x: x + 440, y: y + 154, size: 36, f: "d8", just: "R", color: K.parchment, expr: 'Math.round(' + sl("Health") + ') + "";' }));
        for (i = 0; i < 3; i++) {
            cx = x + 530 + i * 100;
            tx.push(ISCC.text(c, "STAT " + nm[i][1], "0", { x: cx, y: y + 108, size: 76, f: "d8", color: K.goldLight, expr: 'Math.round(' + sl(nm[i][0]) + ') + "";' }));
            tx.push(ISCC.pair(c, "STAT " + nm[i][1] + " LABEL", nm[i][1], nm[i][2], { x: cx, y: y + 142, size: 18, f: "b6", track: 240, color: K.silver }));
        }
        ISCC.hairV(c, "DIVIDER", x + 500, y + 30, 110, K.gold, { op: 50 });
        ISCC.inFrom([pl, bar, hr], 0, 0.6, { dy: 190 }); ISCC.inFrom([tr, fl], 0.12, 0.6, { sx: 0, fade: false }); inOut(tx, 0.14, 7.4, { dy: 24 });
        ISCC.outTo([pl, bar, hr, tr, fl], 7.5, 0.35, { dy: 190 });
        ISCC.finish(c, { inT: 0, hold: 0.8, outT: 7.4 });
    })();
}

if (typeof ISCC_BUILD_ALL === "undefined") { ISCC.runStandalone(ISCC_buildInGame, "In-Game"); }

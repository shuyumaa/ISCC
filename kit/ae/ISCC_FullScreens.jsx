//@target aftereffects
// ISCC_FullScreens.jsx - 1920x1080 full-frame scenes with their own stage background. Runnable alone.
#include "ISCC_Lib.jsxinc"

function ISCC_buildFullScreens() {
    var K = ISCC.COL, W = ISCC.CFG.W, H = ISCC.CFG.H, M = ISCC.CFG.margin, D = ISCC.DEMO, sl = ISCC.sl;

    function screen(name, dur, note, ctrl, sliders, hEn, hCn, side) {
        var c = ISCC.newComp(name, "fs", { dur: dur, side: side || "CT", note: note, ctrl: ctrl, sliders: sliders || [], alpha: false });
        ISCC.teamCtl(c);
        c.dress = ISCC.fullBg(c, {});
        c.head = hEn ? ISCC.header(c, hEn, hCn) : [];
        ISCC.inFrom(c.head, 0.05, 0.7, { dy: -24 });
        c.out = c.dur - 0.5;
        return c;
    }
    // stagger every item in (expo-out, 3 f apart) and out (faster)
    function play(c, items, t0, o) {
        var i;
        o = o || { dy: 44 };
        for (i = 0; i < items.length; i++) {
            ISCC.inFrom(items[i], ISCC.st(t0 === undefined ? 0.2 : t0, i, 3), 0.7, o);
            ISCC.outTo(items[i], Math.min(ISCC.st(c.out, i, 1), c.dur - 0.36), 0.35, { dy: -24 });
        }
        ISCC.outTo(c.head, c.out, 0.35, {});
    }
    function done(c, hold) { ISCC.finish(c, { inT: 0, hold: hold === undefined ? 1.2 : hold, outT: c.out }); }
    function slab(c, name, x, y, w, h, fill, o) { return ISCC.rect(c, name, x, y, w, h, fill, o || { op: 94 }); }

    // ------------------------------------------------------------ Matchup VS
    (function () {
        var c = screen("ISCC_Full_Matchup_VS", 10, "Matchup screen KES vs LAN: names, schools, BO3, map, date/venue slot. IN 0, HOLD 1.4, OUT 9.5.", "Team A/B Colour; edit text; Lang CN", [], "GRAND FINAL", "总决赛"), it = [], cx = W / 2, i, vs, ln;
        it.push(ISCC.band(c, "SLAB A", -300, 250, 1000, 330, ISCC.TEAMA, { op: 90 }));
        it.push(ISCC.band(c, "SLAB B", 1220, 520, 1000, 330, ISCC.TEAMB, { op: 90 }));
        it.push(ISCC.pair(c, "TAG A", D.a.tag + "  /  CT", D.a.tag + " / 反恐方", { x: M, y: 318, size: 30, f: "b6", track: 260, color: K.goldLight }));
        it.push(ISCC.pair(c, "NAME A", D.a.name, D.a.cn, { x: M - 6, y: 520, size: 250, f: "d9", track: 10, color: K.parchment }));
        it.push(ISCC.pair(c, "SCHOOL A", D.a.school, D.a.schoolCn, { x: M, y: 566, size: 28, f: "b6", track: 220, color: K.silver }));
        it.push(ISCC.pair(c, "TAG B", "T  /  " + D.b.tag, "恐怖方 / " + D.b.tag, { x: W - M, y: 588, size: 30, f: "b6", track: 260, color: K.black, just: "R" }));
        it.push(ISCC.pair(c, "NAME B", D.b.name, D.b.cn, { x: W - M + 6, y: 790, size: 250, f: "d9", track: 10, color: K.black, just: "R" }));
        it.push(ISCC.pair(c, "SCHOOL B", D.b.school, D.b.schoolCn, { x: W - M, y: 836, size: 28, f: "b6", track: 220, color: K.silver, just: "R" }));
        ln = ISCC.line(c, "DIVIDER", [cx + 120, 150], [cx - 120, 930], K.gold, 2, { so: 60 });
        vs = slab(c, "VS PLATE", cx - 90, 495, 180, 120, K.black, { op: 96 });
        it.push(ln, vs);
        it.push(ISCC.text(c, "VS", "VS", { x: cx, y: 590, size: 112, f: "d9", track: 40, color: K.gold, just: "C", eg: "VS" }));
        it.push(ISCC.hairH(c, "INFO RULE", M, 940, W - 2 * M, K.gold));
        it.push(ISCC.pair(c, "FORMAT", "BEST OF 3", "三局两胜", { x: M, y: 990, size: 30, f: "b6", track: 260, color: K.parchment }));
        it.push(ISCC.pair(c, "MAP", "MAP  /  ATRIUM", "地图 / 中庭", { x: cx, y: 990, size: 30, f: "b6", track: 260, color: K.parchment, just: "C" }));
        it.push(ISCC.pair(c, "DATE VENUE", "DATE  /  VENUE (PLACEHOLDER)", "日期 / 场馆（占位）", { x: W - M, y: 990, size: 30, f: "b6", track: 260, color: K.silver, just: "R" }));
        play(c, it, 0.2, { dy: 50 });
        done(c, 1.4);
    })();

    // ------------------------------------------------------------ Starting soon
    (function () {
        var c = screen("ISCC_Full_Starting_Soon", 20, "Pre-show screen with live countdown (digits cells). Slider Seconds = start value. IN 0, OUT 19.5.", "Slider Seconds (start value, default 300); Lang CN", [["Seconds", 300]], "BROADCAST", "直播"), it = [], d;
        c.out = 19.5;
        it.push(ISCC.pair(c, "TITLE", "STARTING SOON", "即将开始", { x: W / 2, y: 330, size: 190, f: "d9", track: 30, color: K.parchment, just: "C" }));
        it.push(ISCC.hairH(c, "RULE", W / 2 - 360, 380, 720, K.gold));
        d = ISCC.digits(c, "COUNTDOWN", W / 2, 700, 330, 150, sl("Seconds") + " - time", K.goldLight);
        it.push(d);
        it.push(ISCC.label(c, "UNIT", "MIN        SEC", "分          秒", W / 2, 770, { just: "C", size: 22 }));
        it.push(ISCC.pair(c, "VOICE", "Earn your crest.", "百炼成徽", { x: W / 2, y: 940, size: 44, f: "b6", track: 260, color: K.silver, just: "C" }));
        it.push(ISCC.spray(c, "SPRAY", 1740, 940, 0.4, { scale: 3, dotD: 10, stepFrames: 3, hold: 6 }));
        play(c, it, 0.2);
        done(c, 1.2);
    })();

    // ------------------------------------------------------------ Be right back
    (function () {
        var c = screen("ISCC_Full_Be_Right_Back", 12, "Break screen. IN 0, OUT 11.5.", "Side Colour; Lang CN", [], "BREAK", "休息"), it = [];
        it.push(ISCC.band(c, "SLAB", -400, 230, 1500, 560, "side", { op: 92 }));
        it.push(ISCC.pair(c, "TITLE L1", "BE RIGHT", "马上", { x: M, y: 540, size: 300, f: "d9", track: 20, color: K.parchment }));
        it.push(ISCC.pair(c, "TITLE L2", "BACK", "回来", { x: M, y: 800, size: 300, f: "d9", track: 20, color: K.goldLight }));
        it.push(ISCC.pair(c, "SUB", "THE NEXT MATCH IS BEING PREPARED", "下一场比赛准备中", { x: 1260, y: 380, size: 26, f: "b6", track: 240, color: K.silver }));
        it.push(ISCC.hairH(c, "RULE", 1260, 408, 560, K.gold));
        it.push(ISCC.arc(c, "ARC", [1280, 880], [1760, 700], 160, 0.5, 1.1, {}));
        play(c, it, 0.2, { dx: -80, dy: 0 });
        done(c, 1.0);
    })();

    // ------------------------------------------------------------ Tech pause
    (function () {
        var c = screen("ISCC_Full_Tech_Pause", 12, "Technical pause card with elapsed counter. IN 0, OUT 11.5.", "Slider Seconds (elapsed offset); Lang CN", [["Seconds", 0]], "MATCH STATUS", "比赛状态", "T"), it = [], d;
        it.push(slab(c, "PAUSE BAR 1", 960 - 120, 270, 90, 300, K.gold, { op: 100 }));
        it.push(slab(c, "PAUSE BAR 2", 960 + 30, 270, 90, 300, K.gold, { op: 100 }));
        it.push(ISCC.pair(c, "TITLE", "TECHNICAL PAUSE", "技术暂停", { x: W / 2, y: 700, size: 170, f: "d9", track: 30, color: K.parchment, just: "C" }));
        it.push(ISCC.pair(c, "BODY", "Play resumes once the issue is resolved.", "问题解决后比赛将继续。", { x: W / 2, y: 770, size: 32, f: "b4", track: 80, color: K.silver, just: "C", keep: true }));
        d = ISCC.digits(c, "ELAPSED", W / 2, 930, 110, 52, sl("Seconds") + " + time", K.goldLight);
        it.push(d);
        it.push(ISCC.label(c, "ELAPSED LABEL", "PAUSED FOR", "已暂停", W / 2 - 260, 920, { just: "R", size: 22 }));
        play(c, it, 0.2);
        done(c, 1.0);
    })();

    // ------------------------------------------------------------ Up next / schedule
    (function () {
        var c = screen("ISCC_Full_Up_Next_Schedule", 14, "Schedule: five rows (time, match, stage, status). IN 0, OUT 13.5.", "Edit rows; Lang CN", [], "SCHEDULE", "赛程"), it = [], rows, i, y, st;
        rows = [["14:00", "KESTRELS  VS  LANTERNS", "红隼队 对 灯笼队", "GROUP A  /  BO3", "A组 / 三局两胜", "LIVE", "直播中"],
                ["15:30", "TEAM C  VS  TEAM D", "C队 对 D队", "GROUP B  /  BO3", "B组 / 三局两胜", "NEXT", "下一场"],
                ["17:00", "TEAM E  VS  TEAM F", "E队 对 F队", "GROUP C  /  BO3", "C组 / 三局两胜", "LATER", "稍后"],
                ["18:30", "TEAM G  VS  TEAM H", "G队 对 H队", "GROUP D  /  BO3", "D组 / 三局两胜", "LATER", "稍后"],
                ["20:00", "SEMIFINAL  /  TBD", "半决赛 / 待定", "PLAYOFFS  /  BO3", "季后赛 / 三局两胜", "LATER", "稍后"]];
        for (i = 0; i < 5; i++) {
            y = 190 + i * 150; st = (i === 0);
            it.push([slab(c, "ROW " + (i + 1) + " PLATE", M, y, W - 2 * M, 130, K.black, { op: st ? 96 : 80 }),
                     ISCC.rect(c, "ROW " + (i + 1) + " BAR", M, y, 10, 130, st ? K.gold : (i === 1 ? "side" : K.silver)),
                     ISCC.text(c, "ROW " + (i + 1) + " TIME", rows[i][0], { x: M + 50, y: y + 88, size: 84, f: "d8", track: 20, color: st ? K.goldLight : K.parchment }),
                     ISCC.pair(c, "ROW " + (i + 1) + " MATCH", rows[i][1], rows[i][2], { x: M + 330, y: y + 82, size: 72, f: "d9", track: 20, color: K.parchment }),
                     ISCC.pair(c, "ROW " + (i + 1) + " STAGE", rows[i][3], rows[i][4], { x: M + 334, y: y + 114, size: 20, f: "b6", track: 240, color: K.silver }),
                     slab(c, "ROW " + (i + 1) + " CHIP", W - M - 230, y + 35, 190, 60, st ? K.gold : K.blue, { op: 100 }),
                     ISCC.pair(c, "ROW " + (i + 1) + " STATUS", rows[i][5], rows[i][6], { x: W - M - 135, y: y + 78, size: 34, f: "d9", track: 120, color: st ? K.black : K.parchment, just: "C" })]);
        }
        play(c, it, 0.2, { dx: -120 });
        done(c, 1.2);
    })();

    // ------------------------------------------------------------ Bracket 8
    (function () {
        var c = screen("ISCC_Full_Bracket_8", 14, "8-team single elimination bracket: quarter, semi, final, champion. Text slots are editable. IN 0, OUT 13.5.", "Team A/B Colour; edit slots; Lang CN", [], "BRACKET", "对阵表"), it = [], xs = [M, 620, 1144], w = 340, i, j, m, y, cy = [], names, sc, L, pl, cols = [[], [], []], p, cur, mid, rnd;
        names = [D.a.name, D.b.name, "TEAM C", "TEAM D", "TEAM E", "TEAM F", "TEAM G", "TEAM H"];
        rnd = [["QUARTERFINALS", "八强"], ["SEMIFINALS", "四强"], ["FINAL", "决赛"]];
        for (i = 0; i < 3; i++) { it.push(ISCC.label(c, "ROUND " + (i + 1), rnd[i][0], rnd[i][1], xs[i], 190, { size: 22, color: K.gold })); }
        // match top-y per round
        cols[0] = [210, 360, 510, 660]; cols[1] = [285, 585]; cols[2] = [435];
        for (i = 0; i < 3; i++) {
            for (j = 0; j < cols[i].length; j++) {
                y = cols[i][j];
                pl = slab(c, "R" + (i + 1) + "M" + (j + 1) + " PLATE", xs[i], y, w, 92, K.black, { op: 94 });
                it.push([pl, ISCC.hairH(c, "R" + (i + 1) + "M" + (j + 1) + " MID", xs[i], y + 46, w, K.silver, { op: 40 }),
                         ISCC.rect(c, "R" + (i + 1) + "M" + (j + 1) + " BAR", xs[i], y, 8, 92, (i === 0 && j === 0) ? ISCC.TEAMA : (i === 2 ? K.gold : K.silver))]);
                for (m = 0; m < 2; m++) {
                    it.push(ISCC.text(c, "R" + (i + 1) + "M" + (j + 1) + " T" + (m + 1), (i === 0) ? names[j * 2 + m] : (i === 1 ? "WINNER QF" + (j * 2 + m + 1) : "WINNER SF" + (m + 1)), { x: xs[i] + 28, y: y + 36 + m * 46, size: 30, f: "d9", track: 60, color: (i === 0 && j === 0 && m === 0) ? K.goldLight : K.parchment }));
                    it.push(ISCC.text(c, "R" + (i + 1) + "M" + (j + 1) + " S" + (m + 1), "-", { x: xs[i] + w - 20, y: y + 36 + m * 46, size: 30, f: "d8", just: "R", color: K.silver }));
                }
            }
        }
        // connectors
        L = ISCC.shapeLayer(c, "CONNECTORS");
        for (i = 0; i < 2; i++) {
            for (j = 0; j < cols[i + 1].length; j++) {
                p = [xs[i] + w, cols[i][j * 2] + 46]; cur = [xs[i] + w, cols[i][j * 2 + 1] + 46]; mid = xs[i] + w + 40; y = cols[i + 1][j] + 46;
                ISCC.addPath(L, [p, [mid, p[1]], [mid, cur[1]], cur], false, { stroke: K.gold, sw: 2, so: 55, gname: "pair " + i + j });
                ISCC.addPath(L, [[mid, y], [xs[i + 1], y]], false, { stroke: K.gold, sw: 2, so: 55, gname: "feed " + i + j });
            }
        }
        it.push(L);
        it.push(ISCC.pair(c, "CHAMPION LABEL", "CHAMPION", "冠军", { x: 1700, y: 700, size: 30, f: "b6", track: 260, color: K.gold, just: "C" }));
        it.push(ISCC.logo(c, "LOGO crest", 1700, 540, 260));
        it.push(ISCC.hairH(c, "CHAMPION RULE", 1560, 730, 280, K.gold));
        play(c, it, 0.15, { dy: 30 });
        done(c, 1.4);
    })();

    // ------------------------------------------------------------ Map veto full
    (function () {
        var sliders = [], i, c, it = [], x, y, cw = 420, ch = 360, st, n;
        for (i = 0; i < 7; i++) { sliders.push(["Cell " + (i + 1), [1, 3, 2, 4, 0, 0, 5][i]]); }
        c = screen("ISCC_Full_Map_Veto_Full", 14, "Full-screen veto: seven map cards + log. Cell sliders: 0 open, 1 ban A, 2 ban B, 3 pick A, 4 pick B, 5 decider. IN 0, OUT 13.5.", "Sliders Cell 1..7; Team A/B Colour; Lang CN", sliders, "MAP VETO", "地图选择");
        for (i = 0; i < 7; i++) {
            x = M + (i % 4) * (cw + 16); y = 190 + Math.floor(i / 4) * (ch + 16);
            st = "Math.round(" + sl("Cell " + (i + 1)) + ")";
            n = slab(c, "CARD " + (i + 1) + " PLATE", x, y, cw, ch, K.black, { op: 94 });
            ISCC.P(n, "op").expression = "var s = " + st + "; s === 1 || s === 2 ? 55 : 94;";
            it.push([n,
                ISCC.band(c, "CARD " + (i + 1) + " BEAM", x + 60 + (i % 3) * 40, y + 20, 70, ch - 40, K.blue, { op: 60 }),
                ISCC.rect(c, "CARD " + (i + 1) + " BAR", x, y, cw, 12, "var s = " + st + "; s === 1 || s === 3 ? " + ISCC.TEAMA + " : (s === 2 || s === 4 ? " + ISCC.TEAMB + " : (s === 5 ? [0.894, 0.812, 0.604, 1] : [0.604, 0.639, 0.698, 1]));"),
                ISCC.text(c, "CARD " + (i + 1) + " INDEX", "0" + (i + 1), { x: x + 24, y: y + 50, size: 22, f: "b6", track: 240, color: K.silver }),
                ISCC.pair(c, "CARD " + (i + 1) + " MAP", D.maps[i], D.mapsCn[i], { x: x + 24, y: y + 250, size: (D.maps[i].length > 9 ? 78 : 104), f: "d9", track: 10, color: K.parchment }),
                ISCC.pair(c, "CARD " + (i + 1) + " STATE", "OPEN", "待选", { x: x + 24, y: y + 322, size: 24, f: "b6", track: 240, color: K.gold,
                    expr: 'var s = ' + st + '; ["OPEN", "BAN  KES", "BAN  LAN", "PICK  KES", "PICK  LAN", "DECIDER"][Math.min(5, Math.max(0, s))];',
                    cnExpr: 'var s = ' + st + '; ["待选", "禁用 红隼", "禁用 灯笼", "选择 红隼", "选择 灯笼", "决胜图"][Math.min(5, Math.max(0, s))];' }),
                ISCC.line(c, "CARD " + (i + 1) + " STRIKE", [x + cw - 20, y + 30], [x + 20, y + ch - 30], K.parchment, 3)]);
            ISCC.P(it[it.length - 1][6], "op").expression = "var s = " + st + "; s === 1 || s === 2 ? 100 : 0;";
        }
        x = M + 3 * (cw + 16); y = 190 + ch + 16;
        it.push([slab(c, "LOG PLATE", x, y, cw, ch, K.black, { op: 70 }), ISCC.hairH(c, "LOG HAIR", x, y, cw, K.gold),
                 ISCC.label(c, "LOG LABEL", "VETO LOG", "选图记录", x + 24, y + 50, { size: 22, color: K.gold }),
                 ISCC.pair(c, "LOG 1", "1  KES BAN ARCHIVE", "1 红隼 禁 档案馆", { x: x + 24, y: y + 120, size: 24, f: "b6", track: 160, color: K.parchment }),
                 ISCC.pair(c, "LOG 2", "2  LAN BAN QUAD", "2 灯笼 禁 方庭", { x: x + 24, y: y + 170, size: 24, f: "b6", track: 160, color: K.parchment }),
                 ISCC.pair(c, "LOG 3", "3  KES PICK ATRIUM", "3 红隼 选 中庭", { x: x + 24, y: y + 220, size: 24, f: "b6", track: 160, color: K.parchment })]);
        play(c, it, 0.15, { dy: 60 });
        done(c, 1.4);
    })();

    // ------------------------------------------------------------ Player card
    function portrait(c, x, y, w, h, label) {
        var out = [];
        out.push(ISCC.rect(c, "PORTRAIT PLACEHOLDER", x, y, w, h, K.blue));
        out.push(ISCC.band(c, "PORTRAIT BEAM", x + w * 0.35, y, w * 0.2, h, K.blueLit, { op: 25 }));
        out.push(ISCC.hairH(c, "PORTRAIT HAIR", x, y, w, K.gold));
        out.push(ISCC.text(c, "PORTRAIT LABEL", label, { x: x + w / 2, y: y + h / 2, size: 26, f: "b6", track: 240, color: K.silver, just: "C", eg: false }));
        return out;
    }
    (function () {
        var c = screen("ISCC_Full_Player_Card", 10, "Player card: portrait placeholder solid, handle, bio, 6-stat grid. IN 0, OUT 9.5.", "Side Colour; edit text; Lang CN", [], "PLAYER", "选手"), it = [], i, st, x, y;
        st = [["1.32", "K/D", "击杀/死亡"], ["84.1", "ADR", "场均伤害"], ["47%", "HEADSHOT", "爆头率"], ["72%", "KAST", "贡献回合"], ["1.18", "RATING", "综合评分"], ["34", "MAPS", "地图数"]];
        it.push(portrait(c, M, 190, 560, 760, "PORTRAIT PLACEHOLDER  4:5"));
        it.push(ISCC.rect(c, "SIDE TICK", M + 560, 190, 14, 760, "side"));
        it.push(ISCC.pair(c, "TEAM", D.a.name + "  /  " + D.a.tag, D.a.cn + " / " + D.a.tag, { x: 720, y: 250, size: 28, f: "b6", track: 260, color: K.gold }));
        it.push(ISCC.text(c, "HANDLE", "kite", { x: 714, y: 440, size: 250, f: "d9", track: 10, color: K.parchment }));
        it.push(ISCC.pair(c, "BIO", "FIRST LAST  /  ENTRY  /  " + D.a.school, "姓名 / 突破手 / " + D.a.schoolCn, { x: 720, y: 500, size: 24, f: "b6", track: 200, color: K.silver }));
        for (i = 0; i < 6; i++) {
            x = 720 + (i % 3) * 366; y = 560 + Math.floor(i / 3) * 190;
            it.push([slab(c, "STAT " + (i + 1) + " PLATE", x, y, 350, 170, K.black, { op: 94 }), ISCC.hairH(c, "STAT " + (i + 1) + " HAIR", x, y, 350, K.gold, { so: 60 }),
                     ISCC.text(c, "STAT " + (i + 1) + " VALUE", st[i][0], { x: x + 24, y: y + 112, size: 110, f: "d8", track: 10, color: K.goldLight }),
                     ISCC.pair(c, "STAT " + (i + 1) + " LABEL", st[i][1], st[i][2], { x: x + 26, y: y + 150, size: 20, f: "b6", track: 240, color: K.silver })]);
        }
        play(c, it, 0.15, { dy: 50 });
        done(c, 1.2);
    })();

    // ------------------------------------------------------------ MVP card
    (function () {
        var c = screen("ISCC_Full_MVP_Card", 10, "MVP card: giant MVP, portrait placeholder, rating and key stats. IN 0, OUT 9.5.", "Side Colour; edit text; Lang CN", [], "MOST VALUABLE PLAYER", "最有价值选手", "T"), it = [], i, st = [["28", "KILLS", "击杀"], ["1.84", "RATING", "评分"], ["112", "ADR", "场均伤害"]];
        it.push(portrait(c, W - M - 560, 190, 560, 760, "MVP PORTRAIT PLACEHOLDER"));
        it.push(ISCC.rect(c, "SIDE TICK", W - M - 574, 190, 14, 760, "side"));
        it.push(ISCC.text(c, "MVP", "MVP", { x: M - 10, y: 600, size: 560, f: "d9", track: -10, color: K.gold, eg: "MVP" }));
        it.push(ISCC.text(c, "HANDLE", "ninefold", { x: M, y: 740, size: 140, f: "d9", track: 10, color: K.parchment }));
        it.push(ISCC.pair(c, "BIO", D.a.name + "  /  " + D.a.school, D.a.cn + " / " + D.a.schoolCn, { x: M + 4, y: 790, size: 24, f: "b6", track: 220, color: K.silver }));
        for (i = 0; i < 3; i++) {
            it.push([ISCC.hairV(c, "STAT " + (i + 1) + " RULE", M + i * 250, 850, 110, K.gold, { op: 70 }),
                     ISCC.text(c, "STAT " + (i + 1) + " VALUE", st[i][0], { x: M + 24 + i * 250, y: 920, size: 84, f: "d8", color: K.goldLight }),
                     ISCC.pair(c, "STAT " + (i + 1) + " LABEL", st[i][1], st[i][2], { x: M + 26 + i * 250, y: 954, size: 20, f: "b6", track: 240, color: K.silver })]);
        }
        play(c, it, 0.15, { dx: -90, dy: 0 });
        done(c, 1.2);
    })();

    // ------------------------------------------------------------ Stat compare
    (function () {
        var sliders = [], i, c, it = [], y, rows = [["ADR", "场均伤害"], ["K/D", "击杀/死亡"], ["OPENING DUELS WON", "首杀胜率"], ["CLUTCHES WON", "残局胜率"]], bw = 640, cx = W / 2, A, B, ex;
        for (i = 0; i < 4; i++) { sliders.push(["A" + (i + 1), [82, 64, 55, 70][i]]); sliders.push(["B" + (i + 1), [68, 74, 60, 45][i]]); }
        c = screen("ISCC_Full_Stat_Compare", 10, "Head-to-head bars driven by sliders A1-A4 / B1-B4 (0-100). IN 0, OUT 9.5.", "Sliders A1..A4, B1..B4; Team A/B Colour; Lang CN", sliders, "HEAD TO HEAD", "数据对比");
        it.push(ISCC.pair(c, "NAME A", D.a.name, D.a.cn, { x: cx - 60, y: 250, size: 110, f: "d9", track: 20, color: K.parchment, just: "R" }));
        it.push(ISCC.pair(c, "NAME B", D.b.name, D.b.cn, { x: cx + 60, y: 250, size: 110, f: "d9", track: 20, color: K.parchment }));
        it.push(ISCC.hairV(c, "AXIS", cx - 1, 280, 650, K.gold, { op: 70 }));
        for (i = 0; i < 4; i++) {
            y = 340 + i * 160;
            A = ISCC.rect(c, "BAR A" + (i + 1), cx - 30 - bw, y, bw, 44, ISCC.TEAMA);
            ISCC.P(A, "anc").setValue([bw, 0]); ISCC.P(A, "pos").setValue([cx - 30, y]);
            ISCC.P(A, "sc").expression = "[Math.max(0, Math.min(100, " + sl("A" + (i + 1)) + ")), 100];";
            B = ISCC.rect(c, "BAR B" + (i + 1), cx + 30, y, bw, 44, ISCC.TEAMB);
            ISCC.P(B, "sc").expression = "[Math.max(0, Math.min(100, " + sl("B" + (i + 1)) + ")), 100];";
            it.push([ISCC.pair(c, "LABEL " + (i + 1), rows[i][0], rows[i][1], { x: cx, y: y - 22, size: 22, f: "b6", track: 240, color: K.silver, just: "C" }),
                     ISCC.rect(c, "TRACK A" + (i + 1), cx - 30 - bw, y + 52, bw, 2, K.silver, { op: 25 }),
                     ISCC.rect(c, "TRACK B" + (i + 1), cx + 30, y + 52, bw, 2, K.silver, { op: 25 }), A, B,
                     ISCC.text(c, "VALUE A" + (i + 1), "0", { x: cx - 30 - bw - 24, y: y + 40, size: 56, f: "d8", just: "R", color: K.parchment, expr: 'Math.round(' + sl("A" + (i + 1)) + ') + "";' }),
                     ISCC.text(c, "VALUE B" + (i + 1), "0", { x: cx + 30 + bw + 24, y: y + 40, size: 56, f: "d8", color: K.parchment, expr: 'Math.round(' + sl("B" + (i + 1)) + ') + "";' })]);
        }
        play(c, it, 0.15, { dy: 30 });
        done(c, 1.4);
    })();

    // ------------------------------------------------------------ Results card
    (function () {
        var c = screen("ISCC_Full_Results_Card", 10, "Final result: series score and per-map results. IN 0, OUT 9.5.", "Sliders Score A / Score B; Team A/B Colour; Lang CN", [["Score A", 2], ["Score B", 1]], "FINAL RESULT", "最终结果"), it = [], i, maps = [["ATRIUM", "中庭", "13 - 9"], ["ARCHIVE", "档案馆", "10 - 13"], ["QUAD", "方庭", "13 - 7"]], y;
        it.push(ISCC.band(c, "SLAB", -300, 200, 1100, 380, ISCC.TEAMA, { op: 88 }));
        it.push(ISCC.pair(c, "WINNER", D.a.name, D.a.cn, { x: M, y: 450, size: 210, f: "d9", track: 10, color: K.parchment }));
        it.push(ISCC.pair(c, "LOSER", D.b.name, D.b.cn, { x: W - M, y: 450, size: 210, f: "d9", track: 10, color: K.silver, just: "R" }));
        it.push(ISCC.text(c, "SCORE", "2 - 1", { x: W / 2, y: 720, size: 360, f: "d8", track: 10, just: "C", color: K.goldLight, expr: 'Math.round(' + sl("Score A") + ') + " - " + Math.round(' + sl("Score B") + ');' }));
        it.push(ISCC.pair(c, "WINS", "WINS THE SERIES", "赢得系列赛", { x: M, y: 500, size: 28, f: "b6", track: 260, color: K.goldLight }));
        for (i = 0; i < 3; i++) {
            y = 810 + i * 70;
            it.push([ISCC.hairH(c, "MAP " + (i + 1) + " RULE", M, y, W - 2 * M, K.gold, { so: 40 }),
                     ISCC.pair(c, "MAP " + (i + 1) + " NAME", "MAP " + (i + 1) + "  /  " + maps[i][0], "第" + (i + 1) + "张 / " + maps[i][1], { x: M, y: y + 48, size: 30, f: "b6", track: 220, color: K.silver }),
                     ISCC.text(c, "MAP " + (i + 1) + " SCORE", maps[i][2], { x: W - M, y: y + 50, size: 52, f: "d8", just: "R", color: K.parchment })]);
        }
        play(c, it, 0.15, { dy: 40 });
        done(c, 1.4);
    })();

    // ------------------------------------------------------------ Thanks / GG
    (function () {
        var c = screen("ISCC_Full_Thanks_GG", 8, "End card: 百炼成徽, thank-you line, voice line, logo. IN 0, OUT 7.5.", "Side Colour; Lang CN", [], "", "", "T"), it = [], g, lg;
        c.out = 7.5;
        lg = ISCC.logo(c, "LOGO", W / 2, 250, 200);
        it.push(lg);
        g = ISCC.text(c, "GG", "GG", { x: W / 2, y: 330, size: 24, f: "b6", track: 260, color: K.gold, just: "C" });
        it.push(ISCC.pair(c, "HERO", "EARN YOUR CREST", "百炼成徽", { x: W / 2, y: 700, size: 400, f: "d9", track: 20, color: K.parchment, just: "C", cnScale: 0.96 }));
        it.push(ISCC.hairH(c, "RULE", W / 2 - 300, 760, 600, K.gold));
        it.push(ISCC.pair(c, "THANKS", "THANK YOU FOR WATCHING  /  GG", "感谢收看 / GG", { x: W / 2, y: 840, size: 40, f: "b6", track: 260, color: K.goldLight, just: "C" }));
        it.push(ISCC.pair(c, "VOICE", "One cup. Every nation.", "金杯为证，万国同场", { x: W / 2, y: 930, size: 34, f: "b6", track: 240, color: K.silver, just: "C" }));
        play(c, it, 0.15, { dy: 50 });
        done(c, 1.4);
    })();
}

if (typeof ISCC_BUILD_ALL === "undefined") { ISCC.runStandalone(ISCC_buildFullScreens, "Full Screens"); }

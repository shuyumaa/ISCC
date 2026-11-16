//@target aftereffects
// =====================================================================
// ISCC_Build_All.jsx  -  File > Scripts > Run Script File...
// Builds the complete ISCC broadcast template project in ONE undo group.
// Install the fonts in kit/fonts/ first. Run on a new, empty project.
// =====================================================================
var ISCC_BUILD_ALL = true;
#include "ISCC_Lib.jsxinc"
#include "ISCC_Transitions.jsx"
#include "ISCC_LowerThirds.jsx"
#include "ISCC_InGame.jsx"
#include "ISCC_FullScreens.jsx"
#include "ISCC_Ads.jsx"
#include "ISCC_Elements.jsx"

(function () {
    // ---- CONFIG: frame rate switch (60 / 50 / 30) ----
    ISCC.CFG.fps = 60;
    // --------------------------------------------------
    var t0 = new Date().getTime(), msg, famCount, err = null;
    app.beginUndoGroup("ISCC Build All");
    try {
        ISCC.setup();
        ISCC_buildElements();     // elements first so they exist for reference
        ISCC_buildTransitions();
        ISCC_buildLowerThirds();
        ISCC_buildInGame();
        ISCC_buildFullScreens();
        ISCC_buildAds();
    } catch (e) {
        err = e;
    }
    app.endUndoGroup();
    if (err) {
        alert("ISCC build FAILED: " + err.toString() + (err.line ? " (line " + err.line + ")" : "") + "\nBuilt so far: " + ISCC.built.length + " comps.");
        if (typeof ISCC_DEBUG_RETHROW !== "undefined") { throw err; }
        return;
    }
    famCount = {};
    var i, k, lines = [];
    for (i = 0; i < ISCC.built.length; i++) { k = ISCC.built[i].family; famCount[k] = (famCount[k] || 0) + 1; }
    for (k in ISCC.FOLDERS) { if (famCount[k]) { lines.push(ISCC.FOLDERS[k] + ": " + famCount[k]); } }
    msg = "ISCC build complete: " + ISCC.built.length + " comps at " + ISCC.CFG.fps + " fps in " + Math.round((new Date().getTime() - t0) / 1000) + " s.\n\n" + lines.join("\n");
    msg += "\n\nSwap the logo once inside the precomp '" + ISCC.CFG.logoCompName + "' (folder 00 CONTROL).";
    if (ISCC.notes.length) { msg += "\n\nNotes:\n- " + ISCC.notes.join("\n- "); }
    alert(msg);
})();

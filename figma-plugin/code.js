/* Goals System — Colour Tokens
 *
 * Generates the colour system into this Figma file:
 *   Primitives      — neutral ramp + every category/signal value, both modes
 *   Semantic Light  — surfaces, borders, text, categories, signals (aliases)
 *   Semantic Dark   — same names, dark values
 *   "Colour system" page — a live swatch sheet bound to the variables
 *
 * Safe to run repeatedly. Existing collections are reused; only missing
 * variables are created. The swatch page is rebuilt each run.
 *
 * Retuning: change a number in the RECIPE block, run again.
 *
 * Two menu commands:
 *   Generate colour tokens — code → Figma (everything above EXPORT)
 *   Export tokens to JSON  — Figma → code (the EXPORT section)
 */

/* ------------------------------------------------------------------ */
/* RECIPE                                                              */
/* ------------------------------------------------------------------ */

var NEUTRAL = {
  steps: [25, 50,   100,  200, 300, 400, 500, 600, 700, 800, 900, 950],
  L:     [100, 96.4, 93.5, 87,  78,  67,  55,  44,  34,  28,  20,  12],

  hueLight: 81,    // cream — the warm end
  hueDark: 216,    // slate — the cool end

  // The ramp does NOT drift evenly between the two hues. An even drift spends
  // the middle of the ramp inside the olive band (H 100-165) at peak chroma,
  // which is what made the mid greys read khaki and the dark surfaces green.
  // Instead the cream hue HOLDS down to crossStart, swings across in one move,
  // and is locked to the dark hue from crossEnd down.
  crossStart: 80,
  crossEnd: 48,

  // n-100 at L 93.5 is not arbitrary: cards are n-25 (pure white) and the
  // system requires 1.2:1 between card and page. That lands at 1.21. Lighten
  // it and the guarantee below fails - there is no headroom, because a card
  // cannot get lighter than white.

  // Chroma control points as [L, C], interpolated piecewise across lightness.
  // The waist at L 67 is the whole trick: it sits exactly where the hue
  // crossing happens, so the ramp passes through the olive hues at almost no
  // chroma and the transition is invisible.
  chromaStops: [
    [100, 0.0],    [96.4, 0.0090], [93.5, 0.0125], [87, 0.0130],
    [78,  0.0100], [67,   0.0050], [55,   0.0080], [44, 0.0245],
    [34,  0.0353], [28,   0.0390], [20,   0.0430], [12, 0.0360]
  ]
};

var TIERS = {
  // Dark backgrounds sit at L42 for both tiers: well above the dark card
  // (neutral-800, L28) so a chip reads as a chip, and still far below the
  // fills so it never competes with the progress bar.
  bright: { fillL: 56, fillD: 74, bgL: [95, 0.035], bgD: [42, 0.07] },
  deep:   { fillL: 48, fillD: 64, bgL: [90, 0.060], bgD: [42, 0.08] }
};

var CHROMA_CAP = 0.18;      // ceiling on fill saturation
var SIGNAL_TEXT = { L_light: 47, L_dark: 75, C: 0.16 };

// Hue positions chosen by maximising the smallest visible gap between
// any two categories, in both modes. Tiers alternate around the wheel.
var CATEGORIES = [
  ["poppy",     24, "bright"],
  ["ochre",     66, "deep"],
  ["olive",    102, "bright"],
  ["fern",     135, "deep"],
  ["jade",     165, "bright"],
  ["lagoon",   198, "deep"],
  ["azure",    234, "bright"],
  ["cobalt",   258, "deep"],
  ["iris",     288, "bright"],
  ["orchid",   312, "deep"],
  ["fuchsia",  333, "bright"],
  ["crimson",  357, "deep"]
];

var SIGNALS = [["lime", 124], ["ember", 43]];

// Semantic layer: token name -> primitive name, per mode.
function semanticMap(dark) {
  var m = dark
    ? {
        "surface/ground":   "neutral/900",
        "surface/raised":   "neutral/800",
        "surface/sunken":   "neutral/950",
        "surface/track":    "neutral/900",
        "border/subtle":    "neutral/700",
        "border/default":   "neutral/600",
        "text/primary":     "neutral/50",
        "text/secondary":   "neutral/200",
        "text/muted":       "neutral/300"
      }
    : {
        "surface/ground":   "neutral/100",
        "surface/raised":   "neutral/25",
        "surface/sunken":   "neutral/200",
        "surface/track":    "neutral/100",
        "border/subtle":    "neutral/200",
        "border/default":   "neutral/300",
        "text/primary":     "neutral/900",
        "text/secondary":   "neutral/700",
        "text/muted":       "neutral/600"
      };
  var suffix = dark ? "-dark" : "-light";
  CATEGORIES.forEach(function (c) {
    m["category/" + c[0] + "/fill"] = "category/" + c[0] + "/fill" + suffix;
    m["category/" + c[0] + "/bg"]   = "category/" + c[0] + "/bg" + suffix;
  });
  [["success", "lime"], ["danger", "ember"]].forEach(function (s) {
    m["signal/" + s[0] + "/fill"] = "signal/" + s[1] + "/fill" + suffix;
    m["signal/" + s[0] + "/bg"]   = "signal/" + s[1] + "/bg" + suffix;
    m["signal/" + s[0] + "/text"] = "signal/" + s[1] + "/text" + suffix;
  });
  return m;
}

var SCOPES = {
  fill:   ["FRAME_FILL", "SHAPE_FILL"],
  stroke: ["STROKE_COLOR"],
  text:   ["TEXT_FILL"]
};

function scopeFor(name) {
  if (name.indexOf("border/") === 0) return SCOPES.stroke;
  if (name.indexOf("text/") === 0) return SCOPES.text;
  if (name.slice(-5) === "/text") return SCOPES.text;
  return SCOPES.fill;
}

/* ------------------------------------------------------------------ */
/* OKLCH → sRGB                                                        */
/* ------------------------------------------------------------------ */

function oklchRGB(L, C, H) {
  L = L / 100;
  var h = H * Math.PI / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  var l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  var m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  var s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  var l = l_ * l_ * l_, m = m_ * m_ * m_, s = s_ * s_ * s_;
  return [
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ];
}
function gamma(x) {
  x = Math.max(0, Math.min(1, x));
  return x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055;
}
function rgba(L, C, H) {
  var v = oklchRGB(L, C, H);
  return { r: gamma(v[0]), g: gamma(v[1]), b: gamma(v[2]), a: 1 };
}
function hexOf(c) {
  function p(x) { var s = Math.round(x * 255).toString(16); return s.length < 2 ? "0" + s : s; }
  return "#" + p(c.r) + p(c.g) + p(c.b);
}
function inGamut(L, C, H) {
  return oklchRGB(L, C, H).every(function (x) { return x >= -0.001 && x <= 1.001; });
}
function maxChroma(L, H) {
  var lo = 0, hi = 0.45;
  for (var i = 0; i < 22; i++) { var m = (lo + hi) / 2; if (inGamut(L, m, H)) lo = m; else hi = m; }
  return lo;
}

function neutralChroma(L) {
  var s = NEUTRAL.chromaStops;
  if (L >= s[0][0]) return s[0][1];
  for (var i = 0; i < s.length - 1; i++) {
    var L1 = s[i][0], C1 = s[i][1], L2 = s[i + 1][0], C2 = s[i + 1][1];
    if (L <= L1 && L >= L2) return C1 + (C2 - C1) * ((L1 - L) / (L1 - L2));
  }
  return s[s.length - 1][1];
}

/* Cream holds, then crosses once. smoothstep keeps the swing from kinking. */
function neutralHue(L) {
  var s = Math.max(0, Math.min(1,
    (NEUTRAL.crossStart - L) / (NEUTRAL.crossStart - NEUTRAL.crossEnd)));
  return NEUTRAL.hueLight + (NEUTRAL.hueDark - NEUTRAL.hueLight) * (s * s * (3 - 2 * s));
}

function neutralAt(i) {
  var L = NEUTRAL.L[i], H = neutralHue(L);
  return rgba(L, Math.min(neutralChroma(L), 0.94 * maxChroma(L, H)), H);
}
function fillAt(H, tier, dark) {
  var L = dark ? TIERS[tier].fillD : TIERS[tier].fillL;
  return rgba(L, Math.min(CHROMA_CAP, 0.94 * maxChroma(L, H)), H);
}
function bgAt(H, tier, dark) {
  var s = dark ? TIERS[tier].bgD : TIERS[tier].bgL;
  return rgba(s[0], s[1], H);
}

/* Every primitive, name -> colour. The variables are written from this, and
 * the contrast checks are computed from it, so the documented numbers are the
 * ones the tokens actually hold. */
function primitiveTable() {
  var p = {};
  NEUTRAL.steps.forEach(function (s, i) { p["neutral/" + s] = neutralAt(i); });
  CATEGORIES.forEach(function (c) {
    p["category/" + c[0] + "/fill-light"] = fillAt(c[1], c[2], false);
    p["category/" + c[0] + "/fill-dark"]  = fillAt(c[1], c[2], true);
    p["category/" + c[0] + "/bg-light"]   = bgAt(c[1], c[2], false);
    p["category/" + c[0] + "/bg-dark"]    = bgAt(c[1], c[2], true);
  });
  SIGNALS.forEach(function (s) {
    p["signal/" + s[0] + "/fill-light"] = fillAt(s[1], "bright", false);
    p["signal/" + s[0] + "/fill-dark"]  = fillAt(s[1], "bright", true);
    p["signal/" + s[0] + "/bg-light"]   = bgAt(s[1], "bright", false);
    p["signal/" + s[0] + "/bg-dark"]    = bgAt(s[1], "bright", true);
    p["signal/" + s[0] + "/text-light"] = rgba(SIGNAL_TEXT.L_light, SIGNAL_TEXT.C, s[1]);
    p["signal/" + s[0] + "/text-dark"]  = rgba(SIGNAL_TEXT.L_dark,  SIGNAL_TEXT.C, s[1]);
  });
  return p;
}

/* ------------------------------------------------------------------ */
/* CONTRAST                                                            */
/* ------------------------------------------------------------------ */

function relLum(c) {
  function f(x) { return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4); }
  return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
}
function contrast(a, b) {
  var x = relLum(a), y = relLum(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* The guarantees, computed for one theme. Same list the repo's build asserts. */
function guarantees(dark) {
  var P = primitiveTable(), map = semanticMap(dark);
  var v = function (token) { return P[map[token]]; };
  var worst = function (fn) {
    return CATEGORIES.reduce(function (m, c) { return Math.min(m, fn(c)); }, 99);
  };
  var sig = function (fn) {
    return SIGNALS.reduce(function (m, s) { return Math.min(m, fn(s)); }, 99);
  };
  return [
    ["Card lifts off the page",            contrast(v("surface/raised"), v("surface/ground")), 1.2],
    ["Well recesses into the card",        contrast(v("surface/sunken"), v("surface/raised")), 1.2],
    ["Track reads inside the card",        contrast(v("surface/track"),  v("surface/raised")), 1.2],
    ["Body text on the page",              contrast(v("text/primary"),   v("surface/ground")), 4.5],
    ["Secondary text on a card",           contrast(v("text/secondary"), v("surface/raised")), 4.5],
    ["Muted text on the page",             contrast(v("text/muted"),     v("surface/ground")), 4.5],
    ["Muted text on a card",               contrast(v("text/muted"),     v("surface/raised")), 4.5],
    ["Quietest category bar on its track", worst(function (c) {
        return contrast(v("category/" + c[0] + "/fill"), v("surface/track")); }), 3],
    ["Ink on the quietest category tint",  worst(function (c) {
        return contrast(v("text/primary"), v("category/" + c[0] + "/bg")); }), 4.5],
    ["Signal text on the page",            sig(function (s) {
        return contrast(v("signal/" + (s[0] === "lime" ? "success" : "danger") + "/text"), v("surface/ground")); }), 4.5],
    ["Signal text on its own tint",        sig(function (s) {
        var role = s[0] === "lime" ? "success" : "danger";
        return contrast(v("signal/" + role + "/text"), v("signal/" + role + "/bg")); }), 4.5]
  ];
}

/* ------------------------------------------------------------------ */
/* VARIABLES                                                           */
/* ------------------------------------------------------------------ */

async function getOrCreateCollection(name, modeName) {
  var all = await figma.variables.getLocalVariableCollectionsAsync();
  var found = all.filter(function (c) { return c.name === name; })[0];
  if (found) return { collection: found, modeId: found.modes[0].modeId, created: false };
  var c = figma.variables.createVariableCollection(name);
  c.renameMode(c.modes[0].modeId, modeName);
  return { collection: c, modeId: c.modes[0].modeId, created: true };
}

async function variablesIn(collectionId) {
  var all = await figma.variables.getLocalVariablesAsync();
  var byName = {};
  all.forEach(function (v) { if (v.variableCollectionId === collectionId) byName[v.name] = v; });
  return byName;
}

async function buildPrimitives() {
  var r = await getOrCreateCollection("Primitives", "Value");
  var existing = await variablesIn(r.collection.id);
  var added = 0;

  function put(name, value) {
    var v = existing[name];
    if (!v) {
      v = figma.variables.createVariable(name, r.collection, "COLOR");
      existing[name] = v;
      added++;
    }
    v.setValueForMode(r.modeId, value);
    v.scopes = [];   // primitives never appear in pickers — semantic tokens only
  }

  var table = primitiveTable();
  Object.keys(table).forEach(function (name) { put(name, table[name]); });

  return { collection: r.collection, vars: existing, added: added };
}

async function buildSemantic(name, modeName, dark, primitives) {
  var r = await getOrCreateCollection(name, modeName);
  var existing = await variablesIn(r.collection.id);
  var map = semanticMap(dark);
  var added = 0, missing = [];

  Object.keys(map).forEach(function (token) {
    var src = primitives[map[token]];
    if (!src) { missing.push(map[token]); return; }
    var v = existing[token];
    if (!v) {
      v = figma.variables.createVariable(token, r.collection, "COLOR");
      existing[token] = v;
      added++;
    }
    v.setValueForMode(r.modeId, { type: "VARIABLE_ALIAS", id: src.id });
    v.scopes = scopeFor(token);
    v.setVariableCodeSyntax("WEB", "var(--" + token.replace(/[\s\/]+/g, "-") + ")");
  });

  return { collection: r.collection, vars: existing, added: added, missing: missing };
}

/* ------------------------------------------------------------------ */
/* SWATCH PAGE                                                         */
/* ------------------------------------------------------------------ */

var FONT = { family: "Inter", style: "Regular" };
var FONT_MED = { family: "Inter", style: "Medium" };

async function loadFonts() {
  try {
    await figma.loadFontAsync(FONT);
    await figma.loadFontAsync(FONT_MED);
  } catch (e) {
    var avail = await figma.listAvailableFontsAsync();
    FONT = avail[0].fontName;
    FONT_MED = avail[0].fontName;
    await figma.loadFontAsync(FONT);
  }
}

function paintOf(v) {
  return figma.variables.setBoundVariableForPaint(
    { type: "SOLID", color: { r: 0, g: 0, b: 0 } }, "color", v
  );
}
function solid(c) {
  return { type: "SOLID", color: { r: c.r, g: c.g, b: c.b } };
}

function text(chars, size, bold, fillPaint) {
  var t = figma.createText();
  t.fontName = bold ? FONT_MED : FONT;
  t.characters = chars;
  t.fontSize = size;
  t.lineHeight = { unit: "PERCENT", value: 130 };
  if (fillPaint) t.fills = [fillPaint];
  return t;
}

function column(gap) {
  var f = figma.createFrame();
  f.layoutMode = "VERTICAL";
  f.primaryAxisSizingMode = "AUTO";
  f.counterAxisSizingMode = "AUTO";
  f.itemSpacing = gap;
  f.fills = [];
  return f;
}
function row(gap) {
  var f = column(gap);
  f.layoutMode = "HORIZONTAL";
  return f;
}

async function buildPage(prim, light, dark) {
  var pages = figma.root.children.filter(function (p) { return p.name === "Colour system"; });
  var page = pages[0];
  if (!page) { page = figma.createPage(); page.name = "Colour system"; }
  if (figma.setCurrentPageAsync) await figma.setCurrentPageAsync(page);
  else figma.currentPage = page;
  page.children.slice().forEach(function (n) { n.remove(); });

  var root = column(56);
  root.name = "Colour system";
  root.paddingTop = root.paddingBottom = root.paddingLeft = root.paddingRight = 64;
  root.fills = [paintOf(light.vars["surface/raised"])];
  root.x = 0; root.y = 0;
  page.appendChild(root);

  var ink = paintOf(light.vars["text/primary"]);
  var muted = paintOf(light.vars["text/muted"]);

  root.appendChild(text("Colour system", 34, true, ink));
  root.appendChild(text(
    "One ramp for the neutral. Everything else generated from a hue and a tier.\n" +
    "Primitives are hidden from pickers — paint with the semantic tokens.",
    14, false, muted));

  /* --- neutral ramp --- */
  root.appendChild(text("Neutral ramp", 18, true, ink));
  var ramp = row(0);
  ramp.name = "Neutral ramp";
  root.appendChild(ramp);
  NEUTRAL.steps.forEach(function (s, i) {
    var col = column(8);
    ramp.appendChild(col);
    var sw = figma.createRectangle();
    sw.resize(88, 88);
    sw.fills = [paintOf(prim.vars["neutral/" + s])];
    col.appendChild(sw);
    var lbl = column(2);
    lbl.paddingLeft = 2;
    col.appendChild(lbl);
    lbl.appendChild(text("n-" + s, 11, true, ink));
    lbl.appendChild(text(hexOf(neutralAt(i)).toUpperCase(), 10, false, muted));
  });

  /* --- categories --- */
  root.appendChild(text("Twelve categories · light and dark", 18, true, ink));
  var grid = row(12);
  grid.name = "Categories";
  grid.layoutWrap = "WRAP";
  grid.counterAxisSpacing = 12;
  root.appendChild(grid);
  grid.layoutSizingHorizontal = "FIXED";
  grid.resize(1180, grid.height);

  function chip(name, tokenBase, coll) {
    var half = column(8);
    half.paddingTop = half.paddingBottom = half.paddingLeft = half.paddingRight = 12;
    half.fills = [paintOf(coll.vars["surface/ground"])];

    var tint = column(0);
    tint.paddingTop = tint.paddingBottom = 6;
    tint.paddingLeft = tint.paddingRight = 8;
    tint.fills = [paintOf(coll.vars[tokenBase + "/bg"])];
    half.appendChild(tint);
    tint.layoutSizingHorizontal = "FILL";
    tint.appendChild(text(name, 12, true, paintOf(coll.vars["text/primary"])));

    var bar = figma.createRectangle();
    bar.resize(120, 8);
    bar.fills = [paintOf(coll.vars[tokenBase + "/fill"])];
    half.appendChild(bar);
    bar.layoutSizingHorizontal = "FILL";

    return half;
  }

  CATEGORIES.forEach(function (c) {
    var card = row(0);
    card.name = c[0];
    card.strokes = [paintOf(light.vars["border/default"])];
    card.strokeWeight = 1;
    grid.appendChild(card);
    card.layoutSizingHorizontal = "FIXED";
    card.resize(280, card.height);

    var l = chip(c[0] + " · " + c[2], "category/" + c[0], light);
    card.appendChild(l);
    l.layoutSizingHorizontal = "FILL";
    var d = chip(c[0] + " · " + c[2], "category/" + c[0], dark);
    card.appendChild(d);
    d.layoutSizingHorizontal = "FILL";
  });

  /* --- signals --- */
  root.appendChild(text("Signals — messages only, never a permanent chip", 18, true, ink));
  var sigRow = row(12);
  sigRow.name = "Signals";
  root.appendChild(sigRow);

  [["success", "Done — 4 of 4"], ["danger", "Missed this week"]].forEach(function (s) {
    var card = row(0);
    card.name = s[0];
    card.strokes = [paintOf(light.vars["border/default"])];
    card.strokeWeight = 1;
    sigRow.appendChild(card);
    card.layoutSizingHorizontal = "FIXED";
    card.resize(420, card.height);

    [[light, false], [dark, true]].forEach(function (pair) {
      var coll = pair[0];
      var half = column(8);
      half.paddingTop = half.paddingBottom = half.paddingLeft = half.paddingRight = 14;
      half.fills = [paintOf(coll.vars["surface/ground"])];
      card.appendChild(half);
      half.layoutSizingHorizontal = "FILL";

      var msg = row(10);
      msg.paddingTop = msg.paddingBottom = 8;
      msg.paddingLeft = msg.paddingRight = 10;
      msg.fills = [paintOf(coll.vars["signal/" + s[0] + "/bg"])];
      half.appendChild(msg);
      msg.layoutSizingHorizontal = "FILL";

      var bar = figma.createRectangle();
      bar.resize(3, 18);
      bar.fills = [paintOf(coll.vars["signal/" + s[0] + "/fill"])];
      msg.appendChild(bar);

      msg.appendChild(text(s[1], 12, true, paintOf(coll.vars["signal/" + s[0] + "/text"])));
    });
  });

  /* --- semantic layer, documented --- */
  root.appendChild(text("The semantic layer", 18, true, ink));
  root.appendChild(text(
    "Every token here is an alias. The left swatch is the semantic variable, the right one is the\n" +
    "primitive it points at — they match because one consumes the other. Change a primitive and\n" +
    "both move together; that is the whole reason for the indirection.",
    14, false, muted));

  var semRow = row(16);
  semRow.name = "Semantic layer";
  root.appendChild(semRow);
  semRow.appendChild(semanticColumn("Light", light, prim, false));
  semRow.appendChild(semanticColumn("Dark", dark, prim, true));

  function semanticColumn(label, coll, primitives, isDark) {
    var map = semanticMap(isDark);
    var col = column(9);
    col.name = "Semantic · " + label;
    col.paddingTop = col.paddingBottom = col.paddingLeft = col.paddingRight = 20;
    col.fills = [paintOf(coll.vars["surface/raised"])];
    col.strokes = [paintOf(coll.vars["border/default"])];
    col.strokeWeight = 1;

    var ink2 = paintOf(coll.vars["text/primary"]);
    var mute2 = paintOf(coll.vars["text/muted"]);

    col.appendChild(text(label, 14, true, ink2));

    var groups = [
      ["chrome", function (t) {
        return t.indexOf("surface/") === 0 || t.indexOf("border/") === 0 || t.indexOf("text/") === 0;
      }],
      ["categories", function (t) { return t.indexOf("category/") === 0; }],
      ["signals", function (t) { return t.indexOf("signal/") === 0; }]
    ];

    groups.forEach(function (g) {
      var head = text(g[0].toUpperCase(), 10, true, mute2);
      head.letterSpacing = { unit: "PERCENT", value: 8 };
      col.appendChild(head);

      Object.keys(map).filter(g[1]).forEach(function (token) {
        var r = row(9);
        r.counterAxisAlignItems = "CENTER";
        col.appendChild(r);

        var a = figma.createRectangle();
        a.resize(26, 18);
        a.fills = [paintOf(coll.vars[token])];
        r.appendChild(a);

        var tn = text(token, 11, false, ink2);
        tn.textAutoResize = "HEIGHT";
        r.appendChild(tn);
        tn.resize(158, tn.height);

        r.appendChild(text("→", 11, false, mute2));

        var b = figma.createRectangle();
        b.resize(26, 18);
        b.fills = [paintOf(primitives.vars[map[token]])];
        r.appendChild(b);

        var pn = text(map[token], 11, false, mute2);
        pn.textAutoResize = "HEIGHT";
        r.appendChild(pn);
        pn.resize(150, pn.height);
      });
    });

    return col;
  }

  /* --- the guarantees --- */
  root.appendChild(text("What the system promises", 18, true, ink));
  root.appendChild(text(
    "Recomputed every time this page is generated, from the same numbers the variables get —\n" +
    "so these can't drift from what the tokens actually hold. The repo's build asserts the same\n" +
    "list and fails if a retune breaks one.",
    14, false, muted));

  var L = guarantees(false), D = guarantees(true);
  var okPaint = paintOf(light.vars["signal/success/text"]);
  var noPaint = paintOf(light.vars["signal/danger/text"]);

  var tbl = column(0);
  tbl.name = "Guarantees";
  tbl.fills = [paintOf(light.vars["surface/raised"])];
  tbl.strokes = [paintOf(light.vars["border/default"])];
  tbl.strokeWeight = 1;
  root.appendChild(tbl);

  function cell(t, size, bold, paint, w, alignRight) {
    var n = text(t, size, bold, paint);
    n.textAutoResize = "HEIGHT";
    if (alignRight) n.textAlignHorizontal = "RIGHT";
    return { node: n, w: w };
  }
  function tableRow(cells, bg) {
    var r = row(14);
    r.counterAxisAlignItems = "CENTER";
    r.paddingTop = r.paddingBottom = 9;
    r.paddingLeft = r.paddingRight = 18;
    if (bg) r.fills = [bg];
    tbl.appendChild(r);
    cells.forEach(function (c) {
      r.appendChild(c.node);
      c.node.resize(c.w, c.node.height);
    });
    return r;
  }

  tableRow([
    cell("Check", 10, true, muted, 300),
    cell("NEEDS", 10, true, muted, 54, true),
    cell("LIGHT", 10, true, muted, 62, true),
    cell("DARK", 10, true, muted, 62, true)
  ], paintOf(light.vars["surface/sunken"]));

  L.forEach(function (rowL, i) {
    var rowD = D[i];
    var okL = rowL[1] >= rowL[2], okD = rowD[1] >= rowD[2];
    tableRow([
      cell(rowL[0], 12, false, ink, 300),
      cell(rowL[2].toFixed(1), 11, false, muted, 54, true),
      cell(rowL[1].toFixed(2), 12, true, okL ? okPaint : noPaint, 62, true),
      cell(rowD[1].toFixed(2), 12, true, okD ? okPaint : noPaint, 62, true)
    ]);
  });

  return root.id;
}

/* ------------------------------------------------------------------ */
/* GENERATE — code → Figma                                             */
/* ------------------------------------------------------------------ */

async function generate() {
  try {
    await loadFonts();

    var prim = await buildPrimitives();
    var light = await buildSemantic("Semantic Light", "Light", false, prim.vars);
    var dark  = await buildSemantic("Semantic Dark",  "Dark",  true,  prim.vars);

    var pageRoot = await buildPage(prim, light, dark);

    var msg = "Primitives +" + prim.added +
              " · Semantic Light +" + light.added +
              " · Semantic Dark +" + dark.added +
              " · swatch page rebuilt";
    if (light.missing.length || dark.missing.length) {
      msg += " · missing: " + light.missing.concat(dark.missing).join(", ");
    }
    figma.closePlugin(msg);
  } catch (e) {
    figma.closePlugin("Failed: " + (e && e.message ? e.message : String(e)));
  }
}


/* ------------------------------------------------------------------ */
/* EXPORT — Figma → code                                               */
/* ------------------------------------------------------------------ */
/*
 * Reads every local variable and text style and writes them as design
 * tokens in the W3C DTCG format: every token is { $type, $value }, and a
 * "/" in a Figma name becomes one level of nesting.
 *
 *   Variables  → grouped under their collection name, aliases kept as
 *                references like "{Primitives.neutral.50}"
 *   Text styles → under "Text styles", as $type "typography"
 *
 * A plugin can't write to disk, so the JSON is shown in a window with
 * Copy and Download buttons; it goes into the repo as tokens/figma.json.
 * That manual step is deliberate: exporting is a design release.
 *
 * No timestamp and keys are sorted, so exporting an unchanged file gives a
 * byte-identical JSON and git only shows real changes.
 */

var WEIGHTS = {
  thin: 100, hairline: 100, extralight: 200, ultralight: 200, light: 300,
  regular: 400, normal: 400, book: 400, medium: 500, semibold: 600,
  demibold: 600, bold: 700, extrabold: 800, ultrabold: 800, black: 900, heavy: 900
};

function weightOf(styleName) {
  // "ExtraBold Italic", "Semi Bold" → 800, 600
  var key = styleName.toLowerCase().replace(/italic|oblique/g, "").replace(/[\s-]/g, "");
  return WEIGHTS[key] || 400;
}

function round(n, places) {
  var f = Math.pow(10, places);
  return Math.round(n * f) / f;
}

function setPath(root, path, token) {
  var node = root;
  for (var i = 0; i < path.length - 1; i++) {
    if (!node[path[i]]) node[path[i]] = {};
    node = node[path[i]];
  }
  node[path[path.length - 1]] = token;
}

function sortKeys(x) {
  if (Array.isArray(x) || x === null || typeof x !== "object") return x;
  var out = {};
  Object.keys(x).sort().forEach(function (k) { out[k] = sortKeys(x[k]); });
  return out;
}

var DTCG_TYPE = { COLOR: "color", FLOAT: "number", STRING: "string", BOOLEAN: "boolean" };

function hexWithAlpha(c) {
  var hex = hexOf(c);  // #rrggbb, from the RECIPE helpers above
  if (c.a === undefined || c.a >= 1) return hex;
  var a = Math.round(c.a * 255).toString(16);
  return hex + (a.length < 2 ? "0" + a : a);
}

async function exportTokens() {
  var collections = await figma.variables.getLocalVariableCollectionsAsync();
  var variables = await figma.variables.getLocalVariablesAsync();
  var collById = {};
  collections.forEach(function (c) { collById[c.id] = c; });

  // id → "{Collection.group.name}", so an alias can point at its target by name
  var refById = {};
  variables.forEach(function (v) {
    var coll = collById[v.variableCollectionId];
    refById[v.id] = "{" + [coll.name].concat(v.name.split("/")).join(".") + "}";
  });

  function valueOf(v, raw) {
    if (raw && raw.type === "VARIABLE_ALIAS") return refById[raw.id] || "{missing:" + raw.id + "}";
    if (v.resolvedType === "COLOR") return hexWithAlpha(raw);
    return raw;
  }

  var out = {};
  var count = { variables: 0, styles: 0 };

  variables.forEach(function (v) {
    var coll = collById[v.variableCollectionId];
    var modes = coll.modes;
    var token = {
      $type: DTCG_TYPE[v.resolvedType] || "string",
      $value: valueOf(v, v.valuesByMode[coll.defaultModeId])
    };
    if (v.description) token.$description = v.description;
    if (modes.length > 1) {  // not on Starter today, but don't lose data if the plan changes
      var byMode = {};
      modes.forEach(function (m) { byMode[m.name] = valueOf(v, v.valuesByMode[m.modeId]); });
      token.$extensions = { "com.figma": { modes: byMode } };
    }
    setPath(out, [coll.name].concat(v.name.split("/")), token);
    count.variables++;
  });

  var styles = await figma.getLocalTextStylesAsync();
  styles.forEach(function (s) {
    var size = s.fontSize;
    var lh = s.lineHeight;
    var lineHeight = lh.unit === "PERCENT" ? round(lh.value / 100, 3)
                   : lh.unit === "PIXELS"  ? round(lh.value / size, 3)
                   : "normal";
    var ls = s.letterSpacing;
    var letterSpacing = ls.unit === "PERCENT"
      ? { value: round(ls.value / 100, 4), unit: "em" }
      : { value: round(ls.value, 2), unit: "px" };

    var token = {
      $type: "typography",
      $value: {
        fontFamily: s.fontName.family,
        fontWeight: weightOf(s.fontName.style),
        fontSize: { value: size, unit: "px" },
        lineHeight: lineHeight,
        letterSpacing: letterSpacing
      },
      $extensions: { "com.figma": { fontStyle: s.fontName.style } }
    };
    if (s.description) token.$description = s.description;
    setPath(out, ["Text styles"].concat(s.name.split("/")), token);
    count.styles++;
  });

  var json = JSON.stringify(sortKeys(out), null, 2) + "\n";

  figma.showUI(__html__, { width: 520, height: 560, title: "Export tokens" });
  figma.ui.postMessage({
    json: json,
    summary: count.variables + " variables in " + collections.length +
             " collections · " + count.styles + " text styles"
  });
  figma.ui.onmessage = function (msg) {
    if (msg === "copied") figma.notify("Copied — paste into tokens/figma.json");
    if (msg === "close") figma.closePlugin();
  };
}

/* ------------------------------------------------------------------ */
/* MAIN                                                                */
/* ------------------------------------------------------------------ */

if (figma.command === "export") {
  exportTokens().catch(function (e) {
    figma.closePlugin("Export failed: " + (e && e.message ? e.message : String(e)));
  });
} else {
  generate();
}

/* Goals System — colour recipe.
 *
 * The single source of truth. Every colour in the product is derived from the
 * numbers in this file; none of them are picked by hand.
 *
 * The Figma plugin's RECIPE block must match this. `npm run tokens` regenerates
 * both the CSS and a paste-ready copy of that block.
 */

export const NEUTRAL = {
  steps: [25, 50,   100,  200, 300, 400, 500, 600, 700, 800, 900, 950],
  L:     [100, 96.4, 93.5, 87,  78,  67,  55,  44,  34,  28,  20,  12],

  hueLight: 81,    // cream — the warm end
  hueDark: 216,    // slate — the cool end

  // The ramp does NOT drift evenly between the two hues. An even drift spends
  // the middle of the ramp inside the olive band (H 100–165) at peak chroma,
  // which is what made the mid greys read khaki and the dark surfaces green.
  // Instead the cream hue HOLDS down to crossStart, swings across in one move,
  // and is locked to the dark hue from crossEnd down.
  crossStart: 80,
  crossEnd: 48,

  // neutral-100 at L 93.5 is not arbitrary: cards are neutral-25 (pure white)
  // and the system requires 1.2:1 between card and page. That lands at 1.21.
  // Lighten this and the elevation assertion in build.mjs fails — there is no
  // headroom above it, because the card cannot get lighter than white.

  // Chroma control points as [L, C], interpolated piecewise across lightness.
  // The waist at L 67 is the whole trick: it sits exactly where the hue
  // crossing happens, so the ramp passes through the olive hues at almost no
  // chroma and the transition is invisible.
  chromaStops: [
    [100, 0.0],    [96.4, 0.0090], [93.5, 0.0125], [87, 0.0130],
    [78,  0.0100], [67,   0.0050], [55, 0.0080], [44, 0.0245],
    [34,  0.0353], [28,   0.0390], [20, 0.0430], [12, 0.0360]
  ]
};

export const TIERS = {
  bright: { fillL: 56, fillD: 74, bgL: [95, 0.035], bgD: [34, 0.05] },
  deep:   { fillL: 48, fillD: 64, bgL: [90, 0.060], bgD: [28, 0.075] }
};

export const CHROMA_CAP = 0.18;
export const SIGNAL_TEXT = { L_light: 47, L_dark: 75, C: 0.16 };

/* Category hues, positioned by maximising the smallest visible gap between any
 * two of them in both modes. `id` is what gets stored against a user's
 * category — never the resolved colour — so these can be retuned freely. */
export const CATEGORIES = [
  { id: 0,  name: "poppy",    hue: 24,  tier: "bright" },
  { id: 1,  name: "ochre",    hue: 66,  tier: "deep"   },
  { id: 2,  name: "olive",    hue: 102, tier: "bright" },
  { id: 3,  name: "fern",     hue: 135, tier: "deep"   },
  { id: 4,  name: "jade",     hue: 165, tier: "bright" },
  { id: 5,  name: "lagoon",   hue: 198, tier: "deep"   },
  { id: 6,  name: "azure",    hue: 234, tier: "bright" },
  { id: 7,  name: "cobalt",   hue: 258, tier: "deep"   },
  { id: 8,  name: "iris",     hue: 288, tier: "bright" },
  { id: 9,  name: "orchid",   hue: 312, tier: "deep"   },
  { id: 10, name: "fuchsia",  hue: 333, tier: "bright" },
  { id: 11, name: "crimson",  hue: 357, tier: "deep"   }
];

export const SIGNALS = [
  { role: "success", name: "lime",  hue: 124 },
  { role: "danger",  name: "ember", hue: 43  }
];

/* Semantic layer: token -> primitive, per theme. */
export function semanticMap(dark) {
  const m = dark
    ? {
        "surface/ground": "neutral/900",
        "surface/raised": "neutral/800",
        "surface/sunken": "neutral/950",
        "surface/track":  "neutral/900",
        "border/subtle":  "neutral/700",
        "border/default": "neutral/600",
        "text/primary":   "neutral/50",
        "text/secondary": "neutral/200",
        "text/muted":     "neutral/300"
      }
    : {
        "surface/ground": "neutral/100",
        "surface/raised": "neutral/25",
        "surface/sunken": "neutral/200",
        "surface/track":  "neutral/100",
        "border/subtle":  "neutral/200",
        "border/default": "neutral/300",
        "text/primary":   "neutral/900",
        "text/secondary": "neutral/700",
        "text/muted":     "neutral/600"
      };
  const suffix = dark ? "-dark" : "-light";
  for (const c of CATEGORIES) {
    m[`category/${c.name}/fill`] = `category/${c.name}/fill${suffix}`;
    m[`category/${c.name}/bg`]   = `category/${c.name}/bg${suffix}`;
  }
  for (const s of SIGNALS) {
    m[`signal/${s.role}/fill`] = `signal/${s.name}/fill${suffix}`;
    m[`signal/${s.role}/bg`]   = `signal/${s.name}/bg${suffix}`;
    m[`signal/${s.role}/text`] = `signal/${s.name}/text${suffix}`;
  }
  return m;
}

/* ------------------------------------------------------------------ */
/* OKLCH → sRGB                                                        */
/* ------------------------------------------------------------------ */

export function oklchRGB(L, C, H) {
  L = L / 100;
  const h = (H * Math.PI) / 180, a = C * Math.cos(h), b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3;
  return [
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
  ];
}
const enc = (x) => {
  x = Math.max(0, Math.min(1, x));
  x = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
  return Math.round(x * 255).toString(16).padStart(2, "0");
};
export const hex = (L, C, H) => "#" + oklchRGB(L, C, H).map(enc).join("");

const inGamut = (L, C, H) => oklchRGB(L, C, H).every((x) => x >= -0.001 && x <= 1.001);
export function maxChroma(L, H) {
  let lo = 0, hi = 0.45;
  for (let i = 0; i < 22; i++) { const m = (lo + hi) / 2; inGamut(L, m, H) ? (lo = m) : (hi = m); }
  return lo;
}

export function neutralChroma(L) {
  const s = NEUTRAL.chromaStops;
  if (L >= s[0][0]) return s[0][1];
  for (let i = 0; i < s.length - 1; i++) {
    const [L1, C1] = s[i], [L2, C2] = s[i + 1];
    if (L <= L1 && L >= L2) return C1 + (C2 - C1) * ((L1 - L) / (L1 - L2));
  }
  return s.at(-1)[1];
}

/* Cream holds, then crosses once. smoothstep keeps the swing from kinking. */
export function neutralHue(L) {
  const { hueLight, hueDark, crossStart, crossEnd } = NEUTRAL;
  const s = Math.max(0, Math.min(1, (crossStart - L) / (crossStart - crossEnd)));
  return hueLight + (hueDark - hueLight) * (s * s * (3 - 2 * s));
}

export function neutralAt(i) {
  const L = NEUTRAL.L[i], H = neutralHue(L);
  return hex(L, Math.min(neutralChroma(L), 0.94 * maxChroma(L, H)), H);
}
export function fillAt(H, tier, dark) {
  const L = dark ? TIERS[tier].fillD : TIERS[tier].fillL;
  return hex(L, Math.min(CHROMA_CAP, 0.94 * maxChroma(L, H)), H);
}
export function bgAt(H, tier, dark) {
  const s = dark ? TIERS[tier].bgD : TIERS[tier].bgL;
  return hex(s[0], s[1], H);
}
export function signalTextAt(H, dark) {
  return hex(dark ? SIGNAL_TEXT.L_dark : SIGNAL_TEXT.L_light, SIGNAL_TEXT.C, H);
}

/* ------------------------------------------------------------------ */
/* Contrast — used by the build to assert the guarantees               */
/* ------------------------------------------------------------------ */

export function luminance(hx) {
  const f = (c) => { c = parseInt(c, 16) / 255; return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(hx.slice(1, 3)) + 0.7152 * f(hx.slice(3, 5)) + 0.0722 * f(hx.slice(5, 7));
}
export function contrast(a, b) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* Flat primitive table: name -> hex */
export function primitives() {
  const p = {};
  NEUTRAL.steps.forEach((s, i) => { p[`neutral/${s}`] = neutralAt(i); });
  for (const c of CATEGORIES) {
    p[`category/${c.name}/fill-light`] = fillAt(c.hue, c.tier, false);
    p[`category/${c.name}/fill-dark`]  = fillAt(c.hue, c.tier, true);
    p[`category/${c.name}/bg-light`]   = bgAt(c.hue, c.tier, false);
    p[`category/${c.name}/bg-dark`]    = bgAt(c.hue, c.tier, true);
  }
  for (const s of SIGNALS) {
    p[`signal/${s.name}/fill-light`] = fillAt(s.hue, "bright", false);
    p[`signal/${s.name}/fill-dark`]  = fillAt(s.hue, "bright", true);
    p[`signal/${s.name}/bg-light`]   = bgAt(s.hue, "bright", false);
    p[`signal/${s.name}/bg-dark`]    = bgAt(s.hue, "bright", true);
    p[`signal/${s.name}/text-light`] = signalTextAt(s.hue, false);
    p[`signal/${s.name}/text-dark`]  = signalTextAt(s.hue, true);
  }
  return p;
}

export const cssName = (token) => "--" + token.replace(/[\s/]+/g, "-");

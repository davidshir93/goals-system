/* Paste over the NEUTRAL block AND the two neutral* functions in the
   Figma plugin's code.js. Generated from tokens/recipe.mjs.

   NOTE: the hue and chroma functions changed shape — the ramp no longer drifts
   evenly between the two hues, so replacing only the NEUTRAL object is not
   enough. Replace the functions below as well or Figma will drift from code. */

var NEUTRAL = {
  steps: [25, 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950],
  L:     [100, 96.4, 93.5, 87, 78, 67, 55, 44, 34, 28, 20, 12],
  hueLight: 81,
  hueDark: 216,
  crossStart: 80,
  crossEnd: 48,
  chromaStops: [
    [100, 0],
    [96.4, 0.009],
    [93.5, 0.0125],
    [87, 0.013],
    [78, 0.01],
    [67, 0.005],
    [55, 0.008],
    [44, 0.0245],
    [34, 0.0353],
    [28, 0.039],
    [20, 0.043],
    [12, 0.036]
  ]
};

function neutralChroma(L) {
  var s = NEUTRAL.chromaStops;
  if (L >= s[0][0]) return s[0][1];
  for (var i = 0; i < s.length - 1; i++) {
    var L1 = s[i][0], C1 = s[i][1], L2 = s[i + 1][0], C2 = s[i + 1][1];
    if (L <= L1 && L >= L2) return C1 + (C2 - C1) * ((L1 - L) / (L1 - L2));
  }
  return s[s.length - 1][1];
}

function neutralHue(L) {
  var s = Math.max(0, Math.min(1, (NEUTRAL.crossStart - L) / (NEUTRAL.crossStart - NEUTRAL.crossEnd)));
  return NEUTRAL.hueLight + (NEUTRAL.hueDark - NEUTRAL.hueLight) * (s * s * (3 - 2 * s));
}

function neutralAt(i) {
  var L = NEUTRAL.L[i], H = neutralHue(L);
  return rgba(L, Math.min(neutralChroma(L), 0.94 * maxChroma(L, H)), H);
}

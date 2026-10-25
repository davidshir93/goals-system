/* Motion tokens. `npm run tokens` turns this file into CSS variables
 * (src/styles/tokens.css) and typed constants (src/tokens/motion.ts).
 *
 * Code-owned on purpose — the one exception to "Figma is the source".
 * Figma can store a number but cannot preview or check an easing curve.
 * These values were tuned by feel in the Goals Motion Lab (22–23 Oct 2026).
 *
 * Rule: motion explains a state change. It never decorates.
 *
 * duration  ms
 * easing    cubic-bezier control points [x1, y1, x2, y2]; x must stay in 0–1
 * scale     unitless, only where the motion scales something
 */

const DECELERATE = [0, 0, 0.2, 1];
const ACCELERATE = [0.3, 0, 1, 1];
const STANDARD = [0.2, 0, 0, 1];
const EMPHASIZED = [0.3, 0, 0, 1];
const OVERSHOOT = [0.34, 1.56, 0.64, 1];

export const MOTION = {
  /* 1 · Progress step (+ / −) */
  progress:     { duration: 250, easing: DECELERATE },
  count:        { duration: 125, easing: DECELERATE },   // each way; slides up on +, down on −

  /* 2 · Reaching a goal: fill → trophy + colour wave → hold → lift → move → settle */
  trophy:       { duration: 350, easing: OVERSHOOT },
  wave:         { duration: 560, easing: DECELERATE },   // colour wave, starts with the trophy
  completeHold: { duration: 150 },
  lift:         { duration: 250, easing: STANDARD, scale: 1.1 },
  move:         { duration: 480, easing: EMPHASIZED },   // FLIP to Done this week, card stays lifted
  settle:       { duration: 240, easing: DECELERATE },

  /* 3 · WOOP */
  woopOpen:     { duration: 300, easing: DECELERATE },   // desktop modal, grows from the card
  woopClose:    { duration: 180, easing: ACCELERATE },
  woopExpand:   { duration: 260, easing: STANDARD },     // mobile, in place
  woopCollapse: { duration: 195, easing: ACCELERATE },
  // Proposed 25 Oct, not yet tuned in the Motion Lab:
  segment:        { duration: 240, easing: STANDARD },   // selected segment slides: WOOP tabs, Week / Quarter / Year
  woopTabContent: { duration: 160, easing: DECELERATE }, // new tab's content fades in
  menuOpen:       { duration: 150, easing: DECELERATE },  // ••• / avatar menu grows in — half of woopOpen
  menuClose:      { duration: 90,  easing: ACCELERATE },  // and fades out — half of woopClose
  pageIn:         { duration: 210, easing: DECELERATE, scale: 0.98 } // Week / Quarter / Year: the goals fade in (header and tools stay still)
};

/* prefers-reduced-motion: no movement, no scale. Values update instantly,
 * the trophy, the card changing section and the modal only fade. */
export const MOTION_REDUCED = {
  progress:     { duration: 0 },
  count:        { duration: 0 },
  trophy:       { duration: 140 },   // opacity only
  wave:         { duration: 0 },
  lift:         { duration: 0, scale: 1 },
  move:         { duration: 140 },   // cross-fade between sections
  settle:       { duration: 0 },
  woopOpen:     { duration: 140 },
  woopClose:    { duration: 140 },
  woopExpand:   { duration: 0 },
  woopCollapse: { duration: 0 },
  segment:      { duration: 0 },     // segment jumps
  woopTabContent: { duration: 140 }, // still fades in
  menuOpen:     { duration: 0 },     // appears at once
  menuClose:    { duration: 0 },     // disappears at once
  pageIn:       { duration: 140, scale: 1 }  // plain fade
};

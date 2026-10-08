# Goals System — Colour Tokens

A Figma plugin for the Goals System design tokens.

**Figma is the source of truth.** Colours, text styles, spacing and radius are
decided here, exported to `tokens/figma.json`, and `npm run tokens` builds the
CSS from that file. The build checks contrast and fails if a change in Figma
breaks it. Designers can change any value by hand; the generator below is a
starting point, not a rule.

## Run it

1. Figma desktop → **Plugins → Development → Import plugin from manifest…** →
   pick `figma-plugin/manifest.json` in the goals-system repo.
2. Open the Goals System file → **Plugins → Development → Goals System — Colour Tokens**.
   It has two commands:
   - **Generate colour tokens** — creates a starting palette from the OKLCH
     recipe in `code.js` (hues, tiers, neutral ramp). Only adds variables that
     are missing, so values you have tuned by hand are kept.
   - **Export tokens to JSON** — Figma → code. Shows every variable and text
     style as DTCG JSON. Copy it into `tokens/figma.json`, run
     `npm run tokens`, and commit both.

Generate reports what it did in the toast at the bottom. Safe to run again — existing
collections are reused, only missing variables are added, and the swatch page is
rebuilt from scratch each time.

## What it creates

| Collection | Contents |
|---|---|
| **Primitives** | 12-step neutral ramp, plus every category and signal value for both modes. Scoped to nothing, so raw values never show up in a picker. |
| **Semantic Light** | 38 tokens — surfaces, borders, text, 12 categories, 2 signals. Each one aliases a primitive. |
| **Semantic Dark** | The same 38 names, pointing at the dark primitives. |

Plus a **Colour system** page: the ramp, all twelve categories shown light and
dark side by side, and the two signal messages. Every swatch is bound to its
variable, so the page updates when the tokens do.

Both semantic collections use identical token names. That's what lets a frame
switch between light and dark by changing which collection it draws from — and
if the file ever moves off the Starter plan, the two collapse into two modes of
one collection without renaming anything.

## Retuning

Everything comes from the `RECIPE` block at the top of `code.js`. Change a
number there and run the plugin again; all 148 variables regenerate.

- `NEUTRAL` — the lightness ladder, the warm→cool hue drift, and the warmth:
  `chromaLight`, `chromaMid` and `chromaDark` are three control points
  interpolated across the ramp. Sand sits at 0.018 and pine at 0.032; setting
  either end below its own anchor makes the ramp greyer than the colours it
  was built from, which is what makes a warm palette read cold on screen.
- `TIERS` — the two lightness tiers. `fillL` is the constraint that matters:
  raise it above 58 and the cool category bars stop clearing 3:1 against a
  light track.
- `CATEGORIES` — hue positions and tier per category. Hue is what gets stored
  against a user's category, so these can be retuned without touching data.
- `SIGNAL_TEXT` — lime and ember are the only colours that become words, so
  they're the only ones with a text value.

## The one rule the tokens can't enforce

**Muted text doesn't go on `surface/sunken` in light mode.** `text/muted` on the
sunken step lands at 4.01:1 — just under AA. Everything else in both modes
passes, and this one only exists because three genuinely distinct light
surfaces have to span L98 down to L82, which leaves the darkest of them tight
for quiet text.

In practice it costs nothing: sunken is a well — progress tracks, input
backgrounds — and the label on a progress bar sits on the *fill*, not the
track. If you do need text there, `text/secondary` gives 5.63:1.

## Why it's built this way

- **A ramp only for the neutral.** A ramp is for a colour that appears at many
  depths. Everything else lives in two or three roles and gets two or three
  values.
- **Text on a category background is neutral ink**, never a category-coloured
  text token. Because the background's lightness is locked, that pairing is
  safe for all twelve hues — worst case 9.9:1.
- **Chroma runs to the edge of the gamut**, not a flat number. A blue holds far
  more saturation than an olive; clamping both makes the blue look washed out.
- **Uneven hue spacing and alternating tiers.** Twelve hues at 30° apart with
  one lightness leaves hue doing all the work, and 30° in the blues is a much
  smaller visible step than 30° in the oranges.

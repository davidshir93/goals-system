/* The few things Figma cannot know. Everything else comes from
 * tokens/figma.json. */

/* Category ids are stored against a user's category, so they must stay
 * fixed forever. Add new categories at the end; never renumber. */
export const CATEGORY_IDS = {
  poppy: 0,
  ochre: 1,
  olive: 2,
  fern: 3,
  jade: 4,
  lagoon: 5,
  azure: 6,
  cobalt: 7,
  iris: 8,
  orchid: 9,
  fuchsia: 10,
  crimson: 11
};

/* Figma font name → CSS variable key and fallback stack. */
export const FONTS = {
  /* Suez One covers Hebrew: Bitter has no Hebrew glyphs, so Hebrew falls
   * through to it while Latin letters and digits stay in Bitter. */
  "Bitter": { key: "display", stack: '"Bitter", "Suez One", Georgia, "Times New Roman", serif' },
  /* IBM Plex Sans Hebrew covers Hebrew body text the same way. */
  "Google Sans Flex": { key: "text", stack: '"Google Sans Flex", "IBM Plex Sans Hebrew", system-ui, -apple-system, "Segoe UI", sans-serif' }
};

/* Hebrew partner faces. Figma keeps them as "Hebrew/<Style>" text styles
 * (e.g. Hebrew/Display) so mockups render Hebrew correctly. They are not
 * separate tokens: in code the Hebrew face sits in the Latin face's stack
 * above, and the browser picks it per glyph.
 *
 * Hebrew reads smaller than Latin at the same size (no capitals, no
 * ascenders), so the Hebrew styles in Figma are set larger. The build takes
 * that ratio from Figma, checks every style agrees on it, and emits it as
 * size-adjust on a self-hosted @font-face limited to Hebrew characters —
 * Latin letters and digits stay in the Latin face at the style's size.
 * Line height is checked in px: a Hebrew line is as tall as a Latin one.
 * Weight is checked when the Hebrew face has more than one weight. A face
 * at 100% still gets its own @font-face, so all Hebrew loads the same way. */
export const HEBREW_FONTS = {
  /* One weight: every Hebrew title style uses it, weight is not checked. */
  "Bitter": { family: "Suez One", files: { 400: "/fonts/suez-one-hebrew-400.woff2" } },
  /* Same weights as the Latin body styles, so the build checks they match. */
  "Google Sans Flex": { family: "IBM Plex Sans Hebrew", files: {
    400: "/fonts/ibm-plex-sans-hebrew-400.woff2",
    600: "/fonts/ibm-plex-sans-hebrew-600.woff2"
  } }
};

/* px per rem. Sizes ship in rem so they still respond to the reader's own
 * browser text size. */
export const ROOT_SIZE = 16;

/* shadcn variable → semantic token. Used by src/styles/shadcn-bridge.css. */
export const BRIDGE = {
  "background": "surface/ground",
  "foreground": "text/primary",
  "card": "surface/raised",
  "card-foreground": "text/primary",
  "popover": "surface/raised",
  "popover-foreground": "text/primary",
  "primary": "text/primary",
  "primary-foreground": "surface/raised",
  "secondary": "surface/sunken",
  "secondary-foreground": "text/primary",
  "muted": "surface/sunken",
  "muted-foreground": "text/muted",
  "accent": "surface/sunken",
  "accent-foreground": "text/primary",
  "destructive": "signal/danger/fill",
  "border": "border/default",
  "input": "border/default",
  "ring": "text/muted",
  "chart-1": "category/poppy/fill",
  "chart-2": "category/jade/fill",
  "chart-3": "category/azure/fill",
  "chart-4": "category/iris/fill",
  "chart-5": "category/ochre/fill",
  "sidebar": "surface/raised",
  "sidebar-foreground": "text/primary",
  "sidebar-primary": "text/primary",
  "sidebar-primary-foreground": "surface/raised",
  "sidebar-accent": "surface/sunken",
  "sidebar-accent-foreground": "text/primary",
  "sidebar-border": "border/subtle",
  "sidebar-ring": "text/muted"
};

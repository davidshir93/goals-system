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
  "Bitter": { key: "display", stack: '"Bitter", Georgia, "Times New Roman", serif' },
  "Google Sans Flex": { key: "text", stack: '"Google Sans Flex", system-ui, -apple-system, "Segoe UI", sans-serif' }
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

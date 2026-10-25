import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/* The type-* utilities (src/index.css) set the `font` shorthand, so a later
 * one replaces an earlier one — and replaces any text size, weight, leading
 * or family. Without this, cn() keeps both and stylesheet order decides. */
const twMerge = extendTailwindMerge<"type">({
  extend: {
    classGroups: {
      type: [{ type: ["page-title", "display", "main-title", "body-title", "body-text", "caption", "caption-strong"] }],
    },
    conflictingClassGroups: {
      type: ["font-size", "font-weight", "leading", "font-family"],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

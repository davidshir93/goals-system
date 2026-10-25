import { useLayoutEffect, useRef, type ReactNode } from "react";
import { getMotion, prefersReducedMotion } from "@/tokens/motion";
import type { Level } from "@/hooks/useOnboarding";

// The level shown last, kept across page mounts (each page mounts its own content).
let lastLevel: Level | null = null;

/* Wraps a page's goals (cards, empty panel, summary). When you switch between
 * Week, Quarter and Year, only this fades in — the header, the period control and
 * the toolbar icons stay still. Coming back to the same level (e.g. from the goal
 * form) doesn't animate. Tokens: pageIn. */
export function PageEnter({ level, className, children }: { level: Level; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  // Read once at mount — StrictMode runs the effect twice and must not see its own update.
  const cameFrom = useRef(lastLevel);
  useLayoutEffect(() => {
    const switched = cameFrom.current !== null && cameFrom.current !== level;
    lastLevel = level;
    const m = getMotion(prefersReducedMotion()).pageIn;
    if (!switched || m.duration === 0 || !ref.current) return;
    const anim = ref.current.animate(
      [{ opacity: 0, transform: `scale(${m.scale ?? 1})` }, { opacity: 1, transform: "none" }],
      { duration: m.duration, easing: m.easing },
    );
    return () => anim.cancel();
  }, [level]);
  return (
    <div ref={ref} className={["origin-top", className ?? ""].join(" ")}>
      {children}
    </div>
  );
}

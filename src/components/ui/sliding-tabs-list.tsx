import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { TabsList } from "./tabs";
import { cn } from "@/lib/utils";

/* A TabsList whose selected pill slides to the active tab (tokens: segment).
 *
 * The pill is one element behind the triggers, moved with transform and
 * width — it never re-renders the tabs. Measured from the active trigger, so
 * it also follows tab widths changing (resize, language switch, RTL).
 * No slide on first paint: the pill appears in place, then animates on change.
 * Triggers need `relative z-10` and no active background of their own. */

export function SlidingTabsList({ value, className, children }: { value: string; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState<{ x: number; w: number } | null>(null);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const list = ref.current;
    if (!list) return;
    const measure = () => {
      const tab = list.querySelector<HTMLElement>('[role="tab"][data-state="active"]');
      if (tab) setBox({ x: tab.offsetLeft, w: tab.offsetWidth });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(list);
    return () => ro.disconnect();
  }, [value]);

  useEffect(() => {
    if (!box || ready) return;
    const id = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(id);
  }, [box, ready]);

  return (
    <TabsList ref={ref} className={cn("relative", className)}>
      {box && (
        <span
          aria-hidden="true"
          className="absolute top-1 bottom-1 left-0 rounded-lg bg-card shadow-sm"
          style={{
            width: box.w,
            transform: `translateX(${box.x}px)`,
            transitionProperty: ready ? "transform, width" : "none",
            transitionDuration: "var(--motion-segment-duration)",
            transitionTimingFunction: "var(--motion-segment-easing)",
          }}
        />
      )}
      {children}
    </TabsList>
  );
}

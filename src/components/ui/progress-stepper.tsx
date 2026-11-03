import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { getMotion, prefersReducedMotion } from "@/tokens/motion";

/* − / bar / + for logging progress on a weekly goal.
 *
 * Pattern: two native buttons + a progressbar + a polite live region.
 * Not role="spinbutton": the main action is "log one more", not "edit a
 * number", and + is the primary action, so it must be a real,
 * keyboard-reachable button.
 *
 * Direction: always left-to-right, also in Hebrew. − is on the left, + on the
 * right and the bar fills from the left, as on a number line — the rest of
 * the card mirrors, this control does not.
 *
 * Motion (tokens/motion.mjs): the fill eases to the new value, the count
 * slides in from the direction of the change, and on reaching the goal the
 * trophy pops in once the fill has landed. Under prefers-reduced-motion the
 * values update instantly and the trophy only fades in.
 * The rest of the completion moment (colour wave, lift, move to Done) belongs
 * to the Week page, which owns the sections.
 */

type ProgressStepperProps = {
  /** What is being counted, used in the accessible names, e.g. "Practice German speaking" */
  label: string;
  value: number;
  max: number;
  onChange: (value: number) => void;
  /** Category colour for the fill and the trophy, e.g. "var(--category-azure-fill)" */
  color: string;
};

const BUTTON =
  "type-main-title grid size-9 shrink-0 cursor-pointer place-items-center rounded-full bg-[var(--surface-track)] text-[var(--text-primary)]" +
  "aria-disabled:cursor-default focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--text-primary)]";

export function ProgressStepper({ label, value, max, onChange, color }: ProgressStepperProps) {
  const { t } = useTranslation();
  const done = value >= max;
  const atZero = value <= 0;
  const liveId = useId();
  // Empty until the user acts, so cards don't announce themselves on page load.
  const [announcement, setAnnouncement] = useState("");

  // The count is drawn twice (see the bar below); both copies animate together.
  const countRef = useRef<HTMLSpanElement>(null);
  const countOnFillRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // The light copy lives inside the fill but must line up with the dark copy,
  // so it gets the track's width, kept current here.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const ro = new ResizeObserver(([e]) =>
      track.style.setProperty("--track-w", `${e.contentRect.width}px`)
    );
    ro.observe(track);
    return () => ro.disconnect();
  }, []);
  const trophyRef = useRef<SVGSVGElement>(null);
  const prevValue = useRef(value);

  useLayoutEffect(() => {
    const prev = prevValue.current;
    prevValue.current = value;
    if (prev === value) return;
    const m = getMotion();
    const reduced = prefersReducedMotion();

    // Count: the new number slides in from below on +, from above on −.
    // Out + in in the lab = 2 × the count token; here only the "in" plays, over both halves.
    if (!reduced) {
      const dy = value > prev ? 8 : -8;
      for (const el of [countRef.current, countOnFillRef.current])
        el?.animate(
          [{ transform: `translateY(${dy}px)`, opacity: 0 }, { transform: "none", opacity: 1 }],
          { duration: m.count.duration * 2, easing: m.count.easing }
        );
    }

    // Trophy: pops in after the fill has landed.
    if (prev < max && value >= max && trophyRef.current) {
      const frames = reduced
        ? [{ opacity: 0 }, { opacity: 1 }]
        : [
            { transform: "scale(.4) rotate(-18deg)", opacity: 0 },
            { transform: "scale(1.15) rotate(4deg)", opacity: 1, offset: 0.65 },
            { transform: "none", opacity: 1 },
          ];
      trophyRef.current.animate(frames, {
        duration: m.trophy.duration,
        easing: reduced ? "linear" : m.trophy.easing,
        delay: m.progress.duration,
        fill: "backwards", // stay hidden during the delay
      });
    }
  }, [value, max]);

  const step = (delta: number) => {
    const next = value + delta;
    if (next < 0 || next > max) return; // aria-disabled doesn't block clicks, so guard here
    onChange(next);
    setAnnouncement(
      next === max
        ? t("goalCard.progressDone", { done: next, planned: max })
        : t("goalCard.progressValue", { done: next, planned: max })
    );
  };

  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;

  return (
    <div>
      <div dir="ltr" className="flex items-center gap-2">
        <button
          type="button"
          data-stepper-dec
          tabIndex={-1} // keyboard: the card is the Tab stop, + − ↑ ↓ on it log progress
          aria-label={t("goalCard.removeOne", { goal: label })}
          aria-disabled={atZero || undefined} // stays focusable, read as "dimmed"
          onClick={() => step(-1)}
          className={`${BUTTON} aria-disabled:opacity-40`}
        >
          −
        </button>

        <div
          ref={trackRef}
          role="progressbar"
          aria-label={t("goalCard.progressLabel", { goal: label })}
          aria-valuemin={0}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={t("goalCard.progressValue", { done: value, planned: max })}
          className="relative h-9 min-w-0 flex-1 overflow-hidden rounded-full bg-[var(--surface-track)]"
        >
          {/* Two-tone count. It stays centred on the track and is drawn twice:
              dark on the empty track, light on the fill. The fill clips the light
              copy, so the colour changes exactly at the fill's edge, even mid-digit,
              and the fill's own motion moves that edge.
              Visual only: the progressbar already says "3 of 5"; reading this too
              would say it twice, as "3 slash 5". */}
          <span aria-hidden="true" className="type-body-title absolute inset-0 grid place-items-center tabular-nums text-[var(--text-primary)]">
            <span ref={countRef} className="inline-block">
              {value} / {max}
            </span>
          </span>
          <div
            className="absolute inset-y-0 left-0 overflow-hidden rounded-full"
            style={{
              width: `${pct}%`,
              background: color,
              transitionProperty: "width",
              transitionDuration: "var(--motion-progress-duration)",
              transitionTimingFunction: "var(--motion-progress-easing)",
            }}
          >
            <span
              aria-hidden="true"
              className="type-body-title absolute inset-y-0 left-0 grid w-[var(--track-w,100%)] place-items-center tabular-nums text-[var(--text-on-fill)]"
            >
              <span ref={countOnFillRef} className="inline-block">
                {value} / {max}
              </span>
            </span>
          </div>
        </div>

        <button
          type="button"
          data-stepper-inc
          tabIndex={-1}
          aria-label={done ? t("goalCard.goalReached", { goal: label }) : t("goalCard.addOne", { goal: label })}
          aria-disabled={done || undefined}
          onClick={() => step(+1)}
          className={BUTTON}
        >
          {done ? (
            <svg ref={trophyRef} aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4z" />
              <path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3" />
            </svg>
          ) : (
            "+"
          )}
        </button>
      </div>

      {/* Must exist (empty) before the first change, or most screen readers miss the update. */}
      <span id={liveId} role="status" aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </div>
  );
}

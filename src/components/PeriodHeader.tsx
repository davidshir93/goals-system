import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import { useQuarters, useWeeks, useYears } from "@/data/queries";
import PeriodSelector from "./PeriodSelector";
import { Button } from "./ui/button";
import { useLayoutEffect, useRef, type ReactNode } from "react";
import { getMotion, prefersReducedMotion } from "@/tokens/motion";
import { useOnboarding } from "@/hooks/useOnboarding";
import { LockIcon } from "./icons";

/* The page header for Year, Quarter and Week, as in Figma:
 *
 *   [ (Week 1 ⌄)  Q3 ⌄  2026 ⌄ ]   ‹ ›   ← segmented period control (Main Title) + week stepping
 *
 * One sunken track holding the three periods; the current one is a raised
 * segment — the same pattern as the WOOP tabs. Dark mode: the segment uses
 * border/default (2.61:1 against the track) and the track gets a border/subtle
 * outline, because the surfaces alone are too close there.
 *
 * No visible page title: the breadcrumb already names the period, so a big
 * "Week 1" only repeated it. The <h1> stays for screen readers (sr-only) —
 * heading navigation still lands on "Week 1".
 *
 * Each crumb is two controls: the name goes to that level's page (zoom out to
 * the year, or in to the week), the ⌄ opens the picker (switch period, or
 * create a new one). The current level is highlighted. This is the only way
 * between Year, Quarter and Week, so all three crumbs are always there.
 *
 * New accounts (see useOnboarding): a period that doesn't exist yet shows its
 * level name ("Quarter") as a placeholder, and its ⌄ offers only "New quarter".
 * A level you can't open yet — Quarter before a year, Week before a quarter —
 * is locked: grey, a lock icon, no link and no picker, and it says why.
 */

type Level = "year" | "quarter" | "week";

const weekNumber = (name = "") => name.replace(/^w/i, "");
const ORDER = { year: 0, quarter: 1, week: 2 } as const;

/* Where the selected segment was on the previous page. Every page mounts its
 * own header, so this is what lets the segment slide from Week to Year
 * instead of jumping (tokens: segment). */
type Segment = { x: number; w: number };
let lastSegment: Segment | null = null;

/** Period control for the page header. On phones it takes the whole row with three
 *  equal segments; the page tools (parent goals, notes) live in the "Up next" row.
 *  tools: optional extras before ‹ ›. */
export function PeriodHeader({ level, tools }: { level: Level; tools?: ReactNode }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { selectedYear, setSelectedYear, selectedQuarter, setSelectedQuarter, selectedWeek, setSelectedWeek } = useGoals();
  const { data: years } = useYears(user?.uid || "");
  const { data: quarters } = useQuarters(user?.uid || "", selectedYear);
  const { data: weeks } = useWeeks(user?.uid || "", selectedYear, selectedQuarter);

  const year = years?.find((y) => y.id === selectedYear);
  const quarter = quarters?.find((q) => q.id === selectedQuarter);
  const week = weeks?.find((w) => w.id === selectedWeek);
  const weekLabel = week ? `${t("periods.week")} ${weekNumber(week.name)}` : t("periods.week");
  const onboarding = useOnboarding();

  const title = level === "week" ? weekLabel : level === "quarter" ? `${quarter?.name ?? ""} ${year?.name ?? ""}` : year?.name;

  // ‹ › steps through this quarter's weeks.
  const sortedWeeks = [...(weeks ?? [])].sort((a, b) => +weekNumber(a.name) - +weekNumber(b.name));
  const index = sortedWeeks.findIndex((w) => w.id === selectedWeek);
  const prev = index > 0 ? sortedWeeks[index - 1] : undefined;
  const next = index >= 0 && index < sortedWeeks.length - 1 ? sortedWeeks[index + 1] : undefined;

  const trackRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  // Where the segment was on the previous page, read once when this header mounts.
  const mountFrom = useRef(lastSegment);
  // Mid-slide position, saved when an effect run is cleaned up before the slide ends
  // (StrictMode's double run, or the period names loading a moment later).
  const resumeFrom = useRef<Segment | null>(null);
  const placed = useRef(false);
  useLayoutEffect(() => {
    const track = trackRef.current;
    const el = indicatorRef.current;
    if (!track || !el) return;
    // The indicator's box as it looks right now (mid-animation included), in track coordinates.
    const visual = (): Segment => {
      const t = track.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      return { x: r.left - t.left - track.clientLeft + track.scrollLeft, w: r.width };
    };
    const place = (seg: Segment) => {
      el.style.width = `${seg.w}px`;
      el.style.transform = `translateX(${seg.x}px)`;
      el.style.visibility = "visible";
      lastSegment = seg;
    };
    const measure = (): Segment | null => {
      const li = track.querySelector<HTMLElement>("li[data-current]");
      return li ? { x: li.offsetLeft, w: li.offsetWidth } : null;
    };

    const target = measure();
    if (!target) return;
    const from = resumeFrom.current ?? (placed.current ? visual() : mountFrom.current);
    resumeFrom.current = null;
    place(target);
    placed.current = true;

    let anim: Animation | undefined;
    const m = getMotion(prefersReducedMotion()).segment;
    if (from && m.duration > 0 && (Math.abs(from.x - target.x) > 0.5 || Math.abs(from.w - target.w) > 0.5)) {
      anim = el.animate(
        [
          { transform: `translateX(${from.x}px)`, width: `${from.w}px` },
          { transform: `translateX(${target.x}px)`, width: `${target.w}px` },
        ],
        { duration: m.duration, easing: m.easing },
      );
    }

    let first = true;
    const ro = new ResizeObserver(() => {
      if (first) return void (first = false); // fires once on observe
      const next = measure();
      if (next) {
        anim?.cancel();
        place(next);
      }
    });
    ro.observe(track);
    return () => {
      ro.disconnect();
      if (anim && anim.playState === "running") {
        resumeFrom.current = visual(); // continue from here on the next run, no jump
        anim.cancel();
      }
    };
  }, [level, weekLabel, quarter?.name, year?.name]);

  // Crumbs below the current page (Q3 and Week 1 on the Year page) are grey: not the chosen level.
  const below = (l: Level) => ORDER[l] > ORDER[level];
  const crumb = (opts: {
    to: string;
    name: string | undefined;
    current: boolean;
    muted?: boolean;
    /** Can't open this level yet: the reason, e.g. "Create a year first". */
    locked?: string;
    picker: React.ReactNode;
  }) => opts.locked ? (
    <li className="relative z-10 inline-flex min-w-0 flex-1 items-center justify-center rounded-full py-0.5 px-2 sm:flex-none sm:px-3">
      <span title={opts.locked} className="inline-flex min-w-0 cursor-not-allowed items-center gap-1.5 px-1 text-[var(--text-muted)]">
        <LockIcon size={16} className="shrink-0" />
        <span className="min-w-0 truncate">{opts.name}</span>
        <span className="sr-only">, {opts.locked}</span>
      </span>
    </li>
  ) : (
    <li data-current={opts.current || undefined} className={`relative z-10 inline-flex items-center justify-center rounded-full py-0.5 ps-2 pe-0.5 sm:flex-none sm:justify-start sm:ps-3 ${opts.current ? "shrink-0" : "min-w-0 flex-1"}`}>
      {opts.current ? (
        <span aria-current="page" className="whitespace-nowrap px-1 text-[var(--text-primary)]">
          {opts.name}
        </span>
      ) : (
        <NavLink
          to={opts.to}
          className={`min-w-0 truncate rounded-md px-1 hover:text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 ${opts.muted ? "text-[var(--text-muted)]" : ""}`}
        >
          {opts.name}
        </NavLink>
      )}
      {opts.picker}
    </li>
  );

  return (
    <div className="min-w-0">
      <h1 className="sr-only">{title}</h1>
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:justify-start">
      <nav aria-label={t("periods.breadcrumb")} className="w-full sm:w-auto">
        {/* Week › Quarter › Year: starts where you spend most of your time */}
        <div
          ref={trackRef}
          className="relative flex w-full overflow-x-auto rounded-full sm:inline-flex sm:w-auto sm:max-w-full bg-[var(--surface-sunken)] p-1 dark:ring-1 dark:ring-inset dark:ring-[var(--border-subtle)]"
        >
        {/* the selected segment — one element behind the periods, so it can slide */}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="invisible absolute top-1 bottom-1 left-0 rounded-full bg-[var(--surface-raised)] shadow-sm dark:bg-[var(--border-default)]"
        />
        <ol className="type-main-title flex w-full items-center gap-0.5 text-[var(--text-secondary)] sm:inline-flex sm:w-auto">
          {crumb({
            to: "/week",
            name: weekLabel,
            current: level === "week",
            muted: below("week") || !week,
            locked: onboarding.canOpen("week") ? undefined : t(onboarding.hasYear ? "onboarding.needQuarter" : "onboarding.needYear"),
            picker: (
              <PeriodSelector variant="chevron" muted={below("week")} label={t("periods.changeWeek")} type="week" periods={weeks ?? []} selectedPeriod={selectedWeek} onChange={setSelectedWeek} />
            ),
          })}
          {crumb({
            to: "/quarter",
            name: quarter?.name ?? t("periods.quarter"),
            current: level === "quarter",
            muted: below("quarter") || !quarter,
            locked: onboarding.canOpen("quarter") ? undefined : t("onboarding.needYear"),
            picker: (
              <PeriodSelector variant="chevron" muted={below("quarter")} label={t("periods.changeQuarter")} type="quarter" periods={quarters ?? []} selectedPeriod={selectedQuarter} onChange={setSelectedQuarter} />
            ),
          })}
          {crumb({
            to: "/year",
            name: year?.name ?? t("periods.year"),
            current: level === "year",
            muted: !year,
            picker: (
              <PeriodSelector variant="chevron" label={t("periods.changeYear")} type="year" periods={years ?? []} selectedPeriod={selectedYear} onChange={setSelectedYear} />
            ),
          })}
        </ol>
        </div>
      </nav>

        <div className="flex items-center gap-2">
        {tools}
        {level === "week" && (
          <div className="hidden items-center gap-2 sm:flex">
            <Button
              variant="outline"
              size="icon"
              aria-label={t("periods.previousWeek")}
              aria-disabled={!prev || undefined}
              onClick={() => prev && setSelectedWeek(prev.id)}
              className="rounded-full border-[var(--border-subtle)] aria-disabled:opacity-40"
            >
              <svg aria-hidden="true" className="rtl-flip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="icon"
              aria-label={t("periods.nextWeek")}
              aria-disabled={!next || undefined}
              onClick={() => next && setSelectedWeek(next.id)}
              className="rounded-full border-[var(--border-subtle)] aria-disabled:opacity-40"
            >
              <svg aria-hidden="true" className="rtl-flip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </Button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}

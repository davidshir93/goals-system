import { useTranslation } from "react-i18next";
import { buttonVariants } from "./ui/button";
import { BranchIcon, NotesIcon, PlusIcon } from "./icons";
import { RESPONSIVE } from "./ParentGoalsToggle";

/* Loading state, as in Figma "Week view · Loading" (desktop + mobile, light + dark).
 *
 * The page chrome stays: the period control (Week ⌄ · Quarter ⌄ · Year ⌄ in its
 * sunken track), ‹ › week stepping, Add goal, "Up next", Parent goals and
 * Period notes — same shapes, icons and labels as the real Week page. Only
 * what comes from data is a bar: the period names, the goal cards and the
 * weekly summary. The chrome is inert while loading (not focusable, hidden
 * from screen readers); the phone's floating Add goal button is left out, as
 * in Figma.
 *
 *   Skeleton card    surface/raised, border/subtle, corner 16, padding 24, gap 16
 *     chip           72 × 12, full
 *     title          240 × 20 (220 on mobile), corner 6
 *     progress       full width × 32, full
 *     caption        180 × 10, full
 *   Skeleton summary padding 24, gap 24: 80 × 40 (corner 6) + full width × 12
 *
 * Bars are surface/track and breathe slowly; under prefers-reduced-motion
 * they stay still. Screen readers hear one "Loading goals…" (role=status). */

const Bar = ({ className = "" }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={`block rounded-[var(--corner-full)] bg-[var(--surface-track)] motion-safe:animate-[skeleton-breathe_1.6s_ease-in-out_infinite] ${className}`}
  />
);

const Chevron = ({ muted }: { muted?: boolean }) => (
  <span className="grid size-8 shrink-0 place-items-center">
    <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={muted ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"}>
      <path d="m6 9 6 6 6-6" />
    </svg>
  </span>
);

const Arrow = ({ d }: { d: string }) => (
  <span className={`${buttonVariants({ variant: "outline", size: "icon" })} pointer-events-none rounded-full border-[var(--border-subtle)]`}>
    <svg aria-hidden="true" className="rtl-flip" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  </span>
);

/* One crumb: a bar where the period name goes, then its ⌄. */
const Crumb = ({ current, nameWidth, muted }: { current?: boolean; nameWidth: string; muted?: boolean }) => (
  <li className={`relative z-10 inline-flex items-center justify-center gap-1 rounded-full py-0.5 ps-3 pe-0.5 sm:flex-none sm:justify-start ${current ? "shrink-0 bg-[var(--surface-raised)] shadow-sm dark:bg-[var(--border-default)]" : "min-w-0 flex-1"}`}>
    <Bar className={`h-[0.875rem] ${nameWidth}`} />
    <Chevron muted={muted} />
  </li>
);

function SkeletonCard() {
  return (
    <div className="flex flex-col gap-[var(--space-16)] rounded-[var(--corner-16)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-[var(--space-24)]">
      <Bar className="h-[0.75rem] w-[4.5rem]" />
      <Bar className="h-[1.25rem] w-[13.75rem] max-w-full rounded-[var(--corner-6)] sm:w-[15rem]" />
      <Bar className="h-[2rem] w-full" />
      <Bar className="h-[0.625rem] w-[11.25rem] max-w-full" />
    </div>
  );
}

export function WeekSkeleton() {
  const { t } = useTranslation();
  return (
    <div role="status" aria-live="polite" className="space-y-6">
      <span className="sr-only">{t("common.loadingGoals")}</span>

      <div aria-hidden="true" className="space-y-6">
        {/* Page header — same layout as Week.tsx + PeriodHeader */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 sm:justify-start">
            <div className="relative flex w-full rounded-full bg-[var(--surface-sunken)] p-1 sm:inline-flex sm:w-auto dark:ring-1 dark:ring-inset dark:ring-[var(--border-subtle)]">
              <ol className="type-main-title flex w-full items-center gap-0.5 sm:inline-flex sm:w-auto">
                <Crumb current nameWidth="w-[4.5rem]" />
                <Crumb nameWidth="w-[2rem]" />
                <Crumb nameWidth="w-[3rem]" />
              </ol>
            </div>
            <div className="hidden items-center gap-2 sm:flex">
              <Arrow d="m15 18-6-6 6-6" />
              <Arrow d="m9 18 6-6-6-6" />
            </div>
          </div>
          {/* Desktop only. The wrapper does the hiding: buttonVariants() sets
              inline-flex, which would override a `hidden` on the button itself. */}
          <div className="hidden sm:block">
            <span className={`${buttonVariants()} pointer-events-none`}>
              <PlusIcon />
              {t("goals.addGoal")}
            </span>
          </div>
        </div>

        {/* Toolbar: "Up next" (count unknown yet) · Parent goals · Period notes */}
        <div className="flex min-h-9 items-center justify-between gap-4">
          <span className="type-body-title">{t("goals.upNext")}</span>
          <div className="flex items-center gap-2">
            <span className={`${buttonVariants({ variant: "outline" })} ${RESPONSIVE} pointer-events-none`}>
              <BranchIcon size={16} />
              <span className="max-sm:sr-only">{t("goals.parentGoals")}</span>
            </span>
            <span className={`${buttonVariants({ variant: "outline" })} ${RESPONSIVE} pointer-events-none`}>
              <NotesIcon />
              <span className="max-sm:sr-only">{t("periods.periodNotes")}</span>
            </span>
          </div>
        </div>

        {/* Same grid as SortableGoalGrid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>

        <div className="flex items-center gap-[var(--space-24)] rounded-[var(--corner-16)] border border-[var(--border-subtle)] bg-[var(--surface-raised)] p-[var(--space-24)]">
          <Bar className="h-[2.5rem] w-[5rem] shrink-0 rounded-[var(--corner-6)]" />
          <Bar className="h-[0.75rem] min-w-0 flex-1" />
        </div>
      </div>
    </div>
  );
}

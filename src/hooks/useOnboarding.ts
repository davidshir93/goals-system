import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import { useQuarterlyGoals, useQuarters, useWeeks, useYearlyGoals, useYears } from "@/data/queries";

export type Level = "year" | "quarter" | "week";

/** The first thing the user still has to do, in order. */
export type OnboardingStep = "createYear" | "addYearGoal" | "createQuarter" | "addQuarterGoal" | "createWeek" | "ready";

const STEP_PAGE: Record<OnboardingStep, Level> = {
  createYear: "year",
  addYearGoal: "year",
  createQuarter: "quarter",
  addQuarterGoal: "quarter",
  createWeek: "week",
  ready: "week",
};

/* One set of rules for where a user may go and what they may add — used by the
 * home redirect, the route guards, the period header and the empty panels, so
 * they can never disagree.
 *
 *   Pages:  Year always · Quarter needs a year · Week needs a year and a quarter
 *   Goals:  yearly needs a year · quarterly needs a quarter and a yearly goal (its parent)
 *           · weekly needs a week and a quarterly goal (its parent, which has a yearly one)
 *
 * Reads the same queries RootLayout already loaded, so it adds no requests. */
export function useOnboarding() {
  const { user } = useAuth();
  const uid = user?.uid || "";
  const { selectedYear, selectedQuarter, selectedWeek } = useGoals();

  const years = useYears(uid);
  const quarters = useQuarters(uid, selectedYear);
  const weeks = useWeeks(uid, selectedYear, selectedQuarter);
  const yearlyGoals = useYearlyGoals(uid, selectedYear);
  const quarterlyGoals = useQuarterlyGoals(uid, selectedYear, selectedQuarter);

  const hasYear = Boolean(selectedYear && years.data?.length);
  const hasQuarter = hasYear && Boolean(selectedQuarter && quarters.data?.length);
  const hasWeek = hasQuarter && Boolean(selectedWeek && weeks.data?.length);
  const hasYearGoal = hasYear && Boolean(yearlyGoals.data?.length);
  const hasQuarterGoal = hasQuarter && Boolean(quarterlyGoals.data?.length);

  // Periods exist but the selection hasn't caught up yet (RootLayout picks it in an
  // effect), or a list is still loading: don't redirect on half-known data.
  const settling =
    years.isLoading ||
    quarters.isLoading ||
    weeks.isLoading ||
    yearlyGoals.isLoading ||
    quarterlyGoals.isLoading ||
    (Boolean(years.data?.length) && !selectedYear) ||
    (Boolean(quarters.data?.length) && !selectedQuarter) ||
    (Boolean(weeks.data?.length) && !selectedWeek);

  const step: OnboardingStep = !hasYear
    ? "createYear"
    : !hasYearGoal
      ? "addYearGoal"
      : !hasQuarter
        ? "createQuarter"
        : !hasQuarterGoal
          ? "addQuarterGoal"
          : !hasWeek
            ? "createWeek"
            : "ready";

  const canOpen = (level: Level) => (level === "year" ? true : level === "quarter" ? hasYear : hasQuarter);
  const canAddGoal = (level: Level) =>
    level === "year" ? hasYear : level === "quarter" ? hasQuarter && hasYearGoal : hasWeek && hasQuarterGoal;
  /** The page to land on when `level` can't be opened yet. */
  const nearestOpen = (level: Level): Level => (canOpen(level) ? level : canOpen("quarter") ? "quarter" : "year");

  return {
    ready: !settling,
    step,
    /** Where the home redirect sends you: the first page that needs you. */
    homePage: STEP_PAGE[step],
    hasYear,
    hasQuarter,
    hasWeek,
    hasYearGoal,
    hasQuarterGoal,
    canOpen,
    canAddGoal,
    nearestOpen,
  };
}

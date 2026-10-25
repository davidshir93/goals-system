import { EmptyPanel } from "@/components/EmptyPanel";
import { PageEnter } from "@/components/PageEnter";
import { NewPeriodButton } from "@/components/NewPeriodButton";
import { useOnboarding } from "@/hooks/useOnboarding";
import { ParentGoalsToggle } from "@/components/ParentGoalsToggle";
import { PeriodNotesButton } from "@/components/PeriodNotesButton";
import { PlusIcon } from "@/components/icons";
import { PeriodHeader } from "@/components/PeriodHeader";
import GoalCard from "@/components/GoalCard";
import { SortableGoalGrid } from "@/components/SortableGoalGrid";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import {
  useCategories,
  UseEditWeeklyGoal,
  useQuarterlyGoals,
  useQuarters,
  useYears,
  useWeeklyGoals,
  useWeeks,
  useYearlyGoals,
  useDeleteWeeklyGoal,
  useCopyWeeklyGoals,
  useUpdateWeekNotes,
  useReorderWeeklyGoals,
} from "@/data/queries";
import type { ID } from "@/types/GoalTypes";
import { enrichGoal } from "@/utils/goalsUtils";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { flushSync } from "react-dom";
import { getMotion, prefersReducedMotion } from "@/tokens/motion";
import { categoryColorVar } from "@/tokens/categories";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

/** A goal with nothing planned is never "complete": it stays in Up next and out of the counts. */
const isComplete = (g: { done: number; planned: number }) => g.planned > 0 && g.done >= g.planned;

export default function Week() {
  const { t } = useTranslation()
  const { user } = useAuth();

  const { selectedYear, selectedQuarter, selectedWeek } = useGoals();

  const [showParentsGoals, setShowParentGoals] = useState(false);

  const navigate = useNavigate();
  const onboarding = useOnboarding();

  const newClick = () => {
    navigate("new");
  };

  const { data: categories, error: catErr } = useCategories(user?.uid || "");
  const { data: yearlyGoals, error: yearlyGoalsErr } = useYearlyGoals(
    user?.uid || "",
    selectedYear
  );
  const { data: quarterlyGoals, error: quarterlyGoalsErr } = useQuarterlyGoals(
    user?.uid || "",
    selectedYear,
    selectedQuarter
  );
  const { data: weeklyGoals, error: weeklyGoalsErr } = useWeeklyGoals(
    user?.uid || "",
    selectedYear,
    selectedQuarter,
    selectedWeek
  );

  // Get period names for context
  const { data: years } = useYears(user?.uid || "");
  const { data: quarters } = useQuarters(user?.uid || "", selectedYear);
  const quarterName = quarters?.find((q) => q.id === selectedQuarter)?.name;
  const yearName = years?.find((y) => y.id === selectedYear)?.name;
  const { data: weeks } = useWeeks(user?.uid || "", selectedYear, selectedQuarter);
  const currentWeek = weeks?.find(w => w.id === selectedWeek);

  // Sort goals by sortOrder
  const sortedWeeklyGoals = useMemo(() => {
    if (!weeklyGoals) return [];
    return [...weeklyGoals].sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [weeklyGoals]);

  const displayedGoals = sortedWeeklyGoals;

  /* ── Up next / Done this week ────────────────────────────────────
   * A goal that has just been completed stays in Up next while its
   * completion moment plays (see runCompletion), then moves to Done. */
  const [holdInUpNext, setHoldInUpNext] = useState<Set<ID>>(() => new Set());
  const isDone = (g: { id: ID; done: number; planned: number }) =>
    isComplete(g) && !holdInUpNext.has(g.id);
  const upNextGoals = useMemo(
    () => sortedWeeklyGoals.filter((g) => !isDone(g)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedWeeklyGoals, holdInUpNext]
  );
  const doneGoals = useMemo(
    () => sortedWeeklyGoals.filter((g) => isDone(g)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sortedWeeklyGoals, holdInUpNext]
  );

  // Latest goals for async code, which would otherwise see a stale render.
  const goalsRef = useRef(sortedWeeklyGoals);
  goalsRef.current = sortedWeeklyGoals;
  const completionRuns = useRef(new Map<ID, number>());
  // Card positions taken just before a done goal is moved back to Up next.
  const pendingFlip = useRef<{ rects: Map<string, DOMRect>; at: number } | null>(null);

  // Weekly summary: the score is the average of each goal's progress (capped at 100%),
  // so one big goal can't hide the others. Counts come from the same goals — no extra fetch.
  const weeklyStats = useMemo(() => {
    const goals = sortedWeeklyGoals ?? [];
    const ratio = (g: { done: number; planned: number }) => (g.planned > 0 ? Math.min(g.done / g.planned, 1) : 0);
    const percent = goals.length ? Math.round((goals.reduce((sum, g) => sum + ratio(g), 0) / goals.length) * 100) : 0;
    return {
      percent,
      goals: goals.length,
      complete: goals.filter(isComplete).length,
      steps: goals.reduce((sum, g) => sum + Math.min(g.done, g.planned), 0),
      planned: goals.reduce((sum, g) => sum + g.planned, 0),
    };
  }, [sortedWeeklyGoals]);

  const useEditWeeklyGoal = UseEditWeeklyGoal();
  const deleteWeeklyGoal = useDeleteWeeklyGoal();
  const reorderWeeklyGoals = useReorderWeeklyGoals();

  const onEditWeeklyProgress = (goalId: ID, done: number) => {
    const goal = goalsRef.current.find((g) => g.id === goalId);
    if (goal) {
      const wasDone = isComplete(goal);
      const nowDone = isComplete({ ...goal, done });
      if (!wasDone && nowDone) {
        setHoldInUpNext((prev) => new Set(prev).add(goalId));
        void runCompletion(goalId);
      } else if (wasDone && !nowDone && !holdInUpNext.has(goalId)) {
        // Leaving Done: measure now, animate once the card has moved (see the layout effect below).
        pendingFlip.current = { rects: cardRects(), at: Date.now() };
      }
    }
    useEditWeeklyGoal.mutate({
      uid: user!.uid,
      yearId: selectedYear,
      quarterId: selectedQuarter,
      weekId: selectedWeek,
      goalId,
      updatedFields: { done },
    });
    return;
  };

  /* ── Completion moment ───────────────────────────────────────────
   * fill (stepper) → trophy (stepper) + colour wave → hold → lift →
   * move to Done, still lifted → settle. Values: tokens/motion.mjs.
   * Cancelled if the goal stops being complete (the user pressed −). */
  const cardEl = (id: ID) => document.querySelector<HTMLElement>(`[data-goal-id="${CSS.escape(id)}"]`);
  const cardRects = () =>
    new Map(
      [...document.querySelectorAll<HTMLElement>("[data-goal-id]")].map((el) => [el.dataset.goalId!, el.getBoundingClientRect()])
    );
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  const releaseToDone = (id: ID) =>
    flushSync(() =>
      setHoldInUpNext((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      })
    );
  const focusIncrease = (id: ID) =>
    cardEl(id)?.querySelector<HTMLElement>("[data-stepper-inc]")?.focus({ preventScroll: true });
  const slideOthers = (before: Map<string, DOMRect>, skip: ID | null, duration: number, easing: string) => {
    for (const node of document.querySelectorAll<HTMLElement>("[data-goal-id]")) {
      const id = node.dataset.goalId!;
      const a = before.get(id);
      if (id === skip || !a) continue;
      const b = node.getBoundingClientRect();
      const dx = a.left - b.left;
      const dy = a.top - b.top;
      if (dx || dy) node.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration, easing });
    }
  };

  async function runCompletion(id: ID) {
    const run = (completionRuns.current.get(id) ?? 0) + 1;
    completionRuns.current.set(id, run);
    const stillComplete = () => {
      const g = goalsRef.current.find((x) => x.id === id);
      return !!g && isComplete(g);
    };
    const alive = () => completionRuns.current.get(id) === run && stillComplete();
    const abort = () => {
      // Pressed − mid-moment: the goal is not complete, so it simply stays in Up next.
      if (completionRuns.current.get(id) === run && !stillComplete())
        setHoldInUpNext((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
    };
    const m = getMotion();
    const reduced = prefersReducedMotion();
    const LIFTED = "0 18px 40px rgb(0 0 0 / 0.18)";
    const FLAT = "0 0 0 rgb(0 0 0 / 0)";

    // 1 · wait for the fill to land, then the colour wave (the stepper pops the trophy at the same moment)
    await wait(m.progress.duration);
    if (!alive()) return abort();
    const el = cardEl(id);
    if (!el) return releaseToDone(id);
    if (!reduced)
      el.animate(
        [
          { boxShadow: "0 0 0 0 color-mix(in srgb, var(--goal-color) 60%, transparent)" },
          { boxShadow: "0 0 0 14px color-mix(in srgb, var(--goal-color) 0%, transparent)" },
        ],
        { duration: m.wave.duration, easing: m.wave.easing }
      );

    // 2 · let the trophy register
    await wait(m.trophy.duration + m.completeHold.duration);
    if (!alive()) return abort();
    // Completed from the expanded view: finish the moment once it has closed back into the card,
    // so the card doesn't move away from under the open dialog.
    while (cardEl(id)?.querySelector("[data-expanded]")) {
      await wait(100);
      if (!alive()) return abort();
    }
    const hadFocus = el.contains(document.activeElement);

    // Reduced motion: nothing moves — fade out of Up next, fade into Done.
    if (reduced) {
      await el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: m.move.duration, fill: "forwards" }).finished;
      releaseToDone(id);
      cardEl(id)?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: m.move.duration });
      if (hadFocus) focusIncrease(id);
      return;
    }

    // 3 · lift
    const s = m.lift.scale ?? 1;
    el.style.position = "relative";
    el.style.zIndex = "3";
    const lift = el.animate(
      [{ transform: "scale(1)", boxShadow: FLAT }, { transform: `scale(${s})`, boxShadow: LIFTED }],
      { duration: m.lift.duration, easing: m.lift.easing, fill: "forwards" }
    );
    await lift.finished;
    if (!alive()) {
      lift.cancel();
      el.style.zIndex = "";
      return abort();
    }

    // 4 · move to Done, still lifted (FLIP: measure, move in the DOM, animate from the old place)
    const before = cardRects();
    releaseToDone(id);
    slideOthers(before, id, m.move.duration, m.move.easing);
    const moved = cardEl(id);
    if (!moved) return; // the card is no longer on the page
    if (hadFocus) focusIncrease(id); // the card was re-mounted in the other section; keep keyboard users in place
    const a = before.get(id)!;
    const b = moved.getBoundingClientRect();
    const dx = a.left + a.width / 2 - (b.left + b.width / 2);
    const dy = a.top + a.height / 2 - (b.top + b.height / 2);
    moved.style.position = "relative";
    moved.style.zIndex = "3";
    const move = moved.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${s})`, boxShadow: LIFTED },
        { transform: `scale(${s})`, boxShadow: LIFTED },
      ],
      { duration: m.move.duration, easing: m.move.easing, fill: "forwards" }
    );
    await move.finished;

    // 5 · settle
    const settle = moved.animate(
      [{ transform: `scale(${s})`, boxShadow: LIFTED }, { transform: "none", boxShadow: FLAT }],
      { duration: m.settle.duration, easing: m.settle.easing, fill: "forwards" }
    );
    await settle.finished;
    move.cancel();
    settle.cancel();
    moved.style.zIndex = "";
  }

  // A done goal moved back to Up next: slide every card from where it was.
  const sectionsKey = upNextGoals.map((g) => g.id).join() + "|" + doneGoals.map((g) => g.id).join();
  useLayoutEffect(() => {
    const p = pendingFlip.current;
    if (!p) return;
    pendingFlip.current = null;
    if (Date.now() - p.at > 2000 || prefersReducedMotion()) return;
    const m = getMotion();
    slideOthers(p.rects, null, m.move.duration, m.move.easing);
     
  }, [sectionsKey]);

  // Get the parent yearly goal for a weekly goal (via its parent quarterly goal)
  const getParentYearGoal = (parentQuarterGoalId: ID | undefined) => {
    if (!parentQuarterGoalId || !quarterlyGoals || !yearlyGoals) return undefined;
    const quarterGoal = quarterlyGoals.find(qg => qg.id === parentQuarterGoalId);
    if (!quarterGoal?.parentYearGoalId) return undefined;
    return yearlyGoals.find(yg => yg.id === quarterGoal.parentYearGoalId);
  };

  const handleDeleteWeeklyGoal = (goalId: ID) => {
    deleteWeeklyGoal.mutate({
      uid: user!.uid,
      yearId: selectedYear,
      quarterId: selectedQuarter,
      weekId: selectedWeek,
      goalId,
    });
  };

  const handleReorder = (orderedIds: ID[]) => {
    reorderWeeklyGoals.mutate({
      uid: user!.uid,
      yearId: selectedYear,
      quarterId: selectedQuarter,
      weekId: selectedWeek,
      orderedGoalIds: orderedIds,
    });
  };

  const copyWeeklyGoals = useCopyWeeklyGoals();

  // Find previous week (in same quarter or previous quarter)
  const getPreviousWeek = () => {
    if (!weeks || !quarters) return null;

    // Sort weeks by name (W1, W2, ..., W13)
    const sortedWeeks = [...weeks].sort((a, b) => {
      const aNum = parseInt(a.name.replace('W', ''));
      const bNum = parseInt(b.name.replace('W', ''));
      return aNum - bNum;
    });

    const currentWeekIndex = sortedWeeks.findIndex(w => w.id === selectedWeek);

    if (currentWeekIndex > 0) {
      // Previous week is in the same quarter
      return {
        quarterId: selectedQuarter,
        weekId: sortedWeeks[currentWeekIndex - 1].id,
      };
    }

    // Need to look in previous quarter
    const sortedQuarters = [...quarters].sort((a, b) => {
      const aNum = parseInt(a.name.replace('Q', ''));
      const bNum = parseInt(b.name.replace('Q', ''));
      return aNum - bNum;
    });

    const currentQuarterIndex = sortedQuarters.findIndex(q => q.id === selectedQuarter);

    if (currentQuarterIndex > 0) {
      // Get last week of previous quarter (W13)
      const prevQuarter = sortedQuarters[currentQuarterIndex - 1];
      return {
        quarterId: prevQuarter.id,
        weekId: `${prevQuarter.id}-13`, // Assuming week ID format
      };
    }

    return null; // No previous week found
  };

  const previousWeek = getPreviousWeek();

  const handleCopyFromLastWeek = () => {
    if (!previousWeek || !user) return;

    copyWeeklyGoals.mutate({
      uid: user.uid,
      yearId: selectedYear,
      sourceQuarterId: previousWeek.quarterId,
      sourceWeekId: previousWeek.weekId,
      targetQuarterId: selectedQuarter,
      targetWeekId: selectedWeek,
    });
  };

  const updateWeekNotes = useUpdateWeekNotes();

  const handleSaveWeekNotes = (notes: string) => {
    updateWeekNotes.mutate({
      uid: user!.uid,
      yearId: selectedYear,
      quarterId: selectedQuarter,
      weekId: selectedWeek,
      notes,
    });
  };

  const hasGoals = Boolean(displayedGoals && displayedGoals.length > 0);
  const showAddGoal = onboarding.canAddGoal("week") && hasGoals;
  const weekName = currentWeek ? `${t('periods.week')} ${currentWeek.name.replace(/^w/i, "")}` : "";
  const emptyState = !onboarding.hasWeek ? (
    <EmptyPanel
      title={t('onboarding.createWeekTitle', { quarter: quarterName ?? "" })}
      description={t('onboarding.createWeekDesc')}
      actions={<NewPeriodButton type="week" label={t('onboarding.createWeek')} />}
    />
  ) : !onboarding.hasYearGoal ? (
    <EmptyPanel
      title={t('onboarding.needYearGoalTitle')}
      description={t('onboarding.needYearGoalDesc', { year: yearName ?? "" })}
      actions={<Button onClick={() => navigate("/year")}>{t('onboarding.goToYear', { year: yearName ?? "" })}</Button>}
    />
  ) : !onboarding.hasQuarterGoal ? (
    // A weekly goal needs a quarter goal as its parent.
    <EmptyPanel
      title={t('onboarding.needQuarterGoalTitle')}
      description={t('onboarding.needQuarterGoalDesc', { quarter: quarterName ?? "" })}
      actions={<Button onClick={() => navigate("/quarter")}>{t('onboarding.goToQuarter', { quarter: quarterName ?? "" })}</Button>}
    />
  ) : (
    <EmptyPanel
      title={t('onboarding.firstWeekGoalTitle', { week: weekName })}
      description={t('onboarding.firstWeekGoalDesc')}
      actions={
        <>
          <Button onClick={newClick}><PlusIcon />{t('goals.addGoal')}</Button>
          {previousWeek && (
            <Button
              variant="outline"
              onClick={handleCopyFromLastWeek}
              disabled={copyWeeklyGoals.isPending}
            >
              {copyWeeklyGoals.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></span>
                  {t('common.loading')}
                </span>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ltr:mr-2 rtl:ml-2">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
                  </svg>
                  {t('periods.copyFromLast')}
                </>
              )}
            </Button>
          )}
        </>
      }
    />
  );

  if (weeklyGoalsErr || quarterlyGoalsErr || yearlyGoalsErr || catErr) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="type-body-title text-destructive">{t('goals.failedWeekly')}</p>
        <p className="type-body-text text-destructive/80 mt-1">{t('common.tryRefreshing')}</p>
      </div>
    );
  }

  const renderGoalCard = (item: { id: ID }) => {
    const goal = sortedWeeklyGoals.find((g) => g.id === item.id)!;
    const enrichedGoal = enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!);
    const parentYearGoal = getParentYearGoal(goal.parentQuarterGoalId);
    return (
      // Animated wrapper: the completion moment moves this, not dnd-kit's sortable item.
      <div
        data-goal-id={goal.id}
        className="h-full rounded-xl"
        style={{ "--goal-color": categoryColorVar(enrichedGoal.category?.color, "fill", "var(--text-primary)") } as CSSProperties}
      >
        <GoalCard
          goal={enrichedGoal}
          onEditWeeklyProgress={onEditWeeklyProgress}
          showParentGoals={showParentsGoals}
          onDelete={handleDeleteWeeklyGoal}
          canDelete={true}
          parentYearGoal={parentYearGoal}
          quarterName={quarterName}
          yearName={yearName}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6 max-sm:pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PeriodHeader
          level="week"
        />
        {showAddGoal && (
          <div className="hidden items-center gap-3 sm:flex">
            <Button onClick={newClick}>
              <PlusIcon />
              {t('goals.addGoal')}
            </Button>
          </div>
        )}
      </div>

      {/* Toolbar: "Up next" on the left; page tools on the right */}
      <div className="flex min-h-9 items-center justify-between gap-4">
        {upNextGoals.length > 0 ? (
          <h2 id="week-up-next" className="type-body-title flex items-baseline gap-2">
            {t('goals.upNext')}
            <span className="type-body-title tabular-nums text-[var(--text-muted)]">{upNextGoals.length}</span>
          </h2>
        ) : <span />}
        {onboarding.hasWeek && (
          <div className="flex items-center gap-2">
            {hasGoals && <ParentGoalsToggle pressed={showParentsGoals} onPressedChange={setShowParentGoals} />}
            <PeriodNotesButton notes={currentWeek?.notes} onSave={handleSaveWeekNotes} isPending={updateWeekNotes.isPending} />
          </div>
        )}
      </div>

      {/* Goals — the only part that fades in when you switch period */}
      <PageEnter level="week" className="space-y-6">
      {/* Goals */}
      {hasGoals ? (
        <>
                    <div className="space-y-8">
            {upNextGoals.length > 0 && (
              <section aria-labelledby="week-up-next" className="space-y-4">
                <SortableGoalGrid
                  items={upNextGoals}
                  onReorder={(ids) => handleReorder([...ids, ...doneGoals.map((g) => g.id)])}
                >
                  {renderGoalCard}
                </SortableGoalGrid>
              </section>
            )}
            {doneGoals.length > 0 && (
              <section aria-labelledby="week-done" className="space-y-4">
                <h2 id="week-done" className="type-body-title flex items-baseline gap-2">
                  {t('goals.doneThisWeek')}
                  <span className="type-body-title tabular-nums text-[var(--text-muted)]">{doneGoals.length}</span>
                </h2>
                <SortableGoalGrid
                  items={doneGoals}
                  onReorder={(ids) => handleReorder([...upNextGoals.map((g) => g.id), ...ids])}
                >
                  {renderGoalCard}
                </SortableGoalGrid>
              </section>
            )}
          </div>
        </>
      ) : emptyState}

      {/* Weekly summary: score, one bar, and the counts behind it */}
      {weeklyStats.goals > 0 && (
        <section
          aria-label={t('goals.weeklySummary')}
          className="flex flex-col gap-3 rounded-xl border border-[var(--border-subtle)] bg-card p-5 sm:flex-row sm:items-center sm:gap-8 sm:px-8 sm:py-6"
        >
          <p className="flex shrink-0 items-baseline gap-2 sm:flex-col sm:gap-0">
            <span className="type-display tabular-nums text-[var(--signal-success-text)] sm:type-page-title">{weeklyStats.percent}%</span>
            <span className="type-body-text text-[var(--text-secondary)]">{t('goals.weekDone')}</span>
          </p>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div
              role="progressbar"
              aria-label={t('goals.weeklySummary')}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={weeklyStats.percent}
              aria-valuetext={t('goals.percentComplete', { percent: weeklyStats.percent })}
              className="h-3 overflow-hidden rounded-full bg-[var(--surface-track)]"
            >
              <div
                className="h-full rounded-full bg-[var(--signal-success-fill)]"
                style={{
                  width: `${weeklyStats.percent}%`,
                  transition: "width var(--motion-progress-duration) var(--motion-progress-easing)",
                }}
              />
            </div>
            <p className="type-body-text text-[var(--text-secondary)]">
              {t('goals.weekCounts', weeklyStats)}
            </p>
          </div>
        </section>
      )}

      </PageEnter>

      {/* Phone: Add goal floats at the bottom, as in the mobile design */}
      {showAddGoal && (
        <Button
          onClick={newClick}
          className="fixed end-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 h-12 px-5 shadow-lg sm:hidden"
        >
          <PlusIcon />
          {t('goals.addGoal')}
        </Button>
      )}
    </div>
  );
}

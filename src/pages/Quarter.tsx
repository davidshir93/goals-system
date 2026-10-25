import { EmptyPanel } from "@/components/EmptyPanel";
import { PageEnter } from "@/components/PageEnter";
import { NextStepHint } from "@/components/NextStepHint";
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
  useQuarterlyGoals,
  useQuarters,
  useYears,
  useYearlyGoals,
  useWeeks,
  useDeleteQuarterlyGoal,
  useUpdateQuarterNotes,
  useReorderQuarterlyGoals,
} from "@/data/queries";
import type { ID, WeekGoal } from "@/types/GoalTypes";
import { enrichGoal } from "@/utils/goalsUtils";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueries } from "@tanstack/react-query";
import { WeeklyGoals } from "@/data/repos";

export default function Quarter() {
  const { t } = useTranslation()
  const { user } = useAuth();

  const { selectedYear, selectedQuarter } = useGoals();

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

  // Get period names for context
  const { data: years } = useYears(user?.uid || "");
  const { data: quarters } = useQuarters(user?.uid || "", selectedYear);
  const { data: weeks } = useWeeks(user?.uid || "", selectedYear, selectedQuarter);

  const deleteQuarterlyGoal = useDeleteQuarterlyGoal();

  // Fetch all weekly goals across all weeks to check for children
  const weeklyGoalsQueries = useQueries({
    queries: (weeks || []).map((week) => ({
      queryKey: ['weeklyGoals', user?.uid, selectedYear, selectedQuarter, week.id],
      queryFn: () => WeeklyGoals.listAll(user!.uid, selectedYear, selectedQuarter, week.id),
      enabled: !!user?.uid && !!selectedYear && !!selectedQuarter && !!week.id,
    })),
  });

  // Flatten all weekly goals to check for parent links
  const allWeeklyGoals: WeekGoal[] = weeklyGoalsQueries
    .filter(q => q.data)
    .flatMap(q => q.data as WeekGoal[]);

  // Check if a quarterly goal has weekly children
  const hasWeeklyChildren = (quarterGoalId: ID): boolean => {
    return allWeeklyGoals.some(wg => wg.parentQuarterGoalId === quarterGoalId);
  };

  // Get the parent yearly goal for a quarterly goal
  const getParentYearGoal = (parentYearGoalId: ID | undefined) => {
    if (!parentYearGoalId || !yearlyGoals) return undefined;
    return yearlyGoals.find(yg => yg.id === parentYearGoalId);
  };

  const handleDeleteQuarterlyGoal = (goalId: ID) => {
    deleteQuarterlyGoal.mutate({
      uid: user!.uid,
      yearId: selectedYear,
      quarterId: selectedQuarter,
      goalId,
    });
  };

  const reorderQuarterlyGoals = useReorderQuarterlyGoals();

  const handleReorder = (orderedIds: ID[]) => {
    reorderQuarterlyGoals.mutate({
      uid: user!.uid,
      yearId: selectedYear,
      quarterId: selectedQuarter,
      orderedGoalIds: orderedIds,
    });
  };

  const updateQuarterNotes = useUpdateQuarterNotes();

  const handleSaveQuarterNotes = (notes: string) => {
    updateQuarterNotes.mutate({
      uid: user!.uid,
      yearId: selectedYear,
      quarterId: selectedQuarter,
      notes,
    });
  };
  const currentQuarter = quarters?.find(q => q.id === selectedQuarter);
  const yearName = years?.find(y => y.id === selectedYear)?.name;

  // Sort goals by sortOrder
  const sortedQuarterlyGoals = useMemo(() => {
    if (!quarterlyGoals) return [];
    return [...quarterlyGoals].sort((a, b) => {
      const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER;
      const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER;
      return orderA - orderB;
    });
  }, [quarterlyGoals]);

  const enrichedQuarterlyGoals = useMemo(() => {
    return sortedQuarterlyGoals.map((goal) =>
      enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!)
    );
  }, [sortedQuarterlyGoals, quarterlyGoals, yearlyGoals, categories]);

  const hasGoals = enrichedQuarterlyGoals.length > 0;
  const showAddGoal = onboarding.canAddGoal("quarter") && hasGoals;
  const quarterName = currentQuarter?.name ?? "";
  const emptyState = !onboarding.hasQuarter ? (
    <EmptyPanel
      title={t('onboarding.createQuarterTitle', { year: yearName ?? "" })}
      description={t('onboarding.createQuarterDesc')}
      actions={<NewPeriodButton type="quarter" label={t('onboarding.createQuarter')} />}
    />
  ) : !onboarding.hasYearGoal ? (
    // A quarter goal needs a yearly goal as its parent — send them there instead of an empty form.
    <EmptyPanel
      title={t('onboarding.needYearGoalTitle')}
      description={t('onboarding.needYearGoalDesc', { year: yearName ?? "" })}
      actions={<Button onClick={() => navigate("/year")}>{t('onboarding.goToYear', { year: yearName ?? "" })}</Button>}
    />
  ) : (
    <EmptyPanel
      title={t('onboarding.firstQuarterGoalTitle', { quarter: quarterName })}
      description={t('onboarding.firstQuarterGoalDesc')}
      actions={<Button onClick={newClick}><PlusIcon />{t('onboarding.addQuarterGoal')}</Button>}
    />
  );

  if (quarterlyGoalsErr || yearlyGoalsErr || catErr) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="type-body-title text-destructive">{t('goals.failedQuarterly')}</p>
        <p className="type-body-text text-destructive/80 mt-1">{t('common.tryRefreshing')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-sm:pb-[calc(5rem+env(safe-area-inset-bottom))]">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PeriodHeader
          level="quarter"
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

      {/* Toolbar: page tools */}
      {onboarding.hasQuarter && (
        <div className="flex items-center justify-end gap-2">
          {hasGoals && <ParentGoalsToggle pressed={showParentsGoals} onPressedChange={setShowParentGoals} />}
          <PeriodNotesButton notes={currentQuarter?.notes} onSave={handleSaveQuarterNotes} isPending={updateQuarterNotes.isPending} />
        </div>
      )}

      {/* Goals — the only part that fades in when you switch period */}
      <PageEnter level="quarter" className="space-y-6">
      {/* Goals */}
      {hasGoals ? (
        <>
                    <SortableGoalGrid
            items={sortedQuarterlyGoals}
            onReorder={handleReorder}
          >
            {(item) => {
              const goal = enrichedQuarterlyGoals.find((g) => g.id === item.id)!;
              const hasChildren = hasWeeklyChildren(goal.id);
              const originalGoal = quarterlyGoals?.find(qg => qg.id === goal.id);
              const parentYearGoal = getParentYearGoal(originalGoal?.parentYearGoalId);
              return (
                <GoalCard
                  goal={goal}
                  showParentGoals={showParentsGoals}
                  onDelete={handleDeleteQuarterlyGoal}
                  canDelete={!hasChildren}
                  deleteWarning={hasChildren ? t('goals.deleteQuarterlyWarning') : undefined}
                  parentYearGoal={parentYearGoal}
                  yearName={yearName}
                />
              );
            }}
          </SortableGoalGrid>
        </>
      ) : emptyState}

      {/* Onboarding: where to go next once this page is done */}
      <NextStepHint level="quarter" />

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

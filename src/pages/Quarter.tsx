import GoalCard from "@/components/GoalCard";
import { GoalTableRow } from "@/components/GoalTableRow";
import { SortableGoalGrid } from "@/components/SortableGoalGrid";
import { SortableGoalTable } from "@/components/SortableGoalTable";
import { ViewToggle } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import {
  useCategories,
  useIdentities,
  useQuarterlyGoals,
  useQuarters,
  useYearlyGoals,
  useYears,
  useWeeks,
  useDeleteQuarterlyGoal,
  useUpdateQuarterNotes,
  useReorderQuarterlyGoals,
} from "@/data/queries";
import { PeriodNotes } from "@/components/PeriodNotes";
import { useViewPreference } from "@/hooks/useViewPreference";
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
  const [viewPreference, setViewPreference] = useViewPreference();

  const navigate = useNavigate();

  const newClick = () => {
    navigate("new");
  };

  const { data: categories, error: catErr } = useCategories(user?.uid || "");
  const { data: identities, error: idErr } = useIdentities(user?.uid || "");
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

  const currentYear = years?.find(y => y.id === selectedYear);
  const currentQuarter = quarters?.find(q => q.id === selectedQuarter);

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
      enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!, identities!)
    );
  }, [sortedQuarterlyGoals, quarterlyGoals, yearlyGoals, categories, identities]);

  if (quarterlyGoalsErr || yearlyGoalsErr || catErr || idErr) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-destructive font-medium">{t('goals.failedQuarterly')}</p>
        <p className="text-destructive/80 text-sm mt-1">{t('common.tryRefreshing')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span>{t('periods.quarter')} {currentQuarter?.name || ''}</span>
          <span className="text-muted-foreground font-normal">›</span>
          <span className="text-muted-foreground font-normal">{currentYear?.name}</span>
        </h1>
        <div className="flex items-center gap-4">
          <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              className="rounded border-input h-4 w-4 accent-primary shrink-0"
              checked={showParentsGoals}
              onChange={() => setShowParentGoals((prev) => !prev)}
            />
            <span className="text-muted-foreground">{t('goals.showParentGoals')}</span>
          </label>
          <ViewToggle view={viewPreference} onViewChange={setViewPreference} />
          <Button onClick={newClick} dir="ltr">
            {t('goals.addGoal')}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </Button>
        </div>
      </div>

      {/* Goals Grid/Table */}
      {enrichedQuarterlyGoals && enrichedQuarterlyGoals.length > 0 ? (
        <>
          {/* Table View - Only on lg screens when table preference is set */}
          {viewPreference === "table" && (
            <SortableGoalTable
              items={sortedQuarterlyGoals}
              onReorder={handleReorder}
              className="hidden lg:block"
              showParentGoals={showParentsGoals}
            >
              {(item, _index, dragHandleProps, isDragging) => {
                const goal = enrichedQuarterlyGoals.find((g) => g.id === item.id)!;
                const hasChildren = hasWeeklyChildren(goal.id);
                const originalGoal = quarterlyGoals?.find(qg => qg.id === goal.id);
                const parentYearGoal = getParentYearGoal(originalGoal?.parentYearGoalId);
                return (
                  <GoalTableRow
                    goal={goal}
                    showParentGoals={showParentsGoals}
                    onDelete={handleDeleteQuarterlyGoal}
                    canDelete={!hasChildren}
                    deleteWarning={hasChildren ? t('goals.deleteQuarterlyWarning') : undefined}
                    parentYearGoal={parentYearGoal}
                    dragHandleProps={dragHandleProps}
                    isDragging={isDragging}
                  />
                );
              }}
            </SortableGoalTable>
          )}
          {/* Card View - Always on mobile, or on desktop when card preference is set */}
          <SortableGoalGrid
            items={sortedQuarterlyGoals}
            onReorder={handleReorder}
            className={viewPreference === "table" ? "lg:hidden" : ""}
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
                />
              );
            }}
          </SortableGoalGrid>
        </>
      ) : (
        <div className="text-center py-12">
          <div className="rounded-full bg-muted p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">{t('goals.noQuarterlyGoals')}</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {t('goals.noQuarterlyGoalsDesc')}
          </p>
          <Button onClick={newClick}>{t('goals.addFirstGoal')}</Button>
        </div>
      )}

      {/* Period Notes */}
      <PeriodNotes
        notes={currentQuarter?.notes}
        onSave={handleSaveQuarterNotes}
        isPending={updateQuarterNotes.isPending}
      />
    </div>
  );
}

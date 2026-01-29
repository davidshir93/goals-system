import GoalCard from "@/components/GoalCard";
import { GoalTableRow } from "@/components/GoalTableRow";
import { SortableGoalGrid } from "@/components/SortableGoalGrid";
import { SortableGoalTable } from "@/components/SortableGoalTable";
import { ViewToggle } from "@/components/ViewToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import {
  useCategories,
  UseEditWeeklyGoal,
  useIdentities,
  useQuarterlyGoals,
  useQuarters,
  useWeeklyGoals,
  useWeeks,
  useYearlyGoals,
  useYears,
  useDeleteWeeklyGoal,
  useCopyWeeklyGoals,
  useUpdateWeekNotes,
  useReorderWeeklyGoals,
} from "@/data/queries";
import { PeriodNotes } from "@/components/PeriodNotes";
import { useViewPreference } from "@/hooks/useViewPreference";
import type { ID } from "@/types/GoalTypes";
import { enrichGoal } from "@/utils/goalsUtils";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Week() {
  const { t } = useTranslation()
  const { user } = useAuth();

  const { selectedYear, selectedQuarter, selectedWeek } = useGoals();

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
  const { data: weeklyGoals, error: weeklyGoalsErr } = useWeeklyGoals(
    user?.uid || "",
    selectedYear,
    selectedQuarter,
    selectedWeek
  );

  // Get period names for context
  const { data: years } = useYears(user?.uid || "");
  const { data: quarters } = useQuarters(user?.uid || "", selectedYear);
  const { data: weeks } = useWeeks(user?.uid || "", selectedYear, selectedQuarter);

  const currentYear = years?.find(y => y.id === selectedYear);
  const currentQuarter = quarters?.find(q => q.id === selectedQuarter);
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

  const weeklyAverage = useMemo(() => {
    return (
      !sortedWeeklyGoals || sortedWeeklyGoals.length === 0
        ? 0
        : (sortedWeeklyGoals
            ?.map((goal) => goal.done / goal.planned)
            .reduce((acc, curr) => acc + curr, 0) /
            sortedWeeklyGoals?.length) *
          100
    ).toFixed();
  }, [sortedWeeklyGoals]);

  const useEditWeeklyGoal = UseEditWeeklyGoal();
  const deleteWeeklyGoal = useDeleteWeeklyGoal();
  const reorderWeeklyGoals = useReorderWeeklyGoals();

  const onEditWeeklyProgress = (goalId: ID, done: number) => {
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

  if (weeklyGoalsErr || quarterlyGoalsErr || yearlyGoalsErr || catErr || idErr) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
        <p className="text-destructive font-medium">{t('goals.failedWeekly')}</p>
        <p className="text-destructive/80 text-sm mt-1">{t('common.tryRefreshing')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <span>{t('periods.week')} {currentWeek?.name || ''}</span>
          <span className="text-muted-foreground font-normal">›</span>
          <span className="text-muted-foreground font-normal">{t('periods.quarter')} {currentQuarter?.name}</span>
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
      {sortedWeeklyGoals && sortedWeeklyGoals.length > 0 ? (
        <>
          {/* Table View - Only on lg screens when table preference is set */}
          {viewPreference === "table" && (
            <SortableGoalTable
              items={sortedWeeklyGoals}
              onReorder={handleReorder}
              className="hidden lg:block"
              showParentGoals={showParentsGoals}
            >
              {(item, _index, dragHandleProps, isDragging) => {
                const goal = sortedWeeklyGoals.find((g) => g.id === item.id)!;
                const enrichedGoal = enrichGoal(
                  goal,
                  quarterlyGoals!,
                  yearlyGoals!,
                  categories!,
                  identities!
                );
                const parentYearGoal = getParentYearGoal(goal.parentQuarterGoalId);
                return (
                  <GoalTableRow
                    goal={enrichedGoal}
                    showParentGoals={showParentsGoals}
                    onEditWeeklyProgress={onEditWeeklyProgress}
                    onDelete={handleDeleteWeeklyGoal}
                    canDelete={true}
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
            items={sortedWeeklyGoals}
            onReorder={handleReorder}
            className={viewPreference === "table" ? "lg:hidden" : ""}
          >
            {(item) => {
              const goal = sortedWeeklyGoals.find((g) => g.id === item.id)!;
              const enrichedGoal = enrichGoal(
                goal,
                quarterlyGoals!,
                yearlyGoals!,
                categories!,
                identities!
              );
              const parentYearGoal = getParentYearGoal(goal.parentQuarterGoalId);
              return (
                <GoalCard
                  goal={enrichedGoal}
                  onEditWeeklyProgress={onEditWeeklyProgress}
                  showParentGoals={showParentsGoals}
                  onDelete={handleDeleteWeeklyGoal}
                  canDelete={true}
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
          <h3 className="text-lg font-semibold mb-2">{t('goals.noWeeklyGoals')}</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6">
            {t('goals.noWeeklyGoalsDesc')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={newClick}>{t('goals.addFirstGoal')}</Button>
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
          </div>
        </div>
      )}

      {/* Summary Card */}
      {weeklyAverage !== "0" && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold">{t('goals.weeklySummary')}</CardTitle>
          </CardHeader>
          <CardContent>
            <Slider
              value={[Number(weeklyAverage)]}
              max={100}
              step={1}
              className="cursor-not-allowed"
              doneColor="lightgreen"
              disabled
              isSummary
            />
            <p className="text-center text-sm text-muted-foreground mt-3">
              {t('goals.percentComplete', { percent: weeklyAverage })}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Period Notes */}
      <PeriodNotes
        notes={currentWeek?.notes}
        onSave={handleSaveWeekNotes}
        isPending={updateWeekNotes.isPending}
      />
    </div>
  );
}

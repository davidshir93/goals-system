import GoalCard from "@/components/GoalCard";
import { GoalGrid } from "@/components/GoalGrid";
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
} from "@/data/queries";
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

  const weeklyAverage = useMemo(() => {
    return (
      !weeklyGoals || weeklyGoals.length === 0
        ? 0
        : (weeklyGoals
            ?.map((goal) => goal.done / goal.planned)
            .reduce((acc, curr) => acc + curr, 0) /
            weeklyGoals?.length) *
          100
    ).toFixed();
  }, [weeklyGoals]);

  const useEditWeeklyGoal = UseEditWeeklyGoal();

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
        <div>
          <p className="text-sm text-muted-foreground">
            {currentYear?.name} · {currentQuarter?.name}
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{t('periods.week')} {currentWeek?.name || ''}</h1>
        </div>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              className="rounded border-input h-4 w-4"
              checked={showParentsGoals}
              onChange={() => setShowParentGoals((prev) => !prev)}
            />
            <span className="text-muted-foreground">{t('goals.showParentGoals')}</span>
          </label>
          <Button onClick={newClick}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ltr:mr-2 rtl:ml-2">
              <path d="M5 12h14" />
              <path d="M12 5v14" />
            </svg>
            {t('goals.addGoal')}
          </Button>
        </div>
      </div>

      {/* Goals Grid */}
      {weeklyGoals && weeklyGoals.length > 0 ? (
        <GoalGrid>
          {weeklyGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={enrichGoal(
                goal,
                quarterlyGoals!,
                yearlyGoals!,
                categories!,
                identities!
              )}
              onEditWeeklyProgress={onEditWeeklyProgress}
              showParentGoals={showParentsGoals}
            />
          ))}
        </GoalGrid>
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
          <Button onClick={newClick}>{t('goals.addFirstGoal')}</Button>
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
    </div>
  );
}

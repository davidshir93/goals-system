import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import {
  useCategories,
  UseEditWeeklyGoal,
  useIdentities,
  useQuarterlyGoals,
  useWeeklyGoals,
  useYearlyGoals,
} from "@/data/queries";
import type { ID } from "@/types/GoalTypes";
import { enrichGoal } from "@/utils/goalsUtils";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Week() {
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
      <div className="p-4 rounded-lg bg-red-50 border border-red-200">
        <p className="text-red-700 font-medium">Failed to load weekly goals</p>
        <p className="text-red-600 text-sm mt-1">Please try refreshing the page.</p>
      </div>
    );
  }

  return (
    <>
      <div className="flex gap-4 p-4">
        <input
          type="checkbox"
          className="text-sm"
          checked={showParentsGoals}
          onChange={() => setShowParentGoals((prev) => !prev)}
        />
        <Label>Show Parents Goals</Label>
      </div>
      <ul>
        {weeklyGoals?.map((goal) => (
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
        {weeklyAverage !== "0" && (
          <div>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-3xl font-extrabold">
                  Weekly Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Slider
                  value={[Number(weeklyAverage)]}
                  max={100}
                  step={1}
                  className="mt-2 cursor-not-allowed"
                  doneColor="lightgreen"
                  disabled
                  isSummary
                />
              </CardContent>
            </Card>
          </div>
        )}

        <li>
          <Button onClick={newClick}>Add weekly goal</Button>
        </li>
      </ul>
    </>
  );
}

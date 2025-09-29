
import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import { useCategories, useIdentities, useQuarterlyGoals, useWeeklyGoals, useYearlyGoals } from "@/data/queries";
import { WeeklyGoals } from "@/data/repos";
import type { ID } from "@/types/GoalTypes";
import { enrichGoal } from "@/utils/goalsUtils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Week() {
    const { user } = useAuth();

    const { selectedYear, selectedQuarter, selectedWeek } = useGoals();

    const [showParentsGoals, setShowParentGoals] = useState(true)

    const navigate = useNavigate();

    const newClick = () => {
        navigate("new");
    };

    const { data: categories, isLoading: catLoading, error: catErr } = useCategories(user?.uid || "");
    const { data: identities, isLoading: idLoading, error: idErr } = useIdentities(user?.uid || "");
    const { data: yearlyGoals, isLoading: yearlyGoalsLoading, error: yearlyGoalsErr } = useYearlyGoals(user?.uid || "", selectedYear);
    const { data: quarterlyGoals, isLoading: quarterlyGoalsLoading, error: quarterlyGoalsErr } = useQuarterlyGoals(user?.uid || "", selectedYear, selectedQuarter);
    const { data: weeklyGoals, isLoading: weeklyGoalsLoading, error: weeklyGoalsErr } = useWeeklyGoals(user?.uid || "", selectedYear, selectedQuarter, selectedWeek);

    if (weeklyGoalsLoading || weeklyGoalsErr || quarterlyGoalsLoading || quarterlyGoalsErr || yearlyGoalsLoading || yearlyGoalsErr || catLoading || catErr || idLoading || idErr) return "Waittttt";


    const onEditWeeklyProgress = async (goalId: ID, done: number) => {
        const updatedGoalId = await WeeklyGoals.editWeeklyGoal(user!.uid, selectedYear, selectedQuarter, selectedWeek, goalId, { done })
        console.log('updatedGoal' + updatedGoalId);
        return updatedGoalId
    }

    return (
        <>
            <div className="flex gap-4 p-4">

                {/* <Input type="checkbox" className='text-sm' checked={showParentsGoals} onChange={() => setShowParentGoals(prev => !prev)} /> */}
                <input type="checkbox" className='text-sm' checked={showParentsGoals} onChange={() => setShowParentGoals(prev => !prev)} />
                <Label>Show Parents Goals</Label>
            </div>
            <label></label>
            <ul>
                {weeklyGoals?.map((goal) => (
                    <GoalCard
                        key={goal.id}
                        goal={enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!, identities!)}
                        onEditWeeklyProgress={onEditWeeklyProgress}
                        showParentGoals={showParentsGoals}
                    />
                ))}
                <li>
                    <Button onClick={newClick}>Add weekly goal</Button>
                </li>
            </ul>
        </>
    );
}

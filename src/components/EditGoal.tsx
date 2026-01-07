import { useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext";
import { useYearlyGoals, useQuarterlyGoals, useWeeklyGoals } from "@/data/queries";
import GoalForm from "./GoalForm";

type EditGoalProps = {
    type: 'year' | 'quarter' | 'week';
};

export default function EditGoal({ type }: EditGoalProps) {
    const { goalId } = useParams<{ goalId: string }>();
    const { user } = useAuth();
    const { selectedYear, selectedQuarter, selectedWeek } = useGoals();

    const { data: yearlyGoals, isLoading: yearLoading } = useYearlyGoals(
        user?.uid || '',
        selectedYear
    );

    const { data: quarterlyGoals, isLoading: quarterLoading } = useQuarterlyGoals(
        user?.uid || '',
        selectedYear,
        selectedQuarter
    );

    const { data: weeklyGoals, isLoading: weekLoading } = useWeeklyGoals(
        user?.uid || '',
        selectedYear,
        selectedQuarter,
        selectedWeek
    );

    const isLoading = yearLoading || quarterLoading || weekLoading;

    if (isLoading) {
        return <div className="p-3 text-yellow-600">Loading goal...</div>;
    }

    let existingGoal;
    if (type === 'year') {
        existingGoal = yearlyGoals?.find(g => g.id === goalId);
    } else if (type === 'quarter') {
        existingGoal = quarterlyGoals?.find(g => g.id === goalId);
    } else {
        existingGoal = weeklyGoals?.find(g => g.id === goalId);
    }

    if (!existingGoal) {
        return <div className="p-3 text-red-600">Goal not found</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit {type.charAt(0).toUpperCase() + type.slice(1)} Goal</h1>
            <GoalForm type={type} goalId={goalId} existingGoal={existingGoal} />
        </div>
    );
}

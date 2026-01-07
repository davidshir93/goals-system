import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useCategories, useIdentities, useQuarterlyGoals, useYearlyGoals } from "@/data/queries";
import { enrichGoal } from "@/utils/goalsUtils";
import { useNavigate } from "react-router-dom";

export default function Year() {
    const { user } = useAuth()

    const { selectedYear, selectedQuarter } = useGoals();

    const navigate = useNavigate();

    const newClick = () => {
        navigate("new")
    }
    const { data: categories, isLoading: catLoading, error: catErr } = useCategories(user?.uid || "");
    const { data: identities, isLoading: idLoading, error: idErr } = useIdentities(user?.uid || "");
    const { data: yearlyGoals, isLoading: yearlyGoalsLoading, error: yearlyGoalsErr } = useYearlyGoals(user?.uid || "", selectedYear);
    const { data: quarterlyGoals, isLoading: quarterlyGoalsLoading, error: quarterlyGoalsErr } = useQuarterlyGoals(user?.uid || "", selectedYear, selectedQuarter);

    const isLoading = quarterlyGoalsLoading || yearlyGoalsLoading || catLoading || idLoading;
    const hasError = quarterlyGoalsErr || yearlyGoalsErr || catErr || idErr;

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <span className="ml-3 text-gray-600">Loading goals...</span>
            </div>
        );
    }

    if (hasError) {
        return (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                <p className="text-red-700 font-medium">Failed to load yearly goals</p>
                <p className="text-red-600 text-sm mt-1">Please try refreshing the page.</p>
            </div>
        );
    }

    return (
        <>
            <ul>
                {yearlyGoals?.map(goal => <GoalCard
                    key={goal.id}
                    goal={enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!, identities!)}
                />)}
                <li><Button onClick={newClick}>Add yearly goal</Button></li>
            </ul>

        </>

    )
}
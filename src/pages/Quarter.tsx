import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useCategories, useIdentities, useQuarterlyGoals, useYearlyGoals } from "@/data/queries";
import { enrichGoal } from "@/utils/goalsUtils";
import { useNavigate } from "react-router-dom";

export default function Quarter() {
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

    if (quarterlyGoalsLoading || quarterlyGoalsErr || yearlyGoalsLoading || yearlyGoalsErr || catLoading || catErr || idLoading || idErr) return "Waittttt";


    return (
        <>
            <ul>
                {quarterlyGoals?.map(goal => <GoalCard
                    key={goal.id}
                    goal={enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!, identities!)}
                />)}
                <li><Button onClick={newClick}>Add quarterly goal</Button></li>
            </ul>

        </>

    )
}
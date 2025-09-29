import GoalCard from "@/components/GoalCard";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useCategories, useIdentities, useQuarterlyGoals, useYearlyGoals } from "@/data/queries";
import { enrichGoal } from "@/utils/goalsUtils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Quarter() {
    const { user } = useAuth()

    const { selectedYear, selectedQuarter } = useGoals();

    const [showParentsGoals, setShowParentGoals] = useState(true)

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
            <div className="flex gap-4 p-4">
                <input type="checkbox" className='text-sm' checked={showParentsGoals} onChange={() => setShowParentGoals(prev => !prev)} />
                <Label>Show Parents Goals</Label>
            </div>
            <ul>
                {quarterlyGoals?.map(goal => <GoalCard
                    key={goal.id}
                    goal={enrichGoal(goal, quarterlyGoals!, yearlyGoals!, categories!, identities!)}
                    showParentGoals={showParentsGoals}
                />)}
                <li><Button onClick={newClick}>Add quarterly goal</Button></li>
            </ul>

        </>

    )
}
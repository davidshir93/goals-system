import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useWeeklyGoals } from "@/data/queries";
import { useNavigate } from "react-router-dom";

export default function Week() {
    const { user } = useAuth()

    const { selectedYear, selectedQuarter, selectedWeek } = useGoals();

    const { data: weeklyGoals, isLoading: weeklyGoalsLoading, error: weeklyGoalsErr } = useWeeklyGoals(user?.uid || '', selectedYear, selectedQuarter, selectedWeek);

    const navigate = useNavigate();

    const newClick = () => {
        navigate("new")
    }

    if (weeklyGoalsLoading || weeklyGoalsErr) return "Waittttt"

    return (
        <>
            <ul>
                {weeklyGoals?.map(goal => <li key={goal.id}>{JSON.stringify(goal)}</li>)}
                <li><Button onClick={newClick}>Add weekly goal</Button></li>
            </ul>

        </>

    )
}
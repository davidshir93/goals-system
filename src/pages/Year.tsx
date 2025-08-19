import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useYearlyGoals } from "@/data/queries";
import { useNavigate } from "react-router-dom";

export default function Year() {
    const { user } = useAuth()

    const { selectedYear } = useGoals();

    const { data: yearlyGoals, isLoading: yearlyGoalsLoading, error: yearlyGoalsErr } = useYearlyGoals(user?.uid || '', selectedYear);

    const navigate = useNavigate();

    const newClick = () => {
        navigate("new")
    }

    if (yearlyGoalsLoading || yearlyGoalsErr) return "Waittttt"

    return (
        <>
            <ul>
                {yearlyGoals?.map(goal => <li key={goal.id}>{JSON.stringify(goal)}</li>)}
                <li><Button onClick={newClick}>Add yearly goal</Button></li>
            </ul>

        </>

    )
}
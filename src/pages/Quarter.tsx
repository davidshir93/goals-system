import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { useGoals } from "@/context/GoalsContext"
import { useQuarterlyGoals } from "@/data/queries";
import { useNavigate } from "react-router-dom";

export default function Quarter() {
    const { user } = useAuth()

    const { selectedYear, selectedQuarter } = useGoals();

    const { data: quarterlyGoals, isLoading: quarterlyGoalsLoading, error: quarterlyGoalsErr } = useQuarterlyGoals(user?.uid || '', selectedYear, selectedQuarter);

    const navigate = useNavigate();

    const newClick = () => {
        navigate("new")
    }

    if (quarterlyGoalsLoading || quarterlyGoalsErr) return "Waittttt"

    return (
        <>
            <ul>
                {quarterlyGoals?.map(goal => <li key={goal.id}>{JSON.stringify(goal)}</li>)}
                <li><Button onClick={newClick}>Add quarterly goal</Button></li>
            </ul>

        </>

    )
}
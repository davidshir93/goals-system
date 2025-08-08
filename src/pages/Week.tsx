import { useGoals } from "@/context/GoalsContext"

export default function Week() {
    const { goals } = useGoals();

    const weekGoals = goals.filter(goal => goal.type === 'week');
    return (
        <>
            <ul>
                {weekGoals.map(goal => <li>{JSON.stringify(goal)}</li>)}
            </ul>
        </>

    )
}